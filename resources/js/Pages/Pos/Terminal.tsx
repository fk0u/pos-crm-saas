import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '@inertiajs/react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Maximize2,
  Minimize2,
  Clock,
  RotateCcw,
  Printer,
  Share2,
  CheckCircle2,
  Store,
  ArrowLeft,
  UserPlus,
  Phone,
  AlertTriangle,
  Banknote,
  CreditCard,
  Building,
  ShieldCheck,
  Check,
  Copy,
  Receipt,
  Sparkles,
  HelpCircle,
  X,
  Volume2,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Drawer } from '@/Components/ui/drawer';
import { formatMoney, formatNumber } from '@/lib/format';

interface Product {
  id: string | number;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  cost_price?: number;
  selling_price: number;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Shift {
  id?: string | number;
  status?: string;
  starting_cash?: number;
  cash_sales_total?: number;
  opened_at?: string;
}

interface PosTerminalProps {
  cashierName?: string;
  userRole?: string;
  outletId?: string | number;
  outletName?: string;
  outlets?: Array<{ id: string | number; name: string }>;
  initialProducts?: Product[];
  activeShift?: Shift | null;
}

export default function PosTerminal({
  cashierName = 'Kasir Outlet',
  userRole = 'cashier',
  outletId = '1',
  outletName = 'Samarinda Central',
  outlets = [],
  initialProducts = [],
  activeShift = null,
}: PosTerminalProps) {
  // Products
  const [products, setProducts] = useState<Product[]>(
    initialProducts.length > 0
      ? initialProducts
      : [
          { id: '1', sku: 'KOP-001', name: 'Es Kopi Susu Gula Aren', category: 'Coffee', selling_price: 18000, stock: 120 },
          { id: '2', sku: 'KOP-002', name: 'Americano Iced Double Shot', category: 'Coffee', selling_price: 15000, stock: 95 },
          { id: '3', sku: 'KOP-003', name: 'Caramel Macchiato Cloud', category: 'Coffee', selling_price: 25000, stock: 45 },
          { id: '4', sku: 'NC-001', name: 'Matcha Uji Artisan Latte', category: 'Non-Coffee', selling_price: 22000, stock: 34 },
          { id: '5', sku: 'NC-002', name: 'Earl Grey Milk Tea', category: 'Non-Coffee', selling_price: 20000, stock: 60 },
          { id: '6', sku: 'PAS-001', name: 'Butter Croissant French AOP', category: 'Pastry', selling_price: 24000, stock: 15 },
          { id: '7', sku: 'PAS-002', name: 'Pain Au Chocolat Belgian', category: 'Pastry', selling_price: 26000, stock: 12 },
          { id: '8', sku: 'PAS-003', name: 'Almond Danish Sweet', category: 'Pastry', selling_price: 28000, stock: 10 },
        ]
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(['Semua']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [manualDiscount, setManualDiscount] = useState<number>(0);

  // CRM
  const [customerPhone, setCustomerPhone] = useState('');
  const [crmCustomer, setCrmCustomer] = useState<{
    name: string;
    phone: string;
    loyalty_points: number;
    tier: string;
  } | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);

  // Native Web Audio Haptics
  const playHaptic = (freq = 880, duration = 0.04) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // quiet fallback
    }
  };

  const playSuccessChime = () => {
    playHaptic(523.25, 0.08);
    setTimeout(() => playHaptic(659.25, 0.08), 80);
    setTimeout(() => playHaptic(783.99, 0.16), 160);
  };

  // Cart Manipulations
  const addToCart = (product: Product) => {
    playHaptic(920, 0.04);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prev;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    playHaptic(delta > 0 ? 980 : 700, 0.04);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string | number) => {
    playHaptic(600, 0.05);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.selling_price * item.quantity, 0);
  }, [cart]);

  const pointsDiscountAmount = useMemo(() => {
    if (!useLoyaltyPoints || !crmCustomer) return 0;
    return (crmCustomer.loyalty_points || 0) * 100;
  }, [useLoyaltyPoints, crmCustomer]);

  const taxAmount = useMemo(() => {
    const base = Math.max(0, subtotal - manualDiscount - pointsDiscountAmount);
    return Math.round(base * 0.1);
  }, [subtotal, manualDiscount, pointsDiscountAmount]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - manualDiscount - pointsDiscountAmount + taxAmount);
  }, [subtotal, manualDiscount, pointsDiscountAmount, taxAmount]);

  // Payment Modal & Real Looks Tender
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'debit' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [qrisVerified, setQrisVerified] = useState(true);
  const [selectedEdcBank, setSelectedEdcBank] = useState('BCA');
  const [edcApprovalCode, setEdcApprovalCode] = useState('');
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [lastCartSnapshot, setLastCartSnapshot] = useState<CartItem[]>([]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    return (cashTendered || 0) - grandTotal;
  }, [paymentMethod, cashTendered, grandTotal]);

  const openPaymentModal = () => {
    setCashTendered(grandTotal);
    setQrisVerified(true);
    setEdcApprovalCode('');
    setShowPaymentModal(true);
  };

  // Customer Lookup
  const lookupCustomer = async () => {
    if (!customerPhone.trim()) return;
    setIsLookingUpCustomer(true);
    try {
      const res = await fetch(`/api/v1/crm/customer/lookup?phone=${encodeURIComponent(customerPhone.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCrmCustomer(data.data);
      } else {
        setCrmCustomer({
          name: 'Pelanggan Baru',
          phone: customerPhone,
          loyalty_points: 0,
          tier: 'Silver',
        });
      }
    } catch {
      setCrmCustomer({
        name: 'Pelanggan Baru',
        phone: customerPhone,
        loyalty_points: 0,
        tier: 'Silver',
      });
    } finally {
      setIsLookingUpCustomer(false);
    }
  };

  // Checkout Execution
  const handleCheckout = async () => {
    if (paymentMethod === 'qris' && !qrisVerified) {
      alert('Mohon verifikasi bahwa Anda telah melihat bukti pembayaran di HP pembeli.');
      return;
    }
    if (paymentMethod === 'cash' && cashTendered < grandTotal) {
      alert('Uang tunai yang diterima kurang dari total belanja.');
      return;
    }

    setIsProcessing(true);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    try {
      const payload = {
        outlet_id: outletId,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        customer_phone: customerPhone || null,
        customer_name: crmCustomer?.name || null,
        discount_amount: manualDiscount,
        tax_amount: taxAmount,
        points_redeemed: useLoyaltyPoints && crmCustomer ? crmCustomer.loyalty_points : 0,
        payment_method: paymentMethod,
        cash_tendered: paymentMethod === 'cash' ? cashTendered : grandTotal,
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
        setCompletedOrder(data.data);
        setLastCartSnapshot([...cart]);

        // Deduct local stock
        setProducts((prev) =>
          prev.map((p) => {
            const found = cart.find((i) => i.product.id === p.id);
            return found ? { ...p, stock: Math.max(0, p.stock - found.quantity) } : p;
          })
        );

        // Reset cart
        setCart([]);
        setManualDiscount(0);
        setUseLoyaltyPoints(false);
        setCustomerPhone('');
        setCrmCustomer(null);
        setShowPaymentModal(false);
      } else {
        alert(data.message || 'Gagal memproses transaksi.');
      }
    } catch {
      alert('Terjadi kendala koneksi saat menghubungi server kasir.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fullscreen Kiosk
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard Shortcuts (F1: Search, F4: Pay, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F4' || (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA')) {
        if (cart.length > 0 && !showPaymentModal && !completedOrder) {
          e.preventDefault();
          openPaymentModal();
        }
      } else if (e.key === 'Escape') {
        if (showPaymentModal) setShowPaymentModal(false);
        if (completedOrder) setCompletedOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showPaymentModal, completedOrder, grandTotal]);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top POS Header */}
      <header className="h-14 bg-navy-900 text-white px-4 flex items-center justify-between border-b border-navy-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-navy-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Store className="size-4 text-sky-400" />
            <span className="font-bold text-sm tracking-tight">{outletName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Shift Kasir Aktif
            </span>
          </div>
        </div>

        {/* Center search helper info */}
        <div className="hidden md:flex items-center gap-2 text-xs text-navy-200">
          <span className="px-1.5 py-0.5 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">F1</span>
          <span>Cari Menu</span>
          <span className="text-navy-600">&bull;</span>
          <span className="px-1.5 py-0.5 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">F4 / Spasi</span>
          <span>Bayar</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 transition-colors"
            title="Mode Layar Penuh Kiosk"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-navy-700 text-xs text-navy-200">
            <div className="size-7 rounded-full bg-navy-700 flex items-center justify-center font-bold text-sky-400 text-xs">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-medium">{cashierName}</span>
          </div>
        </div>
      </header>

      {/* Main Split Layout: Left Catalog, Right Sticky Cart */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= LEFT: PRODUCT CATALOG ================= */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Search bar & Category filter pills */}
          <div className="space-y-3 mb-4 shrink-0">
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder="Cari nama menu, SKU, atau scan barcode... (F1)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white border-slate-200 shadow-xs text-sm"
              />
              <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playHaptic(850, 0.03);
                    setSelectedCategory(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Cards */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const cartQty = cart.find((i) => i.product.id === p.id)?.quantity || 0;
                const isOutOfStock = p.stock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3.5 rounded-xl text-left flex flex-col justify-between transition-all relative border bg-white shadow-xs group ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-slate-200'
                        : 'hover:border-navy-600 hover:shadow-md active:scale-98 border-slate-200/90'
                    }`}
                  >
                    {/* Badge if item is in cart */}
                    {cartQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center shadow-md animate-scale-in">
                        {cartQty}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>{p.sku}</span>
                        <span className={p.stock <= 10 ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                          Stok: {p.stock}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-navy-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.category}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono font-extrabold text-sm text-navy-900">
                        {formatMoney(p.selling_price)}
                      </span>
                      <span className="size-6 rounded-md bg-slate-50 group-hover:bg-navy-900 group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
                        <Plus className="size-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STICKY CART & CHECKOUT ================= */}
        <div className="w-80 sm:w-96 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-lg z-10">
          {/* Top Cart Title & CRM Member Lookup */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-navy-900" />
                <h3 className="font-bold text-sm text-slate-900">Pesanan Aktif</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    playHaptic(600, 0.05);
                    setCart([]);
                  }}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="size-3" />
                  Kosongkan
                </button>
              )}
            </div>

            {/* Customer CRM Input */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <Input
                  placeholder="Nomor WA Pelanggan (CRM)..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupCustomer()}
                  className="h-8 text-xs bg-slate-50"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isLookingUpCustomer || !customerPhone.trim()}
                  onClick={lookupCustomer}
                  className="h-8 text-xs shrink-0 px-2.5"
                >
                  Cari
                </Button>
              </div>

              {crmCustomer && (
                <div className="p-2 rounded-lg bg-sky-50 border border-sky-100 text-[11px] flex items-center justify-between animate-fade-in">
                  <div>
                    <span className="font-bold text-slate-900 block">{crmCustomer.name}</span>
                    <span className="text-sky-700 font-mono">Poin: {crmCustomer.loyalty_points || 0} Pts</span>
                  </div>
                  {crmCustomer.loyalty_points > 0 && (
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-navy-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                        className="size-3.5 rounded text-navy-800"
                      />
                      Tukar Poin
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingCart className="size-10 stroke-[1.2] mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Keranjang masih kosong</p>
                <p className="text-[11px] text-slate-400 mt-1">Pilih menu dari katalog di sebelah kiri untuk memulai pesanan.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-slate-900 leading-snug">{item.product.name}</p>
                    <p className="font-mono text-[11px] text-slate-500 mt-0.5">
                      {formatMoney(item.product.selling_price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-slate-900 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="size-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold disabled:opacity-40"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="w-20 text-right font-mono font-bold text-slate-900 text-xs pl-2">
                    {formatMoney(item.product.selling_price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-mono font-semibold text-slate-900">{formatMoney(subtotal)}</span>
              </div>

              {pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Diskon Tukar Poin</span>
                  <span className="font-mono">-{formatMoney(pointsDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>PB1 / Pajak (10%)</span>
                <span className="font-mono font-semibold text-slate-900">{formatMoney(taxAmount)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900">Total Akhir</span>
                <span className="font-mono font-extrabold text-xl text-navy-900">{formatMoney(grandTotal)}</span>
              </div>
            </div>

            <Button
              size="lg"
              disabled={cart.length === 0}
              onClick={openPaymentModal}
              className="w-full mt-2 bg-navy-900 hover:bg-navy-800 text-white font-bold h-12 shadow-sm flex items-center justify-center gap-2"
            >
              <span>Bayar Transaksi</span>
              <span className="px-1.5 py-0.5 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">F4</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================= REAL-LOOKS PAYMENT MODAL (NO PAYMENT GATEWAY) ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-lg p-6 bg-white border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pembayaran Kasir</h3>
                <p className="text-xs text-slate-500">Pilih metode pembayaran sesuai penerimaan uang dari pembeli.</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Total Grand Due Header */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Tagihan</span>
                <span className="text-2xl font-extrabold font-mono text-navy-950">{formatMoney(grandTotal)}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-navy-100 text-navy-800 font-semibold text-xs font-mono">
                {cart.reduce((s, i) => s + i.quantity, 0)} Item
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'qris', label: 'QRIS', icon: CheckCircle2 },
                { id: 'debit', label: 'Debit EDC', icon: CreditCard },
                { id: 'transfer', label: 'Transfer', icon: Building },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playHaptic(850, 0.03);
                      setPaymentMethod(m.id as any);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* METHOD 1: CASH */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Uang Diterima dari Pelanggan</label>
                  <Input
                    type="number"
                    value={cashTendered || ''}
                    onChange={(e) => setCashTendered(Number(e.target.value))}
                    className="font-mono text-lg font-bold bg-white"
                  />
                </div>

                {/* Quick Nominal Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[grandTotal, 20000, 50000, 100000].map((nominal) => (
                    <button
                      key={nominal}
                      type="button"
                      onClick={() => setCashTendered(nominal)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 font-mono text-[11px] font-semibold text-slate-700"
                    >
                      {nominal === grandTotal ? 'Uang Pas' : formatCompactMoney(nominal)}
                    </button>
                  ))}
                </div>

                {/* Change Due Calc */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Kembalian yang Harus Diberikan:</span>
                  <span className={`font-mono text-lg font-extrabold ${changeDue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatMoney(Math.max(0, changeDue))}
                  </span>
                </div>
              </div>
            )}

            {/* METHOD 2: QRIS (NO QR IMAGE, VERIFICATION EMPHASIS) */}
            {paymentMethod === 'qris' && (
              <div className="space-y-3 p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 animate-fade-in">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-sky-900">Verifikasi Langsung di HP Pembeli</h4>
                    <p className="text-xs text-sky-800/90 leading-relaxed mt-1">
                      Pelanggan melakukan scan QRIS di meja kasir. <strong>Jangan lupa untuk melihat dan memverifikasi bukti pembayaran yang tampil di layar HP pembeli</strong> sebelum menyelesaikan transaksi ini.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-sky-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Nominal Valid:</span>
                    <span className="font-mono font-bold text-slate-900">{formatMoney(grandTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Tujuan Merchant:</span>
                    <span className="font-semibold text-slate-800">{outletName} (Omnipoint)</span>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-sky-300 cursor-pointer text-xs font-semibold text-sky-950 select-none">
                  <input
                    type="checkbox"
                    checked={qrisVerified}
                    onChange={(e) => setQrisVerified(e.target.checked)}
                    className="size-4 rounded border-sky-400 text-navy-800 focus:ring-sky-500"
                  />
                  <span>Saya sudah memeriksa dan memastikan bukti transaksi berhasil di HP pembeli</span>
                </label>
              </div>
            )}

            {/* METHOD 3: DEBIT EDC */}
            {paymentMethod === 'debit' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pilih Mesin EDC</label>
                    <select
                      value={selectedEdcBank}
                      onChange={(e) => setSelectedEdcBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="BCA">EDC BCA</option>
                      <option value="Mandiri">EDC Mandiri</option>
                      <option value="BRI">EDC BRI</option>
                      <option value="BNI">EDC BNI</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Kode Approval / Trace No</label>
                    <Input
                      placeholder="Contoh: 849201"
                      value={edcApprovalCode}
                      onChange={(e) => setEdcApprovalCode(e.target.value)}
                      className="bg-white font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gesek / tap kartu debit pelanggan pada mesin EDC fisik outlet dan pastikan slip tercetak berhasil.
                </p>
              </div>
            )}

            {/* METHOD 4: TRANSFER BANK */}
            {paymentMethod === 'transfer' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Rekening Bank Bisnis</span>
                    <span className="font-mono font-bold text-sm text-slate-900">BCA 8901-234-567</span>
                    <span className="text-[11px] text-slate-500 block">a.n. PT Kopi Kawan Indonesia</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText('8901234567');
                      setCopiedBankInfo(true);
                      setTimeout(() => setCopiedBankInfo(false), 2000);
                    }}
                    className="text-xs"
                  >
                    {copiedBankInfo ? <Check className="size-3 text-emerald-600 mr-1" /> : <Copy className="size-3 mr-1" />}
                    {copiedBankInfo ? 'Tersalin' : 'Salin Rek'}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cek mutasi pada m-banking kasir atau periksa layar bukti transfer pembeli sebelum menyelesaikan order.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setShowPaymentModal(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                size="md"
                disabled={isProcessing}
                onClick={handleCheckout}
                className="bg-navy-900 hover:bg-navy-800 text-white font-bold px-6 shadow-sm"
              >
                {isProcessing ? 'Menyimpan Order...' : 'Konfirmasi & Selesai'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ================= COMPLETED RECEIPT MODAL ================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-sm p-6 bg-white border-slate-200 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="size-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Transaksi Berhasil</h3>
              <p className="text-xs text-slate-500 font-mono">Invoice: {completedOrder.invoice_number}</p>
            </div>

            {/* Thermal Receipt Preview Paper */}
            <div className="receipt-paper p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2 text-slate-800">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm">{outletName}</p>
                <p className="text-[10px] text-slate-500">Omnipoint POS Cloud Platform</p>
              </div>

              <div className="text-[11px] space-y-0.5 text-slate-600">
                <p>Waktu: {new Date().toLocaleTimeString('id-ID')}</p>
                <p>Kasir: {cashierName}</p>
                <p>Metode: {completedOrder.payment_method?.toUpperCase()}</p>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
                {lastCartSnapshot.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{item.product.name} x{item.quantity}</span>
                    <span>{formatMoney(item.product.selling_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>TOTAL</span>
                  <span>{formatMoney(completedOrder.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                size="md"
                onClick={() => window.print()}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Printer className="size-4" />
                <span>Cetak Struk Thermal</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Struk Pembelian di ${outletName}\nInvoice: ${completedOrder.invoice_number}\nTotal: ${formatMoney(
                      completedOrder.grand_total
                    )}\nStatus: LUNAS\nTerima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button size="sm" variant="secondary" className="w-full text-xs">
                    <Share2 className="size-3.5 mr-1" />
                    Kirim WA
                  </Button>
                </a>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full text-xs"
                >
                  Transaksi Baru
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
