<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Product;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    private function resolveTenantId(\App\Models\User $user, Request $request): ?string
    {
        if ($user->isSuperAdmin()) {
            return $request->query('tenant_id') ?? session('delegated_tenant_id') ?? \App\Models\Tenant::first()?->id;
        }

        return $user->tenant_id ?? TenantContext::current();
    }

    /**
     * Display the transactions list page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $allTenants = $user->isSuperAdmin()
            ? \App\Models\Tenant::select(['id', 'name', 'subdomain'])->get()
            : [];

        $query = Order::where('tenant_id', $tenantId)
            ->with(['items.product', 'customer', 'cashier', 'outlet']);

        // Search by invoice or customer name/phone
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'ilike', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'ilike', "%{$search}%")
                         ->orWhere('phone', 'ilike', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('payment_status', $status);
            }
        }

        // Payment method filter
        if ($method = $request->query('payment_method')) {
            if ($method !== 'all') {
                $query->where('payment_method', $method);
            }
        }

        // Date range filter
        if ($dateRange = $request->query('date_range')) {
            if ($dateRange === 'today') {
                $query->whereDate('created_at', today());
            } elseif ($dateRange === 'yesterday') {
                $query->whereDate('created_at', today()->subDay());
            } elseif ($dateRange === 'this_week') {
                $query->where('created_at', '>=', now()->startOfWeek());
            } elseif ($dateRange === 'this_month') {
                $query->where('created_at', '>=', now()->startOfMonth());
            }
        }

        $orders = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        // Calculate statistics
        $allOrders = Order::where('tenant_id', $tenantId);
        $totalOrdersCount = (clone $allOrders)->count();
        $totalGrossVolume = (clone $allOrders)->where('payment_status', 'paid')->sum('grand_total');
        $totalRefundedAmount = (clone $allOrders)->where('payment_status', 'refunded')->sum('grand_total');
        $paidCount = (clone $allOrders)->where('payment_status', 'paid')->count();

        $currentTenant = $tenantId ? \App\Models\Tenant::find($tenantId) : null;

        return Inertia::render('Transactions/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $request->query('search', ''),
                'status' => $request->query('status', 'all'),
                'payment_method' => $request->query('payment_method', 'all'),
                'date_range' => $request->query('date_range', 'all'),
            ],
            'stats' => [
                'total_orders' => $totalOrdersCount,
                'total_volume' => (float) $totalGrossVolume,
                'total_refunded' => (float) $totalRefundedAmount,
                'paid_count' => $paidCount,
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Process refund / order cancellation with stock restoration.
     */
    public function refund(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $order = Order::where('tenant_id', $tenantId)->with('items')->findOrFail($id);

        if ($order->payment_status === 'refunded') {
            return redirect()->back()->with('error', 'Pesanan ini sudah pernah diretur.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'restock' => ['boolean'],
        ]);

        DB::transaction(function () use ($order, $validated, $user, $tenantId, $request) {
            $order->update([
                'payment_status' => 'refunded',
            ]);

            // Restock items if requested
            if ($validated['restock'] ?? true) {
                foreach ($order->items as $item) {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }

            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'user_id' => $user->id,
                'action' => 'refund',
                'details' => [
                    'order_id' => $order->id,
                    'invoice_number' => $order->invoice_number,
                    'amount' => $order->grand_total,
                    'reason' => $validated['reason'],
                    'restocked' => $validated['restock'] ?? true,
                ],
                'ip_address' => $request->ip(),
            ]);
        });

        return redirect()->back()->with('success', "Pesanan {$order->invoice_number} berhasil diretur.");
    }

    /**
     * Export transactions to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $orders = Order::where('tenant_id', $tenantId)
            ->with(['customer', 'cashier'])
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transaksi_qlon_' . date('Ymd_His') . '.csv"',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No Invoice', 'Tanggal & Waktu', 'Pelanggan', 'No HP', 'Subtotal', 'Diskon', 'Pajak', 'Grand Total', 'Metode Bayar', 'Status', 'Kasir']);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->invoice_number,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->customer?->name ?? 'Pelanggan Umum',
                    $order->customer?->phone ?? '-',
                    $order->subtotal,
                    $order->discount_amount,
                    $order->tax_amount,
                    $order->grand_total,
                    strtoupper($order->payment_method),
                    $order->payment_status,
                    $order->cashier?->name ?? 'Kasir',
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}

