import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Tag,
  Plus,
  Percent,
  Coins,
  Calendar,
  Users,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface PromotionItem {
  id: string;
  code: string;
  name: string;
  type: string;
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  quota: number;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_expired: boolean;
}

interface TenantItem {
  id: string;
  name: string;
  subdomain: string;
}

interface PromotionsIndexProps {
  promotions: PromotionItem[];
  metrics: {
    active_count: number;
    total_redemptions: number;
    total_vouchers: number;
  };
  userName: string;
  role: string;
  isSuperAdmin?: boolean;
  tenantId?: string | null;
  allTenants?: TenantItem[];
  outletName: string;
  tenantName: string;
}

export default function PromotionsIndex({
  promotions = [],
  metrics,
  userName,
  role,
  isSuperAdmin = false,
  tenantId,
  allTenants = [],
  outletName,
  tenantName,
}: PromotionsIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('20');
  const [minOrder, setMinOrder] = useState('50000');
  const [maxDiscount, setMaxDiscount] = useState('20000');
  const [quota, setQuota] = useState('100');
  const [expiresAt, setExpiresAt] = useState('');

  const openCreateModal = () => {
    playTap();
    setCode('');
    setName('');
    setType('percentage');
    setValue('20');
    setMinOrder('50000');
    setMaxDiscount('20000');
    setQuota('100');
    setExpiresAt('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTap();

    router.post(
      '/promotions',
      {
        code: code.toUpperCase().trim(),
        name,
        type,
        value: parseFloat(value || '0'),
        min_order_amount: parseFloat(minOrder || '0'),
        max_discount_amount: maxDiscount ? parseFloat(maxDiscount) : null,
        quota: parseInt(quota || '100', 10),
        expires_at: expiresAt || null,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setIsModalOpen(false);
        },
      }
    );
  };

  const handleToggleActive = (promo: PromotionItem) => {
    playTap();
    router.put(
      `/promotions/${promo.id}`,
      {
        name: promo.name,
        type: promo.type,
        value: promo.value,
        min_order_amount: promo.min_order_amount,
        max_discount_amount: promo.max_discount_amount,
        quota: promo.quota,
        is_active: !promo.is_active,
      },
      {
        onSuccess: () => playSuccessChime(),
      }
    );
  };

  const handleDelete = (promo: PromotionItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kupon "${promo.code}"?`)) {
      playTap();
      router.delete(`/promotions/${promo.id}`, {
        onSuccess: () => playSuccessChime(),
      });
    }
  };

  const handleCopyCode = (promoCode: string) => {
    playTap();
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="promotions"
    >
      <Head title="Promosi & Kupon Diskon - QLon POS & CRM" />

      <div className="space-y-6">
        {/* SUPERADMIN TENANT SWITCHER BANNER */}
        {isSuperAdmin && allTenants.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-400/20">
            <div className="flex items-center gap-2.5">
              <Building2 className="size-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Platform Superadmin Multi-Tenant Scope</p>
                <p className="text-[11px] text-sky-200">
                  Melihat promosi &amp; voucher untuk tenant: <strong className="text-white underline">{tenantName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="saasTenantSelect" className="text-[11px] text-sky-200 shrink-0 font-medium">Pilih Tenant:</label>
              <select
                id="saasTenantSelect"
                value={tenantId || ''}
                onChange={(e) => router.get('/promotions', { tenant_id: e.target.value })}
                className="h-8 px-2.5 rounded-lg bg-blue-950/80 border border-blue-400/40 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.subdomain})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="size-6 text-[#0f2b5c]" />
              <span>Promosi &amp; Kupon Diskon</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Buat kode promo, diskon persentase atau potongan nominal untuk kasir POS dan menu pemesanan online pelanggan.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>Buat Kupon Promo Baru</span>
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-slate-400">Kupon Aktif Saat Ini</p>
            <p className="text-2xl font-black text-[#0f2b5c] mt-1">
              {metrics.active_count} <span className="text-xs font-normal text-slate-500">voucher</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dapat digunakan pelanggan di POS &amp; online</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Transaksi Pakai Kupon</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {metrics.total_redemptions} <span className="text-xs font-normal text-slate-500">kali</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Akumulasi penggunaan kupon</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
            <p className="text-[11px] font-bold uppercase text-slate-400">Total Program Promosi</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {metrics.total_vouchers} <span className="text-xs font-normal text-slate-500">kampanye</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Riwayat voucher aktif &amp; selesai</p>
          </div>
        </div>

        {/* PROMOTIONS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
              <Tag className="size-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada kupon promosi yang dibuat</p>
              <p className="text-xs text-slate-400 mt-1">Buat kode promo seperti HEMAT20 untuk menarik lebih banyak pembeli.</p>
            </div>
          ) : (
            promotions.map((p) => {
              const isExpired = p.is_expired;
              const isOutOfQuota = p.used_count >= p.quota;
              const percentUsed = Math.min(100, Math.round((p.used_count / p.quota) * 100));

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs transition flex flex-col justify-between space-y-4 ${
                    !p.is_active || isExpired || isOutOfQuota
                      ? 'border-slate-200/60 opacity-75'
                      : 'border-slate-200/90 hover:border-[#0f2b5c]/30 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/60 text-[#0f2b5c] font-mono font-black text-xs tracking-wider">
                          {p.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(p.code)}
                          className="p-1 text-slate-400 hover:text-[#0f2b5c] transition cursor-pointer"
                          title="Salin Kode Promo"
                        >
                          <Copy className="size-3.5" />
                        </button>
                        {copiedCode === p.code && (
                          <span className="text-[10px] text-emerald-600 font-bold">Tersalin!</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                            p.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {p.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(p)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus Kupon"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-2.5">{p.name}</h3>

                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-[#0f2b5c]">
                        {p.type === 'percentage' ? `${p.value}% OFF` : formatMoney(p.value)}
                      </span>
                      {p.max_discount_amount && p.type === 'percentage' && (
                        <span className="text-[11px] text-slate-400">
                          (Maks. {formatMoney(p.max_discount_amount)})
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <Coins className="size-3 text-slate-400 shrink-0" />
                        <span>Min. Belanja: <strong>{formatMoney(p.min_order_amount)}</strong></span>
                      </p>
                      {p.expires_at && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-slate-400 shrink-0" />
                          <span>Berlaku s/d: <strong>{p.expires_at}</strong></span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* QUOTA PROGRESS */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Pemakaian Kuota:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {p.used_count} / {p.quota} ({percentUsed}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentUsed >= 90 ? 'bg-rose-500' : 'bg-[#0f2b5c]'
                        }`}
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL BUAT KUPON BARU */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Terbitkan Kupon Promo Baru"
        description="Tetapkan kode kupon, nilai diskon persentase atau nominal, dan kuota pemakaian pelanggan."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="promoCodeInput" className="block text-xs font-bold text-slate-700 mb-1">
                Kode Kupon (Uppercase) <span className="text-rose-500">*</span>
              </label>
              <input
                id="promoCodeInput"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="cth: HEMAT20"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-mono font-black tracking-wider uppercase focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label htmlFor="promoTypeSelect" className="block text-xs font-bold text-slate-700 mb-1">
                Tipe Diskon <span className="text-rose-500">*</span>
              </label>
              <select
                id="promoTypeSelect"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#0f2b5c]"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Potongan Flat (Rp)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="promoNameInput" className="block text-xs font-bold text-slate-700 mb-1">
              Nama Kampanye Promosi <span className="text-rose-500">*</span>
            </label>
            <input
              id="promoNameInput"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Promo Spesial Grand Opening Outlet"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="promoValueInput" className="block text-xs font-bold text-slate-700 mb-1">
                {type === 'percentage' ? 'Besar Diskon (%)' : 'Besar Potongan (Rp)'} <span className="text-rose-500">*</span>
              </label>
              <input
                id="promoValueInput"
                type="number"
                required
                min="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percentage' ? '20' : '15000'}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label htmlFor="promoMinOrderInput" className="block text-xs font-bold text-slate-700 mb-1">Min. Belanja (Rp)</label>
              <input
                id="promoMinOrderInput"
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="50000"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label htmlFor="promoMaxDiscountInput" className="block text-xs font-bold text-slate-700 mb-1">Maks. Diskon (Rp)</label>
              <input
                id="promoMaxDiscountInput"
                type="number"
                min="0"
                disabled={type === 'fixed'}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="20000"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="promoQuotaInput" className="block text-xs font-bold text-slate-700 mb-1">
                Kuota Pemakaian Total <span className="text-rose-500">*</span>
              </label>
              <input
                id="promoQuotaInput"
                type="number"
                required
                min="1"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                placeholder="100"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label htmlFor="promoExpiryInput" className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kedaluwarsa</label>
              <input
                id="promoExpiryInput"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              Terbitkan Kupon
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

