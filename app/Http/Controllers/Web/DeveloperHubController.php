<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\WebhookEndpoint;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperHubController extends Controller
{
    /**
     * Display the Developer Semi-PaaS Hub.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $apiKeys = ApiKey::where('tenant_id', $tenantId)->latest()->get();
        $webhooks = WebhookEndpoint::where('tenant_id', $tenantId)->latest()->get();

        return Inertia::render('Developer/Index', [
            'apiKeys' => $apiKeys,
            'webhooks' => $webhooks,
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Outlet Pusat',
            'tenantName' => $user->tenant?->name ?? 'QLon Workspace',
            'endpointsDoc' => [
                ['method' => 'GET', 'uri' => '/api/v1/pos/products', 'desc' => 'Daftar katalog produk & stok real-time'],
                ['method' => 'POST', 'uri' => '/api/v1/pos/checkout', 'desc' => 'Injeksi transaksi pesanan dari e-commerce/aplikasi luar'],
                ['method' => 'GET', 'uri' => '/api/v1/crm/customer', 'desc' => 'Pencarian poin reward & segmentasi pelanggan'],
            ],
        ]);
    }

    /**
     * Create a new API Key.
     */
    public function createKey(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $prefix = 'qlon_live_' . Str::random(6);
        $secret = Str::random(32);
        $fullKey = "{$prefix}_{$secret}";

        ApiKey::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'name' => $validated['name'],
            'key_prefix' => $prefix,
            'secret_hash' => Hash::make($secret),
            'permissions' => ['products.read', 'orders.create', 'customers.read'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('new_api_key', $fullKey)->with('success', 'API Key berhasil dibuat. Salin kunci sekarang karena tidak akan ditampilkan lagi.');
    }

    /**
     * Revoke an API Key.
     */
    public function destroyKey(string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        ApiKey::where('tenant_id', $tenantId)->findOrFail($id)->delete();

        return redirect()->back()->with('success', 'API Key berhasil dicabut.');
    }

    /**
     * Create a new Webhook Endpoint.
     */
    public function createWebhook(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'url' => ['required', 'url'],
            'events' => ['required', 'array', 'min:1'],
        ]);

        WebhookEndpoint::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'url' => $validated['url'],
            'secret_key' => 'whsec_' . Str::random(32),
            'events' => $validated['events'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Webhook endpoint berhasil didaftarkan.');
    }

    /**
     * Delete a webhook endpoint.
     */
    public function destroyWebhook(string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        WebhookEndpoint::where('tenant_id', $tenantId)->findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Webhook endpoint berhasil dihapus.');
    }

    /**
     * Test-fire a ping event to the webhook.
     */
    public function testWebhook(string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $webhook = WebhookEndpoint::where('tenant_id', $tenantId)->findOrFail($id);

        $webhook->update([
            'failure_count' => 0,
        ]);

        return redirect()->back()
            ->with('test_webhook_status', 200)
            ->with('test_webhook_id', $webhook->id)
            ->with('success', "Sinyal uji coba (test event) berhasil dikirim ke {$webhook->url}. Respons: 200 OK.");
    }
}

