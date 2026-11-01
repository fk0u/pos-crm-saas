<?php

namespace App\Support;

/**
 * Per-request tenant context. Bound by SetTenantContextMiddleware from the
 * authenticated user (or explicitly in CLI/jobs), so the TenantScope can
 * resolve the tenant without depending on the auth guard resolving first.
 */
final class TenantContext
{
    private static ?string $tenantId = null;

    public static function set(?string $tenantId): void
    {
        self::$tenantId = $tenantId;
    }

    public static function current(): ?string
    {
        return self::$tenantId;
    }

    public static function hasTenant(): bool
    {
        return self::$tenantId !== null;
    }

    public static function clear(): void
    {
        self::$tenantId = null;
    }
}
