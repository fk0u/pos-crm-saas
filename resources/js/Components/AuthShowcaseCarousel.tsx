import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Printer,
  Send,
  ShieldCheck,
  Award,
  Sparkles,
  Globe,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { playTap } from '@/lib/sound';

export default function AuthShowcaseCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = 3;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleNext = () => {
    playTap();
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    playTap();
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (idx: number) => {
    playTap();
    setActiveSlide(idx);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="hidden lg:flex lg:col-span-6 xl:col-span-6 m-2 sm:m-3 p-8 sm:p-10 rounded-[28px] bg-gradient-to-br from-[#061325] via-[#0b1f3b] to-[#040e1d] text-white flex-col justify-between relative overflow-hidden shadow-inner select-none"
    >
      {/* Background Radial Glow & Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(147,197,253,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(147,197,253,0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/4 -right-16 size-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-16 size-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Carousel Navigation Arrows */}
      <div className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200/80">
            Interactive System Preview
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition active:scale-95 text-white/80 hover:text-white"
            title="Slide Sebelumnya"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition active:scale-95 text-white/80 hover:text-white"
            title="Slide Berikutnya"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Floating Interactive Widget Cards Stage */}
      <div className="relative h-[330px] w-full z-10 mt-2">
        {/* SLIDE 0: Financial Intelligence & Live POS */}
        <div
          className={`absolute inset-0 transition-all duration-500 transform ${
            activeSlide === 0
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : activeSlide > 0
              ? 'opacity-0 -translate-x-8 pointer-events-none'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          {/* Card 1: Top Left - Financial Plan Donut Chart */}
          <div className="absolute top-1 left-2 w-[245px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] border border-white/90 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-2">
              <span className="font-bold text-slate-700">Financial Plan</span>
              <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                Bulan Ini <ChevronDown className="size-3 text-slate-400" />
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative size-14 shrink-0">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#0f2b5c"
                    strokeWidth="4"
                    strokeDasharray="65 100"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4"
                    strokeDasharray="25 100"
                    strokeDashoffset="-65"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 font-mono">Rp 48.500.000</p>
                <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="size-2.5" /> +18.4% Omzet
                </p>
                <div className="space-y-0.5 mt-1.5 text-[8px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[#0f2b5c]" />
                    <span>Kasir POS (72%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-sky-400" />
                    <span>Loyalty CRM (28%)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-1.5 text-center text-[10px] font-bold rounded-lg bg-[#0f2b5c] hover:bg-[#163a75] text-white transition shadow-xs"
              >
                Explore All Plan
              </button>
            </div>
          </div>

          {/* Card 2: Top Right - Future Funds & Target */}
          <div className="absolute top-12 right-1 w-[225px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.38)] border border-white/90 z-20 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
              <span className="font-bold text-slate-700">Future Funds</span>
              <span className="text-[9px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-semibold">Target Event</span>
            </div>
            <p className="text-[11px] font-bold text-slate-800">Target Omzet Bulanan</p>
            <p className="text-[9px] text-slate-400 mb-2">Due date • 30 Nov 2026</p>
            <div className="flex items-baseline justify-between text-xs font-mono font-black mb-1">
              <span className="text-[#0f2b5c]">Rp 38,5jt</span>
              <span className="text-slate-400 text-[10px]">/ Rp 50jt</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f2b5c] to-sky-500 h-full rounded-full w-[77%]" />
            </div>
            <div className="flex justify-between text-[8px] text-slate-500 mt-1.5 font-medium">
              <span>Progress Realtime</span>
              <span className="text-emerald-700 font-bold">77% Tercapai</span>
            </div>
          </div>

          {/* Card 3: Bottom Left - Capital Allocations */}
          <div className="absolute bottom-1 left-6 w-[255px] bg-white text-slate-900 rounded-2xl p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.3)] border border-white/90 z-10 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="font-bold text-slate-800">Capital Allocations</span>
              <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                +12% Realtime
              </span>
            </div>
            <p className="text-xs font-black font-mono text-slate-900 mb-2">Rp 17.366.000</p>
            <div className="space-y-1.5 text-[9px]">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-600 truncate max-w-[130px]">Kopi Susu Aren (40 cup)</span>
                <span className="font-mono font-bold text-slate-900">Rp 720.000</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-slate-600 truncate max-w-[130px]">Matcha Latte (25 cup)</span>
                <span className="font-mono font-bold text-slate-900">Rp 550.000</span>
              </div>
            </div>
            <div className="mt-2.5">
              <button
                type="button"
                className="w-full py-1 text-center text-[9px] font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition"
              >
                Review Investment
              </button>
            </div>
          </div>
        </div>

        {/* SLIDE 1: High-Concurrency Festival & Event Engine */}
        <div
          className={`absolute inset-0 transition-all duration-500 transform ${
            activeSlide === 1
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : activeSlide > 1
              ? 'opacity-0 -translate-x-8 pointer-events-none'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          {/* Card 1: Event Traffic Guard */}
          <div className="absolute top-1 left-2 w-[245px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] border border-white/90 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="size-3.5 text-[#0f2b5c]" />
                <span>Peak Traffic Guard</span>
              </div>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                AKTIF
              </span>
            </div>
            <div className="space-y-1.5 text-[9px]">
              <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <span className="text-slate-600">Pessimistic DB Lock</span>
                <span className="font-mono font-bold text-blue-900">lockForUpdate()</span>
              </div>
              <div className="flex items-center justify-between px-1 text-slate-500">
                <span>Resiko Oversell Stok</span>
                <span className="font-bold text-emerald-600">0% Terjamin</span>
              </div>
              <div className="flex items-center justify-between px-1 text-slate-500">
                <span>Redis Cache Hit Rate</span>
                <span className="font-mono font-bold text-[#0f2b5c] flex items-center gap-0.5">
                  <Zap className="size-2.5 text-amber-500" /> 99.8%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="w-full py-1.5 text-center text-[10px] font-bold rounded-lg bg-[#0f2b5c] text-white"
              >
                Event Concurrency ON
              </button>
            </div>
          </div>

          {/* Card 2: Thermal Printer Multi-driver */}
          <div className="absolute top-12 right-1 w-[225px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.38)] border border-white/90 z-20 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1">
                <Printer className="size-3.5 text-[#0f2b5c]" /> Struk Thermal
              </span>
              <span className="text-[9px] text-slate-400">58 / 80mm</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">Driver cetak langsung kasir</p>
            <div className="space-y-1 text-[9px]">
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                <span>Web Bluetooth BLE Langsung</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                <span>RawBT Android Intent</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                <span>QR Struk Digital Publik</span>
              </div>
            </div>
            <div className="mt-2.5 p-1.5 rounded-lg bg-slate-50 text-[8px] text-slate-500 font-mono text-center">
              ESC/POS RAW BYTE READY
            </div>
          </div>

          {/* Card 3: WhatsApp Gateway Auto-Send */}
          <div className="absolute bottom-1 left-6 w-[255px] bg-white text-slate-900 rounded-2xl p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.3)] border border-white/90 z-10 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Send className="size-3 text-emerald-600" /> WhatsApp Gateway
              </span>
              <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                Terkirim 0.3s
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[9px] text-slate-700 space-y-0.5 mb-2">
              <p className="font-bold text-emerald-950">*STRUK PEMBAYARAN KOPI KAWAN*</p>
              <p className="text-[8px] text-slate-600">Total: Rp 45.000 • QRIS Kasir #1</p>
              <p className="text-[8px] text-blue-700 underline truncate">qlon.id/invoices/INV-992/receipt</p>
            </div>
            <button
              type="button"
              className="w-full py-1 text-center text-[9px] font-bold rounded-lg bg-[#0f2b5c] text-white"
            >
              Uji Cepat Kirim Nota
            </button>
          </div>
        </div>

        {/* SLIDE 2: Master Multi-Tenant Oversight & CRM Points */}
        <div
          className={`absolute inset-0 transition-all duration-500 transform ${
            activeSlide === 2
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          {/* Card 1: Master Tenant Command */}
          <div className="absolute top-1 left-2 w-[245px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.35)] border border-white/90 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] mb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Globe className="size-3.5 text-[#0f2b5c]" />
                <span>Master HQ Command</span>
              </div>
              <span className="text-[8px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                SUPERADMIN
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mb-1">Pantau Seluruh Tenant Global</p>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[9px] space-y-1 mb-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Total GMV Event:</span>
                <span className="font-mono font-bold text-[#0f2b5c]">Rp 184.200.000</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Tenant Aktif:</span>
                <span className="font-bold text-slate-800">24 Stand Berjalan</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full py-1.5 text-center text-[10px] font-bold rounded-lg bg-[#0f2b5c] text-white"
            >
              Akses Master Panel
            </button>
          </div>

          {/* Card 2: CRM Loyalty Rewards */}
          <div className="absolute top-12 right-1 w-[225px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.38)] border border-white/90 z-20 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 mb-1">
              <span className="flex items-center gap-1">
                <Award className="size-3.5 text-amber-500" /> CRM Loyalty Points
              </span>
              <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 rounded font-bold">Gold Tier</span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">Retensi Pelanggan Otomatis</p>
            <div className="space-y-1 text-[9px] text-slate-600">
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Skema Poin:</span>
                <span className="font-bold text-slate-800">1 Poin / Rp 10.000</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-100">
                <span>Repeat Order:</span>
                <span className="font-bold text-emerald-600">+42% Pelanggan Baru</span>
              </div>
            </div>
            <div className="mt-2.5 p-1.5 rounded-lg bg-amber-50/60 text-[8px] text-amber-800 font-semibold text-center">
              Poin otomatis tercetak di struk kasir
            </div>
          </div>

          {/* Card 3: RBAC & Audit Trail */}
          <div className="absolute bottom-1 left-6 w-[255px] bg-white text-slate-900 rounded-2xl p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.3)] border border-white/90 z-10 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Lock className="size-3 text-[#0f2b5c]" /> Enkripsi &amp; RBAC
              </span>
              <span className="text-[8px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                ISO Ready
              </span>
            </div>
            <p className="text-[9px] text-slate-500 mb-2">Hak akses terisolasi per-tenant</p>
            <div className="grid grid-cols-3 gap-1 text-[8px] text-center font-bold">
              <span className="p-1 rounded bg-slate-100 text-slate-700">Master</span>
              <span className="p-1 rounded bg-slate-100 text-slate-700">Owner</span>
              <span className="p-1 rounded bg-slate-100 text-slate-700">Kasir</span>
            </div>
            <div className="mt-2.5">
              <button
                type="button"
                className="w-full py-1 text-center text-[9px] font-bold rounded-lg bg-slate-900 text-white"
              >
                Audit Security Trail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Value Proposition & Interactive Pagination */}
      <div className="relative z-10 text-center max-w-md mx-auto pt-3">
        {/* Monogram Badge */}
        <div className="size-11 rounded-2xl bg-[#0f2b5c] border border-blue-400/30 flex items-center justify-center mx-auto text-sky-300 font-black text-lg shadow-lg mb-3">
          {activeSlide === 0 ? (
            <Zap className="size-5 text-sky-300" />
          ) : activeSlide === 1 ? (
            <Layers className="size-5 text-sky-300" />
          ) : (
            <Sparkles className="size-5 text-sky-300" />
          )}
        </div>

        {/* Dynamic Titles per Slide */}
        {activeSlide === 0 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              A Unified Hub for Smarter Financial Decision-Making
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed max-w-sm mx-auto">
              QLon empowers you with a unified financial command center — delivering deep insights and a 360° view of your entire economic world.
            </p>
          </div>
        )}

        {activeSlide === 1 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Engineered for High-Concurrency Event &amp; Festival POS
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed max-w-sm mx-auto">
              Process explosive order spikes with pessimistic database locks, sub-second WhatsApp receipts, and zero inventory oversell.
            </p>
          </div>
        )}

        {activeSlide === 2 && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Master Multi-Tenant Oversight &amp; Loyalty Matrix
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed max-w-sm mx-auto">
              Control every outlet and festival stand from a sovereign master hub while driving repeat purchases with automatic loyalty points.
            </p>
          </div>
        )}

        {/* Interactive Slider Bars Pagination */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? 'w-12 bg-white shadow-sm'
                  : 'w-6 bg-white/25 hover:bg-white/50'
              }`}
              title={`Slide ${idx + 1}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

