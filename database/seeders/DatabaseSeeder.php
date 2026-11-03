<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Shift;
use App\Models\ShiftMovement;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create or Find Demo Tenant (Kopi Kawan UMKM)
        $tenant = Tenant::firstOrCreate(
            ['subdomain' => 'kopikawan'],
            [
                'name' => 'Kopi Kawan Indonesia',
                'phone' => '081234567890',
                'is_active' => true,
            ]
        );

        // 2. Create Outlets
        $outlet1 = Outlet::firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Kopi Kawan - Samarinda Central'],
            [
                'address' => 'Jl. Pahlawan No. 12, Samarinda',
                'phone' => '081211112222',
            ]
        );

        $outlet2 = Outlet::firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Kopi Kawan - Samarinda Square'],
            [
                'address' => 'Mall Samarinda Square Lt. 1',
                'phone' => '081233334444',
            ]
        );

        // 3. Create Users (Master Administrator, Owner & Cashier)
        $master = User::firstOrCreate(
            ['email' => 'master@qlon.id'],
            [
                'tenant_id' => null,
                'outlet_id' => null,
                'name' => 'Master Administrator (Superadmin)',
                'password' => Hash::make('password123'),
                'role' => 'superadmin',
            ]
        );

        $owner = User::firstOrCreate(
            ['email' => 'owner@kopikawan.com'],
            [
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet1->id,
                'name' => 'Hendra Setiawan (Owner)',
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]
        );

        $cashier = User::firstOrCreate(
            ['email' => 'kasir@kopikawan.com'],
            [
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet1->id,
                'name' => 'Siti Aminah (Kasir)',
                'password' => Hash::make('password123'),
                'role' => 'cashier',
            ]
        );

        $developer = User::firstOrCreate(
            ['email' => 'developer@kopikawan.com'],
            [
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet1->id,
                'name' => 'Budi Developer (PaaS)',
                'password' => Hash::make('password123'),
                'role' => 'developer',
            ]
        );

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
                'name' => 'Matcha Latte Frappe',
                'category' => 'Non-Coffee',
                'cost_price' => 12000,
                'selling_price' => 24000,
                'stock' => 80,
                'sku' => 'NON-001',
                'barcode' => '8991001003',
                'image_url' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'name' => 'Croissant Butter Original',
                'category' => 'Pastry',
                'cost_price' => 11000,
                'selling_price' => 22000,
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
            Product::firstOrCreate(
                ['tenant_id' => $tenant->id, 'sku' => $prod['sku']],
                array_merge($prod, ['tenant_id' => $tenant->id])
            );
        }

        // 5. Seed CRM Customers
        Customer::firstOrCreate(
            ['tenant_id' => $tenant->id, 'phone' => '081298765432'],
            [
                'name' => 'Budi Santoso',
                'loyalty_points' => 35,
                'total_spend' => 350000,
                'visit_count' => 8,
                'last_visit_at' => now()->subDays(2),
            ]
        );

        // 6. Seed Realistic Shifts & Cashflow Movements if empty
        if (Shift::where('tenant_id', $tenant->id)->count() === 0) {
            // 6a. Closed Shift from Yesterday
            $yesterdayShift = Shift::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet1->id,
                'user_id' => $cashier->id,
                'opened_at' => now()->subDay()->setTime(8, 0, 0),
                'closed_at' => now()->subDay()->setTime(17, 30, 0),
                'starting_cash' => 300000,
                'cash_sales_total' => 1850000,
                'non_cash_sales_total' => 1420000,
                'cash_in_total' => 100000,
                'cash_out_total' => 75000,
                'expected_ending_cash' => 2175000,
                'actual_ending_cash' => 2175000,
                'difference' => 0,
                'status' => 'closed',
                'approved_by' => $owner->id,
                'notes' => 'Shift kemarin berjalan lancar. Laci klir tanpa selisih.',
            ]);

            ShiftMovement::create([
                'id' => (string) Str::uuid(),
                'shift_id' => $yesterdayShift->id,
                'tenant_id' => $tenant->id,
                'user_id' => $cashier->id,
                'type' => 'cash_in',
                'amount' => 100000,
                'reason' => 'Tukar modal uang receh pecahan 5.000',
                'created_at' => now()->subDay()->setTime(10, 15, 0),
            ]);

            ShiftMovement::create([
                'id' => (string) Str::uuid(),
                'shift_id' => $yesterdayShift->id,
                'tenant_id' => $tenant->id,
                'user_id' => $cashier->id,
                'type' => 'cash_out',
                'amount' => 75000,
                'reason' => 'Beli es batu kristal 3 karung (supplier darurat)',
                'created_at' => now()->subDay()->setTime(14, 0, 0),
            ]);

            // 6b. Active Open Shift for Today
            $todayShift = Shift::create([
                'id' => (string) Str::uuid(),
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet1->id,
                'user_id' => $cashier->id,
                'opened_at' => now()->setTime(8, 0, 0),
                'starting_cash' => 300000,
                'cash_sales_total' => 720000,
                'non_cash_sales_total' => 450000,
                'cash_in_total' => 50000,
                'cash_out_total' => 45000,
                'expected_ending_cash' => 1025000,
                'status' => 'open',
                'notes' => 'Shift pagi aktif. Modal awal Rp 300.000.',
            ]);

            ShiftMovement::create([
                'id' => (string) Str::uuid(),
                'shift_id' => $todayShift->id,
                'tenant_id' => $tenant->id,
                'user_id' => $cashier->id,
                'type' => 'cash_in',
                'amount' => 50000,
                'reason' => 'Tambahan modal uang receh pecahan 2.000',
                'created_at' => now()->setTime(9, 30, 0),
            ]);

            ShiftMovement::create([
                'id' => (string) Str::uuid(),
                'shift_id' => $todayShift->id,
                'tenant_id' => $tenant->id,
                'user_id' => $cashier->id,
                'type' => 'cash_out',
                'amount' => 45000,
                'reason' => 'Beli 2 galon air mineral operasional outlet',
                'created_at' => now()->setTime(11, 45, 0),
            ]);
        }
    }
}
