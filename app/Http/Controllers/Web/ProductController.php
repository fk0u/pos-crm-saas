<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display the product catalog management page.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $query = Product::where('tenant_id', $tenantId);

        // Search filter
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('barcode', 'ilike', "%{$search}%")
                  ->orWhere('category', 'ilike', "%{$search}%");
            });
        }

        // Category filter
        if ($category = $request->query('category')) {
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }

        // Stock status filter
        if ($status = $request->query('stock_status')) {
            if ($status === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            } elseif ($status === 'low_stock') {
                $query->where('stock', '>', 0)->where('stock', '<=', 10);
            } elseif ($status === 'in_stock') {
                $query->where('stock', '>', 10);
            }
        }

        $products = $query->orderBy('name')->get();

        // Calculate statistics
        $allProducts = Product::where('tenant_id', $tenantId)->get();
        $totalProducts = $allProducts->count();
        $lowStockCount = $allProducts->where('stock', '>', 0)->where('stock', '<=', 10)->count();
        $outOfStockCount = $allProducts->where('stock', '<=', 0)->count();
        $totalInventoryValue = $allProducts->sum(fn ($p) => (float) $p->selling_price * (int) $p->stock);

        // Unique categories
        $categories = Product::where('tenant_id', $tenantId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->values();

        return Inertia::render('Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->query('search', ''),
                'category' => $request->query('category', 'all'),
                'stock_status' => $request->query('stock_status', 'all'),
            ],
            'stats' => [
                'total_products' => $totalProducts,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
                'total_inventory_value' => $totalInventoryValue,
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'outletName' => $user->outlet?->name ?? 'Outlet Utama',
            'tenantName' => $user->tenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Store a new product in the database.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'sku' => ['nullable', 'string', 'max:50'],
            'barcode' => ['nullable', 'string', 'max:50'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product = Product::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'sku' => $validated['sku'] ?: 'SKU-' . strtoupper(Str::random(6)),
            'barcode' => $validated['barcode'] ?: null,
            'cost_price' => $validated['cost_price'],
            'selling_price' => $validated['selling_price'],
            'stock' => $validated['stock'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'create_product',
            'details' => ['product_id' => $product->id, 'name' => $product->name],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Produk {$product->name} berhasil ditambahkan");
    }

    /**
     * Update an existing product.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'sku' => ['nullable', 'string', 'max:50'],
            'barcode' => ['nullable', 'string', 'max:50'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $product->update([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'sku' => $validated['sku'] ?: $product->sku,
            'barcode' => $validated['barcode'],
            'cost_price' => $validated['cost_price'],
            'selling_price' => $validated['selling_price'],
            'stock' => $validated['stock'],
            'is_active' => $validated['is_active'] ?? $product->is_active,
        ]);

        return redirect()->back()->with('success', "Produk {$product->name} berhasil diperbarui");
    }

    /**
     * Delete a product.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);
        $name = $product->name;
        $product->delete();

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'delete_product',
            'details' => ['product_id' => $id, 'name' => $name],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Produk {$name} berhasil dihapus");
    }

    /**
     * Quick stock adjustment.
     */
    public function adjustStock(Request $request, string $id): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $user->tenant_id ?? TenantContext::current();

        $product = Product::where('tenant_id', $tenantId)->findOrFail($id);

        $validated = $request->validate([
            'adjustment' => ['required', 'integer'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $oldStock = $product->stock;
        $newStock = max(0, $oldStock + $validated['adjustment']);
        $product->update(['stock' => $newStock]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'adjust_stock',
            'details' => [
                'product_id' => $product->id,
                'name' => $product->name,
                'old_stock' => $oldStock,
                'new_stock' => $newStock,
                'adjustment' => $validated['adjustment'],
                'reason' => $validated['reason'],
            ],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Stok {$product->name} disesuaikan menjadi {$newStock}");
    }
}
