import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  AlertTriangle,
  ServerCrash,
  WifiOff,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  Home,
  Headphones,
} from 'lucide-react';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { playTap } from '@/lib/sound';

interface ErrorPageProps {
  status: number;
  message?: string;
}

export default function ErrorPage({ status, message }: ErrorPageProps) {
  const errorDetails: Record<
    number,
    { title: string; subtitle: string; description: string; icon: any; color: string }
  > = {
    400: {
      title: 'Permintaan Tidak Valid (400)',
      subtitle: 'Bad Request',
      description: 'Format data permintaan dari peramban tidak dapat diproses oleh server sistem kasir.',
      icon: AlertTriangle,
      color: 'amber',
    },
    403: {
      title: 'Akses Dibatasi (403)',
      subtitle: 'Forbidden Access',
      description: 'Akun Anda tidak memiliki izin untuk membuka halaman atau fitur kasir ini.',
      icon: ShieldAlert,
      color: 'rose',
    },
    404: {
      title: 'Halaman Tidak Ditemukan (404)',
      subtitle: 'Page Not Found',
      description: 'Tautan URL yang Anda tuju mungkin sudah dipindahkan, dihapus, atau salah ketik.',
      icon: AlertTriangle,
      color: 'blue',
    },
    419: {
      title: 'Sesi Kedaluwarsa (419)',
      subtitle: 'Session Expired',
      description: 'Token sesi keamanan Anda telah habis masa berlakunya. Silakan muat ulang atau masuk kembali.',
      icon: RefreshCw,
      color: 'amber',
    },
    500: {
      title: 'Kesalahan Server Internal (500)',
      subtitle: 'Internal Server Error',
      description: 'Terjadi kendala pada pemrosesan server kami. Tim teknis sedang menangani kendala ini.',
      icon: ServerCrash,
      color: 'rose',
    },
    502: {
      title: 'Gerbang Tidak Merespons (502)',
      subtitle: 'Bad Gateway',
      description: 'Layanan hulu perutean POS sedang memulai ulang atau mengalami gangguan sementara.',
      icon: WifiOff,
      color: 'rose',
    },
    503: {
      title: 'Layanan Dalam Pemeliharaan (503)',
      subtitle: 'Service Unavailable',
      description: 'Sistem QLon sedang dalam pembaruan berkala untuk meningkatkan stabilitas kasir festival.',
      icon: RefreshCw,
      color: 'amber',
    },
    504: {
      title: 'Batas Waktu Gerbang Habis (504)',
      subtitle: 'Gateway Timeout',
      description: 'Koneksi ke backend server membutuhkan waktu terlalu lama untuk memberikan respons.',
      icon: WifiOff,
      color: 'rose',
    },
  };

  const current = errorDetails[status] || {
    title: `Terjadi Kendala (${status})`,
    subtitle: 'Unexpected Error',
    description: message || 'Terjadi gangguan saat memuat halaman yang diminta.',
    icon: AlertTriangle,
    color: 'rose',
  };

  const Icon = current.icon;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased text-slate-900 font-sans">
      <Head title={`${current.title} - QLon POS`} />

      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <Link href="/dashboard" onClick={() => playTap()}>
          <QlonLogo variant="full" size="md" subtitle="Event & Store POS" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Pemulihan Mandiri</span>
        </div>
      </header>

      {/* Center Error Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Status Badge & Icon */}
          <div className="flex justify-center">
            <div
              className={`size-20 rounded-3xl flex items-center justify-center ${
                current.color === 'rose'
                  ? 'bg-rose-50 border border-rose-200/80 text-rose-600'
                  : current.color === 'amber'
                  ? 'bg-amber-50 border border-amber-200/80 text-amber-600'
                  : 'bg-blue-50 border border-blue-200/80 text-[#0f2b5c]'
              }`}
            >
              <Icon className="size-10" />
            </div>
          </div>

          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-400">
              {current.subtitle}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {current.title}
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed mt-2.5 max-w-sm mx-auto">
              {message || current.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                playTap();
                window.location.reload();
              }}
              className="flex-1 h-11 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="size-4" />
              <span>Muat Ulang Halaman</span>
            </button>

            <Link
              href="/dashboard"
              onClick={() => playTap()}
              className="flex-1 h-11 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 transition active:scale-95 text-center"
            >
              <Home className="size-4" />
              <span>Kembali ke Dasbor</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-medium text-slate-400">
            <Link
              href="/kasir"
              onClick={() => playTap()}
              className="hover:text-[#0f2b5c] transition"
            >
              Buka Kasir POS
            </Link>
            <span>&bull;</span>
            <Link
              href="/terms"
              onClick={() => playTap()}
              className="hover:text-[#0f2b5c] transition"
            >
              Bantuan &amp; Panduan
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center py-4 text-[11px] text-slate-400">
        &copy; 2026 QLon Enterprise POS &amp; CRM. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}

