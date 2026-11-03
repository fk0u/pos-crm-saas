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
  LayoutGrid,
  List,
  Image as ImageIcon,
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
  image_url?: string | null;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    image_url: '',
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
      image_url: '',
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
      image_url: p.image_url || '',
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
        amount: parseInt(adjustAmount, 10),
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

  const handleDeleteProduct = () => {
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
    <AppShell userName={userName} role={role} outletName={outletName} tenantName={tenantName}>
      <Head title="Katalog Produk - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="size-6 text-[#0f2b5c]" />
              <span>Katalog Produk</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola item katalog, galeri visual produk, harga HPP &amp; jual, serta pemantauan stok real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle: Grid vs List */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setViewMode('grid');
                }}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'grid'
                    ? 'bg-[#0f2b5c] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Tampilan Galeri Grid"
                aria-label="Tampilan Grid"
              >
                <LayoutGrid className="size-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setViewMode('list');
                }}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-[#0f2b5c] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Tampilan Tabel List"
                aria-label="Tampilan List"
              >
                <List className="size-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
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

        {/* ========================================================================= */}
        {/* VIEW MODE: GALLERY GRID */}
        {/* ========================================================================= */}
        {viewMode === 'grid' ? (
          <div>
            {products.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-400">
                Tidak ada produk yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 10;
                  const isOut = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      className="group rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-[#0f2b5c]/40 transition overflow-hidden flex flex-col"
                    >
                      {/* Product Image Header with Aspect Ratio */}
                      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading="lazy"
                            className="size-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                            <ImageIcon className="size-8 mb-1 opacity-50" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">No Image</span>
                          </div>
                        )}

                        {/* Category Badge on Top-Left */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 text-white font-bold text-[10px] backdrop-blur-xs">
                            {p.category || 'Umum'}
                          </span>
                        </div>

                        {/* Stock Status Badge on Top-Right */}
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] shadow-xs ${
                              isOut
                                ? 'bg-rose-500 text-white'
                                : isLow
                                ? 'bg-amber-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isOut ? 'Habis' : `${p.stock} stok`}
                          </span>
                        </div>
                      </div>

                      {/* Product Info Body */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                            <span>{p.sku || '-'}</span>
                            {p.barcode && <span>{p.barcode}</span>}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">
                            {p.name}
                          </h3>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-[10px] text-slate-400">Harga Jual</span>
                            <span className="text-base font-black text-[#0f2b5c] font-mono">
                              {formatMoney(p.selling_price)}
                            </span>
                          </div>

                          {/* Quick Actions Row */}
                          <div className="grid grid-cols-3 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setAdjustProduct(p);
                                setAdjustAmount('10');
                              }}
                              className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 transition"
                              title="Sesuaikan Stok"
                            >
                              <ArrowUpDown className="size-3" /> Stok
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1 transition"
                              title="Ubah Produk"
                            >
                              <Edit3 className="size-3" /> Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setDeleteProduct(p);
                              }}
                              className="py-1.5 px-2 rounded-xl border border-slate-200 hover:bg-rose-50 text-[11px] font-bold text-rose-600 flex items-center justify-center gap-1 transition"
                              title="Hapus Produk"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW MODE: TABLE LIST */
          /* ========================================================================= */
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
                              <div className="size-11 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center text-[#0f2b5c]">
                                {p.image_url ? (
                                  <img src={p.image_url} alt={p.name} className="size-full object-cover" />
                                ) : (
                                  <Package className="size-5" />
                                )}
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
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {p.is_active ? 'Aktif' : 'Non-aktif'}
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
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                                title="Sesuaikan Stok"
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL TAMBAH / UBAH PRODUK (DENGAN INPUT URL GAMBAR) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddOpen || editProduct !== null}
        onClose={() => {
          setIsAddOpen(false);
          setEditProduct(null);
        }}
        title={editProduct ? 'Ubah Rincian Produk' : 'Tambah Produk Baru'}
        description="Lengkapi informasi katalog produk kasir POS, gambar visual dan ketersediaan stok."
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Gambar Produk (Galeri)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/... atau URL gambar produk"
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
              />
              {formData.image_url && (
                <div className="size-10 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                  <img src={formData.image_url} alt="Preview" className="size-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Masukkan tautan gambar langsung (.jpg, .png, webp). Gambar akan ditampilkan di galeri Kasir &amp; Katalog.
            </p>
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Stok Saat Ini</p>
              <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                {adjustProduct?.stock} pcs
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Estimasi Setelah Penyesuaian</p>
              <p className="text-xl font-black text-[#0f2b5c] font-mono mt-0.5">
                {(adjustProduct?.stock || 0) + (parseInt(adjustAmount, 10) || 0)} pcs
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jumlah Perubahan (Bisa Negatif/Positif) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="cth: 20 atau -5"
                className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
              />
              <div className="flex gap-1">
                {['-10', '-1', '+5', '+10', '+50'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      playTap();
                      setAdjustAmount(val.replace('+', ''));
                    }}
                    className="px-2.5 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 font-mono"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan Audit Penyesuaian <span className="text-rose-500">*</span>
            </label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
            >
              <option value="Restock Festival">Restock Baru (Supplier/Pusat)</option>
              <option value="Hasil Stock Opname">Hasil Stock Opname Fisik</option>
              <option value="Barang Rusak/Kadaluarsa">Barang Rusak / Basi / Kadaluarsa</option>
              <option value="Koreksi Input Kasir">Koreksi Salah Input</option>
              <option value="Return Pembeli">Retur dari Pelanggan</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjustProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-md shadow-blue-950/20 active:scale-95"
            >
              Terapkan Penyesuaian
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
        title="Hapus Produk dari Katalog"
        description="Apakah Anda yakin ingin menghapus item produk ini? Tindakan ini akan dicatat dalam riwayat audit."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs">
            <p className="font-bold">{deleteProduct?.name}</p>
            <p className="text-[11px] font-mono mt-0.5">SKU: {deleteProduct?.sku || '-'}</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md shadow-rose-900/20 active:scale-95"
            >
              Hapus Permanen
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
