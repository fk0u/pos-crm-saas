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
  Check,
  ChevronRight,
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [branchCount, setBranchCount] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    playTap();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const comparisonFeatures = [
    { name: 'Maksimal Toko / Cabang', core: '1 Cabang', essential: 'Hingga 2 Cabang', full: 'Tanpa Batas' },
    { name: 'Jumlah Akun Kasir', core: '2 Kasir', essential: '5 Akun Staf', full: 'Tanpa Batas' },
    { name: 'Kasir POS & Struk Thermal', core: true, essential: true, full: true },
    { name: 'Struk Digital via WhatsApp', core: true, essential: true, full: true },
    { name: 'Pesan Meja QR Mandiri', core: false, essential: true, full: true },
    { name: 'Arus Kas Laci & Tutup Shift', core: false, essential: true, full: true },
    { name: 'Layar Dapur & Barista (KDS)', core: false, essential: false, full: true },
    { name: 'Ekspor Resmi Pajak PB1 Resto', core: false, essential: true, full: true },
    { name: 'Perhitungan HPP Bahan Baku', core: false, essential: true, full: true },
    { name: 'Sambungan Luar & API Integrasi', core: false, essential: false, full: true },
    { name: 'Dukungan Teknis', core: 'Standar Email', essential: 'WhatsApp Prioritas', full: 'Manajer Akun 24/7' },
  ];

  const faqs = [
    {
      q: 'Bisakah saya berganti paket di tengah masa langganan?',
      a: 'Tentu. Anda dapat meningkatkan atau menurunkan paket kapan saja melalui menu Akun & Langganan di dasbor toko. Biaya akan disesuaikan secara prorata.',
    },
    {
      q: 'Bagaimana metode pembayaran langganan yang didukung?',
      a: 'Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, Dana, ShopeePay), Transfer Virtual Account Bank (BCA, Mandiri, BRI, BNI), serta kartu debit.',
    },
    {
      q: 'Apakah ada kontrak jangka panjang atau biaya pendaftaran awal?',
      a: 'Tidak ada biaya tersembunyi atau pendaftaran awal. Anda membayar per bulan atau per tahun secara transparan dan bebas berhenti kapan pun tanpa penalti.',
    },
    {
      q: 'Bagaimana jika toko saya memiliki lebih dari 10 cabang?',
      a: 'Paket Solusi Lengkap (Full Solution) sudah mencakup cabang tanpa batas. Tim kami juga siap membantu proses migrasi data menu dan pelatihan staf kasir secara langsung.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Head>
        <title>Pilihan Paket &amp; Harga — QLon POS &amp; Central Ops</title>
        <meta
          name="description"
          content="Transparansi paket langganan aplikasi kasir QLon POS. Mulai dari paket inti untuk 1 cabang hingga solusi lengkap multi-cabang tanpa biaya tersembunyi."
        />
      </Head>

      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />

      {/* HEADER SECTION */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-4">
            <Sparkles className="size-3 text-slate-900" />
            <span>Transparansi Biaya Tanpa Potongan Tersembunyi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-normal text-slate-950 tracking-tight leading-tight">
            <span className="font-serif italic font-normal">Investasi Tepat</span>{' '}
            <span className="font-extrabold">untuk Operasional yang Rapi</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Semua paket dilengkapi uji coba gratis 14 hari. Pilih skema yang paling sesuai dengan kebutuhan cabang dan tim kasir Anda.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="mt-8 inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                playTap();
                setBillingCycle('monthly');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Langganan Bulanan
            </button>
            <button
              type="button"
              onClick={() => {
                playTap();
                setBillingCycle('annually');
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                billingCycle === 'annually'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>Langganan Tahunan</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Core */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-950">Paket Inti (Core)</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                  1 Cabang
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Kebutuhan kasir kilat dan pembukuan dasar toko retail / kedai kopi kecil.
              </p>

              <div className="mt-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950 font-mono">
                    {billingCycle === 'annually' ? 'Rp 63.200' : 'Rp 79.000'}
                  </span>
                  <span className="text-xs text-slate-500">/ bulan</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annually' ? 'Ditagih Rp 758.400 / tahun' : 'Bebas berhenti kapan saja'}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>1 Cabang / Toko Fisik</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>2 Akun Karyawan Kasir</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Kasir POS &amp; Cetak Thermal Bluetooth</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Struk Digital Ramah Lingkungan via WhatsApp</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Laporan Omzet Kasir Harian</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/register?tier=core"
                onClick={() => playTap()}
                className="w-full h-11 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center transition hover:bg-slate-50"
              >
                Pilih Paket Inti
              </Link>
            </div>
          </div>

          {/* Card 2: Essential (Featured) */}
          <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-xl border-2 border-slate-800 flex flex-col justify-between relative transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              Pilihan Favorit Pengusaha
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Paket Esensial</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold">
                  Hingga 2 Cabang
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Lengkap dengan pesanan meja QR mandiri, arus kas shift, dan pajak PB1.
              </p>

              <div className="mt-6 pb-6 border-b border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">
                    {billingCycle === 'annually' ? 'Rp 151.200' : 'Rp 189.000'}
                  </span>
                  <span className="text-xs text-slate-400">/ bulan</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annually' ? 'Ditagih Rp 1.814.400 / tahun' : 'Bebas batalkan kapan saja'}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Hingga 2 Toko / Cabang</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Hingga 5 Akun Staf Toko</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Pesan Meja QR Mandiri (Bebas Antre)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Arus Kas Laci &amp; Serah Terima Bebas Selisih</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 shrink-0" />
                  <span>Laporan Pajak Daerah PB1 (10%) &amp; HPP Otomatis</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/register?tier=essential"
                onClick={() => playTap()}
                className="w-full h-11 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md active:scale-95 transition"
              >
                Pilih Paket Esensial
              </Link>
            </div>
          </div>

          {/* Card 3: Full Solution */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-950">Solusi Lengkap</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  Multi-Cabang
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh ekosistem tanpa batasan, termasuk layar dapur KDS dan API pengembang.
              </p>

              <div className="mt-6 pb-6 border-b border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950 font-mono">
                    {billingCycle === 'annually' ? 'Rp 311.200' : 'Rp 389.000'}
                  </span>
                  <span className="text-xs text-slate-500">/ bulan</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {billingCycle === 'annually' ? 'Ditagih Rp 3.734.400 / tahun' : 'Bebas batalkan kapan saja'}
                </p>
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Cabang &amp; Outlet Tanpa Batas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Akun Staf &amp; Kasir Tanpa Batas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Layar Dapur &amp; Barista (KDS) Realtime</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Sambungan Luar &amp; Webhook Pengembang</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-600 shrink-0" />
                  <span>Dukungan Teknis Prioritas 24/7 via WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4">
              <Link
                href="/register?tier=full"
                onClick={() => playTap()}
                className="w-full h-11 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs flex items-center justify-center transition hover:bg-slate-50"
              >
                Pilih Solusi Lengkap
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* MATRIX PERBANDINGAN FITUR */}
      <section id="matrix" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
              Perbandingan Rinci Fitur &amp; Kemampuan
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Lihat tabel spesifikasi teknis modul per paket langganan.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 font-bold text-slate-900 w-2/5">Fitur &amp; Kapasitas</th>
                  <th className="py-4 px-4 font-bold text-slate-900 text-center w-1/5">Paket Inti</th>
                  <th className="py-4 px-4 font-bold text-slate-950 text-center w-1/5 bg-slate-100/60">
                    Paket Esensial
                  </th>
                  <th className="py-4 px-4 font-bold text-slate-900 text-center w-1/5">Solusi Lengkap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-6 font-medium text-slate-800">{row.name}</td>
                    
                    {/* Core */}
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      {typeof row.core === 'boolean' ? (
                        row.core ? (
                          <Check className="size-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )
                      ) : (
                        <span>{row.core}</span>
                      )}
                    </td>

                    {/* Essential */}
                    <td className="py-3.5 px-4 text-center text-slate-900 font-semibold bg-slate-50/50">
                      {typeof row.essential === 'boolean' ? (
                        row.essential ? (
                          <Check className="size-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )
                      ) : (
                        <span>{row.essential}</span>
                      )}
                    </td>

                    {/* Full */}
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      {typeof row.full === 'boolean' ? (
                        row.full ? (
                          <Check className="size-4 text-emerald-600 mx-auto" />
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )
                      ) : (
                        <span className="font-bold text-slate-950">{row.full}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#fafaf9] border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
              Pertanyaan Seputar Biaya &amp; Langganan
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-slate-950' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
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
