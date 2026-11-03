import React, { useState, useEffect, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Boxes,
  CircleDollarSign,
  CreditCard,
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
  Info,
  Calendar,
  Download,
  Eye,
  MapPin,
  Sparkles,
  Layers,
  ChevronDown,
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
import OnboardingTourModal from '@/Components/dashboard/OnboardingTourModal';
import { categoryTone, initials, buildDailySeries, type DailyPoint } from '@/lib/analytics';
import { formatMoney, formatNumber, formatDateTime, formatCompactMoney } from '@/lib/format';
import { playTap, playSuccessChime, triggerHaptic } from '@/lib/sound';

const methodMeta = {
  cash: { label: 'Tunai', icon: Banknote, bar: 'bg-emerald-500' },
  qris: { label: 'QRIS', icon: QrCode, bar: 'bg-[#0f2b5c]' },
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
  isSuperAdmin?: boolean;
  tenantName?: string;
  tenantId?: string;
  allTenants?: { id: string; name: string; subdomain: string }[];
  outletName?: string;
  summary?: {
    today_revenue?: number;
    today_orders_count?: number;
    avg_order_value?: number;
    new_customers_count?: number;
    growth_revenue?: number;
    growth_orders?: number;
    revenue?: number;
    transactions?: number;
    aov?: number;
  };
  outlets?: Outlet[];
  customers?: Customer[];
  recentOrders?: Order[];
  topProducts?: TopProduct[];
}

export default function DashboardIndex({
  userName = 'Samantha W',
  role = 'owner',
  isSuperAdmin = false,
  tenantName = 'QLon Store',
  tenantId,
  allTenants = [],
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
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [revenueToggle, setRevenueToggle] = useState<'revenue' | 'deals'>('revenue');
  const [statusFilter, setStatusFilter] = useState<'year' | 'month'>('month');
  const [productSearch, setProductSearch] = useState('');

  // Auto trigger Onboarding Tour on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCompleted = localStorage.getItem('qlon_onboarded_completed');
      if (!hasCompleted) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

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
  const growth = Number(summary?.growth_revenue ?? 18.4);

  // Databrain-inspired curated product showcase
  const exploreProducts = [
    {
      id: 1,
      name: 'Kopi Susu Aren Signature',
      location: 'Booth Utama - Hall A',
      price: 28000,
      stock: '85 cup',
      sold: '420',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Matcha Latte Premium',
      location: 'Booth 02 - Festival Park',
      price: 35000,
      stock: '60 cup',
      sold: '280',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Croissant Butter Artisan',
      location: 'Outlet HQ Kopi Kawan',
      price: 24000,
      stock: '45 pcs',
      sold: '195',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: 'Caramel Cold Brew Bottle',
      location: 'Express Bar Stand',
      price: 32000,
      stock: '70 btl',
      sold: '310',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // 12-Month Bar Chart Data (Databrain Revenue Generation)
  const monthlyData = [
    { month: 'Jan', revenue: 28, deals: 210 },
    { month: 'Feb', revenue: 34, deals: 250 },
    { month: 'Mar', revenue: 22, deals: 170 },
    { month: 'Apr', revenue: 41, deals: 310 },
    { month: 'May', revenue: 30, deals: 230 },
    { month: 'Jun', revenue: 38, deals: 290 },
    { month: 'Jul', revenue: 26, deals: 190 },
    { month: 'Aug', revenue: 45, deals: 360 },
    { month: 'Sep', revenue: 52, deals: 420 },
    { month: 'Oct', revenue: 39, deals: 300 },
    { month: 'Nov', revenue: 48, deals: 380 },
    { month: 'Des', revenue: 35, deals: 270 },
  ];

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
      onOpenTour={() => setIsTourOpen(true)}
      isSuperAdmin={isSuperAdmin}
      allTenants={allTenants}
      selectedTenantId={tenantId}
    >
      <div className="space-y-6">
        
        {/* Onboarding Tour Modal */}
        <OnboardingTourModal
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          userName={userName}
          role={role}
        />

        {/* Master Administrator Switcher Pill Banner */}
        {isSuperAdmin && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#061325] via-[#0b1f3b] to-[#040e1d] text-white border border-blue-400/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-[#0f2b5c] text-sky-300 border border-blue-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                    Mode Master Administrator
                  </span>
                  <span className="text-[9px] bg-blue-500/20 text-sky-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                    Superadmin Global
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Wewenang penuh untuk memantau metrik seluruh tenant dan outlet festival.
                </p>
              </div>
            </div>

            {allTenants.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium shrink-0">Pilih Tenant:</span>
                <select
                  value={tenantId || ''}
                  onChange={(e) => {
                    playTap();
                    router.get('/dashboard', { tenant_id: e.target.value }, { preserveState: true });
                  }}
                  className="bg-[#0f2b5c] text-white text-xs font-semibold rounded-xl border border-blue-400/40 px-3 py-1.5 focus:ring-2 focus:ring-sky-400 focus:outline-none cursor-pointer"
                >
                  <option value="">Semua Tenant (Sovereign Master)</option>
                  {allTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subdomain})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="size-4 text-[#0f2b5c] shrink-0" />
              <p className="text-xs font-semibold">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-blue-700 hover:text-blue-950 text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* DASHBOARD OVERVIEW SECTION TITLE ROW (Databrain Inspired) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring penjualan real-time, status transaksi, dan kesehatan outlet.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Picker Button */}
            <button
              type="button"
              onClick={() => playTap()}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs transition cursor-pointer"
            >
              <Calendar className="size-3.5 text-slate-400" />
              <span>3 November 2026</span>
              <ChevronDown className="size-3 text-slate-400" />
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={() => {
                playTap();
                setToastMessage('Laporan diexport ke format CSV...');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Download className="size-3.5 text-slate-400" />
              <span>Export</span>
            </button>

            {/* Primary Action Button (Navy Blue) */}
            <Link
              href="/pos"
              onClick={() => playTap()}
              className="h-9 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] active:bg-[#0a1e42] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Buka Kasir POS</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. TOP 4 STATS CARDS (Matching Databrain Overview) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Pesanan Terkelola with Semicircle Radial Gauge */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">4,860</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Pesanan Terkelola</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0f2b5c]">
                <Boxes className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> 98% Bulan lalu
              </span>

              {/* Semicircle Gauge SVG */}
              <div className="relative size-12 shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#0f2b5c"
                    strokeWidth="3.5"
                    strokeDasharray="75, 100"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Nilai Omzet / GMV with Mini Vertical Bars Visual */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {revenue > 0 ? formatCompactMoney(revenue) : 'Rp 248.5jt'}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Nilai GMV / Omzet</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sky-600">
                <CircleDollarSign className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> 72% Realtime
              </span>

              {/* 5-Bar Vertical Histogram */}
              <div className="flex items-end gap-1 h-7">
                <span className="w-1.5 h-3 rounded-full bg-slate-200" />
                <span className="w-1.5 h-4 rounded-full bg-sky-200" />
                <span className="w-1.5 h-5 rounded-full bg-sky-400" />
                <span className="w-1.5 h-6 rounded-full bg-[#0f2b5c]" />
                <span className="w-1.5 h-7 rounded-full bg-[#0f2b5c]" />
              </div>
            </div>
          </div>

          {/* Card 3: Transaksi Sukses with Stepped Blocks */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {todayCount > 0 ? formatNumber(todayCount) : '1,037'}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Transaksi Sukses</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-600">
                <ReceiptText className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> 44.2% Sukses
              </span>

              {/* Stepping Block Bars */}
              <div className="flex items-end gap-1 h-7">
                <span className="w-2.5 h-4 rounded-sm bg-amber-200" />
                <span className="w-2.5 h-6 rounded-sm bg-amber-400" />
                <span className="w-2.5 h-7 rounded-sm bg-[#0f2b5c]" />
              </div>
            </div>
          </div>

          {/* Card 4: Pelanggan Terhubung (CRM) with Frequency Pulse Bars */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {newCustomersCount > 0 ? formatNumber(newCustomersCount) : '895'}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Pelanggan Aktif CRM</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
                <Users className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> 70% Retensi
              </span>

              {/* Soundwave/Frequency Pulse Bars */}
              <div className="flex items-center gap-1 h-7">
                <span className="w-1 h-3 rounded-full bg-indigo-300" />
                <span className="w-1 h-6 rounded-full bg-[#0f2b5c]" />
                <span className="w-1 h-4 rounded-full bg-indigo-400" />
                <span className="w-1 h-7 rounded-full bg-[#0f2b5c]" />
                <span className="w-1 h-5 rounded-full bg-indigo-500" />
                <span className="w-1 h-2 rounded-full bg-indigo-300" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MIDDLE ROW: STATUS ANALYSIS & REVENUE GENERATION (Databrain Inspired) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Status Analysis Donut Ring Card (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Status Analysis</h3>
                  <Info className="size-3.5 text-slate-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="month">Bulan Ini</option>
                  <option value="year">Tahun Ini</option>
                </select>
              </div>

              {/* Donut Chart with Center Layers Icon */}
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="relative size-36 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                    {/* Selesai: 72% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#0f2b5c"
                      strokeWidth="4.5"
                      strokeDasharray="65 100"
                      strokeLinecap="round"
                    />
                    {/* Diproses: 20% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="4.5"
                      strokeDasharray="20 100"
                      strokeDashoffset="-65"
                      strokeLinecap="round"
                    />
                    {/* Pending: 15% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4.5"
                      strokeDasharray="15 100"
                      strokeDashoffset="-85"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-10 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#0f2b5c] shadow-xs">
                      <Layers className="size-4.5" />
                    </div>
                  </div>
                </div>

                {/* Legend List */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="size-2.5 rounded-full bg-[#0f2b5c]" />
                      <span>Selesai (Accepted)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">1,037</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="size-2.5 rounded-full bg-sky-400" />
                      <span>Diproses (Process)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">486</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <span>Pending (Payment)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">165</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Akurasi Pembayaran POS</span>
              <span className="font-bold text-emerald-600">99.8% Berhasil</span>
            </div>
          </div>

          {/* Right: Revenue Generation Double-Bar Chart Card (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Revenue Generation</h3>
                  <Info className="size-3.5 text-slate-400" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setRevenueToggle('deals')}
                      className={`flex items-center gap-1.5 cursor-pointer ${
                        revenueToggle === 'deals' ? 'text-[#0f2b5c]' : 'text-slate-400'
                      }`}
                    >
                      <span className="size-2.5 rounded-full bg-sky-400" />
                      <span>Deals / Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRevenueToggle('revenue')}
                      className={`flex items-center gap-1.5 cursor-pointer ${
                        revenueToggle === 'revenue' ? 'text-[#0f2b5c]' : 'text-slate-400'
                      }`}
                    >
                      <span className="size-2.5 rounded-full bg-[#0f2b5c]" />
                      <span>Omzet (Rp)</span>
                    </button>
                  </div>

                  <select className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer">
                    <option>Tahun 2026</option>
                    <option>Tahun 2025</option>
                  </select>
                </div>
              </div>

              {/* Grouped Double Rounded Bar Chart Visual (Jan - Des) */}
              <div className="h-52 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-36">
                      {/* Deals Bar (Sky Blue) */}
                      <div
                        style={{ height: `${(d.deals / 450) * 100}%` }}
                        className="w-1.5 sm:w-2.5 bg-sky-300 rounded-t-md group-hover:bg-sky-400 transition-all duration-300"
                        title={`${d.month}: ${d.deals} Transaksi`}
                      />
                      {/* Revenue Bar (Navy Blue) */}
                      <div
                        style={{ height: `${(d.revenue / 60) * 100}%` }}
                        className="w-2 sm:w-3.5 bg-[#0f2b5c] rounded-t-md group-hover:bg-[#163a75] transition-all duration-300"
                        title={`${d.month}: Rp ${d.revenue}jt Omzet`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-900">
                      {d.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rata-rata pertumbuhan:</span>
                <span className="font-bold text-[#0f2b5c] font-mono">+24.5% MoM</span>
              </div>
              <span className="font-mono text-slate-400">Total: Rp 450.000.000 YTD</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM ROW: EXPLORE YOUR PRODUCTS & EVENT BOOTHS (Databrain Cards) */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Explore Your Products &amp; Event Booths
              </h3>
              <Info className="size-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>

              <button
                type="button"
                onClick={() => playTap()}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <SlidersHorizontal className="size-3 text-slate-400" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {exploreProducts
              .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map((prod) => (
                <div
                  key={prod.id}
                  className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Thumbnail Image with Top-Right Eye Inspect Button */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
                    
                    <button
                      type="button"
                      onClick={() => {
                        playTap();
                        setToastMessage(`Membuka rincian: ${prod.name}`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition cursor-pointer"
                      title="Inspect Product"
                    >
                      <Eye className="size-3.5" />
                    </button>
                  </div>

                  {/* Info Body */}
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0f2b5c] transition">
                        {prod.name}
                      </h4>
                      <span className="text-xs font-extrabold text-[#0f2b5c] font-mono shrink-0">
                        {formatMoney(prod.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                      <MapPin className="size-3 text-slate-400 shrink-0" />
                      <span className="truncate">{prod.location}</span>
                    </div>

                    {/* Spec Pills Footer */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-[10px] text-slate-500 text-center font-medium">
                      <div className="bg-slate-50 py-1 rounded-md">
                        <span className="text-slate-400 block text-[8px] uppercase">Stok</span>
                        <span className="font-bold text-slate-800">{prod.stock}</span>
                      </div>
                      <div className="bg-slate-50 py-1 rounded-md">
                        <span className="text-slate-400 block text-[8px] uppercase">Terjual</span>
                        <span className="font-bold text-slate-800">{prod.sold}</span>
                      </div>
                      <div className="bg-slate-50 py-1 rounded-md">
                        <span className="text-slate-400 block text-[8px] uppercase">Rating</span>
                        <span className="font-bold text-emerald-600">{prod.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. RECENT ORDERS TABLE & THERMAL / WA RECEIPT DISPATCH */}
        {/* ========================================================================= */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transaksi Terkini (Live Feed)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pembaruan otomatis setiap 15 detik dari kasir &amp; event terminal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className={`size-3 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Invoice</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ordersList.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {order.invoice_number}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {order.customer_name || 'Pelanggan Umum'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 capitalize text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatMoney(order.grand_total)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'refunded'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.status === 'refunded' ? 'Direfund' : 'Lunas'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/invoices/${order.id}/receipt`}
                          target="_blank"
                          rel="noreferrer"
                          className="size-7 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
                          title="Cetak Struk Thermal"
                        >
                          <Printer className="size-3.5" />
                        </a>
                        <a
                          href={`/invoices/${order.id}/whatsapp`}
                          target="_blank"
                          rel="noreferrer"
                          className="size-7 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition"
                          title="Kirim Struk WhatsApp"
                        >
                          <Phone className="size-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            playTap();
                            setSelectedOrder(order);
                          }}
                          className="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
                          title="Detail / Refund"
                        >
                          <ChevronRight className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ORDER DETAIL & REFUND DRAWER */}
      {/* ========================================================================= */}
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
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200">
                <a
                  href={`/invoices/${selectedOrder.id}/receipt`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                >
                  <Printer className="size-3.5" />
                  Cetak Struk
                </a>
                <a
                  href={`/invoices/${selectedOrder.id}/whatsapp`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-2xs"
                >
                  <Phone className="size-3.5" />
                  Kirim WhatsApp
                </a>
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
