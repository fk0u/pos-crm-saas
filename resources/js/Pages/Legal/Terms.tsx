import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  FileText,
  Shield,
  CheckCircle2,
  Scale,
  Receipt,
  Lock,
  RefreshCw,
  ArrowLeft,
  Printer,
  Search,
  Building2,
  Database,
  CreditCard,
  MessageSquare,
  Users,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface TermsProps {
  lastUpdated?: string;
  effectiveYear?: number;
  appName?: string;
  companyName?: string;
  contactEmail?: string;
  supportPhone?: string;
}

export default function Terms({
  lastUpdated = '1 Januari 2026',
  effectiveYear = 2026,
  appName = 'QLon POS & CRM',
  companyName = 'PT QLon Teknologi Indonesia',
  contactEmail = 'legal@qlon.id',
  supportPhone = '+62 821-4455-7788',
}: TermsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    {
      id: 'section-1',
      title: '1. Definisi & Ketentuan Umum Platform',
      icon: Scale,
      content: [
        `Selamat datang di ${appName}. Perjanjian Syarat dan Ketentuan ini ("Ketentuan") merupakan perjanjian hukum yang mengikat antara ${companyName} ("QLon", "Kami") dan pengguna ("Tenant", "Pemilik Usaha", "Kasir", atau "Anda") yang mengakses atau menggunakan ekosistem aplikasi kasir (Point of Sale), manajemen CRM, portal analitik, dan layanan terhubung lainnya pada tahun ${effectiveYear}.`,
        'Dengan mendaftar, mengakses, atau mengoperasikan sistem QLon, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan ini tanpa syarat. Apabila Anda tidak menyetujui ketentuan ini, Anda dilarang menggunakan ekosistem platform QLon.',
        'Platform QLon disediakan dalam arsitektur Multi-Tenant Cloud Berkinerja Tinggi yang dirancang khusus untuk operasional ritel harian dan acara berskala besar (Festival & Event Pop-up) dengan jaminan isolasi basis data antar-tenant.',
      ],
    },
    {
      id: 'section-2',
      title: '2. Akun Tenant, Keamanan Sesi & Hak Akses Berjenjang',
      icon: Lock,
      content: [
        'Setiap Tenant bertanggung jawab penuh atas kerahasiaan kredensial akun, termasuk kata sandi pemilik (Owner), kunci terminal kasir (Cashier PIN), dan token otorisasi API.',
        'Sistem QLon menerapkan otentikasi berbasis session guard terenkripsi, cookie HttpOnly bereputasi tinggi, dan mekanisme anti-CSRF token rotasi otomatis untuk memproteksi terminal dari serangan pembajakan sesi (Session Hijacking) maupun Cross-Site Request Forgery.',
        'QLon menyediakan hak akses berjenjang (Role-Based Access Control / RBAC) yang membedakan otoritas Master Administrator (Sovereign Global Oversight), Tenant Owner, Store Manager, dan Kasir Terminal. Pemilik akun bertanggung jawab atas setiap aksi yang dilakukan oleh staf di bawah kewenangannya.',
      ],
    },
    {
      id: 'section-3',
      title: '3. Layanan POS Kasir, Event Concurrency & Mode Offline',
      icon: Receipt,
      content: [
        'Sistem POS Terminal QLon dioptimasi untuk menangani lonjakan transaksi simultan (High Concurrency) selama jam sibuk event melalui sistem buffering Redis dan queue worker asynchronous.',
        'Dalam situasi gangguan konektivitas internet di lokasi event, terminal POS mendukung mekanisme caching lokal IndexedDB. Seluruh antrean pesanan tersimpan secara lokal dan otomatis tersinkronisasi kembali ke basis data pusat PostgreSQL begitu koneksi stabil.',
        'Tenant wajib memastikan perangkat keras kasir (tablet, printer thermal, barcode scanner) memenuhi spesifikasi minimum yang direkomendasikan untuk mencegah latensi saat antrean panjang.',
      ],
    },
    {
      id: 'section-4',
      title: '4. Transaksi Keuangan, QRIS & Cetak Struk Thermal',
      icon: CreditCard,
      content: [
        'QLon memfasilitasi pencatatan multi-metode pembayaran termasuk Tunai (Cash), QRIS Dinamis/Statis, Kartu Debit/Kredit, dan Transfer Bank.',
        'Modul cetak struk kasir mendukung format thermal 58mm dan 80mm standar protokol ESC/POS serta opsi cetak digital ramah lingkungan.',
        'QLon tidak bertindak sebagai lembaga perbankan. Seluruh settlement dana pembayaran digital dilakukan melalui mitra payment gateway berlisensi Bank Indonesia (BI) yang terintegrasi secara sah.',
      ],
    },
    {
      id: 'section-5',
      title: '5. CRM, Program Loyalitas & WhatsApp Gateway',
      icon: MessageSquare,
      content: [
        'Fitur Customer Relationship Management (CRM) QLon memungkinkan Tenant mencatat data loyalitas pelanggan, riwayat belanja, akumulasi poin reward, dan tier pelanggan (New, Regular, Loyal, VIP).',
        'Layanan pengiriman struk digital dan notifikasi via WhatsApp Gateway wajib mematuhi kebijakan anti-spam dan persetujuan pelanggan (opt-in). Tenant dilarang menyalahgunakan nomor telepon pelanggan untuk pengiriman pesan massal non-transaksional tanpa izin tertulis.',
        'Hak kedaulatan data pelanggan berada sepenuhnya pada Tenant. QLon tidak akan membagikan, menyewakan, atau menjual basis data kontak pelanggan kepada pihak ketiga manapun.',
      ],
    },
    {
      id: 'section-6',
      title: '6. Service Level Agreement (SLA) & Kedaulatan Data',
      icon: Database,
      content: [
        `Kami berkomitmen menyediakan ketersediaan layanan sistem sebesar 99.9% uptime selama tahun operasional ${effectiveYear}, di luar pemeliharaan terjadwal yang akan diinformasikan minimal 24 jam sebelumnya.`,
        'Seluruh basis data tenant diisolasi menggunakan TenantScope otomatis di level database schema dan application model, menjamin bahwa transaksi suatu tenant mustahil terbaca oleh tenant lain.',
        'QLon melakukan pencadangan otomatis (automated daily snapshot) dan enkripsi data istirahat (encryption at rest) menggunakan algoritma AES-256 berstandar industri perbankan.',
      ],
    },
    {
      id: 'section-7',
      title: '7. Batasan Tanggung Jawab & Pembatalan Layanan',
      icon: AlertTriangle,
      content: [
        'QLon tidak bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan (loss of profit), atau kegagalan transaksi yang diakibatkan oleh kelalaian operasional kasir, mati listrik total di lokasi booth event, atau gangguan jaringan seluler penyedia ISP pihak ketiga.',
        'Tenant berhak menghentikan langganan layanan kapan saja melalui panel pengaturan akun. Setelah terminasi, data transaksi dapat diekspor secara mandiri dalam format CSV/Excel dalam jangka waktu 30 hari kalender sebelum dilakukan proses purifikasi data.',
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
      <Head title={`Syarat & Ketentuan Layanan - ${appName} (${effectiveYear})`} />

      {/* TOP NAVBAR (Branded Navy Header) */}
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
            <QlonLogo variant="full" size="sm" subtitle="Terms of Service" />
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
            href="/privacy"
            onClick={() => playTap()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0f2b5c] text-xs font-bold transition border border-blue-200/60"
          >
            <Shield className="size-3.5" />
            <span>Kebijakan Privasi</span>
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
            <Scale className="size-3.5" />
            <span>Dokumen Hukum Resmi &bull; Edisi Tahun {effectiveYear}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
          >
            Syarat dan Ketentuan Layanan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto mt-2.5 leading-relaxed"
          >
            Pedoman kedaulatan data, hak operasional POS kasir, mekanisme event concurrency, dan tata kelola akun terpadu platform {appName}. Terakhir diperbarui: {lastUpdated}.
          </motion.p>

          {/* Quick Document Search Bar */}
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
              placeholder="Cari klausul ketentuan (cth: offline, struk, refund)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 shadow-xs focus:outline-none focus:border-[#0f2b5c] focus:ring-4 focus:ring-blue-900/10 transition"
            />
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STICKY TABLE OF CONTENTS (DESKTOP SIDEBAR) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-900">
                <FileText className="size-4 text-[#0f2b5c]" />
                <span>Daftar Isi Klausul</span>
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

            {/* Support Callout Box */}
            <div className="rounded-2xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] text-white p-4.5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-sky-300" />
                <span className="text-xs font-bold">Tim Hukum &amp; Kepatuhan</span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-relaxed mb-3">
                Memiliki pertanyaan khusus mengenai perjanjian kerjasama atau SLA tenant kustom?
              </p>
              <div className="text-[10px] space-y-1 border-t border-white/10 pt-2.5">
                <p><span className="text-blue-200">Email:</span> {contactEmail}</p>
                <p><span className="text-blue-200">Hotline:</span> {supportPhone}</p>
              </div>
            </div>
          </aside>

          {/* MAIN LEGAL TEXT CONTENT */}
          <main className="lg:col-span-8 space-y-6">
            {filteredSections.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Tidak ada klausul yang cocok dengan kata kunci "{searchQuery}".
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

            {/* Footer Acceptance Notice */}
            <div className="p-5 rounded-2xl bg-[#0f2b5c]/5 border border-[#0f2b5c]/15 text-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-[#0f2b5c] shrink-0" />
                <span className="font-medium">
                  Ketentuan ini berlaku mengikat untuk seluruh tenant aktif pada tahun {effectiveYear}.
                </span>
              </div>
              <Link
                href="/register"
                onClick={() => playTap()}
                className="px-4 py-2 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold transition shadow-xs text-center shrink-0"
              >
                Mulai Registrasi Tenant
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
            <Link href="/terms" className="font-bold text-[#0f2b5c] hover:underline">
              Syarat &amp; Ketentuan
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-slate-800 transition">
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
