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

        $tenant = $user?->tenant;
        if (! $tenant && session()->has('delegated_tenant_id')) {
            $tenant = \App\Models\Tenant::find(session('delegated_tenant_id'));
        }

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
                'tenant' => $tenant ? [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'subdomain' => $tenant->subdomain,
                    'subscription_tier' => $tenant->subscription_tier ?? 'essential',
                    'tier_label' => $tenant->getTierLabel(),
                    'enabled_modules' => $tenant->getEnabledModules(),
                    'max_outlets' => $tenant->max_outlets,
                    'max_staff' => $tenant->max_staff,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
