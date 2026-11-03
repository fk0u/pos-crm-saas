<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Crm\Actions\DetermineCustomerTierAction;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Shift;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * High-performance Sales, Financial & CRM Metrics for Owner HQ and APIs.
 */
class SalesMetricsService
{
    public function __construct(
        private readonly DetermineCustomerTierAction $determineTier = new DetermineCustomerTierAction,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function summary(string $tenantId): array
    {
        return Cache::remember("sales_metrics_summary_{$tenantId}", 5, function () use ($tenantId) {
            $todayStart = Carbon::today();

            $todayOrders = Order::where('tenant_id', $tenantId)->where('created_at', '>=', $todayStart);

            $grossSales = (float) (clone $todayOrders)->sum('subtotal');
            $discountTotal = (float) (clone $todayOrders)->sum('discount_amount');
            $taxTotal = (float) (clone $todayOrders)->sum('tax_amount');
            $revenue = (float) (clone $todayOrders)->sum('grand_total');
            $transactions = (int) (clone $todayOrders)->count();

            // Calculate Cost of Goods Sold (HPP) for today
            $orderIds = (clone $todayOrders)->pluck('id');
            $totalCogs = 0.0;
            if ($orderIds->isNotEmpty()) {
                $totalCogs = (float) OrderItem::whereIn('order_id', $orderIds)
                    ->selectRaw('SUM(unit_cost_price * quantity) as total_cogs')
                    ->value('total_cogs') ?? 0.0;
            }

            $grossProfit = max(0.0, $revenue - $totalCogs);
            $profitMargin = $revenue > 0 ? round(($grossProfit / $revenue) * 100, 1) : 0.0;
            $aov = $transactions > 0 ? round($revenue / $transactions, 2) : 0.0;
            $newCustomersCount = (int) Customer::where('tenant_id', $tenantId)->where('created_at', '>=', $todayStart)->count();

            $yesterdayStart = Carbon::yesterday();
            $yesterdayRevenue = (float) Order::where('tenant_id', $tenantId)
                ->whereBetween('created_at', [$yesterdayStart, $todayStart])
                ->sum('grand_total');
            $growthRevenue = $yesterdayRevenue > 0
                ? round((($revenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
                : ($revenue > 0 ? 100.0 : 0.0);

            $allOrders = Order::where('tenant_id', $tenantId);
            $totalOrdersAllTime = (clone $allOrders)->count();
            $totalRevenueAllTime = (float) (clone $allOrders)->where('payment_status', 'paid')->sum('grand_total');
            $totalCustomers = (int) Customer::where('tenant_id', $tenantId)->count();

            return [
                'gross_sales' => $grossSales,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'revenue' => $revenue,
                'today_revenue' => $revenue,
                'total_revenue_all_time' => $totalRevenueAllTime,
                'total_orders_all_time' => $totalOrdersAllTime,
                'total_customers' => $totalCustomers,
                'cogs' => $totalCogs,
                'gross_profit' => $grossProfit,
                'profit_margin' => $profitMargin,
                'transactions' => $transactions,
                'today_orders_count' => $transactions,
                'aov' => $aov,
                'avg_order_value' => $aov,
                'new_customers_count' => $newCustomersCount,
                'growth_revenue' => $growthRevenue,
                'active_outlets' => (int) Outlet::where('tenant_id', $tenantId)->count(),
                'open_shifts' => (int) Shift::where('tenant_id', $tenantId)->where('status', 'open')->count(),
            ];
        });
    }

    /**
     * @return Collection<int, array{outlet_id: string, name: string, transactions: int, revenue: float, aov: float}>
     */
    public function outletBreakdown(string $tenantId): Collection
    {
        $todayStart = Carbon::today();

        return Outlet::where('tenant_id', $tenantId)
            ->withCount(['orders' => fn ($query) => $query->where('created_at', '>=', $todayStart)])
            ->withSum(['orders' => fn ($query) => $query->where('created_at', '>=', $todayStart)], 'grand_total')
            ->orderBy('name')
            ->get()
            ->map(function (Outlet $outlet) {
                $revenue = (float) ($outlet->orders_sum_grand_total ?? 0);
                $count = (int) $outlet->orders_count;

                return [
                    'outlet_id' => $outlet->id,
                    'name' => $outlet->name,
                    'transactions' => $count,
                    'revenue' => $revenue,
                    'aov' => $count > 0 ? round($revenue / $count, 2) : 0.0,
                ];
            });
    }

    /**
     * @return Collection<int, Order>
     */
    public function recentOrders(string $tenantId, int $limit = 8): Collection
    {
        return Order::where('tenant_id', $tenantId)
            ->with(['outlet:id,name', 'customer:id,name,phone', 'cashier:id,name', 'items'])
            ->latest()
            ->take($limit)
            ->get(['id', 'outlet_id', 'customer_id', 'cashier_id', 'invoice_number', 'grand_total', 'payment_method', 'created_at']);
    }

    /**
     * Top selling products.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function topProducts(string $tenantId, int $limit = 5): Collection
    {
        return OrderItem::whereHas('order', fn ($q) => $q->where('tenant_id', $tenantId))
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', 'products.category', DB::raw('SUM(order_items.quantity) as total_qty'), DB::raw('SUM(order_items.subtotal) as total_revenue'))
            ->groupBy('products.id', 'products.name', 'products.category')
            ->orderByDesc('total_qty')
            ->take($limit)
            ->get()
            ->map(fn ($row, $idx) => [
                'id' => $idx + 1,
                'name' => $row->name,
                'category' => $row->category,
                'sold_count' => (int) $row->total_qty,
                'total_qty' => (int) $row->total_qty,
                'total_revenue' => (float) $row->total_revenue,
            ]);
    }

    /**
     * CRM member directory with tier enrichment.
     *
     * @return Collection<int, array<string, mixed>>
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

        return $query->take($limit)->get()->map(fn (Customer $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'phone' => $c->phone,
            'loyalty_points' => (int) $c->loyalty_points,
            'total_spend' => (float) $c->total_spend,
            'visit_count' => (int) $c->visit_count,
            'tier' => $this->determineTier->execute($c),
            'last_visit_at' => $c->last_visit_at?->diffForHumans() ?? 'Belum ada',
        ]);
    }

    /**
     * Recent audit logs for supervisor.
     *
     * @return Collection<int, AuditLog>
     */
    public function recentAuditLogs(string $tenantId, int $limit = 10): Collection
    {
        return AuditLog::where('tenant_id', $tenantId)
            ->with('user:id,name,role')
            ->latest()
            ->take($limit)
            ->get();
    }

    /**
     * Aggregated 12-Month sales trend (Jan - Dec) from database orders.
     *
     * @return array<int, array{month: string, revenue: float, deals: int, raw_revenue: float}>
     */
    public function monthlyRevenueTrend(string $tenantId, int $year = 2026): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];
        $result = [];

        $startOfYear = Carbon::create($year, 1, 1)->startOfDay();
        $endOfYear = Carbon::create($year, 12, 31)->endOfDay();

        $orders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->get(['grand_total', 'created_at']);

        for ($m = 1; $m <= 12; $m++) {
            $monthOrders = $orders->filter(fn ($o) => (int) $o->created_at->format('n') === $m);
            $revenue = (float) $monthOrders->sum('grand_total');
            $result[] = [
                'month' => $months[$m - 1],
                'revenue' => round($revenue / 1000000, 2),
                'deals' => $monthOrders->count(),
                'raw_revenue' => $revenue,
            ];
        }

        return $result;
    }

    /**
     * Order payment status distribution from database.
     *
     * @return array<string, mixed>
     */
    public function orderStatusDistribution(string $tenantId): array
    {
        $orders = Order::where('tenant_id', $tenantId)->get(['payment_status']);
        $total = $orders->count();

        $paidCount = $orders->where('payment_status', 'paid')->count();
        $pendingCount = $orders->where('payment_status', 'pending')->count();
        $refundedCount = $orders->where('payment_status', 'refunded')->count();

        return [
            'total' => $total,
            'paid' => $paidCount,
            'pending' => $pendingCount,
            'refunded' => $refundedCount,
            'paid_pct' => $total > 0 ? round(($paidCount / $total) * 100, 1) : 0.0,
            'pending_pct' => $total > 0 ? round(($pendingCount / $total) * 100, 1) : 0.0,
            'refunded_pct' => $total > 0 ? round(($refundedCount / $total) * 100, 1) : 0.0,
        ];
    }

    /**
     * Real showcase products from database.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function exploreProducts(string $tenantId, int $limit = 4): Collection
    {
        return \App\Models\Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => (float) $p->selling_price,
                'stock' => $p->stock . ' pcs',
                'sold' => '0',
                'location' => $p->category ?? 'General',
                'rating' => '5.0',
                'image' => $p->image_url ?: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
            ]);
    }
}
