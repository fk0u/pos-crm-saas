import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileQuestion,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  LifeBuoy,
  BookOpen,
  Printer,
  CreditCard,
  Package,
  Layers,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface HelpPageProps {
  userName?: string;
  role?: string;
  outletName?: string;
  tenantName?: string;
}

export default function Help({
  userName = 'Samantha W',
  role = 'owner',
  outletName = 'Central Outlet',
  tenantName = 'QLon Store',
}: HelpPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Bagaimana cara menghubungkan printer struk kasir Bluetooth?',
      a: 'Buka menu Kasir POS, klik tombol printer di kanan atas atau saat popup selesai transaksi. Pastikan Bluetooth di HP/tablet Anda aktif, lalu pilih nama printer thermal Anda (58mm atau 80mm). Sistem akan langsung terhubung tanpa perlu menginstal CD driver.',
      category: 'Printer & Hardware',
    },
    {
      q: 'Bagaimana cara mengirim nota struk ke WhatsApp pelanggan?',
      a: 'Saat selesai transaksi di kasir POS, pilih opsi "Kirim ke WhatsApp". Jika Anda telah memasukkan nomor telepon pelanggan saat memesan, tautan nota digital resmi QLon akan otomatis tersusun dan siap dikirim via WhatsApp dengan 1 klik.',
      category: 'Kasir & Transaksi',
    },
    {
      q: 'Apakah kasir tetap bisa digunakan jika internet mati di lokasi event?',
      a: 'Ya, terminal kasir QLon dilengkapi sistem penyimpanan lokal pintar (Local Storage & IndexedDB). Anda tetap bisa menginput pesanan dan menerima uang tunai. Saat koneksi internet tersambung kembali, seluruh transaksi akan otomatis disinkronkan ke server.',
      category: 'Koneksi & Offline',
    },
    {
      q: 'Bagaimana cara membedakan hak akses Kasir dan Pemilik Usaha (Owner)?',
      a: 'Sebagai Owner, Anda bisa mengatur menu, melihat laporan laba bersih, dan mengatur modal kasir. Akun staf Kasir hanya memiliki akses ke menu pencatatan transaksi Kasir dan buka/tutup shift laci kasir mereka sendiri, sehingga data omzet utama tetap aman.',
      category: 'Akun & Keamanan (RBAC)',
    },
    {
      q: 'Apakah Superadmin atau Developer aplikasi bisa melihat data penjualan rahasia toko saya?',
      a: 'Tidak. Sistem SaaS QLon menerapkan isolasi database ketat antar-penyewa (Multi-Tenant Isolation). Pihak Superadmin hanya mengawasi kesehatan infrastruktur server aplikasi dan status aktif langganan. Untuk melihat data sensitif bisnis Anda dalam rangka bantuan teknis, Superadmin wajib meminta izin atau Token Akses Sementara dari Owner bisnis.',
      category: 'Privasi Data SaaS',
    },
    {
      q: 'Bagaimana cara menambah produk baru dengan foto makanan / minuman?',
      a: 'Masuk ke menu "Katalog Produk", klik tombol "Tambah Produk", isi nama produk, harga modal, harga jual, jumlah stok, dan masukkan tautan foto produk di kolom "URL Gambar Produk". Foto akan langsung muncul di katalog dan galeri kasir.',
      category: 'Katalog Produk',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell userName={userName} role={role} outletName={outletName} tenantName={tenantName}>
      <Head title="Pusat Bantuan & Layanan CS - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HERO HEADER */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] p-6 sm:p-10 text-white shadow-xl shadow-blue-950/20 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-bold backdrop-blur-xs mb-3">
              <LifeBuoy className="size-3.5" /> Pusat Bantuan &amp; Customer Support 24/7
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Ada yang bisa kami bantu seputar kasir QLon?
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-2 leading-relaxed">
              Temukan jawaban cepat seputar penggunaan kasir, cetak struk bluetooth, manajemen stok produk, atau hubungi tim customer service kami secara langsung.
            </p>

            {/* Quick Search */}
            <div className="relative mt-6 max-w-md">
              <Search className="size-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik kata kunci (misal: printer, whatsapp, stok)..."
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-white text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-md"
              />
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <QlonLogo variant="icon" size="lg" />
          </div>
        </div>

        {/* 3 REALTIME CONTACT CHANNELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* WhatsApp CS Realtime */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Support%20QLon,%20saya%20butuh%20bantuan%20terkait%20aplikasi%20kasir."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTap()}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="size-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
                <MessageCircle className="size-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Service WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Terhubung langsung dengan tim teknis operasional untuk bantuan cepat saat event ramai.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition">
              <span>Chat WhatsApp Sekarang</span>
              <ChevronRight className="size-4" />
            </div>
          </a>

          {/* Hotline Darurat */}
          <a
            href="tel:+6282144557788"
            onClick={() => playTap()}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="size-11 rounded-2xl bg-blue-50 border border-blue-200 text-[#0f2b5c] flex items-center justify-center mb-3">
                <Phone className="size-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Hotline Telepon Darurat</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Layanan panggilan telepon darurat khusus kendala operasional kasir kritis di lapangan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0f2b5c] group-hover:translate-x-0.5 transition">
              <span>+62 821-4455-7788</span>
              <ChevronRight className="size-4" />
            </div>
          </a>

          {/* Email Support */}
          <a
            href="mailto:support@qlon.id"
            onClick={() => playTap()}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-300 transition group flex flex-col justify-between"
          >
            <div>
              <div className="size-11 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-3">
                <Mail className="size-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Email Bantuan &amp; Rekening</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pengajuan integrasi khusus, pertanyaan tagihan langganan SaaS, atau kendala data akun.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition">
              <span>support@qlon.id</span>
              <ChevronRight className="size-4" />
            </div>
          </a>
        </div>

        {/* FAQ ACCORDION SECTION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Pertanyaan Yang Sering Ditanyakan (FAQ)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Panduan praktis solusi masalah umum tanpa harus menunggu respon CS.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
              {filteredFaqs.length} Artikel
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setOpenFaq(isOpen ? null : index);
                    }}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm hover:text-[#0f2b5c] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-[#0f2b5c] font-semibold shrink-0">
                        {faq.category}
                      </span>
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0f2b5c]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="pt-2.5 pb-1 text-xs text-slate-600 leading-relaxed pr-8 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* LEGAL LINKS FOOTER BAR */}
        <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4 text-[#0f2b5c]" />
            <span>Hak Akses Terlindungi &amp; Kedaulatan Data Bisnis Tahun 2026</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-700">
            <Link href="/terms" className="hover:text-[#0f2b5c] transition">
              Ketentuan Layanan
            </Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:text-[#0f2b5c] transition">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
