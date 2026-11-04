import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  MessageSquare,
  KeyRound,
  ShieldAlert,
  Send,
  Lock,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { SuperadminNav } from './SuperadminNav';
import { playTap, playSuccessChime, playError } from '@/lib/sound';

interface TicketsPageProps {
  tickets: any[];
  activeTokens: any[];
  emergencyAuditLogs: any[];
  tenantUsers: any[];
  emergencyResult?: any;
  unresolvedIncidentsCount?: number;
  userName: string;
  role: string;
}

export default function TicketsPage({
  tickets = [],
  activeTokens = [],
  emergencyAuditLogs = [],
  tenantUsers = [],
  emergencyResult = null,
  unresolvedIncidentsCount = 0,
  userName,
  role,
}: TicketsPageProps) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Emergency Modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyTenantId, setEmergencyTenantId] = useState('');
  const [emergencyUserId, setEmergencyUserId] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'official_id' | 'phone_call' | 'legal_doc'>('official_id');
  const [verificationEvidence, setVerificationEvidence] = useState('');
  const [emergencyActionType, setEmergencyActionType] = useState<'reset_password' | 'emergency_token' | 'unlock_account'>('reset_password');
  const [isEmergencyPending, setIsEmergencyPending] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const filteredUsers = tenantUsers.filter((u) => !emergencyTenantId || u.tenant_id === emergencyTenantId);

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
      <Head title="Tiket Bantuan & Dukungan Delegasi - QLon Sovereign" />

      <div className="space-y-6">
        <SuperadminNav
          currentTab="tickets"
          unresolvedIncidentsCount={unresolvedIncidentsCount}
          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          onOpenClaimModal={() => setIsClaimModalOpen(true)}
        />

        {/* ACTIVE DELEGATION TOKENS */}
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

        {/* SUPPORT TICKETS QUEUE */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="size-4.5 text-[#0f2b5c]" />
                <span>Antrean Tiket Bantuan Pelanggan (Customer Support)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Konsol percakapan respon cepat dengan pemilik tenant bisnis POS.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {tickets.length} Tiket
            </span>
          </div>

          {tickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              Belum ada tiket bantuan dari pengguna.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{t.tenant?.name || 'Tenant'}</span>
                      <span className="text-[10px] font-mono text-slate-400">• Diajukan oleh: {t.user?.name || 'User'}</span>
                    </div>
                    <p className="font-bold text-xs text-[#0f2b5c]">{t.subject}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{t.message}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setSelectedTicket(t);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0f2b5c] hover:text-white text-slate-800 text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Buka Diskusi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EMERGENCY AUDIT LOGS */}
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="size-4.5 text-amber-600" />
              <span>Log Audit Pemulihan Darurat &amp; Verifikasi Identitas</span>
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900">
              {emergencyAuditLogs.length} Log Permanen
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {emergencyAuditLogs.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">
                Belum ada tindakan pemulihan darurat yang tercatat.
              </p>
            ) : (
              emergencyAuditLogs.map((log: any) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-900 capitalize">
                      {log.action.replace('emergency.', '').replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      Tenant: <strong>{log.tenant_name}</strong> • Administrator: {log.admin_name} • IP: {log.ip_address}
                    </span>
                    {log.details?.evidence && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-lg mt-1 border border-amber-200/60 font-mono">
                        Bukti Verifikasi: {log.details.evidence}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">{log.created_at}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TICKET REPLY MODAL */}
      <Modal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        title="Balas Tiket Dukungan Pelanggan"
        size="lg"
      >
        {selectedTicket && (
          <form onSubmit={handleReplyTicket} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-800">{selectedTicket.subject}</p>
              <p className="text-slate-600 mt-1">{selectedTicket.message}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Pesan Balasan Superadmin</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                required
                placeholder="Tulis instruksi atau jawaban bantuan..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0f2b5c] text-white font-bold flex items-center gap-1.5"
              >
                <Send className="size-3.5" />
                <span>Kirim Jawaban</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* CLAIM TOKEN MODAL */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Klaim Token Delegasi Bantuan"
        size="md"
      >
        <form onSubmit={handleClaimToken} className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Masukkan token bantuan resmi yang diberikan oleh Pemilik Tenant untuk mengaktifkan sesi pendampingan diagnostik.
          </p>
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Kode Token</label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Contoh: SUP-XXXXXX"
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0f2b5c] text-white font-bold flex items-center gap-1.5"
            >
              <KeyRound className="size-3.5" />
              <span>Verifikasi &amp; Klaim</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EMERGENCY RECOVERY MODAL */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Prosedur Pemulihan Darurat Akun Terverifikasi"
        size="lg"
      >
        <form onSubmit={handleEmergencySubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="size-4 text-amber-600" />
              <span>Tindakan Sensitif Kedaulatan Platform</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Seluruh tindakan ini akan dicatat ke dalam log audit permanen yang tidak dapat diubah (immutable audit log).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Tenant</label>
              <input
                type="text"
                value={emergencyTenantId}
                onChange={(e) => setEmergencyTenantId(e.target.value)}
                placeholder="UUID Tenant Bisnis"
                required
                className="w-full h-9 px-3 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Pengguna</label>
              <input
                type="text"
                value={emergencyUserId}
                onChange={(e) => setEmergencyUserId(e.target.value)}
                placeholder="UUID Pengguna"
                required
                className="w-full h-9 px-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Metode Verifikasi Legal</label>
            <select
              value={verificationMethod}
              onChange={(e: any) => setVerificationMethod(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200"
            >
              <option value="official_id">KTP / Paspor / Dokumen NIB Resmi</option>
              <option value="phone_call">Panggilan Suara Langsung ke Nomor Terdaftar</option>
              <option value="legal_doc">Surat Permohonan Resmi Bermaterai</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Bukti Catatan Verifikasi</label>
            <textarea
              value={verificationEvidence}
              onChange={(e) => setVerificationEvidence(e.target.value)}
              rows={2}
              required
              placeholder="Contoh: Nomor NIB 123456 terkonfirmasi dengan KTP atas nama Pemilik Usaha..."
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tindakan Pemulihan</label>
            <select
              value={emergencyActionType}
              onChange={(e: any) => setEmergencyActionType(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200"
            >
              <option value="reset_password">Buat Password Sementara Darurat</option>
              <option value="emergency_token">Terbitkan Token Diagnostik Darurat (1 Jam)</option>
              <option value="unlock_account">Buka Suspend Akun Tenant</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isEmergencyPending}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-50"
            >
              {isEmergencyPending ? 'Memproses...' : 'Eksekusi Pemulihan'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

