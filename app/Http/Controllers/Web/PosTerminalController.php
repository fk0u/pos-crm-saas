<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosTerminalController extends Controller
{
    /**
     * Render the POS terminal (cashier) page via Inertia.
     */
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if ($user->isSuperAdmin()) {
            $delegatedTenantId = session('delegated_tenant_id');
            if (! $delegatedTenantId) {
                return redirect()->route('superadmin.dashboard')->with('error', 'Akses ditolak: Superadmin wajib memiliki Token Delegasi resmi yang aktif dari pemilik usaha untuk membuka terminal kasir.');
            }
            $tenantId = (string) $delegatedTenantId;
            TenantContext::set($tenantId);
        } else {
            $tenantId = $user->tenant_id ?? TenantContext::current();
            if ($tenantId) {
                TenantContext::set($tenantId);
            }
        }

        /** @var Outlet|null $outlet */
        $outlet = $user->outlet ?? Outlet::where('tenant_id', $tenantId)->first();

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $categories = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->values();

        $customers = Customer::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'points' => (int) $c->loyalty_points,
                'segment' => $c->visit_count > 10 ? 'loyal' : ($c->visit_count > 3 ? 'regular' : 'new'),
            ]);

        $activeShift = $user->activeShift();
        $outlets = $user->canManage()
            ? Outlet::where('tenant_id', $tenantId)->get(['id', 'name', 'address'])
            : ($outlet ? collect([$outlet]) : collect());

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;
        $allTenants = [];

        // Incoming online & table orders for restaurant integration
        $pendingOnlineOrders = \App\Models\Order::where('tenant_id', $tenantId)
            ->whereIn('order_type', ['dine_in', 'takeaway', 'delivery'])
            ->whereIn('order_status', ['pending', 'accepted', 'preparing', 'ready'])
            ->with(['items.product', 'customer'])
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'invoice_number' => $o->invoice_number,
                'order_type' => $o->order_type,
                'table_number' => $o->table_number,
                'customer_name' => $o->customer_name,
                'customer_phone' => $o->customer_phone,
                'order_status' => $o->order_status,
                'payment_method' => $o->payment_method,
                'payment_status' => $o->payment_status,
                'grand_total' => (float) $o->grand_total,
                'notes' => $o->notes,
                'created_at' => $o->created_at?->format('H:i'),
                'items' => $o->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->product?->name ?? 'Produk',
                    'quantity' => (int) $it->quantity,
                    'price' => (float) $it->unit_selling_price,
                ]),
            ]);

        $publicMenuUrl = $currentTenant ? url("/{$currentTenant->subdomain}") : null;

        return Inertia::render('Pos/Terminal', [
            'cashierName' => $user->name,
            'userRole' => $user->role,
            'tenantName' => $currentTenant?->name ?? ($user->tenant?->name ?? 'QLon Store'),
            'tenantId' => $tenantId,
            'tenantSubdomain' => $currentTenant?->subdomain,
            'publicMenuUrl' => $publicMenuUrl,
            'allTenants' => $allTenants,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'outletId' => $outlet?->id,
            'outletName' => $outlet?->name ?? 'Central Outlet',
            'outlets' => $outlets,
            'initialProducts' => $products,
            'initialCategories' => $categories,
            'initialCustomers' => $customers,
            'pendingOnlineOrders' => $pendingOnlineOrders,
            'activeShift' => $activeShift ? [
                'id' => $activeShift->id,
                'opened_at' => $activeShift->opened_at->toIso8601String(),
                'starting_cash' => (float) $activeShift->starting_cash,
                'cash_sales_total' => (float) $activeShift->cash_sales_total,
                'non_cash_sales_total' => (float) $activeShift->non_cash_sales_total,
                'cash_in_total' => (float) $activeShift->cash_in_total,
                'cash_out_total' => (float) $activeShift->cash_out_total,
                'expected_ending_cash' => (float) $activeShift->expected_ending_cash,
            ] : null,
        ]);
    }
}
