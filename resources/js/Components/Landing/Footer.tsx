import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Heart, Store, ExternalLink } from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <QlonLogo variant="full" size="md" subtitle="Event & Store POS" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Platform kasir pintar terintegrasi, pesanan meja QR, dan pembukuan laba rugi otomatis untuk UMKM retail dan kuliner Indonesia.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-semibold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="size-3.5" />
              <span>Keamanan Data Terisolasi Mandiri</span>
            </div>
          </div>

          {/* Kolom 1: Solusi Fitur */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Solusi Kasir Toko</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#fitur" className="hover:text-white transition">Kasir POS Cepat &amp; Barcode</Link>
              </li>
              <li>
                <Link href="/#fitur" className="hover:text-white transition">Struk Digital WhatsApp</Link>
              </li>
              <li>
                <Link href="/#fitur" className="hover:text-white transition">Arus Kas &amp; Tutup Kasir Shift</Link>
              </li>
              <li>
                <Link href="/#pesan-meja" className="hover:text-white transition">Pesan Meja QR Mandiri</Link>
              </li>
              <li>
                <Link href="/#fitur" className="hover:text-white transition">Layar Dapur &amp; Barista Realtime</Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Paket & Akuntansi */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Paket &amp; Akuntansi</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="hover:text-white transition">Pilihan Paket Langganan</Link>
              </li>
              <li>
                <Link href="/pricing#matrix" className="hover:text-white transition">Perbandingan Fitur Paket</Link>
              </li>
              <li>
                <Link href="/#laporan" className="hover:text-white transition">Ekspor Excel &amp; Pajak PB1 (10%)</Link>
              </li>
              <li>
                <Link href="/#laporan" className="hover:text-white transition">Perhitungan HPP &amp; Untung Bersih</Link>
              </li>
              <li>
                <Link href="/developer" className="hover:text-white transition">Sambungan Luar &amp; API Integrasi</Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan & Legal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Dukungan &amp; Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-white transition">Pusat Bantuan &amp; Panduan</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">Ketentuan Layanan Toko</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">Kebijakan Privasi Data</Link>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition inline-flex items-center gap-1"
                >
                  <span>Layanan CS WhatsApp</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} QLon POS &amp; Central Ops. Hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-2">
            <span>Dirancang khusus untuk pengusaha Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
