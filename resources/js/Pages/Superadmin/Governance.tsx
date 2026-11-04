import React from 'react';
import { Head } from '@inertiajs/react';
import {
  Landmark,
  Lock,
  CheckCircle2,
  History,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { SuperadminNav } from './SuperadminNav';

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

interface GovernancePageProps {
  recentActivities: RecentActivityItem[];
  bankingGovernance: BankingGovernance;
  unresolvedIncidentsCount?: number;
  userName: string;
  role: string;
}

export default function GovernancePage({
  recentActivities = [],
  bankingGovernance,
  unresolvedIncidentsCount = 0,
  userName,
  role,
}: GovernancePageProps) {
  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Standarisasi Tata Kelola Perbankan - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="governance"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
        />

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
      </div>
    </AppShell>
  );
}
