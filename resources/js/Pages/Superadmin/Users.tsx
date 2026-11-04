import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
  Users,
  Search,
  Eye,
  Mail,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { SuperadminNav } from './SuperadminNav';
import { playTap } from '@/lib/sound';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_subdomain?: string;
  outlet_id?: string;
  outlet_name: string;
  created_at: string;
  is_superadmin: boolean;
}

interface UsersPageProps {
  allUsers: UserItem[];
  tenants: any[];
  unresolvedIncidentsCount?: number;
  userName: string;
  role: string;
}

export default function UsersPage({
  allUsers = [],
  tenants = [],
  unresolvedIncidentsCount = 0,
  userName,
  role,
}: UsersPageProps) {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userTenantFilter, setUserTenantFilter] = useState('all');
  const [inspectUser, setInspectUser] = useState<UserItem | null>(null);

  const filteredPlatformUsers = allUsers.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesTenant =
      userTenantFilter === 'all' ||
      (userTenantFilter === 'platform' && !u.tenant_id) ||
      u.tenant_id === userTenantFilter;
    return matchesSearch && matchesRole && matchesTenant;
  });

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Direktori Pengguna Global - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="users"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
        />

        {/* GLOBAL USERS DIRECTORY */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="size-4.5 text-[#0f2b5c]" />
                <span>Direktori Seluruh Pengguna &amp; Akun Bisnis Terdaftar (Global User Directory)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Memantau seluruh pengguna (Owner, Kasir, Manager, Developer, Superadmin) beserta tenant bisnis terasosiasi.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0f2b5c] shrink-0 border border-blue-100">
              {filteredPlatformUsers.length} / {allUsers.length} Pengguna Terdaftar
            </span>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Cari nama atau email pengguna..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] focus:ring-2 focus:ring-blue-100 transition shadow-2xs"
              />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c] shadow-2xs"
              >
                <option value="all">Semua Peran (All Roles)</option>
                <option value="owner">Pemilik Usaha (Owner Tenant)</option>
                <option value="cashier">Kasir POS (Cashier)</option>
                <option value="manager">Manajer Operasional (Manager)</option>
                <option value="developer">Pengembang API (Developer)</option>
                <option value="superadmin">Superadmin Sovereign</option>
              </select>
            </div>

            <div>
              <select
                value={userTenantFilter}
                onChange={(e) => setUserTenantFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c] shadow-2xs"
              >
                <option value="all">Semua Tenant Bisnis</option>
                <option value="platform">Platform Core (Non-Tenant)</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {filteredPlatformUsers.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Tidak ada pengguna yang cocok dengan kriteria pencarian dan filter di atas.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Nama Pengguna</th>
                    <th className="py-3 px-4">Kontak / Email</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Bisnis / Tenant</th>
                    <th className="py-3 px-4">Outlet Terhubung</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPlatformUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.is_superadmin && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#0f2b5c] text-[9px] font-black uppercase">
                              Master
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="size-3 text-slate-400 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'owner'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : u.role === 'cashier'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : u.role === 'manager'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : u.role === 'developer'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {u.role === 'owner'
                            ? 'Owner'
                            : u.role === 'cashier'
                            ? 'Kasir POS'
                            : u.role === 'manager'
                            ? 'Manajer'
                            : u.role === 'developer'
                            ? 'Developer'
                            : 'Superadmin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{u.tenant_name}</span>
                        {u.tenant_subdomain && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {u.tenant_subdomain}.qlon.id
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.outlet_name}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{u.created_at}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            playTap();
                            setInspectUser(u);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="size-3 text-slate-500" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* INSPECT USER MODAL */}
      <Modal
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        title="Detail Pengguna & Entitas Bisnis"
        size="md"
      >
        {inspectUser && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white grid place-items-center font-black text-sm">
                  {inspectUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">{inspectUser.name}</h4>
                  <p className="font-mono text-slate-500">{inspectUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Peran Sistem</span>
                  <span className="font-semibold text-slate-800 capitalize">{inspectUser.role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bisnis / Tenant</span>
                  <span className="font-semibold text-slate-800">{inspectUser.tenant_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Penugasan Outlet</span>
                  <span className="font-semibold text-slate-800">{inspectUser.outlet_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu Terdaftar</span>
                  <span className="font-mono text-slate-600">{inspectUser.created_at}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">User Identifier (UUID)</span>
                <span className="font-mono text-[11px] text-slate-600 select-all break-all">{inspectUser.id}</span>
              </div>
            </div>

            <div className="flex justify-end items-center pt-2">
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
