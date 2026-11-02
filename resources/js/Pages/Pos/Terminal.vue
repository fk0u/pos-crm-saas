<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
const searchInputRef = ref(null);

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

// Native Web Audio Haptic Feedback
function playHapticBeep(frequency = 880, duration = 0.05, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // quiet fallback
  }
}

function playSuccessChime() {
  try {
    playHapticBeep(523.25, 0.08); // C5
    setTimeout(() => playHapticBeep(659.25, 0.08), 80); // E5
    setTimeout(() => playHapticBeep(783.99, 0.16), 160); // G5
  } catch {}
}

function addToCart(product) {
  playHapticBeep(920, 0.04);
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
  playHapticBeep(980, 0.04);
  if (item.quantity < item.product.stock) {
    item.quantity++;
  }
}

function decreaseQty(item) {
  playHapticBeep(700, 0.04);
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    removeFromCart(item);
  }
}

function removeFromCart(item) {
  playHapticBeep(600, 0.05);
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

// Real looks tender details (tanpa payment gateway)
const qrisVerified = ref(true);
const qrisRrnNumber = ref('');
const selectedEdcBank = ref('BCA');
const edcApprovalCode = ref('');
const copiedAccountNotice = ref(false);

const paymentMethods = [
  { id: 'cash', label: 'Tunai', iconType: 'cash' },
  { id: 'qris', label: 'QRIS', iconType: 'qris' },
  { id: 'debit', label: 'Debit EDC', iconType: 'card' },
  { id: 'bank_transfer', label: 'Transfer', iconType: 'bank' },
];

const changeDue = computed(() => {
  if (selectedPaymentMethod.value !== 'cash') return 0;
  return (cashTendered.value || 0) - grandTotal.value;
});

function openPaymentModal() {
  cashTendered.value = grandTotal.value;
  qrisVerified.value = true;
  qrisRrnNumber.value = '';
  edcApprovalCode.value = '';
  showPaymentModal.value = true;
}

function copyStoreAccount() {
  navigator.clipboard?.writeText('8901234567');
  copiedAccountNotice.value = true;
  setTimeout(() => { copiedAccountNotice.value = false; }, 3000);
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
  if (selectedPaymentMethod.value === 'qris' && !qrisVerified.value) {
    alert('Mohon centang verifikasi bahwa Anda telah melihat bukti bayar di HP pembeli.');
    return;
  }

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
      playSuccessChime();
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
  } catch {
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
  if (!completedOrder.value) return;
  const phone = customerPhone.value || (completedOrder.value.customer ? completedOrder.value.customer.phone : '');
  if (!phone) {
    alert('Nomor WhatsApp pelanggan belum dimasukkan.');
    return;
  }
  const cleanPhone = phone.replace(/^0/, '62');
  const msg = encodeURIComponent(
    `Terima kasih telah berbelanja di *Kopi Kawan Indonesia*!\n` +
    `No. Invoice: ${completedOrder.value.invoice_number}\n` +
    `Total: ${formatRupiah(completedOrder.value.grand_total)}\n` +
    `Status: LUNAS (${completedOrder.value.payment_method})\n` +
    `Semoga harimu menyenangkan!`
  );
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
}

// Fullscreen Kiosk Mode
const isFullscreen = ref(false);
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    isFullscreen.value = true;
  } else {
    document.exitFullscreen?.().catch(() => {});
    isFullscreen.value = false;
  }
}

// Keyboard shortcuts for POS Cashiers
function handleKeyDown(e) {
  if (e.key === 'F1') {
    e.preventDefault();
    searchInputRef.value?.focus();
  } else if (e.key === 'F4' || (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA')) {
    if (cart.value.length > 0 && !showPaymentModal.value && !completedOrder.value) {
      e.preventDefault();
      openPaymentModal();
    }
  } else if (e.key === 'F8') {
    e.preventDefault();
    openShiftDialog();
  } else if (e.key === 'Escape') {
    if (showPaymentModal.value) showPaymentModal.value = false;
    if (showShiftModal.value) showShiftModal.value = false;
    if (showCashMovementModal.value) showCashMovementModal.value = false;
    if (completedOrder.value) closeReceiptModal();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Shift & Cash Register Control
const currentShift = ref(props.activeShift);
const showShiftModal = ref(false);
const showCashMovementModal = ref(false);
const shiftStartingCash = ref(100000);
const cashDrawerPhysicalActual = ref(0);
const shiftNotes = ref('');
const movementType = ref('in');
const movementAmount = ref(50000);
const movementReason = ref('Uang Kembalian Pecahan');

function openShiftDialog() {
  showShiftModal.value = true;
  if (currentShift.value) {
    cashDrawerPhysicalActual.value = (currentShift.value.starting_cash || 0) + (currentShift.value.cash_sales_total || 0);
  }
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
      alert(data.message || 'Gagal membuka shift.');
    }
  } catch {
    alert('Terjadi kesalahan membuka shift.');
  }
}

async function submitCloseShift() {
  try {
    const res = await fetch('/api/v1/pos/shift/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        shift_id: currentShift.value.id,
        actual_cash: cashDrawerPhysicalActual.value,
        notes: shiftNotes.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      currentShift.value = null;
      showShiftModal.value = false;
      alert(`Shift kasir berhasil ditutup (Laporan Z tercatat).`);
    } else {
      alert(data.message || 'Gagal menutup shift.');
    }
  } catch {
    alert('Terjadi kesalahan menutup shift.');
  }
}

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
        shift_id: currentShift.value.id,
        type: movementType.value,
        amount: movementAmount.value,
        reason: movementReason.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showCashMovementModal.value = false;
      alert(`Kas ${movementType.value === 'in' ? 'masuk' : 'keluar'} berhasil dicatat.`);
    } else {
      alert(data.message || 'Gagal mencatat kas.');
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
  <div class="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden font-sans select-none antialiased">
    <!-- Top Navigation Bar (Native App Style) -->
    <header class="h-14 sm:h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-xs">
      <div class="flex items-center gap-3">
        <Link href="/dashboard" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-navy-800 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-xs">
            O
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-900 tracking-tight">Omnipoint POS</span>
              <span class="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono bg-navy-50 text-navy-800 font-semibold border border-navy-200/60">
                Native Terminal
              </span>
            </div>
            <div class="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span class="font-medium text-slate-700">{{ outletName }}</span>
              <span>•</span>
              <span>Kasir: <strong class="text-slate-900">{{ cashierName }}</strong></span>
            </div>
          </div>
        </Link>
      </div>

      <!-- Header Shift & Nav Controls (No emojis, crisp SVG icons) -->
      <div class="flex items-center gap-2">
        <!-- Fullscreen Kiosk Mode Toggle -->
        <button
          type="button"
          @click="toggleFullscreen"
          class="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[38px] cursor-pointer"
          :title="isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Kiosk)'"
        >
          <svg v-if="!isFullscreen" class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <svg v-else class="w-4 h-4 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span class="hidden lg:inline">{{ isFullscreen ? 'Keluar Kiosk' : 'Layar Penuh' }}</span>
        </button>

        <!-- Shift Status Button -->
        <button
          type="button"
          @click="openShiftDialog"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer min-h-[38px] active:scale-[0.98]"
          :class="currentShift
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'"
        >
          <span class="w-2 h-2 rounded-full animate-pulse" :class="currentShift ? 'bg-emerald-500' : 'bg-amber-500'"></span>
          <span>{{ currentShift ? 'Shift Aktif' : 'Buka Shift' }}</span>
          <kbd class="hidden xl:inline text-[9px] px-1 py-0.5 rounded bg-white/70 border border-current font-mono">F8</kbd>
        </button>

        <!-- Drawer Movement (Cash in/out) -->
        <button
          v-if="currentShift"
          type="button"
          @click="showCashMovementModal = true"
          class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors min-h-[38px] cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
          title="Catat Kas Masuk/Keluar"
        >
          <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="hidden sm:inline">Kas Laci</span>
        </button>

        <!-- Link to Owner Dashboard if permitted -->
        <Link
          v-if="userRole !== 'cashier'"
          href="/dashboard"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200/70 transition-colors min-h-[38px] active:scale-[0.98]"
        >
          <svg class="w-4 h-4 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span>HQ Dashboard</span>
        </Link>

        <!-- Logout -->
        <form action="/logout" method="POST" class="inline">
          <input type="hidden" name="_token" :value="csrfToken">
          <button
            type="submit"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100 border border-slate-200 transition-colors min-h-[38px] cursor-pointer flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </form>
      </div>
    </header>

    <!-- Main POS Body: Catalog (Left) + Cart Sidebar (Right) -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Catalog Section (Left) -->
      <main class="flex-1 flex flex-col min-w-0 bg-slate-50 p-3 sm:p-5 overflow-hidden">
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
                placeholder="Cari nama produk, SKU, barcode (Tekan F1)..."
                class="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700 transition shadow-2xs min-h-[44px]"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Auto-Barcode Pill -->
            <div class="hidden md:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 font-mono">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Scanner Siap</span>
            </div>
          </div>

          <!-- Category Segmented Control Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              @click="selectedCategory = cat"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer min-h-[36px] active:scale-[0.98]"
              :class="selectedCategory === cat
                ? 'bg-navy-800 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- Product Grid (Touch-friendly cards with active feedback) -->
        <div class="flex-1 overflow-y-auto pr-1">
          <div v-if="filteredProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-700">Tidak ada produk yang cocok</p>
            <p class="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih kategori Semua.</p>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <button
              v-for="prod in filteredProducts"
              :key="prod.id"
              type="button"
              @click="addToCart(prod)"
              :disabled="prod.stock <= 0"
              class="group relative bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-navy-400 rounded-2xl p-3.5 flex flex-col text-left transition-all duration-100 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs hover:shadow-xs min-h-[148px] cursor-pointer"
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

              <div class="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-navy-800 transition line-clamp-2 mb-1">
                {{ prod.name }}
              </div>

              <div class="text-[11px] text-slate-400 font-mono mb-2">
                SKU: {{ prod.sku }}
              </div>

              <div class="mt-auto pt-2.5 flex items-center justify-between border-t border-slate-100">
                <span class="font-bold text-xs sm:text-sm text-slate-900 font-mono tabular-nums">
                  {{ formatRupiah(prod.selling_price) }}
                </span>
                <span class="w-7 h-7 rounded-xl bg-navy-50 text-navy-700 group-hover:bg-navy-800 group-hover:text-white flex items-center justify-center font-bold text-sm transition-colors shadow-2xs">
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
        <div class="p-3.5 border-b border-slate-200/80 bg-slate-50/60">
          <div class="flex items-center justify-between mb-2">
            <label for="customerPhoneInput" class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Member CRM (WhatsApp)</span>
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
              class="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700 min-h-[38px]"
            />
            <button
              type="button"
              @click="lookupCustomer"
              :disabled="isLookingUp"
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors min-h-[38px] cursor-pointer"
            >
              {{ isLookingUp ? '...' : 'Cek' }}
            </button>
          </div>

          <!-- Customer Detail Strip -->
          <div v-if="crmCustomer" class="mt-2.5 p-2.5 rounded-xl bg-navy-50/70 border border-navy-100 flex items-center justify-between text-xs">
            <div>
              <div class="font-bold text-navy-900">{{ crmCustomer.name }}</div>
              <div class="text-[11px] text-slate-500">Kunjungan: {{ crmCustomer.visit_count }}x</div>
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
        <div class="flex-1 overflow-y-auto p-3.5 space-y-2">
          <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-400 py-12">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2 border border-slate-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-slate-600">Keranjang masih kosong</p>
            <p class="text-[11px] text-slate-400 mt-0.5">Pilih menu dari katalog di sebelah kiri.</p>
          </div>

          <div
            v-for="item in cart"
            :key="item.product.id"
            class="bg-white border border-slate-200/90 rounded-2xl p-3 flex items-center gap-3 transition-colors shadow-2xs hover:border-slate-300"
          >
            <div class="flex-1 min-w-0">
              <div class="font-bold text-xs text-slate-900 truncate">
                {{ item.product.name }}
              </div>
              <div class="text-[11px] text-slate-400 font-mono mt-0.5">
                @ {{ formatRupiah(item.product.selling_price) }}
              </div>
            </div>

            <!-- Stepper controls -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                @click="decreaseQty(item)"
                class="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition shadow-2xs cursor-pointer active:scale-95"
              >
                -
              </button>
              <span class="w-8 text-center text-xs font-mono font-bold text-slate-900">
                {{ item.quantity }}
              </span>
              <button
                type="button"
                @click="increaseQty(item)"
                :disabled="item.quantity >= item.product.stock"
                class="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <!-- Total per line -->
            <div class="text-right w-20 shrink-0">
              <span class="font-mono font-bold text-xs text-slate-900 tabular-nums">
                {{ formatRupiah(item.product.selling_price * item.quantity) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Sticky Cart Summary & Actions -->
        <div class="p-4 border-t border-slate-200 bg-white space-y-2.5 shrink-0 shadow-lg">
          <div class="space-y-1 text-xs text-slate-600">
            <div class="flex justify-between">
              <span>Subtotal Item</span>
              <span class="font-mono tabular-nums text-slate-900">{{ formatRupiah(subtotal) }}</span>
            </div>

            <div v-if="pointsDiscountAmount > 0" class="flex justify-between text-emerald-700 font-medium">
              <span>Loyalty Points Discount</span>
              <span class="font-mono tabular-nums">-{{ formatRupiah(pointsDiscountAmount) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1">Diskon Pesanan</span>
              <div class="flex items-center gap-1">
                <span class="text-slate-400 text-[10px]">Rp</span>
                <input
                  v-model.number="manualDiscount"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-20 px-2 py-0.5 text-right bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            <div class="flex justify-between text-slate-500">
              <span>Pajak Restoran (PPN 10%)</span>
              <span class="font-mono tabular-nums">{{ formatRupiah(taxAmount) }}</span>
            </div>
          </div>

          <div class="pt-2.5 border-t border-slate-200 flex items-baseline justify-between">
            <div>
              <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Tagihan</span>
              <div class="text-[11px] text-emerald-700 font-mono font-medium">Poin Didapat: +{{ pointsEarned }}</div>
            </div>
            <div class="text-2xl font-bold font-mono text-navy-950 tracking-tight tabular-nums">
              {{ formatRupiah(grandTotal) }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              @click="openSplitBillModal"
              :disabled="cart.length === 0"
              class="col-span-1 py-3 px-2 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors min-h-[48px] cursor-pointer active:scale-[0.98]"
            >
              Split Bill
            </button>

            <button
              type="button"
              @click="openPaymentModal"
              :disabled="cart.length === 0"
              class="col-span-2 py-3 px-4 bg-navy-800 hover:bg-navy-900 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-xs transition-colors min-h-[48px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Bayar (F4 / Spasi)</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Payment Modal (REAL LOOKS, TANPA GATEWAY, QRIS VERIFIKASI HP) -->
    <AppModal
      :show="showPaymentModal"
      title="Pilih Metode Pembayaran Tender"
      max-width="lg"
      @close="showPaymentModal = false"
    >
      <div class="space-y-4">
        <!-- Tagihan Display -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span class="text-xs text-slate-600 font-semibold">Total Yang Harus Dibayar:</span>
          <span class="text-xl font-bold font-mono text-navy-950 tabular-nums">{{ formatRupiah(grandTotal) }}</span>
        </div>

        <!-- Payment Methods Segmented Grid (Icons only, no emojis) -->
        <div class="grid grid-cols-4 gap-2">
          <button
            type="button"
            v-for="pm in paymentMethods"
            :key="pm.id"
            @click="selectedPaymentMethod = pm.id"
            class="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer min-h-[68px] active:scale-[0.98]"
            :class="selectedPaymentMethod === pm.id
              ? 'bg-navy-50 border-navy-400 text-navy-800 font-bold shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'"
          >
            <!-- Cash Icon -->
            <svg v-if="pm.iconType === 'cash'" class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- QRIS Icon -->
            <svg v-else-if="pm.iconType === 'qris'" class="w-5 h-5 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <!-- Card / EDC Icon -->
            <svg v-else-if="pm.iconType === 'card'" class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <!-- Bank Transfer Icon -->
            <svg v-else-if="pm.iconType === 'bank'" class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span class="text-xs">{{ pm.label }}</span>
          </button>
        </div>

        <!-- 1. CASH FLOW -->
        <div v-if="selectedPaymentMethod === 'cash'" class="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <label class="block text-xs font-bold text-slate-800 mb-1">Nominal Uang Diterima</label>
            <input
              v-model.number="cashTendered"
              type="number"
              min="0"
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-700 tabular-nums"
              placeholder="0"
            />
          </div>

          <!-- Quick Cash Chips -->
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              @click="cashTendered = grandTotal"
              class="px-3 py-1.5 text-xs font-mono rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-800 border border-navy-200 font-bold cursor-pointer active:scale-95"
            >
              Uang Pas
            </button>
            <button
              v-for="amt in [20000, 50000, 100000, 150000, 200000]"
              :key="amt"
              type="button"
              @click="cashTendered = amt"
              class="px-3 py-1.5 text-xs font-mono rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer active:scale-95"
            >
              {{ formatRupiah(amt) }}
            </button>
          </div>

          <!-- Kembalian Display -->
          <div class="pt-2.5 border-t border-slate-200 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700">Uang Kembalian:</span>
            <span class="text-lg font-bold font-mono tabular-nums" :class="changeDue >= 0 ? 'text-emerald-700' : 'text-rose-600'">
              {{ formatRupiah(Math.max(0, changeDue)) }}
            </span>
          </div>
        </div>

        <!-- 2. QRIS FLOW (TANPA QR GAMBAR, DENGAN INSTRUKSI VERIFIKASI HP PEMBELI) -->
        <div v-else-if="selectedPaymentMethod === 'qris'" class="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3.5">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900">Instruksi Verifikasi QRIS Standee Kasir</h4>
              <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Minta pembeli memindai kode QRIS standee di meja kasir sebesar
                <strong class="font-mono text-slate-900">{{ formatRupiah(grandTotal) }}</strong>.
              </p>
            </div>
          </div>

          <!-- Notice Banner Sesuai Permintaan User -->
          <div class="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-900 font-medium leading-relaxed">
            <span class="font-bold block text-amber-950 mb-0.5">Penting untuk Kasir:</span>
            Jangan lupa untuk melihat & memverifikasi bukti pembayaran berhasil langsung di layar HP pembeli sebelum menyelesaikan transaksi!
          </div>

          <!-- Checklist Verifikasi Kasir -->
          <label class="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
            <input
              v-model="qrisVerified"
              type="checkbox"
              class="mt-0.5 rounded text-navy-700 focus:ring-navy-300 h-4 w-4"
            />
            <span class="text-xs font-medium text-slate-800 leading-snug">
              Saya telah memeriksa bukti transaksi di HP pembeli (Nama Merchant & Nominal <span class="font-mono font-bold">{{ formatRupiah(grandTotal) }}</span> telah sesuai).
            </span>
          </label>

          <!-- Optional RRN / Ref Number -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-600 mb-1">
              No. Referensi / 4 Digit Terakhir RRN (Opsional)
            </label>
            <input
              v-model="qrisRrnNumber"
              type="text"
              placeholder="Contoh: 8492"
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
            />
          </div>
        </div>

        <!-- 3. DEBIT / EDC FLOW -->
        <div v-else-if="selectedPaymentMethod === 'debit'" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Pilih Mesin EDC Kasir</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="b in ['BCA', 'Mandiri', 'BRI', 'BNI']"
                :key="b"
                type="button"
                @click="selectedEdcBank = b"
                class="py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer"
                :class="selectedEdcBank === b ? 'bg-navy-800 text-white border-navy-800 shadow-2xs' : 'bg-white text-slate-700 border-slate-200'"
              >
                {{ b }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Nomor Approval Code / Trace ID (Dari Struk EDC)
            </label>
            <input
              v-model="edcApprovalCode"
              type="text"
              placeholder="Contoh: 654321"
              class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
            />
          </div>

          <p class="text-[11px] text-slate-500">
            Lakukan proses gesek/insert kartu pada mesin EDC fisik kasir dan pastikan transaksi approve.
          </p>
        </div>

        <!-- 4. BANK TRANSFER FLOW -->
        <div v-else-if="selectedPaymentMethod === 'bank_transfer'" class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p class="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Rekening Kasir Toko</p>
              <p class="text-sm font-bold font-mono text-slate-900 mt-0.5">BCA: 890-123-4567</p>
              <p class="text-xs text-slate-500">a.n. Kopi Kawan Indonesia</p>
            </div>
            <button
              type="button"
              @click="copyStoreAccount"
              class="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-navy-50 text-navy-800 hover:bg-navy-100 border border-navy-200 transition"
            >
              {{ copiedAccountNotice ? 'Tersalin!' : 'Salin Rekening' }}
            </button>
          </div>

          <div class="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900">
            Periksa notifikasi mutasi m-banking kasir sebelum menyelesaikan transaksi.
          </div>
        </div>
      </div>

      <template #footer>
        <AppButton variant="outline" size="md" @click="showPaymentModal = false">
          Batal
        </AppButton>
        <AppButton
          variant="primary"
          size="md"
          :disabled="isProcessingCheckout || (selectedPaymentMethod === 'cash' && changeDue < 0) || (selectedPaymentMethod === 'qris' && !qrisVerified)"
          :loading="isProcessingCheckout"
          @click="processCheckout"
        >
          Konfirmasi & Selesaikan Transaksi
        </AppButton>
      </template>
    </AppModal>

    <!-- Receipt & Success Modal (No emojis, crisp thermal preview) -->
    <AppModal
      :show="!!completedOrder"
      title="Transaksi Selesai"
      max-width="sm"
      @close="closeReceiptModal"
    >
      <div v-if="completedOrder" class="space-y-4">
        <div class="text-center">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900">Transaksi Berhasil!</h3>
          <p class="text-xs text-slate-500 font-mono">{{ completedOrder.invoice_number }}</p>
        </div>

        <!-- Thermal Receipt Card Simulation -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs space-y-2">
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
          <AppButton variant="primary" size="md" class="w-full flex items-center justify-center gap-2" @click="printReceipt">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Cetak Struk Thermal</span>
          </AppButton>
          <AppButton variant="secondary" size="md" class="w-full flex items-center justify-center gap-2" @click="sendWhatsAppReceipt">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Kirim Nota via WhatsApp</span>
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
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono text-slate-700">
          <div class="flex justify-between"><span>Modal Awal:</span><span>{{ formatRupiah(currentShift.starting_cash) }}</span></div>
          <div class="flex justify-between text-emerald-700"><span>Penjualan Tunai:</span><span>{{ formatRupiah(currentShift.cash_sales_total) }}</span></div>
          <div class="flex justify-between text-sky-700"><span>Penjualan Non-Tunai:</span><span>{{ formatRupiah(currentShift.non_cash_sales_total) }}</span></div>
        </div>

        <AppInput
          v-model.number="cashDrawerPhysicalActual"
          type="number"
          label="Total Kas Fisik di Laci Sekarang (Rp)"
          monospace
          required
        />

        <AppButton variant="danger" size="md" class="w-full" @click="submitCloseShift">
          Tutup Shift & Cetak Rekap Z
        </AppButton>
      </div>
    </AppModal>

    <!-- Cash Movement Modal -->
    <AppModal
      :show="showCashMovementModal"
      title="Catat Kas Masuk / Keluar Laci"
      max-width="sm"
      @close="showCashMovementModal = false"
    >
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="movementType = 'in'"
            class="py-2 text-xs font-bold rounded-xl border transition cursor-pointer"
            :class="movementType === 'in' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' : 'bg-white text-slate-600 border-slate-200'"
          >
            Kas Masuk (+)
          </button>
          <button
            type="button"
            @click="movementType = 'out'"
            class="py-2 text-xs font-bold rounded-xl border transition cursor-pointer"
            :class="movementType === 'out' ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs' : 'bg-white text-slate-600 border-slate-200'"
          >
            Kas Keluar (-)
          </button>
        </div>

        <AppInput
          v-model.number="movementAmount"
          type="number"
          label="Nominal (Rp)"
          monospace
          required
        />

        <AppInput
          v-model="movementReason"
          type="text"
          label="Alasan Pergerakan Kas"
          placeholder="Contoh: Beli es batu tambahan..."
          required
        />

        <AppButton variant="primary" size="md" class="w-full mt-2" @click="submitCashMovement">
          Simpan Transaksi Kas
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>
