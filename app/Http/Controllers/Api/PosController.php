<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    /**
     * Get active products for the POS terminal.
     */
    public function getProducts(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('barcode', 'ilike', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('name')->get(),
        ]);
    }

    /**
     * Process checkout transaction.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'outlet_id' => 'required|uuid',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'customer_phone' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'points_redeemed' => 'nullable|integer|min:0',
            'payment_method' => 'required|string|in:cash,qris,bank_transfer',
            'cash_tendered' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = $request->user();
            $tenantId = $user->tenant_id;

            // 1. Resolve or register CRM Customer
            $customer = null;
            if (!empty($validated['customer_phone'])) {
                $customer = Customer::firstOrCreate(
                    ['tenant_id' => $tenantId, 'phone' => $validated['customer_phone']],
                    ['name' => $validated['customer_name'] ?? 'Pelanggan']
                );
            }

            // 2. Compute items and totals
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $itemSubtotal = $product->selling_price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_cost_price' => $product->cost_price,
                    'unit_selling_price' => $product->selling_price,
                    'subtotal' => $itemSubtotal,
                ];

                // Deduct stock if tracked
                if ($product->stock >= $item['quantity']) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            $discount = $validated['discount_amount'] ?? 0;
            $tax = $validated['tax_amount'] ?? 0;
            $pointsRedeemed = $validated['points_redeemed'] ?? 0;
            $grandTotal = max(0, $subtotal - $discount + $tax - ($pointsRedeemed * 100)); // 1 pt = Rp 100

            // 3. Loyalty point calculation (1 pt per Rp 10,000)
            $pointsEarned = (int) floor($grandTotal / 10000);

            // 4. Generate unique invoice number
            $invoiceNumber = 'INV/' . date('Ymd') . '/' . strtoupper(Str::random(6));

            $order = Order::create([
                'tenant_id' => $tenantId,
                'outlet_id' => $validated['outlet_id'],
                'cashier_id' => $user->id,
                'customer_id' => $customer?->id,
                'invoice_number' => $invoiceNumber,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'grand_total' => $grandTotal,
                'points_earned' => $pointsEarned,
                'points_redeemed' => $pointsRedeemed,
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'paid',
            ]);

            foreach ($orderItemsData as &$itemData) {
                $itemData['order_id'] = $order->id;
            }
            OrderItem::insert($orderItemsData);

            // 5. Update CRM stats
            if ($customer) {
                $customer->loyalty_points = max(0, $customer->loyalty_points - $pointsRedeemed) + $pointsEarned;
                $customer->total_spend += $grandTotal;
                $customer->visit_count += 1;
                $customer->last_visit_at = now();
                $customer->save();
            }

            $changeDue = 0;
            if ($validated['payment_method'] === 'cash' && isset($validated['cash_tendered'])) {
                $changeDue = max(0, $validated['cash_tendered'] - $grandTotal);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diproses',
                'data' => [
                    'order_id' => $order->id,
                    'invoice_number' => $order->invoice_number,
                    'grand_total' => (float) $order->grand_total,
                    'change_due' => (float) $changeDue,
                    'points_earned' => $pointsEarned,
                    'customer' => $customer ? [
                        'phone' => $customer->phone,
                        'name' => $customer->name,
                        'loyalty_points' => $customer->loyalty_points,
                    ] : null,
                ],
            ], 201);
        });
    }
}
