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
  Star,
  Quote,
  Check,
  Zap,
  Clock,
  Heart,
  ChevronRight,
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
  const [activeModule, setActiveModule] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [activeTestimonial, setActiveTestimonial] = useState(2); // Center: Hendra

  const toggleFaq = (idx: number) => {
    playTap();
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const partnerLogos = [
    'KOPI KAWAN',
    'TOKO ROTI SEDAP',
    'DIMSUM 88',
    'URBAN ROASTERY',
    'BAKSO KOTA',
    'WARUNG KITA',
    'MATCHA HOUSE',
    'SATE NUSANTARA',
  ];

  const modules = [
    {
      id: '01',
      title: 'Terminal Kasir POS',
      subtitle: 'Kasir kilat, barcode scanner, dan cetak struk thermal',
      badge: 'Operasional Kasir',
      headline: 'Transaksi Cepat di Jam Sibuk Tanpa Hambatan',
      description:
        'Didesain khusus untuk kasir ritel dan F&B agar proses pembayaran selesai dalam hitungan detik. Mendukung scanner barcode kamera smartphone, kalkulator tunai otomatis, dan cetak struk printer thermal 58mm/80mm serta WhatsApp.',
      stats: [
        { label: 'Waktu Transaksi', val: '< 15 Detik' },
        { label: 'Metode Pembayaran', val: 'Tunai & QRIS' },
        { label: 'Koneksi Perangkat', val: 'Web, Tab & HP' },
      ],
      previewSnippet: {
        orderNum: '#INV-8021',
        total: 'Rp 68.000',
        items: ['2x Kopi Susu Aren', '1x Roti Bakar Cokelat'],
        status: 'Lunas (QRIS)',
      },
    },
    {
      id: '02',
      title: 'Pesan Meja QR Mandiri',
      subtitle: 'Tamu scan barcode meja, pilih menu, dan bayar sendiri',
      badge: 'F&B Experience',
      headline: 'Pangkas Antrean Meja Kasir Secara Alami',
      description:
        'Setiap meja makan memiliki kode QR unik. Tamu cukup mengarahkan kamera HP untuk membuka menu digital yang elegan, memilih varian/catatan makanan, dan menyelesaikan pesanan tanpa perlu menunggu pelayan datang membawa buku menu.',
      stats: [
        { label: 'Waktu Tunggu Tamu', val: '-60% Lebih Cepat' },
        { label: 'Instalasi Aplikasi', val: 'Tanpa Install' },
        { label: 'Routing Pesanan', val: 'Otomatis ke Kasir & Dapur' },
      ],
      previewSnippet: {
        orderNum: 'Meja 07 (Dine-in)',
        total: 'Rp 145.000',
        items: ['1x Nasi Goreng Spesial', '1x Iced Lychee Tea', '1x Dimsum Mentai'],
        status: 'Tamu Memesan',
      },
    },
    {
      id: '03',
      title: 'Layar Dapur & Barista (KDS)',
      subtitle: 'Tiket pesanan realtime di layar dapur tanpa kertas hilang',
      badge: 'Alur Dapur',
      headline: 'Dapur & Barista Bekerja Lebih Teratur dan Sinkron',
      description:
        'Ubah tablet bekas di dapur menjadi Kitchen Display System pintar. Setiap pesanan kasir atau meja QR langsung muncul dengan timer otomatis, pengelompokan varian, dan tombol status selesai yang memperbarui kasir secara realtime.',
      stats: [
        { label: 'Kertas Struk Dapur', val: '100% Hemat' },
        { label: 'Salah Masak / Terlewat', val: 'Nol Kejadian' },
        { label: 'Indikator Waktu', val: 'Hijau / Kuning / Merah' },
      ],
      previewSnippet: {
        orderNum: 'Tiket Dapur #12',
        total: '3 Menu',
        items: ['Mie Goreng Jawa (Pedas Sedang)', 'Es Jeruk Nipis', 'Tahu Crispy'],
        status: 'Sedang Dimasak (4m)',
      },
    },
    {
      id: '04',
      title: 'Arus Kas Laci & Rekap Shift',
      subtitle: 'Serah terima shift bebas drama selisih uang kas kecil',
      badge: 'Tata Kelola Kasir',
      headline: 'Pertanggungjawaban Uang Fisik yang Transparan',
      description:
        'Karyawan kasir memulai shift dengan input modal awal laci. Seluruh transaksi kas masuk dan pengeluaran darurat tercatat rapi. Saat shift berakhir, sistem membandingkan hitungan fisik dengan catatan penjualan tanpa rekayasa.',
      stats: [
        { label: 'Selisih Kasir', val: 'Terlacak Presisi' },
        { label: 'Laporan Tutup Shift', val: 'Cetak Thermal & PDF' },
        { label: 'Keamanan Akses', val: 'PIN Khusus Kasir' },
      ],
      previewSnippet: {
        orderNum: 'Shift Siang (Siti)',
        total: 'Rp 1.450.000',
        items: ['Modal: Rp 200.000', 'Kas Masuk: Rp 1.250.000', 'Pengeluaran: Rp 0'],
        status: 'Selisih Rp 0 (Tepat)',
      },
    },
    {
      id: '05',
      title: 'Laporan Laba Rugi & Pajak PB1',
      subtitle: 'Rekapitulasi omzet bersih, HPP, dan laporan pajak daerah',
      badge: 'Akuntansi & Pajak',
      headline: 'Laporan Keuangan Rapi Tanpa Perlu Akuntan Khusus',
      description:
        'Unduh rekapan penjualan harian, mingguan, atau bulanan dalam format Excel resmi. Dilengkapi kalkulasi Harga Pokok Penjualan (HPP) otomatis, laba bersih riil, dan pemisahan setoran pajak restoran PB1 (10%) yang siap diserahkan ke dinas terkait.',
      stats: [
        { label: 'Format Ekspor', val: 'Excel & PDF Resmi' },
        { label: 'Pajak PB1 Resto', val: 'Pemisahan Otomatis' },
        { label: 'Kalkulasi HPP', val: 'Otomatis per Porsi' },
      ],
      previewSnippet: {
        orderNum: 'Rekap Penjualan Bulan Ini',
        total: 'Rp 48.750.000',
        items: ['Omzet Bersih: Rp 44.318.000', 'PB1 (10%): Rp 4.432.000', 'HPP: Rp 16.500.000'],
        status: 'Laba Kotor: 62.7%',
      },
    },
  ];

  const testimonials = [
    {
      id: 0,
      name: 'Dimas Pratama',
      business: 'Dimsum 88 — Surabaya',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'Owner & Pengelola',
      quote: 'Sistem meja QR-nya membuat omzet naik 35% karena tamu bisa pesan ronde kedua tanpa antre.',
      story:
        'Di jam makan siang, biasanya pelanggan malas memesan tambahan karena kasir kami antre panjang. Setelah pakai QR meja QLon, mereka cukup scan dan tambah menu minuman atau cemilan langsung dari meja.',
      metric: '+35% Pesanan Ronde Kedua',
    },
    {
      id: 1,
      name: 'Maya Anggraini',
      business: 'Toko Roti Sedap — Bandung',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      role: 'Pemilik Toko',
      quote: 'Struk thermal dan pengiriman WhatsApp tanpa kertas membuat pelanggan kami kagum.',
      story:
        'Toko kami menjual pastry premium. Pelanggan menyukai struk digital via WhatsApp yang rapi dan higienis. Kasir kami tidak lagi dipusingkan kertas printer macet di tengah jam ramai.',
      metric: '100% Hemat Kertas Struk',
    },
    {
      id: 2,
      name: 'Hendra Setiawan',
      business: 'Kopi Kawan — Samarinda',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'Pendiri Usaha',
      quote: 'Pencatatan kasir paling rapi dan tanpa drama selisih kasir pergantian shift.',
      story:
        'Sebelumnya kami sering pusing saat pergantian shift kasir dan rekap harian yang memakan waktu berjam-jam tiap tengah malam. Dengan QLon, kasir bekerja jauh lebih cepat, dapur langsung terima pesanan meja via QR, dan laporan keuangan rapi setiap malam.',
      metric: '0 Selisih Uang Laci Kasir',
    },
    {
      id: 3,
      name: 'Reza Fahrezi',
      business: 'Urban Roastery — Jakarta',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      role: 'Direktur Operasional',
      quote: 'Multi-cabang terpantau dari satu HP tanpa harus keliling outlet setiap sore.',
      story:
        'Memantau 3 outlet kopi tadinya membutuhkan grup chat yang berisik. Sekarang saya cukup membuka dasbor QLon dari ponsel untuk melihat stok biji kopi yang menipis dan penjualan real-time di tiap toko.',
      metric: '3 Cabang Terpusat',
    },
    {
      id: 4,
      name: 'Jessica Tan',
      business: 'Matcha House — Bali',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'Founder',
      quote: 'Layar dapurnya mengubah alur barista kami dari kacau menjadi sangat tenang.',
      story:
        'Barista kami dulu sering keliru antara pesanan dine-in dan take away. Layar KDS QLon membedakan warna tiket dan waktu tunggu secara otomatis, membuat pesanan tersaji dalam rata-rata 4 menit.',
      metric: 'Rata-rata Saji 4 Menit',
    },
  ];

  const currentTestimonial = testimonials[activeTestimonial];

  const faqs = [
    {
      q: 'Apakah saya membutuhkan perangkat kasir atau mesin khusus?',
      a: 'Tidak perlu membeli mesin kasir mahal. QLon berjalan di web browser pada perangkat apa pun yang Anda miliki: tablet Android/iPad, laptop, komputer kasir, hingga smartphone Anda tanpa perlu instalasi aplikasi rumit.',
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
      a: 'Sangat siap. Tersedia fitur Ekspor Resmi Excel dan PDF dengan format resmi rekapitulasi penjualan kotor, potongan diskon, dan setoran pajak daerah (PB1 10%) yang siap diserahkan ke akuntan atau dinas pendapatan daerah.',
    },
    {
      q: 'Apakah saya bisa mencoba fitur-fiturnya terlebih dahulu sebelum berlangganan?',
      a: 'Tentu. Anda dapat mendaftar langsung secara gratis untuk mencoba seluruh fitur kasir, pesanan meja QR, dan manajemen staf selama 14 hari tanpa memerlukan kartu kredit.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      <Head>
        <title>QLon POS &amp; Central Ops — Aplikasi Kasir Cepat &amp; Laporan Multi-Cabang</title>
        <meta
          name="description"
          content="Satu aplikasi kasir modern untuk kelola transaksi kasir kilat, pesanan meja QR mandiri, kontrol arus kas shift, layar dapur KDS, dan laporan laba rugi otomatis."
        />
      </Head>

      <Navbar isAuthenticated={isAuthenticated} userName={user?.name} />

      {/* ========================================================= */}
      {/* 1. HERO SECTION (Reference 1 & 2 Aesthetic) */}
      {/* ========================================================= */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-32 overflow-hidden bg-white border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-6 shadow-xs">
            <span className="size-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Sistem Operasional Kasir &amp; Toko Multi-Cabang Indonesia</span>
          </div>

          {/* Editorial Headline (Newsreader Serif + Bold Modern Sans) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.12]">
            <span className="font-serif italic font-normal text-slate-800">Solusi Kasir &amp; Arus Kas</span>{' '}
            <span className="font-extrabold tracking-tight">yang Mempercepat Pertumbuhan Bisnis</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Dari booth festival, kedai kopi artisanal, hingga puluhan cabang restoran. Transaksi kasir kilat, pesanan meja QR mandiri, dan laporan laba rugi harian tanpa repot rekap manual.
          </p>

          {/* Action CTA Pill Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              onClick={() => playTap()}
              className="w-full sm:w-auto h-12 px-7 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 active:scale-95 transition"
            >
              <span>{isAuthenticated ? 'Masuk ke Dasbor' : 'Coba Sekarang — Gratis'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/pricing"
              onClick={() => playTap()}
              className="w-full sm:w-auto h-12 px-6 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition hover:bg-slate-50"
            >
              <CircleDollarSign className="w-4 h-4 text-slate-500" />
              <span>Lihat Pilihan Paket</span>
            </Link>
          </div>

          {/* Central Mockup Visual with Radial Sunrise Backdrop & Orbiting Bento Pills */}
          <div className="mt-14 relative max-w-4xl mx-auto">
            {/* Ambient Warm Radial Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[520px] h-[340px] sm:h-[420px] rounded-full blur-3xl -z-10 pointer-events-none opacity-80"
              style={{
                background: 'radial-gradient(circle, rgba(254, 215, 170, 0.6) 0%, rgba(253, 186, 116, 0.35) 45%, rgba(254, 240, 138, 0.15) 75%, transparent 100%)',
              }}
            />

            {/* Central Smartphone Device Container */}
            <div className="mx-auto w-[290px] sm:w-[320px] rounded-[40px] p-3 bg-slate-950 shadow-2xl border-4 border-slate-800 relative z-20">
              {/* Device Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="size-2 rounded-full bg-slate-800" />
              </div>

              {/* Screen Inner Viewport */}
              <div className="rounded-[28px] bg-slate-900 text-white p-4 text-left overflow-hidden relative shadow-inner">
                {/* Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-tight">Kopi Kawan</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Meja #04
                  </span>
                </div>

                {/* Live Order Snapshot */}
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">2x Kopi Susu Aren</p>
                      <p className="text-[10px] text-slate-400">Less Sugar • Oat Milk</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">Rp 44.000</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">1x Croissant Butter</p>
                      <p className="text-[10px] text-slate-400">Hangatkan</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">Rp 24.000</span>
                  </div>
                </div>

                {/* Payment & Receipt Summary */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Pembayaran</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">Rp 68.000</span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      QRIS Berhasil
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">12 Detik</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Orbiting Bento Pill 1: Top Left (Order Timestamp) */}
            <div className="hidden md:flex absolute top-6 left-4 lg:left-12 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl z-30 animate-in fade-in duration-500">
              <div className="size-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Clock className="size-4" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Kecepatan Kasir</p>
                <p className="text-xs font-bold text-slate-900">&lt; 15 Detik per Struk</p>
              </div>
            </div>

            {/* Orbiting Bento Pill 2: Middle Left (Omzet Growth) */}
            <div className="hidden md:flex absolute bottom-12 left-2 lg:left-6 items-center gap-3 px-4 py-3 rounded-2xl bg-amber-100/90 backdrop-blur-md border border-amber-200/90 shadow-xl z-30">
              <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <TrendingUp className="size-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-[11px] text-amber-900 font-bold">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>Omzet Usaha</span>
                </div>
                <p className="text-sm font-black text-slate-950 tracking-tight">+42% Rata-rata</p>
              </div>
            </div>

            {/* Orbiting Bento Pill 3: Top Right (Mint Green Daily Stats) */}
            <div className="hidden md:flex absolute top-10 right-4 lg:right-10 items-center gap-3.5 px-4 py-3 rounded-2xl bg-emerald-50/95 backdrop-blur-md border border-emerald-200/80 shadow-xl z-30">
              <div className="text-left">
                <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-bold">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>182 Item Terjual</span>
                </div>
                <p className="text-xs text-slate-500">Omzet Toko Hari Ini</p>
                <p className="text-sm font-mono font-extrabold text-slate-950">Rp 4.850.000</p>
              </div>
            </div>

            {/* Orbiting Bento Pill 4: Bottom Right (Customer Reactions) */}
            <div className="hidden md:flex absolute bottom-8 right-2 lg:right-8 items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl z-30">
              <div className="size-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="size-4 fill-rose-500" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">1.5k Pelanggan Puas</p>
                <p className="text-[10px] text-slate-500">Struk WhatsApp Ramah Lingkungan</p>
              </div>
            </div>
          </div>

          {/* Client Brand Ticker (Reference 1 style) */}
          <div className="mt-20 pt-10 border-t border-slate-200/80">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
              Dipercaya Ratusan Pemilik Kedai, Restoran, &amp; Ritel di Indonesia
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
              {partnerLogos.map((brand, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm font-bold tracking-wider text-slate-700 hover:text-slate-950 transition cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. BENTO GRID: SISTEM YANG BERBICARA (Reference 2 style) */}
      {/* ========================================================= */}
      <section id="fitur" className="py-24 bg-[#fafaf9] border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/70 text-slate-700 text-xs font-semibold mb-3">
              <Sparkles className="size-3 text-slate-900" />
              <span>Arsitektur Alur Kerja</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight leading-tight">
              <span className="font-serif italic font-normal">Sistem yang Berbicara</span>{' '}
              <span className="font-extrabold">untuk Setiap Sudut Operasional Toko</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Setiap komponen dirancang selaras — dari sentuhan pertama kasir hingga pembukuan pajak di akhir bulan.
            </p>
          </div>

          {/* Bento Mosaic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Large Editorial Hero Card */}
            <div className="md:col-span-2 rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-xs flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10 max-w-lg">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Filosofi Desain
                </span>
                <h3 className="text-2xl sm:text-3xl font-normal text-slate-950 mt-2 font-serif italic">
                  Pengalaman kasir yang mengalir tanpa hambatan.
                </h3>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  Tidak ada waktu untuk loading screen yang lambat saat antrean pelanggan mengular. QLon dibangun dengan arsitektur ringan yang merespons instan di setiap ketukan layar.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Kalkulasi Kembalian Otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Multi-Kasir Paralel</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Struk Thermal 58/80mm</span>
                </div>
              </div>
            </div>

            {/* Card 2: Pesan Meja QR */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition">
              <div>
                <div className="size-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-6">
                  <QrCode className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Pesan Meja QR Mandiri</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pelanggan cukup memindai kode QR di meja makan untuk membuka katalog menu, memilih variasi, dan membayar tanpa memanggil pelayan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
                <span>Tanpa instal aplikasi</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 3: Layar Dapur KDS */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition">
              <div>
                <div className="size-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-6">
                  <ChefHat className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Layar Dapur &amp; Barista</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Semua pesanan kasir dan meja masuk ke tablet dapur dengan timer antrean warna, memangkas risiko pesanan terselip atau lupa dimasak.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-800">
                <span>Bebas kertas struk hilang</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 4: Arus Kas Laci Shift */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition">
              <div>
                <div className="size-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-6">
                  <Receipt className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Arus Kas Laci &amp; Shift</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pencatatan modal kas kecil dan serah terima kasir yang transparan, mencegah selisih fisik uang kasir saat pergantian jam kerja.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Audit laci bebas selisih</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Card 5: Pajak PB1 & HPP */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between group hover:border-slate-300 transition">
              <div>
                <div className="size-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-6">
                  <FileSpreadsheet className="size-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">Laba Rugi &amp; Pajak PB1</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Kalkulasi otomatis HPP bahan baku per porsi serta pemisahan pajak restoran daerah 10% yang siap diekspor ke format Excel resmi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-800">
                <span>Ekspor resmi Excel &amp; PDF</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE SELECTED MODULES (Reference 2 style) */}
      {/* ========================================================= */}
      <section id="modul" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
              <span className="font-serif italic">Modul Pilihan</span>{' '}
              <span className="font-extrabold">&amp; Ruang Kerja</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Pilih modul operasional untuk melihat bagaimana QLon mentransformasi rutinitas harian tim toko Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Vertical Interactive Navigation List */}
            <div className="lg:col-span-5 space-y-3">
              {modules.map((m, idx) => {
                const isActive = activeModule === idx;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playTap();
                      setActiveModule(idx);
                    }}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all flex items-start gap-4 border ${
                      isActive
                        ? 'bg-slate-950 text-white border-slate-900 shadow-md'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div
                      className={`w-1 rounded-full self-stretch ${
                        isActive ? 'bg-amber-400' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                            isActive ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          Modul {m.id}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-slate-800 text-amber-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <h4 className="text-base font-bold mt-1">{m.title}</h4>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {m.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Dynamic Active Module Preview Card */}
            <div className="lg:col-span-7 rounded-3xl bg-slate-950 text-white p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
              
              {/* Module Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    {modules[activeModule].badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {modules[activeModule].headline}
                  </h3>
                </div>
                <span className="text-2xl font-mono font-light text-slate-600">
                  {modules[activeModule].id}
                </span>
              </div>

              {/* Module Description */}
              <p className="mt-6 text-sm text-slate-300 leading-relaxed">
                {modules[activeModule].description}
              </p>

              {/* Module Interactive Visual Preview Box */}
              <div className="mt-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  <span>Pratinjau Antarmuka Langsung</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-sans font-semibold">
                    <Check className="size-3" /> Siap Digunakan
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold">{modules[activeModule].previewSnippet.orderNum}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    {modules[activeModule].previewSnippet.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-400 text-[11px]">
                  {modules[activeModule].previewSnippet.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="size-1 rounded-full bg-slate-600" />
                      <span>{it}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white">
                  <span>Rekapitulasi</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {modules[activeModule].previewSnippet.total}
                  </span>
                </div>
              </div>

              {/* Operational Key Metrics */}
              <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-3 gap-4">
                {modules[activeModule].stats.map((st, i) => (
                  <div key={i}>
                    <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">{st.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-white mt-0.5">{st.val}</p>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. VOICES / TESTIMONIALS (Reference 3 Fanned Cards) */}
      {/* ========================================================= */}
      <section id="kisah" className="py-24 bg-[#fafaf9] border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Section Heading */}
          <h2 className="text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight leading-tight">
            <span className="font-serif italic">Kisah Nyata</span>{' '}
            <span className="font-extrabold">dari Mereka yang Bertumbuh Bersama Kami.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Cerita asli dari pemilik usaha kuliner dan ritel yang merasakan operasional lebih tenang dan teratur.
          </p>

          {/* Fanned Portrait Avatar Cards Stack */}
          <div className="mt-16 flex items-center justify-center -space-x-3 sm:-space-x-4 py-4 overflow-visible">
            {testimonials.map((t, idx) => {
              const isSelected = activeTestimonial === idx;
              
              // Angle and elevation logic for fanned deck
              const rotations = ['-rotate-12', '-rotate-6', 'rotate-0', 'rotate-6', 'rotate-12'];
              const rotationClass = rotations[idx] || 'rotate-0';

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    playTap();
                    setActiveTestimonial(idx);
                  }}
                  className={`relative transition-all duration-300 rounded-3xl overflow-hidden focus:outline-none ${rotationClass} ${
                    isSelected
                      ? 'w-24 sm:w-32 h-36 sm:h-48 z-30 shadow-2xl ring-4 ring-slate-950 scale-110 -translate-y-4'
                      : 'w-20 sm:w-28 h-32 sm:h-40 z-10 opacity-70 hover:opacity-100 hover:scale-105 shadow-md'
                  }`}
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2 sm:p-3 text-left">
                    <p className="text-[10px] sm:text-xs font-bold text-white truncate leading-tight">
                      {t.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-300 truncate">
                      {t.business.split('—')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Centered Spotlight Quote Review */}
          <div className="mt-12 max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-sm relative">
            <div className="size-10 rounded-full bg-slate-100 border border-slate-200 mx-auto -mt-14 mb-4 flex items-center justify-center text-slate-800 shadow-xs">
              <Quote className="size-4" />
            </div>

            <h3 className="text-xl sm:text-2xl font-normal text-slate-950 font-serif italic leading-snug">
              &ldquo;{currentTestimonial.quote}&rdquo;
            </h3>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">
              {currentTestimonial.story}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-sm font-bold text-slate-950">{currentTestimonial.name}</p>
                <p className="text-xs text-slate-500">{currentTestimonial.business}</p>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                {currentTestimonial.metric}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. PRICING SECTION (Pilihan Paket Modular) */}
      {/* ========================================================= */}
      <section id="harga" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
              <span className="font-serif italic font-normal">Pilihan Paket Transparan</span>{' '}
              <span className="font-extrabold">Sesuai Tahapan Usaha</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Mulai dari skala booth tunggal hingga puluhan cabang dengan alur kerja modular yang dapat disesuaikan.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-full bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setBillingCycle('monthly');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Bayar Bulanan
              </button>
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setBillingCycle('annually');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  billingCycle === 'annually'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <span>Tahunan</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-extrabold">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Tier 1: Core */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-950">Paket Inti (Core)</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    Kedai / Booth
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Solusi kasir cepat untuk operasional satu toko fisik.
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
                    <span>Maksimal 1 Toko / Cabang</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600 shrink-0" />
                    <span>Maksimal 2 Karyawan Kasir</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600 shrink-0" />
                    <span>Kasir POS &amp; Cetak Struk Bluetooth</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600 shrink-0" />
                    <span>Struk Digital via WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600 shrink-0" />
                    <span>Rekap Penjualan Kasir Harian</span>
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

            {/* Tier 2: Essential (Featured / Most Popular) */}
            <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-xl border-2 border-slate-800 flex flex-col justify-between relative transform lg:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                Paling Diminati
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">Paket Esensial</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-semibold">
                    Cafe &amp; Resto
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dilengkapi pesanan meja QR mandiri dan arus kas laci shift.
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
                    <span>Hingga 5 Karyawan Toko</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span>Pesan Meja QR Mandiri (Tanpa Antre)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span>Kontrol Arus Kas Laci &amp; Serah Terima Shift</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span>Laporan Pajak Daerah PB1 (10%) &amp; HPP</span>
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

            {/* Tier 3: Full Solution */}
            <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-950">Solusi Lengkap</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    Multi-Cabang
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ekosistem lengkap termasuk KDS Dapur dan integrasi API.
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
                    <span>Layar Dapur &amp; Barista Realtime (KDS)</span>
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
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FAQ SECTION */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#fafaf9] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Jawaban ringkas seputar perangkat, alur operasional, dan garansi layanan.
            </p>
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

      {/* ========================================================= */}
      {/* 7. MINIMALIST EDITORIAL CTA BANNER (Reference 3 style) */}
      {/* ========================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-[36px] bg-slate-100 border border-slate-200/90 py-16 px-6 sm:px-12 relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-normal text-slate-950 tracking-tight">
              <span className="font-serif italic font-normal">Siap Mengembangkan Usaha Anda</span>{' '}
              <span className="font-extrabold">Hari Ini?</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Dari satu kasir hingga puluhan cabang, seluruh pencatatan transaksi dan arus kas tertata rapi sejak hari pertama.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                onClick={() => playTap()}
                className="w-full sm:w-auto h-12 px-8 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 active:scale-95 transition"
              >
                <span>Mulai Uji Coba Gratis — 14 Hari</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-slate-400 font-medium">
              Tanpa kartu kredit • Siap dipakai dalam 2 menit • Bebas batalkan kapan saja
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
