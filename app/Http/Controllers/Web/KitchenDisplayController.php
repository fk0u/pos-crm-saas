<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Tenant;
use App\Support\TenantContext;
use App\Traits\ResolvesTenantContext;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KitchenDisplayController extends Controller
{
    use ResolvesTenantContext;

    /**
     * Display the Kitchen Display System (KDS) screen for cooks and baristas.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        $outlets = Outlet::where('tenant_id', $tenantId)->get(['id', 'name']);

        $outletId = $request->query('outlet_id', $user->outlet_id ?? $outlets->first()?->id);

        $ordersQuery = Order::where('tenant_id', $tenantId)
            ->whereIn('status', ['pending', 'processing', 'ready'])
            ->with(['items.product:id,name,sku', 'customer:id,name,phone'])
            ->orderBy('created_at', 'asc');

        if ($outletId && $outletId !== 'all') {
            $ordersQuery->where('outlet_id', $outletId);
        }

        $activeOrders = $ordersQuery->get()->map(function (Order $order) {
            $elapsedMinutes = (int) Carbon::parse($order->created_at)->diffInMinutes(Carbon::now());

            return [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'table_number' => $order->table_number ?? 'Bawa Pulang',
                'order_type' => $order->table_number ? 'Makan di Tempat' : 'Bawa Pulang',
                'status' => $order->status,
                'customer_name' => $order->customer?->name ?? 'Pelanggan Toko',
                'elapsed_minutes' => $elapsedMinutes,
                'created_at' => $order->created_at?->format('H:i'),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product?->name ?? 'Menu Dihapus',
                    'quantity' => $item->quantity,
                ]),
            ];
        });

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Kitchen/Index', [
            'orders' => $activeOrders,
            'outlets' => $outlets,
            'activeOutletId' => $outletId,
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Semua Cabang',
            'tenantName' => $currentTenant?->name ?? 'QLon Resto',
        ]);
    }

    /**
     * Update the preparation status of an order in the kitchen.
     */
    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Konteks toko tidak valid.');
        }

        TenantContext::set($tenantId);

        $order = Order::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:processing,ready,completed,cancelled'],
        ]);

        $previousStatus = $order->status;
        $order->status = $validated['status'];
        $order->save();

        $statusLabels = [
            'processing' => 'Sedang Dimasak / Disiapkan',
            'ready' => 'Siap Disajikan',
            'completed' => 'Selesai / Pesanan Diambil',
            'cancelled' => 'Dibatalkan',
        ];

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'kitchen.status_updated',
            'details' => json_encode([
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'from_status' => $previousStatus,
                'to_status' => $order->status,
            ]),
            'ip_address' => $request->ip(),
        ]);

        $label = $statusLabels[$order->status] ?? $order->status;

        return redirect()->back()->with('success', "Status pesanan #{$order->order_number} diperbarui menjadi {$label}.");
    }
}
