import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  ChefHat,
  BellRing,
  Check,
  Receipt,
  ArrowLeft,
  QrCode,
  Printer,
  Sparkles,
} from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { playTap } from '@/lib/sound';

export interface OrderStatusProps {
  order: {
    id: string;
    invoice_number: string;
    order_type: string;
    table_number: string | null;
    customer_name: string;
    customer_phone: string;
    order_status: string;
    payment_method: string;
    payment_status: string;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    grand_total: number;
    notes: string | null;
    created_at: string;
    outlet_name: string;
    tenant_name: string;
    tenant_subdomain: string;
    items: {
      id: string;
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[];
  };
}

const STEPS = [
  { key: 'pending', label: 'Pesanan Diterima', desc: 'Menunggu konfirmasi kasir' },
  { key: 'accepted', label: 'Dikonfirmasi Kasir', desc: 'Pesanan masuk ke sistem' },
  { key: 'preparing', label: 'Sedang Dimasak', desc: 'Dapur / Barista sedang meracik' },
  { key: 'ready', label: 'Siap Disajikan', desc: 'Silakan ambil di counter / tunggu di meja' },
  { key: 'completed', label: 'Pesanan Selesai', desc: 'Terima kasih atas kunjungan Anda' },
];

export default function OrderStatus({ order }: OrderStatusProps) {
  // Auto reload status every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      router.reload({ only: ['order'] });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const getStepIndex = (status: string) => {
    const idx = STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = getStepIndex(order.order_status);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans py-8 px-4">
      <Head title={`Status Pesanan #${order.invoice_number} - ${order.tenant_name}`} />

      <div className="max-w-xl mx-auto space-y-5">
        {/* TOP BRAND CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-center space-y-2 relative overflow-hidden">
          <div className="size-14 rounded-2xl bg-[#0f2b5c] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-950/20">
            <UtensilsCrossed className="size-7" />
          </div>

          <div>
            <h1 className="text-lg font-black text-slate-900">{order.tenant_name}</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Invoice #{order.invoice_number} &bull; {order.outlet_name}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#0f2b5c] border border-blue-200/60 font-mono">
              {order.order_type === 'dine_in' ? `Dine-In (${order.table_number || 'Meja'})` : 'Bawa Pulang (Takeaway)'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.payment_status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.payment_status === 'paid' ? 'Lunas' : 'Menunggu Bayar di Kasir'}
            </span>
          </div>
        </div>

        {/* PROGRESS STEP TIMELINE */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="size-4 text-[#0f2b5c]" />
              <span>Status Proses Pesanan</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-bold animate-pulse">
              Live Tracker
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {STEPS.map((step, idx) => {
              const isDone = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="relative flex items-start gap-3">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-white shrink-0 -ml-6 transition-all ${
                      isDone
                        ? 'bg-emerald-600 shadow-sm'
                        : 'bg-slate-200 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                  >
                    {isDone ? <Check className="size-3.5 stroke-3" /> : <span className="size-1.5 rounded-full bg-slate-400" />}
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-[#0f2b5c] text-sm'
                          : isDone
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ITEMS & PAYMENT SUMMARY */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            Rincian Pesanan
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {item.quantity}x @ {formatMoney(item.price)}
                  </p>
                </div>
                <span className="font-mono font-bold text-slate-800">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Diskon Kupon Promo:</span>
                <span className="font-mono">-{formatMoney(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Pajak (PPN 11%):</span>
              <span className="font-mono">+{formatMoney(order.tax_amount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-[#0f2b5c]">
              <span>Total Akhir:</span>
              <span className="font-mono">{formatMoney(order.grand_total)}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${order.tenant_subdomain}`}
            onClick={() => playTap()}
            className="flex-1 h-11 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 shadow-2xs transition"
          >
            <ArrowLeft className="size-4" />
            <span>Pesan Menu Lain</span>
          </Link>

          <a
            href={`/invoices/${order.id}/receipt`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-11 rounded-2xl bg-[#0f2b5c] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#163a75] shadow-md shadow-blue-950/20 transition"
          >
            <Printer className="size-4" />
            <span>Cetak Struk Pembelian</span>
          </a>
        </div>
      </div>
    </div>
  );
}

