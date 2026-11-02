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

const liveOrders = ref([...props.recentOrders]);
const customerList = computed(() => props.customers || []);
const customerSearch = ref(props.search);
const pollSeconds = ref(10);
let pollInterval = null;

onMounted(() => {
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

function formatActionLabel(action) {
  const map = {
    shift_open: 'Buka Shift Kasir',
    shift_close: 'Tutup Shift Kasir (X/Z)',
    shift_discrepancy: 'Selisih Kas Laci Kasir',
    cash_movement: 'Pergerakan Kas Laci',
    discount_applied: 'Penerapan Diskon Manual',
  };
  return map[action] || action;
}

function getTierVariant(tier) {
  if (tier === 'Platinum') return 'sky';
  if (tier === 'Gold') return 'amber';
  if (tier === 'Silver') return 'slate';
  return 'navy';
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">
              HQ Live Monitoring
            </h1>
            <AppBadge variant="emerald" dot>
              Live Feed Terhubung
            </AppBadge>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Pantau arus kas, performa penjualan multi-outlet, dan audit keamanan kasir secara real-time.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Link href="/pos">
            <AppButton variant="primary" size="md">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Buka Terminal Kasir
            </AppButton>
          </Link>
        </div>
      </div>

      <!-- 4 Top Financial KPI Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Today's Revenue -->
        <AppStatCard
          title="Omzet Hari Ini"
          :value="formatRupiah(summary.revenue)"
          trend="+12.4%"
          :trend-up="true"
          trend-label="vs hari kemarin"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </template>
        </AppStatCard>

        <!-- Gross Profit & HPP Margin -->
        <AppStatCard
          title="Laba Kotor (HPP)"
          :value="formatRupiah(summary.gross_profit || 0)"
          :subtitle="`Margin HPP: ${summary.profit_margin || 0}%`"
          trend="+8.1%"
          :trend-up="true"
        >
          <template #icon>
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </template>
        </AppStatCard>

        <!-- Total Transactions & AOV -->
        <AppStatCard
          title="Total Transaksi"
          :value="`${summary.transactions || 0} Struk`"
          :subtitle="`AOV: ${formatRupiah(summary.aov || 0)}`"
          trend="+5.2%"
          :trend-up="true"
        >
          <template #icon>
            <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </template>
        </AppStatCard>

        <!-- Active Outlets & Shifts -->
        <AppStatCard
          title="Shift Aktif Cabang"
          :value="`${summary.open_shifts || 1} Kasir Aktif`"
          :subtitle="`${outlets.length} Total Cabang`"
        >
          <template #icon>
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </template>
        </AppStatCard>
      </div>

      <!-- Middle Section: Outlet Breakdown & Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Outlet Performance Card (col-span-2) -->
        <div class="lg:col-span-2" id="outlets">
          <AppCard
            title="Performa Outlet"
            subtitle="Komparasi omzet, jumlah struk, dan nilai transaksi rata-rata cabang hari ini"
          >
            <template #action>
              <AppBadge variant="slate">Multi-Branch Sync</AppBadge>
            </template>

            <div class="space-y-3.5">
              <div
                v-for="outlet in outlets"
                :key="outlet.outlet_id"
                class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-semibold text-sm text-slate-900">{{ outlet.name }}</h4>
                    <p class="text-xs text-slate-500 font-mono mt-0.5">
                      {{ outlet.transactions }} Transaksi • AOV {{ formatRupiah(outlet.aov || (outlet.transactions > 0 ? outlet.revenue / outlet.transactions : 0)) }}
                    </p>
                  </div>
                </div>

                <div class="sm:text-right">
                  <div class="text-base font-bold font-mono text-slate-900 tabular-nums">
                    {{ formatRupiah(outlet.revenue) }}
                  </div>
                  <div class="text-[11px] text-slate-400">Total Omzet Cabang</div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Top Selling Products Leaderboard -->
        <div>
          <AppCard
            title="Top Produk Terlaris"
            subtitle="Peringkat menu paling diminati pelanggan"
          >
            <div class="space-y-3">
              <div
                v-for="(prod, idx) in topProducts"
                :key="prod.name"
                class="p-3 rounded-lg border border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0"
                    :class="idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'"
                  >
                    {{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-900 truncate">{{ prod.name }}</p>
                    <p class="text-[11px] text-slate-400 truncate">{{ prod.category }}</p>
                  </div>
                </div>

                <div class="text-right shrink-0 font-mono pl-2">
                  <span class="font-bold text-navy-800">{{ prod.total_qty }} pcs</span>
                  <span class="block text-[10px] text-slate-500">{{ formatRupiah(prod.total_revenue) }}</span>
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- Lower Section: Live Transactions & Supervisor Audit Trail -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Live Sales Feed -->
        <div id="orders">
          <AppCard
            title="Live Sales"
            subtitle="Transaksi terbaru masuk dari kasir secara real-time"
          >
            <template #action>
              <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Polling 10s
              </span>
            </template>

            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div
                v-for="order in liveOrders"
                :key="order.id || order.invoice_number"
                class="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors text-xs"
              >
                <div>
                  <div class="font-mono font-bold text-slate-900 text-sm">
                    {{ order.invoice_number }}
                  </div>
                  <div class="text-[11px] text-slate-500 mt-0.5">
                    <span>{{ order.outlet?.name || order.outlet }}</span>
                    <span v-if="order.customer?.name || order.customer" class="text-navy-700 font-medium">
                      • {{ order.customer?.name || order.customer }}
                    </span>
                  </div>
                </div>

                <div class="text-right font-mono">
                  <div class="font-bold text-slate-900 text-sm tabular-nums">
                    {{ formatRupiah(order.grand_total) }}
                  </div>
                  <div class="text-[10px] uppercase font-semibold text-slate-500">
                    {{ order.payment_method }}
                  </div>
                </div>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Supervisor Security & Audit Logs -->
        <div id="audit">
          <AppCard
            title="Audit Log & Pengawasan Supervisor"
            subtitle="Rekaman verifikasi laci kasir, buka/tutup shift, dan audit keamanan"
          >
            <template #action>
              <AppBadge variant="navy">Security Trail</AppBadge>
            </template>

            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div
                v-for="log in auditLogs"
                :key="log.id"
                class="p-3.5 rounded-xl border border-slate-200/80 bg-white text-xs space-y-1 hover:border-slate-300 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-slate-900">
                    {{ formatActionLabel(log.action) }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">
                    {{ new Date(log.created_at).toLocaleTimeString('id-ID') }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-500">
                  Oleh: <strong class="text-slate-800">{{ log.user?.name || 'Sistem' }}</strong> ({{ log.user?.role || 'System' }})
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <!-- CRM Customer Directory Section -->
      <div id="crm">
        <AppCard
          title="CRM Customer Monitoring"
          subtitle="Database loyalitas pelanggan, perolehan poin WhatsApp, dan segmentasi belanja"
        >
          <template #action>
            <div class="w-full sm:w-72">
              <input
                v-model="customerSearch"
                @input="debouncedSearch"
                type="text"
                placeholder="Cari nama atau No. WhatsApp..."
                class="w-full px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700"
              />
            </div>
          </template>

          <AppTable>
            <template #header>
              <th class="px-5 py-3.5 text-left">Pelanggan</th>
              <th class="px-5 py-3.5 text-left">No. WhatsApp</th>
              <th class="px-5 py-3.5 text-left">Tier Loyalitas</th>
              <th class="px-5 py-3.5 text-right">Poin</th>
              <th class="px-5 py-3.5 text-right">Total Belanja</th>
              <th class="px-5 py-3.5 text-right">Kunjungan</th>
              <th class="px-5 py-3.5 text-right">Terakhir Hadir</th>
            </template>

            <tr v-if="customerList.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-500">
                <AppEmptyState
                  title="Tidak ada pelanggan"
                  description="Tidak ditemukan data pelanggan yang cocok dengan kata kunci pencarian Anda."
                />
              </td>
            </tr>

            <tr
              v-for="c in customerList"
              :key="c.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-5 py-3.5 font-semibold text-slate-900 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-navy-50 text-navy-700 font-bold text-xs flex items-center justify-center border border-navy-100 shrink-0">
                  {{ (c.name || 'P')[0].toUpperCase() }}
                </div>
                <span>{{ c.name }}</span>
              </td>
              <td class="px-5 py-3.5 font-mono text-slate-600 text-xs">
                {{ c.phone }}
              </td>
              <td class="px-5 py-3.5">
                <AppBadge :variant="getTierVariant(c.tier)" size="sm">
                  {{ c.tier }}
                </AppBadge>
              </td>
              <td class="px-5 py-3.5 text-right font-mono font-bold text-amber-700 tabular-nums">
                {{ c.loyalty_points }} Pts
              </td>
              <td class="px-5 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                {{ formatRupiah(c.total_spend) }}
              </td>
              <td class="px-5 py-3.5 text-right font-mono text-slate-600 tabular-nums">
                {{ c.visit_count }}x
              </td>
              <td class="px-5 py-3.5 text-right text-slate-500 text-xs font-mono">
                {{ c.last_visit_at || '-' }}
              </td>
            </tr>
          </AppTable>
        </AppCard>
      </div>
    </div>
  </AppLayout>
</template>
