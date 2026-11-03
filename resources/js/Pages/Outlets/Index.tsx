import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Store,
  Plus,
  MapPin,
  Phone,
  Users,
  Receipt,
  CircleDollarSign,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface OutletItem {
  id: string;
  name: string;
  address: string;
  phone: string;
  users_count: number;
  orders_count: number;
  revenue_total: number;
  created_at?: string;
}

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
}

interface OutletsIndexProps {
  outlets: OutletItem[];
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

export default function OutletsIndex({
  outlets = [],
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: OutletsIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const openCreateModal = () => {
    playTap();
    setEditingOutlet(null);
    setName('');
    setAddress('');
    setPhone('');
    setIsModalOpen(true);
  };

  const openEditModal = (outlet: OutletItem) => {
    playTap();
    setEditingOutlet(outlet);
    setName(outlet.name);
    setAddress(outlet.address === 'Belum ada alamat' ? '' : outlet.address);
    setPhone(outlet.phone === '-' ? '' : outlet.phone);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    if (editingOutlet) {
      router.put(
        `/outlets/${editingOutlet.id}`,
        { name, address, phone },
        {
          onSuccess: () => {
            playSuccessChime();
            setIsModalOpen(false);
          },
        }
      );
    } else {
      router.post(
        '/outlets',
        { name, address, phone },
        {
          onSuccess: () => {
            playSuccessChime();
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (outlet: OutletItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus cabang "${outlet.name}"?`)) {
      playTap();
      router.delete(`/outlets/${outlet.id}`, {
        onSuccess: () => playSuccessChime(),
      });
    }
  };

  const handleTenantChange = (newTenantId: string) => {
    playTap();
    router.get('/outlets', { tenant_id: newTenantId }, { preserveState: false });
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="outlets"
    >
      <Head title="Manajemen Cabang Outlet - QLon POS & CRM" />

      <div className="space-y-6">
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Platform Superadmin Multi-Tenant Scope</p>
                <p className="text-[11px] text-sky-200">
                  Melihat cabang outlet untuk tenant: <strong className="text-white underline">{tenantName}</strong>
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
              <Store className="size-6 text-[#0f2b5c]" />
              <span>Manajemen Cabang &amp; Outlet</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola lokasi fisik gerai, titik penjualan POS, penugasan staf, dan pantau performa masing-masing cabang.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>Tambah Cabang Baru</span>
          </button>
        </div>

        {/* OUTLETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {outlets.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <Store className="size-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada cabang outlet terdaftar</p>
              <p className="text-xs text-slate-400 mt-1">Tambahkan cabang pertama Anda untuk mulai mengoperasikan kasir.</p>
            </div>
          ) : (
            outlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-10 rounded-xl bg-blue-50 text-[#0f2b5c] flex items-center justify-center shrink-0">
                        <Store className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{outlet.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400">ID: {outlet.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(outlet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Edit Data Cabang"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(outlet)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Hapus Cabang"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-start gap-2">
                      <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{outlet.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 text-slate-400 shrink-0" />
                      <span>{outlet.phone}</span>
                    </p>
                  </div>
                </div>

                {/* METRICS ROW */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Staf</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                      <Users className="size-3 text-slate-400" />
                      <span>{outlet.users_count}</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Order</p>
                    <p className="text-xs font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                      <Receipt className="size-3 text-slate-400" />
                      <span>{outlet.orders_count}</span>
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Omzet</p>
                    <p className="text-xs font-black font-mono text-[#0f2b5c] mt-0.5 truncate" title={formatMoney(outlet.revenue_total)}>
                      {formatMoney(outlet.revenue_total)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT CABANG */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOutlet ? 'Edit Cabang Outlet' : 'Tambah Cabang Outlet Baru'}
        description="Lengkapi informasi outlet fisik untuk penugasan mesin kasir dan karyawan."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="outletNameInput" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Cabang / Outlet <span className="text-rose-500">*</span>
            </label>
            <input
              id="outletNameInput"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Kopi Kawan - Samarinda Central"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label htmlFor="outletAddressInput" className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
            <textarea
              id="outletAddressInput"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="cth: Jl. Pahlawan No. 12, Lantai Dasar, Samarinda"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label htmlFor="outletPhoneInput" className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp Cabang</label>
            <input
              id="outletPhoneInput"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="cth: 081234567890"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              {editingOutlet ? 'Simpan Perubahan' : 'Buat Cabang'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

