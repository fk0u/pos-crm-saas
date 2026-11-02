<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosTerminalController extends Controller
{
    /**
     * Render the POS terminal (cashier) page via Inertia.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = auth()->user();

        /** @var Outlet|null $outlet */
        $outlet = $user->outlet;

        $tenantId = $user->tenant_id;
        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $activeShift = $user->activeShift();
        $outlets = $user->canManage()
            ? Outlet::where('tenant_id', $tenantId)->get(['id', 'name', 'address'])
            : ($outlet ? collect([$outlet]) : collect());

        return Inertia::render('Pos/Terminal', [
            'cashierName' => $user->name,
            'userRole' => $user->role,
            'outletId' => $outlet?->id,
            'outletName' => $outlet?->name ?? 'Outlet Tidak Diatur',
            'outlets' => $outlets,
            'initialProducts' => $products,
            'activeShift' => $activeShift ? [
                'id' => $activeShift->id,
                'opened_at' => $activeShift->opened_at->toIso8601String(),
                'starting_cash' => (float) $activeShift->starting_cash,
                'cash_sales_total' => (float) $activeShift->cash_sales_total,
                'non_cash_sales_total' => (float) $activeShift->non_cash_sales_total,
                'cash_in_total' => (float) $activeShift->cash_in_total,
                'cash_out_total' => (float) $activeShift->cash_out_total,
                'expected_ending_cash' => (float) $activeShift->expected_ending_cash,
            ] : null,
        ]);
    }
}
