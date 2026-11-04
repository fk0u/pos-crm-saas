import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Database,
  CalendarClock,
  UploadCloud,
  FileSpreadsheet,
  HardDrive,
  FileCode,
  Download,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { SuperadminNav } from './SuperadminNav';
import { playTap, playSuccessChime, playError } from '@/lib/sound';

export interface BackupItem {
  filename: string;
  path: string;
  size: string;
  size_bytes: number;
  created_at: string;
  time_ago: string;
  type: string;
  is_auto: boolean;
  extension: string;
}

interface BackupsPageProps {
  backups: BackupItem[];
  unresolvedIncidentsCount?: number;
  userName: string;
  role: string;
}

export default function BackupsPage({
  backups = [],
  unresolvedIncidentsCount = 0,
  userName,
  role,
}: BackupsPageProps) {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoreConfirmBackup, setRestoreConfirmBackup] = useState<BackupItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupRestoreConfirmText, setBackupRestoreConfirmText] = useState('');

  const handleCreateBackup = () => {
    playTap();
    setIsCreatingBackup(true);
    router.post(
      '/superadmin/backups/create',
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          playSuccessChime();
          setIsCreatingBackup(false);
        },
        onError: () => {
          playError();
          setIsCreatingBackup(false);
        },
      }
    );
  };

  const handleRestoreBackup = () => {
    if (!restoreConfirmBackup) return;
    if (backupRestoreConfirmText !== 'PULIHKAN') {
      alert('Ketik kata "PULIHKAN" untuk mengonfirmasi tindakan pemulihan database.');
      return;
    }

    playTap();
    setIsRestoring(true);
    router.post(
      `/superadmin/backups/${restoreConfirmBackup.filename}/restore`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          playSuccessChime();
          setIsRestoring(false);
          setRestoreConfirmBackup(null);
          setBackupRestoreConfirmText('');
        },
        onError: () => {
          playError();
          setIsRestoring(false);
        },
      }
    );
  };

  const handleExportData = (format: 'sql' | 'csv' | 'xlsx') => {
    playTap();
    window.location.href = `/superadmin/export/${format}`;
  };

  return (
    <AppShell userName={userName} role={role} outletName="Platform Sovereign" tenantName="QLon Core SaaS">
      <Head title="Pusat Backup & Pemulihan Sistem - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="backups"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
        />

        {/* ENTERPRISE BACKUP & DATA PORTABILITY CONSOLE */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-[#0f2b5c] text-white">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-white/10 grid place-items-center">
                  <Database className="size-4.5 text-blue-200" />
                </div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Pusat Backup Sistem, Pemulihan &amp; Portabilitas Data</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-[10px] font-mono font-bold flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    Auto Backup 01:00 AM • Retensi 3 Hari
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-blue-200/80 mt-1">
                Jaminan keamanan data klien &amp; sistem. Snapshot database otomatis disimpan maks 3 hari terakhir dengan opsi ekspor penuh (SQL, CSV, XLSX).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="size-3.5" />
                <span>{isCreatingBackup ? 'Memproses Snapshot...' : 'Buat Snapshot Sekarang'}</span>
              </button>

              <div className="flex items-center rounded-xl bg-white/10 p-0.5 border border-white/20">
                <span className="text-[11px] font-bold px-2 text-blue-200">Ekspor:</span>
                <button
                  type="button"
                  onClick={() => handleExportData('sql')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-xs font-mono font-bold text-white transition cursor-pointer"
                  title="Unduh seluruh database dalam format SQL"
                >
                  .SQL
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('csv')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-xs font-mono font-bold text-white transition cursor-pointer"
                  title="Unduh kumpulan data tabel dalam ZIP CSV"
                >
                  .CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExportData('xlsx')}
                  className="px-2.5 py-1 rounded-lg hover:bg-white/20 text-xs font-mono font-bold text-emerald-300 transition cursor-pointer flex items-center gap-1"
                  title="Unduh tabel yang kompatibel langsung dengan Microsoft Excel"
                >
                  <FileSpreadsheet className="size-3" />
                  <span>.XLSX</span>
                </button>
              </div>
            </div>
          </div>

          {/* Retention & Policy Highlights */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <HardDrive className="size-4 text-[#0f2b5c]" />
              <span>
                Kebijakan Retensi Bergulir: <strong>Maksimal 3 Hari Terakhir</strong> (berkas yang lebih tua otomatis dibersihkan demi efisiensi storage).
              </span>
            </div>
            <span className="font-mono text-slate-500 font-semibold">
              Total Berkas Tersimpan: {backups.length} Snapshot
            </span>
          </div>

          {/* Backups Table */}
          <div className="overflow-x-auto">
            {backups.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Database className="size-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Belum Ada Snapshot Backup</p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol "Buat Snapshot Sekarang" untuk membuat cadangan database pertama Anda.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-slate-500 font-bold text-[10px] uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">Nama Berkas Snapshot</th>
                    <th className="py-3 px-4">Waktu Dibuat</th>
                    <th className="py-3 px-4">Tipe Cadangan</th>
                    <th className="py-3 px-4 text-center">Ukuran</th>
                    <th className="py-3 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {backups.map((bk) => (
                    <tr key={bk.filename} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-5 font-mono font-bold text-slate-900 flex items-center gap-2">
                        <FileCode className="size-4 text-[#0f2b5c] shrink-0" />
                        <span className="truncate">{bk.filename}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800">{bk.time_ago}</span>
                        <span className="text-[10px] text-slate-400 block">{bk.created_at}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            bk.is_auto
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {bk.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {bk.size}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/superadmin/backups/${bk.filename}/download`}
                            className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition"
                            title="Unduh berkas ke komputer"
                          >
                            <Download className="size-3" />
                            <span>Unduh</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              playTap();
                              setRestoreConfirmBackup(bk);
                              setBackupRestoreConfirmText('');
                            }}
                            className="h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Pulihkan database dari snapshot ini"
                          >
                            <RotateCcw className="size-3 text-rose-600" />
                            <span>Pulihkan</span>
                          </button>
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

      {/* RESTORE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(restoreConfirmBackup)}
        onClose={() => setRestoreConfirmBackup(null)}
        title="Konfirmasi Pemulihan Sistem (Disaster Recovery)"
        size="md"
      >
        {restoreConfirmBackup && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                <AlertTriangle className="size-5 text-rose-600 shrink-0" />
                <span>Peringatan Kritis Pemulihan Data</span>
              </div>
              <p className="leading-relaxed">
                Anda akan memulihkan basis data sistem QLon SaaS ke titik waktu snapshot:
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-rose-300 font-mono font-bold text-xs select-all text-rose-950">
                {restoreConfirmBackup.filename} ({restoreConfirmBackup.size})
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Seluruh data yang dibuat <strong>setelah</strong> tanggal snapshot ({restoreConfirmBackup.created_at}) akan digantikan dengan kondisi pada berkas ini.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 block">
                Ketik kata <span className="text-rose-600 underline font-black">PULIHKAN</span> untuk melanjutkan:
              </label>
              <input
                type="text"
                value={backupRestoreConfirmText}
                onChange={(e) => setBackupRestoreConfirmText(e.target.value)}
                placeholder="PULIHKAN"
                className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-center tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleRestoreBackup}
                disabled={isRestoring || backupRestoreConfirmText !== 'PULIHKAN'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="size-3.5" />
                <span>{isRestoring ? 'Memproses Pemulihan...' : 'Mulai Pulihkan Basis Data'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRestoreConfirmBackup(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
