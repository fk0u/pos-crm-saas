import React, { FormEvent } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  ArrowRight,
  Store,
  User,
  Phone,
  Mail,
  Lock,
  Building2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, FormError } from '@/Components/ui/card';
import { Field, Input } from '@/Components/ui/input';
import { playTap, playSuccessChime } from '@/lib/sound';

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    business_name: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    playTap();
    post('/register', {
      onSuccess: () => playSuccessChime(),
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft background ambient decor */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="relative size-14 rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 p-[1.5px] shadow-[0_0_25px_rgba(56,189,248,0.35)]">
            <div className="w-full h-full rounded-[14px] bg-[#09132d] flex items-center justify-center">
              <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-teal-200 to-emerald-300">
                Q
              </span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-400 ring-2 ring-[#070e24] animate-pulse" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Daftarkan Bisnis Anda di QLon
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500 max-w-sm mx-auto">
          Mulai kelola kasir POS pintar, CRM WhatsApp &amp; pantau omzet multi-cabang.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Card className="p-7 sm:p-9 bg-white/95 backdrop-blur-md border-slate-200/90 shadow-[0_20px_50px_rgba(8,17,42,0.07)] rounded-3xl">
          <div className="mb-6 p-4 rounded-2xl bg-sky-50/80 border border-sky-100 flex items-start gap-3">
            <Sparkles className="size-5 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-950 leading-relaxed font-medium">
              Pendaftaran ini akan otomatis membuat workspace owner baru di <strong>QLon Cloud</strong>, mengaktifkan outlet pusat default, dan membuka akses kasir realtime.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Nama Bisnis / Toko / Kedai"
              name="business_name"
              error={errors.business_name}
            >
              <div className="relative">
                <Input
                  id="business_name"
                  name="business_name"
                  required
                  placeholder="Contoh: Kopi Kawan Indonesia"
                  value={data.business_name}
                  onChange={(e) => setData('business_name', e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                />
                <Building2 className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nama Pemilik (Owner)"
                name="name"
                error={errors.name}
              >
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: Hendra Setiawan"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <User className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>

              <Field
                label="Nomor WhatsApp"
                name="phone"
                error={errors.phone}
              >
                <div className="relative">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="081234567890"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <Phone className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>
            </div>

            <Field
              label="Alamat Email Akun"
              name="email"
              error={errors.email}
            >
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="owner@bisnisanda.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                />
                <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Kata Sandi (Min. 8 Karakter)"
                name="password"
                error={errors.password}
              >
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>

              <Field
                label="Ulangi Kata Sandi"
                name="password_confirmation"
                error={errors.password_confirmation}
              >
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Ulangi kata sandi"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    className="pl-10 h-11 rounded-xl border-slate-200 focus:border-navy-600 focus:ring-2 focus:ring-navy-100 font-medium"
                  />
                  <ShieldCheck className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="w-full mt-4 h-12 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 hover:from-navy-900 hover:to-navy-800 text-white font-bold rounded-xl shadow-lg shadow-navy-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {processing ? 'Menyiapkan Workspace QLon...' : 'Daftarkan Workspace Sekarang'}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="font-bold text-navy-900 hover:text-sky-700 underline underline-offset-2 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
