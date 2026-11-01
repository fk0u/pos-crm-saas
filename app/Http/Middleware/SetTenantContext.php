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
        TenantContext::set($request->user()?->tenant_id);

        return $next($request);
    }
}
