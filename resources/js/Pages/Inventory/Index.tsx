import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ClipboardList,
  Trash2,
  Building2,
  PackageCheck,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface ProductStockItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode: string | null;
  image_url: string | null;
  stock: number;
  cost_price: number;
  selling_price: number;
  asset_value: number;
  potential_revenue: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
}

export interface AdjustmentItem {
  id: string;
  product_name: string;
  sku: string;
  type: string;
  quantity: number;
  previous_stock: number;
  current_stock: number;
  reason: string;
  user_name: string;
  created_at: string;
}

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
}

interface InventoryIndexProps {
  products: ProductStockItem[];
  categories: string[];
  recentAdjustments: AdjustmentItem[];
  metrics: {
    total_items: number;
    total_stock_qty: number;
    total_asset_value: number;
    total_potential_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

export default function InventoryIndex({
  products = [],
  categories = [],
  recentAdjustments = [],
  metrics,
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: InventoryIndexProps) {
  const [activeTab, setActiveTab] = useState<'stock' | 'adjustments'>('stock');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, out

  // Form states
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [adjustType, setAdjustType] = useState<'in' | 'out' | 'opname' | 'waste'>('in');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('Restock kiriman dari supplier');

  const openAdjustModal = (product?: ProductStockItem) => {
    playTap();
    if (product) {
      setSelectedProductId(product.id);
    }
    setQuantity('10');
    setAdjustType('in');
    setReason('Restock kiriman dari supplier');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    router.post(
      '/inventory/adjust',
      {
        product_id: selectedProductId,
        type: adjustType,
        quantity: parseInt(quantity || '0', 10),
        reason,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsAdjustModalOpen(false);
        },
      }
    );
  };

  const filteredProducts = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (stockFilter === 'low' && !p.is_low_stock) return false;
    if (stockFilter === 'out' && !p.is_out_of_stock) return false;
    return true;
  });

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="inventory"
    >
      <Head title="Inventori & Manajemen Stok - QLon POS & CRM" />

      <div className="space-y-6">
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Platform Superadmin Multi-Tenant Scope</p>
                <p className="text-[11px] text-sky-200">
                  Melihat inventori stok untuk tenant: <strong className="text-white underline">{tenantName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="saasTenantSelect" className="text-[11px] text-sky-200 shrink-0 font-medium">Pilih Tenant:</label>
              <select
                id="saasTenantSelect"
                value={tenantId || ''}
                onChange={(e) => router.get('/inventory', { tenant_id: e.target.value })}
                className="h-8 px-2.5 rounded-lg bg-blue-950/80 border border-blue-400/40 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="size-6 text-[#0f2b5c]" />
              <span>Inventori &amp; Manajemen Stok</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau jumlah stok bahan &amp; barang, peringatan stok menipis, valuasi aset gudang, dan riwayat mutasi stok.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/inventory/export"
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Export CSV</span>
            </a>

            <button
              type="button"
              onClick={() => openAdjustModal()}
              className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Penyesuaian Stok (Opname)</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Valuasi Aset (HPP)</p>
            <p className="text-lg font-black font-mono text-[#0f2b5c] mt-1">
              {formatMoney(metrics.total_asset_value)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{metrics.total_stock_qty} unit fisik total</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-slate-400">Potensi Nilai Jual</p>
            <p className="text-lg font-black font-mono text-emerald-700 mt-1">
              {formatMoney(metrics.total_potential_value)}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{metrics.total_items} SKU terdaftar</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-amber-600 flex items-center gap-1">
              <AlertTriangle className="size-3.5" />
              <span>Stok Menipis (&le; 10)</span>
            </p>
            <p className="text-lg font-black font-mono text-amber-600 mt-1">
              {metrics.low_stock_count} <span className="text-xs font-normal text-slate-500">produk</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Segera jadwalkan restock</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-rose-600 flex items-center gap-1">
              <AlertTriangle className="size-3.5" />
              <span>Stok Habis (0 pcs)</span>
            </p>
            <p className="text-lg font-black font-mono text-rose-600 mt-1">
              {metrics.out_of_stock_count} <span className="text-xs font-normal text-slate-500">produk</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tidak dapat dijual di POS</p>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { playTap(); setActiveTab('stock'); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'stock'
                ? 'border-[#0f2b5c] text-[#0f2b5c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Stok Produk ({filteredProducts.length})
          </button>
          <button
            type="button"
            onClick={() => { playTap(); setActiveTab('adjustments'); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'adjustments'
                ? 'border-[#0f2b5c] text-[#0f2b5c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Riwayat Mutasi Stok ({recentAdjustments.length})
          </button>
        </div>

        {activeTab === 'stock' ? (
          <div className="space-y-4">
            {/* FILTERS ROW */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama produk atau SKU..."
                  className="w-full pl-9 pr-3.5 h-9 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="all">Semua Status Stok</option>
                <option value="low">Hanya Stok Menipis</option>
                <option value="out">Hanya Stok Habis</option>
              </select>
            </div>

            {/* PRODUCT STOCK TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                    <tr>
                      <th className="py-3.5 px-4">Produk</th>
                      <th className="py-3.5 px-4">SKU / Kategori</th>
                      <th className="py-3.5 px-4">Stok Saat Ini</th>
                      <th className="py-3.5 px-4">Harga Beli (HPP)</th>
                      <th className="py-3.5 px-4">Harga Jual</th>
                      <th className="py-3.5 px-4">Total Aset (HPP)</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Tidak ada produk yang cocok dengan pencarian / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="size-9 rounded-lg object-cover shrink-0 border border-slate-100"
                                />
                              ) : (
                                <div className="size-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                                  <Boxes className="size-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{p.name}</p>
                                <span className="text-[10px] font-mono text-slate-400">{p.barcode || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-mono text-slate-700">{p.sku}</p>
                            <span className="text-[10px] text-slate-400">{p.category}</span>
                          </td>
                          <td className="py-3 px-4 font-bold">
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono ${
                                p.is_out_of_stock
                                  ? 'bg-rose-100 text-rose-700'
                                  : p.is_low_stock
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {p.stock} unit
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {formatMoney(p.cost_price)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {formatMoney(p.selling_price)}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#0f2b5c]">
                            {formatMoney(p.asset_value)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openAdjustModal(p)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#0f2b5c] transition cursor-pointer"
                            >
                              Atur Stok
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* RECENT ADJUSTMENTS TABLE */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                  <tr>
                    <th className="py-3.5 px-4">Waktu</th>
                    <th className="py-3.5 px-4">Nama Produk</th>
                    <th className="py-3.5 px-4">Tipe Mutasi</th>
                    <th className="py-3.5 px-4">Jumlah</th>
                    <th className="py-3.5 px-4">Sebelum &rarr; Sesudah</th>
                    <th className="py-3.5 px-4">Keterangan / Alasan</th>
                    <th className="py-3.5 px-4">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAdjustments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Belum ada riwayat mutasi stok tercatat.
                      </td>
                    </tr>
                  ) : (
                    recentAdjustments.map((adj) => (
                      <tr key={adj.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {adj.created_at}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {adj.product_name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              adj.type === 'in'
                                ? 'bg-emerald-100 text-emerald-800'
                                : adj.type === 'waste'
                                ? 'bg-rose-100 text-rose-800'
                                : adj.type === 'opname'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {adj.type === 'in' ? 'Masuk (In)' : adj.type === 'waste' ? 'Rusak/Waste' : adj.type === 'opname' ? 'Opname' : 'Keluar (Out)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {adj.quantity}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {adj.previous_stock} &rarr; <strong className="text-slate-900">{adj.current_stock}</strong>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {adj.reason}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {adj.user_name}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PENYESUAIAN STOK */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Penyesuaian Stok Produk (Stock Adjustment)"
        description="Catat mutasi stok masuk (restock), pengurangan stok keluar, stock opname fisik, atau barang rusak (waste)."
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label htmlFor="adjustProductSelect" className="block text-xs font-bold text-slate-700 mb-1">
              Pilih Produk <span className="text-rose-500">*</span>
            </label>
            <select
              id="adjustProductSelect"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok Saat Ini: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="adjustTypeSelect" className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Penyesuaian <span className="text-rose-500">*</span>
              </label>
              <select
                id="adjustTypeSelect"
                value={adjustType}
                onChange={(e) => setAdjustType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="in">Stok Masuk (+ Restock)</option>
                <option value="out">Stok Keluar (- Pengurangan)</option>
                <option value="opname">Stock Opname (Set Stok Fisik Baru)</option>
                <option value="waste">Barang Rusak / Basi / Waste</option>
              </select>
            </div>

            <div>
              <label htmlFor="adjustQtyInput" className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Unit <span className="text-rose-500">*</span>
              </label>
              <input
                id="adjustQtyInput"
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="cth: 20"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="adjustReasonInput" className="block text-xs font-bold text-slate-700 mb-1">
              Alasan / Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              id="adjustReasonInput"
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="cth: Kiriman bahan baku dari supplier distributor"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              Simpan Mutasi
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

