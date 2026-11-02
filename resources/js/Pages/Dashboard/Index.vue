<template>
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
        <!-- Top Navigation -->
        <header class="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">
                    👑
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-sm font-bold text-white tracking-tight">HQ Central Monitoring</h1>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">Live Websocket</span>
                    </div>
                    <div class="text-[11px] text-slate-400">
                        {{ tenantName }} • <span class="text-slate-300">{{ userName }}</span> ({{ role }})
                    </div>
                </div>
            </div>

            <!-- Header Status & Actions -->
            <div class="flex items-center gap-3">
                <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-slate-300 font-medium">Live Feed Terhubung</span>
                    <span class="text-slate-500 text-[10px] font-mono">({{ pollSeconds }}s)</span>
                </div>

                <a
                    href="/pos"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-sm"
                >
                    🛒 Terminal Kasir
                </a>

                <form action="/logout" method="POST" class="inline">
                    <input type="hidden" name="_token" :value="csrfToken">
                    <button
                        type="submit"
                        class="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                        Keluar
                    </button>
                </form>
            </div>
        </header>

        <!-- Main Dashboard Container -->
        <main class="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
            <!-- Financial KPI Cards Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Omzet Hari Ini Landmark -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span class="font-semibold text-slate-300">Omzet Hari Ini</span>
                        <span class="text-base">💰</span>
                    </div>
                    <div class="text-2xl font-bold font-mono text-white tracking-tight">
                        {{ formatRupiah(summary.revenue) }}
                    </div>
                    <div class="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <span>Gross: {{ formatRupiah(summary.gross_sales || summary.revenue) }}</span>
                    </div>
                </div>

                <!-- Laba Kotor & Margin -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg group hover:border-teal-500/40 transition">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span class="font-semibold text-slate-300">Estimasi Laba Kotor (HPP)</span>
                        <span class="text-base">📈</span>
                    </div>
                    <div class="text-2xl font-bold font-mono text-teal-400 tracking-tight">
                        {{ formatRupiah(summary.gross_profit || 0) }}
                    </div>
                    <div class="mt-2 text-[11px] text-slate-400 font-mono">
                        Margin: <strong class="text-teal-300">{{ summary.profit_margin || 0 }}%</strong> setelah HPP
                    </div>
                </div>

                <!-- Total Transaksi & AOV -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg group hover:border-cyan-500/40 transition">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span class="font-semibold text-slate-300">Total Transaksi</span>
                        <span class="text-base">🧾</span>
                    </div>
                    <div class="text-2xl font-bold font-mono text-cyan-400 tracking-tight">
                        {{ summary.transactions }} <span class="text-sm font-normal text-slate-400">struk</span>
                    </div>
                    <div class="mt-2 text-[11px] text-slate-400 font-mono">
                        AOV: <strong class="text-slate-200">{{ formatRupiah(summary.aov) }}</strong> / transaksi
                    </div>
                </div>

                <!-- Shift & Outlet Active Status -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg group hover:border-indigo-500/40 transition">
                    <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
                        <span class="font-semibold text-slate-300">Outlet & Shift Operasional</span>
                        <span class="text-base">🏪</span>
                    </div>
                    <div class="text-2xl font-bold font-mono text-indigo-300 tracking-tight">
                        {{ outlets.length }} <span class="text-sm font-normal text-slate-400">Cabang</span>
                    </div>
                    <div class="mt-2 text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{{ summary.open_shifts || 1 }} Kasir Sedang Buka Shift</span>
                    </div>
                </div>
            </div>

            <!-- Middle Section: Performa Outlet & Top Products -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Performa Outlet Landmark -->
                <div class="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-sm font-bold text-white tracking-tight">Performa Outlet</h2>
                            <p class="text-xs text-slate-400">Komparasi omzet dan total transaksi antar cabang secara live</p>
                        </div>
                        <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Multi-Branch</span>
                    </div>

                    <div class="space-y-3">
                        <div
                            v-for="outlet in outlets"
                            :key="outlet.outlet_id"
                            class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-emerald-400 text-sm">
                                    📍
                                </div>
                                <div>
                                    <div class="font-semibold text-sm text-white">{{ outlet.name }}</div>
                                    <div class="text-xs text-slate-400 font-mono mt-0.5">
                                        {{ outlet.transactions }} Transaksi • AOV {{ formatRupiah(outlet.aov || (outlet.transactions > 0 ? outlet.revenue / outlet.transactions : 0)) }}
                                    </div>
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="text-base font-bold font-mono text-emerald-400">
                                    {{ formatRupiah(outlet.revenue) }}
                                </div>
                                <div class="text-[10px] text-slate-500 font-mono">Total Omzet Hari Ini</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Top Products Leaderboard -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-sm font-bold text-white tracking-tight">Top Produk Terlaris</h2>
                        <span class="text-xs">🏆</span>
                    </div>

                    <div class="space-y-2.5">
                        <div
                            v-for="(prod, idx) in topProducts"
                            :key="prod.name"
                            class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                            <div class="flex items-center gap-2">
                                <span class="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                                    {{ idx + 1 }}
                                </span>
                                <div>
                                    <div class="font-medium text-white">{{ prod.name }}</div>
                                    <div class="text-[10px] text-slate-500">{{ prod.category }}</div>
                                </div>
                            </div>
                            <div class="text-right font-mono">
                                <div class="font-bold text-emerald-300">{{ prod.total_qty }} terjual</div>
                                <div class="text-[10px] text-slate-400">{{ formatRupiah(prod.total_revenue) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lower Section: Live Sales Ticker + Supervisor Audit Logs -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Live Sales Feed Landmark -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <h2 class="text-sm font-bold text-white tracking-tight">Live Sales</h2>
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        </div>
                        <span class="text-xs text-slate-400 font-mono">Auto-Refresh Realtime</span>
                    </div>

                    <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                        <div
                            v-for="order in liveOrders"
                            :key="order.id || order.invoice_number"
                            class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between hover:border-emerald-500/30 transition text-xs"
                        >
                            <div>
                                <div class="font-mono font-bold text-white">{{ order.invoice_number }}</div>
                                <div class="text-[11px] text-slate-400 mt-0.5">
                                    <span>{{ order.outlet?.name || order.outlet }}</span>
                                    <span v-if="order.customer?.name || order.customer" class="text-emerald-400/80"> • {{ order.customer?.name || order.customer }}</span>
                                </div>
                            </div>

                            <div class="text-right">
                                <div class="font-mono font-bold text-emerald-400 text-sm">
                                    {{ formatRupiah(order.grand_total) }}
                                </div>
                                <div class="text-[10px] font-mono uppercase text-slate-500">
                                    {{ order.payment_method }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Supervisor Security & Audit Logs -->
                <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-sm font-bold text-white tracking-tight">Audit Log & Pengawasan Supervisor</h2>
                        <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">Security</span>
                    </div>

                    <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
                        <div
                            v-for="log in auditLogs"
                            :key="log.id"
                            class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1"
                        >
                            <div class="flex items-center justify-between">
                                <span class="font-bold text-slate-200 capitalize">
                                    {{ formatActionLabel(log.action) }}
                                </span>
                                <span class="text-[10px] text-slate-500 font-mono">{{ new Date(log.created_at).toLocaleTimeString('id-ID') }}</span>
                            </div>
                            <div class="text-[11px] text-slate-400">
                                Dilakukan oleh: <strong class="text-slate-300">{{ log.user?.name || 'Sistem' }}</strong> ({{ log.user?.role || 'System' }})
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CRM Customer Monitoring Section Landmark -->
            <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 class="text-sm font-bold text-white tracking-tight">CRM Customer Monitoring</h2>
                        <p class="text-xs text-slate-400">Database loyalitas, perolehan poin WhatsApp, dan segmentasi belanja</p>
                    </div>

                    <!-- Search Box -->
                    <div class="relative w-full sm:w-72">
                        <input
                            v-model="customerSearch"
                            @input="debouncedSearch"
                            type="text"
                            placeholder="Cari nama atau No. WhatsApp..."
                            class="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <!-- Customer Table -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                            <tr>
                                <th class="p-3">Pelanggan</th>
                                <th class="p-3">No. WhatsApp</th>
                                <th class="p-3">Tier</th>
                                <th class="p-3 text-right">Poin Loyalitas</th>
                                <th class="p-3 text-right">Total Belanja</th>
                                <th class="p-3 text-right">Kunjungan</th>
                                <th class="p-3 text-right">Kunjungan Terakhir</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 font-medium">
                            <tr v-if="customerList.length === 0">
                                <td colspan="7" class="p-8 text-center text-slate-400">
                                    <div class="text-2xl mb-1">🔍</div>
                                    <div class="text-sm font-semibold text-slate-300">Tidak ada pelanggan</div>
                                    <div class="text-xs text-slate-500 mt-0.5">Tidak ditemukan data pelanggan yang cocok dengan pencarian</div>
                                </td>
                            </tr>
                            <tr v-for="c in customerList" :key="c.id" class="hover:bg-slate-950/40 transition">
                                <td class="p-3 font-semibold text-white">{{ c.name }}</td>
                                <td class="p-3 font-mono text-slate-300">{{ c.phone }}</td>
                                <td class="p-3">
                                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', tierColorClass(c.tier)]">
                                        {{ c.tier }}
                                    </span>
                                </td>
                                <td class="p-3 text-right font-mono font-bold text-amber-300">{{ c.loyalty_points }} Pts</td>
                                <td class="p-3 text-right font-mono text-emerald-400">{{ formatRupiah(c.total_spend) }}</td>
                                <td class="p-3 text-right font-mono text-slate-300">{{ c.visit_count }}x</td>
                                <td class="p-3 text-right text-slate-400">{{ c.last_visit_at || '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';

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

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const liveOrders = ref([...props.recentOrders]);
const customerList = ref([...props.customers]);
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
        router.get('/dashboard', { q: customerSearch.value }, { preserveState: true, preserveScroll: true, replace: true });
    }, 300);
}

function formatRupiah(val) {
    if (typeof val !== 'number') val = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function formatActionLabel(action) {
    const map = {
        'shift_open': 'Buka Shift Kasir',
        'shift_close': 'Tutup Shift Kasir (X/Z)',
        'shift_discrepancy': 'Selisih Kas Laci Kasir',
        'cash_movement': 'Pergerakan Kas Laci',
        'discount_applied': 'Penerapan Diskon Manual',
    };
    return map[action] || action;
}

function tierColorClass(tier) {
    if (tier === 'Platinum') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (tier === 'Gold') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-slate-700/60 text-slate-300 border-slate-600';
}
</script>
