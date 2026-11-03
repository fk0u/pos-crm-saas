<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\SalesMetricsService;
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
            $delegatedTenantId = session('delegated_tenant_id') ?? $selectedTenantId;
            if ($delegatedTenantId) {
                $tenant = \App\Models\Tenant::find($delegatedTenantId);
                $tenantId = $tenant?->id;
            } else {
                $tenant = \App\Models\Tenant::first();
                $tenantId = $tenant?->id;
            }

            if (! $tenantId) {
                return redirect()->route('superadmin.dashboard');
            }
        } else {
            $tenant = $user->tenant;
            $tenantId = $user->tenant_id;
        }

        $searchQuery = $request->query('q');
        $summary = $this->metrics->summary($tenantId);
        $outlets = $this->metrics->outletBreakdown($tenantId);
        $customers = $this->metrics->customers($tenantId, $searchQuery);
        $recentOrders = $this->metrics->recentOrders($tenantId, 10);
        $topProducts = $this->metrics->topProducts($tenantId, 5);
        $auditLogs = $this->metrics->recentAuditLogs($tenantId, 8);
        $allTenants = $isSuperAdmin ? \App\Models\Tenant::select(['id', 'name', 'subdomain'])->get() : [];

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
