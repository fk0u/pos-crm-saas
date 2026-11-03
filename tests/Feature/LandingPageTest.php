<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_user_can_view_landing_page(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_public_user_can_view_pricing_page(): void
    {
        $response = $this->get('/pricing');
        $response->assertStatus(200);

        // Alias /harga redirects to /pricing
        $responseAlias = $this->get('/harga');
        $responseAlias->assertRedirect('/pricing');
    }

    public function test_registration_with_selected_tier(): void
    {
        $response = $this->post('/register', [
            'business_name' => 'Kedai Kopi Baru',
            'name' => 'Budi Owner',
            'email' => 'budi@kedaibaru.com',
            'phone' => '081299998888',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'tier' => 'full',
        ]);

        $response->assertRedirect('/dashboard');

        $tenant = Tenant::where('name', 'Kedai Kopi Baru')->first();
        $this->assertNotNull($tenant);
        $this->assertEquals(Tenant::TIER_FULL, $tenant->subscription_tier);
        $this->assertNull($tenant->max_outlets);
        $this->assertNull($tenant->max_staff);
    }
}
