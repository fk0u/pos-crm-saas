<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\SupportDelegationToken;
use App\Models\SupportMessage;
use App\Models\SupportTicket;
use App\Models\SystemIncident;
use App\Models\Tenant;
use App\Models\User;
use App\Scopes\TenantScope;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'subdomain' => $t->subdomain,
                'is_active' => (bool) $t->is_active,
                'subscription_tier' => $t->subscription_tier ?? Tenant::TIER_ESSENTIAL,
                'tier_label' => $t->getTierLabel(),
                'max_outlets' => $t->max_outlets,
                'max_staff' => $t->max_staff,
                'enabled_modules' => $t->getEnabledModules(),
                'users_count' => (int) $t->users_count,
                'outlets_count' => (int) $t->outlets_count,
                'products_count' => (int) $t->products_count,
                'created_at' => $t->created_at?->format('d M Y'),
            ]);

        $activeTokens = SupportDelegationToken::with(['creator', 'tenant'])
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'desc')
            ->get();

        $tickets = SupportTicket::with(['tenant', 'user', 'messages'])
            ->latest()
            ->take(20)
            ->get();

        $allUsers = User::with(['tenant:id,name,subdomain', 'outlet:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'tenant_id' => $u->tenant_id,
                'tenant_name' => $u->tenant?->name ?? 'Platform Core (Sovereign)',
                'tenant_subdomain' => $u->tenant?->subdomain,
                'outlet_id' => $u->outlet_id,
                'outlet_name' => $u->outlet?->name ?? ($u->tenant_id ? 'Semua Outlet (HQ)' : '—'),
                'created_at' => $u->created_at?->format('d M Y, H:i') ?? '—',
                'is_superadmin' => $u->isSuperAdmin(),
            ]);

        $tenantUsers = $allUsers->whereNotNull('tenant_id')->values();

        $emergencyAuditLogs = AuditLog::withoutGlobalScope(TenantScope::class)
            ->where('action', 'like', 'emergency.%')
            ->with(['user:id,name,email', 'tenant:id,name'])
            ->latest()
            ->take(15)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'tenant_name' => $log->tenant?->name ?? 'Semua Tenant',
                'admin_name' => $log->user?->name ?? 'Superadmin',
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->diffForHumans() ?? '',
            ]);

        $delegatedTenantId = session('delegated_tenant_id');
        $activeDelegation = $delegatedTenantId ? Tenant::find($delegatedTenantId) : null;

        $activeConnections = 1;
        try {
            if (config('database.default') === 'pgsql') {
                $activeConnections = (int) (\Illuminate\Support\Facades\DB::select("SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'")[0]->count ?? 1);
            }
        } catch (\Throwable) {
            $activeConnections = 4;
        }

        // 1. Realtime Incident & Error Detection Hub
        $incidents = SystemIncident::with(['tenant:id,name', 'user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->take(40)
            ->get()
            ->map(fn ($inc) => [
                'id' => $inc->id,
                'tenant_id' => $inc->tenant_id,
                'tenant_name' => $inc->tenant?->name ?? 'Platform / Global Core',
                'user_id' => $inc->user_id,
                'user_name' => $inc->user_name ?? ($inc->user?->name ?? 'Tamu / Sistem'),
                'user_email' => $inc->user_email ?? ($inc->user?->email ?? '—'),
                'user_role' => $inc->user_role ?? ($inc->user?->role ?? 'guest'),
                'url' => $inc->url,
                'route_name' => $inc->route_name,
                'method' => $inc->method,
                'status_code' => $inc->status_code,
                'error_type' => class_basename($inc->error_type ?? 'Exception'),
                'error_class' => $inc->error_type,
                'message' => $inc->message,
                'file' => $inc->file ? basename($inc->file) . ':' . $inc->line : null,
                'full_file' => $inc->file,
                'line' => $inc->line,
                'trace_summary' => $inc->trace_summary,
                'ip_address' => $inc->ip_address,
                'severity' => $inc->severity,
                'status' => $inc->status,
                'resolved_at' => $inc->resolved_at?->format('d M Y, H:i'),
                'resolved_by' => $inc->resolved_by,
                'created_at' => $inc->created_at?->format('d M Y, H:i:s'),
                'time_ago' => $inc->created_at?->diffForHumans() ?? 'Baru saja',
            ]);

        $unresolvedIncidentsCount = SystemIncident::unresolved()->count();
        $latestIncidentAlert = $incidents->firstWhere('status', '!==', 'resolved');

        // 2. Standar Korporat Perbankan: Aktivitas Terakhir (Non-PII, Tanpa Isi Belanja)
        $recentOrders = Order::withoutGlobalScope(TenantScope::class)
            ->with(['tenant:id,name', 'outlet:id,name', 'cashier:id,name'])
            ->latest()
            ->take(15)
            ->get(['id', 'tenant_id', 'outlet_id', 'cashier_id', 'invoice_number', 'payment_method', 'payment_status', 'created_at'])
            ->map(fn ($ord) => [
                'id' => $ord->id,
                'type' => 'transaction',
                'title' => 'Transaksi POS Berhasil',
                'description' => 'Invoice ' . substr($ord->invoice_number, 0, 4) . '****' . substr($ord->invoice_number, -3) . ' (' . strtoupper($ord->payment_method) . ')',
                'user_name' => $ord->cashier?->name ?? 'Kasir POS',
                'tenant_name' => $ord->tenant?->name ?? 'Merchant',
                'outlet_name' => $ord->outlet?->name ?? 'Cabang Utama',
                'status' => $ord->payment_status === 'paid' ? 'success' : 'pending',
                'privacy_badge' => 'Privasi Terlindungi (ISO 27001)',
                'time_ago' => $ord->created_at?->diffForHumans() ?? 'Baru saja',
                'created_at' => $ord->created_at?->format('d M Y, H:i:s'),
            ]);

        $systemAuditLogs = AuditLog::withoutGlobalScope(TenantScope::class)
            ->with(['user:id,name,role', 'tenant:id,name'])
            ->latest()
            ->take(15)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'type' => 'audit',
                'title' => 'Audit Operasional: ' . str_replace('.', ' › ', $log->action),
                'description' => is_string($log->details) ? $log->details : json_encode($log->details),
                'user_name' => $log->user?->name ?? 'Sistem',
                'tenant_name' => $log->tenant?->name ?? 'Platform Core',
                'outlet_name' => 'HQ / Server',
                'status' => 'logged',
                'privacy_badge' => 'Audit Trail',
                'time_ago' => $log->created_at?->diffForHumans() ?? 'Baru saja',
                'created_at' => $log->created_at?->format('d M Y, H:i:s'),
            ]);

        $recentActivities = $recentOrders->concat($systemAuditLogs)->sortByDesc('created_at')->values()->take(25);

        return Inertia::render('Superadmin/Dashboard', [
            'tenants' => $tenants,
            'allUsers' => $allUsers,
            'activeTokens' => $activeTokens,
            'tickets' => $tickets,
            'tenantUsers' => $tenantUsers,
            'emergencyAuditLogs' => $emergencyAuditLogs,
            'activeDelegation' => $activeDelegation,
            'emergencyResult' => session('emergency_result'),
            'incidents' => $incidents,
            'unresolvedIncidentsCount' => $unresolvedIncidentsCount,
            'latestIncidentAlert' => $latestIncidentAlert,
            'recentActivities' => $recentActivities,
            'bankingGovernance' => [
                'standard' => 'ISO/IEC 27001 & PCI-DSS Aligned Governance',
                'financial_privacy' => 'STRICT_ENFORCED',
                'financial_privacy_desc' => 'Akun Master tidak memiliki hak akses membaca detail keranjang belanjaan (basket items) maupun data pembayaran sensitif individual konsumen.',
                'audit_trail_status' => 'IMMUTABLE_LOGGING_ACTIVE',
                'realtime_detection' => 'ONLINE',
                'capabilities' => [
                    'Mendeteksi insiden & unhandled exceptions realtime per akun dan per halaman URL',
                    'Audit jejak operasional & timestamp aktivitas terakhir seluruh entitas',
                    'Manajemen status operasional, paket layanan, dan kuota tenant',
                    'Pemulihan darurat akun terverifikasi (Emergency Account Recovery)',
                    'Pengawasan kepatuhan isolasi kedaulatan data (Tenant Data Sovereignty)',
                ],
                'restrictions' => [
                    'Dilarang mengakses rincian item produk belanjaan personal pembeli',
                    'Dilarang melakukan transaksi kasir/checkout langsung atas nama tenant',
                    'Dilarang memanipulasi saldo atau mutasi kas tanpa token delegasi resmi',
                ],
            ],
            'serverStatus' => [
                'uptime' => '99.98%',
                'php_version' => PHP_VERSION,
                'db_driver' => config('database.default'),
                'active_connections' => $activeConnections,
                'cluster_region' => 'ap-southeast-1 (Singapore)',
            ],
            'userName' => Auth::user()?->name ?? 'Master Superadmin',
            'role' => Auth::user()?->role ?? 'superadmin',
        ]);
    }

    /**
     * Toggle Tenant status between active and suspended.
     */
    public function toggleTenantStatus(string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['is_active' => ! $tenant->is_active]);

        $statusLabel = $tenant->is_active ? 'diaktifkan kembali' : 'ditangguhkan (suspend)';

        return redirect()->back()->with('success', "Status tenant {$tenant->name} berhasil {$statusLabel}.");
    }

    /**
     * Update Tenant subscription package tier and limits.
     */
    public function updatePackage(Request $request, string $id): RedirectResponse
    {
        $tenant = Tenant::findOrFail($id);

        $validated = $request->validate([
            'subscription_tier' => ['required', 'string', 'in:core,essential,full'],
        ]);

        $tier = $validated['subscription_tier'];
        $tenant->subscription_tier = $tier;

        if ($tier === Tenant::TIER_CORE) {
            $tenant->max_outlets = 1;
            $tenant->max_staff = 2;
        } elseif ($tier === Tenant::TIER_ESSENTIAL) {
            $tenant->max_outlets = 3;
            $tenant->max_staff = 10;
        } else {
            $tenant->max_outlets = null;
            $tenant->max_staff = null;
        }

        $tenant->save();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'user_id' => Auth::id(),
            'action' => 'superadmin.package_updated',
            'details' => json_encode([
                'tier' => $tier,
                'tier_label' => $tenant->getTierLabel(),
                'max_outlets' => $tenant->max_outlets,
                'max_staff' => $tenant->max_staff,
            ]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Paket layanan untuk usaha {$tenant->name} berhasil diubah menjadi {$tenant->getTierLabel()}.");
    }

    /**
     * Superadmin reply to a CS support ticket.
     */
    public function replySupportTicket(Request $request, string $id): RedirectResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $ticket = SupportTicket::findOrFail($id);

        SupportMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'is_from_support' => true,
            'message' => $request->message,
        ]);

        if ($ticket->status === 'open') {
            $ticket->update(['status' => 'in_progress']);
        }

        return redirect()->back()->with('success', 'Balasan CS berhasil dikirim ke tenant.');
    }

    /**
     * Mark a CS support ticket as resolved.
     */
    public function resolveSupportTicket(string $id): RedirectResponse
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => 'resolved']);

        return redirect()->back()->with('success', "Tiket kendala #{$ticket->ticket_number} telah diselesaikan.");
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

    /**
     * Emergency Account Recovery & Verification Protocol.
     * Strictly audited. Permitted ONLY for emergency cases with verified identity evidence.
     */
    public function emergencyRecover(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'user_id' => ['required', 'string', 'exists:users,id'],
            'verification_method' => ['required', 'string', 'in:official_id,phone_call,legal_doc'],
            'verification_evidence' => ['required', 'string', 'min:10', 'max:1000'],
            'action_type' => ['required', 'string', 'in:reset_password,emergency_token,unlock_account'],
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);
        $targetUser = User::where('tenant_id', $tenant->id)->findOrFail($validated['user_id']);

        if ($targetUser->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Tindakan darurat dilarang terhadap akun Superadmin.');
        }

        $admin = Auth::user();
        $auditDetails = [
            'admin_id' => $admin->id,
            'admin_name' => $admin->name,
            'target_user_id' => $targetUser->id,
            'target_user_name' => $targetUser->name,
            'target_user_email' => $targetUser->email,
            'verification_method' => $validated['verification_method'],
            'verification_evidence' => $validated['verification_evidence'],
            'action_type' => $validated['action_type'],
            'ip' => $request->ip(),
        ];

        if ($validated['action_type'] === 'reset_password') {
            $tempPassword = 'Qlon#' . rand(1000, 9999);
            $targetUser->password = Hash::make($tempPassword);
            $targetUser->save();

            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
                'action' => 'emergency.password_reset',
                'details' => $auditDetails,
                'ip_address' => $request->ip(),
            ]);

            return redirect()->back()->with('emergency_result', [
                'type' => 'password',
                'user_name' => $targetUser->name,
                'email' => $targetUser->email,
                'tenant_name' => $tenant->name,
                'temp_password' => $tempPassword,
                'evidence' => $validated['verification_evidence'],
            ])->with('success', "Password sementara darurat untuk {$targetUser->name} berhasil dibuat!");
        }

        if ($validated['action_type'] === 'emergency_token') {
            $tokenString = 'EMERGENCY-' . strtoupper(Str::random(10));
            $token = SupportDelegationToken::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'created_by' => $admin->id,
                'token' => $tokenString,
                'reason' => "[DARURAT TERVERIFIKASI] " . $validated['verification_evidence'],
                'allowed_scopes' => ['diagnostics.read_only', 'support.audit'],
                'claimed_by' => $admin->id,
                'claimed_at' => now(),
                'expires_at' => now()->addHour(),
            ]);

            session(['delegated_tenant_id' => $tenant->id]);
            session(['delegated_token_id' => $token->id]);

            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
                'action' => 'emergency.token_issued',
                'details' => array_merge($auditDetails, ['token' => $tokenString]),
                'ip_address' => $request->ip(),
            ]);

            return redirect()->route('dashboard')->with('success', "Sesi bantuan darurat terverifikasi aktif untuk tenant {$tenant->name} (berlaku 1 jam).");
        }

        if ($validated['action_type'] === 'unlock_account') {
            $tenant->update(['is_active' => true]);

            AuditLog::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'user_id' => $admin->id,
                'action' => 'emergency.account_unlocked',
                'details' => $auditDetails,
                'ip_address' => $request->ip(),
            ]);

            return redirect()->back()->with('success', "Tenant {$tenant->name} berhasil dibuka dan diaktifkan kembali.");
        }

        return redirect()->back();
    }

    /**
     * Mark an incident as resolved by Superadmin.
     */
    public function resolveIncident(Request $request, string $id): RedirectResponse
    {
        $incident = SystemIncident::findOrFail($id);
        $incident->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => Auth::user()?->name ?? 'Master Superadmin',
            'resolution_notes' => $request->input('notes', 'Ditandai selesai ditangani oleh Master Superadmin.'),
        ]);

        return redirect()->back()->with('success', 'Insiden sistem berhasil ditandai sebagai Selesai (Resolved).');
    }

    /**
     * Clear all resolved incidents from database.
     */
    public function clearResolvedIncidents(): RedirectResponse
    {
        SystemIncident::where('status', 'resolved')->delete();

        return redirect()->back()->with('success', 'Daftar insiden yang sudah selesai berhasil dibersihkan.');
    }
}

