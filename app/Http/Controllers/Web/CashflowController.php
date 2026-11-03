<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Shift;
use App\Models\ShiftMovement;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CashflowController extends Controller
{
    /**
     * Display the cashflow & register shifts page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

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

        $movements = $movementsQuery->take(20)->get();

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
        $expectedCashInDrawer = $startingCash + $cashSales + (float) ($activeShift?->cash_in_total ?? 0) - (float) ($activeShift?->cash_out_total ?? 0);

        return Inertia::render('Cashflow/Index', [
            'activeShift' => $activeShift,
            'movements' => $movements,
            'pastShifts' => $pastShifts,
            'stats' => [
                'starting_cash' => $startingCash,
                'cash_sales' => $cashSales,
                'total_cash_in' => (float) $totalCashInToday,
                'total_cash_out' => (float) $totalCashOutToday,
                'expected_in_drawer' => $expectedCashInDrawer,
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $user->tenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Record a cash movement (cash in or cash out).
     */
    public function movement(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'type' => ['required', 'in:cash_in,cash_out'],
            'amount' => ['required', 'numeric', 'min:1000'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $activeShift = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (!$activeShift) {
            // Auto open a shift if none exists
            $activeShift = Shift::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenantId,
                'outlet_id' => $user->outlet_id ?? \App\Models\Outlet::where('tenant_id', $tenantId)->first()?->id,
                'user_id' => $user->id,
                'opened_at' => now(),
                'starting_cash' => 200000,
                'status' => 'open',
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

        $typeLabel = $validated['type'] === 'cash_in' ? 'Kas Masuk' : 'Kas Keluar';
        return redirect()->back()->with('success', "{$typeLabel} sebesar Rp " . number_format((float)$validated['amount'], 0, ',', '.') . " berhasil dicatat.");
    }

    /**
     * Close the currently active shift with cash counting and discrepancy audit.
     */
    public function closeShift(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $activeShift = Shift::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if (!$activeShift) {
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

        return redirect()->back()->with('success', "Shift kasir berhasil ditutup. Selisih laci: Rp " . number_format($diff, 0, ',', '.'));
    }
}

