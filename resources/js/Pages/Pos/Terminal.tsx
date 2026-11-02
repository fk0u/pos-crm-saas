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
  VolumeX,
  Zap,
  Barcode,
  Keyboard,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Drawer } from '@/Components/ui/drawer';
import { formatMoney, formatNumber, formatCompactMoney } from '@/lib/format';
import { playTap, playBeep, playSuccessChime, playError, isSoundEnabled, setSoundEnabled } from '@/lib/sound';

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
  // Products Catalog
  const [products, setProducts] = useState<Product[]>(
    initialProducts.length > 0
      ? initialProducts
      : [
          { id: '1', sku: 'KOP-001', barcode: '8991001001', name: 'Es Kopi Susu Gula Aren', category: 'Coffee', selling_price: 18000, stock: 120 },
          { id: '2', sku: 'KOP-002', barcode: '8991001002', name: 'Americano Iced Double Shot', category: 'Coffee', selling_price: 15000, stock: 95 },
          { id: '3', sku: 'KOP-003', barcode: '8991001003', name: 'Caramel Macchiato Cloud', category: 'Coffee', selling_price: 25000, stock: 45 },
          { id: '4', sku: 'NC-001', barcode: '8991001004', name: 'Matcha Uji Artisan Latte', category: 'Non-Coffee', selling_price: 22000, stock: 34 },
          { id: '5', sku: 'NC-002', barcode: '8991001005', name: 'Earl Grey Milk Tea', category: 'Non-Coffee', selling_price: 20000, stock: 60 },
          { id: '6', sku: 'PAS-001', barcode: '8991001006', name: 'Butter Croissant French AOP', category: 'Pastry', selling_price: 24000, stock: 15 },
          { id: '7', sku: 'PAS-002', barcode: '8991001007', name: 'Pain Au Chocolat Belgian', category: 'Pastry', selling_price: 26000, stock: 12 },
          { id: '8', sku: 'PAS-003', barcode: '8991001008', name: 'Almond Danish Sweet', category: 'Pastry', selling_price: 28000, stock: 10 },
        ]
  );

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [scanFlash, setScanFlash] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sound Engine State
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playTap();
  };

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

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [mobileCartDrawer, setMobileCartDrawer] = useState(false);

  // CRM Member State
  const [customerPhone, setCustomerPhone] = useState('');
  const [crmCustomer, setCrmCustomer] = useState<{
    name: string;
    phone: string;
    loyalty_points: number;
    tier: string;
  } | null>(null);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);

  // Cart Manipulations with Sound Feedback
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      playError();
      return;
    }
    playBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          playError();
          return prev;
        }
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart((prev) => {
      const target = prev.find((i) => i.product.id === productId);
      if (!target) return prev;
      const nextQty = target.quantity + delta;

      if (delta > 0 && nextQty > target.product.stock) {
        playError();
        return prev;
      }
      playTap();
      return prev
        .map((item) => (item.product.id === productId ? { ...item, quantity: nextQty } : item))
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string | number) => {
    playTap();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Barcode Gun / Enter Press Handler in Search
  const handleBarcodeSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const q = searchQuery.trim().toLowerCase();
      if (!q) return;

      const exactMatch = products.find(
        (p) =>
          p.sku.toLowerCase() === q ||
          (p.barcode && p.barcode === q) ||
          p.name.toLowerCase() === q
      );

      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery('');
        setScanFlash(true);
        setTimeout(() => setScanFlash(false), 300);
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchQuery('');
        setScanFlash(true);
        setTimeout(() => setScanFlash(false), 300);
      } else {
        playError();
      }
    }
  };

  // Calculations
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

  // Payment Modal & Numpad Tender
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'debit' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [qrisVerified, setQrisVerified] = useState(true);
  const [selectedEdcBank, setSelectedEdcBank] = useState('BCA');
  const [edcApprovalCode, setEdcApprovalCode] = useState('');
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [lastCartSnapshot, setLastCartSnapshot] = useState<CartItem[]>([]);

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    return (cashTendered || 0) - grandTotal;
  }, [paymentMethod, cashTendered, grandTotal]);

  const openPaymentModal = () => {
    playTap();
    setCashTendered(grandTotal);
    setQrisVerified(true);
    setEdcApprovalCode('');
    setShowPaymentModal(true);
    setMobileCartDrawer(false);
  };

  // Interactive Touch Numpad handlers for Cash Tender
  const handleNumpadPress = (digit: string) => {
    playTap();
    if (digit === 'C') {
      setCashTendered(0);
      return;
    }
    if (digit === '00') {
      setCashTendered((prev) => Number(`${prev || ''}00`));
      return;
    }
    const currentStr = cashTendered === 0 ? '' : String(cashTendered);
    const nextStr = currentStr + digit;
    setCashTendered(Number(nextStr));
  };

  const handleQuickAddCash = (amount: number) => {
    playTap();
    setCashTendered((prev) => (prev || 0) + amount);
  };

  // CRM Customer Lookup
  const lookupCustomer = async () => {
    if (!customerPhone.trim()) return;
    playTap();
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
      playError();
      alert('Mohon verifikasi bahwa Anda telah melihat bukti pembayaran di HP pembeli.');
      return;
    }
    if (paymentMethod === 'cash' && cashTendered < grandTotal) {
      playError();
      alert('Uang tunai yang diterima kurang dari total belanja.');
      return;
    }

    playTap();
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
        playError();
        alert(data.message || 'Gagal memproses transaksi.');
      }
    } catch {
      playError();
      alert('Terjadi kendala koneksi ke server QLon POS.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fullscreen Kiosk Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    playTap();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Native POS Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
        playTap();
      } else if (
        e.key === 'F4' ||
        (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA')
      ) {
        if (cart.length > 0 && !showPaymentModal && !completedOrder) {
          e.preventDefault();
          openPaymentModal();
        }
      } else if (e.key === 'F9') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '?') {
        if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
          e.preventDefault();
          setShowShortcutHelp((prev) => !prev);
        }
      } else if (e.key === 'Escape') {
        if (showPaymentModal) setShowPaymentModal(false);
        if (completedOrder) setCompletedOrder(null);
        if (showShortcutHelp) setShowShortcutHelp(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, showPaymentModal, completedOrder, showShortcutHelp, grandTotal]);

  return (
    <div className={`h-screen w-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-sans select-none ${scanFlash ? 'ring-4 ring-emerald-400' : ''}`}>
      {/* ================= TOP POS NATIVE HEADER ================= */}
      <header className="h-14 bg-navy-950 px-4 flex items-center justify-between border-b border-white/10 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            onClick={() => playTap()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors border border-white/5"
          >
            <ArrowLeft className="size-3.5 text-sky-400" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-white/10" />

          {/* QLon Brand Mark */}
          <div className="flex items-center gap-2.5">
            <div className="relative size-8 rounded-lg bg-gradient-to-br from-navy-800 to-navy-950 border border-sky-400/40 flex items-center justify-center text-white shadow-[0_0_10px_rgba(56,189,248,0.25)]">
              <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
                Q
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">QLon</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  TERMINAL
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 pl-2 text-xs text-slate-400">
            <span className="text-slate-600">•</span>
            <span className="font-semibold text-slate-300">{outletName}</span>
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>
        </div>

        {/* Center Quick Hint Bar */}
        <div className="hidden xl:flex items-center gap-3 text-xs text-navy-200 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">F1</span>
            <span>Cari</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">F4 / Spasi</span>
            <span>Bayar</span>
          </div>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.2 rounded bg-navy-800 font-mono text-[10px] text-sky-300 border border-navy-700">?</span>
            <span>Bantuan</span>
          </div>
        </div>

        {/* Right Tools: Sound Toggle, Help, Fullscreen, Cashier Profile */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border transition-all ${
              soundOn
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/30 hover:bg-sky-500/30'
                : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
            }`}
            title={soundOn ? 'Suara Haptic Aktif' : 'Suara Dimatikan'}
          >
            {soundOn ? <Volume2 className="size-4 text-sky-400" /> : <VolumeX className="size-4" />}
          </button>

          {/* Shortcut Overlay Button */}
          <button
            onClick={() => setShowShortcutHelp(true)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors hidden sm:block"
            title="Daftar Shortcut Keyboard"
          >
            <Keyboard className="size-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
            title="Layar Penuh Kiosk"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          {/* Cashier Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs text-slate-300">
            <div className="size-7 rounded-lg bg-gradient-to-br from-navy-700 to-navy-900 border border-sky-400/30 flex items-center justify-center font-bold text-sky-400 text-xs">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-semibold text-slate-200">{cashierName}</span>
          </div>
        </div>
      </header>

      {/* ================= MAIN SPLIT WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden bg-slate-950">
        {/* ================= LEFT: PRODUCT CATALOG ================= */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
          {/* Top Search bar & Scanner input */}
          <div className="space-y-2.5 mb-3 shrink-0">
            <div className="relative">
              <Input
                ref={searchInputRef}
                placeholder="Scan barcode / ketik SKU atau nama produk (Tekan Enter)... [F1]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeSubmit}
                className="pl-10 pr-10 h-11 bg-navy-900/90 border-navy-800 text-white placeholder:text-slate-500 shadow-inner focus:border-sky-400 text-xs sm:text-sm font-medium"
              />
              <Barcode className="size-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category Pills with Glowing Active state */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      playTap();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                        : 'bg-navy-900/80 text-slate-300 border-navy-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid Cards */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
              {filteredProducts.map((p) => {
                const cartQty = cart.find((i) => i.product.id === p.id)?.quantity || 0;
                const isOutOfStock = p.stock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3 rounded-xl text-left flex flex-col justify-between transition-all relative border bg-gradient-to-b from-navy-900/90 to-navy-950/90 group shadow-xs ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed border-navy-900'
                        : 'hover:border-sky-400/60 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] active:scale-98 border-navy-800'
                    }`}
                  >
                    {/* Item Cart Quantity Badge */}
                    {cartQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg animate-scale-in">
                        {cartQty}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span className="text-sky-300/80">{p.sku}</span>
                        <span className={p.stock <= 10 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                          Stok {p.stock}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-sky-300 line-clamp-2 leading-snug transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-sky-400">
                        {formatMoney(p.selling_price)}
                      </span>
                      <span className="size-6 rounded-md bg-white/5 group-hover:bg-sky-500 group-hover:text-navy-950 text-slate-300 flex items-center justify-center transition-colors">
                        <Plus className="size-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STICKY DESKTOP CART ================= */}
        <div className="hidden lg:flex w-84 xl:w-96 bg-navy-950 border-l border-white/10 flex-col justify-between shrink-0 shadow-2xl z-20">
          {/* Top Cart Title & CRM Member Lookup */}
          <div className="p-4 border-b border-white/10 space-y-3 bg-navy-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Pesanan Aktif</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    playTap();
                    setCart([]);
                  }}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                >
                  <Trash2 className="size-3" />
                  Kosongkan
                </button>
              )}
            </div>

            {/* CRM Customer Phone Input */}
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <Input
                  placeholder="Nomor WA Member CRM..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupCustomer()}
                  className="h-8 text-xs bg-navy-900 border-navy-800 text-white placeholder:text-slate-500"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isLookingUpCustomer || !customerPhone.trim()}
                  onClick={lookupCustomer}
                  className="h-8 text-xs shrink-0 px-2.5 bg-white/10 hover:bg-white/20 text-white border-white/10"
                >
                  Cari
                </Button>
              </div>

              {crmCustomer && (
                <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-500/30 text-[11px] flex items-center justify-between animate-fade-in">
                  <div>
                    <span className="font-bold text-white block">{crmCustomer.name}</span>
                    <span className="text-sky-300 font-mono">Poin: {crmCustomer.loyalty_points || 0} Pts</span>
                  </div>
                  {crmCustomer.loyalty_points > 0 && (
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => {
                          playTap();
                          setUseLoyaltyPoints(e.target.checked);
                        }}
                        className="size-3.5 rounded text-sky-600 bg-navy-900 border-navy-700"
                      />
                      Tukar Poin
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/5 scrollbar-none">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <ShoppingCart className="size-10 stroke-[1.2] mb-2 text-slate-700" />
                <p className="text-xs font-bold text-slate-400">Keranjang Masih Kosong</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pilih menu di sebelah kiri atau ketik barcode di pencarian.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-100 leading-snug">{item.product.name}</p>
                    <p className="font-mono text-[11px] text-sky-400 mt-0.5">
                      {formatMoney(item.product.selling_price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md bg-navy-900 hover:bg-navy-800 text-slate-200 border border-white/5 flex items-center justify-center font-bold"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-white text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="size-6 rounded-md bg-navy-900 hover:bg-navy-800 text-slate-200 border border-white/5 flex items-center justify-center font-bold disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <div className="w-20 text-right font-mono font-bold text-slate-100 text-xs pl-2">
                    {formatMoney(item.product.selling_price * item.quantity)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Summary & Checkout Button */}
          <div className="p-4 border-t border-white/10 bg-navy-900/60 space-y-2.5 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
                <span className="font-mono font-semibold text-white">{formatMoney(subtotal)}</span>
              </div>

              {pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Diskon Poin Member</span>
                  <span className="font-mono">-{formatMoney(pointsDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pajak Resto PB1 (10%)</span>
                <span className="font-mono font-semibold text-white">{formatMoney(taxAmount)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="font-bold text-sm text-white">TOTAL</span>
                <span className="font-mono font-black text-xl text-sky-400">{formatMoney(grandTotal)}</span>
              </div>
            </div>

            <Button
              size="lg"
              disabled={cart.length === 0}
              onClick={openPaymentModal}
              className="w-full mt-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black h-12 shadow-lg glow-cyan flex items-center justify-center gap-2"
            >
              <span>Bayar Transaksi</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 font-mono text-[10px] text-slate-950 font-bold border border-black/10">F4</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING CART BAR ================= */}
      <div className="lg:hidden p-3 bg-navy-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Total ({cart.reduce((s, i) => s + i.quantity, 0)} item)</span>
          <span className="text-base font-black font-mono text-sky-400">{formatMoney(grandTotal)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={cart.length === 0}
            onClick={() => setMobileCartDrawer(true)}
            className="text-xs bg-white/10 text-white border-white/10"
          >
            Keranjang
          </Button>

          <Button
            size="sm"
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs glow-cyan"
          >
            Bayar Sekarang
          </Button>
        </div>
      </div>

      {/* ================= MOBILE CART DRAWER ================= */}
      {mobileCartDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-navy-950 border-t border-white/10 rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Keranjang Pesanan</h3>
              </div>
              <button
                onClick={() => setMobileCartDrawer(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-white/5">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-100">{item.product.name}</p>
                    <p className="font-mono text-sky-400 mt-0.5">{formatMoney(item.product.selling_price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md bg-navy-900 text-white flex items-center justify-center font-bold"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="size-6 rounded-md bg-navy-900 text-white flex items-center justify-center font-bold disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 bg-navy-900/60 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Total Akhir</span>
                <span className="font-mono font-black text-base text-sky-400">{formatMoney(grandTotal)}</span>
              </div>
              <Button
                size="lg"
                onClick={openPaymentModal}
                className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black h-11 glow-cyan"
              >
                Lanjut ke Pembayaran
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REAL-LOOKS NATIVE PAYMENT MODAL (NO GATEWAY) ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-xl p-5 sm:p-6 bg-navy-950 border-white/10 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto scrollbar-none">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white">QLon Payment</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    REAL TENDER
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Pilih metode tender fisik yang diterima dari pelanggan.</p>
              </div>
              <button
                onClick={() => {
                  playTap();
                  setShowPaymentModal(false);
                }}
                className="text-slate-400 hover:text-white text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Total Grand Due Banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-navy-900 via-navy-900/90 to-navy-800 border border-sky-400/30 flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] text-sky-300 uppercase font-bold tracking-wider block">Total Tagihan Belanja</span>
                <span className="text-2xl font-black font-mono text-white">{formatMoney(grandTotal)}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono text-xs font-bold border border-sky-400/30">
                {cart.reduce((s, i) => s + i.quantity, 0)} Item
              </span>
            </div>

            {/* Method Tabs */}
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
                      playTap();
                      setPaymentMethod(m.id as any);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                        : 'bg-navy-900/60 text-slate-300 border-navy-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* METHOD 1: CASH WITH TOUCHSCREEN NUMPAD */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-navy-900/70 border border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">Uang Diterima dari Pelanggan:</span>
                  <span className="font-mono text-xl font-black text-sky-400">
                    {formatMoney(cashTendered || 0)}
                  </span>
                </div>

                {/* Quick Cash Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      setCashTendered(grandTotal);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-center font-bold text-[11px] text-white border border-white/10"
                  >
                    Uang Pas
                  </button>
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAddCash(amt)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-center font-mono text-[11px] text-sky-300 border border-white/10 font-bold"
                    >
                      +{formatCompactMoney(amt)}
                    </button>
                  ))}
                </div>

                {/* Touchscreen Numpad */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '00'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleNumpadPress(digit)}
                      className={`h-10 rounded-lg text-sm font-black font-mono transition-all border ${
                        digit === 'C'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-navy-800 text-white border-navy-700 hover:bg-navy-700'
                      }`}
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="font-bold text-slate-300">Kembalian:</span>
                  <span
                    className={`font-mono text-lg font-black px-2 py-0.5 rounded-md ${
                      changeDue >= 0
                        ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30'
                        : 'text-rose-400 bg-rose-500/20 border border-rose-500/30'
                    }`}
                  >
                    {formatMoney(Math.max(0, changeDue))}
                  </span>
                </div>
              </div>
            )}

            {/* METHOD 2: QRIS (NO QR IMAGE, VERIFICATION INSTRUCTION) */}
            {paymentMethod === 'qris' && (
              <div className="space-y-3 p-4 rounded-xl bg-sky-950/70 border border-sky-400/40 text-xs text-sky-100 animate-fade-in">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-6 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm text-white">Verifikasi Bukti di HP Pembeli</h4>
                    <p className="text-xs text-sky-200/90 leading-relaxed mt-1">
                      Pelanggan melakukan scan QRIS outlet di meja kasir. <strong>Jangan lupa untuk melihat dan memverifikasi bukti pembayaran yang tampil di layar HP pembeli</strong> sebelum menyelesaikan transaksi ini.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-navy-900/90 rounded-lg border border-sky-400/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Nominal Wajib:</span>
                    <span className="font-mono font-black text-sky-400 text-sm">{formatMoney(grandTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tujuan Merchant:</span>
                    <span className="font-bold text-white">{outletName} (QLon)</span>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-navy-900 border border-sky-400/40 cursor-pointer text-xs font-bold text-white select-none">
                  <input
                    type="checkbox"
                    checked={qrisVerified}
                    onChange={(e) => {
                      playTap();
                      setQrisVerified(e.target.checked);
                    }}
                    className="size-4 rounded border-sky-400 text-sky-600 focus:ring-sky-500 bg-navy-950"
                  />
                  <span>Saya sudah memeriksa dan memastikan bukti transaksi berhasil di HP pembeli</span>
                </label>
              </div>
            )}

            {/* METHOD 3: DEBIT EDC */}
            {paymentMethod === 'debit' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-navy-900/70 border border-white/5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Pilih Mesin EDC</label>
                    <select
                      value={selectedEdcBank}
                      onChange={(e) => setSelectedEdcBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-navy-700 bg-navy-900 text-white text-xs font-bold focus:outline-none focus:border-sky-400"
                    >
                      <option value="BCA">EDC BCA</option>
                      <option value="Mandiri">EDC Mandiri</option>
                      <option value="BRI">EDC BRI</option>
                      <option value="BNI">EDC BNI</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Kode Approval / Trace No</label>
                    <Input
                      placeholder="Contoh: 849201"
                      value={edcApprovalCode}
                      onChange={(e) => setEdcApprovalCode(e.target.value)}
                      className="bg-navy-900 border-navy-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Gesek atau tap kartu nasabah pada terminal EDC fisik outlet dan pastikan struk transaksi EDC telah keluar berhasil.
                </p>
              </div>
            )}

            {/* METHOD 4: TRANSFER BANK */}
            {paymentMethod === 'transfer' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-navy-900/70 border border-white/5 text-xs">
                <div className="p-3 bg-navy-900 rounded-lg border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rekening Resmi Outlet</span>
                    <span className="font-mono font-black text-sm text-sky-400">BCA 8901-234-567</span>
                    <span className="text-[11px] text-slate-300 block">a.n. PT QLon Solusi Indonesia</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard?.writeText('8901234567');
                      playTap();
                      setCopiedBankInfo(true);
                      setTimeout(() => setCopiedBankInfo(false), 2000);
                    }}
                    className="text-xs bg-white/10 text-white border-white/10"
                  >
                    {copiedBankInfo ? <Check className="size-3 text-emerald-400 mr-1" /> : <Copy className="size-3 mr-1" />}
                    {copiedBankInfo ? 'Tersalin' : 'Salin Rek'}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cek mutasi pada m-banking kasir atau periksa layar bukti transfer pembeli sebelum menyelesaikan order.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  playTap();
                  setShowPaymentModal(false);
                }}
                className="bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="md"
                disabled={isProcessing}
                onClick={handleCheckout}
                className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-black px-6 shadow-lg glow-cyan"
              >
                {isProcessing ? 'Menyimpan Order...' : 'Konfirmasi & Selesai'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ================= COMPLETED RECEIPT MODAL ================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-sm p-5 sm:p-6 bg-navy-950 border-white/10 shadow-2xl space-y-4 text-white">
            <div className="text-center space-y-1">
              <div className="size-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-black text-base text-white">Transaksi Berhasil</h3>
              <p className="text-xs text-sky-300 font-mono">Invoice: {completedOrder.invoice_number}</p>
            </div>

            {/* Thermal Receipt Preview Paper */}
            <div className="receipt-paper p-4 rounded-xl font-mono text-xs space-y-2 text-slate-900 shadow-md">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-black text-sm">{outletName}</p>
                <p className="text-[10px] text-slate-500">QLon POS Cloud Native Engine</p>
              </div>

              <div className="text-[11px] space-y-0.5 text-slate-600">
                <p>Waktu: {new Date().toLocaleTimeString('id-ID')}</p>
                <p>Kasir: {cashierName}</p>
                <p>Metode: {completedOrder.payment_method?.toUpperCase()}</p>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
                {lastCartSnapshot.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px] font-semibold">{item.product.name} x{item.quantity}</span>
                    <span className="font-bold">{formatMoney(item.product.selling_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between font-black text-xs text-slate-950">
                  <span>TOTAL</span>
                  <span>{formatMoney(completedOrder.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button
                size="md"
                onClick={() => {
                  playTap();
                  window.print();
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-black flex items-center justify-center gap-2 glow-cyan"
              >
                <Printer className="size-4" />
                <span>Cetak Struk Thermal</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Struk Pembelian di ${outletName} (QLon)\nInvoice: ${completedOrder.invoice_number}\nTotal: ${formatMoney(
                      completedOrder.grand_total
                    )}\nStatus: LUNAS\nTerima kasih!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playTap()}
                  className="w-full"
                >
                  <Button size="sm" variant="secondary" className="w-full text-xs bg-white/10 text-white border-white/10">
                    <Share2 className="size-3.5 mr-1" />
                    Kirim WA
                  </Button>
                </a>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    playTap();
                    setCompletedOrder(null);
                  }}
                  className="w-full text-xs bg-white/10 text-white border-white/10"
                >
                  Transaksi Baru
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ================= SHORTCUT HELP MODAL (?) ================= */}
      {showShortcutHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-navy-950 border-white/10 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="size-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Shortcut Keyboard Kasir Native</h3>
              </div>
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'F1', desc: 'Fokus ke pencarian menu / barcode scanner' },
                { key: 'F4 atau Spasi', desc: 'Buka modal pembayaran transaksi' },
                { key: 'F9', desc: 'Toggle mode layar penuh (Kiosk Mode)' },
                { key: 'Enter di Search', desc: 'Scan instan masukkan barang ke keranjang' },
                { key: 'Escape', desc: 'Tutup modal / batal' },
                { key: '?', desc: 'Buka bantuan shortcut ini' },
              ].map((s) => (
                <div key={s.key} className="p-2.5 rounded-lg bg-navy-900 border border-white/5 flex items-center justify-between">
                  <span className="font-mono font-bold text-sky-300 px-2 py-0.5 rounded bg-black/30 border border-white/10">
                    {s.key}
                  </span>
                  <span className="text-slate-300">{s.desc}</span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => setShowShortcutHelp(false)}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Tutup Panduan
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
