<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\ShiftMovement;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use App\Traits\ResolvesTenantContext;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    use ResolvesTenantContext;

    /**
     * Display the financial overview and Profit & Loss (Laba Rugi) statement.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        $allTenants = [];

        $period = $request->query('period', 'this_month');
        $outletFilter = $request->query('outlet_id');

        $query = Order::where('tenant_id', $tenantId)->where('payment_status', 'paid');
        $movementQuery = ShiftMovement::where('tenant_id', $tenantId);

        if ($period === 'today') {
            $query->whereDate('created_at', today());
            $movementQuery->whereDate('created_at', today());
            $periodLabel = 'Hari Ini (' . today()->format('d M Y') . ')';
        } elseif ($period === 'yesterday') {
            $query->whereDate('created_at', today()->subDay());
            $movementQuery->whereDate('created_at', today()->subDay());
            $periodLabel = 'Kemarin (' . today()->subDay()->format('d M Y') . ')';
        } elseif ($period === '7days') {
            $query->where('created_at', '>=', now()->subDays(7));
            $movementQuery->where('created_at', '>=', now()->subDays(7));
            $periodLabel = '7 Hari Terakhir';
        } elseif ($period === 'all') {
            $periodLabel = 'Semua Periode';
        } else {
            // this_month default
            $query->where('created_at', '>=', now()->startOfMonth());
            $movementQuery->where('created_at', '>=', now()->startOfMonth());
            $periodLabel = 'Bulan Ini (' . now()->format('F Y') . ')';
        }

        if ($outletFilter && $outletFilter !== 'all') {
            $query->where('outlet_id', $outletFilter);
        }

        $paidOrders = $query->with('items')->get();

        $grossSales = (float) $paidOrders->sum('subtotal');
        $totalDiscounts = (float) $paidOrders->sum('discount_amount');
        $totalTax = (float) $paidOrders->sum('tax_amount');
        $netSales = (float) $paidOrders->sum('grand_total');
        $totalTransactions = $paidOrders->count();

        // Calculate Cost of Goods Sold (HPP)
        $orderIds = $paidOrders->pluck('id');
        $totalCogs = 0.0;
        if ($orderIds->isNotEmpty()) {
            $totalCogs = (float) (OrderItem::whereIn('order_id', $orderIds)
                ->selectRaw('SUM(unit_cost_price * quantity) as cogs')
                ->value('cogs') ?? 0.0);
        }

        $grossProfit = max(0.0, $netSales - $totalCogs);
        $grossMarginPct = $netSales > 0 ? round(($grossProfit / $netSales) * 100, 1) : 0.0;

        // Operational Expenses from Petty Cash (Cash Out)
        $operationalExpenses = (float) $movementQuery->where('type', 'cash_out')->sum('amount');
        $netProfit = $grossProfit - $operationalExpenses;
        $netMarginPct = $netSales > 0 ? round(($netProfit / $netSales) * 100, 1) : 0.0;

        // Breakdown per Outlet
        $outlets = Outlet::where('tenant_id', $tenantId)->get(['id', 'name']);
        $outletBreakdown = $outlets->map(function ($outlet) use ($tenantId, $period) {
            $oq = Order::where('tenant_id', $tenantId)
                ->where('outlet_id', $outlet->id)
                ->where('payment_status', 'paid');

            if ($period === 'today') {
                $oq->whereDate('created_at', today());
            } elseif ($period === 'yesterday') {
                $oq->whereDate('created_at', today()->subDay());
            } elseif ($period === '7days') {
                $oq->where('created_at', '>=', now()->subDays(7));
            } elseif ($period === 'this_month') {
                $oq->where('created_at', '>=', now()->startOfMonth());
            }

            $orders = $oq->with('items')->get();
            $rev = (float) $orders->sum('grand_total');
            $cogs = 0.0;
            foreach ($orders as $o) {
                foreach ($o->items as $item) {
                    $cogs += (float) $item->unit_cost_price * (int) $item->quantity;
                }
            }

            $gp = max(0.0, $rev - $cogs);

            return [
                'id' => $outlet->id,
                'name' => $outlet->name,
                'transactions' => $orders->count(),
                'revenue' => $rev,
                'cogs' => $cogs,
                'gross_profit' => $gp,
                'margin' => $rev > 0 ? round(($gp / $rev) * 100, 1) : 0.0,
            ];
        });

        // 12-Month Trend (Revenue vs COGS vs Net Profit)
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Des'];
        $monthlyTrend = [];
        $currentYear = 2026;
        $startOfYear = Carbon::create($currentYear, 1, 1)->startOfDay();
        $endOfYear = Carbon::create($currentYear, 12, 31)->endOfDay();

        $allYearOrders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$startOfYear, $endOfYear])
            ->with('items')
            ->get();

        for ($m = 1; $m <= 12; $m++) {
            $mOrders = $allYearOrders->filter(fn ($o) => (int) $o->created_at->format('n') === $m);
            $mRev = (float) $mOrders->sum('grand_total');
            $mCogs = 0.0;
            foreach ($mOrders as $o) {
                foreach ($o->items as $item) {
                    $mCogs += (float) $item->unit_cost_price * (int) $item->quantity;
                }
            }
            $mProfit = max(0.0, $mRev - $mCogs);

            $monthlyTrend[] = [
                'month' => $months[$m - 1],
                'revenue' => round($mRev / 1000000, 2),
                'cogs' => round($mCogs / 1000000, 2),
                'profit' => round($mProfit / 1000000, 2),
                'raw_revenue' => $mRev,
                'raw_profit' => $mProfit,
            ];
        }

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Finance/Index', [
            'metrics' => [
                'gross_sales' => $grossSales,
                'discounts' => $totalDiscounts,
                'tax' => $totalTax,
                'net_sales' => $netSales,
                'cogs' => $totalCogs,
                'gross_profit' => $grossProfit,
                'gross_margin_pct' => $grossMarginPct,
                'operational_expenses' => $operationalExpenses,
                'net_profit' => $netProfit,
                'net_margin_pct' => $netMarginPct,
                'transactions' => $totalTransactions,
                'period_label' => $periodLabel,
                'period' => $period,
            ],
            'outletBreakdown' => $outletBreakdown,
            'monthlyTrend' => $monthlyTrend,
            'outlets' => $outlets,
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Semua Outlet',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Export P&L report to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $paidOrders = Order::where('tenant_id', $tenantId)
            ->where('payment_status', 'paid')
            ->with(['outlet', 'customer', 'items'])
            ->latest()
            ->get();

        $csvFileName = 'laporan_keuangan_laba_rugi_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$csvFileName}\"",
        ];

        return response()->stream(function () use ($paidOrders) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'No Invoice',
                'Tanggal',
                'Cabang Outlet',
                'Pelanggan',
                'Metode Pembayaran',
                'Subtotal (Rp)',
                'Diskon (Rp)',
                'Pajak PPN (Rp)',
                'Total Bersih (Rp)',
                'Estimasi HPP (Rp)',
                'Laba Kotor (Rp)',
            ]);

            foreach ($paidOrders as $o) {
                $cogs = 0.0;
                foreach ($o->items as $it) {
                    $cogs += (float) $it->unit_cost_price * (int) $it->quantity;
                }
                $gp = (float) $o->grand_total - $cogs;

                fputcsv($file, [
                    $o->invoice_number,
                    $o->created_at?->format('d/m/Y H:i'),
                    $o->outlet?->name ?? 'Outlet Utama',
                    $o->customer?->name ?? ($o->customer_name ?? 'Pelanggan Walk-In'),
                    $o->payment_method,
                    $o->subtotal,
                    $o->discount_amount,
                    $o->tax_amount,
                    $o->grand_total,
                    $cogs,
                    $gp,
                ]);
            }

            fclose($file);
        }, 200, $headers);
    }
}

