<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Outlet;
use App\Models\Shift;
use App\Models\ShiftMovement;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use App\Traits\ResolvesTenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CashflowController extends Controller
{
    use ResolvesTenantContext;

    /**
     * Display the cashflow & register shifts page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        $allTenants = [];

        $outlets = Outlet::where('tenant_id', $tenantId)->get(['id', 'name']);

        // Get currently active shift
        $activeShift = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->with(['user', 'outlet'])
            ->latest('opened_at')
            ->first();

        // Get cash movements for active shift or recent movements
        $movementsQuery = ShiftMovement::where('tenant_id', $tenantId)
            ->with(['user', 'shift'])
            ->orderByDesc('created_at');

        if ($activeShift) {
            $movementsQuery->where('shift_id', $activeShift->id);
        }

        $movements = $movementsQuery->take(30)->get();

        // Recent closed shifts
        $pastShifts = Shift::where('tenant_id', $tenantId)
            ->with(['user', 'outlet', 'approver'])
            ->orderByDesc('opened_at')
            ->take(15)
            ->get();

        // Aggregate statistics
        $todayMovements = ShiftMovement::where('tenant_id', $tenantId)->whereDate('created_at', today())->get();
        $totalCashInToday = $todayMovements->where('type', 'cash_in')->sum('amount');
        $totalCashOutToday = $todayMovements->where('type', 'cash_out')->sum('amount');

        $startingCash = $activeShift ? (float) $activeShift->starting_cash : 0.0;
        $cashSales = $activeShift ? (float) $activeShift->cash_sales_total : 0.0;
        $cashInTotal = $activeShift ? (float) $activeShift->cash_in_total : 0.0;
        $cashOutTotal = $activeShift ? (float) $activeShift->cash_out_total : 0.0;
        $expectedCashInDrawer = $startingCash + $cashSales + $cashInTotal - $cashOutTotal;

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Cashflow/Index', [
            'activeShift' => $activeShift,
            'movements' => $movements,
            'pastShifts' => $pastShifts,
            'outlets' => $outlets,
            'stats' => [
                'starting_cash' => $startingCash,
                'cash_sales' => $cashSales,
                'total_cash_in' => (float) $totalCashInToday,
                'total_cash_out' => (float) $totalCashOutToday,
                'expected_in_drawer' => $expectedCashInDrawer,
            ],
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
     * Explicitly open a new cashier shift with starting float amount.
     */
    public function openShift(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Superadmin dilarang membuka shift kasir atas nama tenant.');
        }

        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        // Check if an open shift already exists for this user or outlet
        $existing = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Sudah ada shift kasir yang sedang aktif. Silakan tutup shift berjalan sebelum membuka shift baru.');
        }

        $validated = $request->validate([
            'outlet_id' => ['nullable', 'string'],
            'starting_cash' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $outletId = $validated['outlet_id'] ?? $user->outlet_id ?? Outlet::where('tenant_id', $tenantId)->first()?->id;

        $shift = Shift::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'user_id' => $user->id,
            'opened_at' => now(),
            'starting_cash' => $validated['starting_cash'],
            'cash_sales_total' => 0,
            'cash_in_total' => 0,
            'cash_out_total' => 0,
            'status' => 'open',
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'open_shift',
            'details' => [
                'shift_id' => $shift->id,
                'starting_cash' => $validated['starting_cash'],
                'outlet_id' => $outletId,
            ],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Shift kasir berhasil dibuka dengan modal awal Rp ' . number_format((float) $validated['starting_cash'], 0, ',', '.'));
    }

    /**
     * Record a cash movement (cash in or cash out / petty cash).
     */
    public function movement(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Superadmin dilarang mencatat mutasi kas laci tenant.');
        }

        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $validated = $request->validate([
            'type' => ['required', 'in:cash_in,cash_out'],
            'amount' => ['required', 'numeric', 'min:500'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $activeShift = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (! $activeShift) {
            // Auto open a shift if none exists so cash movement can always be tracked
            $outletId = $user->outlet_id ?? Outlet::where('tenant_id', $tenantId)->first()?->id;
            $activeShift = Shift::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'outlet_id' => $outletId,
                'user_id' => $user->id,
                'opened_at' => now(),
                'starting_cash' => 200000,
                'cash_sales_total' => 0,
                'cash_in_total' => 0,
                'cash_out_total' => 0,
                'status' => 'open',
                'notes' => 'Otomatis dibuka saat pencatatan kas',
            ]);
        }

        $movement = ShiftMovement::create([
            'id' => (string) Str::uuid(),
            'shift_id' => $activeShift->id,
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
        ]);

        // Update shift totals
        if ($validated['type'] === 'cash_in') {
            $activeShift->increment('cash_in_total', $validated['amount']);
        } else {
            $activeShift->increment('cash_out_total', $validated['amount']);
        }

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'cash_movement',
            'details' => [
                'type' => $validated['type'],
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'shift_id' => $activeShift->id,
            ],
            'ip_address' => $request->ip(),
        ]);

        $typeLabel = $validated['type'] === 'cash_in' ? 'Kas Masuk' : 'Kas Keluar (Petty Cash)';

        return redirect()->back()->with('success', "{$typeLabel} sebesar Rp " . number_format((float) $validated['amount'], 0, ',', '.') . " berhasil dicatat.");
    }

    /**
     * Close the currently active shift with cash counting and discrepancy audit.
     */
    public function closeShift(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Superadmin dilarang menutup shift kasir tenant.');
        }

        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $activeShift = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (! $activeShift) {
            return redirect()->back()->with('error', 'Tidak ada shift kasir aktif yang dapat ditutup.');
        }

        $validated = $request->validate([
            'actual_ending_cash' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $expectedEnding = (float) $activeShift->starting_cash +
                          (float) $activeShift->cash_sales_total +
                          (float) $activeShift->cash_in_total -
                          (float) $activeShift->cash_out_total;

        $actualEnding = (float) $validated['actual_ending_cash'];
        $diff = $actualEnding - $expectedEnding;

        $activeShift->update([
            'closed_at' => now(),
            'expected_ending_cash' => $expectedEnding,
            'actual_ending_cash' => $actualEnding,
            'difference' => $diff,
            'status' => 'closed',
            'approved_by' => $user->id,
            'notes' => $validated['notes'],
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'close_shift',
            'details' => [
                'shift_id' => $activeShift->id,
                'expected' => $expectedEnding,
                'actual' => $actualEnding,
                'difference' => $diff,
                'notes' => $validated['notes'],
            ],
            'ip_address' => $request->ip(),
        ]);

        $statusStr = $diff === 0.0 ? 'Sempurna (Klir)' : ($diff > 0 ? 'Lebih Rp ' . number_format($diff, 0, ',', '.') : 'Kurang Rp ' . number_format(abs($diff), 0, ',', '.'));

        return redirect()->back()->with('success', "Shift kasir berhasil ditutup dan direkonsiliasi. Status selisih: {$statusStr}.");
    }

    /**
     * Export all cashflow and shift movements to formatted CSV for Excel bookkeeping.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $movements = ShiftMovement::where('tenant_id', $tenantId)
            ->with(['user', 'shift.outlet'])
            ->orderByDesc('created_at')
            ->get();

        $csvFileName = 'laporan_arus_kas_petty_cash_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$csvFileName}\"",
        ];

        return response()->stream(function () use ($movements) {
            $file = fopen('php://output', 'w');
            // Write UTF-8 BOM so Excel opens with proper characters
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'ID Transaksi',
                'Waktu',
                'Outlet',
                'Tipe Mutasi',
                'Nominal (Rp)',
                'Keterangan / Keperluan',
                'Petugas Kasir',
                'ID Shift',
            ]);

            foreach ($movements as $m) {
                fputcsv($file, [
                    $m->id,
                    $m->created_at?->format('d/m/Y H:i:s'),
                    $m->shift?->outlet?->name ?? 'Outlet Utama',
                    $m->type === 'cash_in' ? 'Kas Masuk (In)' : 'Kas Keluar (Petty Cash Out)',
                    $m->amount,
                    $m->reason,
                    $m->user?->name ?? 'Sistem',
                    $m->shift_id,
                ]);
            }

            fclose($file);
        }, 200, $headers);
    }

    /**
     * Generate Printable Berita Acara Rekonsiliasi Kasir & Laci (Z-Report) for a shift.
     */
    public function shiftReport(Request $request, string $id)
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $shift = Shift::where('tenant_id', $tenantId)
            ->with(['user', 'outlet', 'approver', 'movements.user', 'tenant'])
            ->findOrFail($id);

        $tenant = $shift->tenant ?? ($tenantId ? Tenant::find($tenantId) : null);

        return view('cashflow.shift_report', [
            'shift' => $shift,
            'tenant' => $tenant,
            'printedBy' => $user->name,
        ]);
    }
}
