<?php

namespace App\Scopes;

use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class TenantScope implements Scope
{
    /**
     * Isolation rule per T 4.2 (PSD):
     * 1. Explicit TenantContext (bound per request by SetTenantContextMiddleware or CLI) wins.
     * 2. Fall back to the resolved guard user (never re-resolves it, so no recursion).
     * 3. The User model itself is exempt: auth must resolve a user BEFORE the tenant
     *    is known (chicken-and-egg). Protected instead by explicit validation.
     * 4. CLI (migrations, seeders, jobs) may run cross-tenant on purpose.
     * 5. Anything else (web/API request without tenant & user) hard-fails — a silent
     *    pass would leak every tenant's data; the auth middleware on the API should
     *    make this unreachable.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $tenantId = TenantContext::current();

        if (! $tenantId && Auth::hasUser()) {
            $tenantId = Auth::user()->tenant_id;
        }

        if ($tenantId) {
            $builder->where($model->getTable().'.tenant_id', $tenantId);

            return;
        }

        if ($model instanceof User) {
            return;
        }

        if (app()->runningInConsole()) {
            return;
        }

        throw new RuntimeException(
            sprintf('Query pada tabel "%s" membutuhkan tenant/auth context. Pasang middleware auth sebelum query.', $model->getTable())
        );
    }
}
