<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Domain\Pos\Actions\ProcessCheckoutAction;
use App\Domain\Pos\DTOs\CartItemData;
use App\Domain\Pos\DTOs\CheckoutData;
use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Services\SalesMetricsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class EventConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_decrements_stock_atomically_and_invalidates_cache(): void
    {
        $tenant = Tenant::create(['name' => 'Event Booth Kopi', 'subdomain' => 'event-kopi']);
        $outlet = Outlet::create(['tenant_id' => $tenant->id, 'name' => 'Booth A']);
        $cashier = User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet->id,
            'name' => 'Kasir Event 1',
            'email' => 'kasir1@event.com',
            'password' => bcrypt('password123'),
            'role' => 'cashier',
        ]);
        $product = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'Signature Event Coffee',
            'selling_price' => 25000,
            'cost_price' => 10000,
            'stock' => 100,
            'is_active' => true,
        ]);

        // Pre-warm product cache
        $this->actingAs($cashier)->getJson('/api/v1/pos/products')
            ->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Signature Event Coffee');

        $this->assertTrue(Cache::has("pos_products_{$tenant->id}_all"));

        // Execute checkout
        $checkoutAction = app(ProcessCheckoutAction::class);
        $data = new CheckoutData(
            outletId: $outlet->id,
            shiftId: null,
            items: [new CartItemData(productId: $product->id, quantity: 5)],
            customerPhone: '08123456789',
            customerName: 'Customer Event',
            discountAmount: 0,
            taxAmount: 0,
            pointsRedeemed: 0,
            paymentMethod: 'cash',
            cashTendered: 150000,
            paymentDetails: null,
            notes: 'Event purchase',
        );

        $result = $checkoutAction->execute($cashier, $data);

        $this->assertEquals(125000, $result['grand_total']);
        $this->assertEquals(25000, $result['change_due']);

        // Assert stock decremented to 95
        $product->refresh();
        $this->assertEquals(95, $product->stock);

        // Assert cache for products was cleared for consistency
        $this->assertFalse(Cache::has("pos_products_{$tenant->id}_all"));
    }

    public function test_sales_metrics_uses_short_lived_cache_for_high_event_load(): void
    {
        $tenant = Tenant::create(['name' => 'Event Booth Kopi 2', 'subdomain' => 'event-kopi-2']);
        $metricsService = app(SalesMetricsService::class);

        $summary1 = $metricsService->summary($tenant->id);
        $this->assertTrue(Cache::has("sales_metrics_summary_{$tenant->id}"));

        $summary2 = $metricsService->summary($tenant->id);
        $this->assertEquals($summary1, $summary2);
    }
}

