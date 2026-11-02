import { ApiError, checkout, fetchProducts, lookupCustomer, type ApiCustomer, type ApiProduct } from './api.js';
import { Cart } from './cart.js';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

const el = <T extends HTMLElement>(id: string): T => {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Element #${id} tidak ditemukan di view kasir.`);
    return node as T;
};

// Set saat init(); hanya ada di halaman POS.
let outletId = '';

const state = {
    products: [] as ApiProduct[],
    customer: null as ApiCustomer | null,
    search: '',
    category: 'all',
    paymentMethod: 'cash' as 'cash' | 'qris',
    processing: false,
};

const cart = new Cart();

const categories = (): string[] =>
    [...new Set(state.products.map((product) => product.category).filter(Boolean))] as string[];

const visibleProducts = (): ApiProduct[] =>
    state.products.filter((product) => {
        const q = state.search.trim().toLowerCase();
        const matchSearch =
            !q ||
            product.name.toLowerCase().includes(q) ||
            (product.sku ?? '').toLowerCase().includes(q) ||
            (product.barcode ?? '').includes(q);
        const matchCategory = state.category === 'all' || product.category === state.category;
        return matchSearch && matchCategory;
    });

function renderCategoryChips(): void {
    const wrap = el<HTMLDivElement>('category-chips');
    const active = state.category;
    const chips = ['all', ...categories()];
    wrap.innerHTML = '';
    chips.forEach((category) => {
        const label = category === 'all' ? 'Semua' : category;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.className =
            active === category
                ? 'px-4 py-2 rounded-full text-sm font-semibold bg-blue-600 text-white shadow-sm'
                : 'px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600';
        button.dataset.category = category;
        wrap.appendChild(button);
    });
}

function renderProductGrid(): void {
    const grid = el<HTMLDivElement>('product-grid');
    const products = visibleProducts();
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML =
            '<p class="col-span-full py-16 text-center text-slate-400">Tidak ada produk yang cocok.</p>';
        return;
    }

    for (const product of products) {
        const outOfStock = product.stock <= 0;
        const card = document.createElement('button');
        card.type = 'button';
        card.dataset.productId = product.id;
        card.className = [
            'card-prod text-left rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition',
            outOfStock ? 'opacity-40 cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-md active:scale-[0.98]',
        ].join(' ');
        card.innerHTML = `
            <p class="text-sm font-semibold text-slate-800 line-clamp-2">${product.name}</p>
            <p class="mt-1 text-xs text-slate-400">${product.sku ?? '—'}</p>
            <div class="mt-3 flex items-end justify-between">
                <span class="text-base font-bold text-blue-700">${rupiah.format(product.selling_price)}</span>
                <span class="text-[11px] font-medium text-slate-400">Stok ${product.stock}</span>
            </div>
        `;
        if (outOfStock) card.disabled = true;
        card.addEventListener('click', () => {
            try {
                cart.add(product);
            } catch (error) {
                toast((error as Error).message, 'error');
            }
        });
        grid.appendChild(card);
    }
}

function renderCart(): void {
    const list = el<HTMLDivElement>('cart-lines');
    const items = cart.items;
    list.innerHTML = '';

    if (items.length === 0) {
        list.innerHTML =
            '<div class="py-10 text-center flex flex-col items-center justify-center"><div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg></div><p class="text-sm font-semibold text-slate-600">Keranjang masih kosong</p><p class="mt-1 text-xs text-slate-400">Tap produk untuk mulai transaksi.</p></div>';
    }

    for (const line of items) {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 rounded-lg px-1 py-2';
        row.innerHTML = `
            <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-slate-700">${line.product.name}</p>
                <p class="text-xs text-slate-400">${rupiah.format(line.product.selling_price)} × ${line.quantity}</p>
            </div>
            <div class="flex items-center gap-1">
                <button type="button" data-qty-dec="${line.product.id}" aria-label="Kurangi ${line.product.name}"
                    class="h-9 w-9 rounded-lg bg-slate-100 text-lg font-bold text-slate-600 hover:bg-slate-200">−</button>
                <span class="w-8 text-center text-sm font-semibold text-slate-800" data-qty-value>${line.quantity}</span>
                <button type="button" data-qty-inc="${line.product.id}" aria-label="Tambah ${line.product.name}"
                    class="h-9 w-9 rounded-lg bg-blue-50 text-lg font-bold text-blue-600 hover:bg-blue-100">+</button>
            </div>
            <div class="w-24 text-right text-sm font-bold text-slate-800">${rupiah.format(line.lineTotal)}</div>
            <button type="button" data-remove="${line.product.id}" aria-label="Hapus ${line.product.name}"
                class="h-9 w-9 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        `;
        list.appendChild(row);
    }

    el<HTMLElement>('summary-subtotal').textContent = rupiah.format(cart.subtotal);
    el<HTMLElement>('summary-discount').textContent = `− ${rupiah.format(cart.discount)}`;
    el<HTMLElement>('summary-total').textContent = rupiah.format(cart.grandTotal);

    const pointsHint = el<HTMLParagraphElement>('points-hint');
    if (state.customer && cart.availablePoints > 0) {
        pointsHint.textContent = `${state.customer.name} punya ${state.customer.loyalty_points} poin — bisa tukar ${cart.availablePoints} poin (${rupiah.format(cart.availablePoints * 100)})`;
        pointsHint.classList.remove('hidden');
        el<HTMLInputElement>('input-points').max = String(cart.availablePoints);
    } else {
        pointsHint.classList.add('hidden');
        el<HTMLInputElement>('input-points').value = '';
    }

    const payButton = el<HTMLButtonElement>('btn-open-payment');
    payButton.disabled = state.processing || cart.lineCount === 0;
}

function renderCustomerBox(): void {
    const box = el<HTMLDivElement>('customer-box');
    if (state.customer) {
        box.classList.remove('hidden');
        el<HTMLElement>('customer-name').textContent = state.customer.name;
        el<HTMLElement>('customer-points').textContent = `${state.customer.loyalty_points} poin`;
        cart.customerPoints = state.customer.loyalty_points;
    } else {
        box.classList.add('hidden');
        el<HTMLInputElement>('input-points').value = '';
    }
    renderCart();
}

function toast(message: string, kind: 'error' | 'success'): void {
    const wrap = el<HTMLDivElement>('pos-toast');
    const div = document.createElement('div');
    div.className = [
        'px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white',
        kind === 'error' ? 'bg-red-500' : 'bg-emerald-500',
    ].join(' ');
    div.textContent = message;
    wrap.appendChild(div);
    setTimeout(() => div.remove(), 3500);
}

/* ---------- Payment & checkout ---------- */

const quickCashAmounts = (): number[] => {
    const total = cart.grandTotal;
    const options = new Set<number>([total, Math.ceil(total / 20000) * 20000, Math.ceil(total / 50000) * 50000, 100000]);
    return [...options].filter((n) => n >= total).sort((a, b) => a - b);
};

function openPayment(): void {
    cart.setDiscount(Number(el<HTMLInputElement>('input-discount').value || 0));
    const modal = el<HTMLDivElement>('modal-payment');
    modal.classList.remove('hidden');
    state.paymentMethod = 'cash';
    renderPaymentBody();
}

function closePayment(): void {
    el<HTMLDivElement>('modal-payment').classList.add('hidden');
}

function renderPaymentBody(): void {
    el<HTMLElement>('pay-total').textContent = rupiah.format(cart.grandTotal);

    document.querySelectorAll<HTMLButtonElement>('[data-pay-method]').forEach((btn) => {
        btn.className = btn.dataset.payMethod === state.paymentMethod
            ? 'flex-1 py-3 rounded-xl font-semibold bg-blue-600 text-white shadow'
            : 'flex-1 py-3 rounded-xl font-semibold bg-slate-100 text-slate-500 hover:bg-slate-200';
    });

    const cashArea = el<HTMLDivElement>('cash-body');
    const qrisArea = el<HTMLDivElement>('qris-body');
    cashArea.classList.toggle('hidden', state.paymentMethod !== 'cash');
    qrisArea.classList.toggle('hidden', state.paymentMethod !== 'qris');

    if (state.paymentMethod === 'cash') {
        const tendered = Number(el<HTMLInputElement>('input-cash').value || 0);
        const change = tendered - cart.grandTotal;
        el<HTMLElement>('pay-change').textContent =
            tendered >= cart.grandTotal ? rupiah.format(change) : 'Kurang ' + rupiah.format(-change);

        const quick = el<HTMLDivElement>('cash-quick');
        quick.innerHTML = '';
        quickCashAmounts().forEach((amount) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className =
                'px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-blue-500';
            b.textContent = amount === cart.grandTotal ? `Uang pas · ${rupiah.format(amount)}` : rupiah.format(amount);
            b.addEventListener('click', () => {
                el<HTMLInputElement>('input-cash').value = String(amount);
                renderPaymentBody();
            });
            quick.appendChild(b);
        });
    }
}

async function submitPayment(): Promise<void> {
    if (state.processing) return;
    const payButton = el<HTMLButtonElement>('btn-confirm-pay');
    payButton.disabled = true;
    state.processing = true;

    try {
        const { data } = await checkout({
            outlet_id: outletId,
            items: cart.items.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
            customer_phone: state.customer?.phone ?? null,
            customer_name: state.customer?.name ?? null,
            discount_amount: cart.discount,
            tax_amount: 0,
            points_redeemed: cart.redeemed,
            payment_method: state.paymentMethod,
            cash_tendered: state.paymentMethod === 'cash' ? Number(el<HTMLInputElement>('input-cash').value || 0) : null,
        });

        closePayment();
        showReceipt(data, cart.items.map((line) => ({ ...line })));
        cart.reset();
        el<HTMLInputElement>('input-discount').value = '';
        el<HTMLInputElement>('input-points').value = '';
        el<HTMLInputElement>('input-phone').value = '';
        state.customer = null;
        renderCustomerBox();
        await refreshProducts();
    } catch (error) {
        const message = error instanceof ApiError ? error.message : 'Checkout gagal. Coba lagi.';
        toast(message, 'error');
    } finally {
        state.processing = false;
        payButton.disabled = false;
        renderCart();
    }
}

function showReceipt(
    data: {
        invoice_number: string;
        grand_total: number;
        change_due: number;
        points_earned: number;
        customer: { name: string; loyalty_points: number } | null;
    },
    lines: import('./cart.js').CartLine[],
): void {
    el<HTMLElement>('receipt-invoice').textContent = data.invoice_number;
    el<HTMLElement>('receipt-date').textContent = new Date().toLocaleString('id-ID');
    el<HTMLElement>('receipt-total').textContent = `${rupiah.format(data.grand_total)} (${state.paymentMethod === 'cash' ? 'Tunai' : 'QRIS'})`;
    el<HTMLElement>('receipt-change').textContent = state.paymentMethod === 'cash' ? rupiah.format(data.change_due) : '—';
    el<HTMLElement>('receipt-points').textContent = `+${data.points_earned} poin`;

    const itemsWrap = el<HTMLDivElement>('receipt-items');
    itemsWrap.innerHTML = lines
        .map(
            (line) =>
                `<div class="flex justify-between gap-4"><span class="truncate">${line.product.name}</span><span class="shrink-0">${line.quantity} × ${rupiah.format(line.product.selling_price)}</span></div>`,
        )
        .join('');

    const modal = el<HTMLDivElement>('modal-receipt');
    modal.classList.remove('hidden');
    el<HTMLButtonElement>('btn-print-receipt').focus();
}

function closeReceipt(): void {
    el<HTMLDivElement>('modal-receipt').classList.add('hidden');
}

/* ---------- Event wiring ---------- */

function bindEvents(): void {
    el<HTMLInputElement>('input-search').addEventListener('input', (event) => {
        state.search = (event.target as HTMLInputElement).value;
        renderProductGrid();
    });

    el<HTMLDivElement>('category-chips').addEventListener('click', (event) => {
        const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-category]');
        if (!btn) return;
        state.category = btn.dataset.category ?? 'all';
        renderCategoryChips();
        renderProductGrid();
    });

    el<HTMLDivElement>('cart-lines').addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const inc = target.closest<HTMLButtonElement>('button[data-qty-inc]');
        const dec = target.closest<HTMLButtonElement>('button[data-qty-dec]');
        const del = target.closest<HTMLButtonElement>('button[data-remove]');
        try {
            if (inc) cart.increment(inc.dataset.qtyInc as string);
            else if (dec) cart.decrement(dec.dataset.qtyDec as string);
            else if (del) cart.remove(del.dataset.remove as string);
        } catch (error) {
            toast((error as Error).message, 'error');
        }
    });

    el<HTMLInputElement>('input-discount').addEventListener('input', (event) =>
        cart.setDiscount(Number((event.target as HTMLInputElement).value || 0)),
    );

    el<HTMLInputElement>('input-points').addEventListener('input', (event) =>
        cart.setPointsToRedeem(Number((event.target as HTMLInputElement).value || 0)),
    );

    const phoneInput = el<HTMLInputElement>('input-phone');
    let lookupTimer: ReturnType<typeof setTimeout> | undefined;
    phoneInput.addEventListener('input', () => {
        clearTimeout(lookupTimer);
        const phone = phoneInput.value.trim();
        if (phone.length < 8) {
            state.customer = null;
            cart.customerPoints = 0;
            renderCart();
            return;
        }
        lookupTimer = setTimeout(async () => {
            try {
                const { customer, isNew } = await lookupCustomer(phone);
                state.customer = customer;
                const label = el<HTMLParagraphElement>('customer-lookup-label');
                if (isNew || !customer) {
                    label.textContent = 'Pelanggan baru — akan otomatis terdaftar saat checkout.';
                    label.className = 'mt-2 text-xs font-medium text-amber-600';
                    renderCustomerBox();
                    return;
                }
                renderCustomerBox();
                label.textContent = 'Pelanggan terdaftar ditemukan.';
                label.className = 'mt-2 text-xs font-medium text-emerald-600';
            } catch (error) {
                toast(error instanceof ApiError ? error.message : 'Lookup gagal.', 'error');
            }
        }, 400);
    });

    el<HTMLButtonElement>('btn-open-payment').addEventListener('click', openPayment);
    el<HTMLButtonElement>('btn-cancel-pay').addEventListener('click', closePayment);
    el<HTMLButtonElement>('btn-confirm-pay').addEventListener('click', submitPayment);

    document.querySelectorAll<HTMLButtonElement>('[data-pay-method]').forEach((btn) =>
        btn.addEventListener('click', () => {
            state.paymentMethod = (btn.dataset.payMethod as 'cash' | 'qris') ?? 'cash';
            renderPaymentBody();
        }),
    );

    el<HTMLInputElement>('input-cash').addEventListener('input', renderPaymentBody);

    el<HTMLButtonElement>('btn-close-receipt').addEventListener('click', closeReceipt);
    el<HTMLButtonElement>('btn-print-receipt').addEventListener('click', () => window.print());
}

async function refreshProducts(): Promise<void> {
    try {
        state.products = await fetchProducts();
        renderCategoryChips();
        renderProductGrid();
    } catch (error) {
        toast(error instanceof ApiError ? error.message : 'Gagal memuat katalog.', 'error');
    }
}

function init(): void {
    // Halaman POS punya root eksklusif; di halaman lain (mis. /dashboard) module ini no-op
    // supaya tidak crash dan tidak menghentikan module JS lain setelahnya.
    if (!document.getElementById('pos-outlet-id')) return;

    outletId = el<HTMLInputElement>('pos-outlet-id').value;
    bindEvents();
    cart.subscribe(renderCart);
    renderCart();
    void refreshProducts();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
