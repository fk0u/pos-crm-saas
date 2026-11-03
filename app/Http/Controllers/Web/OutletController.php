<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Outlet;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OutletController extends Controller
{
    /**
     * Store a new outlet branch for the business.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

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
        ]);

        return redirect()->back()->with('success', "Cabang outlet {$outlet->name} berhasil ditambahkan.");
    }

    /**
     * Update an existing outlet branch.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $outlet = Outlet::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $outlet->update($validated);

        return redirect()->back()->with('success', "Data cabang {$outlet->name} berhasil diperbarui.");
    }

    /**
     * Delete an outlet branch.
     */
    public function destroy(string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $outlet = Outlet::where('tenant_id', $tenantId)->withCount(['orders', 'users'])->findOrFail($id);

        if ($outlet->orders_count > 0) {
            return redirect()->back()->with('error', "Cabang {$outlet->name} tidak dapat dihapus karena memiliki riwayat {$outlet->orders_count} transaksi.");
        }

        $outletName = $outlet->name;
        $outlet->delete();

        return redirect()->back()->with('success', "Cabang {$outletName} berhasil dihapus.");
    }
}
