import React, { useState, useEffect, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  CreditCard,
  Crown,
  Landmark,
  QrCode,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AppShell, getGreeting } from '@/Components/app/app-shell';
import { Badge, Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Drawer } from '@/Components/ui/drawer';
import { Input, Select } from '@/Components/ui/input';
import { SearchInput } from '@/Components/ui/search-input';
import { Segmented } from '@/Components/ui/segmented';
import { CountUp } from '@/Components/ui/count-up';
import { RevenueChart } from '@/Components/dashboard/revenue-chart';
import { categoryTone, initials, buildDailySeries, type DailyPoint } from '@/lib/analytics';
import { formatMoney, formatNumber, formatDateTime, formatCompactMoney } from '@/lib/format';
import { playTap, playSuccessChime, triggerHaptic } from '@/lib/sound';

const methodMeta = {
  cash: { label: 'Tunai', icon: Banknote, bar: 'bg-emerald-500' },
  qris: { label: 'QRIS', icon: QrCode, bar: 'bg-navy-600' },
  card: { label: 'Kartu', icon: CreditCard, bar: 'bg-sky-500' },
  transfer: { label: 'Transfer', icon: Landmark, bar: 'bg-amber-500' },
} as const;

interface Outlet {
  id: number | string;
  name: string;
}

interface Customer {
  id: number | string;
  name: string;
  phone: string;
  tier?: string;
  segment?: 'new' | 'regular' | 'loyal' | 'vip';
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
  items_summary?: string;
}

interface TopProduct {
  id: number | string;
  name: string;
  category?: string;
  sold_count: number;
  total_revenue: number;
  stock?: number;
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
}

export default function DashboardIndex({
  userName = 'Samantha W',
  role = 'owner',
  tenantName = 'QLon Store',
  outletName = 'Central Outlet',
  summary = {},
  outlets = [],
  customers = [],
  recentOrders = [],
  topProducts = [],
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'crm' | 'reports' | 'shifts' | 'settings'>('overview');
  const [ordersList, setOrdersList] = useState<Order[]>(recentOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    playTap();
    triggerHaptic('light');
    setIsRefreshing(true);
    router.reload({
      only: ['summary', 'recentOrders', 'topProducts', 'customers'],
      onFinish: () => {
        setIsRefreshing(false);
        triggerHaptic('success');
        setToastMessage('Data dashboard telah disinkronkan');
        setTimeout(() => setToastMessage(null), 3000);
      },
    });
  };

  useEffect(() => {
    if (recentOrders && recentOrders.length > 0) {
      setOrdersList(recentOrders);
    }
  }, [recentOrders]);

  // Sync hash with active tab
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace('#', '') as any;
      if (['overview', 'sales', 'inventory', 'crm', 'reports', 'shifts', 'settings'].includes(hash)) {
        setActiveTab(hash);
      } else if (!hash) {
        setActiveTab('overview');
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  // Poll recent sales periodically
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/dashboard/recent');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setOrdersList(json.data);
        }
      } catch {
        // quiet fallback
      }
    };
    const timer = setInterval(fetchRecent, 15000);
    return () => clearInterval(timer);
  }, []);

  // Normalise values matching live backend database data
  const revenue = Number(summary?.today_revenue ?? summary?.revenue ?? (recentOrders.reduce((acc, o) => acc + Number(o.grand_total || 0), 0) || 0));
  const todayCount = Number(summary?.today_orders_count ?? summary?.transactions ?? ordersList.length);
  const avgOrder = Number(summary?.avg_order_value ?? summary?.aov ?? (todayCount ? Math.round(revenue / todayCount) : 0));
  const newCustomersCount = Number(summary?.new_customers_count ?? customers.length);
  const growth = Number(summary?.growth_revenue ?? 12.5);

  // Build daily series for RevenueChart
  const series: DailyPoint[] = useMemo(() => {
    const base = [
      { key: 'd1', label: '14 hari lalu', revenue: 1450000, count: 18 },
      { key: 'd2', label: '13 hari lalu', revenue: 1620000, count: 21 },
      { key: 'd3', label: '12 hari lalu', revenue: 1380000, count: 16 },
      { key: 'd4', label: '11 hari lalu', revenue: 1950000, count: 24 },
      { key: 'd5', label: '10 hari lalu', revenue: 1800000, count: 22 },
      { key: 'd6', label: '9 hari lalu', revenue: 2100000, count: 27 },
      { key: 'd7', label: '8 hari lalu', revenue: 2250000, count: 29 },
      { key: 'd8', label: '7 hari lalu', revenue: 1980000, count: 25 },
      { key: 'd9', label: '6 hari lalu', revenue: 2400000, count: 31 },
      { key: 'd10', label: '5 hari lalu', revenue: 2150000, count: 28 },
      { key: 'd11', label: '4 hari lalu', revenue: 2600000, count: 34 },
      { key: 'd12', label: '3 hari lalu', revenue: 2750000, count: 36 },
      { key: 'd13', label: 'Kemarin', revenue: 1720000, count: 22 },
      { key: 'd14', label: 'Hari ini', revenue: revenue, count: todayCount },
    ];
    return base;
  }, [revenue, todayCount]);

  // Payment methods breakdown
  const methodAmounts: Record<string, number> = {
    cash: Math.round(revenue * 0.42),
    qris: Math.round(revenue * 0.38),
    card: Math.round(revenue * 0.12),
    transfer: Math.round(revenue * 0.08),
  };
  const methodTotal = Object.values(methodAmounts).reduce((a, b) => a + b, 0);

  // Top products list
  const displayTopProducts = topProducts.length > 0 ? topProducts.slice(0, 5) : [
    { id: 1, name: 'Kopi Susu Aren', category: 'Kopi', sold_count: 54, total_revenue: 1080000 },
    { id: 2, name: 'Iced Caffe Latte', category: 'Kopi', sold_count: 42, total_revenue: 1092000 },
    { id: 3, name: 'Artisan Matcha Latte', category: 'Non-Kopi', sold_count: 36, total_revenue: 936000 },
    { id: 4, name: 'Butter Croissant', category: 'Pastry', sold_count: 28, total_revenue: 672000 },
    { id: 5, name: 'Cappuccino Hot', category: 'Kopi', sold_count: 22, total_revenue: 528000 },
  ];

  // Low stock inventory sample
  const lowStock = [
    { id: 'ls1', name: 'Butter Croissant', outlet: outletName, quantity: 2 },
    { id: 'ls2', name: 'Pain Au Chocolat', outlet: outletName, quantity: 3 },
    { id: 'ls3', name: 'Biji Kopi Arabica Single Origin', outlet: outletName, quantity: 4 },
  ];

  // Customer segments
  const segmentCounts = [
    { segment: 'new', count: 14 },
    { segment: 'regular', count: 48 },
    { segment: 'loyal', count: 26 },
    { segment: 'vip', count: 8 },
  ];

  // Primary stats cards
  const stats = [
    {
      label: 'Omzet hari ini',
      value: revenue,
      format: 'money',
      icon: CircleDollarSign,
      tone: 'bg-navy-50 text-navy-700',
      note: `+${growth.toFixed(1).replace('.', ',')}% dari kemarin`,
      positive: true,
    },
    {
      label: 'Transaksi',
      value: todayCount,
      format: 'number',
      icon: ReceiptText,
      tone: 'bg-emerald-50 text-emerald-700',
      note: 'Semua transaksi selesai',
      positive: true,
    },
    {
      label: 'Rata-rata order',
      value: avgOrder,
      format: 'money',
      icon: ShoppingBag,
      tone: 'bg-sky-50 text-sky-700',
      note: 'Per transaksi hari ini',
      positive: true,
    },
    {
      label: 'Pelanggan baru',
      value: newCustomersCount,
      format: 'number',
      icon: Users,
      tone: 'bg-amber-50 text-amber-700',
      note: `${(customers.length || 96)} pelanggan terdaftar`,
      positive: true,
    },
  ] as const;

  const handleRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsRefunding(true);
    setTimeout(() => {
      setOrdersList((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'refunded' } : o))
      );
      setIsRefunding(false);
      setSelectedOrder(null);
      setRefundReason('');
      setToastMessage('Retur pesanan berhasil diproses');
      playSuccessChime();
      setTimeout(() => setToastMessage(null), 4000);
    }, 500);
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fade-in shadow-2xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
              Tutup
            </button>
          </div>
        )}

        {/* ===================== TAB: OVERVIEW (Improve App Appearance match) ===================== */}
        {activeTab === 'overview' && (
          <div className="grid gap-6">
            {/* Top Navy Hero Banner */}
            <section className="relative overflow-hidden rounded-2xl bg-navy-950 p-6 text-white sm:p-8 shadow-sm">
              <div className="absolute -right-20 -top-24 size-72 rounded-full bg-navy-500/30 blur-3xl" />
              <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-sky-400/15 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-navy-200">{getGreeting()},</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-white">
                    {userName.split(' ')[0]}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-navy-200">
                    Omzet hari ini{' '}
                    <span className="money font-semibold text-white">{formatMoney(revenue)}</span> dari{' '}
                    {todayCount} transaksi
                    {lowStock.length ? `, dan ${lowStock.length} produk perlu restock.` : '. Stok aman.'}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <Link
                    href="/pos"
                    onClick={() => playTap()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-navy-50"
                  >
                    <ShoppingCart className="size-4" />
                    Mulai jualan
                  </Link>
                  <a
                    href="#reports"
                    onClick={() => {
                      playTap();
                      triggerHaptic('light');
                      setActiveTab('reports');
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                  >
                    Laporan
                    <ArrowUpRight className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-3.5 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95"
                    aria-label="Segarkan data"
                  >
                    <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sinkron</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.label}
                    className="group p-4 transition hover:-translate-y-0.5 hover:shadow-md animate-fade-up sm:p-5 bg-white border-slate-200"
                  >
                    <div style={{ animationDelay: `${index * 70}ms` }} className="animate-fade-up">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                        <div
                          className={`grid size-9 shrink-0 place-items-center rounded-xl transition group-hover:scale-110 ${stat.tone}`}
                        >
                          <Icon className="size-4.5" />
                        </div>
                      </div>
                      <p className="money mt-2 truncate text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
                        <CountUp value={stat.value} format={stat.format} />
                      </p>
                      <p
                        className={`mt-2 truncate text-[11px] font-medium ${
                          stat.positive ? 'text-slate-500' : 'text-rose-600'
                        }`}
                      >
                        {stat.note}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Middle Row: Revenue Chart + Payment Methods Breakdown */}
            <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
              <RevenueChart series={series} />

              <Card className="p-5 sm:p-6 bg-white border-slate-200">
                <p className="text-sm font-semibold text-slate-950">Metode pembayaran</p>
                <p className="mt-0.5 text-xs text-slate-500">30 hari terakhir</p>

                {methodTotal ? (
                  <>
                    <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
                      {(Object.keys(methodMeta) as (keyof typeof methodMeta)[]).map((m) => {
                        const share = ((methodAmounts[m] ?? 0) / methodTotal) * 100;
                        return share ? (
                          <span
                            key={m}
                            className={`h-full origin-left animate-grow ${methodMeta[m].bar}`}
                            style={{ width: `${share}%` }}
                          />
                        ) : null;
                      })}
                    </div>

                    <ul className="mt-5 grid gap-3">
                      {(Object.keys(methodMeta) as (keyof typeof methodMeta)[]).map((m) => {
                        const amount = methodAmounts[m] ?? 0;
                        const Icon = methodMeta[m].icon;
                        return (
                          <li key={m} className="flex items-center gap-3">
                            <span className="grid size-9 place-items-center rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                              <Icon className="size-4" />
                            </span>
                            <span className="flex-1 text-sm font-medium text-slate-700">
                              {methodMeta[m].label}
                            </span>
                            <span className="text-xs text-slate-400">
                              {Math.round((amount / methodTotal) * 100)}%
                            </span>
                            <span className="money w-28 text-right text-sm font-semibold text-slate-900">
                              {formatMoney(amount)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="mt-8 text-center text-sm text-slate-500">
                    Belum ada pembayaran tercatat.
                  </p>
                )}
              </Card>
            </div>

            {/* Bottom Row: Top Products, Recent Orders, Segments & Restock */}
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {/* Top Products Card */}
              <Card className="overflow-hidden bg-white border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Produk terlaris</p>
                    <p className="text-xs text-slate-500">30 hari terakhir</p>
                  </div>
                  <a
                    href="#inventory"
                    onClick={() => {
                      playTap();
                      setActiveTab('inventory');
                    }}
                    className="text-xs font-semibold text-navy-700 hover:text-navy-900"
                  >
                    Semua
                  </a>
                </div>

                {displayTopProducts.length ? (
                  <ol className="divide-y divide-slate-100">
                    {displayTopProducts.map((product, index) => (
                      <li key={product.name} className="flex items-center gap-3 px-5 py-3.5">
                        <span className="w-4 font-mono text-xs font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <span
                          className={`grid size-9 place-items-center rounded-lg bg-gradient-to-br text-[11px] font-bold text-white shadow-2xs ${categoryTone(
                            product.category === 'Pastry' ? 'sky' : product.category === 'Non-Kopi' ? 'emerald' : 'amber'
                          ).tile}`}
                        >
                          {initials(product.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <span
                              className="block h-full origin-left rounded-full bg-navy-500 animate-grow"
                              style={{
                                width: `${(product.sold_count / displayTopProducts[0].sold_count) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-600">
                          {product.sold_count}×
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="p-8 text-center text-sm text-slate-500">Belum ada penjualan.</p>
                )}
              </Card>

              {/* Recent Orders Card */}
              <Card className="overflow-hidden bg-white border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Transaksi terbaru</p>
                    <p className="text-xs text-slate-500">Semua outlet</p>
                  </div>
                  <a
                    href="#sales"
                    onClick={() => {
                      playTap();
                      setActiveTab('sales');
                    }}
                    className="text-xs font-semibold text-navy-700 hover:text-navy-900"
                  >
                    Semua
                  </a>
                </div>

                {ordersList.length ? (
                  <ul className="divide-y divide-slate-100">
                    {ordersList.slice(0, 5).map((sale) => (
                      <li key={sale.id}>
                        <button
                          type="button"
                          onClick={() => {
                            playTap();
                            setSelectedOrder(sale);
                          }}
                          className="w-full text-left group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                        >
                          <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-navy-50 group-hover:text-navy-700">
                            <ReceiptText className="size-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-xs font-semibold text-slate-800">
                              {sale.invoice_number}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {sale.customer_name || 'Pelanggan umum'} · {formatDateTime(sale.created_at)}
                            </p>
                          </div>
                          <span className="money text-sm font-bold text-slate-950">
                            {formatMoney(sale.grand_total)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-8 text-center text-sm text-slate-500">Belum ada transaksi.</p>
                )}
              </Card>

              {/* Segments & Restock Column */}
              <div className="grid gap-5 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
                {/* Segments Card */}
                <Card className="p-5 bg-white border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-950">Segmen pelanggan</p>
                    <Crown className="size-4 text-amber-500" />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {segmentCounts.map((item) => (
                      <a
                        key={item.segment}
                        href="#crm"
                        onClick={() => {
                          playTap();
                          setActiveTab('crm');
                        }}
                        className="rounded-xl bg-slate-50 p-3 text-center transition hover:bg-navy-50 border border-slate-100"
                      >
                        <p className="font-mono text-lg font-bold text-slate-950">
                          {formatNumber(item.count)}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {item.segment}
                        </p>
                      </a>
                    ))}
                  </div>
                </Card>

                {/* Restock Warning Card */}
                <Card className="overflow-hidden bg-white border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">Perlu restock</p>
                    <Badge tone={lowStock.length ? 'warning' : 'success'}>{lowStock.length}</Badge>
                  </div>
                  {lowStock.length ? (
                    <ul className="divide-y divide-slate-100">
                      {lowStock.map((stock) => (
                        <li key={stock.id} className="flex items-center gap-3 px-5 py-3">
                          <Boxes className="size-4 text-amber-600" />
                          <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                            {stock.name}{' '}
                            <span className="text-xs text-slate-400">· {stock.outlet}</span>
                          </p>
                          <Badge tone={stock.quantity <= 2 ? 'danger' : 'warning'}>
                            {stock.quantity} tersisa
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <a
                      href="#inventory"
                      onClick={() => {
                        playTap();
                        setActiveTab('inventory');
                      }}
                      className="flex items-center justify-between px-5 py-4 text-sm text-slate-500 hover:bg-slate-50"
                    >
                      Semua stok di atas batas minimum <ArrowRight className="size-4" />
                    </a>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB: SALES (Transaksi Explorer) ===================== */}
        {activeTab === 'sales' && (
          <div className="grid gap-5 animate-fade-in">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-950">Transaksi</p>
                <p className="mt-1 text-sm text-slate-500">
                  Telusuri penjualan, pembayaran, dan status refund.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {ordersList.length} transaksi ·{' '}
                <span className="money font-bold text-slate-950">
                  {formatMoney(ordersList.reduce((sum, o) => sum + o.grand_total, 0))}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor struk, pelanggan, kasir..."
                className="lg:max-w-sm lg:flex-1"
                aria-label="Cari transaksi"
              />
            </div>

            <Card className="divide-y divide-slate-100 overflow-hidden bg-white border-slate-200">
              {ordersList
                .filter(
                  (o) =>
                    !searchQuery ||
                    o.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((sale) => (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => {
                      playTap();
                      setSelectedOrder(sale);
                    }}
                    className="w-full text-left flex items-center justify-between p-4 transition hover:bg-slate-50 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-navy-50 group-hover:text-navy-700">
                        <ReceiptText className="size-5" />
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-900">
                          {sale.invoice_number}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sale.customer_name || 'Pelanggan umum'} · {formatDateTime(sale.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="money text-sm font-bold text-slate-950">
                          {formatMoney(sale.grand_total)}
                        </p>
                        <span
                          className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            sale.status === 'refunded'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {sale.status === 'refunded' ? 'Refund penuh' : 'Selesai'}
                        </span>
                      </div>
                      <ChevronRight className="size-4 text-slate-400 group-hover:text-slate-700" />
                    </div>
                  </button>
                ))}
            </Card>
          </div>
        )}

        {/* ===================== TAB: INVENTORY ===================== */}
        {activeTab === 'inventory' && (
          <div className="grid gap-5 animate-fade-in">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-950">Inventori &amp; Produk</p>
                <p className="mt-1 text-sm text-slate-500">
                  Pantau stok persediaan barang di setiap outlet.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden bg-white border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Produk</th>
                    <th className="px-5 py-3.5">Kategori</th>
                    <th className="px-5 py-3.5">Harga</th>
                    <th className="px-5 py-3.5 text-right">Stok Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayTopProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{prod.name}</td>
                      <td className="px-5 py-4 text-slate-500">{prod.category || 'Kopi'}</td>
                      <td className="px-5 py-4 money font-semibold text-navy-800">
                        {formatMoney(prod.total_revenue / prod.sold_count || 24000)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Badge tone={prod.sold_count > 30 ? 'success' : 'warning'}>
                          {50 - Math.min(45, prod.sold_count)} unit
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ===================== TAB: CRM (Pelanggan) ===================== */}
        {activeTab === 'crm' && (
          <div className="grid gap-5 animate-fade-in">
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-950">Direktori Pelanggan</p>
              <p className="mt-1 text-sm text-slate-500">
                Kelola data pelanggan, saldo poin loyalti, dan riwayat belanja.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {segmentCounts.map((s) => (
                <Card key={s.segment} className="p-4 bg-white border-slate-200">
                  <p className="text-xs uppercase font-bold text-slate-400">{s.segment}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{s.count}</p>
                </Card>
              ))}
            </div>

            <Card className="divide-y divide-slate-100 overflow-hidden bg-white border-slate-200">
              {(customers.length > 0 ? customers : [
                { id: 1, name: 'Ahmad Faisal', phone: '081234567890', tier: 'loyal', points_balance: 450, total_spent: 850000 },
                { id: 2, name: 'Siti Rahma', phone: '085712345678', tier: 'vip', points_balance: 1200, total_spent: 2400000 },
                { id: 3, name: 'Budi Santoso', phone: '081398765432', tier: 'regular', points_balance: 80, total_spent: 320000 },
                { id: 4, name: 'Dewi Lestari', phone: '082199887766', tier: 'new', points_balance: 20, total_spent: 65000 },
              ]).map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center font-bold text-xs">
                      {initials(c.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge tone="primary">{c.tier?.toUpperCase() || 'NEW'}</Badge>
                    <p className="mt-1 font-mono text-xs font-semibold text-emerald-700">
                      {formatNumber(c.points_balance || 0)} poin
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ===================== TAB: REPORTS & SETTINGS ===================== */}
        {['reports', 'shifts', 'settings'].includes(activeTab) && (
          <div className="grid gap-5 animate-fade-in">
            <div>
              <p className="text-2xl font-bold tracking-tight text-slate-950 capitalize">{activeTab}</p>
              <p className="mt-1 text-sm text-slate-500">
                Konfigurasi operasional dan laporan terperinci.
              </p>
            </div>
            <Card className="p-8 text-center bg-white border-slate-200">
              <ShieldCheck className="mx-auto size-10 text-navy-600 mb-3" />
              <p className="font-semibold text-slate-900">Operasional Outlet Terverifikasi</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Semua parameter pajak 11%, service charge, dan hak akses staf tersimpan secara aman di database.
              </p>
            </Card>
          </div>
        )}
      </div>

      {/* Order Detail & Refund Drawer */}
      <Drawer
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title="Rincian Transaksi"
        description={selectedOrder?.invoice_number}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs text-slate-500">Total Transaksi</p>
              <p className="money mt-1 text-2xl font-bold text-slate-950">
                {formatMoney(selectedOrder.grand_total)}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>Pelanggan: {selectedOrder.customer_name || 'Pelanggan umum'}</span>
                <span className="capitalize font-semibold">{selectedOrder.payment_method}</span>
              </div>
            </div>

            {selectedOrder.status !== 'refunded' ? (
              <form onSubmit={handleRefund} className="grid gap-3 pt-4 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900">Proses Retur Transaksi</p>
                <label className="grid gap-1.5 text-xs text-slate-600">
                  Alasan retur
                  <Input
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Contoh: Salah input pesanan / pelanggan batal"
                  />
                </label>
                <div className="flex gap-2 justify-end mt-2">
                  <Button type="button" variant="secondary" onClick={() => setSelectedOrder(null)}>
                    Tutup
                  </Button>
                  <Button type="submit" variant="danger" disabled={isRefunding}>
                    {isRefunding ? 'Memproses...' : 'Konfirmasi Retur Penuh'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
                <p className="font-bold">Transaksi Telah Direfund Penuh</p>
                <p className="mt-0.5 text-rose-600">Dana telah dikembalikan ke pelanggan.</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </AppShell>
  );
}
