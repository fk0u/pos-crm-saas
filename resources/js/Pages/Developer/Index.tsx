import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
  Code2,
  Key,
  Webhook,
  Plus,
  Trash2,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Database,
  Globe,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

interface DeveloperIndexProps {
  apiKeys: any[];
  webhooks: any[];
  endpointsDoc: { method: string; uri: string; desc: string }[];
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

export default function DeveloperIndex({
  apiKeys = [],
  webhooks = [],
  endpointsDoc = [],
  userName,
  role,
  outletName,
  tenantName,
}: DeveloperIndexProps) {
  const { flash } = usePage<any>().props;
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('Integrasi Toko Online');
  const [webhookUrl, setWebhookUrl] = useState('https://');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.completed']);
  const [copiedKey, setCopiedKey] = useState(false);

  const newKeyCreated = flash?.new_api_key;

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();
    router.post(
      '/developer/api-keys',
      { name: keyName },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsKeyModalOpen(false);
        },
      }
    );
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();
    router.post(
      '/developer/webhooks',
      { url: webhookUrl, events: selectedEvents },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsWebhookModalOpen(false);
          setWebhookUrl('https://');
        },
      }
    );
  };

  const toggleEvent = (ev: string) => {
    setSelectedEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  return (
    <AppShell userName={userName} role={role} outletName={outletName} tenantName={tenantName}>
      <Head title="Developer Hub &amp; Semi-PaaS - QLon Enterprise" />

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Code2 className="size-6 text-[#0f2b5c]" />
              <span>Developer Platform &amp; Semi-PaaS</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Bangun integrasi kustom, kelola API Key, dan daftarkan Webhook untuk sistem POS multi-outlet Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsKeyModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
            >
              <Key className="size-4" />
              <span>Buat API Key</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTap();
                setIsWebhookModalOpen(true);
              }}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
            >
              <Webhook className="size-4" />
              <span>Tambah Webhook</span>
            </button>
          </div>
        </div>

        {/* FLASH NEW KEY BANNER */}
        {newKeyCreated && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-800">
                Penting: Simpan API Key Anda Sekarang
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(newKeyCreated);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedKey ? 'Tersalin' : 'Salin Kunci'}</span>
              </button>
            </div>
            <p className="text-xs font-mono bg-white p-2.5 rounded-xl border border-amber-200 break-all">
              {newKeyCreated}
            </p>
          </div>
        )}

        {/* 2 MAIN SECTIONS: API KEYS & WEBHOOKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API KEYS TABLE */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 text-[#0f2b5c] flex items-center justify-center">
                  <Key className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">API Access Keys</h3>
                  <p className="text-[11px] text-slate-400">Kunci otentikasi API v1 QLon</p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {apiKeys.length} Kunci
              </span>
            </div>

            <div className="p-4 flex-1">
              {apiKeys.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada API Key aktif. Buat kunci baru untuk menghubungkan website atau ERP Anda.
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900">{key.name}</p>
                        <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                          {key.key_prefix}****************
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          router.delete(`/developer/api-keys/${key.id}`);
                        }}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                        title="Cabut Kunci"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* WEBHOOKS TABLE */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                  <Webhook className="size-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Webhook Endpoints</h3>
                  <p className="text-[11px] text-slate-400">Pengiriman sinyal event HTTP otomatis</p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {webhooks.length} Endpoint
              </span>
            </div>

            <div className="p-4 flex-1">
              {webhooks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada Webhook terdaftar. Daftarkan URL server Anda untuk menerima notifikasi order instan.
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((wh) => (
                    <div
                      key={wh.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div className="max-w-[80%]">
                        <p className="font-mono text-xs font-bold text-slate-900 truncate">
                          {wh.url}
                        </p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {wh.events?.map((ev: string) => (
                            <span
                              key={ev}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono font-semibold"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          router.delete(`/developer/webhooks/${wh.id}`);
                        }}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                        title="Hapus Webhook"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ENDPOINTS REFERENCE & CODE SNIPPET */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="size-5 text-[#0f2b5c]" />
            <h3 className="font-black text-sm text-slate-900">Referensi Endpoint REST API</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {endpointsDoc.map((ep, i) => (
              <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg bg-[#0f2b5c] text-white">
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-slate-900 font-semibold">{ep.uri}</span>
                </div>
                <span className="text-xs text-slate-500">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL BUAT API KEY */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        title="Buat API Key Baru"
        description="Gunakan kunci ini untuk mengotentikasi integrasi sistem POS dari luar."
        maxWidth="md"
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Integrasi / Aplikasi
            </label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="cth: Sinkronisasi Shopify / ERP Pusat"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold"
            >
              Terbitkan Kunci
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL BUAT WEBHOOK */}
      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="Daftarkan Webhook Endpoint"
        description="QLon akan mengirimkan payload JSON via HTTP POST saat event terjadi."
        maxWidth="md"
      >
        <form onSubmit={handleCreateWebhook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Endpoint Penerima (HTTPS)
            </label>
            <input
              type="url"
              required
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://toko-anda.com/api/webhooks/qlon"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c] font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Event Notifikasi</label>
            <div className="space-y-2">
              {[
                { id: 'order.completed', label: 'Pesanan Selesai / Terbayar (order.completed)' },
                { id: 'stock.low', label: 'Peringatan Stok Menipis (stock.low)' },
                { id: 'shift.closed', label: 'Tutup Shift Kasir (shift.closed)' },
              ].map((ev) => (
                <label key={ev.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev.id)}
                    onChange={() => toggleEvent(ev.id)}
                    className="rounded text-[#0f2b5c] focus:ring-[#0f2b5c]"
                  />
                  <span>{ev.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsWebhookModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold"
            >
              Simpan Webhook
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
