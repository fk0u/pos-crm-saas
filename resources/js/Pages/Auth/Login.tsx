import React, { FormEvent, useState } from 'react';
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
  Activity,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  QrCode,
  Layers,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, FormError } from '@/Components/ui/card';
import { Field, Input } from '@/Components/ui/input';
import { playTap, playSuccessChime } from '@/lib/sound';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: 'owner@kopikawan.com',
    password: 'password123',
    remember: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const selectPersona = (role: 'master' | 'owner' | 'cashier') => {
    playTap();
    if (role === 'master') {
      setData({
        email: 'master@qlon.id',
        password: 'password123',
        remember: true,
      });
    } else if (role === 'owner') {
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
    playTap();
    post('/login', {
      onSuccess: () => playSuccessChime(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Brand Showcase (Visible on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#070e24] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-navy-900 shadow-2xl">
        {/* Luminous dynamic ambient glow circles */}
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] bg-sky-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 -left-28 w-[420px] h-[420px] bg-teal-500/15 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Ambient fine grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.07] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="relative size-12 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-[1.5px] shadow-[0_0_25px_rgba(56,189,248,0.35)]">
            <div className="w-full h-full rounded-[14px] bg-[#09132d] flex items-center justify-center">
              <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-teal-200 to-emerald-300">
                Q
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-[#070e24] animate-pulse" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tight text-white block leading-tight">QLon</span>
            <p className="text-xs text-slate-400 font-medium">Point of Sale &amp; Customer Retention Cloud</p>
          </div>
        </div>

        {/* Center Content Showcase */}
        <div className="relative z-10 max-w-lg my-auto space-y-6 pt-4 pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-xs font-semibold text-sky-300 backdrop-blur-md shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <Sparkles className="size-3.5 text-sky-400 animate-pulse" />
            <span>Platform Kasir Pintar &amp; CRM Multi-Cabang</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-[1.2] text-white">
              Kelola Kasir Cepat,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                Otomatisasi CRM
              </span>{' '}
              &amp; Multi-Outlet
            </h1>
            <p className="text-sm text-slate-300/90 leading-relaxed">
              Arsitektur realtime modern dengan auto-kalkulasi kembalian tunai, verifikasi visual QRIS langsung di layar HP pembeli, dan otomatisasi retensi pelanggan WhatsApp.
            </p>
          </div>

          {/* Interactive Live Activity Snapshot Card */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-sky-500/30 transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-white tracking-wide">Kedai Kopi Kawan</span>
                <span className="text-[10px] text-slate-400 font-mono">(Outlet Pusat)</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                Live Sinkron
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 my-3 text-center">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Omzet Hari Ini</p>
                <p className="text-sm font-bold text-white mt-0.5 font-mono">Rp 4.850.000</p>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                  <TrendingUp className="size-2.5" /> +18.4%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Transaksi</p>
                <p className="text-sm font-bold text-white mt-0.5 font-mono">142 Struk</p>
                <span className="text-[10px] text-sky-400 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                  <Clock className="size-2.5" /> Shift Siang
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Speed Kasir</p>
                <p className="text-sm font-bold text-emerald-300 mt-0.5 font-mono">&lt; 0.3 dtk</p>
                <span className="text-[10px] text-teal-400 font-medium flex items-center justify-center gap-0.5 mt-0.5">
                  <Zap className="size-2.5" /> Kilat
                </span>
              </div>
            </div>

            {/* Mini transaction receipt preview ticker */}
            <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-lg bg-navy-900/60 border border-white/5">
              <div className="flex items-center gap-2 truncate">
                <QrCode className="size-3.5 text-sky-400 shrink-0" />
                <span className="text-slate-300 truncate">Es Kopi Susu Aren x2</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-white">Rp 44.000</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Lunas
                </span>
              </div>
            </div>
          </div>

          {/* 4 Feature Value Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-sky-500/40 hover:bg-white/[0.06] transition-all duration-200">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0 mt-0.5 border border-sky-500/20">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Kasir Cepat &amp; Haptic</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Shortcut F1-F4 &amp; audio kasir responsif</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.06] transition-all duration-200">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/20">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verifikasi QRIS &amp; EDC</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Konfirmasi visual anti-fraud di HP pembeli</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all duration-200">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">CRM &amp; Loyalitas Poin</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Segmentasi pelanggan &amp; poin instan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.06] transition-all duration-200">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 mt-0.5 border border-purple-500/20">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Laba Bersih &amp; Multi-Cabang</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Audit laci kasir &amp; analitik pergeseran shift</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer system status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} QLon Cloud Platform</span>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-300 font-medium">Sistem Cloud Aktif</span>
          </div>
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100">
        {/* Soft background ambient decor */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-3">
            <div className="relative size-12 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-[14px] bg-[#09132d] flex items-center justify-center">
                <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
                  Q
                </span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-white" />
            </div>
            <div>
              <span className="font-black text-2xl text-slate-900 block leading-tight">QLon</span>
              <span className="text-[11px] text-slate-500 font-mono font-medium tracking-wide">POS &amp; CRM CLOUD</span>
            </div>
          </div>

          <Card className="p-7 sm:p-9 border-slate-200/90 shadow-[0_20px_50px_rgba(8,17,42,0.07)] bg-white/95 backdrop-blur-md rounded-3xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">
                Masuk ke Workspace
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Gunakan akun bisnis Anda untuk mengakses kasir dan analitik.
              </p>
            </div>

            {/* Persona Quick Switcher Chips */}
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-sky-600" />
                  Akses Cepat Demo
                </span>
                <span className="text-[10px] text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full font-mono font-bold">
                  1-Klik Masuk
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => selectPersona('master')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left group ${
                    data.email === 'master@qlon.id'
                      ? 'bg-navy-950 text-white border-navy-950 shadow-md ring-2 ring-purple-400/40'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                      data.email === 'master@qlon.id'
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'bg-purple-50 text-purple-600 group-hover:bg-purple-100'
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <p className="font-bold leading-tight truncate">Master Super</p>
                      {data.email === 'master@qlon.id' && (
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className={`text-[9px] truncate ${data.email === 'master@qlon.id' ? 'text-slate-300' : 'text-slate-400'}`}>
                      master@qlon.id
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPersona('owner')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left group ${
                    data.email === 'owner@kopikawan.com'
                      ? 'bg-navy-950 text-white border-navy-950 shadow-md ring-2 ring-sky-400/40'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                      data.email === 'owner@kopikawan.com'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-sky-50 text-sky-600 group-hover:bg-sky-100'
                    }`}
                  >
                    <UserCheck className="size-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <p className="font-bold leading-tight truncate">Owner HQ</p>
                      {data.email === 'owner@kopikawan.com' && (
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className={`text-[9px] truncate ${data.email === 'owner@kopikawan.com' ? 'text-slate-300' : 'text-slate-400'}`}>
                      owner@kopikawan.com
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => selectPersona('cashier')}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all text-left group ${
                    data.email === 'kasir@kopikawan.com'
                      ? 'bg-navy-950 text-white border-navy-950 shadow-md ring-2 ring-emerald-400/40'
                      : 'bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                      data.email === 'kasir@kopikawan.com'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                    }`}
                  >
                    <Receipt className="size-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <p className="font-bold leading-tight truncate">Kasir Outlet</p>
                      {data.email === 'kasir@kopikawan.com' && (
                        <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className={`text-[9px] truncate ${data.email === 'kasir@kopikawan.com' ? 'text-slate-300' : 'text-slate-400'}`}>
                      kasir@kopikawan.com
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Alamat Email Akun" name="email" error={errors.email}>
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
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>

              <Field label="Kata Sandi" name="password" error={errors.password}>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-600"
                  />
                  <span className="font-medium">Ingat saya di perangkat ini</span>
                </label>
              </div>

              {errors.email && !errors.email.includes('required') && (
                <FormError>{errors.email}</FormError>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={processing}
                className="w-full mt-2 h-12 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 hover:from-navy-900 hover:to-navy-800 text-white font-bold rounded-xl shadow-lg shadow-navy-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                {processing ? 'Memverifikasi Kredensial...' : 'Masuk ke Workspace'}
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Belum mendaftarkan bisnis Anda?{' '}
                <Link
                  href="/register"
                  className="font-bold text-navy-900 hover:text-sky-700 underline underline-offset-2 transition-colors"
                >
                  Daftar akun baru
                </Link>
              </p>
            </div>
          </Card>

          {/* Trust & Security strip */}
          <div className="flex items-center justify-center gap-6 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              <span>Enkripsi 256-Bit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-sky-600" />
              <span>Realtime Cloud Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-teal-600" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

