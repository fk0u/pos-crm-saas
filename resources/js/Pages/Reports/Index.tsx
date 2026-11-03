import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Coins,
  CreditCard,
  QrCode,
  Banknote,
  Landmark,
  Clock,
  PieChart,
  ShoppingBag,
  Percent,
  Layers,
  ArrowUpRight,
  ReceiptText,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { formatMoney, formatNumber } from '@/lib/format';
import { playTap } from '@/lib/sound';

interface PaymentMethodStat {
  label: string;
  count: number;
  amount: number;
}

interface TopProductStat {
  id: string;
  name: string;
  category: string;
  total_qty: number;
  total_revenue: number;
}

interface HourlyStat {
  hour: string;
  orders: number;
  sales: number;
}

interface ReportsPageProps {
  period: string;
  periodLabel: string;
  summary: {
    gross_sales: number;
    net_sales: number;
    total_orders: number;
    total_discounts: number;
    total_cogs: number;
    gross_profit: number;
    profit_margin: number;
    avg_basket: number;
  };
  paymentMethods: PaymentMethodStat[];
  topProducts: TopProductStat[];
  hourlyData: HourlyStat[];
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

const methodIcons: Record<string, any> = {
  Tunai: Banknote,
  QRIS: QrCode,
  'Kartu Debit/Kredit': CreditCard,
  'Transfer Bank': Landmark,
};

export default function ReportsIndex({
  period,
  periodLabel,
  summary,
  paymentMethods = [],
  topProducts = [],
  hourlyData = [],
  userName,
  role,
  outletName,
  tenantName,
}: ReportsPageProps) {
  const [currentPeriod, setCurrentPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: string) => {
    playTap();
    setCurrentPeriod(newPeriod);
    router.get('/reports', { period: newPeriod }, { preserveState: true, replace: true });
  };

  const maxHourlySales = Math.max(...hourlyData.map((h) => h.sales), 1);
  const totalPaymentSum = paymentMethods.reduce((acc, m) => acc + m.amount, 0) || 1;

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="reports"
    >
      <Head title="Laporan Finansial & Penjualan - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HEADER & PERIOD FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="size-6 text-[#0f2b5c]" />
              <span>Laporan Finansial &amp; Analitik Penjualan</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi omzet, jam sibuk transaksi festival, margin laba kotor, dan metode pembayaran.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Period Pills */}
            <div className="flex bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
              {[
                { id: 'today', label: 'Hari Ini' },
                { id: 'yesterday', label: 'Kemarin' },
                { id: '7days', label: '7 Hari' },
                { id: 'this_month', label: 'Bulan Ini' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePeriodChange(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPeriod === p.id
                      ? 'bg-[#0f2b5c] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <a
              href="/reports/export"
              onClick={() => playTap()}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition"
            >
              <Download className="size-4 text-slate-500" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* 6 FINANCIAL KPI STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Omzet Penjualan</p>
            <p className="text-xl font-black text-slate-900 font-mono tracking-tight mt-1 truncate">
              {formatMoney(summary.net_sales)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">{periodLabel}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</p>
            <p className="text-xl font-black text-[#0f2b5c] font-mono tracking-tight mt-1">
              {summary.total_orders} order
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Faktur terbayar</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HPP (Modal Bahan)</p>
            <p className="text-xl font-black text-slate-600 font-mono tracking-tight mt-1 truncate">
              {formatMoney(summary.total_cogs)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Biaya modal produk</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Laba Kotor (Gross)</p>
            <p className="text-xl font-black text-emerald-600 font-mono tracking-tight mt-1 truncate">
              {formatMoney(summary.gross_profit)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Omzet - HPP</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin Laba</p>
            <p className="text-xl font-black text-sky-600 font-mono tracking-tight mt-1">
              {summary.profit_margin}%
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Persentase profit</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Keranjang</p>
            <p className="text-xl font-black text-indigo-600 font-mono tracking-tight mt-1 truncate">
              {formatMoney(summary.avg_basket)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Per transaksi kasir</p>
          </motion.div>
        </div>

        {/* TWO MIDDLE ANALYTICS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: ANALISIS JAM SIBUK RUSH HOUR (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#0f2b5c]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Analisis Jam Sibuk Transaksi (08:00 - 22:00)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Event Rush Tracker
              </span>
            </div>

            {/* Visual Histogram Chart */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-1 h-44 pb-2 border-b border-slate-100">
                {hourlyData.map((h, idx) => {
                  const barPercent = Math.max(6, Math.round((h.sales / maxHourlySales) * 100));

                  return (
                    <div
                      key={h.hour}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-md z-20 font-mono">
                        {h.hour}: {formatMoney(h.sales)} ({h.orders} order)
                      </div>

                      {/* Bar Fill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barPercent}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.02 }}
                        className={`w-full max-w-[20px] rounded-t-md transition-colors ${
                          h.sales > 0
                            ? 'bg-[#0f2b5c] group-hover:bg-[#1e4488]'
                            : 'bg-slate-100'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Hour Labels */}
              <div className="flex justify-between gap-1 text-[9px] font-mono text-slate-400 mt-2">
                {hourlyData.map((h, idx) => (
                  <span key={h.hour} className={idx % 2 === 0 ? 'inline' : 'hidden sm:inline'}>
                    {h.hour.slice(0, 2)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: BREAKDOWN METODE PEMBAYARAN (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChart className="size-4 text-[#0f2b5c]" />
                <h3 className="text-sm font-bold text-slate-900">Distribusi Metode Pembayaran</h3>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {paymentMethods.map((m) => {
                const Icon = methodIcons[m.label] || Banknote;
                const percent = Math.round((m.amount / totalPaymentSum) * 100);

                return (
                  <div key={m.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Icon className="size-4 text-[#0f2b5c]" />
                        <span>{m.label}</span>
                      </div>
                      <div className="font-mono text-right">
                        <span className="font-bold text-slate-900">{formatMoney(m.amount)}</span>
                        <span className="text-slate-400 text-[10px] ml-1.5">({percent}%)</span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0f2b5c] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM: PERINGKAT PRODUK TERLARIS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-[#0f2b5c]" />
              <h3 className="text-sm font-bold text-slate-900">
                Peringkat Produk Terlaris ({periodLabel})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Peringkat</th>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-center">Unit Terjual</th>
                  <th className="py-3 px-4 text-right">Total Kontribusi Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada data penjualan produk pada periode ini.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black font-mono text-[#0f2b5c]">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {p.total_qty} unit
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        {formatMoney(p.total_revenue)}
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

