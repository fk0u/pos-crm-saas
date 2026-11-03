import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Building2,
  Users,
  Store,
  ChefHat,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { Navbar } from '@/Components/Landing/Navbar';
import { Footer } from '@/Components/Landing/Footer';
import { playTap } from '@/lib/sound';

interface PricingProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    role: string;
  } | null;
}

export default function Pricing({ isAuthenticated = false, user }: PricingProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [branchCount, setBranchCount] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    playTap();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Recommended tier based on slider
  const getRecommendedTier = (branches: number) => {
    if (branches <= 1) return 'core';
    if (branches <= 3) return 'essential';
    return 'full';
  };

  const recommendedTier = getRecommendedTier(branchCount);

  const comparisonFeatures = [
    { name: 'Maksimal Cabang Outlet', core: '1 Cabang', essential: 'Hingga 3 Cabang', full: 'Tanpa Batas' },
    { name: 'Maksimal Karyawan & Kasir', core: '2 Akun', essential: '10 Akun', full: 'Tanpa Batas' },
    { name: 'Kasir POS Cepat & Barcode Scan', core: true, essential: true, full: true },
    { name: 'Struk Thermal (58mm & 80mm)', core: true, essential: true, full: true },
    { name: 'Struk Digital WhatsApp', core: true, essential: true, full: true },
    { name: 'Laporan Penjualan Harian', core: true, essential: true, full: true },
    { name: 'Inventori Stok & Bahan Baku', core: false, essential: true, full: true },
    { name: 'Arus Kas & Tutup Kasir Shift (X/Z Report)', core: false, essential: true, full: true },
    { name: 'Kupon Diskon & Promosi Toko', core: false, essential: true, full: true },
    { name: 'Buku Kontak WhatsApp Pelanggan', core: false, essential: true, full: true },
    { name: 'Layar Dapur & Barista (KDS Touchscreen)', core: false, essential: false, full: true },
    { name: 'Pesan Meja QR & Menu Online Mandiri', core: false, essential: false, full: true },
    { name: 'Laporan Laba Rugi HPP Otomatis', core: false, essential: false, full: true },
    { name: 'Ekspor Resmi Excel & PDF Pajak PB1', core: false, essential: false, full: true },
    { name: 'Sambungan Luar & API Integrasi', core: false, essential: false, full: true },
    { name: 'Dukungan Prioritas CS WhatsApp', core: false, essential: true, full: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#0f2b5c] selection:text-white">
      <Head>
        <title>Paket Harga &amp; Berlangganan - QLon POS &amp; Central Ops</title>
        <meta
          name="description"
          content="Pilihan paket langganan sistem kasir toko QLon: Paket Dasar (Rp 49rb/bln), Paket Menengah (Rp 149rb/bln), dan Paket Solusi Lengkap (Rp 299rb/bln). Transparan tanpa biaya tersembunyi."
        />
      </Head>

      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />

      {/* HEADER HERO */}
      <section className="pt-16 pb-12 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0f2b5c] text-xs font-bold tracking-tight">
          <Sparkles className="size-3.5 text-blue-600" />
          <span>Harga Transparan &amp; Fleksibel</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
          Investasi Terjangkau untuk Pertumbuhan Toko Anda
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Semua paket sudah termasuk pembaruan sistem berkala, pencadangan basis data cloud, dan dukungan pelanggan ramah.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
            Bulanan
          </span>
          <button
            type="button"
            onClick={() => {
              playTap();
              setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
            }}
            className="w-14 h-8 rounded-full bg-[#0f2b5c] p-1 flex items-center transition cursor-pointer"
            aria-label="Pilih Periode Tagihan"
          >
            <div
              className={`size-6 rounded-full bg-white transition-transform ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
              Tahunan
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
              Hemat 17% (2 Bulan Gratis)
            </span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* 1. Core Tier */}
          <div className={`p-8 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-8 ${
            recommendedTier === 'core'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'border-slate-200/90 shadow-2xs'
          }`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  Paket Dasar (Core)
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">
                    {billingCycle === 'monthly' ? 'Rp 49.000' : 'Rp 490.000'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ bulan' : '/ tahun'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Cocok untuk kios tunggal, stand event, pop-up market, atau warkop sederhana.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Fitur Utama:</p>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 1 Cabang Toko</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Maksimal 2 Akun Kasir</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Kasir POS Cepat &amp; Barcode</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Struk Thermal &amp; Struk WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Laporan Penjualan Harian</span>
                </div>
              </div>
            </div>

            <Link
              href="/register?tier=core"
              onClick={() => playTap()}
              className="w-full py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 font-bold text-xs text-slate-800 text-center transition"
            >
              Pilih Paket Dasar
            </Link>
          </div>

          {/* 2. Essential Tier (POPULAR) */}
          <div className="p-8 rounded-3xl bg-white border-2 border-[#0f2b5c] shadow-xl flex flex-col justify-between space-y-8 relative">
            <div className="absolute -top-3.5 right-8 px-3.5 py-1 rounded-full bg-[#0f2b5c] text-white text-[10px] font-extrabold uppercase tracking-wide shadow-sm">
              Pilihan Paling Populer
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0f2b5c]">
                  Paket Menengah (Essential)
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">
                    {billingCycle === 'monthly' ? 'Rp 149.000' : 'Rp 1.490.000'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ bulan' : '/ tahun'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Solusi ideal untuk kedai kopi modern, cafe, dan toko retail 1 s/d 3 cabang.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Semua Fitur Dasar, Ditambah:</p>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Hingga 3 Cabang Toko</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Hingga 10 Karyawan &amp; Kasir</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Inventori Stok &amp; Bahan Baku</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Arus Kas &amp; Tutup Kasir Shift (X/Z)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Kupon Diskon &amp; Promo Toko</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Buku Kontak WhatsApp Pelanggan</span>
                </div>
              </div>
            </div>

            <Link
              href="/register?tier=essential"
              onClick={() => playTap()}
              className="w-full py-3.5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white font-bold text-xs text-center shadow-md active:scale-95 transition"
            >
              Mulai Paket Menengah
            </Link>
          </div>

          {/* 3. Full Solution Tier */}
          <div className={`p-8 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-8 ${
            recommendedTier === 'full'
              ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
              : 'border-slate-200/90 shadow-2xs'
          }`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                  Paket Solusi Lengkap (Full)
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">
                    {billingCycle === 'monthly' ? 'Rp 299.000' : 'Rp 2.990.000'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ bulan' : '/ tahun'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Untuk restoran skala penuh, waralaba, dan bisnis bertumbuh tanpa batas cabang.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-400">Semua Fitur Menengah, Ditambah:</p>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span><strong>Cabang &amp; Karyawan Tanpa Batas</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Layar Dapur &amp; Barista (KDS Touch)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Pesan Meja QR &amp; Menu Mandiri</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Laporan Laba Rugi HPP Otomatis</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Ekspor Excel &amp; Pajak PB1 Resmi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>Sambungan Luar &amp; API Integrasi</span>
                </div>
              </div>
            </div>

            <Link
              href="/register?tier=full"
              onClick={() => playTap()}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center shadow active:scale-95 transition"
            >
              Pilih Solusi Lengkap
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SCALE CALCULATOR */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Kalkulator Rekomendasi Paket Sesuai Skala Toko
            </h2>
            <p className="text-xs text-slate-500">
              Geser penunjuk jumlah cabang untuk melihat paket yang paling pas untuk usaha Anda.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#f8fafc] border border-slate-200/90 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Jumlah Cabang Toko:</span>
              <span className="text-2xl font-black text-[#0f2b5c] font-mono">
                {branchCount} Cabang
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={branchCount}
              onChange={(e) => setBranchCount(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f2b5c]"
            />

            <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase">Paket yang Direkomendasikan:</p>
                <p className="text-base font-extrabold text-[#0f2b5c]">
                  {recommendedTier === 'core' && 'Paket Dasar (Core) — Rp 49.000 / bln'}
                  {recommendedTier === 'essential' && 'Paket Menengah (Essential) — Rp 149.000 / bln'}
                  {recommendedTier === 'full' && 'Paket Solusi Lengkap (Full) — Rp 299.000 / bln'}
                </p>
              </div>

              <Link
                href={`/register?tier=${recommendedTier}`}
                onClick={() => playTap()}
                className="py-2.5 px-6 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold shadow text-center shrink-0"
              >
                Daftar Paket Ini
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED MATRIX COMPARISON TABLE */}
      <section id="matrix" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Perbandingan Fitur Detail
          </h2>
          <p className="text-xs text-slate-500">
            Tabel komparasi menyeluruh kemampuan di setiap tingkat paket.
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6 w-2/5">Fitur &amp; Kemampuan</th>
                  <th className="py-4 px-4 text-center w-1/5">Paket Dasar</th>
                  <th className="py-4 px-4 text-center w-1/5 bg-blue-50/50 text-[#0f2b5c]">Paket Menengah</th>
                  <th className="py-4 px-4 text-center w-1/5">Solusi Lengkap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{f.name}</td>

                    {/* Core */}
                    <td className="py-3.5 px-4 text-center">
                      {typeof f.core === 'boolean' ? (
                        f.core ? (
                          <CheckCircle2 className="size-4.5 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-bold text-slate-700">{f.core}</span>
                      )}
                    </td>

                    {/* Essential */}
                    <td className="py-3.5 px-4 text-center bg-blue-50/30">
                      {typeof f.essential === 'boolean' ? (
                        f.essential ? (
                          <CheckCircle2 className="size-4.5 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-bold text-[#0f2b5c]">{f.essential}</span>
                      )}
                    </td>

                    {/* Full */}
                    <td className="py-3.5 px-4 text-center">
                      {typeof f.full === 'boolean' ? (
                        f.full ? (
                          <CheckCircle2 className="size-4.5 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )
                      ) : (
                        <span className="font-bold text-emerald-700">{f.full}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-[#f8fafc] border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Pertanyaan Seputar Berlangganan</h2>
            <p className="text-xs text-slate-500">Hal-hal yang sering ditanyakan sebelum memulai.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apakah bisa upgrade atau downgrade paket di tengah jalan?',
                a: 'Bisa. Pengelola usaha dapat melakukan perubahan paket kapan saja melalui kontak CS atau panel akun. Kuota cabang dan staf akan langsung menyesuaikan.',
              },
              {
                q: 'Apakah ada kontrak jangka panjang atau denda pembatalan?',
                a: 'Tidak ada kontrak yang mengikat. Anda bebas berhenti berlangganan kapan pun tanpa biaya penalti atau denda pembatalan apa pun.',
              },
              {
                q: 'Bagaimana keamanan data transaksi saya jika berganti paket?',
                a: 'Seluruh riwayat transaksi, catatan kasir shift, data menu, dan nomor WhatsApp pelanggan tersimpan aman di cloud terenkripsi dan tidak akan pernah terhapus.',
              },
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4.5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
