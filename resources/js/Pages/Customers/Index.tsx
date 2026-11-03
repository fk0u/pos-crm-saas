import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Award,
  Phone,
  MessageSquare,
  Coins,
  Edit3,
  Trash2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Send,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney, formatDateTime } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  loyalty_points: number;
  total_spend: string | number;
  visit_count: number;
  last_visit_at: string | null;
  created_at: string;
}

interface CustomersPageProps {
  customers: {
    data: CustomerRecord[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
  };
  stats: {
    total_customers: number;
    total_points: number;
    total_spend: number;
    avg_spend: number;
    retention_rate: number;
  };
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

export default function CustomersIndex({
  customers,
  filters,
  stats,
  userName,
  role,
  outletName,
  tenantName,
}: CustomersPageProps) {
  const [search, setSearch] = useState(filters.search || '');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerRecord | null>(null);
  const [adjustCustomer, setAdjustCustomer] = useState<CustomerRecord | null>(null);
  const [whatsappCustomer, setWhatsappCustomer] = useState<CustomerRecord | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<CustomerRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    initial_points: '10',
  });

  const [pointsDelta, setPointsDelta] = useState('50');
  const [pointsReason, setPointsReason] = useState('Bonus Pembelian Festival');
  const [waMessage, setWaMessage] = useState('');

  const handleSearchChange = (val: string) => {
    setSearch(val);
    router.get(
      '/customers',
      { search: val || undefined },
      { preserveState: true, replace: true }
    );
  };

  const openAddModal = () => {
    playTap();
    setFormData({ name: '', phone: '', initial_points: '10' });
    setIsAddOpen(true);
  };

  const openEditModal = (c: CustomerRecord) => {
    playTap();
    setEditCustomer(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      initial_points: c.loyalty_points.toString(),
    });
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    if (editCustomer) {
      router.put(
        `/customers/${editCustomer.id}`,
        {
          name: formData.name,
          phone: formData.phone,
          loyalty_points: parseInt(formData.initial_points || '0', 10),
        },
        {
          onSuccess: () => {
            playSuccessChime();
            setEditCustomer(null);
          },
        }
      );
    } else {
      router.post(
        '/customers',
        {
          name: formData.name,
          phone: formData.phone,
          initial_points: parseInt(formData.initial_points || '0', 10),
        },
        {
          onSuccess: () => {
            playSuccessChime();
            setIsAddOpen(false);
          },
        }
      );
    }
  };

  const handleAdjustPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustCustomer) return;
    playTap();

    router.post(
      `/customers/${adjustCustomer.id}/adjust-points`,
      {
        points: parseInt(pointsDelta, 10),
        reason: pointsReason,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setAdjustCustomer(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteCustomer) return;
    playTap();

    router.delete(`/customers/${deleteCustomer.id}`, {
      onSuccess: () => {
        playSuccessChime();
        setDeleteCustomer(null);
      },
    });
  };

  const getTier = (c: CustomerRecord) => {
    const spend = parseFloat(c.total_spend.toString());
    if (spend >= 1000000 || c.loyalty_points >= 500) {
      return { label: 'VIP Member', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
    if (spend >= 400000 || c.loyalty_points >= 200) {
      return { label: 'Loyal', bg: 'bg-blue-50 text-[#0f2b5c] border-blue-200' };
    }
    if (c.visit_count > 1) {
      return { label: 'Regular', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    return { label: 'Baru', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const openWhatsAppDirect = () => {
    if (!whatsappCustomer) return;
    playTap();
    const phoneClean = whatsappCustomer.phone.replace(/\D/g, '');
    const phoneId = phoneClean.startsWith('0') ? '62' + phoneClean.slice(1) : phoneClean;
    const url = `https://wa.me/${phoneId}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
    setWhatsappCustomer(null);
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="customers"
    >
      <Head title="Pelanggan CRM - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="size-6 text-[#0f2b5c]" />
              <span>Pelanggan &amp; CRM Loyalitas</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manajemen basis data pelanggan, akumulasi poin reward, dan retensi event multi-channel.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
          >
            <UserPlus className="size-4" />
            <span>Tambah Pelanggan Baru</span>
          </button>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.total_customers}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Pelanggan CRM</p>
              </div>
              <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0f2b5c]">
                <Users className="size-5" />
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
                  {stats.total_points}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Poin Reward Beredar</p>
              </div>
              <div className="size-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600">
                <Coins className="size-5" />
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
                  {formatMoney(stats.total_spend)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Nilai Belanja Kumulatif</p>
              </div>
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-sky-600 font-mono tracking-tight">
                  {stats.retention_rate}%
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Tingkat Retensi Repeat</p>
              </div>
              <div className="size-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
                <Award className="size-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* SEARCH BAR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="relative max-w-md">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari nama pelanggan atau nomor WhatsApp..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] transition"
            />
          </div>
        </div>

        {/* CUSTOMERS TABLE */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4 text-center">Tier CRM</th>
                  <th className="py-3.5 px-4 text-right">Poin Loyalitas</th>
                  <th className="py-3.5 px-4 text-right">Total Belanja</th>
                  <th className="py-3.5 px-4 text-center">Kunjungan</th>
                  <th className="py-3.5 px-4">Kunjungan Terakhir</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {customers.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Belum ada data pelanggan yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  customers.data.map((c) => {
                    const tier = getTier(c);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {(c.name || 'U').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{c.name || 'Pelanggan Umum'}</p>
                              <span className="text-[10px] text-slate-400">ID: {c.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${tier.bg}`}
                          >
                            {tier.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0f2b5c]">
                          {c.loyalty_points} poin
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatMoney(c.total_spend)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                            {c.visit_count}x
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {c.last_visit_at ? formatDateTime(c.last_visit_at) : '-'}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setWhatsappCustomer(c);
                                setWaMessage(
                                  `Halo kak ${c.name}, terima kasih telah berkunjung ke ${tenantName}! Poin loyalitas kamu saat ini terkumpul ${c.loyalty_points} poin.`
                                );
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition"
                              title="Kirim Pesan WhatsApp"
                            >
                              <MessageSquare className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setAdjustCustomer(c);
                                setPointsDelta('50');
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-[#0f2b5c] text-slate-600 transition"
                              title="Sesuaikan Poin Reward"
                            >
                              <Coins className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="Ubah Data Pelanggan"
                            >
                              <Edit3 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setDeleteCustomer(c);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                              title="Hapus Pelanggan"
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
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL TAMBAH / UBAH PELANGGAN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddOpen || editCustomer !== null}
        onClose={() => {
          setIsAddOpen(false);
          setEditCustomer(null);
        }}
        title={editCustomer ? 'Ubah Data Pelanggan' : 'Daftarkan Pelanggan Baru'}
        description="Data pelanggan digunakan untuk loyalty CRM dan pengiriman struk kasir digital via WhatsApp."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="cth: Budi Pratama"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp / HP <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="cth: 081234567890"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {editCustomer ? 'Poin Loyalitas' : 'Poin Bonus Pendaftaran'}
            </label>
            <input
              type="number"
              min="0"
              value={formData.initial_points}
              onChange={(e) => setFormData({ ...formData, initial_points: e.target.value })}
              placeholder="cth: 10"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setEditCustomer(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              {editCustomer ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL SESUAIKAN POIN REWARD */}
      {/* ========================================================================= */}
      <Modal
        isOpen={adjustCustomer !== null}
        onClose={() => setAdjustCustomer(null)}
        title="Penyesuaian Poin Reward"
        description={adjustCustomer ? `Pelanggan: ${adjustCustomer.name} (Poin saat ini: ${adjustCustomer.loyalty_points})` : ''}
        maxWidth="sm"
      >
        <form onSubmit={handleAdjustPoints} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tambah / Kurang Poin (+ atau -) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={pointsDelta}
              onChange={(e) => setPointsDelta(e.target.value)}
              placeholder="cth: +50 atau -20"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penyesuaian Poin</label>
            <input
              type="text"
              required
              value={pointsReason}
              onChange={(e) => setPointsReason(e.target.value)}
              placeholder="cth: Bonus Event Festival, Kompensasi Antrean"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjustCustomer(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs"
            >
              Simpan Poin
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. MODAL KIRIM PESAN WHATSAPP */}
      {/* ========================================================================= */}
      <Modal
        isOpen={whatsappCustomer !== null}
        onClose={() => setWhatsappCustomer(null)}
        title="Kirim Pesan WhatsApp CRM"
        description={whatsappCustomer ? `Penerima: ${whatsappCustomer.name} (${whatsappCustomer.phone})` : ''}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Template Pesan WhatsApp</label>
            <textarea
              rows={4}
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setWhatsappCustomer(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={openWhatsAppDirect}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs active:scale-95"
            >
              <Send className="size-4" />
              <span>Buka WhatsApp Web / App</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. MODAL HAPUS PELANGGAN */}
      {/* ========================================================================= */}
      <Modal
        isOpen={deleteCustomer !== null}
        onClose={() => setDeleteCustomer(null)}
        title="Hapus Data Pelanggan"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2.5 text-xs">
            <AlertTriangle className="size-5 shrink-0" />
            <p>
              Hapus akun pelanggan <strong>{deleteCustomer?.name}</strong>? Riwayat transaksi sebelumnya tetap tersimpan di arsip pesanan.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteCustomer(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

