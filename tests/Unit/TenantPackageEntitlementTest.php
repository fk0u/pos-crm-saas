<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Tenant;
use Tests\TestCase;

class TenantPackageEntitlementTest extends TestCase
{
    public function test_core_package_has_basic_modules_only(): void
    {
        $tenant = new Tenant([
            'name' => 'Toko Kelontong Baru',
            'subdomain' => 'kelontong',
            'subscription_tier' => Tenant::TIER_CORE,
            'max_outlets' => 1,
            'max_staff' => 2,
        ]);

        $this->assertTrue($tenant->hasModule(Tenant::MODULE_POS_CASHIER));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_PRODUCTS));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_SALES_REPORT));

        // Advanced features must NOT be available in Core
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_KITCHEN_DISPLAY));
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_FINANCE));
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_DEVELOPER_API));
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_INVENTORY));
    }

    public function test_essential_package_has_inventory_and_staff_modules(): void
    {
        $tenant = new Tenant([
            'name' => 'Kedai Kopi Berkembang',
            'subdomain' => 'kedaikopi',
            'subscription_tier' => Tenant::TIER_ESSENTIAL,
            'max_outlets' => 3,
            'max_staff' => 10,
        ]);

        $this->assertTrue($tenant->hasModule(Tenant::MODULE_POS_CASHIER));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_INVENTORY));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_CASHFLOW));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_STAFF));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_PROMOTIONS));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_CRM));

        // Full solution features are not available
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_KITCHEN_DISPLAY));
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_FINANCE));
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_DEVELOPER_API));
    }

    public function test_full_package_has_all_modules_enabled(): void
    {
        $tenant = new Tenant([
            'name' => 'Restoran Nusantara',
            'subdomain' => 'nusantara',
            'subscription_tier' => Tenant::TIER_FULL,
        ]);

        $this->assertTrue($tenant->hasModule(Tenant::MODULE_POS_CASHIER));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_KITCHEN_DISPLAY));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_ONLINE_ORDERING));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_FINANCE));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_ACCOUNTING_REPORTS));
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_DEVELOPER_API));
    }

    public function test_custom_module_add_on_works(): void
    {
        $tenant = new Tenant([
            'name' => 'Kafe Kecil KDS',
            'subdomain' => 'kafekecil',
            'subscription_tier' => Tenant::TIER_CORE,
            'custom_modules' => [Tenant::MODULE_KITCHEN_DISPLAY],
        ]);

        $this->assertTrue($tenant->hasModule(Tenant::MODULE_POS_CASHIER));
        // Kitchen display is enabled via custom add-on
        $this->assertTrue($tenant->hasModule(Tenant::MODULE_KITCHEN_DISPLAY));
        // Other advanced modules remain disabled
        $this->assertFalse($tenant->hasModule(Tenant::MODULE_FINANCE));
    }
}

