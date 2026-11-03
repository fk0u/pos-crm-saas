import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Coins,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Store,
  Calendar,
  Building2,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { formatMoney } from '@/lib/format';
import { playTap } from '@/lib/sound';

interface FinanceMetrics {
  gross_sales: number;
  discounts: number;
  tax: number;
  net_sales: number;
  cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  operational_expenses: number;
  net_profit: number;
  net_margin_pct: number;
  transactions: number;
  period_label: string;
  period: string;
}

interface OutletBreakdownItem {
  id: string;
  name: string;
  transactions: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  margin: number;
}

interface MonthlyTrendItem {
  month: string;
  revenue: number;
  cogs: number;
  profit: number;
  raw_revenue: number;
  raw_profit: number;
}

interface OutletOption {
  id: string;
  name: string;
}

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
}

interface FinanceIndexProps {
  metrics: FinanceMetrics;
  outletBreakdown: OutletBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  outlets: OutletOption[];
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

export default function FinanceIndex({
  metrics,
  outletBreakdown = [],
  monthlyTrend = [],
  outlets = [],
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: FinanceIndexProps) {
  const [period, setPeriod] = useState(metrics.period || 'this_month');
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  const handlePeriodChange = (newPeriod: string) => {
    playTap();
    setPeriod(newPeriod);
    router.get('/finance', { period: newPeriod, outlet_id: selectedOutlet === 'all' ? undefined : selectedOutlet }, { preserveState: true });
  };

  const handleOutletChange = (newOutlet: string) => {
    playTap();
    setSelectedOutlet(newOutlet);
    router.get('/finance', { period, outlet_id: newOutlet === 'all' ? undefined : newOutlet }, { preserveState: true });
  };

  const maxMonthlyRevenue = Math.max(...monthlyTrend.map((m) => m.revenue), 1);

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="finance"
    >
      <Head title="Keuangan & Laba Rugi - QLon POS & CRM" />

      <div className="space-y-6">
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Platform Superadmin Multi-Tenant Scope</p>
                <p className="text-[11px] text-sky-200">
                  Melihat laporan laba rugi untuk tenant: <strong className="text-white underline">{tenantName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="saasTenantSelect" className="text-[11px] text-sky-200 shrink-0 font-medium">Pilih Tenant:</label>
              <select
                id="saasTenantSelect"
                value={tenantId || ''}
                onChange={(e) => router.get('/finance', { tenant_id: e.target.value })}
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
              <Coins className="size-6 text-[#0f2b5c]" />
              <span>Keuangan &amp; Laporan Laba Rugi (P&amp;L)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Evaluasi kinerja keuangan toko: Penjualan Bersih, HPP (COGS), Laba Kotor, Pengeluaran Kas, dan Laba Bersih.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PERIOD FILTER */}
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
            >
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="this_month">Bulan Ini</option>
              <option value="all">Semua Periode</option>
            </select>

            {outlets.length > 0 && (
              <select
                value={selectedOutlet}
                onChange={(e) => handleOutletChange(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="all">Semua Cabang</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}

            <a
              href="/finance/export"
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* FINANCIAL SUMMARY WATERFALL CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* NET SALES */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pendapatan Bersih (Net Sales)</span>
            <p className="text-xl font-black font-mono text-[#0f2b5c]">
              {formatMoney(metrics.net_sales)}
            </p>
            <p className="text-[10px] text-slate-500">
              Kotor: {formatMoney(metrics.gross_sales)} &bull; Diskon: -{formatMoney(metrics.discounts)}
            </p>
          </div>

          {/* COGS / HPP */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total HPP / Bahan Baku (COGS)</span>
            <p className="text-xl font-black font-mono text-rose-600">
              {formatMoney(metrics.cogs)}
            </p>
            <p className="text-[10px] text-slate-500">
              Biaya modal pokok produk terjual
            </p>
          </div>

          {/* GROSS PROFIT */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Laba Kotor (Gross Profit)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                {metrics.gross_margin_pct}% Margin
              </span>
            </div>
            <p className="text-xl font-black font-mono text-emerald-700">
              {formatMoney(metrics.gross_profit)}
            </p>
            <p className="text-[10px] text-slate-500">
              Pendapatan Bersih dikurangi HPP
            </p>
          </div>

          {/* NET PROFIT */}
          <div className="bg-gradient-to-br from-[#061428] to-[#0f2b5c] text-white rounded-2xl p-4 shadow-md space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-sky-200">Laba Bersih (Net Profit)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-200 border border-sky-400/30">
                {metrics.net_margin_pct}% Net
              </span>
            </div>
            <p className="text-xl font-black font-mono text-white">
              {formatMoney(metrics.net_profit)}
            </p>
            <p className="text-[10px] text-slate-300">
              Beban Kas/Petty Cash: -{formatMoney(metrics.operational_expenses)}
            </p>
          </div>
        </div>

        {/* 12-MONTH REVENUE & PROFIT VISUAL CHART */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="size-4 text-[#0f2b5c]" />
              <span>Grafik Tren Kinerja Keuangan Bulanan 2026 (Juta Rp)</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#0f2b5c]" /> Omzet Penjualan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Laba Kotor
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2 pt-4 items-end h-44">
            {monthlyTrend.map((m) => {
              const revHeight = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
              const profitHeight = maxMonthlyRevenue > 0 ? (m.profit / maxMonthlyRevenue) * 100 : 0;

              return (
                <div key={m.month} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    {/* Revenue Bar */}
                    <div
                      className="w-3 sm:w-4 bg-[#0f2b5c] rounded-t-md transition-all hover:bg-[#163a75]"
                      style={{ height: `${Math.max(6, revHeight)}%` }}
                      title={`${m.month}: Omzet Rp ${m.raw_revenue.toLocaleString('id-ID')}`}
                    />
                    {/* Profit Bar */}
                    <div
                      className="w-3 sm:w-4 bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                      style={{ height: `${Math.max(4, profitHeight)}%` }}
                      title={`${m.month}: Laba Rp ${m.raw_profit.toLocaleString('id-ID')}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* OUTLET BREAKDOWN TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="size-4 text-[#0f2b5c]" />
              <span>Rincian Finansial &amp; Kontribusi Laba per Cabang Outlet ({metrics.period_label})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{outletBreakdown.length} outlet</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Nama Cabang Outlet</th>
                  <th className="py-3 px-4">Transaksi</th>
                  <th className="py-3 px-4">Omzet Penjualan (Rp)</th>
                  <th className="py-3 px-4">Estimasi HPP (Rp)</th>
                  <th className="py-3 px-4">Laba Kotor (Rp)</th>
                  <th className="py-3 px-4 text-right">Gross Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {outletBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada data penjualan pada periode ini.
                    </td>
                  </tr>
                ) : (
                  outletBreakdown.map((ob) => (
                    <tr key={ob.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {ob.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {ob.transactions} order
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0f2b5c]">
                        {formatMoney(ob.revenue)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-rose-600">
                        {formatMoney(ob.cogs)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {formatMoney(ob.gross_profit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono">
                          {ob.margin}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

