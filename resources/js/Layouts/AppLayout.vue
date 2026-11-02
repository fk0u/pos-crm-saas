<script setup>
import { ref, computed } from 'vue';
import { usePage, Link, router } from '@inertiajs/vue3';

const page = usePage();
const mobileMenuOpen = ref(false);

const user = computed(() => page.props.auth?.user || {
  name: page.props.userName || 'Pengguna',
  role: page.props.userRole || page.props.role || 'cashier',
  email: '',
});

const tenantName = computed(() => page.props.tenantName || page.props.auth?.tenant?.name || 'Omnipoint POS');
const outletName = computed(() => page.props.outletName || 'Cabang Utama');

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
  if (path === '/dashboard' && (currentUrl.value === '/dashboard' || currentUrl.value.startsWith('/dashboard?'))) {
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
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile Backdrop -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Fixed Left Sidebar (w-64, bg-navy-800) -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-navy-800 text-white/70 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <Link href="/dashboard" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-navy-700 border border-navy-500/50 flex items-center justify-center text-white shadow-inner font-bold text-lg tracking-tight group-hover:bg-navy-600 transition-colors">
            O
          </div>
          <div>
            <span class="text-white font-bold text-base tracking-tight block leading-tight">Omnipoint</span>
            <span class="text-[11px] text-navy-300 font-mono tracking-wider block">POS & CRM SAAS</span>
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

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <!-- Group: Overview -->
        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Overview
          </div>
          <div class="space-y-1">
            <Link
              href="/dashboard"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              :class="isCurrentRoute('/dashboard')
                ? 'bg-white/10 text-white font-semibold border-l-3 border-navy-300 pl-2.5'
                : 'text-white/70 hover:bg-white/5 hover:text-white'"
            >
              <svg class="w-4 h-4 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>HQ Live Dashboard</span>
            </Link>
          </div>
        </div>

        <!-- Group: Sales -->
        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Penjualan & Kasir
          </div>
          <div class="space-y-1">
            <Link
              href="/pos"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
              :class="isCurrentRoute('/pos')
                ? 'bg-white/10 text-white font-semibold border-l-3 border-navy-300 pl-2.5'
                : 'text-white/70 hover:bg-white/5 hover:text-white'"
            >
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Terminal POS Kasir</span>
            </Link>

            <Link
              href="/dashboard#orders"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Riwayat Transaksi</span>
            </Link>
          </div>
        </div>

        <!-- Group: CRM & Loyalty -->
        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            CRM & Pelanggan
          </div>
          <div class="space-y-1">
            <Link
              href="/dashboard#crm"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Direktori Member CRM</span>
            </Link>
          </div>
        </div>

        <!-- Group: Outlets & Audit -->
        <div>
          <div class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Operasional
          </div>
          <div class="space-y-1">
            <Link
              href="/dashboard#outlets"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Performa Outlet</span>
            </Link>

            <Link
              href="/dashboard#audit"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Audit Log Supervisor</span>
            </Link>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer: Tenant & User Profile -->
      <div class="p-4 border-t border-white/10 shrink-0 bg-navy-900/40">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-navy-700 text-white font-semibold text-xs flex items-center justify-center border border-navy-500 shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-white truncate">
              {{ user.name }}
            </p>
            <p class="text-[11px] text-white/50 capitalize truncate">
              {{ user.role === 'owner' ? 'Business Owner' : (user.role === 'manager' ? 'Store Manager' : 'Kasir Outlet') }}
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
      <!-- Top Bar -->
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

          <!-- Outlet/Store Switcher Pill -->
          <div class="flex items-center gap-2 bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="font-semibold text-slate-900">{{ tenantName }}</span>
            <span class="text-slate-400">•</span>
            <span class="text-slate-600 truncate max-w-[140px]">{{ outletName }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Quick POS Shortcut if not on POS -->
          <Link
            v-if="!isCurrentRoute('/pos')"
            href="/pos"
            class="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200/80 rounded-lg text-xs font-semibold transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Buka Kasir Cepat</span>
          </Link>

          <!-- User Quick Menu -->
          <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
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
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1">
        <slot />
      </main>

      <!-- Footer Note -->
      <footer class="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        <span>Omnipoint POS + CRM SaaS • High Performance Cloud Architecture</span>
      </footer>
    </div>
  </div>
</template>
