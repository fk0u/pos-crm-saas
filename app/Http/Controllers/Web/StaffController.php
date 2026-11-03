<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    /**
     * Store a new staff / cashier user for the business.
     */
    public function store(Request $request): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $currentUser->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', 'in:cashier,manager,developer'],
            'outlet_id' => ['nullable', 'uuid', 'exists:outlets,id'],
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
        ]);

        return redirect()->back()->with('success', "Akun staf {$staff->name} ({$staff->role}) berhasil didaftarkan.");
    }

    /**
     * Update an existing staff member.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $currentUser->tenant_id ?? TenantContext::current();

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string', 'in:cashier,manager,developer'],
            'outlet_id' => ['nullable', 'uuid', 'exists:outlets,id'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $data = [
            'name' => $validated['name'],
            'role' => $validated['role'],
            'outlet_id' => $validated['outlet_id'] ?? $staff->outlet_id,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $staff->update($data);

        return redirect()->back()->with('success', "Data staf {$staff->name} berhasil diperbarui.");
    }

    /**
     * Delete a staff user.
     */
    public function destroy(string $id): RedirectResponse
    {
        $currentUser = Auth::user();
        $tenantId = $currentUser->tenant_id ?? TenantContext::current();

        if ($id === $currentUser->id) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $staff = User::where('tenant_id', $tenantId)->findOrFail($id);

        if ($staff->role === 'owner') {
            return redirect()->back()->with('error', 'Akun pemilik (Owner) tidak dapat dihapus.');
        }

        $name = $staff->name;
        $staff->delete();

        return redirect()->back()->with('success', "Akun staf {$name} berhasil dihapus.");
    }
}
