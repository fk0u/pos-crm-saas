import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
  ReceiptText,
  Search,
  Download,
  Printer,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Banknote,
  Landmark,
  Eye,
  Calendar,
  X,
  Clock,
  User,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { AppShell } from '@/Components/app/app-shell';
import { Modal } from '@/Components/ui/modal';
import { formatMoney, formatDateTime } from '@/lib/format';
import { playTap, playSuccessChime } from '@/lib/sound';

export interface OrderItemRecord {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost_price: string | number;
  unit_selling_price: string | number;
  subtotal: string | number;
  product?: {
    name: string;
    category?: string;
  };
}

export interface OrderRecord {
  id: string;
  invoice_number: string;
  subtotal: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
  } | null;
  cashier?: {
    id: string;
    name: string;
  } | null;
  outlet?: {
    id: string;
    name: string;
  } | null;
  items: OrderItemRecord[];
}

interface TransactionsPageProps {
  orders: {
    data: OrderRecord[];
    current_page: number;
    last_page: number;
    total: number;
  };
  filters: {
    search: string;
    status: string;
    payment_method: string;
    date_range: string;
  };
  stats: {
    total_orders: number;
    total_volume: number;
    total_refunded: number;
    paid_count: number;
  };
  userName: string;
  role: string;
  outletName: string;
  tenantName: string;
}

const methodIcons: Record<string, any> = {
  cash: Banknote,
  qris: QrCode,
  card: CreditCard,
  transfer: Landmark,
};

export default function TransactionsIndex({
  orders,
  filters,
  stats,
  userName,
  role,
  outletName,
  tenantName,
}: TransactionsPageProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [method, setMethod] = useState(filters.payment_method || 'all');
  const [dateRange, setDateRange] = useState(filters.date_range || 'all');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [refundOrder, setRefundOrder] = useState<OrderRecord | null>(null);
  const [refundReason, setRefundReason] = useState('Pembatalan pesanan pelanggan');
  const [restock, setRestock] = useState(true);

  const handleFilterChange = (newSearch: string, newStatus: string, newMethod: string, newRange: string) => {
    router.get(
      '/transactions',
      {
        search: newSearch || undefined,
        status: newStatus !== 'all' ? newStatus : undefined,
        payment_method: newMethod !== 'all' ? newMethod : undefined,
        date_range: newRange !== 'all' ? newRange : undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrder) return;
    playTap();

    router.post(
      `/transactions/${refundOrder.id}/refund`,
      {
        reason: refundReason,
        restock,
      },
      {
        onSuccess: () => {
          playSuccessChime();
          setRefundOrder(null);
          setSelectedOrder(null);
        },
      }
    );
  };

  const openReceiptPrint = (orderId: string) => {
    playTap();
    window.open(`/invoices/${orderId}/receipt`, '_blank', 'width=420,height=650');
  };

  const openWhatsAppReceipt = (orderId: string) => {
    playTap();
    window.open(`/invoices/${orderId}/whatsapp`, '_blank');
  };

  return (
    <AppShell
      userName={userName}
      role={role}
      outletName={outletName}
      tenantName={tenantName}
      activeTab="transactions"
    >
      <Head title="Transaksi Penjualan - QLon POS & CRM" />

      <div className="space-y-6">
        {/* HEADER & EXPORT ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ReceiptText className="size-6 text-[#0f2b5c]" />
              <span>Transaksi Penjualan</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit riwayat transaksi, pencetakan struk kasir thermal, serta proses retur pesanan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/transactions/export-excel"
              onClick={() => playTap()}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition"
              title="Unduh Buku Transaksi untuk Excel"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>Unduh Excel</span>
            </a>

            <a
              href="/transactions/export-pdf"
              target="_blank"
              rel="noreferrer"
              onClick={() => playTap()}
              className="h-10 px-3.5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/20 active:scale-95 transition"
              title="Cetak Buku Besar Transaksi Resmi"
            >
              <Printer className="size-4" />
              <span>Cetak / PDF Resmi</span>
            </a>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.total_orders}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Pesanan</p>
              </div>
              <div className="size-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0f2b5c]">
                <ReceiptText className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight truncate">
                  {formatMoney(stats.total_volume)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Omzet Bersih</p>
              </div>
              <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {stats.paid_count}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Transaksi Sukses</p>
              </div>
              <div className="size-10 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600">
                <Banknote className="size-5" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-rose-600 font-mono tracking-tight truncate">
                  {formatMoney(stats.total_refunded)}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Total Nilai Retur</p>
              </div>
              <div className="size-10 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
                <RotateCcw className="size-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange(e.target.value, status, method, dateRange);
              }}
              placeholder="Cari nomor invoice atau nama pelanggan..."
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                handleFilterChange(search, status, method, e.target.value);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="this_week">Minggu Ini</option>
              <option value="this_month">Bulan Ini</option>
            </select>

            {/* Payment Method */}
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                handleFilterChange(search, status, e.target.value, dateRange);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="all">Semua Metode</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS Dinamis</option>
              <option value="card">Kartu</option>
              <option value="transfer">Transfer</option>
            </select>

            {/* Status */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleFilterChange(search, e.target.value, method, dateRange);
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0f2b5c] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="paid">Sukses (Paid)</option>
              <option value="refunded">Retur (Refunded)</option>
            </select>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">No Invoice</th>
                  <th className="py-3.5 px-4">Waktu</th>
                  <th className="py-3.5 px-4">Pelanggan</th>
                  <th className="py-3.5 px-4">Ringkasan Item</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {orders.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada transaksi yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  orders.data.map((order) => {
                    const isRefunded = order.payment_status === 'refunded';
                    const MethodIcon = methodIcons[order.payment_method.toLowerCase()] || Banknote;
                    const itemsSummary = order.items
                      ?.map((it) => `${it.product?.name || 'Item'} (${it.quantity}x)`)
                      .join(', ');

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <button
                            type="button"
                            onClick={() => {
                              playTap();
                              setSelectedOrder(order);
                            }}
                            className="font-mono font-bold text-[#0f2b5c] hover:underline cursor-pointer"
                          >
                            {order.invoice_number}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateTime(order.created_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900">
                              {order.customer?.name || 'Pelanggan Umum'}
                            </p>
                            {order.customer?.phone && (
                              <p className="text-[10px] text-slate-400">{order.customer.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                          {itemsSummary || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-bold">
                            <MethodIcon className="size-3.5 text-[#0f2b5c]" />
                            <span className="uppercase">{order.payment_method}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatMoney(order.grand_total)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isRefunded
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isRefunded ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                            {isRefunded ? 'Retur' : 'Selesai'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                playTap();
                                setSelectedOrder(order);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="Lihat Detail Struk"
                            >
                              <Eye className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openReceiptPrint(order.id)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-[#0f2b5c] text-slate-600 transition"
                              title="Cetak Struk Thermal"
                            >
                              <Printer className="size-3.5" />
                            </button>
                            {!isRefunded && (
                              <button
                                type="button"
                                onClick={() => {
                                  playTap();
                                  setRefundOrder(order);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                                title="Retur / Refund Pesanan"
                              >
                                <RotateCcw className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL DETAIL TRANSAKSI / STRUK THERMAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title="Rincian Transaksi & Struk Kasir"
        description={selectedOrder ? `Faktur: ${selectedOrder.invoice_number}` : ''}
        maxWidth="md"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Meta Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(selectedOrder.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kasir:</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrder.cashier?.name || 'Kasir'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pelanggan:</span>
                <span className="font-semibold text-slate-800">
                  {selectedOrder.customer?.name || 'Pelanggan Umum'} ({selectedOrder.customer?.phone || '-'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Bayar:</span>
                <span className="font-bold text-[#0f2b5c] uppercase">
                  {selectedOrder.payment_method}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Daftar Produk Terbeli
              </p>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.product?.name || 'Produk'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.quantity} x {formatMoney(item.unit_selling_price)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-800">
                      {formatMoney(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Math */}
            <div className="p-3.5 rounded-xl bg-[#0f2b5c]/5 border border-[#0f2b5c]/10 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">{formatMoney(selectedOrder.subtotal)}</span>
              </div>
              {parseFloat(selectedOrder.discount_amount.toString()) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span className="font-mono">-{formatMoney(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono text-[#0f2b5c]">
                  {formatMoney(selectedOrder.grand_total)}
                </span>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openReceiptPrint(selectedOrder.id)}
                className="flex-1 py-2.5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-blue-950/20 active:scale-95"
              >
                <Printer className="size-4" />
                <span>Cetak Thermal (ESC/POS)</span>
              </button>

              <button
                type="button"
                onClick={() => openWhatsAppReceipt(selectedOrder.id)}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                title="Kirim Struk WhatsApp"
              >
                <Send className="size-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* 2. MODAL RETUR / REFUND TRANSAKSI */}
      {/* ========================================================================= */}
      <Modal
        isOpen={refundOrder !== null}
        onClose={() => setRefundOrder(null)}
        title="Proses Retur / Pembatalan Pesanan"
        description={refundOrder ? `Invoice: ${refundOrder.invoice_number} (${formatMoney(refundOrder.grand_total)})` : ''}
        maxWidth="sm"
      >
        <form onSubmit={handleRefundSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
            <ShieldAlert className="size-4.5 shrink-0 mt-0.5" />
            <p>
              Status pembayaran akan diubah menjadi <strong>Retur</strong> dan tercatat di audit log keamanan finansial.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alasan Pembatalan / Retur <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="cth: Salah pilih varian, pelanggan membatalkan pesanan..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#0f2b5c]"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={restock}
              onChange={(e) => setRestock(e.target.checked)}
              className="size-4 rounded text-[#0f2b5c] focus:ring-0"
            />
            <span>Kembalikan stok produk ke gudang secara otomatis</span>
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRefundOrder(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
            >
              Konfirmasi Retur
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

