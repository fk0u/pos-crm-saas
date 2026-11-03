import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  FileSpreadsheet,
  Printer,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Plus,
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
  outlet?: {
    name: string;
  } | null;
  approver?: {
    name: string;
  } | null;
}

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
}

interface OutletItem {
  id: string;
  name: string;
}

interface CashflowPageProps {
  activeShift: ShiftRecord | null;
  movements: ShiftMovementRecord[];
  pastShifts: ShiftRecord[];
  outlets: OutletItem[];
  stats: {
    starting_cash: number;
    cash_sales: number;
    total_cash_in: number;
    total_cash_out: number;
    expected_in_drawer: number;
  };
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

const QUICK_EXPENSES = [
  'Beli Es Batu Kristal',
  'Galon Air Mineral',
  'Plastik Takeaway & Cup',
  'Kasbon Karyawan Shift',
  'Biaya Kurir / Logistik Darurat',
  'Setoran Tunai ke Bank',
];

const QUICK_INCOMES = [
  'Tambah Modal Pecahan Kecil (Receh)',
  'Setoran Modal Tambahan Owner',
  'Pengembalian Kasbon Karyawan',
  'Koreksi Selisih Kasir',
];

export default function CashflowIndex({
  activeShift,
  movements = [],
  pastShifts = [],
  outlets = [],
  stats,
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: CashflowPageProps) {
  // Modals state
  const [movementModalType, setMovementModalType] = useState<'cash_in' | 'cash_out' | null>(null);
  const [isOpenShiftModal, setIsOpenShiftModal] = useState(false);
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);

  // Form states
  const [openStartingCash, setOpenStartingCash] = useState('300000');
  const [openOutletId, setOpenOutletId] = useState(outlets[0]?.id || '');
  const [openNotes, setOpenNotes] = useState('Modal awal shift kasir');

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [shiftNotes, setShiftNotes] = useState('');

  const openMovementModal = (type: 'cash_in' | 'cash_out') => {
    playTap();
    setMovementModalType(type);
    setAmount('');
    setReason(type === 'cash_in' ? 'Tambah Modal Pecahan Kecil (Receh)' : 'Beli Es Batu Kristal');
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    router.post(
      '/cashflow/open-shift',
      {
        outlet_id: openOutletId || null,
        starting_cash: parseFloat(openStartingCash || '0'),
        notes: openNotes,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsOpenShiftModal(false);
        },
      }
    );
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

  const handleTenantChange = (newTenantId: string) => {
    playTap();
    router.get('/cashflow', { tenant_id: newTenantId }, { preserveState: false });
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
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Platform Superadmin Multi-Tenant Scope</p>
                <p className="text-[11px] text-sky-200">
                  Melihat arus kas &amp; rekonsiliasi laci kasir untuk tenant: <strong className="text-white underline">{tenantName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="saasTenantSelect" className="text-[11px] text-sky-200 shrink-0 font-medium">Pilih Tenant:</label>
              <select
                id="saasTenantSelect"
                value={tenantId || ''}
                onChange={(e) => handleTenantChange(e.target.value)}
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
              <CircleDollarSign className="size-6 text-[#0f2b5c]" />
              <span>Arus Kas &amp; Shift Laci (Petty Cash &amp; Drawer)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pencatatan kas masuk, pengeluaran operasional outlet, rekonsiliasi kas laci kasir, serta cetak Berita Acara Z-Report.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* EXPORT CSV BUTTON */}
            <a
              href="/cashflow/export"
              target="_blank"
              rel="noreferrer"
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Unduh laporan transaksi mutasi kas dalam format CSV / Excel"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Export CSV</span>
            </a>

            {/* RECORD CASH IN */}
            <button
              type="button"
              onClick={() => openMovementModal('cash_in')}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ArrowDownLeft className="size-4" />
              <span>Kas Masuk</span>
            </button>

            {/* RECORD CASH OUT */}
            <button
              type="button"
              onClick={() => openMovementModal('cash_out')}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
            >
              <ArrowUpRight className="size-4" />
              <span>Kas Keluar (Petty Cash)</span>
            </button>

            {/* OPEN SHIFT / CLOSE SHIFT ACTION */}
            {activeShift ? (
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
            ) : (
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setIsOpenShiftModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition active:scale-95 cursor-pointer"
              >
                <Unlock className="size-3.5" />
                <span>Buka Shift Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE SHIFT HERO CARD */}
        <div className="rounded-3xl bg-gradient-to-br from-[#061428] via-[#0b2146] to-[#040e1f] text-white p-6 sm:p-7 shadow-xl border border-blue-400/20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`size-2.5 rounded-full ${
                    activeShift ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                  {activeShift ? 'Shift Kasir Sedang Berjalan' : 'Tidak Ada Shift Kasir Aktif'}
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
                {activeShift
                  ? 'Estimasi Total Uang Tunai di Dalam Laci Kasir (Expected Cash in Drawer)'
                  : 'Klik tombol "Buka Shift Baru" untuk mengaktifkan pencatatan laci kasir.'}
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
                <span>Log Pergerakan Kas Laci (Petty Cash In &amp; Out)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{movements.length} transaksi</span>
            </div>

            <div className="space-y-2">
              {movements.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Receipt className="size-8 mx-auto mb-2 text-slate-300 stroke-1" />
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
                        {isIn ? '+' : '-'}{formatMoney(m.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: RIWAYAT SHIFT KASIR SEBELUMNYA (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="size-4 text-[#0f2b5c]" />
                <span>Riwayat Rekonsiliasi Shift Laci (Z-Report)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{pastShifts.length} shift</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pastShifts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Clock className="size-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  Belum ada riwayat shift sebelumnya yang tersimpan.
                </div>
              ) : (
                pastShifts.map((s) => {
                  const isOpen = s.status === 'open';
                  const diff = parseFloat((s.difference ?? 0).toString());
                  const hasDiscrepancy = diff !== 0;

                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-white space-y-2.5 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${
                              isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-800">
                            {s.user?.name || 'Petugas Kasir'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isOpen
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isOpen ? 'Aktif' : 'Tutup'}
                          </span>

                          {/* CETAK BERITA ACARA Z-REPORT */}
                          <a
                            href={`/cashflow/shifts/${s.id}/report`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-slate-500 hover:text-[#0f2b5c] hover:bg-slate-100 transition"
                            title="Cetak Berita Acara Rekonsiliasi Kasir & Laci (Z-Report)"
                          >
                            <Printer className="size-3.5" />
                          </a>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(s.opened_at)} &bull; {s.closed_at ? formatDateTime(s.closed_at) : 'Berjalan'}
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
      {/* 1. MODAL BUKA SHIFT BARU */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isOpenShiftModal}
        onClose={() => setIsOpenShiftModal(false)}
        title="Buka Shift Kasir Baru"
        description="Tetapkan modal kas kecil (float cash) di laci sebelum transaksi kasir dimulai."
        maxWidth="md"
      >
        <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
          {outlets.length > 1 && (
            <div>
              <label htmlFor="openOutletSelect" className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Outlet Kasir <span className="text-rose-500">*</span>
              </label>
              <select
                id="openOutletSelect"
                value={openOutletId}
                onChange={(e) => setOpenOutletId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="openStartingCashInput" className="block text-xs font-bold text-slate-700 mb-1">
              Modal Awal Laci Kasir (Starting Float Cash) <span className="text-rose-500">*</span>
            </label>
            <input
              id="openStartingCashInput"
              type="number"
              required
              min="0"
              value={openStartingCash}
              onChange={(e) => setOpenStartingCash(e.target.value)}
              placeholder="cth: 300000"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
            {/* QUICK PRESETS */}
            <div className="flex gap-2 mt-2">
              {['100000', '200000', '300000', '500000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setOpenStartingCash(preset)}
                  className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {formatMoney(parseFloat(preset))}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="openNotesInput" className="block text-xs font-bold text-slate-700 mb-1">Catatan Serah Terima Shift</label>
            <input
              id="openNotesInput"
              type="text"
              value={openNotes}
              onChange={(e) => setOpenNotes(e.target.value)}
              placeholder="cth: Shift pagi, modal laci sudah dicek bersama supervisor"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpenShiftModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              Konfirmasi Buka Shift
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL KAS MASUK & KAS KELUAR */}
      {/* ========================================================================= */}
      <Modal
        isOpen={movementModalType !== null}
        onClose={() => setMovementModalType(null)}
        title={movementModalType === 'cash_in' ? 'Catat Kas Masuk (Cash In)' : 'Catat Kas Keluar (Petty Cash Out)'}
        description={
          movementModalType === 'cash_in'
            ? 'Penambahan modal laci kasir atau uang kembalian pecahan kecil.'
            : 'Pengeluaran biaya operasional harian outlet, bahan mendadak, atau logistik booth.'
        }
        maxWidth="md"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          <div>
            <label htmlFor="movementAmountInput" className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Uang (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              id="movementAmountInput"
              type="number"
              required
              min="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="cth: 50000"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
            {/* Quick chips */}
            <div className="flex gap-2 mt-2">
              {['20000', '50000', '100000', '200000'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {formatMoney(parseFloat(val))}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="movementReasonInput" className="block text-xs font-bold text-slate-700 mb-1">
              Alasan / Keterangan Keperluan <span className="text-rose-500">*</span>
            </label>
            <input
              id="movementReasonInput"
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Pilih template di bawah atau ketik manual..."
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />

            {/* Quick presets for reasons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(movementModalType === 'cash_in' ? QUICK_INCOMES : QUICK_EXPENSES).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setReason(item)}
                  className="px-2 py-1 text-[10px] rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
                >
                  {item}
                </button>
              ))}
            </div>
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
      {/* 3. MODAL TUTUP SHIFT KASIR */}
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
            <label htmlFor="actualCashInput" className="block text-xs font-bold text-slate-700 mb-1">
              Kas Fisik Hasil Penghitungan Laci (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              id="actualCashInput"
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
            <label htmlFor="shiftNotesTextarea" className="block text-xs font-bold text-slate-700 mb-1">Catatan Akhir Shift</label>
            <textarea
              id="shiftNotesTextarea"
              rows={2}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="cth: Shift berjalan ramai lancar, kas diserahkan ke shift sore..."
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
