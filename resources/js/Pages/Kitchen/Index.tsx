import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppShell } from '@/Components/app/app-shell';
import {
    ChefHat,
    Clock,
    CheckCircle2,
    Utensils,
    Flame,
    Volume2,
    VolumeX,
    RefreshCw,
    Store,
    AlertCircle,
    Check
} from 'lucide-react';

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
}

interface KitchenOrder {
    id: string;
    order_number: string;
    table_number: string;
    order_type: string;
    status: 'pending' | 'processing' | 'ready';
    customer_name: string;
    elapsed_minutes: number;
    created_at: string;
    items: OrderItem[];
}

interface Outlet {
    id: string;
    name: string;
}

interface KitchenProps {
    orders: KitchenOrder[];
    outlets: Outlet[];
    activeOutletId?: string;
    userName: string;
    role: string;
    outletName: string;
    tenantName: string;
}

export default function KitchenIndex({
    orders = [],
    outlets = [],
    activeOutletId,
    userName,
    role,
    outletName,
    tenantName,
}: KitchenProps) {
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedOutlet, setSelectedOutlet] = useState(activeOutletId || 'all');
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

    // Simple synthetic chime using Web Audio API
    const playChime = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch {
            // AudioContext not allowed or unsupported
        }
    };

    // Auto-refresh orders every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['orders'],
                preserveScroll: true,
            });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const toggleItemCheck = (itemId: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const updateStatus = (orderId: string, nextStatus: string) => {
        playChime();
        router.post(`/kitchen/orders/${orderId}/status`, {
            status: nextStatus
        }, {
            preserveScroll: true,
        });
    };

    const handleOutletChange = (outletId: string) => {
        setSelectedOutlet(outletId);
        router.get('/kitchen', { outlet_id: outletId }, { preserveState: true });
    };

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const readyCount = orders.filter(o => o.status === 'ready').length;

    const getTimerColor = (minutes: number) => {
        if (minutes < 8) {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
        if (minutes < 15) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        return 'bg-red-50 text-red-700 border-red-300 animate-pulse';
    };

    return (
        <AppShell title="Layar Dapur & Barista">
            <Head title="Layar Dapur & Barista - QLon POS" />

            <div className="space-y-6">
                {/* Header Bar */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow">
                            <ChefHat className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-slate-900">Layar Dapur & Barista</h1>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                                    Antrean Siap Masak
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pantau dan kelola pesanan masuk langsung dari meja atau kasir secara waktu-nyata
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {outlets.length > 1 && (
                            <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-slate-400" />
                                <select
                                    value={selectedOutlet}
                                    onChange={(e) => handleOutletChange(e.target.value)}
                                    aria-label="Pilih Cabang Dapur"
                                    className="text-xs font-medium rounded-lg border-slate-200 bg-slate-50 text-slate-700 focus:ring-slate-900 focus:border-slate-900"
                                >
                                    <option value="all">Semua Cabang Dapur</option>
                                    {outlets.map((o) => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                                soundEnabled
                                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                            title={soundEnabled ? 'Suara Bel Aktif' : 'Suara Bel Senyap'}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
                            <span>{soundEnabled ? 'Bel Nyala' : 'Bel Senyap'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => router.reload({ only: ['orders'] })}
                            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Perbarui</span>
                        </button>
                    </div>
                </div>

                {/* Counters Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Menunggu Dimasak</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">{pendingCount} Pesanan</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Sedang Dimasak / Disiapkan</div>
                            <div className="text-2xl font-bold text-amber-700 mt-1">{processingCount} Pesanan</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Flame className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-slate-500 font-medium">Siap Disajikan / Diambil</div>
                            <div className="text-2xl font-bold text-emerald-700 mt-1">{readyCount} Pesanan</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Orders Cards Grid */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                            <Utensils className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">Semua Pesanan Selesai!</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                            Tidak ada pesanan antrean dapur saat ini. Pesanan baru dari kasir atau pemesanan meja akan otomatis muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {orders.map((order) => {
                            const isOverdue = order.elapsed_minutes >= 15;
                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white rounded-2xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
                                        order.status === 'processing'
                                            ? 'border-amber-400 ring-2 ring-amber-400/20'
                                            : order.status === 'ready'
                                            ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Ticket Header */}
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                                                    #{order.order_number}
                                                </span>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-white">
                                                    {order.table_number}
                                                </span>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${getTimerColor(order.elapsed_minutes)}`}>
                                                <Clock className="w-3 h-3" />
                                                <span>{order.elapsed_minutes} menit</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>Pemesan: <strong>{order.customer_name}</strong></span>
                                            <span>Jam: {order.created_at}</span>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="p-4 flex-1 space-y-2.5">
                                        {order.items.map((item) => {
                                            const isChecked = !!checkedItems[item.id];
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => toggleItemCheck(item.id)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between select-none ${
                                                        isChecked
                                                            ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                                                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                                                            isChecked ? 'bg-slate-400 border-slate-400 text-white' : 'border-slate-300 bg-white'
                                                        }`}>
                                                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                        </div>
                                                        <span className="font-medium text-sm">{item.product_name}</span>
                                                    </div>
                                                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                                        isChecked ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {item.quantity}x
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        {order.status === 'pending' && (
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(order.id, 'processing')}
                                                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition"
                                            >
                                                <Flame className="w-4 h-4" />
                                                <span>Mulai Masak / Siapkan</span>
                                            </button>
                                        )}

                                        {order.status === 'processing' && (
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(order.id, 'ready')}
                                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Selesai Masak (Siap Saji)</span>
                                            </button>
                                        )}

                                        {order.status === 'ready' && (
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(order.id, 'completed')}
                                                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition"
                                            >
                                                <Utensils className="w-4 h-4" />
                                                <span>Pesanan Diambil / Selesai</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
