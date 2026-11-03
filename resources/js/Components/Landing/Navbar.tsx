import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, X, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
}

export function Navbar({ isAuthenticated = false, userName }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-4 inset-x-0 z-50 max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300">
      <div
        className={`rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-slate-200/90 shadow-md shadow-slate-900/5'
            : 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm'
        }`}
      >
        {/* Left: Brand Identity */}
        <Link
          href="/"
          onClick={() => playTap()}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="size-8 rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm group-hover:scale-105 transition">
            Q
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-slate-950 leading-none">
              QLon <span className="text-blue-600 font-mono text-[11px] font-semibold">POS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Central Ops
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/50 text-xs font-semibold text-slate-600">
          <Link
            href="/#fitur"
            onClick={() => playTap()}
            className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition"
          >
            Fitur Utama
          </Link>
          <Link
            href="/#modul"
            onClick={() => playTap()}
            className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition"
          >
            Modul Pilihan
          </Link>
          <Link
            href="/#kisah"
            onClick={() => playTap()}
            className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition"
          >
            Kisah Mitra
          </Link>
          <Link
            href="/pricing"
            onClick={() => playTap()}
            className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition"
          >
            Pilihan Paket
          </Link>
        </nav>

        {/* Right: Action CTA Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              onClick={() => playTap()}
              className="h-9 px-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow active:scale-95 transition"
            >
              <span>Dasbor Toko ({userName || 'Owner'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => playTap()}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => playTap()}
                className="h-9 px-5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow active:scale-95 transition"
              >
                <span>Coba Gratis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden size-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200 p-5 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              href="/#fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              Fitur Utama
            </Link>
            <Link
              href="/#modul"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              Modul Pilihan
            </Link>
            <Link
              href="/#kisah"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              Kisah Mitra
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-slate-50 transition"
            >
              Pilihan Paket
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold text-center"
              >
                Buka Dasbor
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full border border-slate-200 text-slate-800 text-xs font-bold text-center hover:bg-slate-50"
                >
                  Masuk Akun
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full bg-slate-950 text-white text-xs font-bold text-center shadow"
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
