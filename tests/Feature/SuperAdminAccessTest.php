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
}

