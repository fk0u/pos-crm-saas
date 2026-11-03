<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use App\Traits\ResolvesTenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    use ResolvesTenantContext;

    /**
     * Display the staff and team management page.
     */
    public function index(Request $request): Response
    {
        $currentUser = Auth::user();
        $tenantId = $this->resolveTenantId($currentUser, $request);

        $allTenants = [];

        $outlets = Outlet::where('tenant_id', $tenantId)->get(['id', 'name']);

        $staffQuery = User::where('tenant_id', $tenantId)
            ->whereNotIn('role', ['superadmin', 'super_admin'])
            ->whereNotNull('tenant_id')
            ->where('email', 'not like', '%@qlon.id')
            ->with('outlet:id,name');

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
            return redirect()->back()->with('error', 'Konteks toko tidak valid.');
        }

        TenantContext::set($tenantId);

        $tenant = Tenant::find($tenantId);
        if ($tenant && ! $tenant->canAddStaff()) {
            return redirect()->back()->with('error', "Jumlah karyawan sudah mencapai batas maksimal untuk paket ini ({$tenant->max_staff} orang). Silakan hubungi pengelola sistem untuk meningkatkan paket layanan Anda.");
        }

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

        return redirect()->back()->with('success', "Akun karyawan {$staff->name} berhasil ditambahkan.");
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

        if ($staff->isSuperAdmin() || $staff->role === 'superadmin') {
            abort(403, 'Tindakan ditolak: Akun pengelola sistem tidak dapat dikelola dari menu toko.');
        }

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

        return redirect()->back()->with('success', "Data karyawan {$staff->name} berhasil diperbarui.");
    }

    /**
     * Remove a staff user account.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $currentUser = Auth::user();

        if ($currentUser->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Pengelola sistem dalam mode bantuan dilarang menghapus akun karyawan toko.');
        }

        $tenantId = $this->resolveTenantId($currentUser, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Konteks toko tidak valid.');
        }

        TenantContext::set($tenantId);

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($staff->isSuperAdmin() || $staff->role === 'superadmin') {
            abort(403, 'Tindakan ditolak: Akun pengelola sistem tidak dapat dikelola dari menu toko.');
        }

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

        return redirect()->back()->with('success', "Akun karyawan {$name} berhasil dihapus.");
    }
}
