import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Building2,
  Lock,
  Search,
  CheckCircle2,
  Layers,
  Store,
  Users,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { SuperadminNav } from './SuperadminNav';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
  is_active: boolean;
  subscription_tier: string;
  tier_label: string;
  max_outlets?: number;
  max_staff?: number;
  users_count: number;
  outlets_count: number;
  products_count: number;
  created_at: string;
}

interface TenantsPageProps {
  tenants: TenantItem[];
  unresolvedIncidentsCount?: number;
  userName: string;
  role: string;
}

export default function TenantsPage({
  tenants = [],
  unresolvedIncidentsCount = 0,
  userName,
  role,
}: TenantsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handlePackageChange = (tenantId: string, tier: string) => {
    playTap();
    router.post(
      `/superadmin/tenants/${tenantId}/package`,
      { subscription_tier: tier },
      {
        preserveScroll: true,
        onSuccess: () => playSuccessChime(),
      }
    );
  };

  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.subdomain.toLowerCase().includes(q);
    const matchesTier = tierFilter === 'all' || t.subscription_tier === tierFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && t.is_active !== false) ||
      (statusFilter === 'suspended' && t.is_active === false);
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Direktori Penyewa Bisnis - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="tenants"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
        />

        {/* TENANTS REGISTRY DIRECTORY */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="size-4.5 text-[#0f2b5c]" />
                <span>Direktori Penyewa Bisnis SaaS (Tenants Registry)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pengelolaan langganan, paket lisensi, dan isolasi kedaulatan database aktif per subdomain toko.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0f2b5c] border border-blue-100 shrink-0">
              {filteredTenants.length} / {tenants.length} Tenant Terdaftar
            </span>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama usaha atau subdomain..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] transition"
              />
            </div>

            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="all">Semua Paket Layanan</option>
                <option value="core">Dasar (1 Cabang, 2 Kasir)</option>
                <option value="essential">Menengah (3 Cabang, 10 Karyawan)</option>
                <option value="full">Solusi Lengkap (Tanpa Batas)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="all">Semua Status Operasional</option>
                <option value="active">Aktif Berjalan</option>
                <option value="suspended">Ditangguhkan (Suspend)</option>
              </select>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Nama Usaha / Tenant</th>
                  <th className="py-3 px-4">Subdomain</th>
                  <th className="py-3 px-4">Paket Layanan</th>
                  <th className="py-3 px-4 text-center">Cabang</th>
                  <th className="py-3 px-4 text-center">Produk</th>
                  <th className="py-3 px-4 text-center">Staf</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                  <th className="py-3 px-5 text-right">Kedaulatan Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{t.subdomain}.qlon.id</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={t.subscription_tier || 'essential'}
                        onChange={(e) => handlePackageChange(t.id, e.target.value)}
                        aria-label="Pilih Paket Layanan"
                        className="h-8 px-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f2b5c] cursor-pointer"
                      >
                        <option value="core">Dasar (1 Cabang, 2 Kasir)</option>
                        <option value="essential">Menengah (3 Cabang, 10 Karyawan)</option>
                        <option value="full">Solusi Lengkap (Tanpa Batas)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.outlets_count ?? 1}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.products_count ?? 0}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.users_count ?? 1}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.is_active !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {t.is_active !== false ? 'Aktif' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          router.post(`/superadmin/tenants/${t.id}/toggle-status`, {}, {
                            onSuccess: () => playSuccessChime(),
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer active:scale-95 ${
                          t.is_active !== false
                            ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {t.is_active !== false ? 'Tangguhkan' : 'Aktifkan'}
                      </button>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <Lock className="size-3" /> Terisolasi
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

