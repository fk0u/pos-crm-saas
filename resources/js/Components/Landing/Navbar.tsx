import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export function Navbar({ isAuthenticated = false, userName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/95 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={() => playTap()} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2b5c] rounded-xl p-1 -m-1">
          <QlonLogo variant="full" size="md" subtitle="Event & Store POS" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/#fitur" onClick={() => playTap()} className="hover:text-[#0f2b5c] transition">
            Fitur Utama
          </Link>
          <Link href="/#pesan-meja" onClick={() => playTap()} className="hover:text-[#0f2b5c] transition">
            Pesan Meja QR
          </Link>
          <Link href="/pricing" onClick={() => playTap()} className="hover:text-[#0f2b5c] transition">
            Paket Harga
          </Link>
          <Link href="/help" onClick={() => playTap()} className="hover:text-[#0f2b5c] transition">
            Pusat Bantuan
          </Link>
        </nav>

        {/* Desktop Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              onClick={() => playTap()}
              className="h-10 px-5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition"
            >
              <span>Buka Dasbor ({userName || 'Toko'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => playTap()}
                className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center justify-center transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => playTap()}
                className="h-10 px-5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-950/20 active:scale-95 transition"
              >
                <span>Daftar Usaha Gratis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden size-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-5 py-6 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            <Link
              href="/#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Fitur Utama
            </Link>
            <Link
              href="/#pesan-meja"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Pesan Meja QR
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Paket Harga
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Pusat Bantuan
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold text-center shadow"
              >
                Buka Dasbor Toko
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold text-center"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold text-center shadow"
                >
                  Daftar Usaha Baru
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
