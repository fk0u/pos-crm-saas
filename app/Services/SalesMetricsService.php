<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Sales metrics shared by the Owner web dashboard and the live-metrics API.
 * Every query filters tenant_id explicitly, so the service stays correct in
 * console contexts (jobs, scheduled aggregations) too.
 */
class SalesMetricsService
{
    /**
     * @return array{revenue: float, transactions: int, aov: float, active_outlets: int}
     */
    public function summary(string $tenantId): array
    {
        $todayStart = Carbon::today();

        $todayOrders = Order::where('tenant_id', $tenantId)->where('created_at', '>=', $todayStart);

        $revenue = (float) $todayOrders->sum('grand_total');
        $transactions = (int) $todayOrders->count();

        return [
            'revenue' => $revenue,
            'transactions' => $transactions,
            'aov' => $transactions > 0 ? round($revenue / $transactions, 2) : 0.0,
            'active_outlets' => (int) Outlet::where('tenant_id', $tenantId)->count(),
        ];
    }

    /**
     * @return Collection<int, array{outlet_id: string, name: string, transactions: int, revenue: float}>
     */
    public function outletBreakdown(string $tenantId): Collection
    {
        $todayStart = Carbon::today();

        return Outlet::where('tenant_id', $tenantId)
            ->withCount(['orders' => fn ($query) => $query->where('created_at', '>=', $todayStart)])
            ->withSum(['orders' => fn ($query) => $query->where('created_at', '>=', $todayStart)], 'grand_total')
            ->orderBy('name')
            ->get()
            ->map(fn (Outlet $outlet) => [
                'outlet_id' => $outlet->id,
                'name' => $outlet->name,
                'transactions' => $outlet->orders_count,
                'revenue' => (float) ($outlet->orders_sum_grand_total ?? 0),
            ]);
    }

    /**
     * @return Collection<int, Order>
     */
    public function recentOrders(string $tenantId, int $limit = 5): Collection
    {
        return Order::where('tenant_id', $tenantId)
            ->with(['outlet:id,name', 'customer:id,name,phone', 'cashier:id,name'])
            ->latest()
            ->take($limit)
            ->get(['id', 'outlet_id', 'customer_id', 'cashier_id', 'invoice_number', 'grand_total', 'payment_method', 'created_at']);
    }

    /**
     * CRM member directory with search by name or WhatsApp number.
     *
     * @return Collection<int, Customer>
     */
    public function customers(string $tenantId, ?string $search = null, int $limit = 50): Collection
    {
        $query = Customer::where('tenant_id', $tenantId)->orderByDesc('total_spend');

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->whereLike('name', "%{$search}%")
                    ->orWhereLike('phone', "%{$search}%");
            });
        }

        return $query->take($limit)->get();
    }
}
