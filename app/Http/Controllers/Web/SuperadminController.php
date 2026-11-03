<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SupportDelegationToken;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SuperadminController extends Controller
{
    /**
     * Superadmin Platform Command Center.
     * Monitors servers, subscriptions, tenants, and active delegation tokens.
     */
    public function index(Request $request): Response
    {
        $tenants = Tenant::withCount(['users', 'outlets', 'products'])
            ->orderBy('created_at', 'desc')
            ->get();

        $activeTokens = SupportDelegationToken::with(['creator', 'tenant'])
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Superadmin/Dashboard', [
            'tenants' => $tenants,
            'activeTokens' => $activeTokens,
            'serverStatus' => [
                'uptime' => '99.98%',
                'php_version' => PHP_VERSION,
                'db_driver' => config('database.default'),
                'active_connections' => 14,
                'cluster_region' => 'ap-southeast-1 (Singapore)',
            ],
            'userName' => Auth::user()?->name ?? 'Master Superadmin',
            'role' => Auth::user()?->role ?? 'superadmin',
        ]);
    }

    /**
     * Claim a delegation token to assume temporary tenant assistance.
     */
    public function claimToken(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $tokenRecord = SupportDelegationToken::where('token', $request->token)
            ->where('expires_at', '>', now())
            ->first();

        if (! $tokenRecord) {
            return redirect()->back()->with('error', 'Token delegasi tidak valid atau telah kedaluwarsa.');
        }

        $tokenRecord->update([
            'claimed_by' => Auth::id(),
            'claimed_at' => now(),
        ]);

        session(['delegated_tenant_id' => $tokenRecord->tenant_id]);
        session(['delegated_token_id' => $tokenRecord->id]);

        return redirect()->route('dashboard')->with('success', "Akses dukungan tenant berhasil diaktifkan hingga {$tokenRecord->expires_at->format('H:i d/m/Y')}");
    }

    /**
     * Exit delegated tenant mode.
     */
    public function exitDelegation(): RedirectResponse
    {
        session()->forget(['delegated_tenant_id', 'delegated_token_id']);

        return redirect()->route('superadmin.dashboard')->with('success', 'Kembali ke mode Master Platform Superadmin.');
    }
}

