import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ShieldCheck,
  Server,
  Activity,
  KeyRound,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Terminal,
  Bug,
  Database,
  Landmark,
  Building2,
  Users,
  MessageSquare,
  Flame,
  AlertOctagon,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { SuperadminNav } from './SuperadminNav';
import { playTap } from '@/lib/sound';

interface OverviewProps {
  tenantsCount: number;
  usersCount: number;
  unresolvedIncidentsCount: number;
  latestIncidentAlert?: any | null;
  backupsCount: number;
  activeTokensCount: number;
  activeTicketsCount: number;
  serverStatus: {
    uptime: string;
    php_version: string;
    db_driver: string;
    active_connections: number;
    cluster_region: string;
  };
  activeDelegation?: any;
  userName: string;
  role: string;
}

export default function SuperadminOverview({
  tenantsCount = 0,
  usersCount = 0,
  unresolvedIncidentsCount = 0,
  latestIncidentAlert = null,
  backupsCount = 0,
  activeTokensCount = 0,
  activeTicketsCount = 0,
  serverStatus,
  activeDelegation = null,
  userName,
  role,
}: OverviewProps) {
  const moduleCards = [
    {
      title: 'Deteksi Insiden & Bug Sistem',
      desc: 'Pantau crash server 500, kueri error, dan pengecualian realtime per akun & halaman URL.',
      href: '/superadmin/incidents',
      icon: Bug,
      badge: unresolvedIncidentsCount > 0 ? `${unresolvedIncidentsCount} Kasus Kritis` : 'Stabil',
      badgeColor: unresolvedIncidentsCount > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actionText: 'Buka Radar Insiden',
      color: 'hover:border-rose-300',
    },
    {
      title: 'Pusat Backup & Pemulihan Data',
      desc: 'Auto backup bergulir 3 hari terakhir (01:00 AM), buat snapshot instan, dan ekspor SQL/CSV/XLSX.',
      href: '/superadmin/backups',
      icon: Database,
      badge: `${backupsCount} Snapshot Aktif`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      actionText: 'Kelola Backup & Snapshot',
      color: 'hover:border-blue-300',
    },
    {
      title: 'Tata Kelola Korporat Perbankan',
      desc: 'Kepatuhan standar ISO 27001 & PCI-DSS: proteksi kerahasiaan keranjang belanja dan live audit trail.',
      href: '/superadmin/governance',
      icon: Landmark,
      badge: 'Zero-Knowledge Active',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      actionText: 'Lihat Audit & Standarisasi',
      color: 'hover:border-indigo-300',
    },
    {
      title: 'Direktori Penyewa Bisnis (Tenants)',
      desc: 'Manajemen paket layanan (Core, Essential, Full), kuota outlet, dan status operasional merchant.',
      href: '/superadmin/tenants',
      icon: Building2,
      badge: `${tenantsCount} Usaha Aktif`,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      actionText: 'Kelola Direktori Tenant',
      color: 'hover:border-slate-400',
    },
    {
      title: 'Direktori Pengguna Global',
      desc: 'Daftar seluruh akun pemilik toko, manajer, kasir, developer, serta inspeksi hak akses pengguna.',
      href: '/superadmin/users',
      icon: Users,
      badge: `${usersCount} Pengguna`,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      actionText: 'Buka Direktori Pengguna',
      color: 'hover:border-slate-400',
    },
    {
      title: 'Tiket Bantuan & Dukungan Delegasi',
      desc: 'Konsol percakapan tiket CS pelanggan, token bantuan dari owner, dan audit verifikasi pemulihan darurat.',
      href: '/superadmin/tickets',
      icon: MessageSquare,
      badge: `${activeTicketsCount} Tiket Terbuka`,
      badgeColor: activeTicketsCount > 0 ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200',
      actionText: 'Buka Layanan Tiket',
      color: 'hover:border-amber-300',
    },
  ];

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Pusat Pengaturan Sistem - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="overview"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
          activeDelegation={activeDelegation}
        />

        {/* REALTIME INCIDENT BANNER SHORTCUT */}
        {latestIncidentAlert && (
          <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 p-4.5 shadow-md shadow-rose-900/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-rose-600 text-white grid place-items-center shrink-0 shadow-sm mt-0.5 animate-pulse">
                  <AlertOctagon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Flame className="size-3" />
                      Terdeteksi Gangguan Sistem Realtime
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800">
                      {latestIncidentAlert.time_ago}
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    Error pada akun <span className="text-rose-700 underline">{latestIncidentAlert.user_name}</span> di halaman <span className="font-mono bg-rose-200/60 px-1 rounded text-xs">{latestIncidentAlert.url}</span>
                  </p>
                </div>
              </div>

              <Link
                href="/superadmin/incidents"
                onClick={() => playTap()}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <span>Investigasi di Halaman Insiden</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* CLUSTER TELEMETRY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Uptime Klaster SaaS</p>
            <p className="text-xl font-black text-emerald-600 font-mono">{serverStatus.uptime}</p>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              High Availability
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Status Gangguan</p>
            <p className={`text-xl font-black font-mono ${unresolvedIncidentsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {unresolvedIncidentsCount} Kasus
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${unresolvedIncidentsCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {unresolvedIncidentsCount > 0 ? 'Perlu Tindakan' : 'Semua Normal'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Total Tenant Aktif</p>
            <p className="text-xl font-black text-slate-900 font-mono">{tenantsCount}</p>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
              Multi-Tenant DB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Cadangan Snapshot</p>
            <p className="text-xl font-black text-slate-900 font-mono">{backupsCount} Berkas</p>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
              Retensi 3 Hari
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Koneksi Database</p>
            <p className="text-xl font-black text-slate-900 font-mono">{serverStatus.active_connections}</p>
            <span className="text-[10px] text-slate-500 font-mono">
              Driver: {serverStatus.db_driver}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Wilayah Hosting</p>
            <p className="text-xs font-black text-[#0f2b5c] truncate mt-1">{serverStatus.cluster_region}</p>
            <span className="text-[10px] text-slate-400 font-mono">PHP v{serverStatus.php_version}</span>
          </div>
        </div>

        {/* DATA ISOLATION POLICY BANNER */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-slate-50 p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-[#0f2b5c] text-white grid place-items-center shrink-0 mt-0.5">
              <Lock className="size-4.5" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-[#0f2b5c]">
                Kebijakan Kedaulatan &amp; Pemisahan Halaman Pusat Pengaturan
              </p>
              <p className="text-slate-600 leading-relaxed">
                Setiap modul sistem kini dipisahkan ke dalam halaman khusus mandiri (*modular &amp; scalable*) untuk menjamin performa cepat, kemudahan perawatan jangka panjang (*sustainability*), dan pemisahan wewenang operasional yang ketat.
              </p>
            </div>
          </div>
        </div>

        {/* MODULAR PAGES DIRECTORY GRID */}
        <div>
          <div className="pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Pusat Navigasi Modul Pengaturan Platform
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih halaman modul di bawah untuk mengelola komponen sistem secara spesifik dan mendalam:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all hover:shadow-md ${card.color} group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-10 rounded-2xl bg-slate-100 group-hover:bg-[#0f2b5c] group-hover:text-white text-slate-700 grid place-items-center transition">
                        <Icon className="size-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0f2b5c] transition">
                        {card.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      href={card.href}
                      onClick={() => playTap()}
                      className="text-xs font-bold text-[#0f2b5c] flex items-center justify-between group-hover:translate-x-0.5 transition"
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
