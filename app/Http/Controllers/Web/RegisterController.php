<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function showRegistrationForm(Request $request): Response
    {
        return Inertia::render('Auth/Register', [
            'selectedTier' => $request->query('tier', 'essential'),
        ]);
    }

    /**
     * Self-service Onboarding for UMKM Business Owner.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:100',
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'tier' => 'nullable|string|in:core,essential,full',
        ], [
            'business_name.required' => 'Nama bisnis / usaha wajib diisi.',
            'name.required' => 'Nama pemilik wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Password wajib diisi minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $tier = $validated['tier'] ?? Tenant::TIER_ESSENTIAL;
        $maxOutlets = $tier === Tenant::TIER_CORE ? 1 : ($tier === Tenant::TIER_ESSENTIAL ? 3 : null);
        $maxStaff = $tier === Tenant::TIER_CORE ? 2 : ($tier === Tenant::TIER_ESSENTIAL ? 10 : null);

        $user = DB::transaction(function () use ($validated, $tier, $maxOutlets, $maxStaff) {
            $baseSlug = Str::slug($validated['business_name']);
            if (empty($baseSlug)) {
                $baseSlug = 'tenant';
            }
            $subdomain = $baseSlug.'-'.Str::lower(Str::random(4));

            // 1. Create Workspace / Business Tenant
            $tenant = Tenant::create([
                'name' => $validated['business_name'],
                'subdomain' => $subdomain,
                'phone' => $validated['phone'] ?? null,
                'is_active' => true,
                'subscription_tier' => $tier,
                'max_outlets' => $maxOutlets,
                'max_staff' => $maxStaff,
            ]);

            // 2. Create Default Primary Outlet
            $outlet = Outlet::create([
                'tenant_id' => $tenant->id,
                'name' => 'Cabang Utama ('.$validated['business_name'].')',
                'address' => 'Outlet Utama',
                'phone' => $validated['phone'] ?? null,
            ]);

            // 3. Create Business Owner User
            $owner = User::create([
                'tenant_id' => $tenant->id,
                'outlet_id' => $outlet->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'owner',
            ]);

            // 4. Seed 3 Starter Products for Quick Test Drive
            $starterProducts = [
                ['name' => 'Signature Coffee', 'category' => 'Coffee', 'cost_price' => 7000, 'selling_price' => 18000, 'stock' => 100, 'sku' => 'SIG-001'],
                ['name' => 'Iced Tea Lemonade', 'category' => 'Tea', 'cost_price' => 4000, 'selling_price' => 12000, 'stock' => 80, 'sku' => 'TEA-001'],
                ['name' => 'Classic Butter Toast', 'category' => 'Snack', 'cost_price' => 8000, 'selling_price' => 16000, 'stock' => 50, 'sku' => 'TOA-001'],
            ];

            foreach ($starterProducts as $prod) {
                Product::create(array_merge($prod, ['tenant_id' => $tenant->id]));
            }

            return $owner;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
