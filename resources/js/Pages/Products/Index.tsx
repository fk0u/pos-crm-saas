import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit3,
  Trash2,
  AlertTriangle,
  Boxes,
  Barcode,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { Button } from '@/Components/ui/button';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  barcode: string | null;
  cost_price: string | number;
  selling_price: string | number;
  stock: number;
  is_active: boolean;
}

interface ProductsPageProps {
  products: ProductItem[];
  categories: string[];
  filters: {
    search: string;
    category: string;
    stock_status: string;
  };
  stats: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    total_inventory_value: number;
  };
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

export default function ProductsIndex({
  products = [],
  categories = [],
  filters,
  stats,
  userName,
  role,
  outletName,
  tenantName,
}: ProductsPageProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [stockStatus, setStockStatus] = useState(filters.stock_status || 'all');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductItem | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<ProductItem | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    barcode: '',
    cost_price: '',
    selling_price: '',
    stock: '',
    is_active: true,
  });

  const [adjustAmount, setAdjustAmount] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Restock Festival');

  const handleFilterChange = (newSearch: string, newCat: string, newStatus: string) => {
    router.get(
      '/products',
      {
        search: newSearch || undefined,
        category: newCat !== 'all' ? newCat : undefined,
        stock_status: newStatus !== 'all' ? newStatus : undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  const openAddModal = () => {
    playTap();
    setFormData({
      name: '',
      category: categories[0] || 'Minuman',
      sku: '',
      barcode: '',
      cost_price: '',
      selling_price: '',
      stock: '25',
      is_active: true,
    });
    setIsAddOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    playTap();
    setEditProduct(p);
    setFormData({
      name: p.name,
      category: p.category || 'Umum',
      sku: p.sku || '',
      barcode: p.barcode || '',
      cost_price: p.cost_price.toString(),
      selling_price: p.selling_price.toString(),
      stock: p.stock.toString(),
      is_active: p.is_active,
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    if (editProduct) {
      router.put(`/products/${editProduct.id}`, formData, {
        onSuccess: () => {
          playSuccessChime();
          setEditProduct(null);
        },
      });
    } else {
      router.post('/products', formData, {
        onSuccess: () => {
          playSuccessChime();
          setIsAddOpen(false);
        },
      });
    }
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProduct) return;
    playTap();

    router.post(
      `/products/${adjustProduct.id}/adjust-stock`,
      {
        adjustment: parseInt(adjustAmount, 10),
        reason: adjustReason,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setAdjustProduct(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteProduct) return;
    playTap();

    router.delete(`/products/${deleteProduct.id}`, {
      onSuccess: () => {
        playSuccessChime();
        setDeleteProduct(null);
      },
    });
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="products"
    >
      <Head title="Katalog Produk - QLon POS & CRM" />

      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="size-6 text-[#0f2b5c]" />
              <span>Katalog Produk</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola item katalog, harga HPP &amp; jual, serta pemantauan stok multi-outlet secara real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.total_products}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Varian Produk</p>
              </div>
              <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0f2b5c]">
                <Package className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
                  {stats.low_stock_count}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Stok Menipis (&le;10)</p>
              </div>
              <div className="size-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <AlertTriangle className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                  {stats.out_of_stock_count}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Stok Habis (Kosong)</p>
              </div>
              <div className="size-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <Boxes className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight truncate">
                  {formatMoney(stats.total_inventory_value)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Nilai Aset Stok</p>
              </div>
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <Coins className="size-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange(e.target.value, selectedCategory, stockStatus);
              }}
              placeholder="Cari nama produk, SKU, barcode, atau kategori..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                handleFilterChange(search, e.target.value, stockStatus);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                handleFilterChange(search, selectedCategory, e.target.value);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="all">Semua Status Stok</option>
              <option value="in_stock">Stok Aman (&gt;10)</option>
              <option value="low_stock">Stok Menipis (&le;10)</option>
              <option value="out_of_stock">Stok Habis (0)</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">SKU / Barcode</th>
                  <th className="py-3.5 px-4 text-right">Harga Modal (HPP)</th>
                  <th className="py-3.5 px-4 text-right">Harga Jual</th>
                  <th className="py-3.5 px-4 text-center">Stok</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada produk yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const isLow = p.stock > 0 && p.stock <= 10;
                    const isOut = p.stock <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-[#0f2b5c] shrink-0 font-black">
                              <Package className="size-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <span className="text-[10px] text-slate-400">ID: {p.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {p.category || 'Umum'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          <div>{p.sku || '-'}</div>
                          {p.barcode && (
                            <div className="text-[9px] text-slate-400 flex items-center gap-1">
                              <Barcode className="size-2.5" /> {p.barcode}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                          {formatMoney(p.cost_price)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatMoney(p.selling_price)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                              isOut
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLow
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {p.stock} pcs
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                p.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {p.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setAdjustProduct(p);
                                setAdjustAmount('10');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-[#0f2b5c] text-slate-600 transition"
                              title="Penyesuaian Stok"
                            >
                              <ArrowUpDown className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="Ubah Produk"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setDeleteProduct(p);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                              title="Hapus Produk"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL TAMBAH / UBAH PRODUK */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddOpen || editProduct !== null}
        onClose={() => {
          setIsAddOpen(false);
          setEditProduct(null);
        }}
        title={editProduct ? 'Ubah Rincian Produk' : 'Tambah Produk Baru'}
        description="Lengkapi informasi katalog produk kasir POS dan ketersediaan stok."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Produk <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="cth: Kopi Susu Gula Aren"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="cth: Minuman, Makanan, Merchandise"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Kode Unik</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="cth: BEV-KOP-01"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Modal (HPP) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                placeholder="cth: 12000"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Jual <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="cth: 25000"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono font-bold text-[#0f2b5c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Awal / Gudang <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="cth: 50"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Barcode Scanner</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="cth: 89912345678"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditProduct(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-md shadow-blue-950/20 active:scale-95"
            >
              {editProduct ? 'Simpan Perubahan' : 'Simpan Produk'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL PENYESUAIAN STOK */}
      {/* ========================================================================= */}
      <Modal
        isOpen={adjustProduct !== null}
        onClose={() => setAdjustProduct(null)}
        title="Penyesuaian Stok Produk"
        description={adjustProduct ? `Ubah jumlah unit stok untuk: ${adjustProduct.name}` : ''}
        maxWidth="md"
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Stok Saat Ini:</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {adjustProduct?.stock} pcs
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Penyesuaian (+ untuk penambahan, - untuk pengurangan)
            </label>
            <input
              type="number"
              required
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="cth: +20 atau -5"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penyesuaian</label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="Restock Festival">Restock Pengiriman Barang Festival</option>
              <option value="Stok Opname Rutin">Stok Opname Rutin</option>
              <option value="Barang Rusak / Kadaluarsa">Barang Rusak / Kadaluarsa (Waste)</option>
              <option value="Koreksi Salah Input">Koreksi Salah Input Kasir</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjustProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs"
            >
              Simpan Penyesuaian
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. MODAL HAPUS PRODUK */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteProduct !== null}
        onClose={() => setDeleteProduct(null)}
        title="Konfirmasi Hapus Produk"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-600 p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-xs font-medium">
              Apakah Anda yakin ingin menghapus produk <strong>{deleteProduct?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
