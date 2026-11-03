<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\Tenant;
use App\Models\User;
use App\Support\TenantContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class InventoryController extends Controller
{
    private function resolveTenantId(User $user, Request $request): ?string
    {
        if ($user->isSuperAdmin()) {
            return $request->query('tenant_id') ?? session('delegated_tenant_id') ?? Tenant::first()?->id;
        }

        return $user->tenant_id ?? TenantContext::current();
    }

    /**
     * Display the inventory and stock management center.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $allTenants = $user->isSuperAdmin()
            ? Tenant::select(['id', 'name', 'subdomain'])->get()
            : [];

        $search = $request->query('search');
        $category = $request->query('category');
        $stockFilter = $request->query('stock_filter'); // all, low, out

        $query = Product::where('tenant_id', $tenantId)->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('barcode', 'ilike', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($stockFilter === 'low') {
            $query->where('stock', '<=', 10)->where('stock', '>', 0);
        } elseif ($stockFilter === 'out') {
            $query->where('stock', '<=', 0);
        }

        $products = $query->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'category' => $p->category ?? 'General',
            'sku' => $p->sku,
            'barcode' => $p->barcode,
            'image_url' => $p->image_url,
            'stock' => (int) $p->stock,
            'cost_price' => (float) $p->cost_price,
            'selling_price' => (float) $p->selling_price,
            'asset_value' => (float) ($p->stock * $p->cost_price),
            'potential_revenue' => (float) ($p->stock * $p->selling_price),
            'is_low_stock' => (int) $p->stock <= 10 && (int) $p->stock > 0,
            'is_out_of_stock' => (int) $p->stock <= 0,
        ]);

        // Categories list
        $categories = Product::where('tenant_id', $tenantId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        // Recent Adjustments
        $recentAdjustments = StockAdjustment::where('tenant_id', $tenantId)
            ->with(['product:id,name,sku', 'user:id,name'])
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($adj) => [
                'id' => $adj->id,
                'product_name' => $adj->product?->name ?? 'Produk Dihapus',
                'sku' => $adj->product?->sku ?? '-',
                'type' => $adj->type,
                'quantity' => (int) $adj->quantity,
                'previous_stock' => (int) $adj->previous_stock,
                'current_stock' => (int) $adj->current_stock,
                'reason' => $adj->reason,
                'user_name' => $adj->user?->name ?? 'Sistem',
                'created_at' => $adj->created_at?->format('d/m/Y H:i'),
            ]);

        // Inventory summary metrics
        $allProducts = Product::where('tenant_id', $tenantId)->get();
        $totalItems = $allProducts->count();
        $totalStockQty = $allProducts->sum('stock');
        $totalAssetValue = $allProducts->sum(fn ($p) => $p->stock * $p->cost_price);
        $totalPotentialValue = $allProducts->sum(fn ($p) => $p->stock * $p->selling_price);
        $lowStockCount = $allProducts->filter(fn ($p) => $p->stock <= 10 && $p->stock > 0)->count();
        $outOfStockCount = $allProducts->filter(fn ($p) => $p->stock <= 0)->count();

        $currentTenant = $tenantId ? Tenant::find($tenantId) : null;

        return Inertia::render('Inventory/Index', [
            'products' => $products,
            'categories' => $categories,
            'recentAdjustments' => $recentAdjustments,
            'metrics' => [
                'total_items' => $totalItems,
                'total_stock_qty' => $totalStockQty,
                'total_asset_value' => (float) $totalAssetValue,
                'total_potential_value' => (float) $totalPotentialValue,
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStockCount,
            ],
            'userName' => $user->name,
            'role' => $user->role,
            'isSuperAdmin' => $user->isSuperAdmin(),
            'tenantId' => $tenantId,
            'allTenants' => $allTenants,
            'outletName' => $user->outlet?->name ?? 'Gudang Utama',
            'tenantName' => $currentTenant?->name ?? 'QLon Store',
        ]);
    }

    /**
     * Record a manual stock adjustment (In, Out, Opname, Waste).
     */
    public function adjust(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if (! $tenantId) {
            return redirect()->back()->with('error', 'Tenant context tidak valid.');
        }

        TenantContext::set($tenantId);

        $validated = $request->validate([
            'product_id' => ['required', 'string', 'exists:products,id'],
            'type' => ['required', 'string', 'in:in,out,opname,waste'],
            'quantity' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $product = Product::where('tenant_id', $tenantId)->findOrFail($validated['product_id']);
        $prevStock = (int) $product->stock;
        $qty = (int) $validated['quantity'];

        if ($validated['type'] === 'in') {
            $newStock = $prevStock + $qty;
        } elseif ($validated['type'] === 'opname') {
            $newStock = $qty;
        } else {
            // out or waste
            $newStock = max(0, $prevStock - $qty);
        }

        $adjustment = StockAdjustment::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'product_id' => $product->id,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'quantity' => $qty,
            'previous_stock' => $prevStock,
            'current_stock' => $newStock,
            'reason' => $validated['reason'],
        ]);

        $product->update(['stock' => $newStock]);

        AuditLog::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenantId,
            'user_id' => $user->id,
            'action' => 'inventory.adjustment',
            'details' => json_encode([
                'product_name' => $product->name,
                'type' => $validated['type'],
                'previous_stock' => $prevStock,
                'new_stock' => $newStock,
                'reason' => $validated['reason'],
            ]),
            'ip_address' => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Penyesuaian stok {$product->name} berhasil disimpan. Stok saat ini: {$newStock}.");
    }

    /**
     * Export inventory report to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $user = Auth::user();
        $tenantId = $this->resolveTenantId($user, $request);

        if ($tenantId) {
            TenantContext::set($tenantId);
        }

        $products = Product::where('tenant_id', $tenantId)->orderBy('name')->get();

        $csvFileName = 'laporan_inventori_stok_' . date('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$csvFileName}\"",
        ];

        return response()->stream(function () use ($products) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'SKU',
                'Barcode',
                'Nama Produk',
                'Kategori',
                'Stok Tersedia',
                'Harga Pokok (HPP)',
                'Harga Jual',
                'Total Valuasi Aset (Rp)',
                'Status',
            ]);

            foreach ($products as $p) {
                fputcsv($file, [
                    $p->sku,
                    $p->barcode ?? '-',
                    $p->name,
                    $p->category ?? 'General',
                    $p->stock,
                    $p->cost_price,
                    $p->selling_price,
                    $p->stock * $p->cost_price,
                    $p->stock <= 0 ? 'Habis' : ($p->stock <= 10 ? 'Menipis' : 'Aman'),
                ]);
            }

            fclose($file);
        }, 200, $headers);
    }
}

