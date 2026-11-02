<template>
    <div class="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
        <!-- Top App Bar -->
        <header class="h-14 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20">
                    OP
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-sm font-bold text-white tracking-tight">Omnipoint POS</h1>
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">L13 Modern</span>
                    </div>
                    <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span class="font-medium text-slate-300">{{ outletName }}</span>
                        <span class="text-slate-600">•</span>
                        <span>Kasir: <strong class="text-slate-300">{{ cashierName }}</strong></span>
                    </div>
                </div>
            </div>

            <!-- Header Actions & Shift Control -->
            <div class="flex items-center gap-2">
                <!-- Shift Status Pill -->
                <button
                    type="button"
                    @click="openShiftDialog"
                    :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all',
                        currentShift
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                            : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                    ]"
                >
                    <span class="w-2 h-2 rounded-full animate-pulse" :class="currentShift ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                    <span>{{ currentShift ? 'Shift Aktif' : 'Buka Shift' }}</span>
                </button>

                <!-- Drawer Movement (Cash in/out) -->
                <button
                    v-if="currentShift"
                    type="button"
                    @click="showCashMovementModal = true"
                    class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    title="Catat Kas Masuk/Keluar"
                >
                    💵 Kas Laci
                </button>

                <!-- Link to Dashboard for Owner/Manager -->
                <a
                    v-if="userRole !== 'cashier'"
                    href="/dashboard"
                    class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                    📊 Owner Dashboard
                </a>

                <!-- Logout -->
                <form action="/logout" method="POST" class="inline">
                    <input type="hidden" name="_token" :value="csrfToken">
                    <button
                        type="submit"
                        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition"
                    >
                        Keluar
                    </button>
                </form>
            </div>
        </header>

        <!-- Main POS Body: Catalog (Left) + Cart Sidebar (Right) -->
        <div class="flex-1 flex overflow-hidden">
            <!-- Catalog Section -->
            <main class="flex-1 flex flex-col min-w-0 bg-slate-950 p-4 overflow-hidden">
                <!-- Search & Barcode & Categories -->
                <div class="flex flex-col gap-3 mb-4 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="relative flex-1">
                            <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                🔍
                            </span>
                            <input
                                ref="searchInputRef"
                                v-model="searchQuery"
                                type="text"
                                placeholder="Cari nama produk, SKU, atau scan barcode..."
                                class="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                            />
                            <button
                                v-if="searchQuery"
                                @click="searchQuery = ''"
                                class="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 text-xs"
                            >
                                ✕
                            </button>
                        </div>

                        <!-- Barcode Mode Indicator -->
                        <div class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                            <span class="font-mono text-[11px] text-emerald-400">BARCODE AUTO</span>
                        </div>
                    </div>

                    <!-- Category Pills -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                            type="button"
                            v-for="cat in categories"
                            :key="cat"
                            @click="selectedCategory = cat"
                            :class="[
                                'px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150',
                                selectedCategory === cat
                                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                                    : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                            ]"
                        >
                            {{ cat }}
                        </button>
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="flex-1 overflow-y-auto pr-1">
                    <div v-if="filteredProducts.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                        <div class="text-3xl mb-2">📦</div>
                        <p class="text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
                    </div>

                    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <button
                            v-for="prod in filteredProducts"
                            :key="prod.id"
                            type="button"
                            @click="addToCart(prod)"
                            :disabled="prod.stock <= 0"
                            class="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-3 flex flex-col text-left transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/5"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                                    {{ prod.category }}
                                </span>
                                <span
                                    :class="[
                                        'text-[10px] font-mono px-1.5 py-0.5 rounded',
                                        prod.stock > 10
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : prod.stock > 0
                                                ? 'text-amber-400 bg-amber-500/10'
                                                : 'text-rose-400 bg-rose-500/10'
                                    ]"
                                >
                                    Stok {{ prod.stock }}
                                </span>
                            </div>

                            <div class="font-semibold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition line-clamp-2 mb-1">
                                {{ prod.name }}
                            </div>

                            <div class="text-[10px] text-slate-400 font-mono mb-2">
                                SKU: {{ prod.sku }}
                            </div>

                            <div class="mt-auto pt-2 flex items-center justify-between border-t border-slate-800/60">
                                <span class="font-bold text-xs sm:text-sm text-emerald-400 font-mono">
                                    {{ formatRupiah(prod.selling_price) }}
                                </span>
                                <span class="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center font-bold text-xs transition">
                                    +
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </main>

            <!-- Cart & Checkout Sidebar (Right) -->
            <aside class="w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden shadow-2xl">
                <!-- Customer CRM Header -->
                <div class="p-3.5 border-b border-slate-800 bg-slate-950/40">
                    <div class="flex items-center justify-between mb-1.5">
                        <label for="customerPhoneInput" class="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            <span>💬</span>
                            <span>No. WhatsApp Pelanggan</span>
                        </label>
                        <span v-if="crmCustomer" :class="['text-[10px] font-bold px-2 py-0.5 rounded-full border', tierColorClass(crmCustomer.tier)]">
                            {{ crmCustomer.tier }} Member
                        </span>
                    </div>

                    <div class="flex gap-2">
                        <input
                            id="customerPhoneInput"
                            v-model="customerPhone"
                            @keyup.enter="lookupCustomer"
                            type="text"
                            placeholder="08123456789 (Enter utk lookup)"
                            class="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                            type="button"
                            @click="lookupCustomer"
                            :disabled="isLookingUp"
                            class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                        >
                            {{ isLookingUp ? '...' : 'Cek' }}
                        </button>
                    </div>

                    <!-- Customer Detail Strip -->
                    <div v-if="crmCustomer" class="mt-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div>
                            <div class="font-semibold text-emerald-300">{{ crmCustomer.name }}</div>
                            <div class="text-[10px] text-slate-400">Total Kunjungan: {{ crmCustomer.visit_count }}x</div>
                        </div>
                        <div class="text-right">
                            <div class="font-mono font-bold text-amber-300">{{ crmCustomer.loyalty_points }} Poin</div>
                            <label v-if="crmCustomer.loyalty_points > 0" class="text-[10px] text-emerald-400 flex items-center gap-1 cursor-pointer">
                                <input v-model="useLoyaltyPoints" type="checkbox" class="rounded text-emerald-500 focus:ring-emerald-500">
                                <span>Tukarkan (-{{ formatRupiah(pointsDiscountAmount) }})</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Cart Items List -->
                <div class="flex-1 overflow-y-auto p-3.5 space-y-2">
                    <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                        <div class="text-4xl mb-2 opacity-60">🛒</div>
                        <p class="text-xs">Keranjang masih kosong.</p>
                        <p class="text-[10px] text-slate-600 mt-1">Pilih menu dari katalog di sebelah kiri.</p>
                    </div>

                    <div
                        v-for="item in cart"
                        :key="item.product.id"
                        class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-3 transition"
                    >
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-xs text-white truncate">{{ item.product.name }}</div>
                            <div class="text-[11px] font-mono text-emerald-400 mt-0.5">
                                {{ formatRupiah(item.product.selling_price) }}
                            </div>
                        </div>

                        <!-- Stepper -->
                        <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                            <button
                                type="button"
                                @click="decreaseQty(item)"
                                class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold"
                            >
                                -
                            </button>
                            <span class="w-7 text-center font-mono text-xs font-semibold text-white">
                                {{ item.quantity }}
                            </span>
                            <button
                                type="button"
                                @click="increaseQty(item)"
                                :disabled="item.quantity >= item.product.stock"
                                class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white rounded hover:bg-slate-800 text-xs font-bold disabled:opacity-30"
                            >
                                +
                            </button>
                        </div>

                        <div class="text-right min-w-[70px]">
                            <div class="font-mono text-xs font-bold text-white">
                                {{ formatRupiah(item.product.selling_price * item.quantity) }}
                            </div>
                            <button
                                type="button"
                                @click="removeFromCart(item)"
                                class="text-[10px] text-rose-400 hover:text-rose-300 mt-0.5"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Cart Summary & Actions -->
                <div class="p-3.5 bg-slate-950/90 border-t border-slate-800 shrink-0 space-y-2.5">
                    <div class="space-y-1.5 text-xs text-slate-400">
                        <div class="flex justify-between">
                            <span>Subtotal</span>
                            <span class="font-mono text-slate-200">{{ formatRupiah(subtotal) }}</span>
                        </div>
                        <div v-if="pointsDiscountAmount > 0" class="flex justify-between text-emerald-400">
                            <span>Potongan Poin CRM</span>
                            <span class="font-mono">-{{ formatRupiah(pointsDiscountAmount) }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span>Diskon Tambahan</span>
                            <div class="flex items-center gap-1 w-28">
                                <span class="text-[10px] text-slate-500">Rp</span>
                                <input
                                    v-model.number="manualDiscount"
                                    type="number"
                                    min="0"
                                    class="w-full text-right bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                        <div class="flex justify-between">
                            <span>Pajak Resto (PB1 10%)</span>
                            <span class="font-mono text-slate-200">{{ formatRupiah(taxAmount) }}</span>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-slate-800/80 flex items-baseline justify-between">
                        <div>
                            <span class="text-xs font-medium text-slate-400">Total Tagihan</span>
                            <div class="text-[10px] text-emerald-400/80 font-mono">Poin Didapat: +{{ pointsEarned }}</div>
                        </div>
                        <div class="text-xl font-bold font-mono text-emerald-400 tracking-tight">
                            {{ formatRupiah(grandTotal) }}
                        </div>
                    </div>

                    <!-- Split Bill & Checkout Buttons -->
                    <div class="grid grid-cols-3 gap-2 pt-1">
                        <button
                            type="button"
                            @click="openSplitBillModal"
                            :disabled="cart.length === 0"
                            class="col-span-1 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
                        >
                            Split Bill
                        </button>

                        <button
                            type="button"
                            @click="openPaymentModal"
                            :disabled="cart.length === 0"
                            class="col-span-2 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
                        >
                            <span>Bayar Sekarang</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </aside>
        </div>

        <!-- Payment Modal -->
        <div v-if="showPaymentModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                        <h3 class="text-base font-bold text-white">Pilih Pembayaran</h3>
                        <p class="text-xs text-slate-400">Total Tagihan: <strong class="text-emerald-400 font-mono text-sm">{{ formatRupiah(grandTotal) }}</strong></p>
                    </div>
                    <button @click="showPaymentModal = false" class="text-slate-400 hover:text-white text-lg">✕</button>
                </div>

                <!-- Payment Methods Grid -->
                <div class="grid grid-cols-4 gap-2">
                    <button
                        type="button"
                        v-for="pm in paymentMethods"
                        :key="pm.id"
                        @click="selectedPaymentMethod = pm.id"
                        :class="[
                            'p-3 rounded-xl border text-center transition flex flex-col items-center gap-1',
                            selectedPaymentMethod === pm.id
                                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        ]"
                    >
                        <span class="text-xl">{{ pm.icon }}</span>
                        <span class="text-xs">{{ pm.label }}</span>
                    </button>
                </div>

                <!-- Cash Tender Input & Quick Nominal Buttons -->
                <div v-if="selectedPaymentMethod === 'cash'" class="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Uang Diterima (Cash Tendered)</label>
                        <input
                            v-model.number="cashTendered"
                            type="number"
                            min="0"
                            class="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="0"
                        />
                    </div>

                    <!-- Quick Cash Chips -->
                    <div class="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            @click="cashTendered = grandTotal"
                            class="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                        >
                            Uang Pas
                        </button>
                        <button
                            v-for="amt in [20000, 50000, 100000, 150000, 200000]"
                            :key="amt"
                            type="button"
                            @click="cashTendered = amt"
                            class="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        >
                            {{ formatRupiah(amt) }}
                        </button>
                    </div>

                    <!-- Kembalian Display Landmark -->
                    <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span class="text-xs font-semibold text-slate-400">Kembalian</span>
                        <span class="text-lg font-bold font-mono" :class="changeDue >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                            {{ formatRupiah(Math.max(0, changeDue)) }}
                        </span>
                    </div>
                </div>

                <!-- QRIS Dynamic Display -->
                <div v-else-if="selectedPaymentMethod === 'qris'" class="p-6 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center text-center">
                    <div class="w-48 h-48 bg-white p-3 rounded-xl shadow-lg mb-3 flex items-center justify-center">
                        <!-- Simulated QR Code SVG -->
                        <svg class="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
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
                    <div class="text-xs font-medium text-slate-300">Scan QRIS Dinamis (GoPay, OVO, ShopeePay, Dana, BCA)</div>
                    <div class="text-[11px] text-slate-500 font-mono mt-1">NMID: ID1020261102998 • Otomatis verifikasi</div>
                </div>

                <!-- Process Checkout CTA -->
                <button
                    type="button"
                    @click="processCheckout"
                    :disabled="isProcessingCheckout || (selectedPaymentMethod === 'cash' && changeDue < 0)"
                    class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                >
                    <span>{{ isProcessingCheckout ? 'Memproses Transaksi...' : 'Konfirmasi & Selesaikan Transaksi' }}</span>
                </button>
            </div>
        </div>

        <!-- Receipt & Success Modal -->
        <div v-if="completedOrder" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
                <div class="text-center">
                    <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto mb-2 border border-emerald-500/30">
                        ✓
                    </div>
                    <h3 class="text-base font-bold text-white">Transaksi Berhasil!</h3>
                    <p class="text-xs text-slate-400 font-mono">{{ completedOrder.invoice_number }}</p>
                </div>

                <!-- Thermal Receipt Card Simulation -->
                <div class="p-4 rounded-xl bg-white text-slate-950 font-mono text-xs space-y-2 shadow-inner">
                    <div class="text-center border-b border-dashed border-slate-300 pb-2">
                        <div class="font-bold text-sm">KOPI KAWAN INDONESIA</div>
                        <div class="text-[10px] text-slate-600">{{ outletName }}</div>
                        <div class="text-[9px] text-slate-500">{{ new Date().toLocaleString('id-ID') }}</div>
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

                <!-- Action Buttons: Cetak Struk, WhatsApp, Selesai -->
                <div class="space-y-2 pt-1">
                    <button
                        type="button"
                        @click="printReceipt"
                        class="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                        <span>🖨️</span>
                        <span>Cetak Struk Thermal</span>
                    </button>

                    <button
                        type="button"
                        @click="sendWhatsAppReceipt"
                        class="w-full py-2.5 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                        <span>💬</span>
                        <span>Kirim E-Struk via WhatsApp</span>
                    </button>

                    <button
                        type="button"
                        @click="closeReceiptModal"
                        class="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                    >
                        Transaksi Baru (Esc)
                    </button>
                </div>
            </div>
        </div>

        <!-- Shift Modal (Open / Close) -->
        <div v-if="showShiftModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-base font-bold text-white">
                        {{ currentShift ? 'Tutup Shift Kasir (Laporan X/Z)' : 'Buka Shift Baru Kasir' }}
                    </h3>
                    <button @click="showShiftModal = false" class="text-slate-400 hover:text-white">✕</button>
                </div>

                <div v-if="!currentShift" class="space-y-3">
                    <p class="text-xs text-slate-400">Masukkan modal awal (cash float) di laci kasir saat mulai bertugas.</p>
                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Modal Awal Laci Kasir (Rp)</label>
                        <input
                            v-model.number="shiftStartingCash"
                            type="number"
                            min="0"
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                    <button
                        type="button"
                        @click="submitOpenShift"
                        class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                        Buka Shift Sekarang
                    </button>
                </div>

                <div v-else class="space-y-3">
                    <div class="p-3 rounded-xl bg-slate-950 text-xs space-y-1 font-mono text-slate-300">
                        <div class="flex justify-between"><span>Modal Awal:</span><span>{{ formatRupiah(currentShift.starting_cash) }}</span></div>
                        <div class="flex justify-between text-emerald-400"><span>Penjualan Tunai:</span><span>{{ formatRupiah(currentShift.cash_sales_total) }}</span></div>
                        <div class="flex justify-between text-cyan-400"><span>Penjualan Non-Tunai:</span><span>{{ formatRupiah(currentShift.non_cash_sales_total) }}</span></div>
                        <div class="flex justify-between border-t border-slate-800 pt-1 font-bold text-white">
                            <span>Estimasi Kas di Laci:</span>
                            <span>{{ formatRupiah(currentShift.expected_ending_cash) }}</span>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Uang Fisik Aktual di Laci (Blind Count)</label>
                        <input
                            v-model.number="shiftActualCash"
                            type="number"
                            min="0"
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            placeholder="Hitung uang tunai di laci..."
                        />
                    </div>

                    <div v-if="shiftActualCash !== null" class="flex justify-between text-xs font-mono p-2 rounded-lg bg-slate-950">
                        <span class="text-slate-400">Selisih Kas:</span>
                        <span :class="shiftActualCash - currentShift.expected_ending_cash === 0 ? 'text-emerald-400' : 'text-amber-400 font-bold'">
                            {{ formatRupiah(shiftActualCash - currentShift.expected_ending_cash) }}
                        </span>
                    </div>

                    <button
                        type="button"
                        @click="submitCloseShift"
                        class="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition"
                    >
                        Tutup Shift & Rekap X/Z
                    </button>
                </div>
            </div>
        </div>

        <!-- Cash Movement Drawer Modal -->
        <div v-if="showCashMovementModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-base font-bold text-white">Pergerakan Kas Laci Kasir</h3>
                    <button @click="showCashMovementModal = false" class="text-slate-400 hover:text-white">✕</button>
                </div>

                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            @click="cashMovementType = 'cash_in'"
                            :class="[
                                'py-2 rounded-xl text-xs font-bold border transition',
                                cashMovementType === 'cash_in'
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                            ]"
                        >
                            + Kas Masuk
                        </button>
                        <button
                            type="button"
                            @click="cashMovementType = 'cash_out'"
                            :class="[
                                'py-2 rounded-xl text-xs font-bold border transition',
                                cashMovementType === 'cash_out'
                                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                            ]"
                        >
                            - Kas Keluar
                        </button>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Nominal (Rp)</label>
                        <input
                            v-model.number="cashMovementAmount"
                            type="number"
                            min="1"
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-slate-300 mb-1">Keterangan / Alasan</label>
                        <input
                            v-model="cashMovementReason"
                            type="text"
                            placeholder="Contoh: Tambah uang kembalian / Beli es batu"
                            class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <button
                        type="button"
                        @click="submitCashMovement"
                        class="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                        Simpan Pergerakan Kas
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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
                'Accept': 'application/json',
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
                'Accept': 'application/json',
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
                'Accept': 'application/json',
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
                'Accept': 'application/json',
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
}

function tierColorClass(tier) {
    if (tier === 'Platinum') return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    if (tier === 'Gold') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-slate-700/60 text-slate-300 border-slate-600';
}
</script>
