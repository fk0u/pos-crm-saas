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
  MessageSquare,
  Send,
  PowerOff,
  Power,
  Copy,
  Check,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
  Search,
  Eye,
  Mail,
  AlertOctagon,
  Bug,
  FileCode,
  History,
  Landmark,
  CheckCheck,
  RefreshCw,
  FileWarning,
  Flame,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { playTap, playSuccessChime, playError } from '@/lib/sound';

export interface IncidentItem {
  id: string;
  tenant_id?: string;
  tenant_name: string;
  user_id?: string;
  user_name: string;
  user_email: string;
  user_role: string;
  url: string;
  route_name?: string;
  method: string;
  status_code: number;
  error_type: string;
  error_class?: string;
  message: string;
  file?: string;
  full_file?: string;
  line?: number;
  trace_summary?: string;
  ip_address?: string;
  severity: string;
  status: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  time_ago: string;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  user_name: string;
  tenant_name: string;
  outlet_name: string;
  status: string;
  privacy_badge: string;
  time_ago: string;
  created_at: string;
}

export interface BankingGovernance {
  standard: string;
  financial_privacy: string;
  financial_privacy_desc: string;
  audit_trail_status: string;
  realtime_detection: string;
  capabilities: string[];
  restrictions: string[];
}

interface SuperadminDashboardProps {
  tenants: any[];
  allUsers?: any[];
  activeTokens: any[];
  tickets?: any[];
  tenantUsers?: any[];
  emergencyAuditLogs?: any[];
  activeDelegation?: any;
  emergencyResult?: any;
  incidents?: IncidentItem[];
  unresolvedIncidentsCount?: number;
  latestIncidentAlert?: IncidentItem | null;
  recentActivities?: RecentActivityItem[];
  bankingGovernance?: BankingGovernance;
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
  allUsers = [],
  activeTokens = [],
  tickets = [],
  tenantUsers = [],
  emergencyAuditLogs = [],
  activeDelegation = null,
  emergencyResult = null,
  incidents = [],
  unresolvedIncidentsCount = 0,
  latestIncidentAlert = null,
  recentActivities = [],
  bankingGovernance,
  serverStatus,
  userName,
  role,
}: SuperadminDashboardProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');

  // Emergency Recovery Console State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyTenantId, setEmergencyTenantId] = useState('');
  const [emergencyUserId, setEmergencyUserId] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'official_id' | 'phone_call' | 'legal_doc'>('official_id');
  const [verificationEvidence, setVerificationEvidence] = useState('');
  const [emergencyActionType, setEmergencyActionType] = useState<'reset_password' | 'emergency_token' | 'unlock_account'>('reset_password');
  const [isEmergencyPending, setIsEmergencyPending] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Global Users Directory State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userTenantFilter, setUserTenantFilter] = useState('all');
  const [inspectUser, setInspectUser] = useState<any | null>(null);

  // Incident Tracking & Error Inspection State
  const [inspectIncident, setInspectIncident] = useState<IncidentItem | null>(null);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [incidentSearchQuery, setIncidentSearchQuery] = useState('');
  const [resolveNotes, setResolveNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus =
      incidentStatusFilter === 'all' ||
      (incidentStatusFilter === 'open' && inc.status !== 'resolved') ||
      (incidentStatusFilter === 'resolved' && inc.status === 'resolved');
    const q = incidentSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inc.user_name.toLowerCase().includes(q) ||
      inc.user_email.toLowerCase().includes(q) ||
      inc.url.toLowerCase().includes(q) ||
      inc.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleResolveIncident = (incidentId: string) => {
    playTap();
    setIsResolving(true);
    router.post(
      `/superadmin/incidents/${incidentId}/resolve`,
      { notes: resolveNotes || 'Ditandai selesai ditangani oleh Master Superadmin.' },
      {
        preserveScroll: true,
        onSuccess: () => {
          playSuccessChime();
          setIsResolving(false);
          setInspectIncident(null);
          setResolveNotes('');
        },
        onError: () => {
          playError();
          setIsResolving(false);
        },
      }
    );
  };

  const handleClearResolvedIncidents = () => {
    if (!window.confirm('Hapus seluruh insiden yang sudah berstatus selesai dari basis data?')) return;
    playTap();
    router.post(
      '/superadmin/incidents/clear-resolved',
      {},
      {
        preserveScroll: true,
        onSuccess: () => playSuccessChime(),
      }
    );
  };

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

  const filteredUsers = tenantUsers.filter((u) => !emergencyTenantId || u.tenant_id === emergencyTenantId);

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

  const handleReplyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    playTap();

    router.post(
      `/superadmin/tickets/${selectedTicket.id}/reply`,
      { message: replyText },
      {
        onSuccess: () => {
          playSuccessChime();
          setReplyText('');
          setSelectedTicket(null);
        },
      }
    );
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();
    setIsEmergencyPending(true);

    router.post(
      '/superadmin/emergency/recover',
      {
        tenant_id: emergencyTenantId,
        user_id: emergencyUserId,
        verification_method: verificationMethod,
        verification_evidence: verificationEvidence,
        action_type: emergencyActionType,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsEmergencyPending(false);
          setIsEmergencyModalOpen(false);
          setVerificationEvidence('');
        },
        onError: () => {
          playError();
          setIsEmergencyPending(false);
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
              {activeDelegation && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Delegasi Aktif: {activeDelegation.name}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
              <ShieldCheck className="size-6 text-[#0f2b5c]" />
              <span>Sovereign Platform Command Center</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Data bisnis setiap tenant terlindungi secara ketat. Superadmin hanya dapat mengakses data tenant melalui Token Delegasi resmi atau Verifikasi Identitas Darurat.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsEmergencyModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <ShieldAlert className="size-4 text-amber-600" />
              <span>Verifikasi &amp; Pemulihan Darurat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTap();
                setIsClaimModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
            >
              <KeyRound className="size-4" />
              <span>Klaim Token Bantuan</span>
            </button>
          </div>
        </div>

        {/* REALTIME DETECTED INCIDENTS ALERT BANNER */}
        {latestIncidentAlert ? (
          <div className="rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 p-4.5 shadow-md shadow-rose-900/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-11 rounded-2xl bg-rose-600 text-white grid place-items-center shrink-0 shadow-sm mt-0.5 animate-pulse">
                  <AlertOctagon className="size-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Flame className="size-3" />
                      Terdeteksi Gangguan Sistem Realtime
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded">
                      Kode {latestIncidentAlert.status_code} • {latestIncidentAlert.error_type}
                    </span>
                    <span className="text-[11px] font-medium text-rose-600">
                      {latestIncidentAlert.time_ago}
                    </span>
                  </div>

                  <p className="text-sm font-extrabold text-slate-900">
                    Terdeteksi error pada akun <span className="text-rose-700 underline decoration-rose-300">{latestIncidentAlert.user_name}</span> ({latestIncidentAlert.user_email || 'Sistem / Anonim'}) di halaman:
                  </p>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 border border-rose-200 text-rose-900 font-mono text-xs font-bold max-w-full overflow-hidden text-ellipsis">
                    <span className="text-slate-400 font-sans font-normal">{latestIncidentAlert.method}</span>
                    <span className="truncate">{latestIncidentAlert.url}</span>
                  </div>

                  <p className="text-xs text-rose-800 font-mono line-clamp-1 mt-0.5">
                    "{latestIncidentAlert.message}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    setInspectIncident(latestIncidentAlert);
                  }}
                  className="h-9 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>Periksa Detail Bug</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolveIncident(latestIncidentAlert.id)}
                  disabled={isResolving}
                  className="h-9 px-3 rounded-xl bg-white border border-rose-200 text-rose-900 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
                >
                  <CheckCheck className="size-3.5 text-emerald-600" />
                  <span>Tandai Selesai</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>Sistem Bersih &amp; Terpantau Normal</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      Realtime Incident Radar: Aktif
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tidak ada unhandled exception atau kegagalan kode 500 yang belum terselesaikan pada seluruh akun pengguna dan halaman.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                0 Insiden Terbuka
              </span>
            </div>
          </div>
        )}

        {/* SECURITY & DATA ISOLATION POLICY BANNER */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-slate-50 p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="size-9 rounded-xl bg-[#0f2b5c] text-white grid place-items-center shrink-0 mt-0.5">
              <Lock className="size-4.5" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-[#0f2b5c]">
                Kebijakan Keamanan Kedaulatan Data Multi-Tenant
              </p>
              <p className="text-slate-600 leading-relaxed">
                Superadmin dilarang keras melakukan transaksi penjualan, checkout kasir, maupun manipulasi saldo atas nama tenant. Seluruh akses pendampingan operasional wajib menggunakan <strong>Token Delegasi</strong> yang disetujui pemilik tenant, atau melalui <strong>Prosedur Verifikasi Darurat</strong> dengan pencatatan audit permanen.
              </p>
            </div>
          </div>
        </div>

        {/* CLUSTER TELEMETRY METRICS & INCIDENT RADAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Uptime Klaster SaaS</p>
            <p className="text-xl font-black text-emerald-600 font-mono">{serverStatus.uptime}</p>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              High Availability
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Insiden Belum Selesai</p>
            <p className={`text-xl font-black font-mono ${unresolvedIncidentsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {unresolvedIncidentsCount} Kasus
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${unresolvedIncidentsCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {unresolvedIncidentsCount > 0 ? 'Perlu Ditangani' : 'Semua Normal'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Total Tenant Aktif</p>
            <p className="text-xl font-black text-slate-900 font-mono">{tenants.length}</p>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
              Multi-Tenant DB
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">Standar Korporat</p>
            <p className="text-sm font-black text-[#0f2b5c] truncate mt-1">ISO 27001</p>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
              Privasi Perbankan
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

        {/* REALTIME ERROR & INCIDENT DETECTION CENTER */}
        <div id="incidents-section" className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-rose-100 text-rose-700 grid place-items-center">
                  <Bug className="size-4.5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span>Pusat Deteksi Insiden &amp; Bug Sistem Realtime</span>
                  {unresolvedIncidentsCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                      {unresolvedIncidentsCount} Butuh Tindakan
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      Semua Beres
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Setiap kegagalan server (500), error kueri, atau exception runtime langsung tertangkap otomatis dengan rincian akun, halaman URL, dan stack trace.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.reload({ preserveScroll: true })}
                className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="size-3.5 text-slate-500" />
                <span>Segarkan</span>
              </button>

              {incidents.some((i) => i.status === 'resolved') && (
                <button
                  type="button"
                  onClick={handleClearResolvedIncidents}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  Hapus Riwayat Selesai
                </button>
              )}
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIncidentStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  incidentStatusFilter === 'all'
                    ? 'bg-[#0f2b5c] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua Insiden ({incidents.length})
              </button>
              <button
                type="button"
                onClick={() => setIncidentStatusFilter('open')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  incidentStatusFilter === 'open'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Belum Selesai ({unresolvedIncidentsCount})
              </button>
              <button
                type="button"
                onClick={() => setIncidentStatusFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  incidentStatusFilter === 'resolved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Selesai ({incidents.filter((i) => i.status === 'resolved').length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={incidentSearchQuery}
                onChange={(e) => setIncidentSearchQuery(e.target.value)}
                placeholder="Cari akun, URL, atau pesan error..."
                className="w-full h-8.5 pl-8 pr-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] transition"
              />
            </div>
          </div>

          {/* Incidents Table */}
          <div className="overflow-x-auto">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Tidak Ada Insiden Error Pada Filter Ini
                </p>
                <p className="text-[11px] text-slate-400">
                  Seluruh layanan stabil dan tidak ada laporan exception yang tertangkap.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Waktu &amp; Severity</th>
                    <th className="py-3 px-4">Akun &amp; Bisnis Terdampak</th>
                    <th className="py-3 px-4">Halaman / Endpoint URL</th>
                    <th className="py-3 px-4">Pesan Error &amp; Lokasi</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className={`hover:bg-slate-50/80 transition ${
                        inc.status !== 'resolved' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`size-2 rounded-full ${
                              inc.status !== 'resolved' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-mono text-slate-900 font-bold">{inc.time_ago}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{inc.created_at}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inc.user_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{inc.user_email}</div>
                        <div className="text-[10px] text-blue-800 font-semibold mt-0.5">
                          {inc.tenant_name} • Role: {inc.user_role}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                            {inc.method}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-bold">
                            {inc.status_code}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-700 truncate mt-1" title={inc.url}>
                          {inc.url}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-mono text-xs font-bold text-rose-900 line-clamp-1" title={inc.message}>
                          [{inc.error_type}] {inc.message}
                        </div>
                        {inc.file && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                            <FileCode className="size-3 shrink-0 text-slate-400" />
                            <span className="truncate">{inc.file}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {inc.status === 'resolved' ? 'Selesai' : 'Terbuka'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playTap();
                              setInspectIncident(inc);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Eye className="size-3 text-slate-500" />
                            <span>Detail</span>
                          </button>

                          {inc.status !== 'resolved' && (
                            <button
                              type="button"
                              onClick={() => handleResolveIncident(inc.id)}
                              disabled={isResolving}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
                            >
                              <Check className="size-3" />
                              <span>Selesaikan</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CORPORATE BANKING STANDARDIZATION & AUDIT OBSERVABILITY */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-[#0f2b5c] text-white">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-white/10 grid place-items-center">
                  <Landmark className="size-4.5 text-blue-200" />
                </div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Standarisasi Tata Kelola Korporat Perbankan (Corporate Banking Standard)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-mono font-bold">
                    ISO/IEC 27001 &amp; PCI-DSS
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-1">
                Penerapan prinsip Segregation of Duties (SoD) dan perlindungan kerahasiaan data finansial pelanggan.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Lock className="size-3.5 text-emerald-400" />
                <span>Zero-Knowledge Cart Protection: ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Banking Rules Comparison Grid */}
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Lock className="size-4" />
                <span>Hal Privasi Yang DILARANG Diakses Akun Master (Restricted Privacy)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                <li>
                  <strong>Rincian Keranjang Belanja Pelanggan:</strong> Master tidak dapat melihat produk apa saja yang dibeli oleh pembeli individu pada tiap transaksi (menghindari profiling &amp; pembocoran data rahasia merchant).
                </li>
                <li>
                  <strong>Nomor Rekening / Kartu Konsumen:</strong> Data kartu pembayaran dan nomor rekening sensitif dienkripsi penuh dan tidak ditampilkan pada layer observabilitas pusat.
                </li>
                <li>
                  <strong>Manipulasi Transaksi &amp; Kasir:</strong> Master tidak dapat mencetak struk atau checkout langsung atas nama tenant tanpa persetujuan delegasi resmi.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="size-4" />
                <span>Wewenang Observabilitas Master Sesuai Standar Bank</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-5 list-disc">
                <li>
                  <strong>Jejak Aktivitas Terakhir (Live Activity Trail):</strong> Memantau waktu aktivitas, user yang login/bertugas, status transaksi sukses/gagal, dan ID referensi.
                </li>
                <li>
                  <strong>Deteksi Insiden &amp; Crash 500:</strong> Deteksi instan saat terjadi error, mengetahui akun pengguna mana dan halaman mana yang bermasalah.
                </li>
                <li>
                  <strong>Kesehatan Infrastruktur &amp; Node:</strong> Telemetri database, uptime klaster, alokasi kuota outlet, dan token bantuan darurat.
                </li>
              </ul>
            </div>
          </div>

          {/* Live Recent Operational Activities Table */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <History className="size-4 text-[#0f2b5c]" />
                <span>Aliran Aktivitas Terakhir Sistem &amp; Operasional (Live Activity Stream)</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Menampilkan transaksi terakhir yang dimaskir dan log aktivitas operasional tanpa melanggar privasi finansial perbankan.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {recentActivities.length} Aktivitas Terkini
            </span>
          </div>

          <div className="overflow-x-auto">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada aktivitas transaksi atau audit operasional yang tercatat hari ini.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Waktu</th>
                    <th className="py-3 px-4">Pengguna / Pelaksana</th>
                    <th className="py-3 px-4">Nama Usaha / Cabang</th>
                    <th className="py-3 px-4">Aktivitas Operasional</th>
                    <th className="py-3 px-4 text-center">Kepatuhan Privasi</th>
                    <th className="py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5">
                        <span className="font-mono text-slate-900 font-bold">{act.time_ago}</span>
                        <span className="text-[10px] text-slate-400 block">{act.created_at}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{act.user_name}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{act.tenant_name}</div>
                        <div className="text-[10px] text-slate-400">{act.outlet_name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{act.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{act.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Lock className="size-2.5 text-slate-500" />
                          {act.privacy_badge}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {act.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
                {tenants.map((t) => (
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

        {/* GLOBAL USERS & BUSINESS DIRECTORY */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="size-4.5 text-[#0f2b5c]" />
                <span>Direktori Seluruh Pengguna &amp; Akun Bisnis Terdaftar (Global User Directory)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pemilik aplikasi memantau seluruh pengguna (Owner, Kasir, Manager, Developer, Superadmin) beserta bisnis/tenant terdaftar.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0f2b5c] shrink-0 self-start md:self-auto border border-blue-100">
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
                <option value="manager">Manajer Cabang (Manager)</option>
                <option value="developer">Developer (PaaS)</option>
                <option value="superadmin">Pemilik Aplikasi (Superadmin Platform)</option>
              </select>
            </div>

            <div>
              <select
                value={userTenantFilter}
                onChange={(e) => setUserTenantFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#0f2b5c] shadow-2xs"
              >
                <option value="all">Semua Bisnis Terdaftar (All Tenants)</option>
                <option value="platform">Platform Core (Non-Tenant / Superadmin)</option>
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
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Nama Lengkap &amp; Email Pengguna</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Bisnis / Usaha (Tenant)</th>
                  <th className="py-3 px-4">Penugasan Outlet</th>
                  <th className="py-3 px-4">Terdaftar</th>
                  <th className="py-3 px-5 text-right">Aksi Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPlatformUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tidak ada pengguna yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredPlatformUsers.map((u) => {
                    const isSuper = u.is_superadmin || u.role === 'superadmin';
                    const isOwner = u.role === 'owner';
                    const isCashier = u.role === 'cashier';
                    const isDev = u.role === 'developer';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSuper
                                  ? 'bg-[#0f2b5c] text-white shadow-2xs'
                                  : isOwner
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : isCashier
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}
                            >
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{u.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Mail className="size-3 text-slate-400" />
                                <span>{u.email}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuper
                                ? 'bg-slate-900 text-white'
                                : isOwner
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isCashier
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : isDev
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isSuper
                              ? 'Master Admin'
                              : isOwner
                              ? 'Pemilik Usaha (Owner)'
                              : isCashier
                              ? 'Kasir POS'
                              : isDev
                              ? 'Developer PaaS'
                              : u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.tenant_name ? (
                            <div>
                              <p className="font-bold text-slate-800">{u.tenant_name}</p>
                              {u.tenant_subdomain && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  {u.tenant_subdomain}.qlon.id
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Platform Sovereign</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {u.outlet_name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                          {u.created_at}
                        </td>
                        <td className="py-3 px-5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              playTap();
                              setInspectUser(u);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <Eye className="size-3 text-slate-400" />
                            <span>Detail</span>
                          </button>

                          {!isSuper && u.tenant_id && (
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setEmergencyTenantId(u.tenant_id);
                                setEmergencyUserId(u.id);
                                setIsEmergencyModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-[11px] font-bold transition shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <ShieldAlert className="size-3 text-amber-600" />
                              <span>Pulihkan</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER SUPPORT TICKETS DESK */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="size-4 text-[#0f2b5c]" />
                <span>Tiket Kendala &amp; Meja CS Realtime (Platform Support Desk)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Pesan bantuan masuk dari aplikasi kasir dan pemilik tenant
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {tickets.length} Tiket
            </span>
          </div>

          <div className="p-4">
            {tickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada tiket kendala aktif saat ini. Seluruh outlet tenant beroperasi lancar.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #{tc.ticket_number}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#0f2b5c]">
                          {tc.tenant?.name || 'Tenant'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            tc.status === 'resolved'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tc.status === 'resolved' ? 'Selesai' : 'Perlu Respon'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{tc.subject}</p>
                      {tc.messages && tc.messages.length > 0 && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                          Pesan terakhir: &quot;{tc.messages[tc.messages.length - 1].message}&quot;
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          setSelectedTicket(tc);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="size-3.5" />
                        <span>Balas CS</span>
                      </button>
                      {tc.status !== 'resolved' && (
                        <button
                          type="button"
                          onClick={() => {
                            playTap();
                            router.post(`/superadmin/tickets/${tc.id}/resolve`, {}, {
                              onSuccess: () => playSuccessChime(),
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition cursor-pointer"
                        >
                          Selesaikan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* EMERGENCY AUDIT TRAIL LOGS */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 grid place-items-center">
                <ShieldAlert className="size-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Log Audit Pemulihan Darurat &amp; Verifikasi Identitas
                </h3>
                <p className="text-[11px] text-slate-500">
                  Catatan permanen setiap tindakan verifikasi KTP, reset password darurat, dan token darurat platform.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              {emergencyAuditLogs.length} Log Audit
            </span>
          </div>

          <div className="overflow-x-auto">
            {emergencyAuditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada insiden atau tindakan pemulihan darurat yang tercatat.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Waktu</th>
                    <th className="py-3 px-4">Tindakan</th>
                    <th className="py-3 px-4">Tenant Sasaran</th>
                    <th className="py-3 px-4">Eksekutor Superadmin</th>
                    <th className="py-3 px-5">Metode &amp; Bukti Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {emergencyAuditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-5 font-mono text-[11px] text-slate-500">{log.created_at}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.tenant_name}</td>
                      <td className="py-3 px-4">{log.admin_name}</td>
                      <td className="py-3 px-5 text-slate-600 max-w-xs truncate">
                        {log.details?.verification_evidence || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* MODAL VERIFIKASI & PEMULIHAN DARURAT */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Prosedur Verifikasi & Pemulihan Darurat"
        description="Digunakan HANYA jika pemilik akun mengalami kondisi gawat (lupa password / akun terkunci). Seluruh tindakan diaudit secara permanen."
        maxWidth="lg"
      >
        <form onSubmit={handleEmergencySubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-amber-600" />
              Protokol Verifikasi Identitas Wajib
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Superadmin dilarang mengakses akun tenant tanpa bukti identitas resmi. Anda wajib memvalidasi foto identitas (KTP/Paspor) atau konfirmasi panggilan telepon resmi pemilik sebelum melanjutkan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Tenant / Bisnis *
              </label>
              <select
                required
                value={emergencyTenantId}
                onChange={(e) => {
                  setEmergencyTenantId(e.target.value);
                  setEmergencyUserId('');
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c] bg-white cursor-pointer"
              >
                <option value="">-- Pilih Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Akun Pengguna / Owner *
              </label>
              <select
                required
                disabled={!emergencyTenantId}
                value={emergencyUserId}
                onChange={(e) => setEmergencyUserId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c] bg-white cursor-pointer disabled:bg-slate-100"
              >
                <option value="">-- Pilih Pengguna --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Metode Verifikasi Identitas *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'official_id', label: 'KTP / Identitas', desc: 'Foto ID Resmi Pemilik' },
                { id: 'phone_call', label: 'Panggilan Resmi', desc: 'No. Terdaftar di Registrasi' },
                { id: 'legal_doc', label: 'Legalitas Usaha', desc: 'NIB / SIUP / NPWP' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setVerificationMethod(m.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    verificationMethod === m.id
                      ? 'border-[#0f2b5c] bg-blue-50/70 text-[#0f2b5c]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs">{m.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Bukti Verifikasi Identitas * (Wajib)
            </label>
            <textarea
              required
              rows={2}
              value={verificationEvidence}
              onChange={(e) => setVerificationEvidence(e.target.value)}
              placeholder="Contoh: KTP NIK 3171xxxxxxxx terverifikasi sesuai data owner, telepon konfirmasi ke 081234567890 selesai pukul 14:30."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tindakan Pemulihan Darurat Yang Dijalankan *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <input
                  type="radio"
                  name="action_type"
                  value="reset_password"
                  checked={emergencyActionType === 'reset_password'}
                  onChange={() => setEmergencyActionType('reset_password')}
                  className="size-4 text-[#0f2b5c]"
                />
                <div>
                  <span>Reset Password Darurat (Generate Temporary Password)</span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    Membuat password acak 10-karakter untuk disampaikan kepada pemilik akun.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <input
                  type="radio"
                  name="action_type"
                  value="emergency_token"
                  checked={emergencyActionType === 'emergency_token'}
                  onChange={() => setEmergencyActionType('emergency_token')}
                  className="size-4 text-[#0f2b5c]"
                />
                <div>
                  <span>Terbitkan Token Delegasi Bantuan Darurat (1 Jam)</span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    Memberikan akses pendampingan teknis read-only ke dasbor tenant selama 1 jam.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <input
                  type="radio"
                  name="action_type"
                  value="unlock_account"
                  checked={emergencyActionType === 'unlock_account'}
                  onChange={() => setEmergencyActionType('unlock_account')}
                  className="size-4 text-[#0f2b5c]"
                />
                <div>
                  <span>Buka Blokir / Tangguhan Akun Tenant</span>
                  <p className="text-[10px] text-slate-500 font-normal">
                    Mengaktifkan kembali tenant jika sebelumnya tersuspend.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isEmergencyPending || !emergencyTenantId || !emergencyUserId || !verificationEvidence.trim()}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-1.5"
            >
              <ShieldAlert className="size-3.5" />
              <span>{isEmergencyPending ? 'Memproses...' : 'Eksekusi Pemulihan Darurat'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL HASIL PASSWORD DARURAT */}
      {emergencyResult && emergencyResult.type === 'password' && (
        <Modal
          isOpen={true}
          onClose={() => router.reload({ only: ['emergencyResult'] })}
          title="Password Darurat Berhasil Dibuat"
          description="Sampaikan informasi ini HANYA kepada pemilik akun yang telah lolos verifikasi identitas."
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Akun:</span>
                <span className="font-bold text-slate-900">{emergencyResult.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-900">{emergencyResult.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant:</span>
                <span className="font-bold text-slate-900">{emergencyResult.tenant_name}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Sementara Darurat:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={emergencyResult.temp_password}
                  className="flex-1 h-11 px-3 rounded-xl bg-emerald-50 border border-emerald-300 font-mono text-sm font-bold text-emerald-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(emergencyResult.temp_password);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  className="h-11 px-4 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedPass ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copiedPass ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              *Tindakan ini telah dicatat secara permanen di Audit Log Platform dengan lampiran bukti verifikasi identitas.
            </p>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => router.reload({ only: ['emergencyResult'] })}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

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
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold cursor-pointer"
            >
              Aktifkan Akses Bantuan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL BALAS TIKET CS */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Balas Tiket #${selectedTicket?.ticket_number}`}
        description={`Kirim pesan balasan resmi Customer Support ke tenant ${selectedTicket?.tenant?.name}.`}
        maxWidth="lg"
      >
        <form onSubmit={handleReplyTicket} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-xs font-bold text-slate-900">{selectedTicket?.subject}</p>
            <div className="max-h-40 overflow-y-auto space-y-2 text-xs">
              {selectedTicket?.messages?.map((m: any) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-xl ${
                    m.sender_role === 'superadmin'
                      ? 'bg-blue-100/70 text-blue-950 ml-6'
                      : 'bg-white text-slate-800 mr-6 border border-slate-200'
                  }`}
                >
                  <p className="font-bold text-[10px] text-slate-500 uppercase tracking-wide">
                    {m.sender_role === 'superadmin' ? 'Customer Support QLon' : 'Pelapor Tenant'}
                  </p>
                  <p className="mt-0.5">{m.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pesan Balasan CS
            </label>
            <textarea
              rows={3}
              required
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Tulis instruksi solusi atau pembaruan teknis untuk tenant..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedTicket(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="size-3.5" />
              <span>Kirim Jawaban CS</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL PENGGUNA PLATFORM */}
      <Modal
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        title="Detail Akun Pengguna Platform"
        description="Informasi profil dan penugasan tenant di ekosistem QLon POS & CRM"
        maxWidth="md"
      >
        {inspectUser && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
                <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {(inspectUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{inspectUser.name}</h4>
                  <p className="font-mono text-slate-500">{inspectUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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

            <div className="flex justify-between items-center pt-2">
              {!inspectUser.is_superadmin && inspectUser.tenant_id && (
                <button
                  type="button"
                  onClick={() => {
                    const u = inspectUser;
                    setInspectUser(null);
                    setEmergencyTenantId(u.tenant_id);
                    setEmergencyUserId(u.id);
                    setIsEmergencyModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="size-3.5" />
                  <span>Buka Pemulihan Darurat</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectUser(null)}
                className="ml-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* INSPECT SYSTEM INCIDENT MODAL */}
      <Modal
        isOpen={Boolean(inspectIncident)}
        onClose={() => setInspectIncident(null)}
        title="Detail Insiden Sistem & Bukti Trace Teknis"
        size="lg"
      >
        {inspectIncident && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
              <div className="size-10 rounded-xl bg-rose-600 text-white grid place-items-center shrink-0 mt-0.5">
                <Bug className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black text-rose-900 bg-rose-200/70 px-2 py-0.5 rounded">
                    HTTP {inspectIncident.status_code} • {inspectIncident.method}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                    {inspectIncident.severity}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {inspectIncident.created_at} ({inspectIncident.time_ago})
                  </span>
                </div>
                <p className="font-extrabold text-sm text-slate-900 font-mono break-all mt-1">
                  [{inspectIncident.error_type}] {inspectIncident.message}
                </p>
              </div>
            </div>

            {/* Context & Affected Subject */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Users className="size-3.5 text-[#0f2b5c]" />
                <span>Akun &amp; Konteks Pengguna Terdampak</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Pengguna</span>
                  <span className="font-bold text-slate-900">{inspectIncident.user_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Pengguna</span>
                  <span className="font-mono text-slate-700">{inspectIncident.user_email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Peran (Role)</span>
                  <span className="font-semibold text-slate-800 capitalize">{inspectIncident.user_role}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Tenant / Bisnis</span>
                  <span className="font-semibold text-slate-800">{inspectIncident.tenant_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">IP Pengakses</span>
                  <span className="font-mono text-slate-700">{inspectIncident.ip_address || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Kasus</span>
                  <span
                    className={`font-bold capitalize ${
                      inspectIncident.status === 'resolved' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {inspectIncident.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">URL Halaman Yang Gagal</span>
                <span className="font-mono text-[11px] text-[#0f2b5c] font-bold select-all break-all">
                  {inspectIncident.url}
                </span>
              </div>

              {inspectIncident.full_file && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File &amp; Baris Kode Sumber</span>
                  <span className="font-mono text-[11px] text-slate-700 select-all break-all">
                    {inspectIncident.full_file}:{inspectIncident.line}
                  </span>
                </div>
              )}
            </div>

            {/* Stack Trace Box */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileCode className="size-3.5 text-slate-500" />
                <span>Ringkasan Stack Trace Sistem</span>
              </span>
              <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-56 overflow-x-auto overflow-y-auto whitespace-pre select-all">
                {inspectIncident.trace_summary || 'Tidak ada detail stack trace yang tersimpan.'}
              </pre>
            </div>

            {/* Resolution Form / Details */}
            {inspectIncident.status !== 'resolved' ? (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <label className="font-bold text-emerald-950 text-xs block">
                  Tindakan Penyelesaian (Resolution Notes)
                </label>
                <input
                  type="text"
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Contoh: Bug kolom SQL telah diperbaiki & hotfix deploy berhasil."
                  className="w-full h-9 px-3 rounded-xl border border-emerald-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[10px] text-emerald-800">
                  Setelah ditandai selesai, insiden ini tidak lagi memicu alert darurat di dashboard Master.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700">
                <p className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  <span>Insiden telah diselesaikan oleh {inspectIncident.resolved_by || 'Master'}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Waktu selesai: {inspectIncident.resolved_at}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              {inspectIncident.status !== 'resolved' ? (
                <button
                  type="button"
                  onClick={() => handleResolveIncident(inspectIncident.id)}
                  disabled={isResolving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  <span>{isResolving ? 'Menyimpan...' : 'Tandai Selesai (Resolve)'}</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setInspectIncident(null)}
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

