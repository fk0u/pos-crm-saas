<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckModuleEntitlement
{
    /**
     * Handle an incoming request to verify that the tenant has the required feature module enabled.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Platform Superadmin in sovereign mode can inspect all screens
        if ($user->isSuperAdmin() && ! session()->has('delegated_tenant_id')) {
            return $next($request);
        }

        $tenantId = session('delegated_tenant_id') ?? $user->tenant_id ?? TenantContext::current();

        if (! $tenantId) {
            return $next($request);
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            return $next($request);
        }

        if (! $tenant->hasModule($module)) {
            $friendlyModuleName = match ($module) {
                Tenant::MODULE_KITCHEN_DISPLAY => 'Layar Dapur & Barista',
                Tenant::MODULE_FINANCE => 'Laporan Untung-Rugi & Biaya Toko',
                Tenant::MODULE_DEVELOPER_API => 'Sambungan Aplikasi Luar (Integrasi API)',
                Tenant::MODULE_INVENTORY => 'Inventori & Kontrol Stok Bahan',
                Tenant::MODULE_CASHFLOW => 'Arus Kas & Rekap Kas Laci',
                Tenant::MODULE_STAFF => 'Manajemen Tim & Karyawan',
                Tenant::MODULE_PROMOTIONS => 'Kupon Diskon & Promosi',
                Tenant::MODULE_CRM => 'Kelompok & Buku Pelanggan WhatsApp',
                Tenant::MODULE_ONLINE_ORDERING => 'Pesan di Meja (QR) & Menu Online',
                Tenant::MODULE_ACCOUNTING_REPORTS => 'Laporan Akuntansi & Pajak Usaha',
                default => 'Fitur Tambahan',
            };

            $message = "Modul {$friendlyModuleName} belum aktif pada paket toko Anda saat ini. Hubungi pemilik aplikasi untuk meningkatkan paket usaha Anda.";

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $message,
                    'module' => $module,
                    'required_tier' => Tenant::TIER_FULL,
                ], 403);
            }

            return redirect()->route('dashboard')->with('error', $message);
        }

        return $next($request);
    }
}
