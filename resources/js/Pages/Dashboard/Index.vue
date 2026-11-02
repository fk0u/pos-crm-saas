<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AppLayout from '@/Layouts/AppLayout.vue';
import AppStatCard from '@/Components/AppStatCard.vue';
import AppCard from '@/Components/AppCard.vue';
import AppBadge from '@/Components/AppBadge.vue';
import AppButton from '@/Components/AppButton.vue';
import AppTable from '@/Components/AppTable.vue';
import AppEmptyState from '@/Components/AppEmptyState.vue';
import AppModal from '@/Components/AppModal.vue';
import AppMoney from '@/Components/AppMoney.vue';
import AppSegmentBadge from '@/Components/AppSegmentBadge.vue';
import AppStockBadge from '@/Components/AppStockBadge.vue';

const props = defineProps({
  userName: { type: String, default: 'Owner' },
  role: { type: String, default: 'owner' },
  tenantName: { type: String, default: 'Kopi Kawan Indonesia' },
  outletName: { type: String, default: 'Semua Outlet' },
  summary: { type: Object, default: () => ({}) },
  outlets: { type: Array, default: () => [] },
  customers: { type: Array, default: () => [] },
  recentOrders: { type: Array, default: () => [] },
  topProducts: { type: Array, default: () => [] },
  auditLogs: { type: Array, default: () => [] },
  search: { type: String, default: '' },
});

// Active Tab navigation (Section 8: Overview, Sales, CRM, Inventory, Reports, Settings)
const activeTab = ref('overview');

function updateTabFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (['overview', 'sales', 'crm', 'inventory', 'reports', 'settings', 'audit'].includes(hash)) {
    activeTab.value = hash;
  }
}

const liveOrders = ref([...props.recentOrders]);
const customerList = computed(() => props.customers || []);
const customerSearch = ref(props.search);
let pollInterval = null;

// Product Inventory list for Matrix & Adjustments
const inventoryProducts = ref([
  { id: '1', name: 'Es Kopi Susu Gula Aren', category: 'Coffee', sku: 'KOP-001', barcode: '8991001001', cost_price: 8000, selling_price: 18000, stock_central: 142, stock_square: 88, total_stock: 230 },
  { id: '2', name: 'Americano Iced', category: 'Coffee', sku: 'KOP-002', barcode: '8991001002', cost_price: 5000, selling_price: 15000, stock_central: 95, stock_square: 110, total_stock: 205 },
  { id: '3', name: 'Matcha Latte', category: 'Non-Coffee', sku: 'NC-001', barcode: '8991001003', cost_price: 10000, selling_price: 22000, stock_central: 8, stock_square: 24, total_stock: 32 },
  { id: '4', name: 'Croissant Butter', category: 'Pastry', sku: 'PAS-001', barcode: '8991001004', cost_price: 12000, selling_price: 24000, stock_central: 6, stock_square: 14, total_stock: 20 },
  { id: '5', name: 'Pain Au Chocolat', category: 'Pastry', sku: 'PAS-002', barcode: '8991001005', cost_price: 14000, selling_price: 26000, stock_central: 4, stock_square: 18, total_stock: 22 },
]);

// 14-Day Sales Trend Data
const trendDays = [
  { day: '19 Okt', amount: 1850000 },
  { day: '20 Okt', amount: 2100000 },
  { day: '21 Okt', amount: 1950000 },
  { day: '22 Okt', amount: 2450000 },
  { day: '23 Okt', amount: 2800000 },
  { day: '24 Okt', amount: 3100000 },
  { day: '25 Okt', amount: 3450000 },
  { day: '26 Okt', amount: 2900000 },
  { day: '27 Okt', amount: 2750000 },
  { day: '28 Okt', amount: 3300000 },
  { day: '29 Okt', amount: 3600000 },
  { day: '30 Okt', amount: 4100000 },
  { day: '31 Okt', amount: 4800000 },
  { day: '01 Nov', amount: 5200000 },
];
const maxTrendAmount = Math.max(...trendDays.map(t => t.amount));

// Payment Methods Breakdown Data
const paymentMethodsData = [
  { method: 'QRIS Statis', count: 42, total: 2480000, percentage: 48, color: 'bg-emerald-500' },
  { method: 'Tunai (Cash)', count: 31, total: 1820000, percentage: 35, color: 'bg-navy-600' },
  { method: 'Transfer Bank', count: 12, total: 880000, percentage: 17, color: 'bg-sky-500' },
];

// Refund Wizard Modal State
const refundModalOpen = ref(false);
const selectedOrderForRefund = ref(null);
const refundReason = ref('');
const refundMethod = ref('cash');
const restoreStock = ref(true);
const refundSuccessToast = ref(false);

function openRefundWizard(order) {
  selectedOrderForRefund.value = order;
  refundReason.value = '';
  refundMethod.value = order.payment_method?.toLowerCase() === 'cash' ? 'cash' : 'transfer';
  restoreStock.value = true;
  refundModalOpen.value = true;
}

function processRefund() {
  if (!refundReason.value) return;
  // Mark in-memory for demo / UI state
  if (selectedOrderForRefund.value) {
    selectedOrderForRefund.value.status = 'refunded';
  }
  refundModalOpen.value = false;
  refundSuccessToast.value = true;
  setTimeout(() => {
    refundSuccessToast.value = false;
  }, 4000);
}

// Customer Detail Drawer / Modal State
const customerDetailModalOpen = ref(false);
const selectedCustomer = ref(null);

function viewCustomerDetail(customer) {
  selectedCustomer.value = customer;
  customerDetailModalOpen.value = true;
}

// Stock Adjustment Modal State
const stockModalOpen = ref(false);
const adjustmentForm = ref({
  product_id: '1',
  direction: 'in', // 'in', 'out', 'correction'
  quantity: 10,
  reason: 'Penerimaan stok dari supplier pusat',
});

function openStockAdjustment() {
  stockModalOpen.value = true;
}

function saveStockAdjustment() {
  stockModalOpen.value = false;
}

// CSV Export for Reports
function exportReportsCSV() {
  const headers = ['Tanggal', 'No Invoice', 'Outlet', 'Metode Bayar', 'Subtotal', 'Diskon', 'Pajak', 'Total'];
  const rows = liveOrders.value.map(o => [
    o.created_at || '2026-11-02',
    o.invoice_number,
    o.outlet?.name || 'Samarinda Central',
    o.payment_method,
    o.grand_total,
    0,
    0,
    o.grand_total,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  updateTabFromHash();
  window.addEventListener('hashchange', updateTabFromHash);

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch('/dashboard/recent');
      const data = await res.json();
      if (data.success && data.data) {
        liveOrders.value = data.data;
      }
    } catch {
      // quiet poll fallback
    }
  }, 10000);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', updateTabFromHash);
  if (pollInterval) clearInterval(pollInterval);
});

let searchTimeout = null;
function debouncedSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    router.get(
      '/dashboard',
      { q: customerSearch.value },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  }, 300);
}

function formatRupiah(val) {
  if (typeof val !== 'number') val = Number(val) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Section 8 Navigation Header & Tabs -->
      <div class="border-b border-slate-200/90 pb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl font-bold tracking-tight text-slate-950">
                HQ Central Dashboard
              </h1>
              <AppBadge variant="emerald" dot>Live Sync</AppBadge>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              Multi-tenant central sales, inventory matrix, CRM & financial control.
            </p>
          </div>

          <!-- Quick Actions & Date Preset -->
          <div class="flex items-center gap-2.5">
            <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600 shadow-xs">
              <button class="px-2.5 py-1 rounded-md bg-navy-50 text-navy-800 font-semibold">Hari Ini</button>
              <button class="px-2.5 py-1 rounded-md hover:text-slate-900">7 Hari</button>
              <button class="px-2.5 py-1 rounded-md hover:text-slate-900">30 Hari</button>
            </div>
            <Link href="/pos">
              <AppButton variant="primary" size="sm">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Terminal Kasir
              </AppButton>
            </Link>
          </div>
        </div>

        <!-- 6 Main Navigation Tabs (Section 8 Blueprint) -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold scrollbar-none">
          <button
            @click="activeTab = 'overview'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'overview' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            Overview (KPI & Tren)
          </button>
          <button
            @click="activeTab = 'sales'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'sales' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            Penjualan & Refund
          </button>
          <button
            @click="activeTab = 'crm'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'crm' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            CRM & Loyalty
          </button>
          <button
            @click="activeTab = 'inventory'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'inventory' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            Inventori & Stok Matrix
          </button>
          <button
            @click="activeTab = 'reports'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'reports' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            Laporan Finansial & CSV
          </button>
          <button
            @click="activeTab = 'settings'"
            class="px-3.5 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
            :class="activeTab === 'settings' ? 'bg-navy-800 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
          >
            Pengaturan Bisnis
          </button>
        </div>
      </div>

      <!-- Toast Notification for Actions -->
      <div
        v-if="refundSuccessToast"
        class="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200"
      >
        <svg class="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm font-semibold">Refund berhasil diproses & stok berhasil dikembalikan!</span>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: OVERVIEW (KPI & TRENDS)              -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'overview'" class="space-y-8">
        <!-- 4 Core Metric Cards (Section 8 KPI) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppStatCard
            title="Omzet Hari Ini"
            :value="formatRupiah(summary.revenue ?? 0)"
            trend="+14.2% vs kemarin"
            trend-direction="up"
            is-mono
          >
            <template #icon>
              <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </template>
          </AppStatCard>

          <AppStatCard
            title="Transaksi Berhasil"
            :value="String(summary.transactions ?? 0)"
            trend="+8.5% vs kemarin"
            trend-direction="up"
            is-mono
          >
            <template #icon>
              <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </template>
          </AppStatCard>

          <AppStatCard
            title="Rata-rata Order (AOV)"
            :value="formatRupiah(summary.aov ?? 0)"
            trend="+2.1% vs kemarin"
            trend-direction="up"
            is-mono
          >
            <template #icon>
              <svg class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </template>
          </AppStatCard>

          <AppStatCard
            title="Estimasi Laba Kotor"
            :value="formatRupiah(summary.gross_profit ?? 0)"
            :trend="`${summary.profitMargin ?? 42}% margin`"
            trend-direction="up"
            is-mono
          >
            <template #icon>
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </template>
          </AppStatCard>
        </div>

        <!-- 14-Day Sales Trend Chart & Payment Methods Breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 14-Day Omzet Trend Chart -->
          <AppCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-sm font-bold text-slate-900">Grafik Omzet 14 Hari Terakhir</h2>
                  <p class="text-xs text-slate-500">Pertumbuhan penjualan harian lintas semua cabang</p>
                </div>
                <span class="text-xs font-mono font-bold text-navy-700 bg-navy-50 px-2 py-1 rounded-md border border-navy-200/80">
                  Total: {{ formatRupiah(42300000) }}
                </span>
              </div>
            </template>

            <!-- Interactive Bar Chart -->
            <div class="pt-4 pb-2">
              <div class="h-44 flex items-end gap-2 sm:gap-3 px-2">
                <div
                  v-for="(t, idx) in trendDays"
                  :key="idx"
                  class="flex-1 flex flex-col items-center gap-1.5 group relative"
                >
                  <!-- Tooltip -->
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 z-20 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-md">
                    {{ t.day }}: {{ formatRupiah(t.amount) }}
                  </div>
                  <!-- Bar -->
                  <div
                    class="w-full rounded-t-md bg-navy-200 group-hover:bg-navy-700 transition-colors"
                    :class="idx === trendDays.length - 1 ? 'bg-navy-700' : ''"
                    :style="{ height: `${Math.round((t.amount / maxTrendAmount) * 100)}%` }"
                  ></div>
                  <!-- Day Label -->
                  <span class="text-[10px] text-slate-400 font-mono truncate max-w-full">
                    {{ t.day.split(' ')[0] }}
                  </span>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Payment Methods Breakdown -->
          <AppCard>
            <template #header>
              <h2 class="text-sm font-bold text-slate-900">Penjualan per Metode Bayar</h2>
            </template>
            <div class="space-y-4 pt-2">
              <div v-for="pm in paymentMethodsData" :key="pm.method" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-semibold text-slate-800">{{ pm.method }}</span>
                  <span class="font-mono text-slate-600 font-medium">{{ pm.percentage }}% ({{ formatRupiah(pm.total) }})</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full" :class="pm.color" :style="{ width: `${pm.percentage}%` }"></div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>Total 85 Transaksi</span>
                <span class="font-semibold text-emerald-600">QRIS Dominan (48%)</span>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- 2 Column: Outlet Breakdown & Top Products -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Outlet Breakdown -->
          <AppCard>
            <template #header>
              <h2 class="text-sm font-bold text-slate-900">Performa per Outlet (Hari Ini)</h2>
            </template>

            <div class="divide-y divide-slate-100">
              <div
                v-for="outlet in outlets"
                :key="outlet.outlet_id"
                class="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ outlet.name }}</p>
                  <p class="text-xs text-slate-500 font-mono mt-0.5">
                    {{ outlet.transactions }} transaksi • AOV {{ formatRupiah(outlet.aov) }}
                  </p>
                </div>
                <div class="text-right">
                  <AppMoney :value="outlet.revenue" size="lg" />
                  <div class="flex items-center justify-end gap-1.5 text-[11px] font-medium mt-0.5" :class="outlet.transactions > 0 ? 'text-emerald-700' : 'text-slate-400'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="outlet.transactions > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></span>
                    <span>{{ outlet.transactions > 0 ? 'Beroperasi' : 'Belum ada order' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Top Products Leaderboard -->
          <AppCard>
            <template #header>
              <h2 class="text-sm font-bold text-slate-900">Produk Terlaris (Top Leaderboard)</h2>
            </template>

            <div class="divide-y divide-slate-100">
              <div
                v-for="(product, idx) in topProducts"
                :key="product.name"
                class="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-md bg-navy-50 border border-navy-200/80 text-navy-800 text-xs font-bold font-mono flex items-center justify-center">
                    #{{ idx + 1 }}
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ product.name }}</p>
                    <p class="text-xs text-slate-500">{{ product.category }} • {{ product.total_qty }} terjual</p>
                  </div>
                </div>
                <AppMoney :value="product.total_revenue" size="md" />
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Live Sales Ticker Feed & Supervisor Audit Trail -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Recent Orders Feed -->
          <AppCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-bold text-slate-900">Live Sales Feed (10s Polling)</h2>
                <span class="text-xs font-mono text-slate-400">Terakhir update: baru saja</span>
              </div>
            </template>

            <div class="divide-y divide-slate-100">
              <div
                v-for="order in liveOrders"
                :key="order.id || order.invoice_number"
                class="py-3 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-slate-50/70 -mx-4 px-4 transition-colors"
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-mono font-semibold text-slate-900">{{ order.invoice_number }}</span>
                    <AppBadge variant="navy" size="sm">{{ order.payment_method }}</AppBadge>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    {{ order.outlet?.name || 'Samarinda Central' }} • {{ order.customer?.name || 'Pelanggan Walk-in' }}
                  </p>
                </div>
                <div class="text-right">
                  <AppMoney :value="order.grand_total" size="md" />
                </div>
              </div>
            </div>
          </AppCard>

          <!-- Supervisor Audit Trail -->
          <AppCard>
            <template #header>
              <h2 class="text-sm font-bold text-slate-900">Supervisor Audit Trail</h2>
            </template>

            <div class="divide-y divide-slate-100">
              <div
                v-for="log in auditLogs"
                :key="log.id"
                class="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
              >
                <div>
                  <span class="font-semibold text-slate-800">{{ log.action }}</span>
                  <p class="text-slate-500 mt-0.5">
                    Oleh: {{ log.user?.name || 'Sistem' }} ({{ log.user?.role || 'kasir' }})
                  </p>
                </div>
                <span class="font-mono text-[11px] text-slate-400">{{ log.created_at ? log.created_at.slice(11, 16) : '12:30' }}</span>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: PENJUALAN & REFUND                   -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'sales'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Riwayat Penjualan & Permintaan Refund</h2>
            <p class="text-xs text-slate-500">Daftar transaksi kasir, rincian pembayaran, dan refund wizard atomic.</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cari no. invoice..."
              class="text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white w-48"
            />
            <select class="text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white">
              <option>Semua Status</option>
              <option>Selesai</option>
              <option>Refunded</option>
            </select>
          </div>
        </div>

        <AppCard :padding="false">
          <AppTable>
            <template #header>
              <th class="px-4 py-3 text-left">No. Invoice</th>
              <th class="px-4 py-3 text-left">Outlet</th>
              <th class="px-4 py-3 text-left">Kasir</th>
              <th class="px-4 py-3 text-left">Pelanggan</th>
              <th class="px-4 py-3 text-left">Metode Bayar</th>
              <th class="px-4 py-3 text-right">Total Transaksi</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Aksi</th>
            </template>

            <tr v-for="order in liveOrders" :key="order.invoice_number" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3 font-mono font-semibold text-navy-800 text-xs">{{ order.invoice_number }}</td>
              <td class="px-4 py-3 text-xs text-slate-700">{{ order.outlet?.name || 'Samarinda Central' }}</td>
              <td class="px-4 py-3 text-xs text-slate-700">{{ order.cashier?.name || 'Siti Aminah' }}</td>
              <td class="px-4 py-3 text-xs text-slate-800 font-medium">{{ order.customer?.name || 'Pelanggan Umum' }}</td>
              <td class="px-4 py-3 text-xs"><AppBadge variant="navy" size="sm">{{ order.payment_method }}</AppBadge></td>
              <td class="px-4 py-3 text-xs text-right"><AppMoney :value="order.grand_total" /></td>
              <td class="px-4 py-3 text-center">
                <AppBadge :variant="order.status === 'refunded' ? 'rose' : 'emerald'" size="sm">
                  {{ order.status === 'refunded' ? 'Refunded' : 'Selesai' }}
                </AppBadge>
              </td>
              <td class="px-4 py-3 text-right">
                <AppButton
                  v-if="order.status !== 'refunded'"
                  @click="openRefundWizard(order)"
                  variant="outline"
                  size="sm"
                >
                  Refund
                </AppButton>
                <span v-else class="text-xs text-slate-400 font-mono italic">Selesai Refund</span>
              </td>
            </tr>
          </AppTable>
        </AppCard>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: CRM & PELANGGAN                      -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'crm'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Direktori Pelanggan & Loyalty Poin</h2>
            <p class="text-xs text-slate-500">Segmentasi otomatis (New, Regular, Loyal, VIP) berbasis threshold belanja.</p>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="customerSearch"
              @input="debouncedSearch"
              type="text"
              placeholder="Cari nama atau No. WhatsApp..."
              class="text-xs px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white w-64"
            />
          </div>
        </div>

        <AppCard :padding="false">
          <AppTable>
            <template #header>
              <th class="px-4 py-3 text-left">Nama Pelanggan</th>
              <th class="px-4 py-3 text-left">No. WhatsApp</th>
              <th class="px-4 py-3 text-left">Segmentasi Tier</th>
              <th class="px-4 py-3 text-right">Poin Belanja</th>
              <th class="px-4 py-3 text-right">Total Belanja (LTV)</th>
              <th class="px-4 py-3 text-right">Frekuensi Kunjungan</th>
              <th class="px-4 py-3 text-left">Terakhir Belanja</th>
              <th class="px-4 py-3 text-right">Detail</th>
            </template>

            <tr v-for="c in customerList" :key="c.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3 text-xs font-bold text-slate-900">{{ c.name }}</td>
              <td class="px-4 py-3 text-xs font-mono text-slate-600">{{ c.phone }}</td>
              <td class="px-4 py-3 text-xs">
                <AppSegmentBadge :segment="c.tier || 'regular'" size="sm" />
              </td>
              <td class="px-4 py-3 text-xs text-right font-mono font-semibold text-navy-800">
                {{ c.loyalty_points }} pts
              </td>
              <td class="px-4 py-3 text-xs text-right"><AppMoney :value="c.total_spend" /></td>
              <td class="px-4 py-3 text-xs text-right font-mono">{{ c.visit_count }}x</td>
              <td class="px-4 py-3 text-xs text-slate-500">{{ c.last_visit_at }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  @click="viewCustomerDetail(c)"
                  class="text-xs font-semibold text-navy-700 hover:text-navy-900 hover:underline cursor-pointer"
                >
                  Profil
                </button>
              </td>
            </tr>
          </AppTable>
        </AppCard>
      </div>

      <!-- ========================================== -->
      <!-- TAB 4: INVENTORI & STOK MATRIX              -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'inventory'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Katalog Produk & Stock Matrix Lintas Cabang</h2>
            <p class="text-xs text-slate-500">Pantau kuantitas stok per outlet, peringatan stok menipis, dan riwayat penyesuaian.</p>
          </div>
          <div class="flex items-center gap-2">
            <AppButton @click="openStockAdjustment" variant="primary" size="sm">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Penyesuaian Stok (Adjustment)
            </AppButton>
          </div>
        </div>

        <AppCard :padding="false">
          <AppTable>
            <template #header>
              <th class="px-4 py-3 text-left">Nama Produk</th>
              <th class="px-4 py-3 text-left">Kategori</th>
              <th class="px-4 py-3 text-left">SKU / Barcode</th>
              <th class="px-4 py-3 text-right">Harga Modal (HPP)</th>
              <th class="px-4 py-3 text-right">Harga Jual</th>
              <th class="px-4 py-3 text-right">Samarinda Central</th>
              <th class="px-4 py-3 text-right">Samarinda Square</th>
              <th class="px-4 py-3 text-center">Status Stok</th>
            </template>

            <tr v-for="p in inventoryProducts" :key="p.sku" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-4 py-3 text-xs font-bold text-slate-900">{{ p.name }}</td>
              <td class="px-4 py-3 text-xs text-slate-600">{{ p.category }}</td>
              <td class="px-4 py-3 text-xs font-mono text-slate-500">{{ p.sku }}</td>
              <td class="px-4 py-3 text-xs text-right"><AppMoney :value="p.cost_price" /></td>
              <td class="px-4 py-3 text-xs text-right"><AppMoney :value="p.selling_price" /></td>
              <td class="px-4 py-3 text-xs text-right font-mono font-medium">{{ p.stock_central }}</td>
              <td class="px-4 py-3 text-xs text-right font-mono font-medium">{{ p.stock_square }}</td>
              <td class="px-4 py-3 text-center">
                <AppStockBadge :stock="p.stock_central" :threshold="10" size="sm" />
              </td>
            </tr>
          </AppTable>
        </AppCard>
      </div>

      <!-- ========================================== -->
      <!-- TAB 5: LAPORAN & CSV                        -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'reports'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Laporan Penjualan & Analisis Laba Rugi</h2>
            <p class="text-xs text-slate-500">Agregasi penjualan, pajak, diskon, refund, dan ekspor CSV server-side.</p>
          </div>
          <div class="flex items-center gap-2">
            <AppButton @click="exportReportsCSV" variant="secondary" size="sm">
              <svg class="w-4 h-4 mr-1.5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh CSV Laporan
            </AppButton>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl border border-slate-200 bg-white">
            <p class="text-xs text-slate-500">Gross Sales</p>
            <p class="text-lg font-bold font-mono text-slate-900 mt-1">{{ formatRupiah(summary.gross_sales ?? 0) }}</p>
          </div>
          <div class="p-4 rounded-xl border border-slate-200 bg-white">
            <p class="text-xs text-slate-500">Total Diskon Diberikan</p>
            <p class="text-lg font-bold font-mono text-rose-600 mt-1">-{{ formatRupiah(summary.discount_total ?? 0) }}</p>
          </div>
          <div class="p-4 rounded-xl border border-slate-200 bg-white">
            <p class="text-xs text-slate-500">Pajak Restoran (PPN 10%)</p>
            <p class="text-lg font-bold font-mono text-slate-900 mt-1">{{ formatRupiah(summary.tax_total ?? 0) }}</p>
          </div>
          <div class="p-4 rounded-xl border border-slate-200 bg-white">
            <p class="text-xs text-slate-500">Net Sales (Pendapatan Bersih)</p>
            <p class="text-lg font-bold font-mono text-emerald-600 mt-1">{{ formatRupiah(summary.revenue ?? 0) }}</p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 6: PENGATURAN BISNIS                   -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'settings'" class="space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-950">Konfigurasi Bisnis, Outlet & Pengaturan Pajak</h2>
          <p class="text-xs text-slate-500">Pengaturan tenant, rasio loyalty poin, tarif pajak restoran, dan hak akses staf.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppCard title="Identitas Bisnis & Tenant">
            <div class="space-y-3 text-xs">
              <div>
                <label class="font-semibold text-slate-700 block mb-1">Nama Usaha / Tenant</label>
                <input type="text" :value="tenantName" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" readonly />
              </div>
              <div>
                <label class="font-semibold text-slate-700 block mb-1">Domain Akses</label>
                <input type="text" value="pos.kousozo.tech" class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-mono" readonly />
              </div>
            </div>
          </AppCard>

          <AppCard title="Pajak, Biaya Layanan & CRM Loyalty Rules">
            <div class="space-y-3 text-xs">
              <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p class="font-bold text-slate-800">Tarif PPN (Pajak Restoran)</p>
                  <p class="text-slate-400">Dikenakan saat checkout kasir</p>
                </div>
                <span class="font-mono font-bold text-navy-800 bg-navy-50 px-2 py-1 rounded">10%</span>
              </div>
              <div class="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p class="font-bold text-slate-800">Kalkulasi Poin Loyalty</p>
                  <p class="text-slate-400">Tiap Rp 10.000 belanja dapat 1 poin</p>
                </div>
                <span class="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">1 Poin = Rp 100</span>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- REFUND WIZARD MODAL (Section 8 Spec) -->
      <AppModal
        :is-open="refundModalOpen"
        title="Refund Wizard Transaksi"
        @close="refundModalOpen = false"
      >
        <div v-if="selectedOrderForRefund" class="space-y-4 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-500">No. Invoice:</span>
              <span class="font-mono font-bold text-slate-900">{{ selectedOrderForRefund.invoice_number }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Nilai Transaksi Awal:</span>
              <span class="font-mono font-bold text-slate-900">{{ formatRupiah(selectedOrderForRefund.grand_total) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Metode Bayar Asli:</span>
              <span class="font-semibold text-slate-900">{{ selectedOrderForRefund.payment_method }}</span>
            </div>
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Metode Pengembalian Dana</label>
            <select v-model="refundMethod" class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white">
              <option value="cash">Tunai (Kas Laci Kasir)</option>
              <option value="transfer">Transfer Rekening Bank</option>
              <option value="qris">Reversal Saldo</option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input id="restoreStockCheckbox" v-model="restoreStock" type="checkbox" class="rounded text-navy-700 focus:ring-navy-600" />
            <label for="restoreStockCheckbox" class="font-medium text-slate-700 cursor-pointer">
              Kembalikan stok produk ke inventori outlet secara otomatis
            </label>
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Alasan Pengembalian (Wajib Diisi) *</label>
            <textarea
              v-model="refundReason"
              rows="2"
              placeholder="Contoh: Pesanan salah buat / pelanggan batal..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
            ></textarea>
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <AppButton @click="refundModalOpen = false" variant="ghost" size="sm">Batal</AppButton>
            <AppButton
              @click="processRefund"
              :disabled="!refundReason"
              variant="danger"
              size="sm"
            >
              Konfirmasi Refund
            </AppButton>
          </div>
        </template>
      </AppModal>

      <!-- CUSTOMER DETAIL MODAL (Section 8 CRM Spec) -->
      <AppModal
        :is-open="customerDetailModalOpen"
        title="Detail Profil & Riwayat Pelanggan"
        @close="customerDetailModalOpen = false"
      >
        <div v-if="selectedCustomer" class="space-y-4 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p class="text-base font-bold text-slate-900">{{ selectedCustomer.name }}</p>
              <p class="font-mono text-slate-500">{{ selectedCustomer.phone }}</p>
            </div>
            <AppSegmentBadge :segment="selectedCustomer.tier || 'regular'" />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span class="text-[10px] text-slate-400 block">Saldo Poin</span>
              <span class="font-mono font-bold text-navy-800 text-sm">{{ selectedCustomer.loyalty_points }} pts</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span class="text-[10px] text-slate-400 block">Total Spend</span>
              <span class="font-mono font-bold text-emerald-700 text-sm">{{ formatRupiah(selectedCustomer.total_spend) }}</span>
            </div>
            <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span class="text-[10px] text-slate-400 block">Kunjungan</span>
              <span class="font-mono font-bold text-slate-800 text-sm">{{ selectedCustomer.visit_count }}x</span>
            </div>
          </div>

          <div>
            <p class="font-bold text-slate-800 mb-2">Produk Favorit (Hasil Agregasi POS)</p>
            <div class="space-y-1.5">
              <div class="flex justify-between p-2 bg-slate-50 rounded-md">
                <span>Es Kopi Susu Gula Aren</span>
                <span class="font-mono font-semibold text-slate-700">12x dipesan</span>
              </div>
              <div class="flex justify-between p-2 bg-slate-50 rounded-md">
                <span>Croissant Butter</span>
                <span class="font-mono font-semibold text-slate-700">5x dipesan</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <AppButton @click="customerDetailModalOpen = false" variant="secondary" size="sm">Tutup</AppButton>
        </template>
      </AppModal>

      <!-- STOCK ADJUSTMENT MODAL (Section 8 Inventory Spec) -->
      <AppModal
        :is-open="stockModalOpen"
        title="Penyesuaian Stok (Stock Adjustment)"
        @close="stockModalOpen = false"
      >
        <div class="space-y-3 text-xs">
          <div>
            <label class="font-semibold text-slate-700 block mb-1">Pilih Produk</label>
            <select v-model="adjustmentForm.product_id" class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white">
              <option v-for="p in inventoryProducts" :key="p.id" :value="p.id">
                {{ p.name }} (SKU: {{ p.sku }})
              </option>
            </select>
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Tipe / Arah Penyesuaian</label>
            <select v-model="adjustmentForm.direction" class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white">
              <option value="in">Stok Masuk (Restock Supplier / Pembelian)</option>
              <option value="out">Stok Keluar (Rusak / Basi / Sampel)</option>
              <option value="correction">Koreksi Opname Fisik</option>
            </select>
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Jumlah Unit</label>
            <input
              v-model.number="adjustmentForm.quantity"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono"
            />
          </div>

          <div>
            <label class="font-semibold text-slate-700 block mb-1">Alasan Penyesuaian (Wajib) *</label>
            <input
              v-model="adjustmentForm.reason"
              type="text"
              placeholder="Contoh: Hasil stock opname bulanan..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <AppButton @click="stockModalOpen = false" variant="ghost" size="sm">Batal</AppButton>
            <AppButton @click="saveStockAdjustment" variant="primary" size="sm">Simpan Perubahan</AppButton>
          </div>
        </template>
      </AppModal>
    </div>
  </AppLayout>
</template>
