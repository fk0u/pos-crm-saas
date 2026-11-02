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
  ArrowRight,
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
  FileText,
  Bell,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  Zap,
  Barcode,
  Keyboard,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  UtensilsCrossed,
  Coffee,
  Sparkles,
  Percent,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
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
  imageUrl?: string;
  modifier?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  modifier?: string;
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

// Clean SVG beverage renders matching Green Grounds Coffee reference
function BeverageArt({ name, className = 'w-16 h-20' }: { name: string; className?: string }) {
  const isPastry = name.toLowerCase().includes('croissant') || name.toLowerCase().includes('chocolat') || name.toLowerCase().includes('danish');
  const isMatcha = name.toLowerCase().includes('matcha');
  const isTea = name.toLowerCase().includes('tea') || name.toLowerCase().includes('earl');

  if (isPastry) {
    return (
      <div className={`${className} flex items-center justify-center relative`}>
        <div className="w-14 h-10 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 shadow-sm border border-amber-500/30 flex items-center justify-center transform -rotate-12 group-hover:scale-105 transition-transform">
          <div className="w-8 h-1 bg-amber-700/30 rounded-full" />
        </div>
      </div>
    );
  }

  // Realistic clean layered iced beverage glass
  return (
    <div className={`${className} flex items-center justify-center relative group-hover:scale-105 transition-transform`}>
      <div className="w-11 h-16 rounded-b-xl rounded-t-sm bg-slate-100/90 border border-slate-300/80 shadow-xs relative overflow-hidden flex flex-col justify-end p-0.5">
        {/* Ice Cubes */}
        <div className="absolute top-1 left-2 size-2.5 rounded-xs bg-white/70 border border-white/90 shadow-2xs rotate-12" />
        <div className="absolute top-2 right-2 size-2.5 rounded-xs bg-white/70 border border-white/90 shadow-2xs -rotate-6" />

        {/* Liquid Layer Top (Espresso / Tea) */}
        <div
          className={`w-full h-8 rounded-t-xs ${
            isMatcha
              ? 'bg-gradient-to-b from-emerald-600 to-emerald-700'
              : isTea
              ? 'bg-gradient-to-b from-amber-700 to-amber-800'
              : 'bg-gradient-to-b from-[#3b2014] to-[#26130b]'
          }`}
        />

        {/* Liquid Layer Middle (Milk Blend) */}
        <div
          className={`w-full h-5 ${
            isMatcha
              ? 'bg-gradient-to-b from-emerald-200 to-emerald-100'
              : 'bg-gradient-to-b from-[#e3c79e] to-[#f4e6d0]'
          }`}
        />

        {/* Liquid Layer Bottom (Sugar / Cream / Syrup) */}
        <div
          className={`w-full h-2.5 rounded-b-lg ${
            isMatcha
              ? 'bg-emerald-900'
              : 'bg-gradient-to-b from-[#6b3e1b] to-[#42210b]'
          }`}
        />
      </div>
    </div>
  );
}

export default function PosTerminal({
  cashierName = 'Samantha W',
  userRole = 'cashier',
  outletId = '1',
  outletName = 'Green Grounds Coffee',
  outlets = [],
  initialProducts = [],
  activeShift = null,
}: PosTerminalProps) {
  // Products Catalog (Green Grounds reference inspired with Navy Accent)
  const [products, setProducts] = useState<Product[]>(
    initialProducts.length > 0
      ? initialProducts
      : [
          { id: '1', sku: 'KOP-001', barcode: '8991001001', name: 'Espresso', category: 'Coffee', selling_price: 18000, stock: 50, modifier: 'Double Shot' },
          { id: '2', sku: 'KOP-002', barcode: '8991001002', name: 'Cappuccino', category: 'Coffee', selling_price: 24000, stock: 45, modifier: 'Less Sugar' },
          { id: '3', sku: 'KOP-003', barcode: '8991001003', name: 'Latte', category: 'Coffee', selling_price: 26000, stock: 40, modifier: 'Normal Ice' },
          { id: '4', sku: 'KOP-004', barcode: '8991001004', name: 'Americano', category: 'Coffee', selling_price: 22000, stock: 65, modifier: 'Less Sugar' },
          { id: '5', sku: 'KOP-005', barcode: '8991001005', name: 'Mocha', category: 'Coffee', selling_price: 28000, stock: 30, modifier: 'Extra Foam' },
          { id: '6', sku: 'KOP-006', barcode: '8991001006', name: 'Iced Coffee Milk', category: 'Coffee', selling_price: 20000, stock: 80, modifier: 'Gula Aren' },
          { id: '7', sku: 'KOP-007', barcode: '8991001007', name: 'Cold Brew', category: 'Coffee', selling_price: 25000, stock: 25, modifier: 'Black' },
          { id: '8', sku: 'KOP-008', barcode: '8991001008', name: 'Flat White', category: 'Coffee', selling_price: 24000, stock: 35, modifier: 'Hot' },
          { id: '9', sku: 'KOP-009', barcode: '8991001009', name: 'Caramel Macchiato', category: 'Coffee', selling_price: 28000, stock: 20, modifier: 'Caramel Drizzle' },
          { id: '10', sku: 'KOP-010', barcode: '8991001010', name: 'Salted Caramel', category: 'Coffee', selling_price: 29000, stock: 18, modifier: 'Sea Salt' },
          { id: '11', sku: 'KOP-011', barcode: '8991001011', name: 'Hazelnut Latte', category: 'Coffee', selling_price: 27000, stock: 22, modifier: 'Syrup' },
          { id: '12', sku: 'KOP-012', barcode: '8991001012', name: 'Pour Over V60', category: 'Coffee', selling_price: 32000, stock: 15, modifier: 'Single Origin' },
          { id: '13', sku: 'TEA-001', barcode: '8991001013', name: 'Artisan Matcha Latte', category: 'Tea', selling_price: 26000, stock: 20, modifier: 'Uji Grade' },
          { id: '14', sku: 'TEA-002', barcode: '8991001014', name: 'Earl Grey Milk Tea', category: 'Tea', selling_price: 22000, stock: 25, modifier: 'Less Sugar' },
          { id: '15', sku: 'PAS-001', barcode: '8991001015', name: 'Butter Croissant French', category: 'Snack', selling_price: 24000, stock: 4, modifier: 'Warm' },
          { id: '16', sku: 'PAS-002', barcode: '8991001016', name: 'Belgian Pain Au Chocolat', category: 'Snack', selling_price: 26000, stock: 3, modifier: 'Warm' },
        ]
  );

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Coffee');
  const [scanFlash, setScanFlash] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Order Details
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away' | 'Order Online'>('Dine In');
  const [customerName, setCustomerName] = useState('Muadz');
  const [selectedTable, setSelectedTable] = useState('B12 - Indoor');

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

  const categories = ['Coffee', 'Tea', 'Snack', 'All'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'Snack' ? p.category === 'Snack' || p.category === 'Pastry' : p.category === selectedCategory);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart State (Pre-filled with Americano to match Green Grounds reference)
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: { id: '4', sku: 'KOP-004', name: 'Americano', category: 'Coffee', selling_price: 22000, stock: 65, modifier: 'Less Sugar' },
      quantity: 2,
      modifier: 'Less Sugar',
    },
  ]);
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
      return [...prev, { product, quantity: 1, modifier: product.modifier || 'Regular' }];
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
        customer_name: customerName || crmCustomer?.name || 'Pelanggan',
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
    <div className={`h-screen w-screen flex flex-col bg-[#f5f5f0] text-slate-800 overflow-hidden font-sans select-none ${scanFlash ? 'ring-4 ring-navy-800' : ''}`}>
      {/* ================= TOP CLEAN HEADER (Green Grounds Coffee Match) ================= */}
      <header className="h-16 bg-white px-5 sm:px-6 flex items-center justify-between border-b border-slate-200/80 shrink-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            onClick={() => playTap()}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>

          {/* QLon Brand & Live Date */}
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 uppercase">
                  {outletName || 'QLon Coffee'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right Tools: Orders Count, Report, Notifications, Cashier Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
          <span className="hidden md:inline text-slate-500 font-medium">
            Total : <strong className="text-slate-900 font-bold">20 Orders</strong>
          </span>

          {/* Report Button */}
          <Link
            href="/dashboard#reports"
            onClick={() => playTap()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors shadow-2xs"
          >
            <span>Report</span>
            <FileText className="size-3.5 text-slate-500" />
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => playTap()}
              className="size-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
            >
              <Bell className="size-4" />
            </button>
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              1
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="size-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
            title={soundOn ? 'Suara Haptic Aktif' : 'Suara Dimatikan'}
          >
            {soundOn ? <Volume2 className="size-4 text-navy-800" /> : <VolumeX className="size-4 text-slate-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="size-8 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors hidden sm:flex"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <div className="h-6 w-px bg-slate-200" />

          {/* Cashier Profile */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs overflow-hidden">
              {cashierName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="font-bold text-xs text-slate-900 leading-tight">{cashierName}</p>
              <p className="text-[10px] text-slate-400 font-medium">Cashier</p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN SPLIT WORKSPACE ================= */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 gap-4">
        {/* ================= LEFT: CATALOG & CATEGORIES ================= */}
        <div className="flex-1 flex flex-col overflow-hidden space-y-3.5">
          {/* Top Full Search Bar */}
          <div className="relative shrink-0">
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleBarcodeSubmit}
              className="pl-10 pr-10 h-11 bg-white border-slate-200/90 rounded-2xl text-xs sm:text-sm font-medium shadow-2xs focus:border-navy-800 placeholder:text-slate-400"
            />
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <span className="p-0.5 px-1 rounded bg-slate-100 border border-slate-200 text-[10px]">⌘</span>
            </div>
          </div>

          {/* Horizontal Big Category Cards (Green Grounds Match with Navy Accent) */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* 1. Active: Coffee (Solid Navy Blue Card with artistic latte line art) */}
            <div
              onClick={() => {
                playTap();
                setSelectedCategory('Coffee');
              }}
              className={`p-4 rounded-2xl cursor-pointer relative overflow-hidden flex flex-col justify-between transition-all ${
                selectedCategory === 'Coffee'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-navy-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCategory === 'Coffee'
                      ? 'bg-white/10 text-emerald-300 border border-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Available
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Coffee</h3>
                <p className={`text-xs ${selectedCategory === 'Coffee' ? 'text-slate-300' : 'text-slate-400'}`}>
                  50 items
                </p>
              </div>

              {/* Latte Art Vector Line Art Graphic */}
              <div className="absolute right-2 -bottom-2 opacity-15 pointer-events-none">
                <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M50 10 C30 10, 10 30, 10 55 C10 80, 30 90, 50 90 C70 90, 90 80, 90 55 C90 30, 70 10, 50 10 Z" />
                  <path d="M50 25 C40 25, 25 35, 25 55 C25 72, 38 80, 50 80 C62 80, 75 72, 75 55 C75 35, 60 25, 50 25 Z" />
                  <path d="M50 40 C45 40, 35 45, 35 55 C35 65, 45 70, 50 70 C55 70, 65 65, 65 55 C65 45, 55 40, 50 40 Z" />
                  <path d="M50 20 L50 80" />
                </svg>
              </div>
            </div>

            {/* 2. Tea Card */}
            <div
              onClick={() => {
                playTap();
                setSelectedCategory('Tea');
              }}
              className={`p-4 rounded-2xl cursor-pointer relative overflow-hidden flex flex-col justify-between transition-all ${
                selectedCategory === 'Tea'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-navy-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCategory === 'Tea'
                      ? 'bg-white/10 text-emerald-300 border border-emerald-400/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Available
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Tea</h3>
                <p className={`text-xs ${selectedCategory === 'Tea' ? 'text-slate-300' : 'text-slate-400'}`}>
                  20 items
                </p>
              </div>

              {/* Tea Leaf Line Art */}
              <div className="absolute right-2 -bottom-2 opacity-15 pointer-events-none">
                <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 80 Q50 20 80 20 Q80 50 20 80 Z" />
                  <path d="M20 80 L60 40" />
                </svg>
              </div>
            </div>

            {/* 3. Snack / Pastry Card (with Need to re-stock pill) */}
            <div
              onClick={() => {
                playTap();
                setSelectedCategory('Snack');
              }}
              className={`p-4 rounded-2xl cursor-pointer relative overflow-hidden flex flex-col justify-between transition-all ${
                selectedCategory === 'Snack'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs hover:border-navy-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedCategory === 'Snack'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}
                >
                  Need to re-stock
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Snack</h3>
                <p className={`text-xs ${selectedCategory === 'Snack' ? 'text-slate-300' : 'text-slate-400'}`}>
                  10 items
                </p>
              </div>

              {/* Croissant / Pastry Line Art */}
              <div className="absolute right-2 -bottom-2 opacity-15 pointer-events-none">
                <svg width="72" height="72" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <ellipse cx="50" cy="50" rx="35" ry="20" transform="rotate(-15 50 50)" />
                  <path d="M25 45 Q50 60 75 40" />
                </svg>
              </div>
            </div>
          </div>

          {/* 4-Column Product Grid (Clean White Cards with Circular + Button) */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const cartQty = cart.find((i) => i.product.id === p.id)?.quantity || 0;
                const isOutOfStock = p.stock <= 0;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 flex flex-col justify-between items-center text-center shadow-2xs transition-all relative group cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:border-navy-400 hover:shadow-xs active:scale-98'
                    }`}
                  >
                    {/* Cart Quantity Badge if selected */}
                    {cartQty > 0 && (
                      <span className="absolute top-2.5 right-2.5 size-5 rounded-full bg-navy-900 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                        {cartQty}
                      </span>
                    )}

                    {/* Beverage Thumbnail Illustration */}
                    <div className="my-2">
                      <BeverageArt name={p.name} />
                    </div>

                    {/* Bottom Details Row */}
                    <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-left">
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[95px] sm:max-w-[120px]">
                          {p.name}
                        </h4>
                        <p className="font-mono text-xs text-slate-500 font-medium">
                          {formatMoney(p.selling_price)}
                        </p>
                      </div>

                      {/* Circular + Button (Green Grounds Coffee Match) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                        className="size-8 rounded-full border border-slate-200/90 flex items-center justify-center text-slate-700 group-hover:bg-navy-900 group-hover:text-white group-hover:border-navy-900 transition-colors shadow-2xs"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= RIGHT: STICKY CART PANEL (Green Grounds Coffee Match) ================= */}
        <div className="hidden lg:flex w-84 xl:w-96 bg-white border border-slate-200/90 rounded-2xl flex-col justify-between shrink-0 shadow-xs overflow-hidden">
          {/* Header & Order Mode Selector */}
          <div className="p-4 border-b border-slate-100 space-y-3.5">
            {/* Purchase Receipt Title Row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => playTap()}
                className="size-8 rounded-full bg-navy-900 text-white flex items-center justify-center hover:bg-navy-950 transition-colors"
                title="Collapse Panel"
              >
                <ChevronRight className="size-4" />
              </button>

              <div className="text-center">
                <h3 className="font-bold text-xs text-slate-900">Purchase Receipt</h3>
                <span className="font-mono text-[11px] text-slate-400 font-semibold">#27362</span>
              </div>

              <button className="size-8 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50">
                <SlidersHorizontal className="size-3.5" />
              </button>
            </div>

            {/* Segmented Order Mode Pills */}
            <div className="p-1 rounded-full bg-slate-100 flex items-center justify-between text-xs font-semibold">
              {(['Dine In', 'Take Away', 'Order Online'] as const).map((mode) => {
                const isActive = orderType === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      playTap();
                      setOrderType(mode);
                    }}
                    className={`flex-1 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {mode}
                  </button>
                );
              })}
            </div>

            {/* Customer Name & Table Picker */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Customer name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-8 px-3 rounded-full bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs focus:outline-none focus:border-navy-800"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Table</label>
                <div className="relative">
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full h-8 px-3 pr-7 rounded-full bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs appearance-none focus:outline-none focus:border-navy-800"
                  >
                    <option value="B12 - Indoor">B12 - Indoor</option>
                    <option value="A01 - Outdoor">A01 - Outdoor</option>
                    <option value="A02 - Terrace">A02 - Terrace</option>
                    <option value="C04 - Bar">C04 - Bar</option>
                  </select>
                  <ChevronDown className="size-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Order List Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 scrollbar-none">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order list</span>
              {cart.length > 0 && (
                <button
                  onClick={() => {
                    playTap();
                    setCart([]);
                  }}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-slate-400">
                <ShoppingCart className="size-8 stroke-[1.2] mb-1.5 text-slate-300" />
                <p className="text-xs font-semibold">Belum ada item pesanan</p>
                <p className="text-[10px] text-slate-400">Pilih minuman di menu sebelah kiri</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 flex-1 pr-2">
                    {/* Small Beverage Icon */}
                    <div className="size-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                      <BeverageArt name={item.product.name} className="w-6 h-8" />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{item.product.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {formatMoney(item.product.selling_price)} x {item.quantity}
                      </p>
                      {/* Modifier Chip (Less Sugar) */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">
                        <FileText className="size-2.5 text-slate-400" />
                        <span>{item.modifier || 'Less Sugar'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Stepper on Right */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {formatMoney(item.product.selling_price * item.quantity)}
                    </span>

                    <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-full border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="size-5 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold shadow-2xs"
                      >
                        <Minus className="size-2.5" />
                      </button>
                      <span className="w-4 text-center font-mono font-bold text-[11px] text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="size-5 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs font-bold shadow-2xs disabled:opacity-30"
                      >
                        <Plus className="size-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Details & Checkout Button (Green Grounds Match with Navy Accent) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Payment Details</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-900">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-mono font-bold text-slate-900">{formatMoney(taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-slate-900">Total</span>
                <span className="font-mono font-black text-lg text-slate-900">{formatMoney(grandTotal)}</span>
              </div>
            </div>

            {/* Prominent Navy Blue Checkout Button */}
            <button
              disabled={cart.length === 0}
              onClick={openPaymentModal}
              className="w-full h-12 rounded-2xl bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-between px-4 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <div className="size-7 rounded-full bg-white/15 flex items-center justify-center">
                <ArrowRight className="size-3.5 text-white" />
              </div>
              <span>Place Order {formatMoney(grandTotal)}</span>
              <div className="flex items-center gap-0.5 text-white/40">
                <ChevronRight className="size-3.5" />
                <ChevronRight className="size-3.5 -ml-2" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM FLOATING CART BAR ================= */}
      <div className="lg:hidden p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-lg">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Total ({cart.reduce((s, i) => s + i.quantity, 0)} item)
          </span>
          <span className="text-base font-black font-mono text-slate-900">{formatMoney(grandTotal)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={cart.length === 0}
            onClick={() => setMobileCartDrawer(true)}
            className="text-xs bg-slate-100 text-slate-800 border-slate-200"
          >
            Keranjang
          </Button>

          <Button
            size="sm"
            disabled={cart.length === 0}
            onClick={openPaymentModal}
            className="bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs"
          >
            Bayar Pesanan
          </Button>
        </div>
      </div>

      {/* ================= MOBILE CART DRAWER ================= */}
      {mobileCartDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border-t border-slate-200 rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-navy-900" />
                <h3 className="font-bold text-sm text-slate-900">Keranjang Pesanan</h3>
              </div>
              <button onClick={() => setMobileCartDrawer(false)} className="text-slate-400 hover:text-slate-700">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-900">{item.product.name}</p>
                    <p className="font-mono text-slate-500 mt-0.5">{formatMoney(item.product.selling_price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="size-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold disabled:opacity-30"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Total Akhir</span>
                <span className="font-mono font-black text-base text-slate-900">{formatMoney(grandTotal)}</span>
              </div>
              <Button
                size="lg"
                onClick={openPaymentModal}
                className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold h-11"
              >
                Lanjut ke Pembayaran
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REAL-LOOKS NATIVE PAYMENT MODAL (NO GATEWAY) ================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-xl p-5 sm:p-6 bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto scrollbar-none rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">QLon Payment Tender</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-navy-800 border border-blue-200 font-bold">
                    OFFLINE / REAL
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Pilih metode tender fisik yang diterima dari pelanggan.</p>
              </div>
              <button
                onClick={() => {
                  playTap();
                  setShowPaymentModal(false);
                }}
                className="text-slate-400 hover:text-slate-800 text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            {/* Total Grand Due Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Total Tagihan Belanja</span>
                <span className="text-2xl font-black font-mono text-slate-900">{formatMoney(grandTotal)}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-navy-900 text-white font-mono text-xs font-bold">
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
                        ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
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
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">Uang Diterima dari Pelanggan:</span>
                  <span className="font-mono text-xl font-black text-slate-900">
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
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-center font-bold text-[11px] text-navy-900 border border-slate-200 shadow-2xs"
                  >
                    Uang Pas
                  </button>
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAddCash(amt)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-center font-mono text-[11px] text-slate-700 border border-slate-200 font-bold shadow-2xs"
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
                          ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 shadow-2xs'
                      }`}
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-600">Kembalian:</span>
                  <span
                    className={`font-mono text-lg font-black px-2.5 py-0.5 rounded-md ${
                      changeDue >= 0
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-rose-600 bg-rose-50 border border-rose-200'
                    }`}
                  >
                    {formatMoney(Math.max(0, changeDue))}
                  </span>
                </div>
              </div>
            )}

            {/* METHOD 2: QRIS (NO QR IMAGE, PHONE PROOF CHECK REQUIREMENT) */}
            {paymentMethod === 'qris' && (
              <div className="space-y-3 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 animate-fade-in">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-6 text-navy-800 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-sm text-navy-900">Verifikasi Bukti di HP Pembeli</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      Pelanggan melakukan scan QRIS fisik outlet di meja kasir. <strong>Pastikan kasir melihat langsung bukti transaksi berhasil di layar HP pembeli</strong> sebelum menyelesaikan pesanan ini.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-blue-200/80 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Nominal Tagihan:</span>
                    <span className="font-mono font-black text-navy-900 text-sm">{formatMoney(grandTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Merchant Penerima:</span>
                    <span className="font-bold text-slate-900">{outletName}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-blue-200 cursor-pointer text-xs font-bold text-slate-800 select-none shadow-2xs">
                  <input
                    type="checkbox"
                    checked={qrisVerified}
                    onChange={(e) => {
                      playTap();
                      setQrisVerified(e.target.checked);
                    }}
                    className="size-4 rounded border-slate-300 text-navy-800 focus:ring-navy-800"
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
                    <label className="font-bold text-slate-700 block mb-1">Pilih Mesin EDC</label>
                    <select
                      value={selectedEdcBank}
                      onChange={(e) => setSelectedEdcBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:border-navy-800"
                    >
                      <option value="BCA">EDC BCA</option>
                      <option value="Mandiri">EDC Mandiri</option>
                      <option value="BRI">EDC BRI</option>
                      <option value="BNI">EDC BNI</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kode Approval / Trace No</label>
                    <Input
                      placeholder="Contoh: 849201"
                      value={edcApprovalCode}
                      onChange={(e) => setEdcApprovalCode(e.target.value)}
                      className="bg-white border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gesek atau tap kartu nasabah pada mesin EDC fisik outlet dan pastikan struk transaksi EDC telah keluar berhasil.
                </p>
              </div>
            )}

            {/* METHOD 4: TRANSFER BANK */}
            {paymentMethod === 'transfer' && (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Rekening Resmi Outlet</span>
                    <span className="font-mono font-black text-sm text-navy-900">BCA 8901-234-567</span>
                    <span className="text-[11px] text-slate-500 block">a.n. PT QLon Solusi Indonesia</span>
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
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
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
                onClick={() => {
                  playTap();
                  setShowPaymentModal(false);
                }}
                className="bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="md"
                disabled={isProcessing}
                onClick={handleCheckout}
                className="bg-navy-900 hover:bg-navy-950 text-white font-bold px-6 shadow-sm"
              >
                {isProcessing ? 'Menyimpan Order...' : 'Konfirmasi & Selesai'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ================= COMPLETED RECEIPT MODAL ================= */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-sm p-5 sm:p-6 bg-white border-slate-200 shadow-2xl space-y-4 text-slate-900 rounded-2xl">
            <div className="text-center space-y-1">
              <div className="size-11 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Transaksi Berhasil</h3>
              <p className="text-xs text-slate-500 font-mono">Invoice: {completedOrder.invoice_number}</p>
            </div>

            {/* Thermal Receipt Preview Paper */}
            <div className="receipt-paper p-4 rounded-xl font-mono text-xs space-y-2 text-slate-900 shadow-xs border border-slate-200 bg-[#fbfbfa]">
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
                className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold flex items-center justify-center gap-2 shadow-xs"
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
                  <Button size="sm" variant="secondary" className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200">
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
                  className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-white border-slate-200 text-slate-900 shadow-2xl space-y-4 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="size-5 text-navy-800" />
                <h3 className="font-bold text-sm text-slate-900">Shortcut Keyboard Kasir Native</h3>
              </div>
              <button onClick={() => setShowShortcutHelp(false)} className="text-slate-400 hover:text-slate-700">
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
                <div key={s.key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="font-mono font-bold text-navy-900 px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                    {s.key}
                  </span>
                  <span className="text-slate-600 font-medium">{s.desc}</span>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              onClick={() => setShowShortcutHelp(false)}
              className="w-full bg-navy-900 hover:bg-navy-950 text-white font-bold"
            >
              Tutup Panduan
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
