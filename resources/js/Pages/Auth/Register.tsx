import React, { FormEvent, useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  Store,
  User,
  Phone,
  Mail,
  Lock,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowUpRight,
} from 'lucide-react';
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

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    playTap();
    post('/register', {
      onSuccess: () => playSuccessChime(),
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-[#e8ecef] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      {/* Main Floating Card */}
      <div className="w-full max-w-[1140px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          {/* Top Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-br from-[#0c6b68] to-[#06423f] flex items-center justify-center text-white shadow-sm">
              <span className="font-black text-sm tracking-tighter text-emerald-300">Q</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">QLon</span>
          </div>

          {/* Form Content */}
          <div className="my-auto py-4 max-w-md w-full mx-auto">
            {/* Header Title */}
            <div className="text-center mb-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Start your experience with QLon by signing in or signing up.
              </p>
            </div>

            {/* Segmented Switcher (Sign In / Sign Up) */}
            <div className="flex bg-[#f1f4f6] p-1 rounded-xl mb-5 border border-slate-200/60 max-w-xs mx-auto">
              <Link
                href="/login"
                onClick={playTap}
                className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <button
                type="button"
                className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm transition"
              >
                Sign Up
              </button>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bisnis / Toko <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="business_name"
                    name="business_name"
                    required
                    placeholder="Contoh: Kopi Kawan Indonesia"
                    value={data.business_name}
                    onChange={(e) => setData('business_name', e.target.value)}
                    className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                  />
                </div>
                {errors.business_name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.business_name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pemilik <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      required
                      placeholder="Contoh: Hendra S."
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="081234567890"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 karakter"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className="w-full pl-10 pr-8 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="Ulangi password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c6b68]/20 focus:border-[#0c6b68] transition"
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full mt-2 h-11 rounded-xl bg-[#0c6b68] hover:bg-[#095754] text-white font-bold text-xs tracking-wide shadow-sm active:scale-[0.99] transition flex items-center justify-center cursor-pointer"
              >
                {processing ? 'Menyiapkan Workspace...' : 'Daftarkan Workspace Sekarang'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
                Or continue with
              </span>
            </div>

            {/* Social / Quick Icons matching screenshot */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                className="size-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs"
                title="Google login"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z" />
                </svg>
              </button>
              <button
                type="button"
                className="size-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs text-slate-800"
                title="Apple login"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.68-.83 1.14-1.99 1.01-3.15-.99.04-2.19.66-2.9 1.49-.63.73-1.18 1.91-1.03 3.03 1.1.09 2.24-.55 2.92-1.37z" />
                </svg>
              </button>
              <button
                type="button"
                className="size-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs text-[#1877F2]"
                title="Facebook login"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button
                type="button"
                className="size-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition shadow-2xs text-slate-800"
                title="X login"
              >
                <svg className="size-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Copyright &copy; QLon, All Right Reserved</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-slate-600 cursor-pointer">Term &amp; Condition</span>
              <span>|</span>
              <span className="hover:text-slate-600 cursor-pointer">Privacy &amp; Policy</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dark Teal Showcase with Floating Cards matching reference */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 m-2 sm:m-3 p-8 sm:p-10 rounded-[28px] bg-gradient-to-br from-[#083b38] via-[#06302e] to-[#042422] text-white flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Subtle Grid Background Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          {/* Floating Widget Cards Showcase */}
          <div className="relative h-[320px] w-full z-10">
            {/* Card 1: Top Left - Financial Plan Donut Chart */}
            <div className="absolute top-2 left-4 w-[240px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-white/80 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-2">
                <span>Financial Plan</span>
                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">Bulan Ini ▾</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative size-14 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#0c6b68"
                      strokeWidth="4"
                      strokeDasharray="65 100"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeDasharray="20 100"
                      strokeDashoffset="-65"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 font-mono">Rp 48.500.000</p>
                  <p className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="size-2.5" /> +18.4% Omzet
                  </p>
                  <div className="space-y-0.5 mt-1 text-[8px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#0c6b68]" />
                      <span>Kasir POS (72%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      <span>Retensi CRM (28%)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-1 text-center text-[10px] font-bold rounded-lg bg-slate-900 text-white"
                >
                  Explore All Plan
                </button>
              </div>
            </div>

            {/* Card 2: Top Right - Future Funds & Target */}
            <div className="absolute top-14 right-2 w-[220px] bg-white text-slate-900 rounded-2xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.35)] border border-white/80 z-20 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                <span>Future Funds</span>
                <span className="text-[9px] text-slate-400">Target Event</span>
              </div>
              <p className="text-[11px] font-bold text-slate-800">Target Omzet Bulanan</p>
              <p className="text-[9px] text-slate-400 mb-2">Due date • 30 Nov 2026</p>
              <div className="flex items-baseline justify-between text-xs font-mono font-black mb-1">
                <span className="text-[#0c6b68]">Rp 38,5jt</span>
                <span className="text-slate-400 text-[10px]">/ Rp 50jt</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0c6b68] h-full rounded-full w-[77%]" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-400 mt-1 font-medium">
                <span>Progress</span>
                <span className="text-emerald-700 font-bold">77% Tercapai</span>
              </div>
            </div>

            {/* Card 3: Bottom Left - Capital Allocations */}
            <div className="absolute bottom-2 left-8 w-[250px] bg-white text-slate-900 rounded-2xl p-3.5 shadow-[0_20px_45px_rgba(0,0,0,0.25)] border border-white/80 z-10 transition-transform duration-300 hover:scale-105">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-slate-800">Capital Allocations</span>
                <span className="text-[8px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                  +12% Realtime
                </span>
              </div>
              <p className="text-xs font-black font-mono text-slate-900 mb-2">Rp 17.366.000</p>
              <div className="space-y-1.5 text-[9px]">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-600 truncate max-w-[120px]">Kopi Susu Aren (40 cup)</span>
                  <span className="font-mono font-bold text-slate-900">Rp 720.000</span>
                </div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-600 truncate max-w-[120px]">Matcha Latte (25 cup)</span>
                  <span className="font-mono font-bold text-slate-900">Rp 550.000</span>
                </div>
              </div>
              <div className="mt-2.5">
                <button
                  type="button"
                  className="w-full py-1 text-center text-[9px] font-bold rounded-lg bg-slate-900 text-white"
                >
                  Review Investment
                </button>
              </div>
            </div>
          </div>

          {/* Lower Text Section */}
          <div className="relative z-10 text-center max-w-md mx-auto pt-4">
            <div className="size-11 rounded-2xl bg-[#0e7470] border border-teal-300/30 flex items-center justify-center mx-auto text-emerald-200 font-black text-lg shadow-lg mb-4">
              <span>⚡</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              A Unified Hub for Smarter Financial Decision-Making
            </h2>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed max-w-sm mx-auto">
              QLon empowers you with a unified POS and CRM command center — delivering deep insights and a 360° view of your business growth.
            </p>

            {/* Slider Bars Pagination */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
              <span className="w-12 h-1 rounded-full bg-white shadow-xs" />
              <span className="w-12 h-1 rounded-full bg-white/20" />
              <span className="w-12 h-1 rounded-full bg-white/20" />
              <span className="w-12 h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
