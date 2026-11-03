import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
  Coins,
  Receipt,
  User,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney, formatDateTime } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface ShiftMovementRecord {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: string | number;
  reason: string;
  created_at: string;
  user?: {
    name: string;
  } | null;
}

export interface ShiftRecord {
  id: string;
  opened_at: string;
  closed_at: string | null;
  starting_cash: string | number;
  cash_sales_total: string | number;
  non_cash_sales_total: string | number;
  cash_in_total: string | number;
  cash_out_total: string | number;
  expected_ending_cash: string | number;
  actual_ending_cash: string | number | null;
  difference: string | number | null;
  status: 'open' | 'closed';
  notes: string | null;
  user?: {
    name: string;
  } | null;
}

interface CashflowPageProps {
  activeShift: ShiftRecord | null;
  movements: ShiftMovementRecord[];
  pastShifts: ShiftRecord[];
  stats: {
    starting_cash: number;
    cash_sales: number;
    total_cash_in: number;
    total_cash_out: number;
    expected_in_drawer: number;
  };
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

export default function CashflowIndex({
  activeShift,
  movements = [],
  pastShifts = [],
  stats,
  userName,
  role,
  outletName,
  tenantName,
}: CashflowPageProps) {
  // Modals state
  const [movementModalType, setMovementModalType] = useState<'cash_in' | 'cash_out' | null>(null);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  const openMovementModal = (type: 'cash_in' | 'cash_out') => {
    playTap();
    setMovementModalType(type);
    setAmount('');
    setReason(type === 'cash_in' ? 'Tambahan Modal Uang Kembalian' : 'Beli Es Batu & Kebutuhan Booth');
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalType) return;
    playTap();

    router.post(
      '/cashflow/movement',
      {
        type: movementModalType,
        amount: parseFloat(amount),
        reason,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setMovementModalType(null);
        },
      }
    );
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    router.post(
      '/cashflow/close-shift',
      {
        actual_ending_cash: parseFloat(actualCash || '0'),
        notes: shiftNotes,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsCloseShiftOpen(false);
        },
      }
    );
  };

  const calculatedDifference =
    parseFloat(actualCash || '0') - stats.expected_in_drawer;

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="cashflow"
    >
      <Head title="Arus Kas & Shift Kasir - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CircleDollarSign className="size-6 text-[#0f2b5c]" />
              <span>Arus Kas &amp; Shift Laci</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pencatatan uang masuk, pengeluaran operasional booth, rekonsiliasi kas laci kasir secara transparan.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => openMovementModal('cash_in')}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ArrowDownLeft className="size-4" />
              <span>Kas Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => openMovementModal('cash_out')}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="size-4" />
              <span>Kas Keluar</span>
            </button>

            {activeShift && (
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setActualCash(stats.expected_in_drawer.toString());
                  setIsCloseShiftOpen(true);
                }}
                className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 cursor-pointer"
              >
                <Lock className="size-3.5" />
                <span>Tutup Shift Kasir</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE SHIFT HERO CARD */}
        <div className="rounded-3xl bg-gradient-to-br from-[#061428] via-[#0b2146] to-[#040e1f] text-white p-6 sm:p-7 shadow-xl border border-blue-400/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                  {activeShift ? 'Shift Kasir Sedang Berjalan' : 'Tidak Ada Shift Aktif'}
                </span>
                {activeShift && (
                  <span className="text-[10px] bg-blue-500/20 text-sky-200 border border-blue-400/30 px-2 py-0.5 rounded-md font-mono">
                    ID: {activeShift.id.slice(0, 8)}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {formatMoney(stats.expected_in_drawer)}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Estimasi Total Kas di Dalam Laci Kasir (Expected Cash)
              </p>
            </div>

            {/* Shift Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Modal Awal</p>
                <p className="text-sm font-black font-mono text-white mt-0.5">
                  {formatMoney(stats.starting_cash)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Penjualan Tunai</p>
                <p className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                  +{formatMoney(stats.cash_sales)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Kas Masuk (In)</p>
                <p className="text-sm font-black font-mono text-sky-300 mt-0.5">
                  +{formatMoney(stats.total_cash_in)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Kas Keluar (Out)</p>
                <p className="text-sm font-black font-mono text-rose-300 mt-0.5">
                  -{formatMoney(stats.total_cash_out)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TWO COLUMNS: MOVEMENTS & PAST SHIFTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: PERGERAKAN KAS LACI (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="size-4 text-[#0f2b5c]" />
                <span>Log Pergerakan Kas Laci (Cash In &amp; Out)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{movements.length} transaksi</span>
            </div>

            <div className="space-y-2">
              {movements.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada pergerakan kas masuk atau keluar yang tercatat pada shift ini.
                </div>
              ) : (
                movements.map((m) => {
                  const isIn = m.type === 'cash_in';
                  return (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-white flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isIn ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{m.reason}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatDateTime(m.created_at)} &bull; {m.user?.name || 'Kasir'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black font-mono ${
                          isIn ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIn ? '+' : '-'}
                        {formatMoney(m.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: RIWAYAT SHIFT TERAKHIR (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="size-4 text-[#0f2b5c]" />
                <span>Riwayat Shift Kasir Selesai</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {pastShifts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Belum ada riwayat shift yang ditutup.
                </div>
              ) : (
                pastShifts.map((s) => {
                  const diff = parseFloat((s.difference ?? '0').toString());
                  const hasDiscrepancy = Math.abs(diff) > 0;

                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{s.user?.name || 'Kasir'}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.status === 'open'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-200/70 text-slate-700'
                          }`}
                        >
                          {s.status === 'open' ? 'Aktif' : 'Tutup'}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        {formatDateTime(s.opened_at)} - {s.closed_at ? formatDateTime(s.closed_at) : 'Sekarang'}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Kas Dihitung:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {s.actual_ending_cash ? formatMoney(s.actual_ending_cash) : '-'}
                        </span>
                      </div>

                      {s.closed_at && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Selisih Kasir:</span>
                          <span
                            className={`font-mono font-bold ${
                              hasDiscrepancy
                                ? diff < 0
                                  ? 'text-rose-600'
                                  : 'text-sky-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {diff === 0 ? 'Sesuai (Rp 0)' : `${diff > 0 ? '+' : ''}${formatMoney(diff)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL KAS MASUK & KAS KELUAR */}
      {/* ========================================================================= */}
      <Modal
        isOpen={movementModalType !== null}
        onClose={() => setMovementModalType(null)}
        title={movementModalType === 'cash_in' ? 'Catat Kas Masuk (Cash In)' : 'Catat Kas Keluar (Cash Out)'}
        description={
          movementModalType === 'cash_in'
            ? 'Penambahan modal laci kasir atau uang kembalian pecahan kecil.'
            : 'Pengeluaran biaya operasional event, bahan mendadak, atau logistik booth.'
        }
        maxWidth="sm"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Uang (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="cth: 50000"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan / Keterangan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={movementModalType === 'cash_in' ? 'cth: Tambah modal uang receh' : 'cth: Beli 2 balok es batu'}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setMovementModalType(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-xs ${
                movementModalType === 'cash_in'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Simpan Pencatatan
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL TUTUP SHIFT KASIR */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCloseShiftOpen}
        onClose={() => setIsCloseShiftOpen(false)}
        title="Tutup Shift &amp; Rekonsiliasi Kas Laci"
        description="Hitung fisik uang tunai di laci kasir dan bandingkan dengan catatan sistem."
        maxWidth="md"
      >
        <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Estimasi Uang Sistem:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatMoney(stats.expected_in_drawer)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Uang Dihitung Fisik:</span>
              <span className="font-mono font-bold text-[#0f2b5c]">
                {formatMoney(parseFloat(actualCash || '0'))}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
              <span>Status Selisih (Discrepancy):</span>
              <span
                className={`font-mono ${
                  calculatedDifference === 0
                    ? 'text-emerald-600'
                    : calculatedDifference < 0
                    ? 'text-rose-600'
                    : 'text-sky-600'
                }`}
              >
                {calculatedDifference === 0
                  ? 'Pas / Tidak Ada Selisih'
                  : `${calculatedDifference > 0 ? 'Lebih +' : 'Kurang '}${formatMoney(calculatedDifference)}`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kas Fisik Hasil Penghitungan Laci (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
              placeholder="cth: 1250000"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Akhir Shift</label>
            <textarea
              rows={2}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="cth: Shift festival ramai lancar, kas diserahkan ke shift sore..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCloseShiftOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              Konfirmasi Tutup Shift
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

