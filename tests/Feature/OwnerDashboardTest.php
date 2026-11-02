<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function world(): array
    {
        $tenant = Tenant::create([
            'name' => 'Kopi Kawan Indonesia',
            'subdomain' => 'kopikawan-'.uniqid(),
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $outlet = Outlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Kawan - Samarinda Central',
            'address' => 'Jl. Pahlawan No. 12, Samarinda',
            'phone' => '081211112222',
        ]);

        $makeUser = function (string $role, string $slug) use ($tenant, $outlet): User {
            return User::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet->id,
                'name' => ucfirst($role).' '.$slug,
                'email' => $slug.'@kopikawan.test',
                'password' => 'password123',
                'role' => $role,
            ]);
        };

        return [
            'tenant' => $tenant,
            'outlet' => $outlet,
            'owner' => $makeUser('owner', 'owner'),
            'cashier' => $makeUser('cashier', 'kasir'),
            'manager' => $makeUser('manager', 'manager'),
            'superadmin' => $makeUser('superadmin', 'superadmin'),
        ];
    }

    private function order(User $user, Outlet $outlet, string $total = '50000'): Order
    {
        return Order::create([
            'tenant_id' => $user->tenant_id,
            'outlet_id' => $outlet->id,
            'cashier_id' => $user->id,
            'invoice_number' => 'INV/'.uniqid(),
            'subtotal' => $total,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'grand_total' => $total,
            'points_earned' => 0,
            'points_redeemed' => 0,
            'payment_method' => 'cash',
            'payment_status' => 'paid',
        ]);
    }

    private function customer(string $tenantId): Customer
    {
        return Customer::create([
            'tenant_id' => $tenantId,
            'phone' => '08129876543'.random_int(10, 99),
            'name' => 'Budi Santoso',
            'loyalty_points' => 35,
            'total_spend' => 350000,
            'visit_count' => 8,
            'last_visit_at' => now()->subDays(2),
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/dashboard')->assertRedirect(route('login'));
    }

    public function test_cashier_is_redirected_to_pos(): void
    {
        $w = $this->world();

        $this->actingAs($w['cashier'])
            ->get('/dashboard')
            ->assertRedirect(route('pos.terminal'));

        $this->actingAs($w['cashier'])
            ->getJson('/dashboard/recent')
            ->assertStatus(403);
    }

    public function test_cashier_cannot_access_owner_live_metrics_api(): void
    {
        $w = $this->world();

        $this->actingAs($w['cashier'])
            ->getJson('/api/v1/owner/live-metrics')
            ->assertStatus(403)
            ->assertJsonFragment(['message' => 'Akses metrik bisnis hanya untuk owner dan manager.']);

        $this->actingAs($w['owner'])
            ->getJson('/api/v1/owner/live-metrics')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_owner_sees_the_dashboard(): void
    {
        [$w, $order] = $this->worldWithOrder();
        $this->customer($w['tenant']->id);

        $this->actingAs($w['owner'])
            ->get('/dashboard')
            ->assertOk()
            ->assertSee('Omzet Hari Ini')
            ->assertSee('Performa Outlet')
            ->assertSee('Live Sales')
            ->assertSee('CRM Customer Monitoring')
            ->assertSee($order->invoice_number)
            ->assertSee($w['owner']->name)
            ->assertSee($w['tenant']->name);

        $this->actingAs($w['owner'])
            ->getJson('/dashboard/recent')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.invoice_number', $order->invoice_number);
    }

    public function test_manager_and_superadmin_must_access_dashboard(): void
    {
        $w = $this->world();

        foreach (['manager', 'superadmin'] as $role) {
            $this->actingAs($w[$role])
                ->get('/dashboard')
                ->assertOk();
        }
    }

    public function test_ticket_ticker_payload_shape(): void
    {
        [$w, $order] = $this->worldWithOrder();

        $payload = $this->actingAs($w['owner'])
            ->getJson('/dashboard/recent')
            ->json('data.0');

        foreach (['invoice_number', 'outlet', 'cashier', 'customer', 'grand_total', 'payment_method', 'created_at'] as $key) {
            $this->assertArrayHasKey($key, $payload);
        }

        $this->assertSame($w['outlet']->name, $payload['outlet']);
    }

    public function test_customer_search_filters_by_name_and_phone(): void
    {
        $w = $this->world();
        $member = $this->customer($w['tenant']->id);
        $member->update(['name' => 'Siti Rahma', 'phone' => '081599900011']);

        $this->actingAs($w['owner'])
            ->get('/dashboard?q=Siti')
            ->assertOk()
            ->assertSee('Siti Rahma')
            ->assertSee('081599900011');

        $this->actingAs($w['owner'])
            ->get('/dashboard?q=tidak-ada-gx')
            ->assertOk()
            ->assertSee('Tidak ada pelanggan');
    }

    public function test_owner_login_lands_on_dashboard_and_cashier_on_pos(): void
    {
        $w = $this->world();

        $this->post('/login', [
            'email' => $w['owner']->email,
            'password' => 'password123',
        ])->assertRedirect(route('dashboard'));

        $this->post('/login', [
            'email' => $w['cashier']->email,
            'password' => 'password123',
        ])->assertRedirect(route('pos.terminal'));
    }

    private function worldWithOrder(): array
    {
        $w = $this->world();
        $order = $this->order($w['owner'], $w['outlet']);

        return [$w, $order];
    }
}
