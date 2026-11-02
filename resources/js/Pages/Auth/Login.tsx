import React, { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Sparkles,
  UserCheck,
  Lock,
  Mail,
  Zap,
  TrendingUp,
  Receipt,
  Users,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, FormError } from '@/Components/ui/card';
import { Field, Input } from '@/Components/ui/input';

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: 'owner@kopikawan.com',
    password: 'password123',
    remember: true,
  });

  const selectPersona = (role: 'owner' | 'cashier') => {
    if (role === 'owner') {
      setData({
        email: 'owner@kopikawan.com',
        password: 'password123',
        remember: true,
      });
    } else {
      setData({
        email: 'kasir@kopikawan.com',
        password: 'password123',
        remember: true,
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Brand Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-navy-800">
        {/* Subtle decorative glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-navy-800 border border-navy-700/80 flex items-center justify-center text-white shadow-inner">
            <Store className="size-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">Omnipoint</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-navy-800 text-sky-300 border border-navy-700">
                PRO SaaS
              </span>
            </div>
            <p className="text-xs text-navy-300">Point of Sale &amp; Customer Retention System</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800/90 border border-navy-700 text-xs font-medium text-sky-300">
            <Sparkles className="size-3.5 text-sky-400" />
            <span>Desain Baru Berbasis Aplikasi Native Modern</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Kelola Transaksi Kasir, CRM &amp; Multi-Outlet Tanpa Hambatan
          </h1>

          <p className="text-sm text-navy-200/90 leading-relaxed">
            Platform kasir cepat offline-ready dengan auto kalkulasi kembalian tunai, verifikasi bukti bayar QRIS langsung di layar HP pembeli, dan CRM WhatsApp terintegrasi.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/60 border border-navy-700/60">
              <Zap className="size-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Kasir Tactile Native</p>
                <p className="text-[11px] text-navy-300">Shortcut F1, F4, F8 &amp; audio haptic</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/60 border border-navy-700/60">
              <ShieldCheck className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Real Payment Flow</p>
                <p className="text-[11px] text-navy-300">Verifikasi visual QRIS &amp; trace approval</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/60 border border-navy-700/60">
              <Users className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">CRM &amp; Loyalitas</p>
                <p className="text-[11px] text-navy-300">Segmentasi &amp; redeem poin instan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-800/60 border border-navy-700/60">
              <TrendingUp className="size-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Live Gross Margin</p>
                <p className="text-[11px] text-navy-300">Audit pergeseran laci kasir per shift</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-navy-400 pt-6 border-t border-navy-800">
          <span>&copy; {new Date().getFullYear()} Omnipoint Cloud Platform</span>
          <span className="font-mono text-[11px]">v2.5 (React TS + Tailwind v4)</span>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center text-white shadow-sm">
              <Store className="size-5 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 block leading-none">Omnipoint</span>
              <span className="text-[11px] text-slate-500 font-mono">POS &amp; CRM SAAS</span>
            </div>
          </div>

          <Card className="p-6 sm:p-8 border-slate-200 shadow-sm bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Masuk ke Workspace
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Gunakan kredensial akun untuk mengakses sistem kasir &amp; analitik.
              </p>
            </div>

            {/* Persona Quick Switcher Chips */}
            <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Akses Cepat Demo
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Klik Pilih</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectPersona('owner')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                    data.email === 'owner@kopikawan.com'
                      ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <UserCheck className="size-4 shrink-0 text-sky-400" />
                  <div className="truncate">
                    <p className="font-semibold leading-tight">Owner HQ</p>
                    <p className="text-[10px] opacity-80 truncate">owner@kopikawan.com</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPersona('cashier')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                    data.email === 'kasir@kopikawan.com'
                      ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Receipt className="size-4 shrink-0 text-emerald-400" />
                  <div className="truncate">
                    <p className="font-semibold leading-tight">Kasir Outlet</p>
                    <p className="text-[10px] opacity-80 truncate">kasir@kopikawan.com</p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Alamat Email" name="email" error={errors.email}>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="nama@bisnis.id"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>

              <Field label="Kata Sandi" name="password" error={errors.password}>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="pl-9"
                  />
                  <Lock className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="size-4 rounded border-slate-300 text-navy-700 focus:ring-navy-600"
                  />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {errors.email && !errors.email.includes('required') && (
                <FormError>{errors.email}</FormError>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={processing}
                className="w-full mt-2 bg-navy-900 hover:bg-navy-800 text-white font-medium"
              >
                {processing ? 'Memverifikasi Akun...' : 'Masuk ke Sistem'}
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Belum mendaftarkan bisnis Anda?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-navy-800 hover:text-navy-900 underline underline-offset-2"
                >
                  Daftar akun baru
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
