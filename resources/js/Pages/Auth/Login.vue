<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import AppButton from '@/Components/AppButton.vue';
import AppInput from '@/Components/AppInput.vue';

const form = useForm({
  email: 'owner@kopikawan.com',
  password: 'password123',
  remember: true,
});

function selectPersona(type) {
  if (type === 'owner') {
    form.email = 'owner@kopikawan.com';
    form.password = 'password123';
  } else {
    form.email = 'kasir@kopikawan.com';
    form.password = 'password123';
  }
}

function submit() {
  form.post('/login');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Left Hero Brand Panel (navy-800, visible on lg screens) -->
    <div class="hidden lg:flex lg:w-1/2 bg-navy-800 relative flex-col justify-between p-12 overflow-hidden text-white border-r border-navy-900">
      <!-- Subtle Decorative Grid Background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <svg class="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>

      <!-- Top Header / Logo -->
      <div class="relative z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-navy-700 border border-navy-500/50 flex items-center justify-center text-white font-bold text-xl shadow-inner">
            O
          </div>
          <div>
            <span class="text-xl font-bold tracking-tight block leading-tight text-white">Omnipoint</span>
            <span class="text-xs text-navy-300 font-mono tracking-wider block">POS & CRM SAAS PLATFORM</span>
          </div>
        </div>
      </div>

      <!-- Center Value Proposition -->
      <div class="relative z-10 max-w-lg my-auto space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-700/80 border border-navy-600 text-xs font-semibold text-navy-200">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Arsitektur SaaS Cloud v2.5
        </div>

        <h2 class="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
          Sistem Kasir Cepat & Pantauan Bisnis Real-Time
        </h2>

        <p class="text-sm text-navy-200/80 leading-relaxed">
          Kendalikan transaksi cabang, kelola laci kasir (shift drawer), dan bangun loyalitas pelanggan via WhatsApp CRM dalam satu platform cloud terpadu.
        </p>

        <!-- Feature List -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center gap-3 text-xs text-navy-100">
            <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Kasir Cepat multi-pembayaran dengan auto-calc kembalian</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-navy-100">
            <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Deteksi Member CRM via WhatsApp dalam &lt; 3 detik</span>
          </div>

          <div class="flex items-center gap-3 text-xs text-navy-100">
            <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Live Gross Profit, Margin HPP & Audit Rekap Shift</span>
          </div>
        </div>
      </div>

      <!-- Bottom Trust Badge -->
      <div class="relative z-10 pt-6 border-t border-navy-700/60 flex items-center justify-between text-xs text-navy-300/80">
        <span>Multi-Tenant Enterprise Security</span>
        <span>PostgreSQL 16 & Redis</span>
      </div>
    </div>

    <!-- Right Form Section (Light mode first, clean, centered) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
      <div class="w-full max-w-md">
        <!-- Mobile Logo (shown only on small screens) -->
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="w-9 h-9 rounded-xl bg-navy-700 text-white font-bold text-lg flex items-center justify-center">
            O
          </div>
          <div>
            <h1 class="text-lg font-bold text-slate-900">Omnipoint POS</h1>
            <p class="text-xs text-slate-500">Multi-Outlet Cloud SaaS</p>
          </div>
        </div>

        <!-- Form Card Container -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <div class="mb-6">
            <h2 class="text-xl font-bold tracking-tight text-slate-900">
              Masuk ke Akun Anda
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Gunakan akun demo instan atau masukkan kredensial terdaftar
            </p>
          </div>

          <!-- Quick Persona Switcher -->
          <div class="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Pilih Profil Demo Instan:
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="selectPersona('owner')"
                class="px-3 py-2 text-xs rounded-lg border text-left transition-all cursor-pointer"
                :class="form.email === 'owner@kopikawan.com'
                  ? 'bg-navy-50 border-navy-300 text-navy-800 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
              >
                <div class="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <svg class="w-3.5 h-3.5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Owner HQ</span>
                </div>
                <div class="text-[10px] text-slate-500 truncate mt-0.5">
                  Hendra Setiawan
                </div>
              </button>

              <button
                type="button"
                @click="selectPersona('cashier')"
                class="px-3 py-2 text-xs rounded-lg border text-left transition-all cursor-pointer"
                :class="form.email === 'kasir@kopikawan.com'
                  ? 'bg-navy-50 border-navy-300 text-navy-800 font-semibold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
              >
                <div class="flex items-center gap-1.5 text-slate-900 font-semibold">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Kasir Outlet</span>
                </div>
                <div class="text-[10px] text-slate-500 truncate mt-0.5">
                  Siti Aminah
                </div>
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="submit" class="space-y-4">
            <AppInput
              id="email"
              v-model="form.email"
              type="email"
              label="Alamat Email"
              placeholder="nama@perusahaan.com"
              required
              :error="form.errors.email"
            >
              <template #prefix>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </template>
            </AppInput>

            <div>
              <AppInput
                id="password"
                v-model="form.password"
                type="password"
                label="Kata Sandi"
                placeholder="••••••••"
                required
                :error="form.errors.password"
              >
                <template #prefix>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </template>
              </AppInput>
              <div class="text-[11px] text-slate-400 font-mono mt-1 text-right">
                password demo: password123
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-600 hover:text-slate-800">
                <input
                  v-model="form.remember"
                  type="checkbox"
                  class="rounded border-slate-300 text-navy-700 focus:ring-navy-300 h-4 w-4"
                />
                <span>Ingat sesi login saya</span>
              </label>
            </div>

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              class="w-full mt-2"
              :loading="form.processing"
            >
              <span>{{ form.processing ? 'Memverifikasi...' : 'Masuk ke Aplikasi' }}</span>
            </AppButton>
          </form>

          <div class="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Belum memiliki workspace?
            <Link href="/register" class="font-semibold text-navy-700 hover:text-navy-900 ml-1">
              Daftar Usaha Baru
            </Link>
          </div>
        </div>

        <!-- Footer Meta -->
        <p class="mt-8 text-center text-xs text-slate-400">
          Dilindungi enkripsi sesi CSRF & Row-Level Multi-Tenancy
        </p>
      </div>
    </div>
  </div>
</template>
