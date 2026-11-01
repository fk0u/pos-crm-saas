<!DOCTYPE html>
<html lang="id" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Terminal Kasir — {{ $outletName }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        @media print {
            body * { visibility: hidden; }
            #receipt-print-area, #receipt-print-area * { visibility: visible; }
            #receipt-print-area {
                position: fixed;
                inset: 0;
                width: 56mm;
                max-width: 72mm;
                box-shadow: none !important;
            }
            .print-hide { display: none !important; }
        }
        .log { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    </style>
</head>
<body class="h-full bg-slate-100 text-slate-900">
    <input type="hidden" id="pos-outlet-id" value="{{ $outletId }}">

    <div class="flex h-screen flex-col">
        {{-- Top bar --}}
        <header class="flex items-center justify-between bg-slate-900 px-6 py-3 text-white print-hide">
            <div class="flex items-center gap-3">
                <span class="text-lg font-black tracking-tight">☕ Kasir</span>
                <span class="hidden md:inline text-sm text-slate-300">{{ $outletName }}</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="text-sm text-slate-300">{{ $cashierName }}</span>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="rounded-lg px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600">Logout</button>
                </form>
            </div>
        </header>

        <div class="flex min-h-0 flex-1 flex-col lg:flex-row">
            {{-- Product catalog (left, ~2/3) --}}
            <section class="flex min-h-0 flex-1 flex-col p-4 gap-4">
                <div class="flex flex-col sm:flex-row gap-3">
                    <div class="relative flex-1">
                        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input id="input-search" type="search" placeholder="Cari produk, SKU, atau barcode…"
                               class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                    </div>
                </div>

                <div id="category-chips" class="flex flex-wrap gap-2"></div>

                <div id="product-grid" class="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3 xl:grid-cols-4"></div>
            </section>

            {{-- Cart panel (right, fixed width on desktop, bottom sheet style on mobile) --}}
            <aside class="flex w-full flex-col border-t border-slate-200 bg-white shadow-inner lg:w-[420px] lg:border-l lg:border-t-0">
                {{-- Customer CRM --}}
                <div class="border-b border-slate-100 p-4">
                    <label for="input-phone" class="text-xs font-semibold uppercase tracking-wide text-slate-400">No. WhatsApp Pelanggan</label>
                    <input id="input-phone" type="tel" inputmode="numeric" placeholder="0812xxxxxxx"
                           class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                    <p id="customer-lookup-label" class="hidden"></p>
                    <div id="customer-box" class="hidden mt-2 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
                        <div>
                            <p id="customer-name" class="text-sm font-semibold text-slate-800"></p>
                            <p class="text-xs text-slate-500">Pelanggan terdaftar</p>
                        </div>
                        <span id="customer-points" class="rounded-full bg-green-600/10 px-3 py-1 text-sm font-bold text-green-700"></span>
                    </div>
                </div>

                {{-- Cart lines --}}
                <div id="cart-lines" class="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto px-4"></div>

                {{-- Summary --}}
                <div class="space-y-2 border-t border-slate-100 p-4">
                    <div class="flex items-center justify-between text-sm">
                        <span class="text-slate-500">Subtotal</span>
                        <span id="summary-subtotal" class="font-semibold text-slate-800">—</span>
                    </div>
                    <div class="flex items-center justify-between text-sm">
                        <span class="flex items-center gap-2 text-slate-500">
                            Diskon (Rp)
                            <input id="input-discount" type="number" min="0" step="500" placeholder="0"
                                   class="w-28 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none">
                        </span>
                        <span id="summary-discount" class="font-semibold text-red-500">—</span>
                    </div>
                    <div id="points-hint" class="hidden rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold whitespace-nowrap">Tukar poin:</span>
                            <input id="input-points" type="number" min="0" step="1" placeholder="0"
                                   class="w-20 rounded-md border border-blue-200 px-2 py-1 text-sm focus:outline-none">
                        </div>
                    </div>
                    <div class="flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
                        <span class="text-base font-bold text-slate-600">TOTAL</span>
                        <span id="summary-total" class="text-2xl font-black text-blue-700">—</span>
                    </div>
                    <button id="btn-open-payment" type="button"
                            class="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400">
                        💳 Bayar
                    </button>
                </div>
            </aside>
        </div>
    </div>

    {{-- Payment modal --}}
    <div id="modal-payment" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="absolute inset-0 flex items-end sm:items-center sm:justify-center">
            <div class="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-2xl print-hide">
                <h2 class="text-lg font-bold">Pembayaran</h2>
                <p class="mt-1 text-sm text-slate-500">Total tagihan:</p>
                <p id="pay-total" class="text-3xl font-black text-blue-700">—</p>

                <div class="mt-4 flex gap-2">
                    <button type="button" data-pay-method="cash" class="flex-1">💵 Tunai</button>
                    <button type="button" data-pay-method="qris" class="flex-1">📱 QRIS</button>
                </div>

                {{-- Cash body --}}
                <div id="cash-body">
                    <div id="cash-quick" class="mt-4 flex flex-wrap gap-2"></div>
                    <label for="input-cash" class="mt-4 block text-sm font-medium text-slate-600">Uang diterima</label>
                    <input id="input-cash" type="number" min="0" step="1000" placeholder="0"
                           class="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-xl text-right font-bold focus:border-blue-500 focus:outline-none">
                    <div class="mt-3 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                        <span class="text-sm font-semibold text-slate-600">Kembalian</span>
                        <span id="pay-change" class="text-xl font-black text-green-700">—</span>
                    </div>
                </div>

                {{-- QRIS body --}}
                <div id="qris-body" class="hidden">
                    <div class="mt-6 flex flex-col items-center gap-3 rounded-xl bg-slate-50 p-6">
                        <div class="grid h-40 w-40 place-items-center rounded-xl border-2 border-dashed border-slate-300 text-center text-sm text-slate-400">
                            QR QRIS<br>(gateway)
                        </div>
                        <p class="text-sm text-slate-500">Scan &amp; bayar, lalu konfirmasi.</p>
                    </div>
                </div>

                <div class="mt-6 flex gap-3">
                    <button id="btn-cancel-pay" type="button" class="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 hover:bg-slate-200">Batal</button>
                    <button id="btn-confirm-pay" type="button" class="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400">✓ Proses</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Receipt modal --}}
    <div id="modal-receipt" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div class="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <div id="receipt-print-area" class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
                <div class="log text-[13px] leading-relaxed">
                    <p class="text-center font-bold">{{ $outletName }}</p>
                    <p class="text-center text-slate-500">Struk Pembayaran</p>
                    <div class="my-2 border-t border-dashed border-slate-400"></div>
                    <div class="flex justify-between"><span>Invoice</span><span id="receipt-invoice" class="font-bold"></span></div>
                    <div class="flex justify-between"><span>Waktu</span><span id="receipt-date"></span></div>
                    <div class="my-2 border-t border-dashed border-slate-400"></div>
                    <div id="receipt-items" class="space-y-1"></div>
                    <div class="my-2 border-t border-dashed border-slate-400"></div>
                    <div class="flex justify-between font-bold"><span>TOTAL</span><span id="receipt-total"></span></div>
                    <div class="flex justify-between"><span>Kembalian</span><span id="receipt-change"></span></div>
                    <div class="flex justify-between"><span>Poin Didapat</span><span id="receipt-points" class="text-green-600 font-bold"></span></div>
                    <div class="my-2 border-t border-dashed border-slate-400"></div>
                    <p class="text-center text-slate-500">Terima kasih atas kunjungan Anda 🙏</p>
                </div>
                <div class="print-hide mt-4 flex gap-3">
                    <button id="btn-close-receipt" type="button" class="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 hover:bg-slate-200">Tutup</button>
                    <button id="btn-print-receipt" type="button" class="flex-1 rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800">🖨️ Cetak Struk</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Toasts --}}
    <div id="pos-toast" class="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2 print-hide"></div>
</body>
</html>
