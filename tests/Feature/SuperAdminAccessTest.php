<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_access_dashboard_and_see_all_data(): void
    {
        $tenant1 = Tenant::create(['name' => 'Kedai Kopi A', 'subdomain' => 'kopi-a']);
        $tenant2 = Tenant::create(['name' => 'Kedai Kopi B', 'subdomain' => 'kopi-b']);

        $superadmin = User::create([
            'tenant_id' => $tenant1->id,
            'name' => 'Master Superadmin',
            'email' => 'master@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $this->assertTrue($superadmin->isSuperAdmin());
        $this->assertTrue($superadmin->canManage());

        $response = $this->actingAs($superadmin)->get('/dashboard');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->where('role', 'superadmin')
        );
    }

    public function test_superadmin_can_toggle_tenant_status(): void
    {
        $tenant = Tenant::create(['name' => 'Kedai Kopi A', 'subdomain' => 'kopi-a', 'is_active' => true]);

        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Root Superadmin',
            'email' => 'root@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->post("/superadmin/tenants/{$tenant->id}/toggle-status");
        $response->assertRedirect();
        $this->assertFalse((bool) $tenant->fresh()->is_active);

        $response = $this->actingAs($superadmin)->post("/superadmin/tenants/{$tenant->id}/toggle-status");
        $response->assertRedirect();
        $this->assertTrue((bool) $tenant->fresh()->is_active);
    }

    public function test_superadmin_can_reply_and_resolve_support_ticket(): void
    {
        $tenant = Tenant::create(['name' => 'Kedai Kopi B', 'subdomain' => 'kopi-b', 'is_active' => true]);

        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Root Superadmin',
            'email' => 'root@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $ticket = \App\Models\SupportTicket::create([
            'tenant_id' => $tenant->id,
            'user_id' => $superadmin->id,
            'ticket_number' => 'TCK-TEST-001',
            'subject' => 'Printer Bluetooth Tidak Terdeteksi',
            'status' => 'open',
            'priority' => 'high',
        ]);

        $response = $this->actingAs($superadmin)->post("/superadmin/tickets/{$ticket->id}/reply", [
            'message' => 'Silakan restart bluetooth printer Anda dan pastikan izin lokasi aktif.',
        ]);
        $response->assertRedirect();
        $this->assertEquals('in_progress', $ticket->fresh()->status);
        $this->assertCount(1, $ticket->messages);

        $response = $this->actingAs($superadmin)->post("/superadmin/tickets/{$ticket->id}/resolve");
        $response->assertRedirect();
        $this->assertEquals('resolved', $ticket->fresh()->status);
    }

    public function test_developer_can_test_webhook_ping(): void
    {
        $tenant = Tenant::create(['name' => 'Kedai Kopi C', 'subdomain' => 'kopi-c', 'is_active' => true]);

        $developer = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Developer User',
            'email' => 'dev@kopikawan.com',
            'password' => bcrypt('password123'),
            'role' => 'developer',
        ]);

        $webhook = \App\Models\WebhookEndpoint::create([
            'tenant_id' => $tenant->id,
            'url' => 'https://example.com/webhook',
            'secret_key' => 'whsec_test',
            'events' => ['order.completed'],
            'is_active' => true,
        ]);

        $response = $this->actingAs($developer)->post("/developer/webhooks/{$webhook->id}/test");
        $response->assertRedirect();
        $response->assertSessionHas('test_webhook_status', 200);
        $this->assertEquals(0, $webhook->fresh()->failure_count);
    }

    public function test_superadmin_without_delegation_cannot_access_tenant_dashboard(): void
    {
        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Platform Superadmin',
            'email' => 'superadmin@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->get('/dashboard');
        $response->assertRedirect('/superadmin');
    }

    public function test_superadmin_can_access_superadmin_command_center(): void
    {
        $tenant = Tenant::create(['name' => 'Tenant 1', 'subdomain' => 'tenant-1', 'is_active' => true]);

        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Platform Superadmin',
            'email' => 'superadmin@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->get('/superadmin');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Superadmin/Dashboard')
            ->has('tenants')
            ->has('activeTokens')
            ->has('tickets')
            ->has('tenantUsers')
        );
    }

    public function test_superadmin_cannot_checkout_pos(): void
    {
        $tenant = Tenant::create(['name' => 'Tenant POS', 'subdomain' => 'pos-tenant', 'is_active' => true]);

        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Platform Superadmin',
            'email' => 'superadmin@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->postJson('/api/v1/pos/checkout', [
            'payment_method' => 'cash',
            'amount_paid' => 50000,
            'items' => [],
        ]);

        $response->assertStatus(403);
    }

    public function test_superadmin_emergency_recover_generates_temporary_password_and_audit_log(): void
    {
        $tenant = Tenant::create(['name' => 'Warung Kopi', 'subdomain' => 'warkop', 'is_active' => true]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Pak Budi',
            'email' => 'budi@warkop.id',
            'password' => bcrypt('oldpassword'),
            'role' => 'owner',
        ]);

        $superadmin = User::create([
            'tenant_id' => null,
            'name' => 'Platform Superadmin',
            'email' => 'superadmin@qlon.id',
            'password' => bcrypt('password123'),
            'role' => 'superadmin',
        ]);

        $response = $this->actingAs($superadmin)->post('/superadmin/emergency/recover', [
            'tenant_id' => $tenant->id,
            'user_id' => $owner->id,
            'verification_method' => 'phone_call',
            'verification_evidence' => 'Konfirmasi panggilan telepon WhatsApp ke nomor terdaftar 081234567890 dan verifikasi data NIB.',
            'action_type' => 'reset_password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('emergency_result');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'emergency.password_reset',
            'tenant_id' => $tenant->id,
            'user_id' => $superadmin->id,
        ]);

        // Verify owner's password has changed
        $this->assertFalse(\Illuminate\Support\Facades\Hash::check('oldpassword', $owner->fresh()->password));
    }
}

