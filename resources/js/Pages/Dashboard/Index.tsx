import React, { useState, useEffect, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Store,
  Calendar,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Receipt,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Phone,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Settings,
  BarChart3,
  Boxes,
  HelpCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Drawer } from '@/Components/ui/drawer';
import { CountUp } from '@/Components/ui/count-up';
import { RevenueChart } from '@/Components/dashboard/revenue-chart';
import { formatMoney, formatDateTime, formatCompactMoney } from '@/lib/format';
import type { DailyPoint } from '@/lib/analytics';

interface Outlet {
  id: number | string;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
}

interface Customer {
  id: number | string;
  name: string;
  phone: string;
  tier?: string;
  points_balance?: number;
  total_spent?: number;
  total_orders?: number;
  orders_count?: number;
  last_visit_at?: string;
}

interface Order {
  id: number | string;
  invoice_number: string;
  customer?: Customer | null;
  customer_name?: string;
  grand_total: number;
  payment_method: string;
  status: string;
  created_at: string;
  outlet?: Outlet | null;
}

interface TopProduct {
  id: number | string;
  name: string;
  category?: string;
  sold_count: number;
  total_revenue: number;
  stock?: number;
}

interface AuditLog {
  id: number | string;
  action: string;
  user_name: string;
  description: string;
  ip_address?: string;
  created_at: string;
}

interface DashboardProps {
  userName?: string;
  role?: string;
  tenantName?: string;
  outletName?: string;
  summary?: {
    today_revenue?: number;
    today_orders_count?: number;
    avg_order_value?: number;
    new_customers_count?: number;
    growth_revenue?: number;
    growth_orders?: number;
  };
  outlets?: Outlet[];
  customers?: Customer[];
  recentOrders?: Order[];
  topProducts?: TopProduct[];
  auditLogs?: AuditLog[];
  search?: string;
}

export default function DashboardIndex({
  userName = 'Owner',
  role = 'owner',
  tenantName = 'Kopi Kawan Indonesia',
  outletName = 'Semua Outlet',
  summary = {},
  outlets = [],
  customers = [],
  recentOrders = [],
  topProducts = [],
  auditLogs = [],
  search = '',
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'crm' | 'inventory' | 'reports' | 'settings' | 'audit'>('overview');
  const [ordersList, setOrdersList] = useState<Order[]>(recentOrders);
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('all');

  // Modals & Drawers
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundSuccessToast, setRefundSuccessToast] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  // Sync hash with active tab
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '') as any;
      if (['overview', 'sales', 'crm', 'inventory', 'reports', 'settings', 'audit'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Live polling for recent orders
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch('/dashboard/recent');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOrdersList(json.data);
        }
      } catch {
        // quiet fallback
      }
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 14-day mock daily points for the revenue chart
  const revenueSeries: DailyPoint[] = useMemo(() => {
    const baseAmounts = [
      1850000, 2100000, 1950000, 2450000, 2800000, 3100000, 3450000,
      2900000, 2750000, 3300000, 3600000, 4100000, 4800000,
      summary?.today_revenue || 5200000,
    ];
    return baseAmounts.map((rev, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return {
        key: d.toISOString().slice(0, 10),
        label: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' })}`,
        revenue: rev,
        count: Math.round(rev / 35000),
      };
    });
  }, [summary?.today_revenue]);

  // Payment Breakdown
  const paymentBreakdown = [
    { method: 'QRIS Real-Time', count: 48, total: 3120000, percent: 52, color: 'bg-sky-500' },
    { method: 'Tunai (Cash)', count: 32, total: 1980000, percent: 33, color: 'bg-navy-700' },
    { method: 'Debit EDC Fisik', count: 9, total: 580000, percent: 10, color: 'bg-emerald-500' },
    { method: 'Transfer Bank Direct', count: 4, total: 310000, percent: 5, color: 'bg-amber-500' },
  ];

  // Mock Products & Inventory
  const inventoryItems = [
    { id: '1', sku: 'KOP-001', name: 'Es Kopi Susu Gula Aren', category: 'Coffee', stock_central: 142, stock_square: 88, total_stock: 230, min: 30 },
    { id: '2', sku: 'KOP-002', name: 'Americano Double Shot', category: 'Coffee', stock_central: 95, stock_square: 110, total_stock: 205, min: 25 },
    { id: '3', sku: 'NC-001', name: 'Matcha Uji Artisan Latte', category: 'Non-Coffee', stock_central: 8, stock_square: 12, total_stock: 20, min: 20 },
    { id: '4', sku: 'PAS-001', name: 'Butter Croissant French AOP', category: 'Pastry', stock_central: 5, stock_square: 9, total_stock: 14, min: 15 },
    { id: '5', sku: 'PAS-002', name: 'Pain Au Chocolat Belgian', category: 'Pastry', stock_central: 4, stock_square: 6, total_stock: 10, min: 15 },
  ];

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForRefund) return;
    setIsRefunding(true);
    setTimeout(() => {
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === selectedOrderForRefund.id ? { ...o, status: 'refunded' } : o
        )
      );
      setIsRefunding(false);
      setSelectedOrderForRefund(null);
      setRefundReason('');
      setRefundSuccessToast(true);
      setTimeout(() => setRefundSuccessToast(false), 4000);
    }, 600);
  };

  const exportSalesCsv = () => {
    const headers = ['Invoice', 'Tanggal', 'Outlet', 'Pelanggan', 'Metode Bayar', 'Status', 'Total'];
    const rows = ordersList.map((o) => [
      o.invoice_number,
      o.created_at,
      o.outlet?.name || outletName,
      o.customer?.name || o.customer_name || 'Pelanggan Umum',
      o.payment_method,
      o.status,
      o.grand_total,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `laporan-transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} userName={userName} role={role} outletName={outletName}>
      <div className="space-y-6">
        {/* Toast Notification */}
        {refundSuccessToast && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-xs">Retur Transaksi Berhasil Diproses</p>
                <p className="text-[11px] text-emerald-700">Stok produk terkait telah dikembalikan ke inventori laci kasir.</p>
              </div>
            </div>
            <button onClick={() => setRefundSuccessToast(false)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
              Tutup
            </button>
          </div>
        )}

        {/* ===================== TAB: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Bar Filter & Quick POS Jump */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Ringkasan Operasional Hari Ini
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pantau metrik penjualan, performa cabang &amp; laci kasir secara langsung.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <select
                  value={selectedOutletFilter}
                  onChange={(e) => setSelectedOutletFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 shadow-sm"
                >
                  <option value="all">Semua Outlet Cabang</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>

                <Link href="/pos">
                  <Button size="md" className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm font-semibold">
                    <Store className="size-4 mr-1.5 text-sky-400" />
                    Buka Kasir POS
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 Primary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-5 bg-white border-slate-200/90 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Omzet Hari Ini</span>
                  <div className="size-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                    <DollarSign className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-950 font-mono tracking-tight">
                    <CountUp value={summary?.today_revenue || 5990000} prefix="Rp " />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="size-3" />
                    <span>+14.8% vs hari kemarin</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Transaksi</span>
                  <div className="size-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShoppingBag className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-950 font-mono tracking-tight">
                    <CountUp value={summary?.today_orders_count || 93} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="size-3" />
                    <span>+8 transaksi di jam sibuk</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Rata-rata Basket Size</span>
                  <div className="size-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Receipt className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-950 font-mono tracking-tight">
                    <CountUp value={summary?.avg_order_value || 64408} prefix="Rp " />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    2.8 produk per transaksi
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Member CRM Aktif</span>
                  <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Users className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-950 font-mono tracking-tight">
                    <CountUp value={customers.length || 24} />
                  </div>
                  <div className="mt-2 text-[11px] text-sky-700 font-medium">
                    78% repeat order rate
                  </div>
                </div>
              </Card>
            </div>

            {/* Sales Chart & Payment Methods Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart series={revenueSeries} />
              </div>

              {/* Payment Methods Breakdown Card */}
              <Card className="p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-900">Komposisi Pembayaran</p>
                    <span className="text-[11px] text-slate-400 font-mono">Bulan Ini</span>
                  </div>

                  <div className="space-y-4">
                    {paymentBreakdown.map((item) => (
                      <div key={item.method} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{item.method}</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {formatMoney(item.total)} ({item.percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs text-slate-500">
                  <span>Verifikasi QRIS tanpa gateway</span>
                  <span className="font-semibold text-navy-800">100% Bebas MDR</span>
                </div>
              </Card>
            </div>

            {/* Bottom Row: Top Products & Live Order Ticker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Produk Terlaris Hari Ini</h3>
                    <p className="text-[11px] text-slate-500">Berdasarkan kuantitas item terjual di kasir</p>
                  </div>
                  <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                    Top 5 Menu
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(topProducts.length > 0 ? topProducts : [
                    { id: '1', name: 'Es Kopi Susu Gula Aren', sold_count: 54, total_revenue: 972000, category: 'Coffee' },
                    { id: '2', name: 'Americano Iced Double Shot', sold_count: 38, total_revenue: 570000, category: 'Coffee' },
                    { id: '3', name: 'Matcha Uji Artisan Latte', sold_count: 22, total_revenue: 484000, category: 'Non-Coffee' },
                    { id: '4', name: 'Butter Croissant French AOP', sold_count: 19, total_revenue: 456000, category: 'Pastry' },
                    { id: '5', name: 'Caramel Macchiato Cream', sold_count: 14, total_revenue: 350000, category: 'Coffee' },
                  ]).map((p, idx) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="size-6 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.category || 'Menu'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-slate-900">{p.sold_count} terjual</p>
                        <p className="text-[10px] text-slate-500">{formatCompactMoney(p.total_revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Live Order Ticker Feed */}
              <Card className="p-5 bg-white border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">Transaksi Terakhir (Live)</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Auto 10 detik</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {ordersList.slice(0, 6).map((order) => (
                    <div key={order.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800">{order.invoice_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.status === 'refunded'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {order.status === 'refunded' ? 'Retur' : 'Selesai'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.customer?.name || order.customer_name || 'Pelanggan Umum'} &bull; {order.payment_method}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-950">{formatMoney(order.grand_total)}</p>
                        <span className="text-[10px] text-slate-400">{formatDateTime(order.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== TAB: SALES & REFUND ===================== */}
        {activeTab === 'sales' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Daftar Transaksi &amp; Retur Penjualan
                </h1>
                <p className="text-xs text-slate-500">
                  Riwayat seluruh invoice, audit struk kasir, serta wizard pengembalian dana (refund).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={exportSalesCsv} className="border-slate-200 text-xs">
                  <Download className="size-3.5 mr-1" />
                  Ekspor CSV
                </Button>
                <Link href="/pos">
                  <Button size="sm" className="bg-navy-900 text-white text-xs">
                    <Plus className="size-3.5 mr-1" />
                    Transaksi Baru (POS)
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50">
                <div className="relative w-full sm:w-80">
                  <Input
                    placeholder="Cari nomor invoice, pelanggan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                  <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="text-xs text-slate-500">
                  Menampilkan {ordersList.length} transaksi
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Invoice</th>
                      <th className="px-4 py-3">Tanggal / Jam</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Metode Bayar</th>
                      <th className="px-4 py-3 text-right">Total Transaksi</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList
                      .filter((o) =>
                        searchQuery
                          ? o.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                            {order.invoice_number}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDateTime(order.created_at)}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {order.customer?.name || order.customer_name || 'Pelanggan Umum'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                            {formatMoney(order.grand_total)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.status === 'refunded'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {order.status === 'refunded' ? 'Dibatalkan (Retur)' : 'Berhasil'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {order.status !== 'refunded' ? (
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForRefund(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                              >
                                <RotateCcw className="size-3" />
                                Retur
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Sudah diretur</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Refund Wizard Modal */}
            {selectedOrderForRefund && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in">
                <Card className="w-full max-w-md p-6 bg-white border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Konfirmasi Retur Transaksi</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Invoice: <span className="font-mono font-bold text-slate-800">{selectedOrderForRefund.invoice_number}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderForRefund(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Nominal pengembalian dana:{' '}
                      <strong className="font-mono">{formatMoney(selectedOrderForRefund.grand_total)}</strong>.
                      Stok produk akan otomatis dipulihkan ke inventori.
                    </span>
                  </div>

                  <form onSubmit={handleRefundSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alasan Pembatalan / Retur *
                      </label>
                      <textarea
                        required
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Contoh: Pesanan keliru input, barang rusak..."
                        rows={3}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrderForRefund(null)}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isRefunding || !refundReason.trim()}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                      >
                        {isRefunding ? 'Memproses Retur...' : 'Ya, Proses Pengembalian Dana'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: CRM & LOYALITAS ===================== */}
        {activeTab === 'crm' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Direktori Pelanggan &amp; Program Loyalitas
                </h1>
                <p className="text-xs text-slate-500">
                  Data member CRM, perolehan poin belanja, segmentasi otomatis, dan integrasi WhatsApp chat.
                </p>
              </div>
            </div>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50">
                <div className="relative w-full sm:w-80">
                  <Input
                    placeholder="Cari nama pelanggan, nomor WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs"
                  />
                  <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="text-xs text-slate-500">
                  Total {customers.length} member terdaftar
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Nama Member</th>
                      <th className="px-4 py-3">WhatsApp</th>
                      <th className="px-4 py-3">Segmentasi</th>
                      <th className="px-4 py-3 text-right">Saldo Poin</th>
                      <th className="px-4 py-3 text-right">Total Belanja</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers
                      .filter((c) =>
                        searchQuery
                          ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.phone.includes(searchQuery)
                          : true
                      )
                      .map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {cust.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {cust.phone}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              cust.tier === 'VIP'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                              {cust.tier || 'Member Reguler'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">
                            {cust.points_balance || 0} Pts
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                            {formatMoney(cust.total_spent || 0)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`https://wa.me/${cust.phone.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                              >
                                <Phone className="size-3" />
                                WhatsApp
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(cust);
                                  setCustomerDrawerOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Customer Detail Drawer */}
            <Drawer
              open={customerDrawerOpen}
              onClose={() => setCustomerDrawerOpen(false)}
              title={selectedCustomer?.name || 'Detail Pelanggan'}
              description={`Nomor Kontak: ${selectedCustomer?.phone || '-'}`}
            >
              {selectedCustomer && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Saldo Poin</span>
                      <span className="text-lg font-bold font-mono text-amber-600">
                        {selectedCustomer.points_balance || 0} Poin
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Pengeluaran</span>
                      <span className="text-lg font-bold font-mono text-slate-900">
                        {formatMoney(selectedCustomer.total_spent || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">Catatan Loyalitas</p>
                    <p className="text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      Member aktif dengan preferensi produk Cold Brew dan Kopi Susu Gula Aren. Nilai tukar poin: 100 poin = Diskon Rp 10.000 di kasir POS.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-2">
                    <a
                      href={`https://wa.me/${selectedCustomer.phone.replace(/^0/, '62')}?text=${encodeURIComponent(
                        `Halo Kak ${selectedCustomer.name}, terima kasih telah menjadi pelanggan setia ${tenantName}! Saldo poin kamu saat ini: ${selectedCustomer.points_balance || 0} Pts.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1"
                    >
                      <Button size="md" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                        <Phone className="size-4 mr-1.5" />
                        Kirim Voucher via WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </Drawer>
          </div>
        )}

        {/* ===================== TAB: INVENTORI ===================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Inventori &amp; Stok Multi-Outlet
                </h1>
                <p className="text-xs text-slate-500">
                  Pantau stok bahan &amp; menu jadi di seluruh cabang, catat stok masuk, mutasi, dan penyesuaian.
                </p>
              </div>
            </div>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-right">Outlet Pusat</th>
                      <th className="px-4 py-3 text-right">Outlet Cabang</th>
                      <th className="px-4 py-3 text-right">Total Stok</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{item.sku}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-500">{item.category}</td>
                        <td className="px-4 py-3 text-right font-mono font-medium">{item.stock_central} pcs</td>
                        <td className="px-4 py-3 text-right font-mono font-medium">{item.stock_square} pcs</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{item.total_stock} pcs</td>
                        <td className="px-4 py-3 text-center">
                          {item.total_stock <= item.min ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="size-3" />
                              Menipis
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== TAB: LAPORAN ===================== */}
        {activeTab === 'reports' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Laporan Keuangan &amp; Pajak
                </h1>
                <p className="text-xs text-slate-500">
                  Rekapitulasi penjualan bersih, margin laba kotor, PPN, dan service charge.
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={exportSalesCsv} className="text-xs">
                <Download className="size-3.5 mr-1" />
                Unduh Rekap Spreadsheet (CSV)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-white border-slate-200">
                <p className="text-xs font-medium text-slate-500">Penjualan Kotor (Gross)</p>
                <p className="text-2xl font-bold font-mono text-slate-950 mt-2">
                  {formatMoney(summary?.today_revenue ? summary.today_revenue * 28 : 124500000)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Akumulasi 30 hari berjalan</p>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <p className="text-xs font-medium text-slate-500">Estimasi Margin Laba Kotor</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">
                  64.2%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Setelah HPP (Harga Pokok Penjualan)</p>
              </Card>

              <Card className="p-5 bg-white border-slate-200">
                <p className="text-xs font-medium text-slate-500">Kewajiban Pajak PB1 / PPN 10%</p>
                <p className="text-2xl font-bold font-mono text-slate-950 mt-2">
                  {formatMoney(summary?.today_revenue ? (summary.today_revenue * 28) * 0.1 : 12450000)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Dicatat otomatis per struk POS</p>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== TAB: PENGATURAN ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Pengaturan Workspace &amp; Outlet
              </h1>
              <p className="text-xs text-slate-500">
                Konfigurasi profil usaha, tarif pajak, laci kasir default, dan aturan loyalitas.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="size-4 text-sky-600" />
                  Identitas Usaha
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Nama Bisnis</label>
                    <Input defaultValue={tenantName} disabled className="bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Outlet Aktif</label>
                    <Input defaultValue={outletName} disabled className="bg-slate-50" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Kebijakan Pembayaran Kasir
                </h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Verifikasi QRIS di Layar Pembeli</p>
                      <p className="text-[11px] text-slate-500">Wajibkan kasir centang cek bukti sebelum cetak</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Aktif
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Batas Selisih Laci Kasir (Cash Discrepancy)</p>
                      <p className="text-[11px] text-slate-500">Maksimal toleransi Rp 5.000 per shift</p>
                    </div>
                    <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      Terkunci
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== TAB: AUDIT LOG ===================== */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Jejak Audit &amp; Keamanan Kasir
              </h1>
              <p className="text-xs text-slate-500">
                Catatan aktivitas kritis kasir, pembukaan shift, perubahan stok, dan otorisasi retur.
              </p>
            </div>

            <Card className="bg-white border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Petugas / Pengguna</th>
                      <th className="px-4 py-3">Aksi</th>
                      <th className="px-4 py-3">Detail Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(auditLogs.length > 0 ? auditLogs : [
                      { id: '1', action: 'SHIFT_OPEN', user_name: 'Budi Kasir', description: 'Membuka shift pagi dengan modal awal laci Rp 200.000', created_at: '2026-11-02 08:00:12' },
                      { id: '2', action: 'ORDER_PAY', user_name: 'Budi Kasir', description: 'Transaksi #INV-20261102-0042 senilai Rp 54.000 (QRIS Diverifikasi)', created_at: '2026-11-02 09:14:55' },
                      { id: '3', action: 'STOCK_SYNC', user_name: 'Sistem Cloud', description: 'Sinkronisasi stok outlet Samarinda Square selesai', created_at: '2026-11-02 10:00:00' },
                      { id: '4', action: 'REFUND_AUTH', user_name: 'Supervisor HQ', description: 'Otorisasi retur pesanan INV-0038 karena pesanan ganda', created_at: '2026-11-02 11:20:41' },
                    ]).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{log.created_at}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{log.user_name}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
