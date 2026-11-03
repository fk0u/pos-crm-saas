<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Order;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display CRM customers list and loyalty metrics.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $query = Customer::where('tenant_id', $tenantId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('phone', 'ilike', "%{$search}%");
            });
        }

        $customers = $query->orderByDesc('last_visit_at')->paginate(20)->withQueryString();

        // Calculate statistics
        $allCustomers = Customer::where('tenant_id', $tenantId)->get();
        $totalCustomers = $allCustomers->count();
        $totalPoints = $allCustomers->sum('loyalty_points');
        $totalSpend = $allCustomers->sum('total_spend');
        $avgSpend = $totalCustomers > 0 ? $totalSpend / $totalCustomers : 0;
        $repeatCustomers = $allCustomers->where('visit_count', '>', 1)->count();
        $retentionRate = $totalCustomers > 0 ? round(($repeatCustomers / $totalCustomers) * 100, 1) : 0;

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => [
                'search' => $request->query('search', ''),
            ],
            'stats' => [
                'total_customers' => $totalCustomers,
                'total_points' => $totalPoints,
                'total_spend' => (float) $totalSpend,
                'avg_spend' => (float) $avgSpend,
                'retention_rate' => $retentionRate,
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $user->tenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Store a new customer.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'name' => ['required', 'string', 'max:255'],
            'initial_points' => ['nullable', 'integer', 'min:0'],
        ]);

        $existing = Customer::where('tenant_id', $tenantId)->where('phone', $validated['phone'])->first();
        if ($existing) {
            return redirect()->back()->with('error', 'Pelanggan dengan nomor telepon ini sudah terdaftar.');
        }

        $customer = Customer::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'phone' => $validated['phone'],
            'name' => $validated['name'],
            'loyalty_points' => $validated['initial_points'] ?? 0,
            'total_spend' => 0.00,
            'visit_count' => 0,
            'last_visit_at' => now(),
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'create_customer',
            'details' => ['customer_id' => $customer->id, 'name' => $customer->name, 'phone' => $customer->phone],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Pelanggan {$customer->name} berhasil ditambahkan");
    }

    /**
     * Update an existing customer.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'loyalty_points' => ['required', 'integer', 'min:0'],
        ]);

        $customer->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'loyalty_points' => $validated['loyalty_points'],
        ]);

        return redirect()->back()->with('success', "Data pelanggan {$customer->name} berhasil diperbarui");
    }

    /**
     * Delete a customer.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);
        $name = $customer->name;
        $customer->delete();

        return redirect()->back()->with('success', "Pelanggan {$name} berhasil dihapus");
    }

    /**
     * Adjust customer points manually.
     */
    public function adjustPoints(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $customer = Customer::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'points' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $newPoints = max(0, $customer->loyalty_points + $validated['points']);
        $customer->update(['loyalty_points' => $newPoints]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'adjust_loyalty_points',
            'details' => [
                'customer_id' => $customer->id,
                'name' => $customer->name,
                'points_delta' => $validated['points'],
                'new_balance' => $newPoints,
                'reason' => $validated['reason'],
            ],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Poin {$customer->name} berhasil disesuaikan menjadi {$newPoints} poin");
    }
}
