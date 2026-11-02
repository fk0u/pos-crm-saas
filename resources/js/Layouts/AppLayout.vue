<script setup>
import { ref, computed } from 'vue';
import { usePage, Link, router } from '@inertiajs/vue3';

const page = usePage();
const mobileMenuOpen = ref(false);
const searchModalOpen = ref(false);
const notificationsOpen = ref(false);
const userMenuOpen = ref(false);
const outletMenuOpen = ref(false);

const user = computed(() => page.props.auth?.user || {
  name: page.props.userName || 'Hendra Setiawan',
  role: page.props.userRole || page.props.role || 'owner',
  email: 'owner@kopikawan.com',
});

const tenantName = computed(() => page.props.tenantName || page.props.auth?.tenant?.name || 'Kopi Kawan Indonesia');
const selectedOutlet = ref(page.props.outletName || 'Semua Outlet');

const outlets = [
  'Semua Outlet',
  'Kopi Kawan - Samarinda Central',
  'Kopi Kawan - Samarinda Square'
];

const lowStockItems = [
  { name: 'Pain Au Chocolat', sku: 'PAS-002', stock: 4, outlet: 'Samarinda Central' },
  { name: 'Croissant Butter', sku: 'PAS-001', stock: 6, outlet: 'Samarinda Square' },
  { name: 'Matcha Latte Bubuk', sku: 'NC-001', stock: 8, outlet: 'Samarinda Central' },
];

const userInitials = computed(() => {
  const name = user.value.name || 'User';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
});

const currentUrl = computed(() => page.url);

const isCurrentRoute = (path) => {
  if (path === '/dashboard' && (currentUrl.value === '/dashboard' || currentUrl.value === '/dashboard#overview')) {
    return true;
  }
  if (path === '/pos' && currentUrl.value.startsWith('/pos')) {
    return true;
  }
  return currentUrl.value === path;
};

const handleLogout = () => {
  router.post('/logout');
};

const selectOutlet = (outlet) => {
  selectedOutlet.value = outlet;
  outletMenuOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile Backdrop -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Fixed Left Sidebar (w-64, bg-navy-900 / navy-800) -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white/70 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 border-r border-white/5"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-navy-950/40">
        <Link href="/dashboard" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-navy-700 border border-navy-500/60 flex items-center justify-center text-white shadow-inner font-bold text-lg tracking-tight group-hover:bg-navy-600 transition-colors">
            O
          </div>
          <div>
            <span class="text-white font-bold text-base tracking-tight block leading-tight">Omnipoint</span>
            <span class="text-[10px] text-navy-300 font-mono tracking-wider block">POS + CRM SAAS</span>
          </div>
        </Link>

        <button
          @click="mobileMenuOpen = false"
          class="lg:hidden text-white/60 hover:text-white p-1 rounded-md"
          aria-label="Tutup menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links (6 Groups from Section 8 Spec) -->
      <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <!-- 1. Overview -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            Overview
          </div>
          <div class="space-y-0.5">
            <Link
              href="/dashboard#overview"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              :class="isCurrentRoute('/dashboard')
                ? 'bg-navy-700 text-white font-semibold shadow-xs'
                : 'text-white/75 hover:bg-white/5 hover:text-white'"
            >
              <svg class="w-4 h-4 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>HQ Live Dashboard</span>
            </Link>
          </div>
        </div>

        <!-- 2. Penjualan -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            Penjualan
          </div>
          <div class="space-y-0.5">
            <Link
              href="/pos"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all"
              :class="isCurrentRoute('/pos')
                ? 'bg-navy-700 text-white font-semibold shadow-xs'
                : 'text-white/75 hover:bg-white/5 hover:text-white'"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Terminal POS Kasir</span>
            </Link>

            <Link
              href="/dashboard#sales"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/75 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Riwayat & Refund</span>
            </Link>
          </div>
        </div>

        <!-- 3. CRM -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            CRM & Member
          </div>
          <div class="space-y-0.5">
            <Link
              href="/dashboard#crm"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/75 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Pelanggan & Loyalty</span>
            </Link>
          </div>
        </div>

        <!-- 4. Inventori -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            Inventori
          </div>
          <div class="space-y-0.5">
            <Link
              href="/dashboard#inventory"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/75 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Produk & Stock Matrix</span>
            </Link>
          </div>
        </div>

        <!-- 5. Laporan -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            Laporan
          </div>
          <div class="space-y-0.5">
            <Link
              href="/dashboard#reports"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/75 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Penjualan & CSV</span>
            </Link>
          </div>
        </div>

        <!-- 6. Pengaturan -->
        <div>
          <div class="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300/70">
            Pengaturan
          </div>
          <div class="space-y-0.5">
            <Link
              href="/dashboard#settings"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-white/75 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Bisnis, Outlet & Staf</span>
            </Link>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer: Tenant & User Profile -->
      <div class="p-3.5 border-t border-white/10 shrink-0 bg-navy-950/60">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-navy-700 text-white font-semibold text-xs flex items-center justify-center border border-navy-500 shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-white truncate">
              {{ user.name }}
            </p>
            <p class="text-[10px] text-navy-300 capitalize truncate">
              {{ user.role === 'owner' ? 'Business Owner' : (user.role === 'manager' ? 'Store Manager' : 'Kasir') }}
            </p>
          </div>

          <button
            @click="handleLogout"
            title="Keluar (Logout)"
            class="text-white/40 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main App Container (with ml-64 on desktop) -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      <!-- Top Bar (Section 8: Outlet Switcher, Local Search, Shift Status, Low Stock, Avatar Menu) -->
      <header class="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Trigger -->
          <button
            @click="mobileMenuOpen = true"
            type="button"
            class="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Buka menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- 1. Outlet Switcher Dropdown -->
          <div class="relative">
            <button
              @click="outletMenuOpen = !outletMenuOpen"
              class="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/90 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-800 transition-colors cursor-pointer"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="font-bold text-slate-900">{{ tenantName }}</span>
              <span class="text-slate-400">•</span>
              <span class="text-slate-700 max-w-[140px] truncate">{{ selectedOutlet }}</span>
              <svg class="w-3.5 h-3.5 text-slate-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Outlet Menu Dropdown -->
            <div
              v-if="outletMenuOpen"
              class="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40"
            >
              <div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pilih Cabang / Outlet
              </div>
              <button
                v-for="out in outlets"
                :key="out"
                @click="selectOutlet(out)"
                class="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors"
                :class="selectedOutlet === out ? 'text-navy-700 font-semibold bg-navy-50/50' : 'text-slate-700'"
              >
                <span>{{ out }}</span>
                <svg v-if="selectedOutlet === out" class="w-3.5 h-3.5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 2. Pencarian Lokal (Local Search trigger) -->
          <button
            @click="searchModalOpen = true"
            class="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Cari invoice, produk, pelanggan...</span>
            <kbd class="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500">⌘K</kbd>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <!-- 3. Status Shift Badge -->
          <div class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-medium">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Shift #01 Aktif</span>
          </div>

          <!-- 4. Notifikasi Low Stock -->
          <div class="relative">
            <button
              @click="notificationsOpen = !notificationsOpen"
              class="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifikasi Stok Menipis"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            <!-- Notification Dropdown -->
            <div
              v-if="notificationsOpen"
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-40"
            >
              <div class="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800">Peringatan Stok Menipis</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {{ lowStockItems.length }} item
                </span>
              </div>
              <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                <div v-for="item in lowStockItems" :key="item.sku" class="p-3 hover:bg-slate-50 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-slate-800">{{ item.name }}</span>
                    <span class="font-mono text-rose-600 font-bold">Sisa {{ item.stock }}</span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                    <span>SKU: {{ item.sku }}</span>
                    <span>{{ item.outlet }}</span>
                  </div>
                </div>
              </div>
              <div class="p-2 border-t border-slate-100 text-center">
                <Link href="/dashboard#inventory" @click="notificationsOpen = false" class="text-xs font-semibold text-navy-700 hover:text-navy-900">
                  Lihat Semua di Stock Matrix →
                </Link>
              </div>
            </div>
          </div>

          <!-- Quick POS Shortcut -->
          <Link
            v-if="!isCurrentRoute('/pos')"
            href="/pos"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Buka Kasir</span>
          </Link>

          <!-- 5. Avatar Menu Dropdown -->
          <div class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer"
            >
              <div class="w-8 h-8 rounded-full bg-navy-700 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {{ userInitials }}
              </div>
              <div class="hidden md:block text-left">
                <p class="text-xs font-semibold text-slate-800 leading-none">
                  {{ user.name }}
                </p>
                <p class="text-[10px] text-slate-500 capitalize mt-0.5">
                  {{ user.role }}
                </p>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- User Menu -->
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs"
            >
              <div class="px-3 py-2 border-b border-slate-100">
                <p class="font-bold text-slate-900">{{ user.name }}</p>
                <p class="text-[11px] text-slate-400 capitalize">{{ user.role }} • {{ tenantName }}</p>
              </div>
              <Link href="/dashboard#settings" @click="userMenuOpen = false" class="block px-3 py-2 text-slate-700 hover:bg-slate-50">
                Pengaturan Akun & Outlet
              </Link>
              <Link href="/dashboard#audit" @click="userMenuOpen = false" class="block px-3 py-2 text-slate-700 hover:bg-slate-50">
                Audit Log & Keamanan
              </Link>
              <div class="border-t border-slate-100 my-1"></div>
              <button
                @click="handleLogout"
                class="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center justify-between"
              >
                <span>Keluar (Logout)</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Global Search Modal (Ctrl+K) -->
      <div
        v-if="searchModalOpen"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
        @click.self="searchModalOpen = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="p-3 border-b border-slate-200 flex items-center gap-3">
            <svg class="w-5 h-5 text-slate-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari transaksi, SKU produk, atau nama pelanggan..."
              class="w-full text-sm outline-none bg-transparent placeholder-slate-400 text-slate-800"
              autofocus
              @keydown.esc="searchModalOpen = false"
            />
            <kbd class="px-2 py-0.5 text-[10px] font-mono bg-slate-100 border border-slate-200 rounded text-slate-500">ESC</kbd>
          </div>
          <div class="p-4 text-xs text-slate-500 space-y-2">
            <p class="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Pintasan Cepat</p>
            <div class="grid grid-cols-2 gap-2">
              <Link href="/pos" @click="searchModalOpen = false" class="p-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-semibold text-slate-800">Terminal Kasir POS</span>
              </Link>
              <Link href="/dashboard#inventory" @click="searchModalOpen = false" class="p-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-navy-500"></span>
                <span class="font-semibold text-slate-800">Katalog Produk & Stok</span>
              </Link>
              <Link href="/dashboard#crm" @click="searchModalOpen = false" class="p-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="font-semibold text-slate-800">Direktori Member CRM</span>
              </Link>
              <Link href="/dashboard#reports" @click="searchModalOpen = false" class="p-2.5 rounded-lg border border-slate-200/80 hover:bg-slate-50 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="font-semibold text-slate-800">Laporan Penjualan & CSV</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <main class="flex-1">
        <slot />
      </main>

      <!-- Footer Note -->
      <footer class="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Omnipoint POS + CRM SaaS • Platform Terpadu UMKM Indonesia</span>
        <span class="font-mono text-[11px] text-slate-400">Laravel 12 • Inertia • Tailwind v4</span>
      </footer>
    </div>
  </div>
</template>
