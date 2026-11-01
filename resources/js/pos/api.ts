/**
 * Thin typed wrappers for the POS/CRM API v1.
 * All functions throw an ApiError on non-2xx responses.
 */

export type ApiProduct = {
    id: string;
    name: string;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    selling_price: number;
    stock: number;
    is_active: boolean;
};

export type ApiCustomer = {
    id: string;
    phone: string;
    name: string;
    loyalty_points: number;
    total_spend: number;
    visit_count: number;
    last_visit: string | null;
};

export type CheckoutItem = {
    product_id: string;
    quantity: number;
};

export type CheckoutPayload = {
    outlet_id: string;
    items: CheckoutItem[];
    customer_phone: string | null;
    customer_name: string | null;
    discount_amount: number;
    tax_amount: number;
    points_redeemed: number;
    payment_method: 'cash' | 'qris';
    cash_tendered: number | null;
};

export type CheckoutResult = {
    order_id: string;
    invoice_number: string;
    grand_total: number;
    change_due: number;
    points_earned: number;
    customer: {
        phone: string;
        name: string;
        loyalty_points: number;
    } | null;
};

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: Record<string, string[]> | null = null,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handle<T>(response: Response): Promise<T> {
    const body = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string; data?: T; errors?: Record<string, string[]> }
        | null;

    if (!response.ok) {
        const message =
            body?.message ??
            (body?.errors ? Object.values(body.errors).flat().join(' ') : 'Terjadi kesalahan pada server.');
        throw new ApiError(message, response.status, body?.errors ?? null);
    }

    return (body?.data ?? body) as T;
}

export function csrfToken(): string {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    return token;
}

export async function fetchProducts(): Promise<ApiProduct[]> {
    const response = await fetch('/api/v1/pos/products', {
        headers: { Accept: 'application/json' },
    });

    const body = (await response.json()) as { data: ApiProduct[] };

    if (!response.ok) {
        throw new ApiError(body?.message ?? 'Gagal memuat produk.', response.status);
    }

    return body.data;
}

export async function lookupCustomer(phone: string): Promise<{ customer: ApiCustomer | null; isNew: boolean }> {
    const response = await fetch(`/api/v1/crm/customer/lookup?phone=${encodeURIComponent(phone)}`, {
        headers: { Accept: 'application/json' },
    });

    if (response.status === 404) {
        return { customer: null, isNew: true };
    }

    const body = (await response.json()) as { data?: ApiCustomer };

    if (!response.ok) {
        throw new ApiError(body?.message ?? 'Gagal lookup pelanggan.', response.status);
    }

    return { customer: body?.data ?? null, isNew: false };
}

export async function checkout(payload: CheckoutPayload): Promise<{ message: string; data: CheckoutResult }> {
    const response = await fetch('/api/v1/pos/checkout', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(payload),
    });

    const body = (await response.json()) as { message?: string; data?: CheckoutResult; errors?: Record<string, string[]> };

    if (!response.ok) {
        const message =
            body?.message ??
            (body?.errors ? Object.values(body.errors).flat().join(' ') : 'Checkout gagal. Coba lagi.');
        throw new ApiError(message, response.status, body?.errors ?? null);
    }

    return { message: body.message ?? 'Transaksi berhasil', data: body.data as CheckoutResult };
}
