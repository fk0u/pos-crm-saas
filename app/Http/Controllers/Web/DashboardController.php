<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SalesMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(private readonly SalesMetricsService $metrics) {}

    /**
     * Owner Central Dashboard. Kasir diarahkan balik ke terminal kasir.
     */
    public function index(): View|RedirectResponse
    {
        $user = Auth::user();

        if ($user->role === 'cashier') {
            return redirect()->route('pos.terminal');
        }

        $tenant = $user->tenant;
        $tenantId = $user->tenant_id;

        $summary = $this->metrics->summary($tenantId);
        $outlets = $this->metrics->outletBreakdown($tenantId);
        $customers = $this->metrics->customers($tenantId, request()->query('q'));

        return view('dashboard.layout', [
            'userName' => $user->name,
            'role' => $user->role,
            'tenantName' => $tenant?->name ?? '—',
            'outletName' => $user->outlet?->name ?? 'Semua Outlet',
            'summary' => $summary,
            'outlets' => $outlets,
            'customers' => $customers,
            'recentOrders' => $this->metrics->recentOrders($tenantId, 10),
            'search' => (string) request()->query('q', ''),
        ]);
    }

    /**
     * JSON payload for the live sales ticker (polled every 10s).
     */
    public function recentSales(): JsonResponse
    {
        $user = Auth::user();

        if ($user->role === 'cashier') {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $orders = $this->metrics->recentOrders($user->tenant_id, 10);

        return response()->json([
            'success' => true,
            'data' => $orders->map(fn ($order) => [
                'invoice_number' => $order->invoice_number,
                'outlet' => $order->outlet?->name,
                'cashier' => $order->cashier?->name,
                'customer' => $order->customer?->name,
                'grand_total' => (float) $order->grand_total,
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at?->toIso8601String(),
            ]),
        ]);
    }
}
