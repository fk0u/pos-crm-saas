<?php

namespace App\Http\Middleware;

use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bind the tenant of the authenticated user to the request context so the
 * TenantScope never has to resolve the user lazily (which previously caused
 * an infinite recursion during Auth::retrieveById).
 */
class SetTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->user()?->tenant_id;

        if (! $tenantId && $request->user()?->isSuperAdmin() && $request->hasSession() && $request->session()->has('delegated_tenant_id')) {
            $tenantId = $request->session()->get('delegated_tenant_id');
        }

        TenantContext::set($tenantId);

        return $next($request);
    }
}
