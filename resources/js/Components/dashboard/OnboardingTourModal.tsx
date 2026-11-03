import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Printer,
  Send,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Globe,
  Award,
} from 'lucide-react';
import { playTap, playSuccessChime } from '@/lib/sound';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  role?: string;
}

export default function OnboardingTourModal({
  isOpen,
  onClose,
  userName = 'Pengguna',
  role = 'owner',
}: OnboardingTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: `Selamat Datang di QLon, ${userName}!`,
      badge: 'Sovereign POS & CRM System',
      description:
        'QLon dirancang khusus untuk operasional retail, café, hingga festival event dengan trafik transaksi tinggi. Nikmati sinkronisasi data instan, performa stabil, dan arsitektur enterprise.',
      icon: Sparkles,
      iconColor: 'text-sky-400',
      highlights: [
        { label: 'Multi-Tenant Sovereign', desc: 'Isolasi database per-tenant & outlet yang aman.' },
        { label: 'Event High Concurrency', desc: 'Optimal untuk event ramai ribuan transaksi.' },
        { label: 'Audit Trail Real-time', desc: 'Pantau mutasi shift dan order secara langsung.' },
      ],
    },
    {
      title: 'Terminal Kasir & Pessimistic Locking',
      badge: 'Zero Oversell Guarantee',
      description:
        'Terminal POS kasir bekerja dengan database row-locking (lockForUpdate). Ketika banyak kasir checkout produk yang sama di event festival, sistem menjamin stok tidak akan minus atau oversell.',
      icon: ShoppingCart,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Shortcut Scanner Cepat', desc: 'Input barcode / SKU tanpa delay navigasi.' },
        { label: 'Caching Katalog 30s', desc: 'Katalog produk diload kilat via Redis cache.' },
        { label: 'Pilihan Bayar Fleksibel', desc: 'Mendukung QRIS, Tunai, Kartu, dan Transfer.' },
      ],
    },
    {
      title: 'Cetak Thermal ESC/POS & WhatsApp Gateway',
      badge: 'Multi-Channel Receipt Dispatch',
      description:
        'Cetak nota kasir secara profesional ke printer thermal 58mm / 80mm via Web Bluetooth BLE tanpa install driver, atau gunakan RawBT Android Intent. Kirim nota digital ke WhatsApp pelanggan dalam hitungan detik.',
      icon: Printer,
      iconColor: 'text-blue-500',
      highlights: [
        { label: 'Web Bluetooth BLE', desc: 'Cetak langsung dari browser Chrome / Edge.' },
        { label: 'RawBT Android Ready', desc: 'Kompatibel dengan POS Android mobile & tablet.' },
        { label: 'Nota WA Otomatis', desc: 'Pesan terformat rapi dengan tautan nota resmi.' },
      ],
    },
    {
      title: 'Dashboard Analitik Gaya Databrain',
      badge: 'Central Command & Intelligence',
      description:
        'Pantau 4 metrik utama operasional (Total Pesanan, GMV/Omzet, Transaksi Sukses, Pelanggan Terhubung CRM), grafik Status Analysis donat, dan tren Revenue Generation harian/bulanan.',
      icon: BarChart3,
      iconColor: 'text-indigo-500',
      highlights: [
        { label: 'Status Analysis Ring', desc: 'Rasio transaksi selesai vs pending secara visual.' },
        { label: 'Revenue Stack Chart', desc: 'Perbandingan omzet kotor & volume deal bulanan.' },
        { label: 'Live Sales Polling', desc: 'Telemetri otomatis update setiap 15 detik.' },
      ],
    },
    {
      title: 'Master Global Oversight & CRM Points',
      badge: 'Enterprise Retention Matrix',
      description:
        'Akun Master (Superadmin) dapat berpindah antar tenant untuk mengawasi seluruh stand event. Setiap transaksi otomatis menghitung akumulasi poin loyalitas pelanggan yang tertera pada nota.',
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      highlights: [
        { label: 'Master Tenant Switcher', desc: 'Pantau semua cabang atau event booth sekaligus.' },
        { label: 'CRM Points Auto-Accrual', desc: '1 Poin per Rp 10.000 belanja untuk retensi pelanggan.' },
        { label: 'Keamanan Berbasis Peran', desc: 'Hak akses ketat antara Master, Owner, dan Kasir.' },
      ],
    },
  ];

  const totalSteps = steps.length;
  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    playTap();
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    playTap();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    playSuccessChime();
    if (typeof window !== 'undefined') {
      localStorage.setItem('qlon_onboarded_completed', 'true');
    }
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-[28px] shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-slate-100 overflow-hidden">
        {/* Top Header Background with Navy Gradient */}
        <div className="relative bg-gradient-to-br from-[#061325] via-[#0b1f3b] to-[#040e1d] p-6 text-white overflow-hidden">
          {/* Subtle Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(147,197,253,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#0f2b5c] border border-blue-400/30 flex items-center justify-center text-white shadow-md">
                <StepIcon className={`size-5 ${current.iconColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  {current.badge}
                </span>
                <h3 className="text-lg font-extrabold tracking-tight text-white leading-tight">
                  {current.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playTap();
                onClose();
              }}
              className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Tutup onboarding"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Progress Indicator Pills */}
          <div className="relative z-10 flex items-center gap-1.5 mt-5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playTap();
                  setCurrentStep(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentStep === idx
                    ? 'w-10 bg-sky-400 shadow-sm'
                    : currentStep > idx
                    ? 'w-4 bg-white/60'
                    : 'w-4 bg-white/20'
                }`}
                title={`Langkah ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            {current.description}
          </p>

          {/* Feature Highlights Grid */}
          <div className="space-y-2.5 mb-6">
            {current.highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition"
              >
                <div className="size-5 rounded-full bg-blue-100 text-[#0f2b5c] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-3.5 text-[#0f2b5c]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{h.label}</h4>
                  <p className="text-[11px] text-slate-500">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                playTap();
                handleComplete();
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              Lewati Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" /> Kembali
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0f2b5c] hover:bg-[#163a75] active:bg-[#0a1e42] transition shadow-md shadow-blue-950/20 cursor-pointer flex items-center gap-1.5"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <span>Selesai &amp; Buka Dashboard</span>
                    <Sparkles className="size-3.5 text-sky-300" />
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ChevronRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

