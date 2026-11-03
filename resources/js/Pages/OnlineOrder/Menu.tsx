import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  UtensilsCrossed,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Tag,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  QrCode,
  Wallet,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/Components/ui/modal';
import { formatMoney } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface OnlineProductItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  selling_price: number;
  stock: number;
  image_url: string;
}

export interface PromoBannerItem {
  code: string;
  name: string;
  type: string;
  value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
}

export interface OutletItem {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
}

interface CartItem {
  product: OnlineProductItem;
  quantity: number;
  notes: string;
}

interface OnlineMenuProps {
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    phone: string | null;
    logo_url: string | null;
  };
  outlets: OutletItem[];
  selectedOutletId: string;
  products: OnlineProductItem[];
  categories: string[];
  activePromos: PromoBannerItem[];
}

export default function OnlineMenu({
  tenant,
  outlets = [],
  selectedOutletId,
  products = [],
  categories = [],
  activePromos = [],
}: OnlineMenuProps) {
  // Order Configuration State
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');
  const [tableNumber, setTableNumber] = useState('Meja 01');
  const [outletId, setOutletId] = useState(selectedOutletId);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Cart States
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer & Payment Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_at_counter' | 'qris'>('cash_at_counter');
  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; name: string } | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart operations
  const addToCart = (product: OnlineProductItem) => {
    playTap();
    setCart((prev) => {
      const existing = prev[product.id];
      if (existing) {
        return {
          ...prev,
          [product.id]: {
            ...existing,
            quantity: existing.quantity + 1,
          },
        };
      }
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: 1,
          notes: '',
        },
      };
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    playTap();
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...existing,
          quantity: newQty,
        },
      };
    });
  };

  const updateItemNotes = (productId: string, notes: string) => {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      return {
        ...prev,
        [productId]: {
          ...existing,
          notes,
        },
      };
    });
  };

  const cartItems = Object.values(cart);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );

  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.11);
  const grandTotal = taxableAmount + taxAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    playTap();
    setPromoMessage(null);

    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          tenant_id: tenant.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        playSuccessChime();
        setAppliedPromo({
          code: data.promotion.code,
          discount: data.discount,
          name: data.promotion.name,
        });
        setPromoMessage(data.message);
      } else {
        setAppliedPromo(null);
        setPromoMessage(data.message || 'Kupon tidak valid.');
      }
    } catch {
      setPromoMessage('Gagal memvalidasi kupon.');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    playTap();

    try {
      const payload = {
        outlet_id: outletId,
        order_type: orderType,
        table_number: orderType === 'dine_in' ? tableNumber : null,
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        coupon_code: appliedPromo?.code || null,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const res = await fetch(`/${tenant.subdomain}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.redirect_url) {
        playSuccessChime();
        window.location.href = data.redirect_url;
      } else {
        alert(data.message || 'Gagal mengirim pesanan. Silakan coba lagi.');
        setIsSubmitting(false);
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-28">
      <Head title={`Menu Online - ${tenant.name}`} />

      {/* RESTAURANT TOP BRAND HERO */}
      <header className="bg-gradient-to-r from-[#061428] via-[#0f2b5c] to-[#040e1f] text-white py-6 px-4 sm:px-6 shadow-md border-b border-blue-400/20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sky-300 font-black text-xl shrink-0">
              <UtensilsCrossed className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">{tenant.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Buka &bull; Live Order
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-sky-300">{window.location.host}/{tenant.subdomain}</span>
                {tenant.phone && <span>&bull; WA: {tenant.phone}</span>}
              </p>
            </div>
          </div>

          {/* DINE-IN / TAKEAWAY TOGGLE */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/10 border border-white/15">
            <button
              type="button"
              onClick={() => { playTap(); setOrderType('dine_in'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                orderType === 'dine_in'
                  ? 'bg-white text-[#0f2b5c] shadow-xs'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Makan di Tempat (Dine In)
            </button>
            <button
              type="button"
              onClick={() => { playTap(); setOrderType('takeaway'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                orderType === 'takeaway'
                  ? 'bg-white text-[#0f2b5c] shadow-xs'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Bawa Pulang (Takeaway)
            </button>
          </div>
        </div>
      </header>

      {/* DINE-IN TABLE BAR (If Dine-In) */}
      {orderType === 'dine_in' && (
        <div className="bg-blue-50 border-b border-blue-100 py-2.5 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Memesan di Meja:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {['Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { playTap(); setTableNumber(t); }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    tableNumber === t
                      ? 'bg-[#0f2b5c] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROMO VOUCHERS BANNER (If any) */}
      {activePromos.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 font-semibold">
                Kupon Tersedia: <strong className="font-mono bg-amber-200/70 px-1.5 py-0.5 rounded text-amber-950 font-black">{activePromos[0].code}</strong> &bull; {activePromos[0].name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setCouponCode(activePromos[0].code);
                setIsCartOpen(true);
              }}
              className="text-[11px] font-bold text-[#0f2b5c] underline shrink-0 cursor-pointer"
            >
              Gunakan
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 mt-5 space-y-4">
        {/* SEARCH & CATEGORY CHIPS */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari makanan, minuman, camilan..."
              className="w-full pl-9.5 pr-4 h-11 rounded-2xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-[#0f2b5c] shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => { playTap(); setSelectedCategory('all'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0f2b5c] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Semua Menu
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { playTap(); setSelectedCategory(c); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-[#0f2b5c] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-6">
              <UtensilsCrossed className="size-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-bold text-slate-700">Tidak ada menu yang ditemukan</p>
              <p className="text-xs text-slate-400 mt-1">Coba cari dengan kata kunci lain atau pilih kategori berbeda.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const inCartItem = cart[product.id];
              const qty = inCartItem?.quantity || 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 relative">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-700 shadow-xs">
                        {product.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{product.name}</h3>
                      <p className="text-sm font-black font-mono text-[#0f2b5c] mt-1">
                        {formatMoney(product.selling_price)}
                      </p>
                    </div>
                  </div>

                  {/* ADD TO CART ACTION */}
                  <div>
                    {qty > 0 ? (
                      <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition cursor-pointer"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="size-8 rounded-lg bg-[#0f2b5c] text-white flex items-center justify-center active:scale-95 transition cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full h-9 rounded-xl bg-white border border-[#0f2b5c] hover:bg-blue-50 text-[#0f2b5c] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Pesan Menu</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* FLOATING BOTTOM CART BAR */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#061428] via-[#0f2b5c] to-[#040e1f] text-white shadow-xl flex items-center justify-between gap-3 border border-blue-400/30 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white font-mono">
                  {totalItemCount} Menu
                </span>
                <span className="text-xs text-sky-200">
                  {orderType === 'dine_in' ? `Dine-In (${tableNumber})` : 'Bawa Pulang'}
                </span>
              </div>
              <p className="text-base font-black font-mono text-white mt-0.5">
                {formatMoney(grandTotal)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => { playTap(); setIsCartOpen(true); }}
              className="px-4 py-2.5 rounded-xl bg-white text-[#0f2b5c] text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <span>Lanjut Bayar</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL DRAWER */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Keranjang Pesanan Online"
        description={`Restoran: ${tenant.name} &bull; ${orderType === 'dine_in' ? `Makan di Meja (${tableNumber})` : 'Takeaway'}`}
        maxWidth="lg"
      >
        <form onSubmit={handleCheckout} className="space-y-4">
          {/* ITEMS LIST */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.product.name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{formatMoney(item.product.selling_price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 active:scale-95"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-xs font-mono font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="size-6 rounded-md bg-[#0f2b5c] text-white flex items-center justify-center active:scale-95"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => updateItemNotes(item.product.id, e.target.value)}
                  placeholder="Catatan pesanan (cth: Es sedikit, pisah sambal)..."
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] focus:outline-none focus:border-[#0f2b5c]"
                />
              </div>
            ))}
          </div>

          {/* CUSTOMER INFO */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="customerNameInput" className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                id="customerNameInput"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="cth: Rian"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>

            <div>
              <label htmlFor="customerPhoneInput" className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                id="customerPhoneInput"
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="cth: 081234567890"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-[#0f2b5c]"
              />
            </div>
          </div>

          {/* PROMO CODE INPUT */}
          <div>
            <label htmlFor="checkoutPromoInput" className="block text-xs font-bold text-slate-700 mb-1">Punya Kode Kupon Diskon?</label>
            <div className="flex gap-2">
              <input
                id="checkoutPromoInput"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="cth: HEMAT20"
                className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#0f2b5c]"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
              >
                Pasang
              </button>
            </div>
            {promoMessage && (
              <p className={`text-[11px] mt-1 font-semibold ${appliedPromo ? 'text-emerald-600' : 'text-rose-500'}`}>
                {promoMessage}
              </p>
            )}
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Metode Pembayaran</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_at_counter')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'cash_at_counter'
                    ? 'border-[#0f2b5c] bg-blue-50/60 text-[#0f2b5c] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Wallet className="size-4 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Bayar di Kasir</p>
                  <p className="text-[10px] text-slate-500">Tunai saat pesanan siap</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'border-[#0f2b5c] bg-blue-50/60 text-[#0f2b5c] font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="size-4 shrink-0" />
                <div>
                  <p className="text-xs font-bold">QRIS Online</p>
                  <p className="text-[10px] text-slate-500">Scan bayar instan</p>
                </div>
              </button>
            </div>
          </div>

          {/* TOTAL SUMMARY */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono">{formatMoney(subtotal)}</span>
            </div>
            {appliedPromo && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Kupon ({appliedPromo.code}):</span>
                <span className="font-mono">-{formatMoney(appliedPromo.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Pajak Resto (PPN 11%):</span>
              <span className="font-mono">+{formatMoney(taxAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#0f2b5c]">
              <span>Total Tagihan:</span>
              <span className="font-mono">{formatMoney(grandTotal)}</span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-black transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim Pesanan...' : 'Konfirmasi Pesan Sekarang'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

