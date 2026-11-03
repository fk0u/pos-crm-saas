<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SupportDelegationToken;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DelegationTokenController extends Controller
{
    /**
     * Store a new support delegation token created by business Owner.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'duration_hours' => ['required', 'integer', 'min:1', 'max:72'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $tokenString = 'QLON-ASSIST-' . strtoupper(Str::random(12));

        $token = SupportDelegationToken::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'created_by' => $user->id,
            'token' => $tokenString,
            'reason' => $validated['reason'],
            'allowed_scopes' => ['transactions.view', 'pos.diagnostics', 'stock.audit'],
            'expires_at' => now()->addHours((int) $validated['duration_hours']),
        ]);

        return redirect()->back()->with('success', "Token Bantuan [{$tokenString}] berhasil dibuat. Berlaku selama {$validated['duration_hours']} jam.");
    }

    /**
     * Revoke an active support delegation token.
     */
    public function destroy(string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $token = SupportDelegationToken::where('tenant_id', $tenantId)->findOrFail($id);
        $token->delete();

        return redirect()->back()->with('success', 'Token akses bantuan berhasil dicabut secara instan.');
    }
}
