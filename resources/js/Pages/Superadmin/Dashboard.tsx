import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  ShieldCheck,
  Building2,
  Server,
  Activity,
  KeyRound,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { playTap, playSuccessChime } from '@/lib/sound';

interface SuperadminDashboardProps {
  tenants: any[];
  activeTokens: any[];
  serverStatus: {
    uptime: string;
    php_version: string;
    db_driver: string;
    active_connections: number;
    cluster_region: string;
  };
  userName: string;
  role: string;
}

export default function SuperadminDashboard({
  tenants = [],
  activeTokens = [],
  serverStatus,
  userName,
  role,
}: SuperadminDashboardProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleClaimToken = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();
    router.post(
      '/superadmin/claim-token',
      { token: tokenInput },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsClaimModalOpen(false);
        },
      }
    );
  };

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Sovereign Command Center - QLon Platform Owner" />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0f2b5c] text-[10px] font-black uppercase tracking-wider">
                Platform Owner Mode
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <ShieldCheck className="size-6 text-[#0f2b5c]" />
              <span>Sovereign Platform Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Pantau kesehatan klaster server, kedaulatan data tenant, dan gunakan Token Akses Bantuan untuk pendampingan teknis.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playTap();
              setIsClaimModalOpen(true);
            }}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
          >
            <KeyRound className="size-4" />
            <span>Masukkan Token Akses Bantuan</span>
          </button>
        </div>

        {/* CLUSTER TELEMETRY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-xs text-slate-400 font-medium">Uptime Klaster SaaS</p>
            <p className="text-2xl font-black text-emerald-600 font-mono">{serverStatus.uptime}</p>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              High Availability
            </span>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-xs text-slate-400 font-medium">Total Tenant Aktif</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{tenants.length}</p>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
              Multi-Tenant DB
            </span>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-xs text-slate-400 font-medium">Koneksi Database Aktif</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{serverStatus.active_connections}</p>
            <span className="text-[10px] text-slate-500 font-mono">
              Driver: {serverStatus.db_driver}
            </span>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-xs text-slate-400 font-medium">Wilayah Hosting</p>
            <p className="text-sm font-black text-[#0f2b5c] truncate mt-2">{serverStatus.cluster_region}</p>
            <span className="text-[10px] text-slate-400 font-mono">PHP v{serverStatus.php_version}</span>
          </div>
        </div>

        {/* ACTIVE DELEGATION TOKENS BANNER */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4.5 text-[#0f2b5c]" />
              <h3 className="font-bold text-sm text-slate-900">
                Token Akses Bantuan Tenant Yang Diberikan Owner
              </h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-[#0f2b5c]">
              {activeTokens.length} Token Aktif
            </span>
          </div>

          {activeTokens.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">
              Tidak ada token delegasi aktif. Seluruh data penjualan dan omzet tenant terkunci aman di level basis data.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeTokens.map((tk) => (
                <div
                  key={tk.id}
                  className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      {tk.tenant?.name || 'Tenant'}
                    </span>
                    <p className="font-mono text-xs font-black text-slate-900 mt-1">{tk.token}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Alasan: {tk.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      router.post('/superadmin/claim-token', { token: tk.token });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold shadow-xs active:scale-95 transition"
                  >
                    Klaim Akses
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TENANTS REGISTRY TABLE */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Direktori Penyewa Bisnis SaaS</h3>
            <p className="text-[11px] text-slate-400">
              Isolasi database aktif per subdomain toko
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Nama Usaha / Tenant</th>
                  <th className="py-3 px-4">Subdomain</th>
                  <th className="py-3 px-4 text-center">Cabang / Outlet</th>
                  <th className="py-3 px-4 text-center">Varian Produk</th>
                  <th className="py-3 px-4 text-center">Total Staff</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Kedaulatan Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{t.subdomain}.qlon.id</td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.outlets_count ?? 1}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.products_count ?? 0}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{t.users_count ?? 1}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        Aktif
                      </span>
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

      {/* MODAL KLAIM TOKEN AKSES */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Klaim Token Bantuan Tenant"
        description="Masukkan token yang diberikan oleh Owner bisnis untuk memulai pendampingan teknis."
        maxWidth="md"
      >
        <form onSubmit={handleClaimToken} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Token Delegasi Akses (QLON-ASSIST-...)
            </label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="QLON-ASSIST-XXXXXXXXXXXX"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-900 text-[11px] leading-relaxed">
            Sistem akan mencatat seluruh akses baca ke tabel audit log platform demi menjaga kepercayaan dan kedaulatan data tenant.
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold"
            >
              Aktifkan Akses Bantuan
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
