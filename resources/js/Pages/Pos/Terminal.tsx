import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  Banknote,
  CircleCheck,
  Clock3,
  CreditCard,
  Landmark,
  LoaderCircle,
  Minus,
  PackageX,
  Plus,
  Printer,
  QrCode,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserPlus,
  UserRound,
  Store,
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/card';
import { Drawer } from '@/Components/ui/drawer';
import { Select, Input } from '@/Components/ui/input';
import { SearchInput } from '@/Components/ui/search-input';
import { useToast } from '@/Components/ui/toast';
import { categoryTone, initials } from '@/lib/analytics';
import { formatMoney, formatNumber, newClientKey } from '@/lib/format';
import { playTap, playSuccessChime, playError, isSoundEnabled, setSoundEnabled } from '@/lib/sound';

export type POSProduct = {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  stock?: number;
  categoryId: string;
  color?: string;
};

export type POSCustomer = {
  id: string | number;
  name: string;
  phone?: string | null;
  points: number;
  segment: string;
};

export type POSSettings = {
  taxEnabled: boolean;
  taxRate: number;
  serviceEnabled: boolean;
  serviceRate: number;
  loyaltyEnabled: boolean;
  earnRate: number;
};

type CartItem = POSProduct & { quantity: number };
type Method = 'cash' | 'qris' | 'card' | 'transfer';

const methodOptions: { value: Method; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Tunai', icon: Banknote },
  { value: 'qris', label: 'QRIS', icon: QrCode },
  { value: 'card', label: 'Kartu', icon: CreditCard },
  { value: 'transfer', label: 'Transfer', icon: Landmark },
];

const defaultCategories = [
  { id: 'coffee', name: 'Kopi', color: 'amber' },
  { id: 'non-coffee', name: 'Non-Kopi', color: 'emerald' },
  { id: 'food', name: 'Makanan', color: 'rose' },
  { id: 'pastry', name: 'Pastry', color: 'sky' },
];

const fallbackProducts: POSProduct[] = [
  { id: '1', sku: 'KOP-001', name: 'Espresso Single', price: 18000, stock: 50, categoryId: 'coffee', color: 'amber' },
  { id: '2', sku: 'KOP-002', name: 'Cappuccino Hot', price: 24000, stock: 45, categoryId: 'coffee', color: 'amber' },
  { id: '3', sku: 'KOP-003', name: 'Iced Caffe Latte', price: 26000, stock: 40, categoryId: 'coffee', color: 'amber' },
  { id: '4', sku: 'KOP-004', name: 'Americano Ice', price: 22000, stock: 65, categoryId: 'coffee', color: 'amber' },
  { id: '5', sku: 'KOP-005', name: 'Caramel Macchiato', price: 28000, stock: 20, categoryId: 'coffee', color: 'amber' },
  { id: '6', sku: 'KOP-006', name: 'Kopi Susu Aren', price: 20000, stock: 80, categoryId: 'coffee', color: 'amber' },
  { id: '7', sku: 'TEA-001', name: 'Artisan Matcha Latte', price: 26000, stock: 25, categoryId: 'non-coffee', color: 'emerald' },
  { id: '8', sku: 'TEA-002', name: 'Earl Grey Milk Tea', price: 22000, stock: 30, categoryId: 'non-coffee', color: 'emerald' },
  { id: '9', sku: 'SNK-001', name: 'Butter Croissant', price: 24000, stock: 12, categoryId: 'pastry', color: 'sky' },
  { id: '10', sku: 'SNK-002', name: 'Pain Au Chocolat', price: 26000, stock: 8, categoryId: 'pastry', color: 'sky' },
  { id: '11', sku: 'MK-001', name: 'Nasi Goreng Kampung', price: 32000, stock: 15, categoryId: 'food', color: 'rose' },
  { id: '12', sku: 'MK-002', name: 'Mie Goreng Spesial', price: 28000, stock: 0, categoryId: 'food', color: 'rose' },
];

const fallbackCustomers: POSCustomer[] = [
  { id: 'c1', name: 'Ahmad Faisal', phone: '081234567890', points: 450, segment: 'loyal' },
  { id: 'c2', name: 'Siti Rahma', phone: '085712345678', points: 1200, segment: 'vip' },
  { id: 'c3', name: 'Budi Santoso', phone: '081398765432', points: 80, segment: 'regular' },
  { id: 'c4', name: 'Dewi Lestari', phone: '082199887766', points: 20, segment: 'new' },
];

export default function PosTerminal({
  cashierName = 'Samantha W',
  userRole = 'cashier',
  outletName = 'Central Outlet',
  tenantName = 'QLon Store',
  initialProducts = [],
  activeShift = null,
}: {
  cashierName?: string;
  userRole?: string;
  outletName?: string;
  tenantName?: string;
  initialProducts?: any[];
  activeShift?: any;
}) {
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [method, setMethod] = useState<Method>('cash');
  const [received, setReceived] = useState('');
  const [reference, setReference] = useState('');
  const [checkoutKey, setCheckoutKey] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<any | null>(null);

  // New customer quick-add state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Products normalisation
  const products: POSProduct[] = useMemo(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU-${idx + 1}`,
        price: Number(p.selling_price || p.price || 0),
        stock: p.stock !== undefined ? Number(p.stock) : 50,
        categoryId: (p.category || 'coffee').toLowerCase().replace(/\s+/g, '-'),
        color: ['amber', 'emerald', 'sky', 'rose', 'navy', 'violet'][idx % 6],
      }));
    }
    return fallbackProducts;
  }, [initialProducts]);

  const categories = defaultCategories;
  const [customersList, setCustomersList] = useState<POSCustomer[]>(fallbackCustomers);

  const settings: POSSettings = {
    taxEnabled: true,
    taxRate: 11,
    serviceEnabled: false,
    serviceRate: 0,
    loyaltyEnabled: true,
    earnRate: 10000,
  };

  const shift = {
    open: true,
    outletName: outletName || 'Central Outlet',
    openedAt: '08:00',
  };

  const filtered = products.filter((product) => {
    const matchesCategory = category === 'all' || product.categoryId === category;
    const haystack = `${product.name} ${product.sku}`.toLocaleLowerCase('id-ID');
    return matchesCategory && haystack.includes(query.trim().toLocaleLowerCase('id-ID'));
  });

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = settings.taxEnabled ? Math.round((subtotal * settings.taxRate) / 100) : 0;
    const service = settings.serviceEnabled ? Math.round((subtotal * settings.serviceRate) / 100) : 0;
    return {
      subtotal,
      tax,
      service,
      total: subtotal + tax + service,
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, settings]);

  const selectedCustomer = customersList.find((c) => String(c.id) === String(customerId));
  const pointsPreview =
    selectedCustomer && settings.loyaltyEnabled
      ? Math.floor(totals.total / (settings.earnRate || 10000))
      : 0;

  const receivedValue = Number(received.replace(/\D/g, '')) || 0;
  const change = receivedValue - totals.total;

  const quickCash = useMemo(() => {
    const total = totals.total;
    if (total <= 0) return [];
    const candidates = [
      total,
      Math.ceil(total / 10000) * 10000,
      Math.ceil(total / 50000) * 50000,
      Math.ceil(total / 100000) * 100000,
      Math.ceil(total / 100000) * 100000 + 100000,
    ];
    return [...new Set(candidates)].filter((value) => value >= total && value > 0).slice(0, 4);
  }, [totals.total]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const add = (product: POSProduct) => {
    playTap();
    const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
    if (product.stock !== undefined && inCart + 1 > product.stock) {
      playError();
      toast({
        title: 'Stok tidak cukup',
        description: `${product.name} tersisa ${product.stock}.`,
        tone: 'error',
      });
      return;
    }
    setCart((current) =>
      inCart
        ? current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...current, { ...product, quantity: 1 }]
    );
  };

  const adjust = (id: string | number, delta: number) => {
    playTap();
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const next = item.quantity + delta;
          if (item.stock !== undefined && next > item.stock) return item;
          return { ...item, quantity: next };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const openPayment = () => {
    playTap();
    if (!checkoutKey) setCheckoutKey(newClientKey());
    setReceived(String(totals.total));
    setPaymentOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'cash' && change < 0) return;

    setPending(true);
    playTap();

    const receiptNum = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Attempt backend API call if available
      await fetch('/api/v1/pos/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          outlet_id: '1',
          items: cart.map((i) => ({ product_id: String(i.id), quantity: i.quantity })),
          customer_phone: selectedCustomer?.phone ?? null,
          customer_name: selectedCustomer?.name ?? null,
          discount_amount: 0,
          tax_amount: totals.tax,
          points_redeemed: 0,
          payment_method: method === 'cash' ? 'cash' : 'qris',
          cash_tendered: method === 'cash' ? receivedValue : totals.total,
        }),
      }).catch(() => null);
    } catch {
      // fallback
    }

    setPending(false);
    playSuccessChime();

    setSuccess({
      receiptNumber: receiptNum,
      grandTotal: totals.total,
      changeAmount: method === 'cash' ? Math.max(0, change) : 0,
      pointsEarned: pointsPreview,
      itemsCount: totals.items,
    });

    setCart([]);
    setCustomerId('');
    setPaymentOpen(false);
    setCartOpen(false);
    setCheckoutKey('');
    setReceived('');
    setReference('');
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    const newCust: POSCustomer = {
      id: `c_${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim() || undefined,
      points: 0,
      segment: 'new',
    };
    setCustomersList((prev) => [newCust, ...prev]);
    setCustomerId(String(newCust.id));
    setNewCustName('');
    setNewCustPhone('');
    setQuickAddOpen(false);
    playTap();
  };

  // Cart Panel Subcomponent
  const cartPanel = (
    <div className="flex h-full flex-col">
      {/* Customer Selector */}
      <div className="grid gap-2 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Select
              aria-label="Pelanggan"
              value={customerId}
              onChange={(e) => {
                playTap();
                setCustomerId(e.target.value);
              }}
              className="pl-9"
            >
              <option value="">Pelanggan umum</option>
              {customersList.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.phone ? ` · ${customer.phone}` : ''}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="secondary"
            className="size-11 shrink-0 px-0 rounded-lg"
            aria-label="Tambah pelanggan baru"
            onClick={() => {
              playTap();
              setQuickAddOpen(true);
            }}
          >
            <UserPlus className="size-4" />
          </Button>
        </div>

        {selectedCustomer ? (
          <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2 text-xs animate-fade-in">
            <span className="font-semibold capitalize text-navy-800">
              {selectedCustomer.segment} · {formatNumber(selectedCustomer.points)} poin
            </span>
            {pointsPreview > 0 ? (
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Sparkles className="size-3.5" />+{pointsPreview} poin
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Cart Items List */}
      <div className="min-h-48 flex-1 overflow-y-auto">
        {cart.length ? (
          <ul className="divide-y divide-slate-100">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-4 animate-fade-up">
                <div
                  className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-xs ${categoryTone(item.color).tile}`}
                >
                  {initials(item.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="money mt-0.5 text-xs text-slate-500">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => adjust(item.id, -1)}
                    aria-label={`Kurangi ${item.name}`}
                    className="grid size-9 place-items-center text-slate-500 transition hover:text-rose-600"
                  >
                    {item.quantity === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                  </button>
                  <span
                    key={item.quantity}
                    className="w-7 text-center font-mono text-sm font-bold text-slate-900 animate-pop"
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjust(item.id, 1)}
                    aria-label={`Tambah ${item.name}`}
                    className="grid size-9 place-items-center text-slate-500 transition hover:text-navy-700"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid h-full min-h-48 place-items-center px-6 text-center">
            <div>
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <ShoppingBag className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">Keranjang masih kosong</p>
              <p className="mt-1 text-xs text-slate-500">Ketuk produk untuk menambahkannya.</p>
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary & Payment Button */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-4">
        <dl className="grid gap-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <dt>Subtotal</dt>
            <dd className="money">{formatMoney(totals.subtotal)}</dd>
          </div>
          {settings.taxEnabled ? (
            <div className="flex justify-between text-slate-500">
              <dt>Pajak {settings.taxRate}%</dt>
              <dd className="money">{formatMoney(totals.tax)}</dd>
            </div>
          ) : null}
          <div className="mt-1 flex items-end justify-between border-t border-dashed border-slate-200 pt-2.5">
            <dt className="font-semibold text-slate-900">Total</dt>
            <dd
              key={totals.total}
              className="money text-2xl font-bold tracking-tight text-slate-950 animate-fade-in"
            >
              {formatMoney(totals.total)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 grid grid-cols-[auto_1fr] gap-2">
          <Button
            variant="secondary"
            size="lg"
            className="px-3 rounded-xl"
            disabled={!cart.length}
            onClick={() => {
              playTap();
              setCart([]);
            }}
            aria-label="Kosongkan keranjang"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            size="lg"
            className="rounded-xl shadow-sm"
            disabled={!cart.length}
            onClick={openPayment}
          >
            Bayar {cart.length ? formatMoney(totals.total) : ''}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell userName={cashierName} role={userRole} outletName={outletName} tenantName={tenantName}>
      <div className="grid gap-5 xl:grid-cols-[1fr_25rem]">
        {/* Left Side: Product Catalog */}
        <section className="grid min-w-0 content-start gap-4">
          {/* Search & Shift Status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk atau SKU..."
              shortcut="/"
              className="flex-1"
              aria-label="Cari produk"
            />
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 shadow-2xs">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Shift aktif · {shift.outletName}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {[{ id: 'all', name: 'Semua', color: 'navy' }, ...categories].map((item) => {
              const active = category === item.id;
              const count =
                item.id === 'all'
                  ? products.length
                  : products.filter((p) => p.categoryId === item.id).length;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playTap();
                    setCategory(item.id);
                  }}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
                    active
                      ? 'border-navy-700 bg-navy-700 text-white shadow-md shadow-navy-700/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-navy-200 hover:text-navy-700 shadow-2xs'
                  }`}
                >
                  {item.id !== 'all' ? (
                    <span className={`size-2 rounded-full ${categoryTone(item.color).dot}`} />
                  ) : null}
                  {item.name}
                  <span className={`text-xs ${active ? 'text-navy-200' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-3 pb-28 sm:grid-cols-3 xl:pb-0 2xl:grid-cols-4">
              {filtered.map((product, index) => {
                const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
                const soldOut = product.stock !== undefined && product.stock <= 0;
                const tone = categoryTone(product.color);

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={soldOut}
                    onClick={() => add(product)}
                    style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
                    className={`group relative overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-2xs transition duration-200 animate-fade-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-55 ${
                      inCart
                        ? 'border-navy-400 ring-2 ring-navy-100'
                        : 'border-slate-200 hover:-translate-y-1 hover:border-navy-200 hover:shadow-md'
                    }`}
                  >
                    {/* Top Tile with Initials */}
                    <div
                      className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${tone.tile} shadow-inner`}
                    >
                      <span className="text-2xl font-bold tracking-tight text-white/95 transition duration-300 group-hover:scale-110">
                        {initials(product.name)}
                      </span>
                      <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/15" />

                      {inCart ? (
                        <span
                          key={inCart}
                          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white font-mono text-xs font-bold text-navy-800 shadow animate-pop"
                        >
                          {inCart}
                        </span>
                      ) : null}

                      {soldOut ? (
                        <span className="absolute inset-0 grid place-items-center bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-2xs">
                          <span className="flex items-center gap-1.5">
                            <PackageX className="size-4" />
                            Habis
                          </span>
                        </span>
                      ) : null}
                    </div>

                    {/* Product Name & Pricing */}
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900">
                      {product.name}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p className="money text-sm font-bold text-navy-800">
                        {formatMoney(product.price)}
                      </p>
                      {product.stock !== undefined && !soldOut ? (
                        <span
                          className={`text-[11px] font-semibold ${
                            product.stock <= 5 ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          {product.stock} stok
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs">
              <div>
                <PackageX className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-800">Produk tidak ditemukan</p>
                <p className="mt-1 text-sm text-slate-500">
                  Coba kata kunci, SKU, atau kategori lain.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Sticky Cart Panel (Desktop) */}
        <aside className="hidden h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs xl:sticky xl:top-24 xl:block">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <p className="font-semibold text-slate-950">Pesanan saat ini</p>
            <Badge tone="primary">{totals.items} item</Badge>
          </div>
          <div className="h-[calc(100%-3.5rem)]">{cartPanel}</div>
        </aside>
      </div>

      {/* Floating Bottom Bar (Mobile) */}
      <div className="fixed inset-x-3 bottom-20 z-30 xl:hidden">
        <button
          type="button"
          onClick={() => {
            playTap();
            setCartOpen(true);
          }}
          className={`flex h-14 w-full items-center justify-between rounded-2xl px-4 text-white shadow-xl transition ${
            cart.length ? 'bg-navy-800 shadow-navy-900/30' : 'bg-slate-700/90'
          }`}
        >
          <span className="flex items-center gap-3 text-sm font-semibold">
            <span
              key={totals.items}
              className="grid size-8 place-items-center rounded-lg bg-white/15 font-mono animate-pop"
            >
              {totals.items}
            </span>
            Lihat pesanan
          </span>
          <span className="money text-base font-bold">{formatMoney(totals.total)}</span>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Pesanan saat ini"
        description={`${totals.items} item di keranjang`}
      >
        <div className="-mx-6 -my-5 h-[70vh]">{cartPanel}</div>
      </Drawer>

      {/* Quick Add Customer Drawer */}
      <Drawer
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Pelanggan baru"
        description="Pelanggan langsung terpilih untuk transaksi ini."
      >
        <form onSubmit={handleQuickAddCustomer} className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-slate-800">
            Nama Pelanggan
            <Input
              required
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-800">
            Nomor Telepon / WhatsApp
            <Input
              type="tel"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="081234567890"
            />
          </label>
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="secondary" onClick={() => setQuickAddOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan &amp; Pilih</Button>
          </div>
        </form>
      </Drawer>

      {/* Payment Modal (Drawer variant="center") */}
      <Drawer
        open={paymentOpen}
        onClose={() => !pending && setPaymentOpen(false)}
        title="Pembayaran"
        description={selectedCustomer ? `Pelanggan: ${selectedCustomer.name}` : 'Pelanggan umum'}
        variant="center"
      >
        <form onSubmit={handleCheckoutSubmit} className="grid gap-5">
          {/* Total Tagihan Card */}
          <div className="rounded-2xl bg-gradient-to-br from-navy-700 to-navy-950 p-5 text-white shadow-md">
            <p className="text-xs font-medium text-navy-200">Total tagihan</p>
            <p className="money mt-1 text-3xl font-bold tracking-tight">
              {formatMoney(totals.total)}
            </p>
            <p className="mt-2 text-xs text-navy-200">
              {totals.items} item{pointsPreview ? ` · +${pointsPreview} poin loyalti` : ''}
            </p>
          </div>

          {/* Payment Method Selector */}
          <div role="radiogroup" aria-label="Metode pembayaran" className="grid grid-cols-4 gap-2">
            {methodOptions.map((option) => {
              const Icon = option.icon;
              const active = method === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    playTap();
                    setMethod(option.value);
                  }}
                  className={`grid h-20 place-items-center gap-1 rounded-xl border text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
                    active
                      ? 'border-navy-600 bg-navy-50 text-navy-800 ring-2 ring-navy-100 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:border-navy-200 bg-white'
                  }`}
                >
                  <Icon className="size-5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Method Content */}
          {method === 'cash' ? (
            <div className="grid gap-3 animate-fade-in">
              <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="received">
                Uang diterima
                <input
                  id="received"
                  inputMode="numeric"
                  value={receivedValue ? formatNumber(receivedValue) : ''}
                  onChange={(e) => setReceived(e.target.value)}
                  className="money h-14 w-full rounded-xl border border-slate-200 px-4 text-2xl font-bold text-slate-950 outline-none focus:border-navy-500 focus:ring-4 focus:ring-navy-100 shadow-2xs"
                  placeholder="0"
                />
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickCash.map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      playTap();
                      setReceived(String(value));
                    }}
                    className={`h-10 rounded-lg border text-xs font-semibold transition ${
                      receivedValue === value
                        ? 'border-navy-600 bg-navy-700 text-white shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:border-navy-300 bg-white'
                    }`}
                  >
                    {index === 0 ? 'Uang pas' : formatMoney(value)}
                  </button>
                ))}
              </div>

              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                  change >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                <span>{change >= 0 ? 'Kembalian' : 'Kurang'}</span>
                <span className="money text-lg">{formatMoney(Math.abs(change))}</span>
              </div>
            </div>
          ) : method === 'qris' ? (
            <div className="grid gap-3 animate-fade-in">
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-navy-800">
                <p className="font-semibold text-sm mb-1">Konfirmasi QRIS Pelanggan</p>
                <p className="text-slate-600">
                  Pastikan Anda telah melihat <strong>bukti transaksi berhasil</strong> langsung di layar ponsel pelanggan sebelum menekan tombol konfirmasi.
                </p>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-800" htmlFor="reference">
                Nomor RRN / Ref <span className="text-xs font-normal text-slate-500">(opsional)</span>
                <input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                  placeholder="Contoh: 12 digit RRN / ID transaksi"
                />
              </label>
            </div>
          ) : (
            <label
              className="grid gap-2 text-sm font-medium text-slate-800 animate-fade-in"
              htmlFor="reference"
            >
              Nomor referensi / Kode approval <span className="text-xs font-normal text-slate-500">(opsional)</span>
              <input
                id="reference"
                name="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                placeholder="Contoh: kode approval EDC atau 4 digit kartu terakhir"
              />
            </label>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-13 text-base rounded-xl font-bold shadow-sm"
            disabled={pending || (method === 'cash' && change < 0)}
          >
            {pending ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <CircleCheck className="size-5" />
            )}
            {pending ? 'Memproses...' : 'Konfirmasi pembayaran'}
          </Button>
        </form>
      </Drawer>

      {/* Success Modal (Drawer variant="center") */}
      <Drawer
        open={Boolean(success)}
        onClose={() => setSuccess(null)}
        title="Transaksi berhasil"
        variant="center"
      >
        {success ? (
          <div className="grid gap-5 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-600 animate-pop border border-emerald-100">
              <CircleCheck className="size-11" />
            </div>

            <div>
              <p className="money text-3xl font-bold text-slate-950">
                {formatMoney(success.grandTotal)}
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-slate-500">
                {success.receiptNumber}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Kembalian</p>
                <p className="money mt-1 font-bold text-slate-900">{formatMoney(success.changeAmount)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Poin didapat</p>
                <p className="mt-1 font-mono font-bold text-emerald-700">
                  +{success.pointsEarned ?? 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <Printer className="size-4" />
                Cetak struk
              </button>
              <Button
                size="lg"
                className="rounded-xl"
                onClick={() => {
                  playTap();
                  setSuccess(null);
                  searchRef.current?.focus();
                }}
              >
                <Plus className="size-4" />
                Transaksi baru
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </AppShell>
  );
}
