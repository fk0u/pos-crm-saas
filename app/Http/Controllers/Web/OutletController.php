<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OutletController extends Controller
{
    private function resolveTenantId(User $user, Request $request): ?string
    {
        if ($user->isSuperAdmin()) {
            return $request->query('tenant_id') ?? session('delegated_tenant_id') ?? Tenant::first()?->id;
        }

        return $user->tenant_id ?? TenantContext::current();
    }

    /**
     * Display the outlets management page for business owners.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $allTenants = $user->isSuperAdmin()
            ? Tenant::select(['id', 'name', 'subdomain'])->get()
            : [];

        $outlets = Outlet::where('tenant_id', $tenantId)
            ->withCount(['users', 'orders'])
            ->withSum(['orders' => fn ($q) => $q->where('payment_status', 'paid')], 'grand_total')
            ->orderBy('name')
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'name' => $o->name,
                'address' => $o->address ?? 'Belum ada alamat',
                'phone' => $o->phone ?? '-',
                'users_count' => (int) $o->users_count,
                'orders_count' => (int) $o->orders_count,
                'revenue_total' => (float) ($o->orders_sum_grand_total ?? 0.0),
                'created_at' => $o->created_at?->format('d M Y'),
            ]);

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Outlets/Index', [
            'outlets' => $outlets,
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Semua Cabang',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Store a new outlet branch for the business.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $outlet = Outlet::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'outlet.created',
            'details' => json_encode(['outlet_name' => $outlet->name]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Cabang outlet {$outlet->name} berhasil ditambahkan.");
    }

    /**
     * Update an existing outlet branch.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $outlet = Outlet::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $outlet->update($validated);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'outlet.updated',
            'details' => json_encode(['outlet_name' => $outlet->name]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Data cabang {$outlet->name} berhasil diperbarui.");
    }

    /**
     * Remove an outlet branch.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $outlet = Outlet::where('tenant_id', $tenantId)->findOrFail($id);

        if ($outlet->orders()->exists()) {
            return redirect()->back()->with('error', "Cabang {$outlet->name} tidak dapat dihapus karena sudah memiliki riwayat transaksi.");
        }

        $name = $outlet->name;
        $outlet->delete();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'outlet.deleted',
            'details' => json_encode(['outlet_name' => $name]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Cabang outlet {$name} berhasil dihapus.");
    }
}
