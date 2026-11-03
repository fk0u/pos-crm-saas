<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppInvoiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_whatsapp_service_normalizes_indonesian_phone_numbers(): void
    {
        $service = new WhatsAppService();

        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('081234567890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('+6281234567890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('6281234567890'));
        $this->assertEquals('6281234567890', $service->normalizePhoneNumber('0812-3456-7890'));
    }

    public function test_whatsapp_service_generates_receipt_message_and_url(): void
    {
        $tenant = Tenant::create(['name' => 'Kopi Mantap', 'subdomain' => 'kopimantap']);
        $outlet = Outlet::create(['tenant_id' => $tenant->id, 'name' => 'Outlet Pusat']);
        $cashier = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Budi Kasir',
            'email' => 'budi@kopimantap.com',
            'password' => bcrypt('password123'),
            'role' => 'cashier',
        ]);
        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'name' => 'Ani Lestari',
            'phone' => '081299998888',
        ]);
        $product = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Susu Aren',
            'selling_price' => 18000,
            'cost_price' => 8000,
            'stock' => 50,
        ]);

        $order = Order::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet->id,
            'cashier_id' => $cashier->id,
            'customer_id' => $customer->id,
            'invoice_number' => 'INV-TEST-001',
            'subtotal' => 18000,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'grand_total' => 18000,
            'points_earned' => 1,
            'payment_method' => 'qris',
            'payment_status' => 'paid',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_cost_price' => 8000,
            'unit_selling_price' => 18000,
            'subtotal' => 18000,
        ]);

        $this->actingAs($cashier);
        $service = new WhatsAppService();
        $message = $service->generateReceiptMessage($order);

        $this->assertStringContainsString('Kopi Mantap', $message);
        $this->assertStringContainsString('INV-TEST-001', $message);
        $this->assertStringContainsString('Kopi Susu Aren', $message);
        $this->assertStringContainsString('Rp 18.00', $message);
        $this->assertStringContainsString('Ani Lestari', $message);

        $url = $service->generateWhatsAppUrl($customer->phone, $message);
        $this->assertStringStartsWith('https://wa.me/6281299998888?text=', $url);

        // Test web controller redirect
        $response = $this->get("/invoices/{$order->id}/whatsapp");
        $response->assertRedirect($url);

        // Test unauthenticated customer can view receipt page
        auth()->logout();
        $receiptResponse = $this->get("/invoices/{$order->id}/receipt");
        $receiptResponse->assertStatus(200);
        $receiptResponse->assertSee('INV-TEST-001');
        $receiptResponse->assertSee('Kopi Mantap');
    }
}
