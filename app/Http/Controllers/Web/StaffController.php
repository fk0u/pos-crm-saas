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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    private function resolveTenantId(User $user, Request $request): ?string
    {
        if ($user->isSuperAdmin()) {
            return $request->query('tenant_id') ?? session('delegated_tenant_id') ?? Tenant::first()?->id;
        }

        return $user->tenant_id ?? TenantContext::current();
    }

    /**
     * Display the staff and team management page.
     */
    public function index(Request $request): Response
    {
        $currentUser = Auth::user();
        $tenantId = $this->resolveTenantId($currentUser, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $allTenants = $currentUser->isSuperAdmin()
            ? Tenant::select(['id', 'name', 'subdomain'])->get()
            : [];

        $outlets = Outlet::where('tenant_id', $tenantId)->get(['id', 'name']);

        $staffQuery = User::where('tenant_id', $tenantId)->with('outlet:id,name');

        if ($outletFilter = $request->query('outlet_id')) {
            if ($outletFilter !== 'all') {
                $staffQuery->where('outlet_id', $outletFilter);
            }
        }

        if ($roleFilter = $request->query('role')) {
            if ($roleFilter !== 'all') {
                $staffQuery->where('role', $roleFilter);
            }
        }

        $staffMembers = $staffQuery->orderBy('role')->orderBy('name')->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->role,
            'outlet_id' => $u->outlet_id,
            'outlet_name' => $u->outlet?->name ?? 'Semua Outlet (HQ)',
            'created_at' => $u->created_at?->format('d M Y'),
        ]);

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Staff/Index', [
            'staffMembers' => $staffMembers,
            'outlets' => $outlets,
            'userName' => $currentUser->name,
            'role' => $currentUser->role,
            'isSuperAdmin' => $currentUser->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $currentUser->outlet?->name ?? 'Semua Outlet',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Store a new staff / cashier user for the business.
     */
    public function store(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $this->resolveTenantId($currentUser, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', 'in:manager,cashier,kitchen,staff,developer'],
            'outlet_id' => ['nullable', 'string', 'exists:outlets,id'],
        ]);

        $staff = User::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'outlet_id' => $validated['outlet_id'] ?? $currentUser->outlet_id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $currentUser->id,
            'action' => 'staff.created',
            'details' => json_encode(['staff_name' => $staff->name, 'role' => $staff->role]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Akun staf {$staff->name} ({$staff->role}) berhasil didaftarkan.");
    }

    /**
     * Update an existing staff member.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $this->resolveTenantId($currentUser, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'in:manager,cashier,kitchen,staff,developer'],
            'outlet_id' => ['nullable', 'string', 'exists:outlets,id'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $staff->name = $validated['name'];
        $staff->role = $validated['role'];
        $staff->outlet_id = $validated['outlet_id'] ?? null;

        if (! empty($validated['password'])) {
            $staff->password = Hash::make($validated['password']);
        }

        $staff->save();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $currentUser->id,
            'action' => 'staff.updated',
            'details' => json_encode(['staff_name' => $staff->name, 'role' => $staff->role]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Data staf {$staff->name} berhasil diperbarui.");
    }

    /**
     * Remove a staff user account.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $this->resolveTenantId($currentUser, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($staff->id === $currentUser->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($staff->role === 'owner') {
            return redirect()->back()->with('error', 'Akun Pemilik Usaha (Owner) tidak dapat dihapus.');
        }

        $name = $staff->name;
        $staff->delete();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $currentUser->id,
            'action' => 'staff.deleted',
            'details' => json_encode(['staff_name' => $name]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Akun staf {$name} berhasil dihapus.");
    }
}
