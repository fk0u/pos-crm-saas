<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeTenantWorld(): array
    {
        $tenantA = Tenant::create([
            'name' => 'Tenant A',
            'subdomain' => 'tenant-a-'.uniqid(),
            'phone' => '081111000001',
            'is_active' => true,
        ]);

        $tenantB = Tenant::create([
            'name' => 'Tenant B',
            'subdomain' => 'tenant-b-'.uniqid(),
            'phone' => '081111000002',
            'is_active' => true,
        ]);

        $outletA1 = Outlet::create([
            'tenant_id' => $tenantA->id,
            'name' => 'A - Outlet 1',
            'address' => 'Jl. A1',
            'phone' => '081111111111',
        ]);

        $outletA2 = Outlet::create([
            'tenant_id' => $tenantA->id,
            'name' => 'A - Outlet 2',
            'address' => 'Jl. A2',
            'phone' => '0811222222222',
        ]);

        $outletB1 = Outlet::create([
            'tenant_id' => $tenantB->id,
            'name' => 'B - Outlet 1',
            'address' => 'Jl. B1',
            'phone' => '0811333333333',
        ]);

        $cashierA = User::create([
            'tenant_id' => $tenantA->id,
            'outlet_id' => $outletA1->id,
            'name' => 'Kasir A',
            'email' => 'kasir-a@tenant-a.test',
            'password' => 'password123',
            'role' => 'cashier',
        ]);

        $ownerA = User::create([
            'tenant_id' => $tenantA->id,
            'outlet_id' => $outletA1->id,
            'name' => 'Owner A',
            'email' => 'owner-a@tenant-a.test',
            'password' => 'password123',
            'role' => 'owner',
        ]);

        $cashierB = User::create([
            'tenant_id' => $tenantB->id,
            'outlet_id' => $outletB1->id,
            'name' => 'Kasir B',
            'email' => 'kasir-b@tenant-b.test',
            'password' => 'password123',
            'role' => 'cashier',
        ]);

        $productA = Product::create([
            'tenant_id' => $tenantA->id,
            'category' => 'Coffee',
            'sku' => 'A-001',
            'name' => 'Es Kopi A',
            'cost_price' => 5000,
            'selling_price' => 20000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $productB = Product::create([
            'tenant_id' => $tenantB->id,
            'category' => 'Coffee',
            'sku' => 'B-001',
            'name' => 'Es Kopi B',
            'cost_price' => 5000,
            'selling_price' => 25000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $customerA = Customer::create([
            'tenant_id' => $tenantA->id,
            'phone' => '081200000001',
            'name' => 'Budi A',
            'loyalty_points' => 2,
            'total_spend' => 20000,
            'visit_count' => 1,
        ]);

        return compact(
            'tenantA', 'tenantB', 'outletA1', 'outletA2', 'outletB1',
            'cashierA', 'ownerA', 'cashierB', 'productA', 'productB', 'customerA',
        );
    }

    private function checkoutPayload(string $productId, int $qty = 1, array $extra = []): array
    {
        return array_merge([
            'items' => [['product_id' => $productId, 'quantity' => $qty]],
            'discount_amount' => 0,
            'tax_amount' => 0,
            'points_redeemed' => 0,
            'payment_method' => 'cash',
            'cash_tendered' => 200000,
        ], $extra);
    }

    public function test_unauthenticated_users_cannot_hit_pos_crm_owner_endpoints(): void
    {
        $this->makeTenantWorld();

        $this->getJson('/api/v1/pos/products')->assertStatus(401);
        $this->postJson('/api/v1/pos/checkout', [])->assertStatus(401);
        $this->getJson('/api/v1/crm/customer/lookup?phone=081200000001')->assertStatus(401);
        $this->getJson('/api/v1/owner/live-metrics')->assertStatus(401);
    }

    public function test_stock_cannot_be_oversold(): void
    {
        $w = $this->makeTenantWorld();

        $cashierA = $w['cashierA'];
        $product = $w['productA']->fresh();

        $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 11))
            ->assertStatus(422)
            ->assertJsonValidationErrors('items')
            ->assertJsonFragment(['message' => 'Stok produk Es Kopi A tidak mencukupi']);

        $this->assertSame(10, $this->refreshProduct($product->id)->stock);
        // Nothing must have been recorded for a failed checkout.
        $this->assertSame(0, $this->orderCount($cashierA->tenant_id));
    }

    public function test_loyalty_points_cannot_be_redeemed_beyond_balance(): void
    {
        $w = $this->makeTenantWorld();
        $tenantA = $w['tenantA'];
        $cashierA = $w['cashierA'];
        $productA = $w['productA'];
        $customerA = $w['customerA'];

        $product = $this->refreshProduct($productA->id);

        // Balance = 2 poin; trying to redeem 10 must 422.
        $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 1, [
                'customer_phone' => $customerA->phone,
                'customer_name' => $customerA->name,
                'points_redeemed' => 10,
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('points_redeemed')
            ->assertJsonFragment(['message' => 'Saldo poin tidak mencukupi.']);

        // Balance is untouched after the rejected attempt (transaction rolled back).
        $this->assertSame(2, (int) $customerA->fresh()->loyalty_points);
        $this->assertSame(10, $this->refreshProduct($product->id)->stock);
        $this->assertSame(0, $this->orderCount($tenantA->id));

        // Redeeming within balance is allowed.
        $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 1, [
                'customer_phone' => $customerA->phone,
                'customer_name' => $customerA->name,
                'points_redeemed' => 2,
            ]))
            ->assertStatus(201);

        $this->assertSame(9, $this->refreshProduct($product->id)->stock);
        // Spent 2, earned 1 back (1 pt per Rp 10.000).
        $this->assertSame(1, (int) $customerA->fresh()->loyalty_points);
    }

    public function test_cashier_cannot_submit_an_outlet_from_another_tenant(): void
    {
        $w = $this->makeTenantWorld();
        $outletB1 = $w['outletB1'];
        $cashierA = $w['cashierA'];
        $productB = $w['productB'];

        $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($productB->id, 1, [
                'outlet_id' => $outletB1->id,
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('outlet_id');

        $this->assertSame(0, $this->orderCount($cashierA->tenant_id));
    }

    public function test_cashier_cannot_submit_another_outlet_of_own_tenant(): void
    {
        $w = $this->makeTenantWorld();
        $outletA2 = $w['outletA2'];
        $cashierA = $w['cashierA'];
        $productA = $w['productA'];

        $product = $this->refreshProduct($productA->id);

        $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 1, [
                'outlet_id' => $outletA2->id,
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('outlet_id');
    }

    public function test_cashier_defaults_to_own_outlet_when_outlet_id_omitted(): void
    {
        $w = $this->makeTenantWorld();
        $tenantA = $w['tenantA'];
        $outletA1 = $w['outletA1'];
        $cashierA = $w['cashierA'];
        $productA = $w['productA'];
        $customerA = $w['customerA'];

        $product = $this->refreshProduct($productA->id);

        $response = $this->actingAs($cashierA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 1, [
                'customer_phone' => $customerA->phone,
            ]))
            ->assertStatus(201);

        $response->assertJsonPath('data.outlet_id', $outletA1->id);
        $this->assertSame(1, $this->orderCount($tenantA->id));
    }

    public function test_owner_may_transact_in_any_outlet_of_their_tenant(): void
    {
        $w = $this->makeTenantWorld();
        $tenantA = $w['tenantA'];
        $outletA2 = $w['outletA2'];
        $ownerA = $w['ownerA'];
        $productA = $w['productA'];

        $product = $this->refreshProduct($productA->id);

        $this->actingAs($ownerA)
            ->postJson('/api/v1/pos/checkout', $this->checkoutPayload($product->id, 1, [
                'outlet_id' => $outletA2->id,
            ]))
            ->assertStatus(201)
            ->assertJsonPath('data.outlet_id', $outletA2->id);

        $this->assertSame(1, $this->orderCount($tenantA->id));
    }

    public function test_product_catalog_is_isolated_per_tenant(): void
    {
        $w = $this->makeTenantWorld();
        $cashierA = $w['cashierA'];
        $productA = $w['productA'];
        $productB = $w['productB'];

        $ids = array_column(
            $this->actingAs($cashierA)
                ->getJson('/api/v1/pos/products')
                ->assertOk()
                ->json('data'),
            'id',
        );

        $this->assertNotContains($productB->id, $ids);
        $this->assertContains($productA->id, $ids);
        $this->assertCount(1, $ids);
    }

    private function refreshProduct(string $id): ?Product
    {
        return Product::withoutGlobalScopes()->where('id', $id)->first();
    }

    private function orderCount(string $tenantId): int
    {
        return Order::withoutGlobalScopes()->where('tenant_id', $tenantId)->count();
    }
}
