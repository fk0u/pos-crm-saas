import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Bug,
  AlertOctagon,
  CheckCircle2,
  FileCode,
  Users,
  Eye,
  Check,
  Search,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { SuperadminNav } from './SuperadminNav';
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

interface IncidentsProps {
  incidents: IncidentItem[];
  unresolvedIncidentsCount: number;
  latestIncidentAlert?: IncidentItem | null;
  userName: string;
  role: string;
}

export default function IncidentsPage({
  incidents = [],
  unresolvedIncidentsCount = 0,
  latestIncidentAlert = null,
  userName,
  role,
}: IncidentsProps) {
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

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Deteksi Insiden & Bug Sistem - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="incidents"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
        />

        {/* LATEST CRITICAL ALERT BANNER IF ACTIVE */}
        {latestIncidentAlert && (
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
                  <Check className="size-3.5 text-emerald-600" />
                  <span>Tandai Selesai</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN INCIDENTS TABLE PANEL */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
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
      </div>

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

            <div className="space-y-1.5">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileCode className="size-3.5 text-slate-500" />
                <span>Ringkasan Stack Trace Sistem</span>
              </span>
              <pre className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-56 overflow-x-auto overflow-y-auto whitespace-pre select-all">
                {inspectIncident.trace_summary || 'Tidak ada detail stack trace yang tersimpan.'}
              </pre>
            </div>

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
