import type { ApiProduct } from './api.js';

export class CartLine {
    constructor(
        public product: ApiProduct,
        public quantity: number,
    ) {}

    get lineTotal(): number {
        return this.product.selling_price * this.quantity;
    }
}

export class Cart {
    private lines: CartLine[] = [];

    private discountAmount = 0;

    private pointsToRedeem = 0;

    constructor(private readonly listeners: Set<() => void> = new Set()) {}

    subscribe(fn: () => void): () => void {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    private notify(): void {
        this.listeners.forEach((fn) => fn());
    }

    add(product: ApiProduct): void {
        const existing = this.lines.find((line) => line.product.id === product.id);

        if (existing) {
            if (product.stock > 0 && existing.quantity >= product.stock) {
                throw new Error(`Stok "${product.name}" tinggal ${product.stock}.`);
            }
            existing.quantity += 1;
        } else {
            if (product.stock <= 0) {
                throw new Error(`Stok "${product.name}" habis.`);
            }
            this.lines.push(new CartLine(product, 1));
        }

        this.notify();
    }

    increment(productId: string): void {
        const line = this.findLine(productId);
        if (line.product.stock > 0 && line.quantity >= line.product.stock) {
            throw new Error(`Stok "${line.product.name}" tinggal ${line.product.stock}.`);
        }
        line.quantity += 1;
        this.notify();
    }

    decrement(productId: string): void {
        const line = this.findLine(productId);
        line.quantity -= 1;
        if (line.quantity <= 0) {
            this.remove(productId);
            return;
        }
        this.notify();
    }

    remove(productId: string): void {
        this.lines = this.lines.filter((line) => line.product.id !== productId);
        this.notify();
    }

    private findLine(productId: string): CartLine {
        const line = this.lines.find((l) => l.product.id === productId);
        if (!line) throw new Error('Item tidak ditemukan di keranjang.');
        return line;
    }

    setDiscount(amount: number): void {
        this.discountAmount = Math.max(0, amount);
        this.notify();
    }

    setPointsToRedeem(points: number): void {
        this.pointsToRedeem = Math.max(0, Math.floor(points));
        this.notify();
    }

    reset(): void {
        this.lines = [];
        this.discountAmount = 0;
        this.pointsToRedeem = 0;
        this.notify();
    }

    get items(): readonly CartLine[] {
        return this.lines;
    }

    get lineCount(): number {
        return this.lines.length;
    }

    get subtotal(): number {
        return this.lines.reduce((sum, line) => sum + line.lineTotal, 0);
    }

    get discount(): number {
        return Math.min(this.discountAmount, this.subtotal);
    }

    get redeemed(): number {
        return Math.min(this.pointsToRedeem, this.availablePoints);
    }

    /** Max points usable assuming 1 point = Rp 100 (server rule). */
    get availablePoints(): number {
        const fromBalance = Math.floor(this.customerPoints / 1);
        const fromTotal = Math.floor(this.subtotal / 100);
        return Math.max(0, Math.min(fromBalance, fromTotal));
    }

    customerPoints = 0;

    /** Grand total matching the server formula: subtotal - discount - (points * 100). */
    get grandTotal(): number {
        return Math.max(0, this.subtotal - this.discount - this.redeemed * 100);
    }
}
