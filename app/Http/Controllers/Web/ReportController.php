<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\TenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display comprehensive business and event sales reports.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $period = $request->query('period', 'this_month');

        $query = Order::where('tenant_id', $tenantId)->where('payment_status', 'paid');

        if ($period === 'today') {
            $query->whereDate('created_at', today());
            $periodLabel = 'Hari Ini (' . today()->format('d M Y') . ')';
        } elseif ($period === 'yesterday') {
            $query->whereDate('created_at', today()->subDay());
            $periodLabel = 'Kemarin (' . today()->subDay()->format('d M Y') . ')';
        } elseif ($period === '7days') {
            $query->where('created_at', '>=', now()->subDays(7));
            $periodLabel = '7 Hari Terakhir';
        } else {
            $query->where('created_at', '>=', now()->startOfMonth());
            $periodLabel = 'Bulan Ini (' . now()->format('F Y') . ')';
        }

        $paidOrders = $query->with('items')->get();

        $grossSales = $paidOrders->sum('grand_total');
        $totalOrders = $paidOrders->count();
        $totalDiscounts = $paidOrders->sum('discount_amount');
        $netSales = $grossSales;

        // Calculate Cost of Goods Sold (HPP) from order items
        $totalCogs = 0;
        foreach ($paidOrders as $order) {
            foreach ($order->items as $item) {
                $totalCogs += (float) $item->unit_cost_price * (int) $item->quantity;
            }
        }

        $grossProfit = max(0, $netSales - $totalCogs);
        $profitMargin = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 1) : 0;

        // Payment Methods Breakdown
        $methodsMap = [
            'cash' => ['label' => 'Tunai', 'count' => 0, 'amount' => 0],
            'qris' => ['label' => 'QRIS', 'count' => 0, 'amount' => 0],
            'card' => ['label' => 'Kartu Debit/Kredit', 'count' => 0, 'amount' => 0],
            'transfer' => ['label' => 'Transfer Bank', 'count' => 0, 'amount' => 0],
        ];

        foreach ($paidOrders as $order) {
            $m = strtolower($order->payment_method);
            if (isset($methodsMap[$m])) {
                $methodsMap[$m]['count']++;
                $methodsMap[$m]['amount'] += (float) $order->grand_total;
            } else {
                $methodsMap['cash']['count']++;
                $methodsMap['cash']['amount'] += (float) $order->grand_total;
            }
        }

        // Top Selling Products in this period
        $topProducts = OrderItem::whereHas('order', function ($q) use ($tenantId, $period) {
            $q->where('tenant_id', $tenantId)->where('payment_status', 'paid');
            if ($period === 'today') $q->whereDate('created_at', today());
            elseif ($period === 'yesterday') $q->whereDate('created_at', today()->subDay());
            elseif ($period === '7days') $q->where('created_at', '>=', now()->subDays(7));
            else $q->where('created_at', '>=', now()->startOfMonth());
        })
        ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_revenue'))
        ->groupBy('product_id')
        ->orderByDesc('total_qty')
        ->with('product')
        ->take(8)
        ->get()
        ->map(fn ($item) => [
            'id' => $item->product_id,
            'name' => $item->product?->name ?? 'Produk Dihapus',
            'category' => $item->product?->category ?? 'Umum',
            'total_qty' => (int) $item->total_qty,
            'total_revenue' => (float) $item->total_revenue,
        ]);

        // Hourly Rush Analysis (08:00 to 22:00)
        $hourlyBuckets = [];
        for ($h = 8; $h <= 22; $h++) {
            $hourlyBuckets[sprintf('%02d:00', $h)] = ['orders' => 0, 'sales' => 0];
        }

        foreach ($paidOrders as $order) {
            $hKey = $order->created_at->format('H:00');
            if (isset($hourlyBuckets[$hKey])) {
                $hourlyBuckets[$hKey]['orders']++;
                $hourlyBuckets[$hKey]['sales'] += (float) $order->grand_total;
            }
        }

        $hourlyData = [];
        foreach ($hourlyBuckets as $hour => $val) {
            $hourlyData[] = [
                'hour' => $hour,
                'orders' => $val['orders'],
                'sales' => $val['sales'],
            ];
        }

        return Inertia::render('Reports/Index', [
            'period' => $period,
            'periodLabel' => $periodLabel,
            'summary' => [
                'gross_sales' => (float) $grossSales,
                'net_sales' => (float) $netSales,
                'total_orders' => $totalOrders,
                'total_discounts' => (float) $totalDiscounts,
                'total_cogs' => (float) $totalCogs,
                'gross_profit' => (float) $grossProfit,
                'profit_margin' => $profitMargin,
                'avg_basket' => $totalOrders > 0 ? (float) ($grossSales / $totalOrders) : 0,
            ],
            'paymentMethods' => array_values($methodsMap),
            'topProducts' => $topProducts,
            'hourlyData' => $hourlyData,
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $user->tenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Export sales report to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $orders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->with(['items.product', 'customer', 'cashier'])
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="laporan_penjualan_qlon_' . date('Ymd_His') . '.csv"',
        ];

        return response()->stream(function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['No Invoice', 'Waktu', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Grand Total', 'Item Summary']);

            foreach ($orders as $order) {
                $itemsStr = $order->items->map(fn ($it) => ($it->product?->name ?? 'Item') . ' (' . $it->quantity . 'x)')->implode(', ');
                fputcsv($handle, [
                    $order->invoice_number,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->cashier?->name ?? 'Kasir',
                    $order->customer?->name ?? 'Umum',
                    strtoupper($order->payment_method),
                    $order->grand_total,
                    $itemsStr,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}
