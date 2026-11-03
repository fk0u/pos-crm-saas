<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Demo Tenant (Kopi Kawan UMKM)
        $tenant = Tenant::create([
            'name' => 'Kopi Kawan Indonesia',
            'subdomain' => 'kopikawan',
            'phone' => '081234567890',
            'is_active' => true,
        ]);

        // 2. Create Outlets
        $outlet1 = Outlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Kawan - Samarinda Central',
            'address' => 'Jl. Pahlawan No. 12, Samarinda',
            'phone' => '081211112222',
        ]);

        $outlet2 = Outlet::create([
            'tenant_id' => $tenant->id,
            'name' => 'Kopi Kawan - Samarinda Square',
            'address' => 'Mall Samarinda Square Lt. 1',
            'phone' => '081233334444',
        ]);

        // 3. Create Users (Master Administrator, Owner & Cashier)
        $master = User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet1->id,
            'name' => 'Master Administrator (Superadmin)',
            'email' => 'master@qlon.id',
            'password' => Hash::make('password123'),
            'role' => 'superadmin',
        ]);

        $owner = User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet1->id,
            'name' => 'Hendra Setiawan (Owner)',
            'email' => 'owner@kopikawan.com',
            'password' => Hash::make('password123'),
            'role' => 'owner',
        ]);

        $cashier = User::create([
            'tenant_id' => $tenant->id,
            'outlet_id' => $outlet1->id,
            'name' => 'Siti Aminah (Kasir)',
            'email' => 'kasir@kopikawan.com',
            'password' => Hash::make('password123'),
            'role' => 'cashier',
        ]);

        // 4. Seed Products
        $products = [
            ['name' => 'Es Kopi Susu Gula Aren', 'category' => 'Coffee', 'cost_price' => 8000, 'selling_price' => 18000, 'stock' => 150, 'sku' => 'KOP-001', 'barcode' => '8991001001'],
            ['name' => 'Americano Iced', 'category' => 'Coffee', 'cost_price' => 5000, 'selling_price' => 15000, 'stock' => 200, 'sku' => 'KOP-002', 'barcode' => '8991001002'],
            ['name' => 'Matcha Latte', 'category' => 'Non-Coffee', 'cost_price' => 10000, 'selling_price' => 22000, 'stock' => 80, 'sku' => 'NC-001', 'barcode' => '8991001003'],
            ['name' => 'Croissant Butter', 'category' => 'Pastry', 'cost_price' => 12000, 'selling_price' => 24000, 'stock' => 45, 'sku' => 'PAS-001', 'barcode' => '8991001004'],
            ['name' => 'Pain Au Chocolat', 'category' => 'Pastry', 'cost_price' => 14000, 'selling_price' => 26000, 'stock' => 30, 'sku' => 'PAS-002', 'barcode' => '8991001005'],
        ];

        foreach ($products as $prod) {
            Product::create(array_merge($prod, ['tenant_id' => $tenant->id]));
        }

        // 5. Seed CRM Customers
        Customer::create([
            'tenant_id' => $tenant->id,
            'phone' => '081298765432',
            'name' => 'Budi Santoso',
            'loyalty_points' => 35,
            'total_spend' => 350000,
            'visit_count' => 8,
            'last_visit_at' => now()->subDays(2),
        ]);
    }
}
