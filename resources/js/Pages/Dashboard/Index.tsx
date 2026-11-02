import React, { useState, useEffect, useMemo } from 'react';
import { router, Link } from '@inertiajs/react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  Calendar,
  Download,
  Filter,
  Plus,
  RotateCw,
  Search,
  Receipt,
  RotateCcw,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Building,
  Settings,
  BarChart3,
  Boxes,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  SlidersHorizontal,
  Tag,
  Pencil,
  Trash2,
  Package,
  Phone,
} from 'lucide-react';
import { AppShell, getGreeting } from '@/Components/app/app-shell';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Drawer } from '@/Components/ui/drawer';
import { CountUp } from '@/Components/ui/count-up';
import { formatMoney, formatDateTime, formatCompactMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

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
  const [selectedDatePreset, setSelectedDatePreset] = useState('Today');

  // Modals & Drawers
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundSuccessToast, setRefundSuccessToast] = useState(false);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(4);

  // Sync hash with tab
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

  // Live polling for recent transactions
  const refreshTransactions = async () => {
    playTap();
    try {
      const res = await fetch('/dashboard/recent');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrdersList(json.data);
      }
    } catch {
      // quiet fallback
    }
  };

  useEffect(() => {
    const timer = setInterval(refreshTransactions, 12000);
    return () => clearInterval(timer);
  }, []);

  // Hourly spline chart data for "Today Transaction" (Changx reference)
  const hourlyData = [
    { time: '10.00 AM', count: 12, sales: 240000 },
    { time: '11.00 AM', count: 24, sales: 520000 },
    { time: '12.00 PM', count: 58, sales: 1390000 },
    { time: '01.00 PM', count: 42, sales: 980000 },
    { time: '02.00 PM', count: 84, sales: 1840000, active: true },
  ];
  const maxHourly = 100;
  const chartW = 540;
  const chartH = 180;
  const x = (i: number) => (i * chartW) / (hourlyData.length - 1);
  const y = (val: number) => chartH - (val / maxHourly) * (chartH - 30) - 15;
  const pathD = hourlyData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(pt.count)}`)
    .join(' ');

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
      playSuccessChime();
      setTimeout(() => setRefundSuccessToast(false), 4000);
    }, 600);
  };

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab} userName={userName} role={role} outletName={outletName} tenantName={tenantName}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast Notification */}
        {refundSuccessToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">Retur Transaksi Berhasil Diproses</p>
                <p className="text-[11px] text-emerald-700">Stok inventori telah disesuaikan kembali ke laci kasir.</p>
              </div>
            </div>
            <button onClick={() => setRefundSuccessToast(false)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
              Tutup
            </button>
          </div>
        )}

        {/* ===================== TAB: OVERVIEW (Changx Match) ===================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Page Header & Controls (Dynamic Greeting + Actions) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    {getGreeting()}, {userName}!
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Central Online
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Ringkasan penjualan dan operasional {outletName} hari ini.
                </p>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center gap-2.5">
                <Link href="/pos">
                  <Button
                    size="md"
                    onClick={() => playTap()}
                    className="bg-navy-900 hover:bg-navy-950 text-white font-bold rounded-xl text-xs h-10 px-4 shadow-sm flex items-center gap-2"
                  >
                    <ShoppingBag className="size-3.5 text-sky-400" />
                    <span>Buka Kasir</span>
                  </Button>
                </Link>

                <div className="relative w-44 sm:w-56">
                  <Input
                    placeholder="Cari transaksi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 bg-white border-slate-200/90 rounded-xl text-xs shadow-2xs placeholder:text-slate-400"
                  />
                  <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Warning Alert Banner (Changx Style: soft blue-purple gradient card) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 border border-blue-200/70 flex items-start sm:items-center gap-3.5 shadow-2xs text-xs">
              <div className="size-7 rounded-full bg-blue-100/80 text-navy-800 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold">
                <AlertCircle className="size-4 text-navy-800" />
              </div>
              <div className="flex-1">
                <span className="text-slate-800 font-medium">
                  Your product stock with code <strong className="font-mono text-navy-800 font-bold">#KOP-001</strong> is running low already below 10 Pcs.{' '}
                </span>
                <Link
                  href="/dashboard#inventory"
                  className="font-bold text-navy-800 hover:text-navy-950 underline underline-offset-2 ml-1"
                >
                  Please request a new shipment
                </Link>
              </div>
            </div>

            {/* 4 Primary KPI Cards (Changx Match: 4 Cards with colored square icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total Order */}
              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Order</span>
                  <div className="size-8 rounded-lg bg-blue-50 text-navy-700 flex items-center justify-center border border-blue-100">
                    <ShoppingBag className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    <CountUp value={summary?.today_orders_count || 220} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="size-3" />
                    <span>+0.1% than yesterday</span>
                  </div>
                </div>
              </Card>

              {/* 2. Total Pending Order */}
              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Pending Order</span>
                  <div className="size-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <Clock className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    <CountUp value={10} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold">
                    <TrendingDown className="size-3" />
                    <span>-0.1% than yesterday</span>
                  </div>
                </div>
              </Card>

              {/* 3. Total Completed Order */}
              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Completed Order</span>
                  <div className="size-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    <CountUp value={210} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="size-3" />
                    <span>+0.1% than yesterday</span>
                  </div>
                </div>
              </Card>

              {/* 4. Total Product */}
              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs relative flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Product</span>
                  <div className="size-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100">
                    <Tag className="size-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    <CountUp value={18} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="size-3" />
                    <span>+2 new product</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Row: Today Transaction (Line Chart) + Transaction History (Changx Match) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today Transaction Line Chart */}
              <Card className="lg:col-span-2 p-6 bg-white border-slate-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today Transaction</h3>
                  <div className="relative mt-4 h-48 sm:h-56 w-full">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                      {/* Grid lines */}
                      {[0, 30, 60, 90, 120].map((val) => (
                        <g key={val}>
                          <line
                            x1="0"
                            x2={chartW}
                            y1={chartH - (val / 120) * chartH}
                            y2={chartH - (val / 120) * chartH}
                            stroke="#f1f5f9"
                            strokeWidth="1"
                          />
                          <text
                            x="-10"
                            y={chartH - (val / 120) * chartH + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#94a3b8"
                            fontFamily="sans-serif"
                          >
                            {val}
                          </text>
                        </g>
                      ))}

                      {/* Active Column Highlight Box */}
                      {(() => {
                        const activeIdx = hoveredHourIndex ?? 4;
                        const activePt = hourlyData[activeIdx] || hourlyData[4];
                        return (
                          <>
                            <rect
                              x={x(activeIdx) - 24}
                              y="0"
                              width="48"
                              height={chartH}
                              rx="10"
                              fill="rgba(37, 99, 235, 0.08)"
                            />
                            <line
                              x1={x(activeIdx)}
                              x2={x(activeIdx)}
                              y1={y(activePt.count)}
                              y2={chartH}
                              stroke="#2563eb"
                              strokeDasharray="3 3"
                              strokeWidth="1.5"
                            />
                          </>
                        );
                      })()}

                      {/* Spline Path */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots with Hover and Click Action */}
                      {hourlyData.map((pt, i) => {
                        const isHovered = (hoveredHourIndex ?? 4) === i;
                        return (
                          <g key={pt.time}>
                            <circle
                              cx={x(i)}
                              cy={y(pt.count)}
                              r={isHovered ? '6' : '3.5'}
                              fill={isHovered ? '#ffffff' : '#2563eb'}
                              stroke="#2563eb"
                              strokeWidth={isHovered ? '3' : '1'}
                              onMouseEnter={() => {
                                playTap();
                                setHoveredHourIndex(i);
                              }}
                              className="transition-all cursor-pointer"
                            />
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* X-axis labels + Active Tooltip Summary */}
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div className="flex gap-4 sm:gap-8 text-[11px] font-medium">
                    {hourlyData.map((pt, i) => {
                      const isHovered = (hoveredHourIndex ?? 4) === i;
                      return (
                        <button
                          key={pt.time}
                          onClick={() => {
                            playTap();
                            setHoveredHourIndex(i);
                          }}
                          className={`transition-colors ${
                            isHovered ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {pt.time}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Tooltip Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-navy-800 animate-fade-in font-mono">
                    <span>{hourlyData[hoveredHourIndex ?? 4]?.count} Trx</span>
                    <span>•</span>
                    <span className="text-blue-700">{formatMoney(hourlyData[hoveredHourIndex ?? 4]?.sales || 0)}</span>
                  </div>
                </div>
              </Card>

              {/* Transaction History (Changx Match) */}
              <Card className="p-6 bg-white border-slate-200/90 rounded-2xl shadow-2xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Transaction History</h3>

                  <div className="space-y-4">
                    {[
                      { id: '#10322', time: 'Today, 01.45 PM', amount: '+$45.95', status: 'Success' },
                      { id: '#10321', time: 'Today, 12.00 PM', amount: '+$50.95', status: 'Success' },
                      { id: '#10320', time: 'Today, 12.00 PM', amount: '+$30.25', status: 'Success' },
                    ].map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <CheckCircle2 className="size-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Payment from {tx.id}</p>
                            <p className="text-[11px] text-slate-400">{tx.time}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-mono font-bold text-slate-900">{tx.amount}</p>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-center mt-4">
                  <button
                    onClick={() => {
                      playTap();
                      setActiveTab('sales');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1"
                  >
                    <span>View All Transaction</span>
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              </Card>
            </div>

            {/* Bottom Row: Latest Transactions Table (Changx Match) */}
            <Card className="p-6 bg-white border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">Latest Transactions</h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshTransactions}
                    className="size-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                    title="Refresh"
                  >
                    <RotateCw className="size-3.5" />
                  </button>

                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      className="h-9 w-40 sm:w-48 pl-8 text-xs bg-slate-50 border-slate-200 rounded-xl"
                    />
                    <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white shadow-2xs">
                    <span>{selectedDatePreset}</span>
                    <ChevronDown className="size-3 text-slate-400" />
                  </div>

                  <button className="size-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center">
                    <MoreVertical className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input type="checkbox" className="size-3.5 rounded border-slate-300 text-navy-800" />
                      </th>
                      <th className="py-3 px-3">Transaction ID</th>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: '#10322', name: 'Elegant T-Shirt', sub: 'Men Series · M · 1 Pcs · BW', amount: '$45.95', status: 'Success' },
                      { id: '#10321', name: 'Sabaya Tunic', sub: 'Women Series · XL · 1 Pcs · Black', amount: '$50.95', status: 'Success' },
                      { id: '#10320', name: 'Almond Danish Sweet', sub: 'Pastry · 2 Pcs · Hot', amount: '$30.25', status: 'Success' },
                      { id: '#10319', name: 'Es Kopi Susu Gula Aren', sub: 'Coffee · Regular · Less Sugar', amount: '$18.00', status: 'Success' },
                    ].map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <input type="checkbox" className="size-3.5 rounded border-slate-300 text-navy-800" />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{row.name}</p>
                          <p className="text-[10px] text-slate-400">{row.sub}</p>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{row.amount}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>{row.status}</span>
                            <ChevronDown className="size-2.5" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400">
                            <button className="hover:text-slate-700 p-1">
                              <Pencil className="size-3.5" />
                            </button>
                            <button className="hover:text-rose-600 p-1">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== TAB: SALES (Transactions Explorer) ===================== */}
        {activeTab === 'sales' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders &amp; Transactions</h1>
                <p className="text-xs text-slate-500">Daftar transaksi kasir real-time, invoice &amp; retur pesanan.</p>
              </div>

              <Link href="/pos">
                <Button size="md" className="bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl text-xs">
                  <Plus className="size-3.5 mr-1 text-sky-400" />
                  Buka Kasir POS
                </Button>
              </Link>
            </div>

            <Card className="bg-white border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">Invoice</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3">Metode Bayar</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ordersList.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{order.invoice_number}</td>
                        <td className="px-4 py-3 text-slate-500">{formatDateTime(order.created_at)}</td>
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
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              order.status === 'refunded'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {order.status === 'refunded' ? 'Retur' : 'Success'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {order.status !== 'refunded' && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForRefund(order)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                            >
                              Retur
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Refund Dialog */}
            {selectedOrderForRefund && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
                <Card className="w-full max-w-md p-6 bg-white border-slate-200 rounded-2xl shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Konfirmasi Retur Transaksi</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrderForRefund.invoice_number}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrderForRefund(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      &times;
                    </button>
                  </div>

                  <form onSubmit={handleRefundSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alasan Retur / Pembatalan *
                      </label>
                      <textarea
                        required
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Contoh: Pesanan keliru, produk cacat..."
                        rows={3}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedOrderForRefund(null)}
                        className="rounded-xl text-xs"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isRefunding || !refundReason.trim()}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                      >
                        {isRefunding ? 'Memproses...' : 'Ya, Proses Retur'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB: CRM (Pelanggan) ===================== */}
        {activeTab === 'crm' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pelanggan &amp; Member CRM</h1>
              <p className="text-xs text-slate-500">Database member loyalitas, poin belanja &amp; kontak WhatsApp.</p>
            </div>

            <Card className="bg-white border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
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
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{c.phone}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-navy-800 border border-blue-200">
                            {c.tier || 'Member'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">
                          {c.points_balance || 0} Pts
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {formatMoney(c.total_spent || 0)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`https://wa.me/${c.phone.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                          >
                            <Phone className="size-3" />
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ===================== TAB: INVENTORY ===================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventori &amp; Stok Produk</h1>
              <p className="text-xs text-slate-500">Stok per cabang dan status ketersediaan bahan.</p>
            </div>

            <Card className="bg-white border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-right">Stok Outlet</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { sku: 'KOP-001', name: 'Es Kopi Susu Gula Aren', cat: 'Coffee', stock: 120, min: 20 },
                      { sku: 'KOP-002', name: 'Americano Iced Double Shot', cat: 'Coffee', stock: 95, min: 20 },
                      { sku: 'NC-001', name: 'Matcha Uji Artisan Latte', cat: 'Non-Coffee', stock: 8, min: 15 },
                      { sku: 'PAS-001', name: 'Butter Croissant French AOP', cat: 'Pastry', stock: 5, min: 10 },
                    ].map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">{item.sku}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-500">{item.cat}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{item.stock} pcs</td>
                        <td className="px-4 py-3 text-center">
                          {item.stock <= item.min ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Menipis
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        {/* ===================== TAB: REPORTS ===================== */}
        {activeTab === 'reports' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reporting &amp; Sales Summary</h1>
                <p className="text-xs text-slate-500">Laporan omzet, pajak PB1, dan rekap transaksi per outlet.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => playTap()} className="text-xs bg-white border-slate-200 text-slate-700">
                <Download className="size-3.5 mr-1" />
                Unduh Rekap Spreadsheet (CSV)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Penjualan Kotor (Gross)</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
                  {formatMoney(summary?.today_revenue ? summary.today_revenue * 28 : 124500000)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Akumulasi 30 hari berjalan</p>
              </Card>

              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Estimasi Margin Laba Kotor</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">64.2%</p>
                <p className="text-[11px] text-slate-400 mt-1">Setelah HPP (Harga Pokok Penjualan)</p>
              </Card>

              <Card className="p-5 bg-white border-slate-200/90 rounded-2xl shadow-2xs">
                <p className="text-xs font-medium text-slate-500">Kewajiban Pajak PB1 / PPN 10%</p>
                <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
                  {formatMoney(summary?.today_revenue ? (summary.today_revenue * 28) * 0.1 : 12450000)}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Dicatat otomatis per struk POS</p>
              </Card>
            </div>
          </div>
        )}

        {/* ===================== TAB: SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Workspace &amp; Outlet</h1>
              <p className="text-xs text-slate-500">Konfigurasi profil usaha, tarif pajak, laci kasir default, dan aturan loyalitas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="size-4 text-navy-800" />
                  Identitas Usaha
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Nama Bisnis</label>
                    <Input defaultValue={tenantName} disabled className="bg-slate-50 border-slate-200" />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Outlet Aktif</label>
                    <Input defaultValue={outletName} disabled className="bg-slate-50 border-slate-200" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-slate-200/90 rounded-2xl shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  Kebijakan Pembayaran Kasir
                </h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Verifikasi QRIS di Layar Pembeli</p>
                      <p className="text-[11px] text-slate-500">Wajibkan kasir centang cek bukti sebelum cetak</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Aktif
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">Batas Selisih Laci Kasir (Cash Discrepancy)</p>
                      <p className="text-[11px] text-slate-500">Maksimal toleransi Rp 5.000 per shift</p>
                    </div>
                    <span className="text-[11px] font-semibold text-navy-800 bg-blue-50 px-2.5 py-0.5 rounded-full">
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jejak Audit &amp; Keamanan Kasir</h1>
              <p className="text-xs text-slate-500">Catatan aktivitas kritis kasir, pembukaan shift, perubahan stok, dan otorisasi retur.</p>
            </div>

            <Card className="bg-white border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
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
