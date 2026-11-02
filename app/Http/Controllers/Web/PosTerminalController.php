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
        $tenantId = $user->tenant_id;

        /** @var Outlet|null $outlet */
        $outlet = $user->outlet ?? Outlet::where('tenant_id', $tenantId)->first();

        $products = Product::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $customers = \App\Models\Customer::where('tenant_id', $tenantId)
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'points' => (int) $c->loyalty_points,
                'segment' => $c->visit_count > 10 ? 'loyal' : ($c->visit_count > 3 ? 'regular' : 'new'),
            ]);

        $activeShift = $user->activeShift();
        $outlets = $user->canManage()
            ? Outlet::where('tenant_id', $tenantId)->get(['id', 'name', 'address'])
            : ($outlet ? collect([$outlet]) : collect());

        return Inertia::render('Pos/Terminal', [
            'cashierName' => $user->name,
            'userRole' => $user->role,
            'tenantName' => $user->tenant?->name ?? 'QLon Store',
            'outletId' => $outlet?->id,
            'outletName' => $outlet?->name ?? 'Central Outlet',
            'outlets' => $outlets,
            'initialProducts' => $products,
            'initialCustomers' => $customers,
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
