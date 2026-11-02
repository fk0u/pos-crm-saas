<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SalesMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OwnerDashboardController extends Controller
{
    public function __construct(
        private readonly SalesMetricsService $metricsService = new SalesMetricsService,
    ) {}

    /**
     * Get live sales metrics for business owner.
     */
    public function getLiveMetrics(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isCashier()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses metrik bisnis hanya untuk owner dan manager.',
            ], 403);
        }

        $tenantId = $user->tenant_id;
        $summary = $this->metricsService->summary($tenantId);
        $outletMetrics = $this->metricsService->outletBreakdown($tenantId);
        $recentOrders = $this->metricsService->recentOrders($tenantId, 5);
        $topProducts = $this->metricsService->topProducts($tenantId, 5);

        return response()->json([
            'success' => true,
            'data' => [
                'today_revenue' => $summary['revenue'],
                'today_transactions' => $summary['transactions'],
                'average_ticket_size' => $summary['aov'],
                'gross_profit' => $summary['gross_profit'],
                'profit_margin' => $summary['profit_margin'],
                'open_shifts' => $summary['open_shifts'],
                'outlets' => $outletMetrics,
                'recent_orders' => $recentOrders,
                'top_products' => $topProducts,
            ],
        ]);
    }
}
