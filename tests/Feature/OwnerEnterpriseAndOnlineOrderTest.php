<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OwnerEnterpriseAndOnlineOrderTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;
    protected Outlet $outlet;
    protected User $owner;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'name' => 'Kopi Kawan Indonesia',
            'subdomain' => 'kopikawan',
            'phone' => '081234567890',
            'is_active' => true,
            'subscription_tier' => Tenant::TIER_FULL,
        ]);

        $this->outlet = Outlet::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Kopi Kawan Senopati',
            'address' => 'Jl. Senopati No. 45, Jakarta Selatan',
            'is_active' => true,
        ]);

        $this->owner = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'owner',
            'email' => 'owner@kopikawan.com',
        ]);

        $this->product = Product::create([
            'tenant_id' => $this->tenant->id,
            'category' => 'Kopi',
            'name' => 'Kopi Susu Gula Aren',
            'sku' => 'KOP-001',
            'selling_price' => 20000,
            'cost_price' => 8000,
            'stock' => 50,
            'is_active' => true,
        ]);
    }

    public function test_owner_can_access_outlets_and_create_outlet(): void
    {
        $response = $this->actingAs($this->owner)->get('/outlets');
        $response->assertStatus(200);

        $createResponse = $this->actingAs($this->owner)->post('/outlets', [
            'name' => 'Kopi Kawan Kemang',
            'address' => 'Jl. Kemang Raya No. 12',
            'phone' => '081299887766',
        ]);
        $createResponse->assertRedirect();
        $this->assertDatabaseHas('outlets', ['name' => 'Kopi Kawan Kemang']);
    }

    public function test_owner_can_access_staff_and_create_staff(): void
    {
        $response = $this->actingAs($this->owner)->get('/staff');
        $response->assertStatus(200);

        $createResponse = $this->actingAs($this->owner)->post('/staff', [
            'name' => 'Budi Kasir',
            'email' => 'budi@kopikawan.com',
            'password' => 'password123',
            'role' => 'cashier',
            'outlet_id' => $this->outlet->id,
        ]);
        $createResponse->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'budi@kopikawan.com', 'role' => 'cashier']);
    }

    public function test_owner_can_view_and_adjust_inventory(): void
    {
        $response = $this->actingAs($this->owner)->get('/inventory');
        $response->assertStatus(200);

        $adjustResponse = $this->actingAs($this->owner)->post('/inventory/adjust', [
            'product_id' => $this->product->id,
            'type' => 'in',
            'quantity' => 25,
            'reason' => 'Restock pengiriman bahan baku',
        ]);
        $adjustResponse->assertRedirect();

        $this->assertEquals(75, $this->product->fresh()->stock);
        $this->assertDatabaseHas('stock_adjustments', [
            'product_id' => $this->product->id,
            'type' => 'in',
            'quantity' => 25,
        ]);
    }

    public function test_owner_can_create_and_validate_promotion_coupon(): void
    {
        $promo = Promotion::create([
            'tenant_id' => $this->tenant->id,
            'code' => 'DISKON10',
            'name' => 'Diskon 10 Persen',
            'type' => 'percentage',
            'value' => 10,
            'min_order_amount' => 30000,
            'max_discount_amount' => 10000,
            'is_active' => true,
        ]);

        $validateResponse = $this->actingAs($this->owner)->postJson('/api/promotions/validate', [
            'code' => 'DISKON10',
            'subtotal' => 50000,
        ]);
        $validateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'discount' => 5000,
            ]);
    }

    public function test_owner_can_access_finance_pnl_page(): void
    {
        $response = $this->actingAs($this->owner)->get('/finance');
        $response->assertStatus(200);
    }

    public function test_public_customer_can_view_menu_and_place_online_order(): void
    {
        // 1. View digital menu
        $menuResponse = $this->get('/kopikawan');
        $menuResponse->assertStatus(200);

        // 2. Place order
        $orderResponse = $this->postJson('/kopikawan/order', [
            'order_type' => 'dine_in',
            'table_number' => '12',
            'customer_name' => 'Dimas Raditya',
            'customer_phone' => '081234567899',
            'payment_method' => 'qris',
            'notes' => 'Gula sedikit saja',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'price' => 20000,
                ],
            ],
        ]);

        $orderResponse->assertStatus(200)
            ->assertJsonStructure(['invoice_number', 'redirect_url']);

        $invoice = $orderResponse->json('invoice_number');
        $order = Order::where('invoice_number', $invoice)->first();
        $this->assertNotNull($order);
        $this->assertEquals('dine_in', $order->order_type);
        $this->assertEquals('12', $order->table_number);
        $this->assertEquals(44400, (int) $order->grand_total);

        // 3. Customer checks live order status
        $statusResponse = $this->get("/order-status/{$invoice}");
        $statusResponse->assertStatus(200);

        // 4. Cashier updates status to accepted and preparing
        $cashier = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'role' => 'cashier',
        ]);

        $updateResponse = $this->actingAs($cashier)->post("/orders/{$order->id}/status", [
            'order_status' => 'preparing',
        ]);
        $updateResponse->assertRedirect();
        $this->assertEquals('preparing', $order->fresh()->order_status);
    }
}
