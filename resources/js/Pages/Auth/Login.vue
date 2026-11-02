<template>
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        <!-- Ambient Glow Gradients -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full max-w-md relative z-10">
            <!-- Brand Header -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25 mb-4 border border-emerald-400/30">
                    <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                    Omnipoint <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">v2.5 SaaS</span>
                </h1>
                <p class="text-sm text-slate-400 mt-1">Multi-Tenant Point of Sale, CRM & Central Operations</p>
            </div>

            <!-- Card Box -->
            <div class="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-7 shadow-2xl shadow-black/60 relative">
                <div class="mb-6">
                    <h2 class="text-lg font-semibold text-white">Masuk ke Sistem</h2>
                    <p class="text-xs text-slate-400 mt-0.5">Pilih profil demo instan atau masukkan akun manual</p>
                </div>

                <!-- Quick Persona Switcher -->
                <div class="mb-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div class="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Quick Demo Persona:
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            @click="selectPersona('owner')"
                            :class="[
                                'px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all duration-150',
                                form.email === 'owner@kopikawan.com'
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            ]"
                        >
                            <div class="font-semibold flex items-center gap-1">
                                👑 Owner HQ
                            </div>
                            <div class="text-[10px] text-slate-400 truncate">Hendra Setiawan</div>
                        </button>

                        <button
                            type="button"
                            @click="selectPersona('cashier')"
                            :class="[
                                'px-3 py-2 text-xs font-medium rounded-lg border text-left transition-all duration-150',
                                form.email === 'kasir@kopikawan.com'
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            ]"
                        >
                            <div class="font-semibold flex items-center gap-1">
                                ☕ Kasir Outlet
                            </div>
                            <div class="text-[10px] text-slate-400 truncate">Siti Aminah (Samarinda)</div>
                        </button>
                    </div>
                </div>

                <!-- Form -->
                <form @submit.prevent="submit" class="space-y-4">
                    <div>
                        <label for="email" class="block text-xs font-medium text-slate-300 mb-1.5">Alamat Email</label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            required
                            placeholder="nama@kopikawan.com"
                            class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                        <p v-if="form.errors.email" class="mt-1 text-xs text-rose-400">{{ form.errors.email }}</p>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1.5">
                            <label for="password" class="block text-xs font-medium text-slate-300">Kata Sandi</label>
                            <span class="text-[11px] text-slate-400 font-mono">default: password123</span>
                        </div>
                        <input
                            id="password"
                            v-model="form.password"
                            type="password"
                            required
                            placeholder="••••••••"
                            class="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                        <p v-if="form.errors.password" class="mt-1 text-xs text-rose-400">{{ form.errors.password }}</p>
                    </div>

                    <div class="flex items-center justify-between pt-1">
                        <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                            <input
                                v-model="form.remember"
                                type="checkbox"
                                class="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500/50"
                            />
                            <span>Ingat sesi saya</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        <svg v-if="form.processing" class="animate-spin w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>{{ form.processing ? 'Memverifikasi...' : 'Masuk ke POS & Dashboard' }}</span>
                    </button>
                </form>
            </div>

            <!-- Footer Meta -->
            <div class="mt-6 text-center text-xs text-slate-400">
                <span>Tenant Isolation via Row-Level Multi-Tenancy</span>
                <span class="mx-2">•</span>
                <span>PostgreSQL 16 & SQLite Support</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';

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
