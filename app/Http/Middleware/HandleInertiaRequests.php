<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $activeShift = $user ? $user->activeShift() : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'outlet_id' => $user->outlet_id,
                    'outlet' => $user->outlet ? [
                        'id' => $user->outlet->id,
                        'name' => $user->outlet->name,
                        'address' => $user->outlet->address,
                    ] : null,
                    'active_shift' => $activeShift ? [
                        'id' => $activeShift->id,
                        'opened_at' => $activeShift->opened_at->toIso8601String(),
                        'starting_cash' => (float) $activeShift->starting_cash,
                        'cash_sales_total' => (float) $activeShift->cash_sales_total,
                        'non_cash_sales_total' => (float) $activeShift->non_cash_sales_total,
                        'expected_ending_cash' => (float) $activeShift->expected_ending_cash,
                    ] : null,
                ] : null,
                'tenant' => $user && $user->tenant ? [
                    'id' => $user->tenant->id,
                    'name' => $user->tenant->name,
                    'subdomain' => $user->tenant->subdomain,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
