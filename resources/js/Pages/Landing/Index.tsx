import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ShoppingCart,
  Receipt,
  Boxes,
  Users,
  BarChart3,
  ChefHat,
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  CircleDollarSign,
  Store,
  Layers,
  ChevronDown,
  Printer,
  Smartphone,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { Navbar } from '@/Components/Landing/Navbar';
import { Footer } from '@/Components/Landing/Footer';
import { playTap } from '@/lib/sound';

interface LandingIndexProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    role: string;
  } | null;
}

export default function LandingIndex({ isAuthenticated = false, user }: LandingIndexProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    playTap();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'Apakah saya membutuhkan perangkat kasir atau mesin khusus?',
      a: 'Tidak perlu. QLon berjalan di web browser pada perangkat apa pun yang Anda miliki: tablet Android/iPad, laptop, komputer kasir, hingga smartphone Anda tanpa perlu instalasi aplikasi rumit.',
    },
    {
      q: 'Bagaimana jika cabang usaha saya bertambah di kemudian hari?',
      a: 'Anda dapat menaikkan paket langganan kapan saja melalui menu pengaturan. Seluruh riwayat transaksi, katalog menu, dan database pelanggan tetap aman dan otomatis tersambung lintas cabang.',
    },
    {
      q: 'Apakah struk belanja bisa dicetak ke printer thermal Bluetooth?',
      a: 'Ya, QLon mendukung printer thermal standar 58mm dan 80mm via Bluetooth/USB, serta pengiriman struk digital ramah lingkungan langsung ke WhatsApp pelanggan tanpa kertas.',
    },
    {
      q: 'Apakah laporan penjualan sudah sesuai untuk laporan pajak PB1 (Restoran)?',
      a: 'Sangat siap. Tersedia fitur Ekspor Resmi Excel dan PDF dengan format resmi rekapitulasi penjualan kotor, potongan diskon, dan setoran pajak daerah (PB1 10%) yang siap diserahkan ke akuntan atau Bapenda.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-[#0f2b5c] selection:text-white">
      <Head>
        <title>QLon POS &amp; Central Ops - Aplikasi Kasir Cepat &amp; Laporan Multi-Cabang</title>
        <meta
          name="description"
          content="Satu aplikasi kasir pintar untuk kelola transaksi kasir kilat, pesanan meja QR, kontrol arus kas laci shift, layar dapur KDS, dan laporan laba rugi otomatis."
        />
      </Head>

      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0f2b5c] text-xs font-bold tracking-tight">
                <Sparkles className="size-3.5 text-blue-600" />
                <span>Sistem Kasir &amp; Monitoring Cabang F&amp;B / Retail Indonesia</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Satu Aplikasi Kasir untuk Kelola Penjualan, Stok, dan Seluruh Cabang Toko Anda.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Dari booth event, kedai kopi, hingga puluhan cabang restoran. Transaksi kasir secepat kilat, pesanan meja QR otomatis, dan pantauan laba rugi langsung dari genggaman tanpa repot rekap manual tengah malam.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href={isAuthenticated ? '/dashboard' : '/register'}
                  onClick={() => playTap()}
                  className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#0f2b5c] hover:bg-[#163a75] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/25 active:scale-95 transition"
                >
                  <span>{isAuthenticated ? 'Masuk ke Dasbor' : 'Coba Sekarang — Gratis'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/pricing"
                  onClick={() => playTap()}
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <CircleDollarSign className="w-4 h-4 text-slate-500" />
                  <span>Lihat Pilihan Paket</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Kasir Cepat &lt; 15 Detik</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Struk Thermal &amp; WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Rekap Shift Bebas Selisih</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Visual */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 shadow-2xl text-white relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500" />
                    <div className="size-3 rounded-full bg-amber-500" />
                    <div className="size-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-300 ml-2">Terminal Kasir Toko</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    Sistem Siap
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/90 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Pesanan Masuk</p>
                      <p className="font-bold text-white">#ORD-9201 (Meja 04)</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold">
                      Sedang Dimasak
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[10px]">Penjualan Hari Ini</p>
                      <p className="font-bold text-emerald-400 text-sm">Rp 4.850.000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-[10px]">Total Transaksi</p>
                      <p className="font-bold text-white">82 Nota</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/90 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChefHat className="size-4 text-amber-400" />
                      <span>Layar Dapur &amp; Barista</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[11px]">Sinkron Otomatis</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cabang Pusat (Samarinda Central)</span>
                  <span>Shift Siang: Siti (Kasir)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 CORE PAINS AND SOLUTIONS */}
      <section className="py-20 bg-[#f8fafc] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700">Tantangan Nyata Toko &amp; Solusinya</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Tinggalkan Cara Lama yang Menguras Waktu dan Rawan Kebocoran Kas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="size-12 rounded-2xl bg-blue-50 text-[#0f2b5c] flex items-center justify-center">
                <ShoppingCart className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Kasir Lambat Saat Jam Ramai?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Antrean kasir menumpuk karena menu sulit dicari dan salah kembalian. QLon menghadirkan layar sentuh kilat dengan katalog kategori instan dan kalkulator kembalian otomatis.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="size-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <CircleDollarSign className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Takut Uang Kas Laci Selisih?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap pergantian shift kasir wajib melakukan input modal awal dan penghitungan kas fisik (X/Z Report). Sistem otomatis mendeteksi selisih uang secara real-time.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Pelanggan Malas Install Aplikasi?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kumpulkan kontak dan kirimkan struk belanja langsung ke nomor WhatsApp pelanggan dalam 3 detik tanpa memaksa pelanggan mendownload aplikasi baru yang memenuhi memori HP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 CORE PILLARS SHOWCASE */}
      <section id="fitur" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Fitur Lengkap Modular</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Dirancang Lengkap dari Meja Kasir hingga Pembukuan Pemilik Usaha
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pilar 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow">
                <Receipt className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Kasir Cepat &amp; Multi-Metode Pembayaran</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mendukung pembayaran Tunai, QRIS dinamis, Kartu Debit/EDC, dan Transfer Bank. Cetak ke printer thermal Bluetooth (58/80mm) atau kirim struk digital tanpa kertas langsung ke WhatsApp pembeli.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Barcode Scanner</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Kupon &amp; Diskon</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Retur Transaksi Aman</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow">
                <Boxes className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Manajemen Inventori Stok &amp; Bahan Baku</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stok produk dan bahan baku otomatis terpotong setiap transaksi terjadi di kasir. Dilengkapi fitur peringatan stok menipis dan riwayat penyesuaian opname berkala.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Peringatan Stok Habis</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Opname Stok Cepat</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Multi-Satuan Barang</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow">
                <ChefHat className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Layar Dapur &amp; Barista Realtime (KDS)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Koki dan barista tidak perlu lagi kertas pesanan basah atau hilang. Pesanan dari kasir atau QR meja langsung berbunyi di layar dapur dengan timer visual warna (&lt;8m hijau, 8-15m kuning, &gt;15m merah).
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Timer Waktu Masak</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Bel Notifikasi Suara</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Checklist Menu Sentuh</span>
              </div>
            </div>

            {/* Pilar 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="size-11 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center shadow">
                <BarChart3 className="size-5.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">4. Pembukuan Untung Rugi &amp; Pajak PB1 Resmi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kalkulasi otomatis Harga Pokok Penjualan (HPP), laba bersih, dan rekapitulasi setoran pajak restoran daerah (PB1 10%). Ekspor sekali klik ke file Excel rapi atau dokumen PDF siap cetak.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Laporan Pajak Daerah</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Ekspor Excel UTF-8</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">Dokumen PDF Resmi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR ONLINE ORDERING HIGHLIGHT */}
      <section id="pesan-meja" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-500/30">
                <QrCode className="size-3.5" />
                <span>Pesan Mandiri di Meja</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Setiap Toko Punya Tautan Menu Online Mandiri
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Pelanggan cukup scan stiker QR di atas meja untuk membuka menu, memilih varian, dan menyelesaikan pembayaran secara instan. Pesanan langsung masuk ke antrean kasir dan layar dapur secara waktu-nyata.
              </p>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 font-mono text-xs text-sky-300 flex items-center justify-between">
                <span>https://pos.kousozo.tech/nama-toko-anda</span>
                <span className="text-slate-400 text-[10px]">Tautan Toko Publik</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 rounded-3xl bg-slate-800/90 border border-slate-700/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Pelanggan Scan QR di Meja</h4>
                    <p className="text-xs text-slate-400">Tanpa download aplikasi, langsung terbuka di browser HP</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Pilih Menu &amp; Bayar QRIS</h4>
                    <p className="text-xs text-slate-400">Mendukung catatan khusus seperti "Kurang Manis" atau "Extra Pedas"</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Dapur Langsung Memasak</h4>
                    <p className="text-xs text-slate-400">Pesanan berdering di layar KDS dapur dan tercatat otomatis di kasir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPACT PRICING PREVIEW */}
      <section className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Pilihan Paket Langganan</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Investasi Terjangkau, Tanpa Biaya Tersembunyi
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Pilih paket yang paling sesuai dengan skala operasional toko Anda hari ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Core */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                  Paket Dasar (Core)
                </span>
                <h3 className="text-xl font-bold text-slate-900">Rp 49.000 <span className="text-xs font-normal text-slate-500">/ bulan</span></h3>
                <p className="text-xs text-slate-500">Cocok untuk booth event, kios tunggal, dan warkop.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Maksimal 1 Cabang Toko</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Maksimal 2 Akun Kasir</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Kasir POS &amp; Scan Barcode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Laporan Penjualan Harian</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register?tier=core"
                onClick={() => playTap()}
                className="w-full py-3 rounded-xl border border-slate-300 hover:border-slate-400 font-bold text-xs text-slate-800 text-center transition"
              >
                Pilih Paket Dasar
              </Link>
            </div>

            {/* Essential */}
            <div className="p-7 rounded-3xl bg-white border-2 border-[#0f2b5c] shadow-lg flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#0f2b5c] text-white text-[10px] font-extrabold uppercase tracking-wide">
                Paling Populer
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[#0f2b5c]">
                  Paket Menengah (Essential)
                </span>
                <h3 className="text-xl font-bold text-slate-900">Rp 149.000 <span className="text-xs font-normal text-slate-500">/ bulan</span></h3>
                <p className="text-xs text-slate-500">Pilihan tepat untuk kedai kopi, cafe, dan retail 1–3 cabang.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Hingga 3 Cabang Toko</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Hingga 10 Karyawan &amp; Kasir</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Inventori Stok &amp; Bahan Baku</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Arus Kas &amp; Tutup Kasir Shift</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Buku Kontak WhatsApp Pelanggan</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register?tier=essential"
                onClick={() => playTap()}
                className="w-full py-3 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white font-bold text-xs text-center shadow-md transition"
              >
                Mulai Paket Menengah
              </Link>
            </div>

            {/* Full Solution */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                  Paket Solusi Lengkap (Full)
                </span>
                <h3 className="text-xl font-bold text-slate-900">Rp 299.000 <span className="text-xs font-normal text-slate-500">/ bulan</span></h3>
                <p className="text-xs text-slate-500">Untuk restoran &amp; bisnis bertumbuh tanpa batas skala.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span><strong>Cabang &amp; Karyawan Tanpa Batas</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Layar Dapur &amp; Barista (KDS Sentuh)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Pesan Meja QR &amp; Menu Online</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Laporan Untung Rugi HPP Otomatis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Ekspor Resmi Excel &amp; Pajak PB1</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/register?tier=full"
                onClick={() => playTap()}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center shadow transition"
              >
                Pilih Solusi Lengkap
              </Link>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/pricing"
              onClick={() => playTap()}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0f2b5c] hover:underline"
            >
              <span>Lihat Perbandingan Fitur Seluruh Paket Secara Rinci</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-[#f8fafc] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Informasi lengkap seputar sistem, perangkat keras, dan keamanan data toko Anda.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="py-20 bg-[#0f2b5c] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Siap Membuka Toko Lebih Cepat &amp; Bebas Repot?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Daftarkan bisnis Anda dalam waktu kurang dari 2 menit dan rasakan kemudahan mengontrol operasional kasir serta keuangan toko dari satu tempat.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              onClick={() => playTap()}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-2xl bg-white text-[#0f2b5c] hover:bg-slate-100 font-extrabold text-sm shadow-xl active:scale-95 transition"
            >
              <span>Daftar Sekarang — Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
