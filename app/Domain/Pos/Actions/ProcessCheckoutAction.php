<?php

declare(strict_types=1);

namespace App\Domain\Pos\Actions;

use App\Domain\Audit\Actions\RecordAuditLogAction;
use App\Domain\Crm\Actions\DetermineCustomerTierAction;
use App\Domain\Pos\DTOs\CheckoutData;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProcessCheckoutAction
{
    public function __construct(
        private readonly RecordAuditLogAction $recordAuditLog = new RecordAuditLogAction,
        private readonly DetermineCustomerTierAction $determineTier = new DetermineCustomerTierAction,
    ) {}

    /**
     * Resolve and validate outlet.
     */
    public function resolveOutlet(User $user, ?string $outletId): Outlet
    {
        $tenantId = $user->tenant_id ?? session('delegated_tenant_id') ?? \App\Models\Tenant::first()?->id;
        $targetOutletId = $outletId ?: $user->outlet_id;

        if (! $targetOutletId) {
            $defaultOutlet = Outlet::where('tenant_id', $tenantId)->first();
            if ($defaultOutlet) {
                return $defaultOutlet;
            }

            throw ValidationException::withMessages([
                'outlet_id' => 'Outlet wajib diisi bila user tidak punya outlet default.',
            ]);
        }

        /** @var Outlet|null $outlet */
        $outlet = Outlet::find($targetOutletId);

        if (! $outlet || (! $user->isSuperAdmin() && $outlet->tenant_id !== $tenantId)) {
            throw ValidationException::withMessages([
                'outlet_id' => 'Outlet tidak valid atau bukan milik outlet Anda.',
            ]);
        }

        if ($user->role === 'cashier' && $user->outlet_id && $user->outlet_id !== $outlet->id) {
            throw ValidationException::withMessages([
                'outlet_id' => 'Kasir hanya dapat melakukan transaksi di outlet sendiri.',
            ]);
        }

        return $outlet;
    }

    /**
     * Execute transactional checkout.
     *
     * @return array<string, mixed>
     */
    public function execute(User $user, CheckoutData $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $outlet = $this->resolveOutlet($user, $data->outletId);
            $tenantId = $user->tenant_id ?? session('delegated_tenant_id') ?? $outlet->tenant_id;

            // 1. Resolve active shift
            $shift = null;
            if ($data->shiftId) {
                $shift = Shift::where('tenant_id', $tenantId)->where('id', $data->shiftId)->where('status', 'open')->first();
            }
            if (! $shift && $user->isCashier()) {
                $shift = $user->activeShift();
            }

            // 2. Resolve or register CRM Customer
            $customer = null;
            if (! empty($data->customerPhone)) {
                $customer = Customer::firstOrCreate(
                    ['tenant_id' => $tenantId, 'phone' => $data->customerPhone],
                    ['name' => $data->customerName ?? 'Pelanggan']
                );
            }

            $pointsRedeemed = max(0, $data->pointsRedeemed);

            // Loyalty guard: cannot redeem more points than customer holds
            if ($customer && $pointsRedeemed > 0 && $pointsRedeemed > (int) $customer->loyalty_points) {
                throw ValidationException::withMessages([
                    'points_redeemed' => 'Saldo poin tidak mencukupi.',
                ]);
            }

            // 3. Compute items, check and lock stock
            $subtotal = 0.0;
            $orderItemsData = [];

            foreach ($data->items as $item) {
                /** @var Product $product */
                $product = Product::where('id', $item->productId)->lockForUpdate()->firstOrFail();

                if ($item->quantity > $product->stock) {
                    throw ValidationException::withMessages([
                        'items' => "Stok produk {$product->name} tidak mencukupi",
                    ]);
                }

                $itemSubtotal = (float) $product->selling_price * $item->quantity;
                $subtotal += $itemSubtotal;

                $orderItemsData[] = [
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'unit_cost_price' => $product->cost_price,
                    'unit_selling_price' => $product->selling_price,
                    'subtotal' => $itemSubtotal,
                ];

                $product->decrement('stock', $item->quantity);
            }

            $discount = max(0.0, $data->discountAmount);
            $tax = max(0.0, $data->taxAmount);
            $pointsDiscount = $pointsRedeemed * 100.0; // 1 pt = Rp 100
            $grandTotal = max(0.0, $subtotal - $discount + $tax - $pointsDiscount);

            // 4. Calculate earned points (1 pt per Rp 10,000)
            $pointsEarned = (int) floor($grandTotal / 10000.0);

            // 5. Generate unique invoice
            $invoiceNumber = 'INV/'.date('Ymd').'/'.strtoupper(Str::random(6));

            $changeDue = 0.0;
            if ($data->paymentMethod === 'cash' && $data->cashTendered !== null) {
                $changeDue = max(0.0, $data->cashTendered - $grandTotal);
            }

            $order = Order::create([
                'tenant_id' => $tenantId,
                'outlet_id' => $outlet->id,
                'shift_id' => $shift?->id,
                'cashier_id' => $user->id,
                'customer_id' => $customer?->id,
                'invoice_number' => $invoiceNumber,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'grand_total' => $grandTotal,
                'cash_tendered' => $data->cashTendered,
                'change_amount' => $changeDue,
                'points_earned' => $pointsEarned,
                'points_redeemed' => $pointsRedeemed,
                'payment_method' => $data->paymentMethod,
                'payment_details' => $data->paymentDetails,
                'payment_status' => 'paid',
                'notes' => $data->notes,
            ]);

            foreach ($orderItemsData as &$itemRow) {
                $itemRow['order_id'] = $order->id;
            }
            OrderItem::insert($orderItemsData);

            // 6. Update Shift counters if shift is active
            if ($shift) {
                if ($data->paymentMethod === 'cash') {
                    $shift->increment('cash_sales_total', $grandTotal);
                } else {
                    $shift->increment('non_cash_sales_total', $grandTotal);
                }

                $expectedEnding = (float) $shift->starting_cash
                    + (float) $shift->cash_sales_total
                    + (float) $shift->cash_in_total
                    - (float) $shift->cash_out_total;

                $shift->update(['expected_ending_cash' => $expectedEnding]);
            }

            // 7. Update CRM Customer stats
            if ($customer) {
                $customer->loyalty_points = max(0, $customer->loyalty_points - $pointsRedeemed) + $pointsEarned;
                $customer->total_spend += $grandTotal;
                $customer->visit_count += 1;
                $customer->last_visit_at = now();
                $customer->save();
            }

            // 8. Audit log for significant manual discount
            if ($discount > 0) {
                $this->recordAuditLog->execute(
                    tenantId: $tenantId,
                    userId: $user->id,
                    action: 'discount_applied',
                    details: [
                        'order_id' => $order->id,
                        'invoice_number' => $invoiceNumber,
                        'discount_amount' => $discount,
                        'subtotal' => $subtotal,
                    ],
                );
            }

            // 9. Invalidate event performance caches for tenant
            Cache::forget("sales_metrics_summary_{$tenantId}");
            Cache::forget("pos_products_{$tenantId}_all");

            return [
                'order_id' => $order->id,
                'invoice_number' => $order->invoice_number,
                'outlet_id' => $outlet->id,
                'outlet_name' => $outlet->name,
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'tax_amount' => (float) $order->tax_amount,
                'grand_total' => (float) $order->grand_total,
                'cash_tendered' => $data->cashTendered,
                'change_due' => (float) $changeDue,
                'points_earned' => $pointsEarned,
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at?->toIso8601String(),
                'customer' => $customer ? [
                    'phone' => $customer->phone,
                    'name' => $customer->name,
                    'loyalty_points' => (int) $customer->loyalty_points,
                    'tier' => $this->determineTier->execute($customer),
                ] : null,
            ];
        });
    }
}
