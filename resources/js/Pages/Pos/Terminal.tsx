import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
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
  Percent,
  Wifi,
  WifiOff,
  Barcode,
  Delete,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  UtensilsCrossed,
  ChefHat,
  Globe,
  BellRing,
  LogOut,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/card';
import { Drawer } from '@/Components/ui/drawer';
import { Modal } from '@/Components/ui/modal';
import { Select, Input } from '@/Components/ui/input';
import { SearchInput } from '@/Components/ui/search-input';
import { useToast } from '@/Components/ui/toast';
import { categoryTone, initials } from '@/lib/analytics';
import { formatMoney, formatNumber, newClientKey } from '@/lib/format';
import {
  playTap,
  playBeep,
  playSuccessChime,
  playError,
  isSoundEnabled,
  setSoundEnabled,
  triggerHaptic,
} from '@/lib/sound';

export type POSProduct = {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  stock?: number;
  categoryId: string;
  color?: string;
  image_url?: string | null;
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

interface PosTerminalProps {
  cashierName?: string;
  userRole?: string;
  outletId?: string;
  outletName?: string;
  tenantName?: string;
  tenantId?: string;
  tenantSubdomain?: string;
  publicMenuUrl?: string | null;
  pendingOnlineOrders?: any[];
  isSuperAdmin?: boolean;
  allTenants?: { id: string; name: string; subdomain: string }[];
  initialProducts?: any[];
  initialCategories?: string[];
  initialCustomers?: any[];
  activeShift?: any;
}

export default function PosTerminal({
  cashierName = 'Samantha W',
  userRole = 'cashier',
  outletId = '',
  outletName = 'Central Outlet',
  tenantName = 'QLon Store',
  tenantId,
  tenantSubdomain,
  publicMenuUrl,
  pendingOnlineOrders = [],
  isSuperAdmin = false,
  allTenants = [],
  initialProducts = [],
  initialCategories = [],
  initialCustomers = [],
  activeShift = null,
}: PosTerminalProps) {
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Advanced features: Discount & Offline status
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [soundActive, setSoundActive] = useState<boolean>(isSoundEnabled());

  // New customer quick-add state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Online & Table Orders Queue state
  const [isOnlineOrdersOpen, setIsOnlineOrdersOpen] = useState(false);

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    playTap();
    router.post(
      `/orders/${orderId}/status`,
      { order_status: status },
      {
        onSuccess: () => {
          playSuccessChime();
          router.reload({ only: ['pendingOnlineOrders'] });
        },
      }
    );
  };

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Products normalisation directly from Database
  const products: POSProduct[] = useMemo(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU-${idx + 1}`,
        price: Number(p.selling_price || p.price || 0),
        stock: p.stock !== undefined ? Number(p.stock) : 0,
        rawCategory: p.category || 'Umum',
        categoryId: (p.category || 'umum').toLowerCase().replace(/\s+/g, '-'),
        color: ['amber', 'emerald', 'sky', 'rose', 'navy', 'violet'][idx % 6],
        image_url: p.image_url || null,
      }));
    }
    return [];
  }, [initialProducts]);

  // Dynamic Categories from Backend & Actual Database Products
  const categories = useMemo(() => {
    const list: { id: string; name: string; color: string }[] = [];
    const seen = new Set<string>();

    if (initialCategories && initialCategories.length > 0) {
      initialCategories.forEach((catName, idx) => {
        const id = catName.toLowerCase().replace(/\s+/g, '-');
        if (!seen.has(id)) {
          seen.add(id);
          list.push({
            id,
            name: catName,
            color: ['amber', 'emerald', 'sky', 'rose', 'navy', 'violet'][idx % 6],
          });
        }
      });
    }

    products.forEach((p) => {
      const id = p.categoryId;
      if (id && !seen.has(id)) {
        seen.add(id);
        list.push({
          id,
          name: (p as any).rawCategory || p.categoryId,
          color: ['amber', 'emerald', 'sky', 'rose', 'navy', 'violet'][list.length % 6],
        });
      }
    });

    return list;
  }, [initialCategories, products]);

  const [customersList, setCustomersList] = useState<POSCustomer[]>(
    initialCustomers && initialCustomers.length > 0 ? initialCustomers : fallbackCustomers
  );

  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0) {
      setCustomersList(initialCustomers);
    }
  }, [initialCustomers]);

  const handleRefresh = () => {
    playTap();
    triggerHaptic('light');
    setIsRefreshing(true);
    router.reload({
      only: ['initialProducts', 'initialCategories', 'initialCustomers'],
      onFinish: () => {
        setIsRefreshing(false);
        triggerHaptic('success');
      },
    });
  };

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
    const matchesCategory =
      category === 'all' ||
      product.categoryId === category ||
      (product as any).rawCategory?.toLowerCase() === category.toLowerCase();
    const haystack = `${product.name} ${product.sku} ${(product as any).rawCategory || ''}`.toLocaleLowerCase('id-ID');
    return matchesCategory && haystack.includes(query.trim().toLocaleLowerCase('id-ID'));
  });

  const totals = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountPercent > 0 ? Math.round((rawSubtotal * discountPercent) / 100) : 0;
    const subtotal = Math.max(0, rawSubtotal - discountAmount);
    const tax = settings.taxEnabled ? Math.round((subtotal * settings.taxRate) / 100) : 0;
    const service = settings.serviceEnabled ? Math.round((subtotal * settings.serviceRate) / 100) : 0;
    return {
      rawSubtotal,
      discountAmount,
      subtotal,
      tax,
      service,
      total: subtotal + tax + service,
      items: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart, settings, discountPercent]);

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

  // Keyboard shortcut '/' to search & 'F2' or 'b' to pay
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === 'F2' || (event.key === 'b' && cart.length > 0 && !paymentOpen)) {
        event.preventDefault();
        openPayment();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart, paymentOpen]);

  // Hardware Barcode Scanner Listener buffer
  useEffect(() => {
    let buffer = '';
    let lastTime = 0;

    const onBarcodeKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      const now = Date.now();
      if (now - lastTime > 200) buffer = '';
      lastTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          const needle = buffer.trim().toLowerCase();
          const found = products.find(
            (p) => p.sku.toLowerCase() === needle || String(p.id).toLowerCase() === needle
          );
          if (found) {
            add(found);
            playBeep();
            triggerHaptic('medium');
            toast({
              title: 'Barcode Berhasil Discan',
              description: `${found.name} telah masuk ke pesanan.`,
              tone: 'primary',
            });
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', onBarcodeKey);
    return () => window.removeEventListener('keydown', onBarcodeKey);
  }, [products]);

  const add = (product: POSProduct) => {
    playTap();
    triggerHaptic('light');
    const inCart = cart.find((item) => item.id === product.id)?.quantity ?? 0;
    if (product.stock !== undefined && inCart + 1 > product.stock) {
      playError();
      triggerHaptic('error');
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
    triggerHaptic('light');
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
    triggerHaptic('medium');
    if (!checkoutKey) setCheckoutKey(newClientKey());
    setReceived(String(totals.total));
    setPaymentOpen(true);
  };

  const handleNumpadPress = (digit: string | number) => {
    playTap();
    triggerHaptic('light');
    if (digit === 'C') {
      setReceived('');
    } else if (digit === '00') {
      if (receivedValue > 0) {
        setReceived(String(receivedValue * 100));
      }
    } else if (digit === '000') {
      if (receivedValue > 0) {
        setReceived(String(receivedValue * 1000));
      }
    } else {
      setReceived(`${receivedValue ? receivedValue : ''}${digit}`);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSuperAdmin || userRole === 'superadmin') {
      playError();
      triggerHaptic('error');
      toast.show('Akses Dibatasi: Superadmin dilarang memproses transaksi kasir demi integritas data tenant.', 'error');
      return;
    }

    if (method === 'cash' && change < 0) {
      playError();
      triggerHaptic('error');
      return;
    }

    setPending(true);
    playTap();
    triggerHaptic('heavy');

    let receiptNum = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    let finalGrandTotal = totals.total;
    let finalChangeAmount = method === 'cash' ? Math.max(0, change) : 0;
    let finalPointsEarned = pointsPreview;
    let orderId = '';

    try {
      const csrfToken =
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ||
        (document.querySelector('input[name="_token"]') as HTMLInputElement)?.value ||
        '';

      const isUuid = (val?: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val || '');

      const payload = {
        outlet_id: isUuid(outletId) ? outletId : undefined,
        items: cart.map((i) => ({ product_id: String(i.id), quantity: i.quantity })),
        customer_phone: selectedCustomer?.phone ?? (selectedCustomer ? '0812' + Math.floor(10000000 + Math.random() * 90000000) : null),
        customer_name: selectedCustomer?.name ?? null,
        discount_amount: totals.discountAmount,
        tax_amount: totals.tax,
        points_redeemed: 0,
        payment_method: method === 'cash' ? 'cash' : method === 'qris' ? 'qris' : method === 'card' ? 'debit' : 'bank_transfer',
        cash_tendered: method === 'cash' ? receivedValue : totals.total,
      };

      const res = await fetch('/api/v1/pos/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.data) {
          orderId = json.data.order_id || '';
          receiptNum = json.data.invoice_number || receiptNum;
          finalGrandTotal = Number(json.data.grand_total ?? finalGrandTotal);
          finalPointsEarned = Number(json.data.points_earned ?? finalPointsEarned);
          if (json.data.change_due !== undefined) {
            finalChangeAmount = Number(json.data.change_due);
          }
        }
      }
    } catch (err) {
      console.warn('POS Checkout sync notice:', err);
    }

    setPending(false);
    playSuccessChime();
    triggerHaptic('success');

    setSuccess({
      orderId,
      receiptNumber: receiptNum,
      customerName: selectedCustomer?.name || 'Pelanggan Umum',
      customerPhone: selectedCustomer?.phone || '',
      grandTotal: finalGrandTotal,
      changeAmount: finalChangeAmount,
      pointsEarned: finalPointsEarned,
      itemsCount: totals.items,
      items: [...cart],
      date: new Date().toLocaleString('id-ID'),
    });

    toast.show('success', `Pesanan ${receiptNum} sukses diproses!`);

    setCart([]);
    setDiscountPercent(0);
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
    triggerHaptic('light');
  };

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playTap();
  };

  // Cart Panel Subcomponent
  const cartPanel = (
    <div className="flex h-full flex-col select-none">
      {/* Customer Selector */}
      <div className="grid gap-2 border-b border-slate-100 p-4 bg-white">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Select
              aria-label="Pelanggan"
              value={customerId}
              onChange={(e) => {
                playTap();
                triggerHaptic('light');
                setCustomerId(e.target.value);
              }}
              className="pl-9 h-11"
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
            className="size-11 shrink-0 px-0 rounded-xl"
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
          <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2 text-xs animate-fade-in border border-navy-100">
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

        {/* Quick Discount Selector */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Percent className="size-3.5" /> Diskon
          </span>
          <div className="flex gap-1">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  playTap();
                  triggerHaptic('light');
                  setDiscountPercent(pct);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-bold transition ${
                  discountPercent === pct
                    ? 'bg-navy-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pct === 0 ? '0%' : `${pct}%`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="min-h-48 flex-1 overflow-y-auto overscroll-contain">
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
                    className="grid size-9 place-items-center text-slate-500 transition hover:text-rose-600 active:scale-90"
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
                    className="grid size-9 place-items-center text-slate-500 transition hover:text-navy-700 active:scale-90"
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
      <div className="border-t border-slate-100 bg-slate-50/80 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <dl className="grid gap-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <dt>Subtotal</dt>
            <dd className="money">{formatMoney(totals.rawSubtotal)}</dd>
          </div>
          {totals.discountAmount > 0 ? (
            <div className="flex justify-between text-emerald-600 font-medium">
              <dt>Diskon {discountPercent}%</dt>
              <dd className="money">-{formatMoney(totals.discountAmount)}</dd>
            </div>
          ) : null}
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
            className="px-3.5 rounded-xl active:scale-95"
            disabled={!cart.length}
            onClick={() => {
              playTap();
              triggerHaptic('light');
              setCart([]);
            }}
            aria-label="Kosongkan keranjang"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            size="lg"
            className="rounded-xl shadow-sm active:scale-[0.98] font-bold text-base"
            disabled={!cart.length || isSuperAdmin || userRole === 'superadmin'}
            onClick={() => {
              if (isSuperAdmin || userRole === 'superadmin') {
                playError();
                toast.show('Akses Dibatasi: Superadmin dilarang memproses transaksi kasir.', 'error');
                return;
              }
              openPayment();
            }}
          >
            {isSuperAdmin || userRole === 'superadmin' ? 'Transaksi Dibatasi (Superadmin)' : `Bayar ${cart.length ? formatMoney(totals.total) : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell
      userName={cashierName}
      role={userRole}
      outletName={outletName}
      tenantName={tenantName}
      isSuperAdmin={isSuperAdmin}
      allTenants={allTenants}
      selectedTenantId={tenantId}
    >
      {/* Superadmin Diagnostic Mode Warning Banner */}
      {isSuperAdmin && (
        <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                Mode Diagnostik Superadmin (Akses Baca Saja)
              </span>
              <p className="text-[11px] text-amber-800">
                Sesuai kebijakan keamanan data multi-tenant, Superadmin dilarang memproses transaksi kasir, membuka laci kas, atau memanipulasi saldo atas nama tenant.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTap();
              router.post('/superadmin/exit-delegation');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition self-start sm:self-auto cursor-pointer shadow-2xs"
          >
            <LogOut className="size-3.5" />
            <span>Keluar Delegasi</span>
          </button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_25rem]">
        {/* Left Side: Product Catalog */}
        <section className="grid min-w-0 content-start gap-4">
          {/* Top Search, Status & Scanner Badges */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk, SKU atau scan barcode..."
              shortcut="/"
              className="flex-1"
              aria-label="Cari produk"
            />

            <div className="flex items-center gap-2 shrink-0">
              {/* Online / Local Cache Status */}
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold shadow-2xs ${
                  isOnline
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
                <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Shift status badge */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate max-w-32 sm:max-w-none">{shift.outletName}</span>
              </div>

              {/* Order Masuk Online & Meja Button */}
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setIsOnlineOrdersOpen(true);
                }}
                className="relative flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2.5 text-xs font-bold text-[#0f2b5c] hover:bg-blue-100 transition shadow-2xs cursor-pointer"
                title="Antrean Order Masuk dari Pelanggan Online & Meja"
              >
                <BellRing className="size-4 text-[#0f2b5c]" />
                <span className="hidden md:inline">Order Online</span>
                {pendingOnlineOrders.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs animate-pulse">
                    {pendingOnlineOrders.length}
                  </span>
                )}
              </button>

              {/* Toko Online / Menu Publik */}
              {publicMenuUrl && (
                <a
                  href={publicMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden lg:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  title="Buka Website Menu Publik Restoran"
                >
                  <Globe className="size-3.5 text-slate-500" />
                  <span>Menu Publik</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>
              )}

              {/* Refresh Catalog Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition active:scale-90 cursor-pointer"
                title="Sinkronkan Produk dari Database"
                aria-label="Refresh Produk"
              >
                <RefreshCw className={`size-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Audio toggle button */}
              <button
                type="button"
                onClick={toggleSound}
                className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 transition active:scale-90"
                aria-label="Suara"
              >
                {soundActive ? <Volume2 className="size-4" /> : <VolumeX className="size-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Touch Momentum Scroll) */}
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none overscroll-x-contain">
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
                    triggerHaptic('light');
                    setCategory(item.id);
                  }}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 active:scale-95 ${
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

          {/* Product Grid (Responsive: 2 cols on mobile, 3 on tablet, 4 on large screens) */}
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-3 pb-44 sm:grid-cols-3 lg:pb-6 2xl:grid-cols-4">
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
                    className={`group relative overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-2xs transition duration-200 animate-fade-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 active:scale-[0.97] touch-manipulation disabled:cursor-not-allowed disabled:opacity-55 ${
                      inCart
                        ? 'border-navy-400 ring-2 ring-navy-100'
                        : 'border-slate-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-md'
                    }`}
                  >
                    {/* Top Tile with Gallery Image or Initials Fallback */}
                    <div
                      className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${tone.tile} shadow-inner`}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <>
                          <span className="text-2xl font-bold tracking-tight text-white/95 transition duration-300 group-hover:scale-110">
                            {initials(product.name)}
                          </span>
                          <div className="absolute -right-6 -top-6 size-20 rounded-full bg-white/15" />
                        </>
                      )}

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
                <PackageX className="mx-auto size-10 text-slate-300" />
                <p className="mt-3 font-bold text-slate-800">
                  {products.length === 0 ? 'Katalog Produk Masih Kosong' : 'Produk Tidak Ditemukan'}
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {products.length === 0
                    ? 'Belum ada produk aktif yang terdaftar untuk tenant/outlet ini di basis data.'
                    : 'Coba kata kunci, SKU, atau kategori lain.'}
                </p>
                {products.length === 0 && (
                  <Link
                    href="/products"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold hover:bg-[#163a75] transition shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Tambah Produk di Katalog</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Sticky Cart Panel (Tablet & Desktop dual-pane) */}
        <aside className="hidden h-[calc(100vh-8.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs lg:sticky lg:top-24 lg:block">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <p className="font-semibold text-slate-950">Pesanan saat ini</p>
            <Badge tone="primary">{totals.items} item</Badge>
          </div>
          <div className="h-[calc(100%-3.5rem)]">{cartPanel}</div>
        </aside>
      </div>

      {/* Floating Bottom Bar (Mobile Only: elevated above bottom nav bar: bottom-[calc(4.75rem+env(safe-area-inset-bottom))]) */}
      <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            playTap();
            triggerHaptic('light');
            setCartOpen(true);
          }}
          className={`flex h-14 w-full items-center justify-between rounded-2xl px-4 text-white shadow-2xl transition active:scale-[0.98] ${
            cart.length ? 'bg-navy-800 shadow-navy-900/40 ring-1 ring-white/10' : 'bg-slate-800/95 shadow-slate-900/30'
          }`}
        >
          <span className="flex items-center gap-3 text-sm font-semibold">
            <span
              key={totals.items}
              className="grid size-8 place-items-center rounded-lg bg-white/20 font-mono text-sm font-bold animate-pop"
            >
              {totals.items}
            </span>
            Lihat pesanan
          </span>
          <span className="money text-base font-bold tracking-tight">{formatMoney(totals.total)}</span>
        </button>
      </div>

      {/* Mobile Cart Drawer Bottom Sheet */}
      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Pesanan saat ini"
        description={`${totals.items} item di keranjang`}
      >
        <div className="-mx-6 -my-5 h-[72vh]">{cartPanel}</div>
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
        <form onSubmit={handleCheckoutSubmit} className="grid gap-4">
          {/* Total Tagihan Card */}
          <div className="rounded-2xl bg-gradient-to-br from-navy-700 to-navy-950 p-5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-navy-200">Total tagihan</p>
              {discountPercent > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Diskon {discountPercent}%
                </span>
              )}
            </div>
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
                    triggerHaptic('light');
                    setMethod(option.value);
                  }}
                  className={`grid h-20 place-items-center gap-1 rounded-xl border text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 active:scale-95 ${
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

              {/* Quick Cash Options */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickCash.map((value, index) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      playTap();
                      triggerHaptic('light');
                      setReceived(String(value));
                    }}
                    className={`h-10 rounded-lg border text-xs font-semibold transition active:scale-95 ${
                      receivedValue === value
                        ? 'border-navy-600 bg-navy-700 text-white shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:border-navy-300 bg-white'
                    }`}
                  >
                    {index === 0 ? 'Uang pas' : formatMoney(value)}
                  </button>
                ))}
              </div>

              {/* Native Touch Numpad for Tablet/Mobile */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '000', 0, 'C'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleNumpadPress(k)}
                    className="h-11 rounded-lg border border-slate-200 bg-white font-mono text-base font-bold text-slate-800 transition active:scale-95 hover:bg-slate-50"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                  change >= 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
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
            className="h-13 text-base rounded-xl font-bold shadow-sm active:scale-[0.98]"
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

      {/* Success Modal (Drawer variant="center") with Thermal Receipt Preview */}
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

            {/* Printable Thermal Receipt Slip (hidden on screen, visible on print) */}
            <div className="hidden print:block text-left font-mono text-xs p-4 bg-white">
              <div className="text-center pb-2 border-b border-black">
                <p className="font-bold text-sm">{tenantName}</p>
                <p>{outletName}</p>
                <p className="text-[10px]">{success.date}</p>
                <p className="text-[10px]">{success.receiptNumber}</p>
              </div>
              <div className="py-2 border-b border-black space-y-1">
                {success.items?.map((it: CartItem) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.name} x{it.quantity}</span>
                    <span>{formatMoney(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-right font-bold">
                <div className="flex justify-between">
                  <span>TOTAL:</span>
                  <span>{formatMoney(success.grandTotal)}</span>
                </div>
                <div className="flex justify-between font-normal">
                  <span>Kembalian:</span>
                  <span>{formatMoney(success.changeAmount)}</span>
                </div>
              </div>
              <p className="text-center text-[10px] pt-4">Terima kasih atas kunjungan Anda!</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  if (success.orderId) {
                    window.open(`/invoices/${success.orderId}/receipt`, '_blank');
                  } else {
                    window.print();
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs active:scale-95"
              >
                <Printer className="size-3.5" />
                Cetak Struk Thermal
              </button>

              <button
                type="button"
                onClick={() => {
                  playTap();
                  if (success.orderId) {
                    if (success.customerPhone) {
                      window.open(`/invoices/${success.orderId}/whatsapp`, '_blank');
                    } else {
                      const p = prompt('Masukkan nomor WhatsApp pelanggan (contoh: 08123456789):');
                      if (p) {
                        window.open(`/invoices/${success.orderId}/whatsapp?phone=${encodeURIComponent(p)}`, '_blank');
                      }
                    }
                  } else {
                    const p = prompt('Masukkan nomor WhatsApp pelanggan (contoh: 08123456789):');
                    if (p) {
                      const text = encodeURIComponent(`*${tenantName}*\nNota: ${success.receiptNumber}\nTotal: Rp ${success.grandTotal.toLocaleString('id-ID')}\nTerima kasih!`);
                      window.open(`https://wa.me/62${p.replace(/^0+/, '')}?text=${text}`, '_blank');
                    }
                  }
                }}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-2xs active:scale-95"
              >
                <MessageCircle className="size-3.5" />
                Kirim WhatsApp
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {success.orderId ? (
                <a
                  href={`/invoices/${success.orderId}/receipt`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition active:scale-95 text-center"
                >
                  <ExternalLink className="size-3.5" />
                  Buka Halaman Struk
                </a>
              ) : (
                <div />
              )}

              <Button
                size="lg"
                className="rounded-xl active:scale-95 h-11 text-xs"
                onClick={() => {
                  playTap();
                  triggerHaptic('light');
                  setSuccess(null);
                  searchRef.current?.focus();
                }}
              >
                <Plus className="size-3.5" />
                Transaksi Baru
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Modal Antrean Order Masuk Online & Meja */}
      <Modal
        isOpen={isOnlineOrdersOpen}
        onClose={() => setIsOnlineOrdersOpen(false)}
        title="Antrean Pesanan Masuk (Online & Meja)"
        description="Pesanan langsung dari pelanggan via QR Meja atau website resto publik."
        maxWidth="3xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {pendingOnlineOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <UtensilsCrossed className="size-6" />
              </div>
              <p className="font-semibold text-slate-700">Belum Ada Order Masuk</p>
              <p className="text-xs text-slate-500 mt-1">
                Pesanan yang dibuat oleh pelanggan melalui QR meja atau website online resto akan muncul di sini secara real-time.
              </p>
              {publicMenuUrl && (
                <a
                  href={publicMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0f2b5c] hover:bg-slate-50 shadow-2xs"
                >
                  <Globe className="size-3.5" />
                  <span>Buka Website Menu Pelanggan</span>
                  <ExternalLink className="size-3 text-slate-400" />
                </a>
              )}
            </div>
          ) : (
            pendingOnlineOrders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-2xs space-y-3 transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{order.invoice_number}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        order.order_type === 'dine_in'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {order.order_type === 'dine_in' ? `Dine-In (Meja ${order.table_number || '-'})` : 'Bawa Pulang (Takeaway)'}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        order.order_status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : order.order_status === 'accepted'
                          ? 'bg-blue-100 text-blue-700'
                          : order.order_status === 'preparing'
                          ? 'bg-purple-100 text-purple-700'
                          : order.order_status === 'ready'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.order_status === 'pending'
                        ? 'Menunggu Konfirmasi'
                        : order.order_status === 'accepted'
                        ? 'Diterima Kasir'
                        : order.order_status === 'preparing'
                        ? 'Sedang Dimasak Dapur'
                        : order.order_status === 'ready'
                        ? 'Siap Saji'
                        : order.order_status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Rp {order.total_amount.toLocaleString('id-ID')}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      {order.payment_method?.toUpperCase()} · {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Data Pelanggan</span>
                    <div className="font-semibold text-slate-800">{order.customer_name || 'Pelanggan'}</div>
                    {order.customer_phone && <div className="text-slate-500">{order.customer_phone}</div>}
                    {order.notes && (
                      <div className="mt-1 rounded-lg bg-amber-50 p-2 text-[11px] text-amber-800 border border-amber-200/60">
                        Catatan: {order.notes}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">Rincian Item</span>
                    <div className="space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700">
                            {item.quantity}x {item.name}
                            {item.notes ? <span className="text-slate-400 italic text-[10px] ml-1">({item.notes})</span> : null}
                          </span>
                          <span className="font-mono text-slate-500">Rp {item.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                  {order.order_status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs gap-1.5"
                    >
                      <CircleCheck className="size-3.5" />
                      Terima Order
                    </Button>
                  )}
                  {order.order_status === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs gap-1.5"
                    >
                      <ChefHat className="size-3.5" />
                      Kirim ke Dapur
                    </Button>
                  )}
                  {order.order_status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5"
                    >
                      <UtensilsCrossed className="size-3.5" />
                      Siap Disajikan
                    </Button>
                  )}
                  {order.order_status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs gap-1.5"
                    >
                      <CircleCheck className="size-3.5" />
                      Selesaikan Pesanan
                    </Button>
                  )}
                  {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Yakin ingin membatalkan pesanan online ini?')) {
                          handleUpdateOrderStatus(order.id, 'cancelled');
                        }
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs"
                    >
                      Batalkan
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
