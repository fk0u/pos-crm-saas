<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Promotion;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    private function resolveTenantId(User $user, Request $request): ?string
    {
        if ($user->isSuperAdmin()) {
            return $request->query('tenant_id') ?? session('delegated_tenant_id') ?? Tenant::first()?->id;
        }

        return $user->tenant_id ?? TenantContext::current();
    }

    /**
     * Display the promotions and coupons management center.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $allTenants = $user->isSuperAdmin()
            ? Tenant::select(['id', 'name', 'subdomain'])->get()
            : [];

        $promotions = Promotion::where('tenant_id', $tenantId)
            ->latest()
            ->get()
            ->map(fn ($promo) => [
                'id' => $promo->id,
                'code' => $promo->code,
                'name' => $promo->name,
                'type' => $promo->type,
                'value' => (float) $promo->value,
                'min_order_amount' => (float) $promo->min_order_amount,
                'max_discount_amount' => $promo->max_discount_amount ? (float) $promo->max_discount_amount : null,
                'quota' => (int) $promo->quota,
                'used_count' => (int) $promo->used_count,
                'starts_at' => $promo->starts_at?->format('d/m/Y H:i'),
                'expires_at' => $promo->expires_at?->format('d/m/Y H:i'),
                'is_active' => (bool) $promo->is_active,
                'is_expired' => $promo->expires_at ? now()->gt($promo->expires_at) : false,
            ]);

        $activeCount = $promotions->where('is_active', true)->where('is_expired', false)->count();
        $totalRedemptions = $promotions->sum('used_count');

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Promotions/Index', [
            'promotions' => $promotions,
            'metrics' => [
                'active_count' => $activeCount,
                'total_redemptions' => $totalRedemptions,
                'total_vouchers' => $promotions->count(),
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Semua Outlet',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Store a new promotion / coupon code.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:1'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'quota' => ['required', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $code = strtoupper(trim($validated['code']));

        // Check unique code per tenant
        if (Promotion::where('tenant_id', $tenantId)->where('code', $code)->exists()) {
            return redirect()->back()->with('error', "Kode kupon \"{$code}\" sudah digunakan pada tenant ini.");
        }

        $promotion = Promotion::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'code' => $code,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'max_discount_amount' => $validated['max_discount_amount'] ?? null,
            'quota' => $validated['quota'],
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'promotion.created',
            'details' => json_encode(['code' => $code, 'name' => $promotion->name]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Kupon promosi \"{$code}\" berhasil diterbitkan.");
    }

    /**
     * Update an existing promotion.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $promotion = Promotion::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:1'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'quota' => ['required', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
        ]);

        $promotion->update($validated);

        return redirect()->back()->with('success', "Promosi \"{$promotion->code}\" berhasil diperbarui.");
    }

    /**
     * Delete a promotion.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $promotion = Promotion::where('tenant_id', $tenantId)->findOrFail($id);
        $code = $promotion->code;
        $promotion->delete();

        return redirect()->back()->with('success', "Kupon \"{$code}\" berhasil dihapus.");
    }

    /**
     * Validate coupon code for POS & Online Order checkout.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'tenant_id' => ['nullable', 'string'],
        ]);

        $code = strtoupper(trim($request->input('code')));
        $subtotal = (float) $request->input('subtotal');

        $tenantId = $request->input('tenant_id');
        if (! $tenantId && Auth::check()) {
            $user = Auth::user();
            $tenantId = $this->resolveTenantId($user, $request);
        }

        $promotion = Promotion::where('tenant_id', $tenantId)
            ->where('code', $code)
            ->first();

        if (! $promotion) {
            return response()->json([
                'success' => false,
                'message' => "Kode kupon \"{$code}\" tidak ditemukan.",
            ], 404);
        }

        if (! $promotion->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sedang dinonaktifkan.',
            ], 422);
        }

        if ($promotion->expires_at && now()->gt($promotion->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sudah kedaluwarsa.',
            ], 422);
        }

        if ($promotion->used_count >= $promotion->quota) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota pemakaian kupon ini sudah habis.',
            ], 422);
        }

        if ($subtotal < (float) $promotion->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal belanja untuk menggunakan kupon ini adalah Rp ' . number_format((float) $promotion->min_order_amount, 0, ',', '.'),
            ], 422);
        }

        $discount = $promotion->calculateDiscount($subtotal);

        return response()->json([
            'success' => true,
            'message' => "Kupon \"{$promotion->name}\" berhasil dipasang!",
            'discount' => $discount,
            'promotion' => [
                'code' => $promotion->code,
                'name' => $promotion->name,
                'type' => $promotion->type,
                'value' => (float) $promotion->value,
            ],
        ]);
    }
}

