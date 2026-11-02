<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftAndDrawerControlTest extends TestCase
{
    use RefreshDatabase;

    private function setupCashier(): array
    {
        $tenant = Tenant::create([
            'name' => 'Kopi Kawan Indonesia',
            'subdomain' => 'kopikawan-shift-test',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        $outlet = Outlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Outlet Samarinda Central',
            'address' => 'Jl. Pahlawan',
            'phone' => '081211112222',
        ]);

        $cashier = User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet->id,
            'name' => 'Siti Kasir',
            'email' => 'siti@test.kopikawan.com',
            'password' => 'password123',
            'role' => 'cashier',
        ]);

        $product = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Aren',
            'category' => 'Coffee',
            'cost_price' => 5000,
            'selling_price' => 18000,
            'stock' => 50,
            'sku' => 'KOP-TEST',
            'barcode' => '8999999001',
            'is_active' => true,
        ]);

        return compact('tenant', 'outlet', 'cashier', 'product');
    }

    public function test_cashier_can_open_shift_and_verify_active(): void
    {
        $data = $this->setupCashier();

        $response = $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/open', [
                'outlet_id' => $data['outlet']->id,
                'starting_cash' => 150000,
                'notes' => 'Shift Pagi',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.starting_cash', '150000.00')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('shifts', [
            'tenant_id' => $data['tenant']->id,
            'user_id' => $data['cashier']->id,
            'starting_cash' => 150000,
            'status' => 'open',
        ]);

        // Check active shift endpoint
        $activeRes = $this->actingAs($data['cashier'])
            ->getJson('/api/v1/pos/shift/active');

        $activeRes->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.starting_cash', 150000);
    }

    public function test_cashier_cannot_open_two_concurrent_shifts(): void
    {
        $data = $this->setupCashier();

        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/open', [
                'outlet_id' => $data['outlet']->id,
                'starting_cash' => 100000,
            ])
            ->assertCreated();

        // Try second open
        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/open', [
                'outlet_id' => $data['outlet']->id,
                'starting_cash' => 50000,
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['shift']);
    }

    public function test_cash_sales_and_movements_accumulate_correctly(): void
    {
        $data = $this->setupCashier();

        // 1. Open shift with 100,000
        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/open', [
                'outlet_id' => $data['outlet']->id,
                'starting_cash' => 100000,
            ]);

        // 2. Perform checkout with cash
        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/checkout', [
                'outlet_id' => $data['outlet']->id,
                'items' => [
                    ['product_id' => $data['product']->id, 'quantity' => 2],
                ],
                'payment_method' => 'cash',
                'cash_tendered' => 50000,
            ])
            ->assertCreated();

        // 3. Record cash movement (e.g. cash in +20,000)
        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/movement', [
                'type' => 'cash_in',
                'amount' => 20000,
                'reason' => 'Tambah modal uang kembalian',
            ])
            ->assertCreated();

        // 4. Verify Shift state
        $shift = Shift::where('user_id', $data['cashier']->id)->first();
        $this->assertEquals(36000.00, (float) $shift->cash_sales_total); // 2 * 18000
        $this->assertEquals(20000.00, (float) $shift->cash_in_total);
        $this->assertEquals(156000.00, (float) $shift->expected_ending_cash); // 100k + 36k + 20k
    }

    public function test_cashier_can_close_shift_and_discrepancy_is_audited(): void
    {
        $data = $this->setupCashier();

        $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/open', [
                'outlet_id' => $data['outlet']->id,
                'starting_cash' => 100000,
            ]);

        // Close with actual 95,000 (short by 5,000)
        $response = $this->actingAs($data['cashier'])
            ->postJson('/api/v1/pos/shift/close', [
                'actual_ending_cash' => 95000,
                'notes' => 'Kurang 5000 koin',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'closed')
            ->assertJsonPath('data.difference', '-5000.00');

        $this->assertDatabaseHas('audit_logs', [
            'tenant_id' => $data['tenant']->id,
            'action' => 'shift_discrepancy',
        ]);
    }
}
