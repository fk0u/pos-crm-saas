<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModularTierAndExportTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $coreTenant;
    protected User $coreOwner;

    protected Tenant $fullTenant;
    protected User $fullOwner;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Core Tenant (1 outlet, max 2 staff, core modules only)
        $this->coreTenant = Tenant::create([
            'name' => 'Warung Kopi Sederhana',
            'subdomain' => 'warkop',
            'is_active' => true,
            'subscription_tier' => Tenant::TIER_CORE,
            'max_outlets' => 1,
            'max_staff' => 2,
        ]);

        Outlet::create([
            'tenant_id' => $this->coreTenant->id,
            'name' => 'Warkop Pusat',
            'is_active' => true,
        ]);

        $this->coreOwner = User::factory()->create([
            'tenant_id' => $this->coreTenant->id,
            'role' => 'owner',
            'email' => 'owner@warkop.id',
        ]);

        // 2. Full Tenant (unlimited)
        $this->fullTenant = Tenant::create([
            'name' => 'Resto Bintang Lima',
            'subdomain' => 'bintanglima',
            'is_active' => true,
            'subscription_tier' => Tenant::TIER_FULL,
            'max_outlets' => null,
            'max_staff' => null,
        ]);

        Outlet::create([
            'tenant_id' => $this->fullTenant->id,
            'name' => 'Cabang Sudirman',
            'is_active' => true,
        ]);

        $this->fullOwner = User::factory()->create([
            'tenant_id' => $this->fullTenant->id,
            'role' => 'owner',
            'email' => 'owner@bintanglima.id',
        ]);
    }

    public function test_core_tier_cannot_access_inventory_or_finance(): void
    {
        // Core tier accessing inventory should be redirected
        $responseInv = $this->actingAs($this->coreOwner)->get('/inventory');
        $responseInv->assertRedirect();
        $responseInv->assertSessionHas('error');

        // Core tier accessing finance should be redirected
        $responseFin = $this->actingAs($this->coreOwner)->get('/finance');
        $responseFin->assertRedirect();
        $responseFin->assertSessionHas('error');
    }

    public function test_full_tier_can_access_all_modules(): void
    {
        $responseInv = $this->actingAs($this->fullOwner)->get('/inventory');
        $responseInv->assertStatus(200);

        $responseFin = $this->actingAs($this->fullOwner)->get('/finance');
        $responseFin->assertStatus(200);

        $responseKitchen = $this->actingAs($this->fullOwner)->get('/kitchen');
        $responseKitchen->assertStatus(200);
    }

    public function test_core_tier_enforces_outlet_limit(): void
    {
        // Already has 1 outlet, attempting to add 2nd should fail
        $response = $this->actingAs($this->coreOwner)->post('/outlets', [
            'name' => 'Cabang Kedua',
            'address' => 'Jl. Baru No. 2',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertEquals(1, Outlet::where('tenant_id', $this->coreTenant->id)->count());
    }

    public function test_core_tier_enforces_staff_limit(): void
    {
        // 1 staff already exists (the owner). Add 1 cashier (total 2 = limit reached)
        User::create([
            'tenant_id' => $this->coreTenant->id,
            'name' => 'Kasir 1',
            'email' => 'kasir1@warkop.id',
            'password' => bcrypt('secret123'),
            'role' => 'cashier',
        ]);

        // Attempting to add 3rd staff should fail
        $response = $this->actingAs($this->coreOwner)->post('/staff', [
            'name' => 'Kasir 2',
            'email' => 'kasir2@warkop.id',
            'password' => 'secret123',
            'role' => 'cashier',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertEquals(2, User::where('tenant_id', $this->coreTenant->id)->count());
    }

    public function test_excel_and_pdf_export_endpoints_work(): void
    {
        $responseExcel = $this->actingAs($this->fullOwner)->get('/reports/export-excel');
        $responseExcel->assertStatus(200);
        $this->assertStringContainsString('text/csv', $responseExcel->headers->get('content-type'));

        $responsePdf = $this->actingAs($this->fullOwner)->get('/reports/export-pdf');
        $responsePdf->assertStatus(200);
        $responsePdf->assertSee('Laporan Resmi Penjualan');

        $responseTxExcel = $this->actingAs($this->fullOwner)->get('/transactions/export-excel');
        $responseTxExcel->assertStatus(200);

        $responseTxPdf = $this->actingAs($this->fullOwner)->get('/transactions/export-pdf');
        $responseTxPdf->assertStatus(200);
        $responseTxPdf->assertSee('Buku Catatan Transaksi');
    }
}
