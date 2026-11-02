<script setup>
import { useForm, Link } from '@inertiajs/vue3';
import AppButton from '@/Components/AppButton.vue';
import AppInput from '@/Components/AppInput.vue';

const form = useForm({
  business_name: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  password_confirmation: '',
});

function submit() {
  form.post('/register', {
    onFinish: () => form.reset('password', 'password_confirmation'),
  });
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Brand Logo -->
      <div class="flex justify-center">
        <div class="w-12 h-12 rounded-2xl bg-navy-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-navy-700">
          O
        </div>
      </div>
      <h2 class="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
        Daftarkan Usaha UMKM Anda
      </h2>
      <p class="mt-1 text-center text-xs text-slate-500">
        Mulai kelola kasir POS, loyalitas member CRM, dan pantau omzet multi-cabang.
      </p>
    </div>

    <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div class="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-8 space-y-5">
        <form @submit.prevent="submit" class="space-y-4">
          <!-- Business / Workspace Name -->
          <div>
            <AppInput
              id="business_name"
              v-model="form.business_name"
              label="Nama Bisnis / Toko / Kedai *"
              placeholder="Contoh: Kopi Kawan Indonesia"
              :error="form.errors.business_name"
              required
            />
          </div>

          <!-- Owner Name -->
          <div>
            <AppInput
              id="name"
              v-model="form.name"
              label="Nama Lengkap Pemilik (Owner) *"
              placeholder="Contoh: Hendra Setiawan"
              :error="form.errors.name"
              required
            />
          </div>

          <!-- Phone Number -->
          <div>
            <AppInput
              id="phone"
              v-model="form.phone"
              type="tel"
              label="Nomor WhatsApp Pemilik"
              placeholder="081234567890"
              :error="form.errors.phone"
            />
          </div>

          <!-- Email Address -->
          <div>
            <AppInput
              id="email"
              v-model="form.email"
              type="email"
              label="Alamat Email Akun *"
              placeholder="owner@bisnisanda.com"
              :error="form.errors.email"
              required
            />
          </div>

          <!-- Password -->
          <div>
            <AppInput
              id="password"
              v-model="form.password"
              type="password"
              label="Kata Sandi (Minimal 8 Karakter) *"
              placeholder="••••••••"
              :error="form.errors.password"
              required
            />
          </div>

          <!-- Password Confirmation -->
          <div>
            <AppInput
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              label="Konfirmasi Kata Sandi *"
              placeholder="••••••••"
              :error="form.errors.password_confirmation"
              required
            />
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="form.processing"
              class="w-full justify-center"
            >
              Buat Workspace & Masuk
            </AppButton>
          </div>
        </form>

        <div class="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Sudah memiliki workspace terdaftar?
          <Link href="/login" class="font-semibold text-navy-700 hover:text-navy-900 ml-1">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  </div>
</template>
