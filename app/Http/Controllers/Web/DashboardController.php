<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SalesMetricsService;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly SalesMetricsService $metrics) {}

    /**
     * Owner Central Dashboard. Kasir diarahkan balik ke terminal kasir.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user->role === 'cashier') {
            return redirect()->route('pos.terminal');
        }

        $isSuperAdmin = $user->isSuperAdmin();
        $selectedTenantId = $request->query('tenant_id');

        if ($isSuperAdmin) {
            $delegatedTenantId = session('delegated_tenant_id') ?? $user->tenant_id;
            if (! $delegatedTenantId) {
                return redirect()->route('superadmin.dashboard')->with('error', 'Akses ditolak: Superadmin wajib memiliki Token Delegasi resmi yang aktif dari pemilik usaha untuk mengakses dasbor tenant.');
            }

            $tenant = \App\Models\Tenant::find($delegatedTenantId);
            if (! $tenant) {
                session()->forget(['delegated_tenant_id', 'delegated_token_id']);
                return redirect()->route('superadmin.dashboard')->with('error', 'Tenant delegasi tidak ditemukan.');
            }

            $tenantId = $tenant->id;
            TenantContext::set($tenantId);
        } else {
            $tenant = $user->tenant;
            $tenantId = $user->tenant_id;
            if ($tenantId) {
                TenantContext::set($tenantId);
            }
        }

        $searchQuery = $request->query('q');
        $summary = $this->metrics->summary($tenantId);
        $outlets = $this->metrics->outletBreakdown($tenantId);
        $customers = $this->metrics->customers($tenantId, $searchQuery);
        $recentOrders = $this->metrics->recentOrders($tenantId, 10);
        $topProducts = $this->metrics->topProducts($tenantId, 5);
        $auditLogs = $this->metrics->recentAuditLogs($tenantId, 8);
        $allTenants = [];

        $monthlyData = $this->metrics->monthlyRevenueTrend($tenantId, (int) $request->query('year', 2026));
        $statusDistribution = $this->metrics->orderStatusDistribution($tenantId);
        $exploreProducts = $this->metrics->exploreProducts($tenantId, 4);

        $outletsList = \App\Models\Outlet::where('tenant_id', $tenantId)->withCount(['users', 'orders'])->get();
        $staffList = \App\Models\User::where('tenant_id', $tenantId)->with('outlet:id,name')->get();

        return Inertia::render('Dashboard/Index', [
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $isSuperAdmin,
            'tenantName' => $tenant?->name ?? 'Semua Tenant (SaaS Master)',
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Semua Outlet',
            'summary' => $summary,
            'outlets' => $outlets,
            'customers' => $customers,
            'recentOrders' => $recentOrders,
            'topProducts' => $topProducts,
            'auditLogs' => $auditLogs,
            'search' => (string) ($searchQuery ?? ''),
            'monthlyData' => $monthlyData,
            'statusDistribution' => $statusDistribution,
            'exploreProducts' => $exploreProducts,
            'outletsList' => $outletsList,
            'staffList' => $staffList,
        ]);
    }

    /**
     * JSON payload for the live sales ticker (polled every 10s).
     */
    public function recentSales(): JsonResponse
    {
        $user = Auth::user();

        if (! $user || $user->role === 'cashier') {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $tenantId = $user->tenant_id;
        if ($user->isSuperAdmin()) {
            $tenantId = session('delegated_tenant_id') ?? \App\Models\Tenant::first()?->id;
        }

        if (! $tenantId) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $orders = $this->metrics->recentOrders($tenantId, 10);

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
