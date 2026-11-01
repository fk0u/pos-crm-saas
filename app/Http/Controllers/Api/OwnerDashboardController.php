<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerDashboardController extends Controller
{
    /**
     * Get live sales metrics for business owner.
     */
    public function getLiveMetrics(Request $request): JsonResponse
    {
        $today = now()->startOfDay();

        $todayOrders = Order::where('created_at', '>=', $today);

        $todayRevenue = (float) $todayOrders->sum('grand_total');
        $todayTransactions = (int) $todayOrders->count();
        $averageTicketSize = $todayTransactions > 0 ? round($todayRevenue / $todayTransactions, 2) : 0;

        // Outlet breakdown
        $outletMetrics = Outlet::withCount(['orders' => function ($query) use ($today) {
            $query->where('created_at', '>=', $today);
        }])
        ->withSum(['orders' => function ($query) use ($today) {
            $query->where('created_at', '>=', $today);
        }], 'grand_total')
        ->get()
        ->map(function ($outlet) {
            return [
                'outlet_id' => $outlet->id,
                'name' => $outlet->name,
                'transactions' => $outlet->orders_count,
                'revenue' => (float) ($outlet->orders_sum_grand_total ?? 0),
            ];
        });

        // Recent 5 transactions
        $recentOrders = Order::with(['outlet:id,name', 'customer:id,name,phone'])
            ->latest()
            ->take(5)
            ->get(['id', 'outlet_id', 'customer_id', 'invoice_number', 'grand_total', 'payment_method', 'created_at']);

        return response()->json([
            'success' => true,
            'data' => [
                'today_revenue' => $todayRevenue,
                'today_transactions' => $todayTransactions,
                'average_ticket_size' => $averageTicketSize,
                'outlets' => $outletMetrics,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }
}
