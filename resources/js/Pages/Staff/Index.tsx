import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  UserCheck,
  Plus,
  Mail,
  Store,
  Shield,
  KeyRound,
  Pencil,
  Trash2,
  Building2,
  Filter,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface StaffItem {
  id: string;
  name: string;
  email: string;
  role: string;
  outlet_id: string | null;
  outlet_name: string;
  created_at?: string;
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

interface StaffIndexProps {
  staffMembers: StaffItem[];
  outlets: OutletOption[];
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

const ROLES = [
  { value: 'cashier', label: 'Kasir (Operasional Kasir)' },
  { value: 'kitchen', label: 'Koki / Barista (Layar Dapur)' },
  { value: 'manager', label: 'Pengelola Toko (Manager)' },
  { value: 'staff', label: 'Karyawan Operasional' },
  { value: 'developer', label: 'Teknisi Sistem (API & Sambungan Luar)' },
];

export default function StaffIndex({
  staffMembers = [],
  outlets = [],
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: StaffIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  // Filter states
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedOutlet, setSelectedOutlet] = useState('all');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffRole, setStaffRole] = useState('cashier');
  const [outletId, setOutletId] = useState(outlets[0]?.id || '');
  const [password, setPassword] = useState('');

  const openCreateModal = () => {
    playTap();
    setEditingStaff(null);
    setName('');
    setEmail('');
    setStaffRole('cashier');
    setOutletId(outlets[0]?.id || '');
    setPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffItem) => {
    playTap();
    setEditingStaff(staff);
    setName(staff.name);
    setEmail(staff.email);
    setStaffRole(staff.role);
    setOutletId(staff.outlet_id || '');
    setPassword('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    if (editingStaff) {
      router.put(
        `/staff/${editingStaff.id}`,
        {
          name,
          role: staffRole,
          outlet_id: outletId || null,
          password: password || undefined,
        },
        {
          onSuccess: () => {
            playSuccessChime();
            setIsModalOpen(false);
          },
        }
      );
    } else {
      router.post(
        '/staff',
        {
          name,
          email,
          role: staffRole,
          outlet_id: outletId || null,
          password,
        },
        {
          onSuccess: () => {
            playSuccessChime();
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  const handleDelete = (staff: StaffItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun staf "${staff.name}"?`)) {
      playTap();
      router.delete(`/staff/${staff.id}`, {
        onSuccess: () => playSuccessChime(),
      });
    }
  };

  const filteredStaff = staffMembers.filter((s) => {
    if (selectedRole !== 'all' && s.role !== selectedRole) return false;
    if (selectedOutlet !== 'all' && s.outlet_id !== selectedOutlet) return false;
    return true;
  });

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Pemilik Usaha</span>;
      case 'manager':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">Pengelola Toko</span>;
      case 'kitchen':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">Koki / Barista</span>;
      case 'developer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Teknisi Sistem</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0f2b5c]">Kasir</span>;
    }
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="staff"
    >
      <Head title="Manajemen Karyawan & Kasir - QLon POS" />

      <div className="space-y-6">
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Mode Pengelola Sistem (Bantuan Toko)</p>
                <p className="text-[11px] text-sky-200">
                  Melihat tim &amp; karyawan untuk usaha: <strong className="text-white underline">{tenantName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="saasTenantSelect" className="text-[11px] text-sky-200 shrink-0 font-medium">Pilih Usaha:</label>
              <select
                id="saasTenantSelect"
                value={tenantId || ''}
                onChange={(e) => router.get('/staff', { tenant_id: e.target.value })}
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
              <UserCheck className="size-6 text-[#0f2b5c]" />
              <span>Manajemen Karyawan &amp; Kasir</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Atur hak akses login, penugasan cabang kasir, peran pengelola, dan akun tim toko.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="size-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
          >
            <option value="all">Semua Role</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="cashier">Kasir POS</option>
            <option value="kitchen">Kitchen/Barista</option>
            <option value="developer">Developer</option>
          </select>

          {outlets.length > 0 && (
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
            >
              <option value="all">Semua Cabang</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}

          <span className="text-xs text-slate-400 font-mono ml-auto">
            {filteredStaff.length} karyawan terdaftar
          </span>
        </div>

        {/* STAFF TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/60">
                <tr>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4">Email Login</th>
                  <th className="py-3.5 px-4">Peran (Role)</th>
                  <th className="py-3.5 px-4">Penugasan Cabang</th>
                  <th className="py-3.5 px-4">Terdaftar</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Tidak ada data staf yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {staff.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {staff.email}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(staff.role)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 flex items-center gap-1.5">
                        <Store className="size-3.5 text-slate-400 shrink-0" />
                        <span>{staff.outlet_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {staff.created_at || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit Data Staf"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          {staff.role !== 'owner' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(staff)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Hapus Akun Staf"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT STAF */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? `Edit Data Staf - ${editingStaff.name}` : 'Tambah Staf Karyawan Baru'}
        description="Buat akun untuk kasir, juru masak (kitchen), atau manajer gerai outlet."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="staffNameInput" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              id="staffNameInput"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Siti Aminah"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label htmlFor="staffEmailInput" className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email (Username Login) <span className="text-rose-500">*</span>
            </label>
            <input
              id="staffEmailInput"
              type="email"
              required
              disabled={!!editingStaff}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cth: siti@kopikawan.com"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="staffRoleSelect" className="block text-xs font-bold text-slate-700 mb-1">
                Peran / Role <span className="text-rose-500">*</span>
              </label>
              <select
                id="staffRoleSelect"
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="staffOutletSelect" className="block text-xs font-bold text-slate-700 mb-1">Penugasan Cabang</label>
              <select
                id="staffOutletSelect"
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="">Semua Cabang (HQ)</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="staffPasswordInput" className="block text-xs font-bold text-slate-700 mb-1">
              {editingStaff ? 'Reset Kata Sandi / PIN (Kosongkan jika tidak diubah)' : 'Kata Sandi / PIN Kasir'} {!editingStaff && <span className="text-rose-500">*</span>}
            </label>
            <input
              id="staffPasswordInput"
              type="password"
              required={!editingStaff}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
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
              {editingStaff ? 'Simpan Perubahan' : 'Buat Akun Staf'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

