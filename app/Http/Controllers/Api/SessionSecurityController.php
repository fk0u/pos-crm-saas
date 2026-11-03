<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class SessionSecurityController extends Controller
{
    /**
     * Get real-time session, security cookies, and CSRF token status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $lifetimeMinutes = (int) config('session.lifetime', 120);
        $lastActivity = Session::get('_last_activity', time());
        $elapsed = time() - $lastActivity;
        $remainingSeconds = max(0, ($lifetimeMinutes * 60) - $elapsed);

        return response()->json([
            'status' => 'active',
            'authenticated' => (bool) $user,
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'tenant_id' => $user->tenant_id,
            ] : null,
            'tenant' => [
                'context_id' => TenantContext::current(),
                'has_isolation' => TenantContext::hasTenant(),
            ],
            'session' => [
                'driver' => config('session.driver'),
                'lifetime_minutes' => $lifetimeMinutes,
                'remaining_seconds' => $remainingSeconds,
                'is_expiring_soon' => $remainingSeconds < 300,
                'session_id_hash' => hash('sha256', Session::getId()),
            ],
            'security' => [
                'csrf_token' => csrf_token(),
                'cookie_httponly' => (bool) config('session.http_only', true),
                'cookie_samesite' => config('session.same_site', 'lax'),
                'cookie_secure' => (bool) config('session.secure', false),
                'timestamp' => now()->toIso8601String(),
                'server_year' => 2026,
            ],
        ]);
    }

    /**
     * Touch session activity to prevent unexpected session timeout during event peak hours.
     */
    public function heartbeat(Request $request): JsonResponse
    {
        Session::put('_last_activity', time());
        $request->session()->save();

        return response()->json([
            'success' => true,
            'message' => 'Session heartbeat updated',
            'csrf_token' => csrf_token(),
            'refreshed_at' => now()->toIso8601String(),
            'tenant_context' => TenantContext::current(),
        ]);
    }

    /**
     * Generate and deliver a refreshed CSRF token for the frontend application.
     */
    public function refreshCsrf(Request $request): JsonResponse
    {
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'csrf_token' => csrf_token(),
            'message' => 'CSRF token successfully rotated',
        ]);
    }

    /**
     * Rotate session identifier securely (anti-session fixation).
     */
    public function rotateSession(Request $request): JsonResponse
    {
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Session ID rotated successfully',
            'csrf_token' => csrf_token(),
        ]);
    }
}

