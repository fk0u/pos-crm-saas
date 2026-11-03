<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OnlineOrderController extends Controller
{
    /**
     * Display the public restaurant online ordering menu for a specific tenant ($baseurl/{subdomain}).
     */
    public function menu(Request $request, string $subdomain): Response
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();

        if (! $tenant->is_active) {
            abort(403, 'Restoran / Toko ini sedang sementara tidak menerima pesanan online.');
        }

        $outlets = Outlet::where('tenant_id', $tenant->id)->get(['id', 'name', 'address', 'phone']);
        $selectedOutletId = $request->query('outlet_id') ?? $outlets->first()?->id;

        $products = Product::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category ?? 'Menu Utama',
                'sku' => $p->sku,
                'selling_price' => (float) $p->selling_price,
                'stock' => (int) $p->stock,
                'image_url' => $p->image_url ?: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
            ]);

        // Categories
        $categories = $products->pluck('category')->unique()->values();

        // Active Promos / Vouchers for customers to use
        $activePromos = Promotion::where('tenant_id', $tenant->id)
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->whereRaw('used_count < quota')
            ->get(['code', 'name', 'type', 'value', 'min_order_amount', 'max_discount_amount']);

        return Inertia::render('OnlineOrder/Menu', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'subdomain' => $tenant->subdomain,
                'phone' => $tenant->phone,
                'logo_url' => $tenant->logo_url,
            ],
            'outlets' => $outlets,
            'selectedOutletId' => $selectedOutletId,
            'products' => $products,
            'categories' => $categories,
            'activePromos' => $activePromos,
        ]);
    }

    /**
     * Submit online order from restaurant customer.
     */
    public function placeOrder(Request $request, string $subdomain): JsonResponse
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();

        if (! $tenant->is_active) {
            return response()->json(['success' => false, 'message' => 'Restoran sedang tutup.'], 403);
        }

        $validated = $request->validate([
            'outlet_id' => ['nullable', 'string', 'exists:outlets,id'],
            'order_type' => ['required', 'string', 'in:dine_in,takeaway,delivery'],
            'table_number' => ['nullable', 'string', 'max:50'],
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'payment_method' => ['required', 'string', 'in:cash_at_counter,qris'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'string', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ]);

        $outletId = $validated['outlet_id'] ?? Outlet::where('tenant_id', $tenant->id)->first()?->id;

        return DB::transaction(function () use ($tenant, $outletId, $validated, $request) {
            $subtotal = 0.0;
            $itemsToCreate = [];

            // 1. Validate each product and calculate subtotal
            foreach ($validated['items'] as $itemData) {
                $product = Product::where('tenant_id', $tenant->id)->lockForUpdate()->findOrFail($itemData['product_id']);

                if ($product->stock < $itemData['quantity']) {
                    throw new \RuntimeException("Stok {$product->name} tidak mencukupi (Tersisa: {$product->stock}).");
                }

                $itemSubtotal = (float) $product->selling_price * (int) $itemData['quantity'];
                $subtotal += $itemSubtotal;

                // Decrement stock
                $product->decrement('stock', $itemData['quantity']);

                $itemsToCreate[] = [
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'unit_cost_price' => $product->cost_price,
                    'unit_selling_price' => $product->selling_price,
                    'subtotal' => $itemSubtotal,
                ];
            }

            // 2. Coupon Discount Calculation
            $discountAmount = 0.0;
            $couponCode = null;
            if (! empty($validated['coupon_code'])) {
                $code = strtoupper(trim($validated['coupon_code']));
                $promo = Promotion::where('tenant_id', $tenant->id)->where('code', $code)->first();
                if ($promo) {
                    $discountAmount = $promo->calculateDiscount($subtotal);
                    if ($discountAmount > 0) {
                        $couponCode = $code;
                        $promo->increment('used_count');
                    }
                }
            }

            // 3. Tax Calculation (11% PPN)
            $taxableAmount = max(0.0, $subtotal - $discountAmount);
            $taxAmount = round($taxableAmount * 0.11, 2);
            $grandTotal = $taxableAmount + $taxAmount;

            // 4. Generate Unique Invoice Number
            $datePart = now()->format('Ymd');
            $randomPart = strtoupper(Str::random(5));
            $invoiceNumber = "ORD-{$datePart}-{$randomPart}";

            // 5. Connect or Create Customer CRM record
            $customer = Customer::firstOrCreate(
                ['tenant_id' => $tenant->id, 'phone' => $validated['customer_phone']],
                [
                    'name' => $validated['customer_name'],
                    'loyalty_points' => 0,
                    'total_spend' => 0,
                    'visit_count' => 0,
                ]
            );

            $earnedPoints = (int) floor($grandTotal / 10000); // 1 point per 10k
            $customer->increment('total_spend', $grandTotal);
            $customer->increment('visit_count', 1);
            $customer->increment('loyalty_points', $earnedPoints);
            $customer->update(['last_visit_at' => now(), 'name' => $validated['customer_name']]);

            // 6. Create Order record
            $paymentStatus = $validated['payment_method'] === 'qris' ? 'paid' : 'pending';

            $defaultStaffId = $tenant->users()->whereIn('role', ['owner', 'manager', 'cashier'])->first()?->id
                ?? $tenant->users()->first()?->id;

            $order = Order::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'outlet_id' => $outletId,
                'cashier_id' => $defaultStaffId,
                'customer_id' => $customer->id,
                'invoice_number' => $invoiceNumber,
                'order_type' => $validated['order_type'],
                'table_number' => $validated['table_number'] ?? null,
                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'order_status' => 'pending', // Pending confirmation by cashier
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'grand_total' => $grandTotal,
                'points_earned' => $earnedPoints,
                'points_redeemed' => 0,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'coupon_code' => $couponCode,
                'notes' => $validated['notes'] ?? null,
            ]);

            // 7. Save Order Items
            foreach ($itemsToCreate as $it) {
                $it['order_id'] = $order->id;
                OrderItem::create($it);
            }

            // 8. Log Audit
            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'user_id' => null,
                'action' => 'online_order.placed',
                'details' => json_encode([
                    'invoice' => $invoiceNumber,
                    'customer' => $validated['customer_name'],
                    'grand_total' => $grandTotal,
                    'type' => $validated['order_type'],
                    'table' => $validated['table_number'] ?? '-',
                ]),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dikirim ke kasir!',
                'invoice_number' => $invoiceNumber,
                'order_id' => $order->id,
                'redirect_url' => "/order-status/{$invoiceNumber}",
            ]);
        });
    }

    /**
     * Display live order tracking status for customer.
     */
    public function orderStatus(string $invoice): Response
    {
        $order = Order::where('invoice_number', $invoice)
            ->with(['items.product', 'outlet', 'tenant'])
            ->firstOrFail();

        return Inertia::render('OnlineOrder/Status', [
            'order' => [
                'id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'order_type' => $order->order_type,
                'table_number' => $order->table_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'order_status' => $order->order_status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'tax_amount' => (float) $order->tax_amount,
                'grand_total' => (float) $order->grand_total,
                'notes' => $order->notes,
                'created_at' => $order->created_at?->format('d M Y, H:i'),
                'outlet_name' => $order->outlet?->name ?? 'Outlet Utama',
                'tenant_name' => $order->tenant?->name ?? 'Restoran',
                'tenant_subdomain' => $order->tenant?->subdomain,
                'items' => $order->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->product?->name ?? 'Produk',
                    'quantity' => (int) $it->quantity,
                    'price' => (float) $it->unit_selling_price,
                    'subtotal' => (float) $it->subtotal,
                ]),
            ],
        ]);
    }

    /**
     * Update order status by cashier/kitchen from POS terminal.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', 'string', 'in:pending,accepted,preparing,ready,completed,cancelled'],
        ]);

        $order = Order::findOrFail($id);
        $order->update(['order_status' => $validated['order_status']]);

        if ($validated['order_status'] === 'completed' && $order->payment_status === 'pending') {
            $order->update(['payment_status' => 'paid']);
        }

        $statusLabels = [
            'accepted' => 'diterima oleh kasir',
            'preparing' => 'sedang diproses di dapur',
            'ready' => 'siap disajikan/diambil',
            'completed' => 'telah selesai',
            'cancelled' => 'dibatalkan',
        ];

        $label = $statusLabels[$validated['order_status']] ?? $validated['order_status'];

        return redirect()->back()->with('success', "Pesanan #{$order->invoice_number} berhasil {$label}.");
    }
}