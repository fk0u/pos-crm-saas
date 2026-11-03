import React, { FormEvent, useState, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  ShieldCheck,
  Building2,
  Receipt,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';
import { playTap, playSuccessChime } from '@/lib/sound';
import AuthShowcaseCarousel from '@/Components/AuthShowcaseCarousel';
import { QlonLogo } from '@/Components/ui/QlonLogo';

interface AuthCardProps {
  initialMode?: 'signin' | 'signup';
}

export default function AuthCard({ initialMode = 'signin' }: AuthCardProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  // Sync mode with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/register')) {
        setMode('signup');
      } else {
        setMode('signin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Login Form
  const loginForm = useForm({
    email: '',
    password: '',
    remember: true,
  });

  // Register Form
  const registerForm = useForm({
    business_name: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  // Auto clear OAuth notice
  useEffect(() => {
    if (!oauthNotice) return;
    const timer = setTimeout(() => setOauthNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [oauthNotice]);

  const switchMode = (newMode: 'signin' | 'signup') => {
    if (newMode === mode) return;
    playTap();
    setMode(newMode);
    setOauthNotice(null);
    if (typeof window !== 'undefined') {
      const targetUrl = newMode === 'signin' ? '/login' : '/register';
      window.history.pushState(null, '', targetUrl);
    }
  };



  const handleOAuthFallback = (provider: string) => {
    playTap();
    setOauthNotice(
      mode === 'signin'
        ? `Saat ini masih belum bisa login dengan metode ${provider}. Silakan gunakan email dan password.`
        : `Saat ini pendaftaran via ${provider} belum tersedia. Silakan lengkapi formulir di bawah.`
    );
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    playTap();
    loginForm.post('/login', {
      onSuccess: () => playSuccessChime(),
    });
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    playTap();
    registerForm.post('/register', {
      onSuccess: () => playSuccessChime(),
      onFinish: () => registerForm.reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-[#e9eef5] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans">
      {/* Main Floating Card */}
      <div className="w-full max-w-[1140px] bg-white rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-6 xl:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          
          {/* Top Brand Logo (Bespoke SVG Mark) */}
          <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
            <QlonLogo variant="full" size="md" subtitle="POS & CRM Ecosystem" animated />
          </Link>

          {/* Form Content Wrapper */}
          <div className="my-auto py-5 max-w-sm w-full mx-auto">
            
            {/* Header Title with Smooth Cross-Fade Motion */}
            <div className="text-center mb-6">
              <h1
                key={mode}
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
              >
                {mode === 'signin' ? 'Welcome to QLon' : 'Create Your Account'}
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Start your experience with QLon by signing in or signing up.
              </p>
            </div>

            {/* Segmented Switcher with Sliding Highlight Indicator (Micro-Interaction) */}
            <div className="relative flex bg-[#f1f4f6] p-1 rounded-xl mb-5 border border-slate-200/60 select-none">
              {/* Sliding Background Pill */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-xs transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  mode === 'signin' ? 'translate-x-0' : 'translate-x-[calc(100%+2px)]'
                }`}
              />

              {/* Sign In Button */}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  mode === 'signin' ? 'text-[#0f2b5c]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>

              {/* Sign Up Button */}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`relative z-10 flex-1 py-2 text-center text-xs font-bold transition-colors duration-200 cursor-pointer ${
                  mode === 'signup' ? 'text-[#0f2b5c]' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* SIGN IN VIEW */}
            {mode === 'signin' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Enter your email address"
                        value={loginForm.data.email}
                        onChange={(e) => loginForm.setData('email', e.target.value)}
                        className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                      />
                    </div>
                    {loginForm.errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{loginForm.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={loginForm.data.password}
                        onChange={(e) => loginForm.setData('password', e.target.value)}
                        className="w-full pl-10 pr-10 h-11 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          playTap();
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-transform active:scale-90"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {loginForm.errors.password && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{loginForm.errors.password}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loginForm.processing}
                    className="w-full mt-2 h-11 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] active:bg-[#0a1e42] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-950/20 active:scale-[0.98] hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                  >
                    {loginForm.processing ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}

            {/* SIGN UP VIEW */}
            {mode === 'signup' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Bisnis / Toko <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Building2 className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                      <input
                        id="reg-business"
                        required
                        placeholder="Contoh: Kopi Kawan Indonesia"
                        value={registerForm.data.business_name}
                        onChange={(e) => registerForm.setData('business_name', e.target.value)}
                        className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                      />
                    </div>
                    {registerForm.errors.business_name && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{registerForm.errors.business_name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nama Pemilik <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <User className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="reg-name"
                          required
                          placeholder="Hendra S."
                          value={registerForm.data.name}
                          onChange={(e) => registerForm.setData('name', e.target.value)}
                          className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        No. WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <Phone className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="reg-phone"
                          type="tel"
                          placeholder="0812345678"
                          value={registerForm.data.phone}
                          onChange={(e) => registerForm.setData('phone', e.target.value)}
                          className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="size-4 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="Enter your email address"
                        value={registerForm.data.email}
                        onChange={(e) => registerForm.setData('email', e.target.value)}
                        className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                      />
                    </div>
                    {registerForm.errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1 font-medium">{registerForm.errors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="size-3.5 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min. 8 char"
                          value={registerForm.data.password}
                          onChange={(e) => registerForm.setData('password', e.target.value)}
                          className="w-full pl-8 pr-7 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ulangi Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <Lock className="size-3.5 text-slate-400 group-focus-within:text-[#0f2b5c] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                        <input
                          id="reg-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Ulangi"
                          value={registerForm.data.password_confirmation}
                          onChange={(e) => registerForm.setData('password_confirmation', e.target.value)}
                          className="w-full pl-8 pr-7 h-10 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0f2b5c]/10 focus:border-[#0f2b5c] transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    disabled={registerForm.processing}
                    className="w-full mt-2 h-11 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] active:bg-[#0a1e42] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-950/20 active:scale-[0.98] hover:shadow-lg transition-all duration-200 flex items-center justify-center cursor-pointer"
                  >
                    {registerForm.processing ? 'Menyiapkan Workspace...' : 'Daftarkan Workspace Sekarang'}
                  </button>
                </form>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
                Or continue with
              </span>
            </div>

            {/* OAuth Fallback Notice */}
            {oauthNotice && (
              <div className="mb-3.5 p-3 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-950 text-xs flex items-start justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-[#0f2b5c] shrink-0 mt-0.5" />
                  <span className="text-[11px] font-medium leading-relaxed">{oauthNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOauthNotice(null)}
                  className="text-blue-500 hover:text-[#0f2b5c] p-0.5 rounded-md cursor-pointer shrink-0 transition"
                  aria-label="Tutup"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Social Icons with Micro-Interaction (Hover Scale & Tap) */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleOAuthFallback('Google')}
                className="size-10 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all duration-150 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
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
                onClick={() => handleOAuthFallback('Apple')}
                className="size-10 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all duration-150 shadow-2xs text-slate-800 cursor-pointer hover:scale-105 active:scale-95"
                title="Apple login"
              >
                <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.68-.83 1.14-1.99 1.01-3.15-.99.04-2.19.66-2.9 1.49-.63.73-1.18 1.91-1.03 3.03 1.1.09 2.24-.55 2.92-1.37z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthFallback('Facebook')}
                className="size-10 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all duration-150 shadow-2xs text-[#1877F2] cursor-pointer hover:scale-105 active:scale-95"
                title="Facebook login"
              >
                <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthFallback('X')}
                className="size-10 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center transition-all duration-150 shadow-2xs text-slate-800 cursor-pointer hover:scale-105 active:scale-95"
                title="X login"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2 select-none">
            <span>Copyright &copy; 2026 QLon Technologies. All Rights Reserved.</span>
            <div className="flex items-center gap-3">
              <Link href="/terms" className="hover:text-[#0f2b5c] font-medium transition cursor-pointer">
                Terms &amp; Conditions
              </Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-[#0f2b5c] font-medium transition cursor-pointer">
                Privacy &amp; Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sliding Navy Blue Showcase */}
        <AuthShowcaseCarousel />

      </div>
    </div>
  );
}

