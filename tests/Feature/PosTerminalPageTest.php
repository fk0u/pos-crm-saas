<?php

namespace Tests\Feature;

use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosTerminalPageTest extends TestCase
{
    use RefreshDatabase;

    private function cashier(): User
    {
        $tenant = Tenant::create([
            'name' => 'Kopi Kawan Indonesia',
            'subdomain' => 'kopikawan-test',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $outlet = Outlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Kawan - Samarinda Central',
            'address' => 'Jl. Pahlawan No. 12, Samarinda',
            'phone' => '081211112222',
        ]);

        return User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet->id,
            'name' => 'Siti Aminah (Kasir)',
            'email' => 'kasir@test.kopikawan.com',
            'password' => 'password123',
            'role' => 'cashier',
        ]);
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/pos')->assertRedirect(route('login'));
    }

    public function test_cashier_sees_pos_terminal(): void
    {
        $user = $this->cashier();

        $response = $this->actingAs($user)->get('/pos');

        $response->assertOk()
            ->assertSee('No. WhatsApp Pelanggan')
            ->assertSee($user->outlet->name)
            ->assertSee('Kembalian')
            ->assertSee('Cetak Struk');
    }

    public function test_login_flow_redirects_to_pos(): void
    {
        $user = $this->cashier();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('pos.terminal'));
        $this->assertAuthenticatedAs($user);
    }
}
