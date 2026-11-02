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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative size-14 rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border border-sky-400/40 text-white flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              Q
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-navy-950 animate-pulse" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
          Daftarkan Bisnis Anda di QLon
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500">
          Mulai kelola kasir POS native, CRM WhatsApp &amp; pantau omzet multi-cabang.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card className="p-6 sm:p-8 bg-white border-slate-200 shadow-sm">
          <div className="mb-6 p-3.5 rounded-xl bg-sky-50/80 border border-sky-100 flex items-start gap-3">
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
                  className="pl-9"
                />
                <Building2 className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="pl-9"
                  />
                  <User className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="pl-9"
                  />
                  <Phone className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className="pl-9"
                />
                <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="pl-9"
                  />
                  <Lock className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="pl-9"
                  />
                  <ShieldCheck className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </Field>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="w-full mt-4 bg-navy-900 hover:bg-navy-800 text-white font-bold glow-cyan"
            >
              {processing ? 'Menyiapkan Workspace QLon...' : 'Daftarkan Workspace Sekarang'}
              <ArrowRight className="size-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun?{' '}
              <Link
                href="/login"
                className="font-bold text-navy-900 hover:text-navy-950 underline underline-offset-2"
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
