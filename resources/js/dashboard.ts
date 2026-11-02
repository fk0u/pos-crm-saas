import { csrfToken } from './pos/api.js';

type TickerRow = {
    invoice_number: string;
    outlet: string | null;
    cashier: string | null;
    customer: string | null;
    grand_total: number;
    payment_method: string;
    created_at: string | null;
};

const idr = (amount: number): string => `Rp ${new Intl.NumberFormat('id-ID').format(amount)}`;

async function pollTicker(listElement: HTMLElement): Promise<void> {
    try {
        const response = await fetch('/dashboard/recent', {
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
        });

        const body = (await response.json()) as { data?: TickerRow[] };
        const rows = body.data ?? [];

        if (listElement && rows.length > 0) {
            listElement.innerHTML = rows
                .map(
                    (row) => `
                <li class="px-6 py-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-slate-700">${row.invoice_number}</span>
                        <span class="text-sm font-bold text-blue-700">${idr(row.grand_total)}</span>
                    </div>
                    <p class="text-xs text-slate-400">
                        ${row.outlet ?? '—'} · ${row.cashier ?? '—'} · ${row.customer ?? '—'} · ${row.payment_method.toUpperCase()}
                    </p>
                </li>`,
                )
                .join('');
        }
    } catch {
        // Offline or auth error: keep the last rendered rows, retry on the next tick.
    }
}

function init(): void {
    // Guard halaman: dashboard module hanya jalan di /dashboard.
    if (!document.getElementById('owner-dashboard-app')) return;

    const list = document.getElementById('ticker-list');
    if (!list) return;

    document.getElementById('btn-refresh-ticker')?.addEventListener('click', () => void pollTicker(list));
    window.setInterval(() => void pollTicker(list), 10000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
