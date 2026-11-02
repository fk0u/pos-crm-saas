<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_registration_page(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_owner_can_self_register_and_create_workspace(): void
    {
        $response = $this->post('/register', [
            'business_name' => 'Kedai Kopi Bahagia',
            'name' => 'Bambang Sudiro',
            'email' => 'bambang@kopibahagia.com',
            'phone' => '081299887766',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/dashboard');

        // Verify User was created
        $user = User::where('email', 'bambang@kopibahagia.com')->first();
        $this->assertNotNull($user);
        $this->assertSame('owner', $user->role);
        $this->assertSame('Bambang Sudiro', $user->name);

        // Verify Tenant was created
        $tenant = Tenant::find($user->tenant_id);
        $this->assertNotNull($tenant);
        $this->assertSame('Kedai Kopi Bahagia', $tenant->name);

        // Verify User is authenticated
        $this->assertAuthenticatedAs($user);
    }
}
