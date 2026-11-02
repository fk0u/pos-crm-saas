<script setup>
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AppButton from '@/Components/AppButton.vue';
import AppBadge from '@/Components/AppBadge.vue';
import AppModal from '@/Components/AppModal.vue';
import AppInput from '@/Components/AppInput.vue';

const props = defineProps({
  cashierName: { type: String, default: 'Kasir' },
  userRole: { type: String, default: 'cashier' },
  outletId: { type: String, default: null },
  outletName: { type: String, default: 'Outlet Utama' },
  outlets: { type: Array, default: () => [] },
  initialProducts: { type: Array, default: () => [] },
  activeShift: { type: Object, default: null },
});

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

// Products & Filtering
const products = ref([...props.initialProducts]);
const searchQuery = ref('');
const selectedCategory = ref('Semua');

const categories = computed(() => {
  const list = ['Semua'];
  products.value.forEach(p => {
    if (p.category && !list.includes(p.category)) {
      list.push(p.category);
    }
  });
  return list;
});

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchCategory = selectedCategory.value === 'Semua' || p.category === selectedCategory.value;
    const q = searchQuery.value.toLowerCase().trim();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.barcode && p.barcode.includes(q));
    return matchCategory && matchQuery;
  });
});

// Cart state
const cart = ref([]);
const manualDiscount = ref(0);
const customerPhone = ref('');
const crmCustomer = ref(null);
const useLoyaltyPoints = ref(false);
const isLookingUp = ref(false);

function addToCart(product) {
  const existing = cart.value.find(item => item.product.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity++;
    }
  } else {
    cart.value.push({ product, quantity: 1 });
  }
}

function increaseQty(item) {
  if (item.quantity < item.product.stock) {
    item.quantity++;
  }
}

function decreaseQty(item) {
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    removeFromCart(item);
  }
}

function removeFromCart(item) {
  cart.value = cart.value.filter(i => i.product.id !== item.product.id);
}

// Calculations
const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);
});

const pointsDiscountAmount = computed(() => {
  if (!useLoyaltyPoints.value || !crmCustomer.value) return 0;
  return (crmCustomer.value.loyalty_points || 0) * 100;
});

const taxAmount = computed(() => {
  const base = Math.max(0, subtotal.value - (manualDiscount.value || 0) - pointsDiscountAmount.value);
  return Math.round(base * 0.10);
});

const grandTotal = computed(() => {
  const total = subtotal.value - (manualDiscount.value || 0) - pointsDiscountAmount.value + taxAmount.value;
  return Math.max(0, total);
});

const pointsEarned = computed(() => {
  return Math.floor(grandTotal.value / 10000);
});

// Payment Modal State
const showPaymentModal = ref(false);
const selectedPaymentMethod = ref('cash');
const cashTendered = ref(0);
const isProcessingCheckout = ref(false);
const completedOrder = ref(null);
const lastCartItems = ref([]);

const paymentMethods = [
  { id: 'cash', label: 'Tunai', icon: '💵' },
  { id: 'qris', label: 'QRIS', icon: '📱' },
  { id: 'debit', label: 'Debit EDC', icon: '💳' },
  { id: 'bank_transfer', label: 'Transfer', icon: '🏦' },
];

const changeDue = computed(() => {
  if (selectedPaymentMethod.value !== 'cash') return 0;
  return (cashTendered.value || 0) - grandTotal.value;
});

function openPaymentModal() {
  cashTendered.value = grandTotal.value;
  showPaymentModal.value = true;
}

// CRM Lookup
async function lookupCustomer() {
  if (!customerPhone.value.trim()) return;
  isLookingUp.value = true;
  try {
    const res = await fetch(`/api/v1/crm/customer/lookup?phone=${encodeURIComponent(customerPhone.value.trim())}`);
    const data = await res.json();
    if (data.success) {
      crmCustomer.value = data.data;
    } else {
      crmCustomer.value = {
        name: 'Pelanggan Baru',
        phone: customerPhone.value,
        loyalty_points: 0,
        tier: 'Silver',
        visit_count: 0,
      };
    }
  } catch {
    crmCustomer.value = {
      name: 'Pelanggan Baru',
      phone: customerPhone.value,
      loyalty_points: 0,
      tier: 'Silver',
      visit_count: 0,
    };
  } finally {
    isLookingUp.value = false;
  }
}

// Checkout Execution
async function processCheckout() {
  isProcessingCheckout.value = true;
  try {
    const payload = {
      outlet_id: props.outletId,
      items: cart.value.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
      customer_phone: customerPhone.value || null,
      customer_name: crmCustomer.value?.name || null,
      discount_amount: manualDiscount.value || 0,
      tax_amount: taxAmount.value,
      points_redeemed: useLoyaltyPoints.value && crmCustomer.value ? crmCustomer.value.loyalty_points : 0,
      payment_method: selectedPaymentMethod.value,
      cash_tendered: selectedPaymentMethod.value === 'cash' ? cashTendered.value : grandTotal.value,
    };

    const res = await fetch('/api/v1/pos/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      completedOrder.value = data.data;
      lastCartItems.value = [...cart.value];

      // Deduct local stock
      cart.value.forEach(item => {
        const p = products.value.find(prod => prod.id === item.product.id);
        if (p) p.stock = Math.max(0, p.stock - item.quantity);
      });

      // Reset cart
      cart.value = [];
      manualDiscount.value = 0;
      useLoyaltyPoints.value = false;
      customerPhone.value = '';
      crmCustomer.value = null;
      showPaymentModal.value = false;
    } else {
      alert(data.message || 'Gagal memproses transaksi.');
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi.');
  } finally {
    isProcessingCheckout.value = false;
  }
}

function closeReceiptModal() {
  completedOrder.value = null;
}

function printReceipt() {
  window.print();
}

function sendWhatsAppReceipt() {
  if (!completedOrder.value || !completedOrder.value.customer?.phone) {
    alert('Nomor WhatsApp pelanggan tidak tersedia.');
    return;
  }
  const phone = completedOrder.value.customer.phone.replace(/^0/, '62');
  const msg = encodeURIComponent(`Halo ${completedOrder.value.customer.name}, terima kasih telah berbelanja di Kopi Kawan! Nomor Invoice: ${completedOrder.value.invoice_number}. Total: ${formatRupiah(completedOrder.value.grand_total)}. Poin Anda sekarang: ${completedOrder.value.customer.loyalty_points} Poin.`);
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
}

// Shift Management State
const currentShift = ref(props.activeShift ? { ...props.activeShift } : null);
const showShiftModal = ref(false);
const shiftStartingCash = ref(100000);
const shiftActualCash = ref(null);

function openShiftDialog() {
  showShiftModal.value = true;
}

async function submitOpenShift() {
  try {
    const res = await fetch('/api/v1/pos/shift/open', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        outlet_id: props.outletId,
        starting_cash: shiftStartingCash.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      currentShift.value = data.data;
      showShiftModal.value = false;
    } else {
      alert(data.message);
    }
  } catch {
    alert('Gagal membuka shift.');
  }
}

async function submitCloseShift() {
  if (shiftActualCash.value === null) return;
  try {
    const res = await fetch('/api/v1/pos/shift/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        actual_ending_cash: shiftActualCash.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      currentShift.value = null;
      showShiftModal.value = false;
      alert('Shift kasir berhasil ditutup dan direkonsiliasi.');
    } else {
      alert(data.message);
    }
  } catch {
    alert('Gagal menutup shift.');
  }
}

// Cash Movement State
const showCashMovementModal = ref(false);
const cashMovementType = ref('cash_in');
const cashMovementAmount = ref(50000);
const cashMovementReason = ref('');

async function submitCashMovement() {
  try {
    const res = await fetch('/api/v1/pos/shift/movement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        type: cashMovementType.value,
        amount: cashMovementAmount.value,
        reason: cashMovementReason.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showCashMovementModal.value = false;
      cashMovementReason.value = '';
      alert('Pergerakan kas berhasil dicatat.');
    } else {
      alert(data.message);
    }
  } catch {
    alert('Gagal mencatat pergerakan kas.');
  }
}

function openSplitBillModal() {
  const half = Math.round(grandTotal.value / 2);
  alert(`Fitur Split Bill: Tagihan dibagi 2 orang @ ${formatRupiah(half)}`);
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
  <div class="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-sans select-none">
    <!-- Top Navigation Bar -->
    <header class="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      <div class="flex items-center gap-3">
        <Link href="/dashboard" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-xl bg-navy-700 text-white font-bold text-base flex items-center justify-center shadow-xs">
            O
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-900 tracking-tight">Omnipoint POS</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded font-mono bg-navy-50 text-navy-700 font-semibold border border-navy-200/60">Fast Checkout</span>
            </div>
            <div class="text-xs text-slate-500 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="font-medium text-slate-700">{{ outletName }}</span>
              <span>•</span>
              <span>Kasir: <strong class="text-slate-900">{{ cashierName }}</strong></span>
            </div>
          </div>
        </Link>
      </div>

      <!-- Header Shift & Nav Controls -->
      <div class="flex items-center gap-2.5">
        <!-- Shift Status Button -->
        <button
          type="button"
          @click="openShiftDialog"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer min-h-[38px]"
          :class="currentShift
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'"
        >
          <span class="w-2 h-2 rounded-full animate-pulse" :class="currentShift ? 'bg-emerald-500' : 'bg-amber-500'"></span>
          <span>{{ currentShift ? 'Shift Aktif' : 'Buka Shift Kasir' }}</span>
        </button>

        <!-- Drawer Movement (Cash in/out) -->
        <button
          v-if="currentShift"
          type="button"
          @click="showCashMovementModal = true"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors min-h-[38px] cursor-pointer"
          title="Catat Kas Masuk/Keluar"
        >
          💵 Kas Laci
        </button>

        <!-- Link to Owner Dashboard if permitted -->
        <Link
          v-if="userRole !== 'cashier'"
          href="/dashboard"
          class="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200/70 transition-colors min-h-[38px]"
        >
          📊 HQ Dashboard
        </Link>

        <!-- Logout -->
        <form action="/logout" method="POST" class="inline">
          <input type="hidden" name="_token" :value="csrfToken">
          <button
            type="submit"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[38px] cursor-pointer"
          >
            Keluar
          </button>
        </form>
      </div>
    </header>

    <!-- Main POS Body: Catalog (Left) + Cart Sidebar (Right) -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Catalog Section (Left) -->
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50 p-4 sm:p-5 overflow-hidden">
        <!-- Search Bar & Category Filter Pills -->
        <div class="space-y-3 mb-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <span class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="Cari nama produk, SKU, atau scan barcode..."
                class="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700 transition shadow-2xs min-h-[44px]"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <!-- Auto-Barcode Pill -->
            <div class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 font-mono min-h-[44px]">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>BARCODE AUTO</span>
            </div>
          </div>

          <!-- Category Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              @click="selectedCategory = cat"
              class="px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer min-h-[40px]"
              :class="selectedCategory === cat
                ? 'bg-navy-700 text-white font-semibold shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Product Grid (Touch-friendly cards) -->
        <div class="flex-1 overflow-y-auto pr-1">
          <div v-if="filteredProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div class="text-3xl mb-2">📦</div>
            <p class="text-sm font-medium text-slate-600">Tidak ada produk yang cocok dengan pencarian.</p>
            <p class="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih kategori Semua.</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
            <button
              v-for="prod in filteredProducts"
              :key="prod.id"
              type="button"
              @click="addToCart(prod)"
              :disabled="prod.stock <= 0"
              class="group relative bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-navy-300 rounded-xl p-3.5 flex flex-col text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs hover:shadow-sm min-h-[148px] cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {{ prod.category }}
                </span>
                <span
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
                  :class="prod.stock > 10
                    ? 'text-emerald-700 bg-emerald-50'
                    : prod.stock > 0
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-rose-700 bg-rose-50'"
                >
                  Stok {{ prod.stock }}
                </span>
              </div>

              <div class="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-navy-700 transition line-clamp-2 mb-1">
                {{ prod.name }}
              </div>

              <div class="text-[11px] text-slate-400 font-mono mb-2">
                SKU: {{ prod.sku }}
              </div>

              <div class="mt-auto pt-2.5 flex items-center justify-between border-t border-slate-100">
                <span class="font-bold text-xs sm:text-sm text-slate-900 font-mono tabular-nums">
                  {{ formatRupiah(prod.selling_price) }}
                </span>
                <span class="w-7 h-7 rounded-lg bg-navy-50 text-navy-700 group-hover:bg-navy-700 group-hover:text-white flex items-center justify-center font-bold text-sm transition-colors">
                  +
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>

      <!-- Cart & Checkout Sidebar (Right) -->
      <aside class="w-96 lg:w-[420px] bg-white border-l border-slate-200/90 flex flex-col shrink-0 overflow-hidden shadow-xs">
        <!-- Customer CRM Section -->
        <div class="p-4 border-b border-slate-200/80 bg-slate-50/50">
          <div class="flex items-center justify-between mb-2">
            <label for="customerPhoneInput" class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span>💬</span>
              <span>No. WhatsApp Pelanggan</span>
            </label>
            <AppBadge v-if="crmCustomer" variant="amber" size="sm">
              {{ crmCustomer.tier }} Member
            </AppBadge>
          </div>

          <div class="flex gap-2">
            <input
              id="customerPhoneInput"
              v-model="customerPhone"
              @keyup.enter="lookupCustomer"
              type="text"
              placeholder="08123456789 (Enter utk lookup)"
              class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700 min-h-[38px]"
            />
            <button
              type="button"
              @click="lookupCustomer"
              :disabled="isLookingUp"
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors min-h-[38px] cursor-pointer"
            >
              {{ isLookingUp ? '...' : 'Cek' }}
            </button>
          </div>

          <!-- Customer Detail Strip -->
          <div v-if="crmCustomer" class="mt-2.5 p-2.5 rounded-lg bg-navy-50/70 border border-navy-100 flex items-center justify-between text-xs">
            <div>
              <div class="font-semibold text-navy-900">{{ crmCustomer.name }}</div>
              <div class="text-[11px] text-slate-500">Total Kunjungan: {{ crmCustomer.visit_count }}x</div>
            </div>
            <div class="text-right">
              <div class="font-mono font-bold text-amber-700">{{ crmCustomer.loyalty_points }} Pts</div>
              <label v-if="crmCustomer.loyalty_points > 0" class="text-[11px] text-navy-700 font-medium flex items-center gap-1 cursor-pointer">
                <input v-model="useLoyaltyPoints" type="checkbox" class="rounded text-navy-700 focus:ring-navy-300 h-3.5 w-3.5">
                <span>Tukarkan (-{{ formatRupiah(pointsDiscountAmount) }})</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div class="text-4xl mb-2 opacity-50">🛒</div>
            <p class="text-xs font-medium text-slate-600">Keranjang masih kosong.</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Pilih menu dari katalog di sebelah kiri.</p>
          </div>

          <div
            v-for="item in cart"
            :key="item.product.id"
            class="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 transition-colors shadow-2xs hover:border-slate-300"
          >
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-xs text-slate-900 truncate">{{ item.product.name }}</div>
              <div class="text-[11px] font-mono text-slate-500 mt-0.5">
                {{ formatRupiah(item.product.selling_price) }}
              </div>
            </div>

            <!-- Stepper -->
            <div class="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                @click="decreaseQty(item)"
                class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded bg-white hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer active:scale-95"
              >
                -
              </button>
              <span class="w-7 text-center font-mono text-xs font-semibold text-slate-900 tabular-nums">
                {{ item.quantity }}
              </span>
              <button
                type="button"
                @click="increaseQty(item)"
                :disabled="item.quantity >= item.product.stock"
                class="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 rounded bg-white hover:bg-slate-50 text-xs font-bold shadow-2xs disabled:opacity-30 cursor-pointer active:scale-95"
              >
                +
              </button>
            </div>

            <div class="text-right min-w-[70px]">
              <div class="font-mono text-xs font-bold text-slate-900 tabular-nums">
                {{ formatRupiah(item.product.selling_price * item.quantity) }}
              </div>
              <button
                type="button"
                @click="removeFromCart(item)"
                class="text-[11px] text-rose-600 hover:text-rose-800 font-medium mt-0.5 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary & Actions -->
        <div class="p-4 bg-slate-50/80 border-t border-slate-200 shrink-0 space-y-3">
          <div class="space-y-1.5 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-mono font-medium text-slate-900 tabular-nums">{{ formatRupiah(subtotal) }}</span>
            </div>
            <div v-if="pointsDiscountAmount > 0" class="flex justify-between text-emerald-700 font-medium">
              <span>Potongan Poin CRM</span>
              <span class="font-mono tabular-nums">-{{ formatRupiah(pointsDiscountAmount) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Diskon Manual</span>
              <div class="flex items-center gap-1 w-28">
                <span class="text-[10px] text-slate-400">Rp</span>
                <input
                  v-model.number="manualDiscount"
                  type="number"
                  min="0"
                  class="w-full text-right bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-navy-700"
                />
              </div>
            </div>
            <div class="flex justify-between">
              <span>Pajak Resto (PB1 10%)</span>
              <span class="font-mono text-slate-700 tabular-nums">{{ formatRupiah(taxAmount) }}</span>
            </div>
          </div>

          <div class="pt-2.5 border-t border-slate-200 flex items-baseline justify-between">
            <div>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
              <div class="text-[11px] text-emerald-700 font-mono">Poin Didapat: +{{ pointsEarned }}</div>
            </div>
            <div class="text-2xl font-bold font-mono text-navy-900 tracking-tight tabular-nums">
              {{ formatRupiah(grandTotal) }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              @click="openSplitBillModal"
              :disabled="cart.length === 0"
              class="col-span-1 py-3 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors min-h-[48px] cursor-pointer"
            >
              Split Bill
            </button>

            <button
              type="button"
              @click="openPaymentModal"
              :disabled="cart.length === 0"
              class="col-span-2 py-3 px-4 bg-navy-700 hover:bg-navy-800 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition-colors min-h-[48px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Proses Pembayaran</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Payment Modal -->
    <AppModal
      :show="showPaymentModal"
      title="Pilih Metode Pembayaran"
      max-width="lg"
      @close="showPaymentModal = false"
    >
      <div class="space-y-4">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-medium">Total Tagihan:</span>
          <span class="text-lg font-bold font-mono text-navy-900 tabular-nums">{{ formatRupiah(grandTotal) }}</span>
        </div>

        <!-- Payment Methods Grid -->
        <div class="grid grid-cols-4 gap-2">
          <button
            type="button"
            v-for="pm in paymentMethods"
            :key="pm.id"
            @click="selectedPaymentMethod = pm.id"
            class="p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer min-h-[64px]"
            :class="selectedPaymentMethod === pm.id
              ? 'bg-navy-50 border-navy-300 text-navy-800 font-semibold shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
          >
            <span class="text-xl">{{ pm.icon }}</span>
            <span class="text-xs">{{ pm.label }}</span>
          </button>
        </div>

        <!-- Cash Tender Input & Quick Nominal Buttons -->
        <div v-if="selectedPaymentMethod === 'cash'" class="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Uang Diterima (Cash Tendered)</label>
            <input
              v-model.number="cashTendered"
              type="number"
              min="0"
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700"
              placeholder="0"
            />
          </div>

          <!-- Quick Cash Chips -->
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              @click="cashTendered = grandTotal"
              class="px-3 py-1.5 text-xs font-mono rounded-lg bg-white hover:bg-slate-100 text-navy-700 border border-slate-300 font-semibold cursor-pointer"
            >
              Uang Pas
            </button>
            <button
              v-for="amt in [20000, 50000, 100000, 150000, 200000]"
              :key="amt"
              type="button"
              @click="cashTendered = amt"
              class="px-3 py-1.5 text-xs font-mono rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer"
            >
              {{ formatRupiah(amt) }}
            </button>
          </div>

          <!-- Kembalian Display Landmark -->
          <div class="pt-2.5 border-t border-slate-200 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-600">Kembalian</span>
            <span class="text-lg font-bold font-mono tabular-nums" :class="changeDue >= 0 ? 'text-emerald-700' : 'text-rose-600'">
              {{ formatRupiah(Math.max(0, changeDue)) }}
            </span>
          </div>
        </div>

        <!-- QRIS Dynamic Display -->
        <div v-else-if="selectedPaymentMethod === 'qris'" class="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center">
          <div class="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3 flex items-center justify-center">
            <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="25" height="25"/>
              <rect x="65" y="10" width="25" height="25"/>
              <rect x="10" y="65" width="25" height="25"/>
              <rect x="15" y="15" width="15" height="15" fill="white"/>
              <rect x="70" y="15" width="15" height="15" fill="white"/>
              <rect x="15" y="70" width="15" height="15" fill="white"/>
              <rect x="42" y="10" width="16" height="16"/>
              <rect x="42" y="42" width="16" height="16"/>
              <rect x="42" y="70" width="16" height="20"/>
              <rect x="70" y="45" width="20" height="20"/>
            </svg>
          </div>
          <div class="text-xs font-semibold text-slate-800">Scan QRIS Dinamis (GoPay, OVO, ShopeePay, Dana, BCA)</div>
          <div class="text-[11px] text-slate-500 font-mono mt-1">NMID: ID1020261102998 • Verifikasi Instan</div>
        </div>
      </div>

      <template #footer>
        <AppButton variant="outline" size="md" @click="showPaymentModal = false">
          Batal
        </AppButton>
        <AppButton
          variant="primary"
          size="md"
          :disabled="isProcessingCheckout || (selectedPaymentMethod === 'cash' && changeDue < 0)"
          :loading="isProcessingCheckout"
          @click="processCheckout"
        >
          Konfirmasi & Selesaikan Transaksi
        </AppButton>
      </template>
    </AppModal>

    <!-- Receipt & Success Modal -->
    <AppModal
      :show="!!completedOrder"
      title="Transaksi Selesai"
      max-width="sm"
      @close="closeReceiptModal"
    >
      <div v-if="completedOrder" class="space-y-4">
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-2 border border-emerald-200">
            ✓
          </div>
          <h3 class="text-base font-bold text-slate-900">Transaksi Berhasil!</h3>
          <p class="text-xs text-slate-500 font-mono">{{ completedOrder.invoice_number }}</p>
        </div>

        <!-- Thermal Receipt Card Simulation -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs space-y-2">
          <div class="text-center border-b border-dashed border-slate-300 pb-2">
            <div class="font-bold text-sm">KOPI KAWAN INDONESIA</div>
            <div class="text-[11px] text-slate-600">{{ outletName }}</div>
            <div class="text-[10px] text-slate-400">{{ new Date().toLocaleString('id-ID') }}</div>
          </div>

          <div class="space-y-1 py-1 border-b border-dashed border-slate-300 text-[11px]">
            <div v-for="item in lastCartItems" :key="item.product.id" class="flex justify-between">
              <span>{{ item.quantity }}x {{ item.product.name }}</span>
              <span>{{ formatRupiah(item.product.selling_price * item.quantity) }}</span>
            </div>
          </div>

          <div class="space-y-0.5 text-[11px]">
            <div class="flex justify-between font-bold text-xs pt-1">
              <span>TOTAL</span>
              <span>{{ formatRupiah(completedOrder.grand_total) }}</span>
            </div>
            <div v-if="completedOrder.cash_tendered" class="flex justify-between text-slate-600">
              <span>TUNAI</span>
              <span>{{ formatRupiah(completedOrder.cash_tendered) }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>KEMBALIAN</span>
              <span>{{ formatRupiah(completedOrder.change_due) }}</span>
            </div>
          </div>

          <div v-if="completedOrder.customer" class="pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-600 text-center">
            Member: {{ completedOrder.customer.name }} ({{ completedOrder.customer.tier }})<br>
            Poin Didapat: +{{ completedOrder.points_earned }} Poin
          </div>
        </div>

        <div class="space-y-2 pt-1">
          <AppButton variant="primary" size="md" class="w-full" @click="printReceipt">
            🖨️ Cetak Struk Thermal
          </AppButton>
          <AppButton variant="secondary" size="md" class="w-full" @click="sendWhatsAppReceipt">
            💬 Kirim E-Struk via WhatsApp
          </AppButton>
          <AppButton variant="ghost" size="md" class="w-full" @click="closeReceiptModal">
            Tutup (Esc)
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- Shift Modal (Open / Close) -->
    <AppModal
      :show="showShiftModal"
      :title="currentShift ? 'Tutup Shift Kasir (Laporan X/Z)' : 'Buka Shift Baru Kasir'"
      max-width="md"
      @close="showShiftModal = false"
    >
      <div v-if="!currentShift" class="space-y-4">
        <p class="text-xs text-slate-500">
          Masukkan modal kas awal (cash float) yang tersedia di laci kasir sebelum membuka shift.
        </p>
        <AppInput
          v-model.number="shiftStartingCash"
          type="number"
          label="Modal Awal Laci Kasir (Rp)"
          monospace
          required
        />
        <AppButton variant="primary" size="md" class="w-full" @click="submitOpenShift">
          Buka Shift Sekarang
        </AppButton>
      </div>

      <div v-else class="space-y-4">
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
          <div class="flex justify-between"><span>Modal Awal:</span><span>{{ formatRupiah(currentShift.starting_cash) }}</span></div>
          <div class="flex justify-between text-emerald-700"><span>Penjualan Tunai:</span><span>{{ formatRupiah(currentShift.cash_sales_total) }}</span></div>
          <div class="flex justify-between text-sky-700"><span>Penjualan Non-Tunai:</span><span>{{ formatRupiah(currentShift.non_cash_sales_total) }}</span></div>
          <div class="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
            <span>Estimasi Kas di Laci:</span>
            <span>{{ formatRupiah(currentShift.expected_ending_cash) }}</span>
          </div>
        </div>

        <AppInput
          v-model.number="shiftActualCash"
          type="number"
          label="Uang Fisik Aktual di Laci (Blind Count)"
          placeholder="Hitung uang tunai di laci..."
          monospace
          required
        />

        <div v-if="shiftActualCash !== null" class="flex justify-between text-xs font-mono p-3 rounded-lg bg-slate-50 border border-slate-200">
          <span class="text-slate-600">Selisih Kas:</span>
          <span :class="shiftActualCash - currentShift.expected_ending_cash === 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'">
            {{ formatRupiah(shiftActualCash - currentShift.expected_ending_cash) }}
          </span>
        </div>

        <AppButton variant="danger" size="md" class="w-full" @click="submitCloseShift">
          Tutup Shift & Rekap X/Z
        </AppButton>
      </div>
    </AppModal>

    <!-- Cash Movement Drawer Modal -->
    <AppModal
      :show="showCashMovementModal"
      title="Pergerakan Kas Laci Kasir"
      max-width="md"
      @close="showCashMovementModal = false"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="cashMovementType = 'cash_in'"
            class="py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
            :class="cashMovementType === 'cash_in'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600'"
          >
            + Kas Masuk
          </button>
          <button
            type="button"
            @click="cashMovementType = 'cash_out'"
            class="py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
            :class="cashMovementType === 'cash_out'
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-white border-slate-200 text-slate-600'"
          >
            - Kas Keluar
          </button>
        </div>

        <AppInput
          v-model.number="cashMovementAmount"
          type="number"
          label="Nominal (Rp)"
          monospace
          required
        />

        <AppInput
          v-model="cashMovementReason"
          type="text"
          label="Keterangan / Alasan"
          placeholder="Contoh: Tambah modal kembalian / Beli es batu"
          required
        />

        <AppButton variant="primary" size="md" class="w-full" @click="submitCashMovement">
          Simpan Pergerakan Kas
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
