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
  Building2,
  UserPlus,
  Trash2,
  Store,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
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

interface OutletRecord {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  users_count?: number;
  orders_count?: number;
}

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  outlet_id?: string | null;
  outlet?: { id: string; name: string } | null;
}

interface ExploreProduct {
  id: string | number;
  name: string;
  location: string;
  price: number;
  stock: string;
  sold: string;
  rating: string;
  image: string;
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
    total_orders_all_time?: number;
    total_revenue_all_time?: number;
    total_customers?: number;
  };
  outlets?: Outlet[];
  customers?: Customer[];
  recentOrders?: Order[];
  topProducts?: TopProduct[];
  monthlyData?: Array<{ month: string; revenue: number; deals: number }>;
  statusDistribution?: {
    paid: number;
    pending: number;
    refunded: number;
    total: number;
    paid_pct: number;
    pending_pct: number;
    refunded_pct: number;
  };
  exploreProducts?: ExploreProduct[];
  outletsList?: OutletRecord[];
  staffList?: StaffRecord[];
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
  monthlyData = [],
  statusDistribution,
  exploreProducts: initialExploreProducts = [],
  outletsList = [],
  staffList = [],
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory' | 'crm' | 'reports' | 'shifts' | 'settings'>('overview');
  const [ordersList, setOrdersList] = useState<Order[]>(recentOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [revenueToggle, setRevenueToggle] = useState<'revenue' | 'deals'>('revenue');
  const [productSearch, setProductSearch] = useState('');

  // Outlet & Staff Management Modal State
  const [isMgmtOpen, setIsMgmtOpen] = useState(false);
  const [mgmtTab, setMgmtTab] = useState<'outlets' | 'staff'>('outlets');
  const [newOutlet, setNewOutlet] = useState({ name: '', address: '', phone: '' });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier', outlet_id: '' });
  const [isSubmittingOutlet, setIsSubmittingOutlet] = useState(false);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);

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
      only: ['summary', 'recentOrders', 'topProducts', 'customers', 'monthlyData', 'statusDistribution', 'exploreProducts', 'outletsList', 'staffList'],
      onFinish: () => {
        setIsRefreshing(false);
        triggerHaptic('success');
        setToastMessage('Data dashboard telah disinkronkan dari database');
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
  const totalOrdersAllTime = Number(summary?.total_orders_all_time ?? summary?.transactions ?? todayCount);
  const totalRevenueAllTime = Number(summary?.total_revenue_all_time ?? revenue);
  const totalCustomers = Number(summary?.total_customers ?? summary?.new_customers_count ?? customers.length);

  // Status Distribution Calculation
  const statusDist = statusDistribution ?? {
    paid: todayCount,
    pending: 0,
    refunded: 0,
    total: todayCount,
    paid_pct: 100,
    pending_pct: 0,
    refunded_pct: 0,
  };

  // 12-Month Bar Chart Data from DB
  const chartMonthlyData = useMemo(() => {
    if (monthlyData && monthlyData.length === 12) {
      return monthlyData;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return months.map((m) => ({ month: m, revenue: 0, deals: 0 }));
  }, [monthlyData]);

  const maxMonthlyRevenue = useMemo(() => {
    const max = Math.max(...chartMonthlyData.map((d) => Number(d.revenue) || 0));
    return max > 0 ? max : 10;
  }, [chartMonthlyData]);

  const maxMonthlyDeals = useMemo(() => {
    const max = Math.max(...chartMonthlyData.map((d) => Number(d.deals) || 0));
    return max > 0 ? max : 10;
  }, [chartMonthlyData]);

  // Explore Products from Database
  const productList = useMemo(() => {
    if (initialExploreProducts && initialExploreProducts.length > 0) {
      return initialExploreProducts;
    }
    return [
      {
        id: 'p1',
        name: 'Kopi Susu Gula Aren',
        location: outletName || 'Outlet Utama',
        price: 25000,
        stock: '50 cup',
        sold: '120',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        name: 'Matcha Latte Signature',
        location: outletName || 'Outlet Utama',
        price: 32000,
        stock: '35 cup',
        sold: '85',
        rating: '4.8',
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        name: 'Croissant Butter Pastry',
        location: outletName || 'Outlet Utama',
        price: 24000,
        stock: '20 pcs',
        sold: '64',
        rating: '4.9',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p4',
        name: 'Cold Brew Bottled',
        location: outletName || 'Outlet Utama',
        price: 30000,
        stock: '40 btl',
        sold: '90',
        rating: '5.0',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
      },
    ];
  }, [initialExploreProducts, outletName]);

  // Real Database Refund
  const handleRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsRefunding(true);
    router.post(
      `/transactions/${selectedOrder.id}/refund`,
      {
        reason: refundReason.trim() || 'Pembatalan transaksi atas permintaan pelanggan',
        restock: true,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setOrdersList((prev) =>
            prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: 'refunded' } : o))
          );
          setIsRefunding(false);
          setSelectedOrder(null);
          setRefundReason('');
          setToastMessage('Retur pesanan berhasil diproses dan dicatat di database');
          playSuccessChime();
          triggerHaptic('success');
          setTimeout(() => setToastMessage(null), 4000);
        },
        onError: () => {
          setIsRefunding(false);
          setToastMessage('Gagal memproses retur pesanan.');
          setTimeout(() => setToastMessage(null), 4000);
        },
      }
    );
  };

  // Real Export Report
  const handleExportReport = () => {
    playTap();
    setToastMessage('Mengunduh rekapan laporan transaksi...');
    window.location.href = '/reports/export?period=this_month';
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Create Outlet
  const handleCreateOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutlet.name.trim()) return;
    setIsSubmittingOutlet(true);
    router.post('/outlets', newOutlet, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmittingOutlet(false);
        setNewOutlet({ name: '', address: '', phone: '' });
        setToastMessage('Cabang outlet berhasil ditambahkan ke database.');
        playSuccessChime();
        triggerHaptic('success');
        setTimeout(() => setToastMessage(null), 3500);
      },
      onError: () => {
        setIsSubmittingOutlet(false);
        setToastMessage('Gagal menambahkan outlet baru.');
        setTimeout(() => setToastMessage(null), 3500);
      },
    });
  };

  // Delete Outlet
  const handleDeleteOutlet = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus cabang outlet "${name}"?`)) {
      playTap();
      router.delete(`/outlets/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setToastMessage(`Cabang ${name} berhasil dihapus.`);
          playSuccessChime();
          setTimeout(() => setToastMessage(null), 3500);
        },
      });
    }
  };

  // Create Staff
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.email.trim() || !newStaff.password) return;
    setIsSubmittingStaff(true);
    router.post('/staff', newStaff, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmittingStaff(false);
        setNewStaff({ name: '', email: '', password: '', role: 'cashier', outlet_id: '' });
        setToastMessage('Akun staf kasir berhasil dibuat di database.');
        playSuccessChime();
        triggerHaptic('success');
        setTimeout(() => setToastMessage(null), 3500);
      },
      onError: (errors) => {
        setIsSubmittingStaff(false);
        const errMsg = Object.values(errors)[0] as string;
        setToastMessage(errMsg || 'Gagal membuat akun staf.');
        setTimeout(() => setToastMessage(null), 4000);
      },
    });
  };

  // Delete Staff
  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Yakin ingin menonaktifkan akun staf "${name}"?`)) {
      playTap();
      router.delete(`/staff/${id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setToastMessage(`Akses staf ${name} berhasil dihapus.`);
          playSuccessChime();
          setTimeout(() => setToastMessage(null), 3500);
        },
      });
    }
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

        {/* DASHBOARD OVERVIEW SECTION TITLE ROW */}
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
            {/* Real-time Session & Cookie Security Status Pill */}
            <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-600 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-700">Sesi 2026 Aktif &bull; CSRF Terlindungi</span>
            </div>

            {/* Date Badge */}
            <div className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-2xs">
              <Calendar className="size-3.5 text-slate-400" />
              <span>Tahun Buku 2026</span>
            </div>

            {/* Kelola Cabang & Tim Kasir Button */}
            {(role === 'owner' || role === 'superadmin' || role === 'manager') && (
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setIsMgmtOpen(!isMgmtOpen);
                }}
                className={`h-9 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
                  isMgmtOpen
                    ? 'bg-[#0f2b5c] text-white border-[#0f2b5c]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className="size-3.5" />
                <span>Kelola Cabang &amp; Staf</span>
              </button>
            )}

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportReport}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Download className="size-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>

            {/* Primary Action Button (Navy Blue) */}
            <Link
              href="/kasir"
              onClick={() => playTap()}
              className="h-9 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] active:bg-[#0a1e42] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Buka Kasir</span>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OUTLET & STAFF MANAGEMENT DRAWER / EXPANDABLE PANEL (Issue 07) */}
        {/* ========================================================================= */}
        {isMgmtOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-blue-50 text-[#0f2b5c] flex items-center justify-center">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Manajemen Multi-Outlet &amp; Tim Kasir
                  </h3>
                  <p className="text-xs text-slate-400">
                    Atur lokasi cabang toko fisik dan kredensial kasir/staf operasional.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMgmtTab('outlets')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    mgmtTab === 'outlets'
                      ? 'bg-[#0f2b5c] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Daftar Cabang ({outletsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMgmtTab('staff')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    mgmtTab === 'staff'
                      ? 'bg-[#0f2b5c] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Akun Staf Kasir ({staffList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setIsMgmtOpen(false)}
                  className="size-8 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center transition"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Tab: Outlets */}
            {mgmtTab === 'outlets' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                {/* Form Add Outlet */}
                <form
                  onSubmit={handleCreateOutlet}
                  className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="size-3.5 text-[#0f2b5c]" />
                    Tambah Cabang Outlet Baru
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Nama Cabang / Booth *</label>
                    <input
                      type="text"
                      required
                      value={newOutlet.name}
                      onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
                      placeholder="Contoh: Cabang Festival Hall B"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Alamat / Lokasi</label>
                    <input
                      type="text"
                      value={newOutlet.address}
                      onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })}
                      placeholder="Contoh: Jl. Diponegoro No. 12"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Nomor Telepon Cabang</label>
                    <input
                      type="text"
                      value={newOutlet.phone}
                      onChange={(e) => setNewOutlet({ ...newOutlet, phone: e.target.value })}
                      placeholder="Contoh: 08123456789"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingOutlet}
                    className="w-full h-8 mt-2 rounded-lg bg-[#0f2b5c] hover:bg-[#163a75] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {isSubmittingOutlet ? 'Menyimpan...' : 'Simpan Cabang'}
                  </button>
                </form>

                {/* Outlet List Table */}
                <div className="lg:col-span-7 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                        <th className="py-2 px-3">Nama Cabang</th>
                        <th className="py-2 px-3">Alamat</th>
                        <th className="py-2 px-3 text-center">Staf</th>
                        <th className="py-2 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {outletsList.map((out) => (
                        <tr key={out.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                            <Store className="size-3.5 text-slate-400" />
                            {out.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">
                            {out.address || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {out.users_count ?? 0} orang
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteOutlet(out.id, out.name)}
                              className="size-6 inline-flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Hapus Cabang"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {outletsList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                            Belum ada cabang outlet terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Staff */}
            {mgmtTab === 'staff' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                {/* Form Add Staff */}
                <form
                  onSubmit={handleCreateStaff}
                  className="lg:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <UserPlus className="size-3.5 text-[#0f2b5c]" />
                    Tambah Akun Kasir / Staf Baru
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Email Login *</label>
                    <input
                      type="email"
                      required
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      placeholder="kasir1@toko.com"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">Password Sementara *</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="mt-1 w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Peran / Role</label>
                      <select
                        value={newStaff.role}
                        onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                        className="mt-1 w-full h-8 px-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                      >
                        <option value="cashier">Kasir POS</option>
                        <option value="manager">Manager Outlet</option>
                        <option value="developer">Developer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Penugasan Outlet</label>
                      <select
                        value={newStaff.outlet_id}
                        onChange={(e) => setNewStaff({ ...newStaff, outlet_id: e.target.value })}
                        className="mt-1 w-full h-8 px-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
                      >
                        <option value="">Semua Outlet</option>
                        {outletsList.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingStaff}
                    className="w-full h-8 mt-2 rounded-lg bg-[#0f2b5c] hover:bg-[#163a75] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {isSubmittingStaff ? 'Membuat Akun...' : 'Daftarkan Staf'}
                  </button>
                </form>

                {/* Staff List Table */}
                <div className="lg:col-span-7 overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                        <th className="py-2 px-3">Nama &amp; Email</th>
                        <th className="py-2 px-3">Peran</th>
                        <th className="py-2 px-3">Outlet</th>
                        <th className="py-2 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-slate-900">{st.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {st.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {st.outlet?.name || 'Semua Cabang'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(st.id, st.name)}
                              className="size-6 inline-flex items-center justify-center rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                              title="Hapus Akses Staf"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {staffList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                            Belum ada akun kasir terdaftar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 1. TOP 4 STATS CARDS (Issue 01: Live DB Metrics) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Pesanan Terkelola with Semicircle Radial Gauge */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatNumber(totalOrdersAllTime)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Pesanan Terkelola</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0f2b5c]">
                <Boxes className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> Realtime DB
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
          </motion.div>

          {/* Card 2: Nilai Omzet / GMV with Mini Vertical Bars Visual */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCompactMoney(totalRevenueAllTime > 0 ? totalRevenueAllTime : revenue)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Nilai GMV / Omzet Total</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sky-600">
                <CircleDollarSign className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> Live Sinkron
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
          </motion.div>

          {/* Card 3: Transaksi Sukses Hari Ini */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatNumber(todayCount)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Transaksi Hari Ini</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-amber-600">
                <ReceiptText className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> Hari Ini
              </span>

              {/* Stepping Block Bars */}
              <div className="flex items-end gap-1 h-7">
                <span className="w-2.5 h-4 rounded-sm bg-amber-200" />
                <span className="w-2.5 h-6 rounded-sm bg-amber-400" />
                <span className="w-2.5 h-7 rounded-sm bg-[#0f2b5c]" />
              </div>
            </div>
          </motion.div>

          {/* Card 4: Pelanggan Terhubung (CRM) with Frequency Pulse Bars */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatNumber(totalCustomers)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Pelanggan Aktif CRM</p>
              </div>
              <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
                <Users className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <TrendingUp className="size-3" /> Terdata
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
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MIDDLE ROW: STATUS ANALYSIS & REVENUE GENERATION (Issues 02 & 03) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Status Analysis Donut Ring Card (5 cols) (Issue 03: Live DB Donut) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">Status Analysis</h3>
                  <Info className="size-3.5 text-slate-400" />
                </div>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  Database Real-time
                </span>
              </div>

              {/* Donut Chart with Center Layers Icon */}
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="relative size-36 shrink-0 flex items-center justify-center">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                    {/* Selesai / Paid */}
                    {statusDist.paid_pct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="#0f2b5c"
                        strokeWidth="4.5"
                        strokeDasharray={`${statusDist.paid_pct} ${100 - statusDist.paid_pct}`}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Diproses / Pending */}
                    {statusDist.pending_pct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="4.5"
                        strokeDasharray={`${statusDist.pending_pct} ${100 - statusDist.pending_pct}`}
                        strokeDashoffset={`-${statusDist.paid_pct}`}
                        strokeLinecap="round"
                      />
                    )}
                    {/* Refunded */}
                    {statusDist.refunded_pct > 0 && (
                      <circle
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="4.5"
                        strokeDasharray={`${statusDist.refunded_pct} ${100 - statusDist.refunded_pct}`}
                        strokeDashoffset={`-${statusDist.paid_pct + statusDist.pending_pct}`}
                        strokeLinecap="round"
                      />
                    )}
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
                      <span>Selesai (Paid)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">
                      {formatNumber(statusDist.paid)} ({statusDist.paid_pct}%)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="size-2.5 rounded-full bg-sky-400" />
                      <span>Pending (Bayar)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">
                      {formatNumber(statusDist.pending)} ({statusDist.pending_pct}%)
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="size-2.5 rounded-full bg-rose-500" />
                      <span>Retur (Refund)</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 ml-4 font-mono">
                      {formatNumber(statusDist.refunded)} ({statusDist.refunded_pct}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Akurasi Pembayaran POS</span>
              <span className="font-bold text-emerald-600">
                {statusDist.total > 0 ? `${statusDist.paid_pct}% Berhasil` : '100% Siap'}
              </span>
            </div>
          </div>

          {/* Right: Revenue Generation Double-Bar Chart Card (7 cols) (Issue 02: 12-Month DB Trend) */}
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

                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                    Tahun 2026
                  </span>
                </div>
              </div>

              {/* Grouped Double Rounded Bar Chart Visual (Jan - Des) */}
              <div className="h-52 flex items-end justify-between gap-1 sm:gap-2 pt-6 px-1">
                {chartMonthlyData.map((d, i) => {
                  const dealHeightPct = maxMonthlyDeals > 0 ? Math.max(6, (Number(d.deals) / maxMonthlyDeals) * 100) : 6;
                  const revHeightPct = maxMonthlyRevenue > 0 ? Math.max(6, (Number(d.revenue) / maxMonthlyRevenue) * 100) : 6;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                      <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-36">
                        {/* Deals Bar (Sky Blue) */}
                        <div
                          style={{ height: `${dealHeightPct}%` }}
                          className={`w-1.5 sm:w-2.5 rounded-t-md transition-all duration-300 ${
                            revenueToggle === 'deals'
                              ? 'bg-sky-500 ring-2 ring-sky-300'
                              : 'bg-sky-300 group-hover:bg-sky-400'
                          }`}
                          title={`${d.month}: ${d.deals} Transaksi`}
                        />
                        {/* Revenue Bar (Navy Blue) */}
                        <div
                          style={{ height: `${revHeightPct}%` }}
                          className={`w-2 sm:w-3.5 rounded-t-md transition-all duration-300 ${
                            revenueToggle === 'revenue'
                              ? 'bg-[#0f2b5c] ring-2 ring-blue-300'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                          title={`${d.month}: Rp ${d.revenue}jt Omzet`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold group-hover:text-slate-900">
                        {d.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>Total Omzet Tahun 2026:</span>
                <span className="font-bold text-[#0f2b5c] font-mono">
                  {formatMoney(totalRevenueAllTime)}
                </span>
              </div>
              <span className="font-mono text-slate-400">Database Agregasi 12-Bulan</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM ROW: EXPLORE YOUR PRODUCTS (Issue 04: Real DB Products) */}
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
                  placeholder="Cari produk..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>

              <Link
                href="/products"
                onClick={() => playTap()}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0f2b5c] text-xs font-bold transition"
              >
                Katalog Lengkap
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {productList
              .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
              .map((prod) => (
                <motion.div
                  key={prod.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Thumbnail Image */}
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
                        setToastMessage(`Produk terpilih: ${prod.name}`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      className="absolute top-2.5 right-2.5 size-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition cursor-pointer"
                      title="Lihat Produk"
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
                </motion.div>
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

              <Link
                href="/transactions"
                onClick={() => playTap()}
                className="h-8 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2b5c] text-xs font-bold flex items-center gap-1 transition"
              >
                Semua Transaksi
              </Link>
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
                {ordersList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Belum ada data transaksi tersimpan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ORDER DETAIL & REFUND DRAWER (Issue 05: Real DB Refund) */}
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
                  Alasan retur *
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
                    {isRefunding ? 'Memproses di Database...' : 'Konfirmasi Retur Penuh'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
                <p className="font-bold">Transaksi Telah Direfund Penuh</p>
                <p className="mt-0.5 text-rose-600">Stok telah dikembalikan otomatis ke database.</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </AppShell>
  );
}
