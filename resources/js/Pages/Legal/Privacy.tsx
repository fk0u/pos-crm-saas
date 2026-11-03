import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  Cookie,
  KeyRound,
  FileCheck2,
  Server,
  Printer,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Scale,
  RefreshCw,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface PrivacyProps {
  lastUpdated?: string;
  effectiveYear?: number;
  appName?: string;
  companyName?: string;
  contactEmail?: string;
  dpoEmail?: string;
  supportPhone?: string;
}

export default function Privacy({
  lastUpdated = '1 Januari 2026',
  effectiveYear = 2026,
  appName = 'QLon POS & CRM',
  companyName = 'PT QLon Teknologi Indonesia',
  contactEmail = 'privacy@qlon.id',
  dpoEmail = 'dpo@qlon.id',
  supportPhone = '+62 821-4455-7788',
}: PrivacyProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    {
      id: 'section-1',
      title: '1. Komitmen Privasi & Prinsip Tata Kelola Data 2026',
      icon: ShieldCheck,
      content: [
        `Di ${appName}, yang dikelola oleh ${companyName}, privasi dan kedaulatan data bisnis Anda adalah prioritas mutlak kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menyimpan, memproses, dan melindungi data transaksi, kredensial akun, serta informasi pelanggan CRM Anda sepanjang tahun ${effectiveYear}.`,
        'Kami mematuhi seluruh regulasi perlindungan data pribadi yang berlaku di Indonesia (UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi / UU PDP) serta standar industri internasional terkait manajemen keamanan informasi ISO/IEC 27001.',
        'Prinsip utama kami: Tenant adalah pemilik tunggal dan sah atas seluruh data usahanya. Kami tidak akan pernah menjual, menyewakan, atau menyalahgunakan data penjualan dan kontak pelanggan Anda untuk keperluan periklanan pihak ketiga.',
      ],
    },
    {
      id: 'section-2',
      title: '2. Kategori Data yang Kami Kumpulkan',
      icon: Database,
      content: [
        'Data Akun & Profil Tenant: Nama usaha, subdomain toko, nama pemilik, alamat surat elektronik (email), nomor telepon seluler, dan konfigurasi outlet/booth event.',
        'Data Operasional Kasir (POS): Nama staf kasir, shift kerja kasir, waktu buka/tutup kasir, pergerakan kas laci (cash in / cash out), dan log aktivitas terminal.',
        'Data Transaksi Penjualan: Nomor faktur/invoice, rincian produk yang terjual, kuantitas, harga, total belanja, metode pembayaran (Tunai, QRIS, Kartu, Transfer), status pesanan, dan stempel waktu transaksi.',
        'Data CRM & Pelanggan Akhir: Nama pelanggan, nomor WhatsApp pelanggan (untuk struk digital), riwayat akumulasi poin loyalitas, serta tier keanggotaan.',
      ],
    },
    {
      id: 'section-3',
      title: '3. Arsitektur Isolasi Multi-Tenant & Enkripsi Data',
      icon: Lock,
      content: [
        'Sistem QLon dibangun dengan arsitektur Multi-Tenant Terisolasi. Setiap permintaan query basis data dikawal secara otomatis oleh TenantScope di level backend ORM, sehingga data antar-tenant terpartisi secara logis dan mustahil bocor ke penyewa lain.',
        'Enkripsi Saat Berpindah (In-Transit): Semua komunikasi antara perangkat kasir, browser dashboard, dan server QLon dilindungi dengan protokol enkripsi TLS 1.3 dengan sertifikasi SHA-256 berkekuatan tinggi.',
        'Enkripsi Saat Istirahat (At-Rest): Basis data PostgreSQL, cadangan snapshot, dan kunci rahasia disimpan dalam volume terenkripsi AES-256.',
      ],
    },
    {
      id: 'section-4',
      title: '4. Kebijakan Sesi, Cookies & Token Keamanan',
      icon: Cookie,
      content: [
        'Sesi Login Berbasis Sisi Server: QLon menggunakan session handler yang disimpan secara aman di database/Redis, bukan menyimpan kredensial di sisi peramban pengguna.',
        'Cookie Keamanan Berbendera Ketat: Cookie sesi kami (`laravel-session` dan `XSRF-TOKEN`) selalu dikonfigurasikan dengan atribut `HttpOnly` (mencegah pencurian skrip XSS), `SameSite=Lax` (memitigasi pemalsuan permintaan lintas situs CSRF), dan `Secure` pada koneksi terenkripsi HTTPS.',
        'Rotasi Token CSRF Otomatis: Setiap sesi peramban menerima token anti-pemalsuan (CSRF token) yang diverifikasi pada setiap permintaan mutasi (POST, PUT, DELETE). POS kasir dilengkapi dengan endpoint heartbeat untuk memperbarui token secara transparan tanpa mengganggu operasional kasir.',
      ],
    },
    {
      id: 'section-5',
      title: '5. Integrasi Pihak Ketiga & Pemroses Data',
      icon: Server,
      content: [
        'Mitra Gerbang Pembayaran (Payment Gateway): Transaksi QRIS dan kartu diproses secara langsung oleh mitra berlisensi Bank Indonesia (BI). QLon tidak menyimpan nomor kartu kredit lengkap atau PIN rahasia perbankan nasabah.',
        'Layanan Notifikasi WhatsApp: Nomor telepon pelanggan yang memilih untuk menerima struk digital hanya dikirimkan ke penyedia WhatsApp Business API resmi untuk pengiriman pesan transaksional satu-kali.',
      ],
    },
    {
      id: 'section-6',
      title: '6. Hak Kedaulatan Tenant & Penghapusan Data',
      icon: FileCheck2,
      content: [
        'Hak Akses & Ekspor Data: Tenant memiliki hak penuh untuk mengekspor seluruh rekap transaksi, daftar pelanggan CRM, dan katalog produk kapan saja dalam format CSV maupun Excel terstruktur.',
        'Hak Koreksi & Pembaruan: Pemilik akun berhak memperbarui informasi profil, alamat gerai, dan staf kasir secara langsung melalui menu pengaturan dashboard.',
        'Hak Penghapusan (Right to be Forgotten): Apabila Anda memutuskan untuk menutup akun tenant, Anda dapat mengajukan permintaan pembersihan data permanen kepada Petugas Perlindungan Data kami.',
      ],
    },
    {
      id: 'section-7',
      title: '7. Kontak Petugas Perlindungan Data (DPO)',
      icon: Mail,
      content: [
        `Jika Anda memiliki pertanyaan, keberatan, atau membutuhkan klarifikasi lebih lanjut mengenai tata kelola data di QLon sepanjang tahun ${effectiveYear}, silakan hubungi tim kepatuhan kami:`,
        `Pejabat Kepatuhan: Data Protection Officer (DPO) ${companyName}.`,
        `Surat Elektronik Kepatuhan: ${dpoEmail} atau ${contactEmail}.`,
        `Pusat Bantuan Resmi: ${supportPhone} (Senin - Sabtu, 08.00 - 20.00 WIB).`,
      ],
    },
  ];

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.some((c) => c.toLowerCase().includes(q))
    );
  }, [searchQuery, sections]);

  const handlePrint = () => {
    playTap();
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-[#0f2b5c]">
      <Head title={`Kebijakan Privasi & Keamanan Data - ${appName} (${effectiveYear})`} />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            onClick={() => playTap()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0f2b5c] transition px-2.5 py-1.5 rounded-lg hover:bg-slate-100/80"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Kembali</span>
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <Link href="/" className="flex items-center">
            <QlonLogo variant="full" size="sm" subtitle="Privacy Policy" />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Printer className="size-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak Dokumen</span>
          </button>

          <Link
            href="/terms"
            onClick={() => playTap()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0f2b5c] text-xs font-bold transition border border-blue-200/60"
          >
            <Scale className="size-3.5" />
            <span>Syarat &amp; Ketentuan</span>
          </Link>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-b from-white via-blue-50/30 to-[#f8fafc] border-b border-slate-200/60 pt-12 pb-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-[#0f2b5c] text-[11px] font-bold border border-blue-200 mb-4"
          >
            <ShieldCheck className="size-3.5 text-[#0f2b5c]" />
            <span>Kepatuhan UU PDP &amp; ISO 27001 &bull; Edisi Tahun {effectiveYear}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            Kebijakan Privasi &amp; Perlindungan Data
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mt-2.5 leading-relaxed"
          >
            Standar transparansi data, keamanan session cookies, enkripsi transaksi kasir, dan jaminan kedaulatan informasi tenant platform {appName}. Terakhir diperbarui: {lastUpdated}.
          </motion.p>

          {/* Quick Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-md mx-auto mt-6 relative"
          >
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kebijakan privasi (cth: cookies, whatsapp, enkripsi)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-[#0f2b5c] focus:ring-4 focus:ring-blue-900/10 transition"
            />
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SIDEBAR TABLE OF CONTENTS */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-900">
                <ShieldCheck className="size-4 text-[#0f2b5c]" />
                <span>Navigasi Dokumen Privasi</span>
              </div>
              <nav className="space-y-1">
                {sections.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => {
                        playTap();
                        setActiveSection(item.id);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition ${
                        active
                          ? 'bg-[#0f2b5c] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* DPO Contact Box */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] text-white p-4.5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="size-4 text-sky-300" />
                <span className="text-xs font-bold">Data Protection Officer</span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-relaxed mb-3">
                Membutuhkan audit kepatuhan privasi atau penghapusan data tenant?
              </p>
              <div className="text-[10px] space-y-1 border-t border-white/10 pt-2.5">
                <p><span className="text-blue-200">DPO:</span> {dpoEmail}</p>
                <p><span className="text-blue-200">General:</span> {contactEmail}</p>
              </div>
            </div>
          </aside>

          {/* MAIN CLAUSES */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Tidak ada kebijakan yang cocok dengan kata kunci "{searchQuery}".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-bold text-[#0f2b5c] hover:underline"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredSections.map((sec, idx) => {
                const Icon = sec.icon;
                return (
                  <motion.section
                    key={sec.id}
                    id={sec.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 pb-3.5 mb-4 border-b border-slate-100">
                      <div className="size-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0f2b5c] shrink-0">
                        <Icon className="size-4.5" />
                      </div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                        {sec.title}
                      </h2>
                    </div>

                    <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                      {sec.content.map((paragraph, pIdx) => (
                        <p key={pIdx} className="text-justify sm:text-left">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.section>
                );
              })
            )}

            {/* Bottom Certification Box */}
            <div className="p-5 rounded-2xl bg-[#0f2b5c]/5 border border-[#0f2b5c]/15 text-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-[#0f2b5c] shrink-0" />
                <span className="font-medium">
                  Sistem QLon secara berkala diaudit untuk menjamin zero-leakage pada multi-tenant context.
                </span>
              </div>
              <Link
                href="/terms"
                onClick={() => playTap()}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold transition shadow-2xs text-center shrink-0"
              >
                Baca Syarat &amp; Ketentuan
              </Link>
            </div>
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <QlonLogo variant="icon" size="xs" />
            <span className="font-bold text-slate-800">{companyName}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-slate-800 transition">
              Syarat &amp; Ketentuan
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="font-bold text-[#0f2b5c] hover:underline">
              Kebijakan Privasi
            </Link>
            <span>&bull;</span>
            <Link href="/login" className="hover:text-slate-800 transition">
              Masuk Aplikasi
            </Link>
          </div>
          <p className="text-[10px] text-slate-400">
            Hak Cipta &copy; {effectiveYear} QLon Platform. Dilindungi Undang-Undang.
          </p>
        </div>
      </footer>
    </div>
  );
}
