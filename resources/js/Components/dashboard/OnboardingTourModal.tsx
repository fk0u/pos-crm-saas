import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Printer,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Users,
  Package,
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
  userName = 'Kak',
  role = 'owner',
}: OnboardingTourModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qlon_onboarded_completed') === 'true';
    }
    return false;
  });

  if (!isOpen) return null;

  const handleToggleDontShowAgain = (e: React.ChangeEvent<HTMLInputElement>) => {
    playTap();
    const checked = e.target.checked;
    setDontShowAgain(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        localStorage.setItem('qlon_onboarded_completed', 'true');
      } else {
        localStorage.removeItem('qlon_onboarded_completed');
      }
    }
  };

  const handleClose = () => {
    playTap();
    if (dontShowAgain && typeof window !== 'undefined') {
      localStorage.setItem('qlon_onboarded_completed', 'true');
    }
    onClose();
  };

  const steps = [
    {
      title: `Halo ${userName}, Selamat Datang di QLon!`,
      badge: 'Langkah Awal Pengenalan',
      description:
        'QLon hadir untuk membantu toko, kafe, atau stan event Anda melayani pelanggan dengan cepat, rapi, dan mudah digunakan tanpa ribet.',
      icon: Sparkles,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Mudah Dipakai', desc: 'Tampilan bersih, ramah layar sentuh HP dan tablet.' },
        { label: 'Lancar & Cepat', desc: 'Transaksi tetap lancar walau antrean pembeli sedang ramai.' },
        { label: 'Otomatis Rapi', desc: 'Stok barang, uang kas, dan laporan penjualan tercatat otomatis.' },
      ],
    },
    {
      title: 'Menu Kasir Yang Simpel & Cepat',
      badge: 'Kasir & Pembayaran',
      description:
        'Cukup pilih atau scan produk, pilih nominal uang, dan transaksi langsung beres dalam hitungan detik. Tersedia juga tombol nominal cepat.',
      icon: ShoppingCart,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Tombol Cepat Uang Pas', desc: 'Tersedia pilihan nominal langsung (+10k, +20k, +50k, Pas).' },
        { label: 'Semua Metode Pembayaran', desc: 'Bisa terima Tunai, QRIS, Kartu Debit, atau Transfer.' },
        { label: 'Papan Ketik Layar Sentuh', desc: 'Bisa mengetik langsung di layar tanpa keyboard tambahan.' },
      ],
    },
    {
      title: 'Cetak Struk & Kirim Nota ke WhatsApp',
      badge: 'Struk Belanja Pelanggan',
      description:
        'Cetak nota pembayaran langsung ke printer struk kecil (58mm/80mm) lewat Bluetooth atau kirim nota digital resmi langsung ke nomor WhatsApp pembeli.',
      icon: Printer,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Tanpa Install Driver', desc: 'Bisa langsung mencetak lewat Bluetooth di HP atau tablet.' },
        { label: 'Hemat Kertas dengan WA', desc: 'Kirim nota digital langsung ke WhatsApp pembeli.' },
        { label: 'Format Rapi', desc: 'Tercantum nama toko, daftar belanja, dan rincian kembalian.' },
      ],
    },
    {
      title: 'Katalog Produk & Pantau Stok',
      badge: 'Manajemen Barang',
      description:
        'Tambah menu atau barang baru lengkap dengan foto galeri. Anda bisa melihat stok yang aman, menipis, atau yang sudah habis dalam satu layar.',
      icon: Package,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Tampilan Foto / Tabel', desc: 'Bisa diubah ke mode Galeri Foto atau Daftar Tabel.' },
        { label: 'Peringatan Stok Habis', desc: 'Warna penanda otomatis saat stok tersisa sedikit.' },
        { label: 'Atur Stok Fleksibel', desc: 'Tambah atau kurangi stok saat kulakan atau stock opname.' },
      ],
    },
    {
      title: 'Pantau Penjualan & Keuntungan Toko',
      badge: 'Laporan Usaha',
      description:
        'Lihat ringkasan omzet harian, keuntungan bersih, jam paling ramai pembeli, dan produk paling laris tanpa perlu hitung kalkulator manual.',
      icon: BarChart3,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Jam Paling Ramai', desc: 'Ketahui jam sibuk toko untuk mengatur jadwal jaga kasir.' },
        { label: 'Produk Terlaris', desc: 'Tahu produk mana yang paling disukai pembeli.' },
        { label: 'Unduh Excel / CSV', desc: 'Bisa download rekap laporan untuk pembukuan bulanan.' },
      ],
    },
    {
      title: 'Data Bisnis Anda Aman & Terpisah',
      badge: 'Keamanan Data SaaS',
      description:
        'Setiap bisnis memiliki ruangan data masing-masing yang terenkripsi. Hak akses kasir, pemilik usaha, hingga tim teknis dipisahkan dengan sangat ketat.',
      icon: ShieldCheck,
      iconColor: 'text-[#0f2b5c]',
      highlights: [
        { label: 'Akses Sesuai Jabatan', desc: 'Kasir hanya mengurus transaksi; omzet penuh hanya milik Owner.' },
        { label: 'Bantuan CS Terhubung', desc: 'Ada kendala? Tim dukungan kami siap membantu langsung.' },
        { label: 'Privasi Terjamin', desc: 'Data penjualan toko Anda tidak akan pernah dibagikan ke pihak lain.' },
      ],
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    playTap();
    if (isLast) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('qlon_onboarded_completed', 'true');
      }
      playSuccessChime();
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    playTap();
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Right Controls: Lewati & Close Button */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            Lewati
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="size-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition cursor-pointer active:scale-95"
            aria-label="Tutup panduan"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Step Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0f2b5c] text-xs font-bold">
            {step.badge}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Langkah {currentStep + 1} dari {steps.length}
          </span>
        </div>

        {/* Content Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="size-12 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0">
            <StepIcon className="size-6 text-[#0f2b5c]" />
          </div>
          <div className="pr-16">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {step.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="space-y-2.5 my-6">
          {step.highlights.map((h, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 flex items-start gap-3"
            >
              <CheckCircle2 className="size-4.5 text-[#0f2b5c] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">{h.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  playTap();
                  setCurrentStep(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-6 bg-[#0f2b5c]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Buka langkah ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Footer: Jangan Tampilkan Lagi Checkbox & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-500 hover:text-slate-800">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleToggleDontShowAgain}
              className="size-4 rounded border-slate-300 text-[#0f2b5c] focus:ring-[#0f2b5c]/20 cursor-pointer"
            />
            <span>Jangan tampilkan lagi</span>
          </label>

          <div className="flex items-center justify-end gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer active:scale-95"
              >
                <ChevronLeft className="size-4" /> Kembali
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="h-10 px-5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
            >
              <span>{isLast ? 'Selesai & Mulai Pakai' : 'Lanjut'}</span>
              {!isLast && <ChevronRight className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
