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

        // 4. Seed Products with curated high quality cafe images
        $products = [
            [
                'name' => 'Es Kopi Susu Gula Aren',
                'category' => 'Coffee',
                'cost_price' => 8000,
                'selling_price' => 18000,
                'stock' => 150,
                'sku' => 'KOP-001',
                'barcode' => '8991001001',
                'image_url' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Americano Iced',
                'category' => 'Coffee',
                'cost_price' => 5000,
                'selling_price' => 15000,
                'stock' => 200,
                'sku' => 'KOP-002',
                'barcode' => '8991001002',
                'image_url' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Matcha Latte Premium',
                'category' => 'Non-Coffee',
                'cost_price' => 10000,
                'selling_price' => 22000,
                'stock' => 80,
                'sku' => 'NC-001',
                'barcode' => '8991001003',
                'image_url' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Croissant Butter Artisan',
                'category' => 'Pastry',
                'cost_price' => 12000,
                'selling_price' => 24000,
                'stock' => 45,
                'sku' => 'PAS-001',
                'barcode' => '8991001004',
                'image_url' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Pain Au Chocolat',
                'category' => 'Pastry',
                'cost_price' => 14000,
                'selling_price' => 26000,
                'stock' => 30,
                'sku' => 'PAS-002',
                'barcode' => '8991001005',
                'image_url' => 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Caramel Cold Brew Bottle',
                'category' => 'Coffee',
                'cost_price' => 16000,
                'selling_price' => 32000,
                'stock' => 70,
                'sku' => 'KOP-005',
                'barcode' => '8991001006',
                'image_url' => 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
            ],
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
