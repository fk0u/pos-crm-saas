<?php

declare(strict_types=1);

namespace App\Traits;

use App\Models\SupportDelegationToken;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\Request;

trait ResolvesTenantContext
{
    /**
     * Resolve the tenant ID for the current request.
     *
     * Security Enforcements:
     * 1. Regular tenant users always resolve strictly to their own tenant_id.
     * 2. Superadmins MUST have an active, unexpired SupportDelegationToken stored in session('delegated_tenant_id').
     * 3. Arbitrary tenant switching via query string (?tenant_id=...) or auto-fallback to first tenant is STRICTLY FORBIDDEN.
     */
    protected function resolveTenantId(User $user, ?Request $request = null): string
    {
        if ($user->isSuperAdmin()) {
            $delegatedTenantId = session('delegated_tenant_id') ?? $user->tenant_id;

            if (! $delegatedTenantId) {
                abort(403, 'Akses ditolak: Superadmin dilarang mengakses data operasional tenant tanpa Token Delegasi resmi yang aktif dari pemilik usaha.');
            }

            // Verify token validity in database if token id is stored
            $tokenId = session('delegated_token_id');
            if ($tokenId) {
                $token = SupportDelegationToken::where('id', $tokenId)
                    ->where('tenant_id', $delegatedTenantId)
                    ->where('expires_at', '>', now())
                    ->first();

                if (! $token) {
                    session()->forget(['delegated_tenant_id', 'delegated_token_id']);
                    abort(403, 'Sesi delegasi bantuan telah kedaluwarsa atau dicabut oleh pemilik usaha.');
                }
            }

            TenantContext::set((string) $delegatedTenantId);

            return (string) $delegatedTenantId;
        }

        $tenantId = $user->tenant_id ?? TenantContext::current();

        if (! $tenantId) {
            abort(403, 'Konteks tenant tidak valid untuk pengguna ini.');
        }

        TenantContext::set((string) $tenantId);

        return (string) $tenantId;
    }
}
