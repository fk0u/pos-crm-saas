import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, Heart, Store, ExternalLink } from 'lucide-react';
import { playTap } from '@/lib/sound';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          
          {/* Brand Info & Contacts (col-span-5) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" onClick={() => playTap()} className="flex items-center gap-2.5">
              <div className="size-7 rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-xs">
                Q
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-950">
                QLon <span className="text-blue-600 font-mono text-xs font-semibold">POS</span>
              </span>
            </Link>

            <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
              Satu sistem terpadu untuk kasir kilat, pesanan meja QR, sinkronisasi layar dapur, dan pembukuan laba rugi otomatis untuk pengusaha Indonesia.
            </p>

            <div className="pt-2 space-y-1 text-xs text-slate-600 font-medium">
              <p>+62 812-3456-7890</p>
              <p>halo@qlon.id</p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-emerald-700 text-[11px] font-semibold bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="size-3.5" />
              <span>Keamanan Data Toko Terisolasi Mandiri</span>
            </div>
          </div>

          {/* Kolom 1: Solusi Usaha (col-span-2) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-950 uppercase text-[10px] tracking-wider font-mono">
              Solusi Toko
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/#fitur" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Terminal Kasir POS
                </Link>
              </li>
              <li>
                <Link href="/#fitur" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Pesan Meja QR
                </Link>
              </li>
              <li>
                <Link href="/#fitur" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Layar Dapur KDS
                </Link>
              </li>
              <li>
                <Link href="/#fitur" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Arus Kas Laci Shift
                </Link>
              </li>
              <li>
                <Link href="/#fitur" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Laporan Pajak PB1
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 2: Paket & Lisensi (col-span-2) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-950 uppercase text-[10px] tracking-wider font-mono">
              Paket &amp; Harga
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <Link href="/pricing" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Pilihan Paket
                </Link>
              </li>
              <li>
                <Link href="/register?tier=core" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Paket Inti (Core)
                </Link>
              </li>
              <li>
                <Link href="/register?tier=essential" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Paket Esensial
                </Link>
              </li>
              <li>
                <Link href="/register?tier=full" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Solusi Lengkap
                </Link>
              </li>
              <li>
                <Link href="/pricing#matrix" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Tabel Perbandingan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Panduan & Bantuan (col-span-3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-bold text-slate-950 uppercase text-[10px] tracking-wider font-mono">
              Bantuan &amp; Legal
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-950 transition inline-flex items-center gap-1.5 text-blue-600 font-semibold"
                >
                  <span>Konsultasi WhatsApp CS</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <Link href="/terms" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Ketentuan Layanan Toko
                </Link>
              </li>
              <li>
                <Link href="/privacy" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Kebijakan Privasi Data
                </Link>
              </li>
              <li>
                <Link href="/help" onClick={() => playTap()} className="hover:text-slate-950 transition">
                  Panduan Printer &amp; Scan
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} QLon POS &amp; Central Ops. Hak cipta dilindungi undang-undang.
          </div>
          <div className="flex items-center gap-2">
            <span>Dibuat dengan dedikasi untuk wirausaha Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
