<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request and check Role-Based Access Control (RBAC).
     *
     * Hierarchy & Permissions:
     * - superadmin: Platform owner, global server oversight.
     * - developer: Technical integrator, diagnostic access.
     * - owner: Tenant/business owner, full financial & management access.
     * - manager: Store manager, product & stock adjustments.
     * - cashier: Transaction terminal and shift cash handling only.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Normalize roles
        $userRole = $user->role ?? 'cashier';

        // Superadmin bypasses generic role limits unless access token is explicitly required
        if ($userRole === 'superadmin' && ! in_array('strict_business_owner_only', $roles, true)) {
            return $next($request);
        }

        if (! in_array($userRole, $roles, true)) {
            // Cashier attempting to enter owner-only financial or report pages
            if ($userRole === 'cashier') {
                return redirect()->route('kasir')->with('error', 'Akses ditolak. Kasir hanya memiliki izin operasional kasir.');
            }

            abort(403, 'Akses Ditolak: Peran akun Anda tidak memiliki izin untuk fitur ini.');
        }

        return $next($request);
    }
}

