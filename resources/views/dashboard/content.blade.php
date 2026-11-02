<div id="owner-dashboard">
    @include('partials/app-header')

    <main class="mx-auto max-w-7xl space-y-6 p-6">
        {{-- Summary metric cards --}}
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Omzet Hari Ini</p>
                <p class="mt-2 text-3xl font-black text-slate-900">Rp {{ number_format($summary['revenue'], 0, ',', '.') }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jumlah Transaksi</p>
                <p class="mt-2 text-3xl font-black text-slate-900">{{ $summary['transactions'] }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Average Basket Size</p>
                <p class="mt-2 text-3xl font-black text-slate-900">Rp {{ number_format($summary['aov'], 0, ',', '.') }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Jumlah Cabang Aktif</p>
                <p class="mt-2 text-3xl font-black text-slate-900">{{ $summary['active_outlets'] }}</p>
            </div>
        </section>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {{-- Multi-outlet performance --}}
            <section class="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div class="border-b border-slate-100 px-6 py-4">
                    <h2 class="text-base font-bold text-slate-800">Performa Outlet</h2>
                    <p class="text-sm text-slate-400">Perbandingan omzet &amp; transaksi antar cabang hari ini.</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="text-xs uppercase tracking-wide text-slate-400">
                            <tr class="border-b border-slate-100">
                                <th class="px-6 py-3">Outlet</th>
                                <th class="px-6 py-3 text-right">Transaksi</th>
                                <th class="px-6 py-3 text-right">Omzet</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($outlets as $outlet)
                                <tr class="border-b border-slate-50">
                                    <td class="px-6 py-3 font-medium text-slate-700">{{ $outlet['name'] }}</td>
                                    <td class="px-6 py-3 text-right text-slate-600">{{ $outlet['transactions'] }}</td>
                                    <td class="px-6 py-3 text-right font-bold text-slate-800">Rp {{ number_format($outlet['revenue'], 0, ',', '.') }}</td>
                                </tr>
                            @empty
                                <tr><td colspan="3" class="px-6 py-10 text-center text-slate-400">Belum ada outlet.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </section>

            {{-- Live sales ticker --}}
            <section id="live-ticker" class="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 class="text-base font-bold text-slate-800">Live Sales</h2>
                        <p class="text-sm text-slate-400">Transaksi terbaru, auto-update tiap 10 detik.</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span id="ticker-dot" class="h-2 w-2 rounded-full bg-green-500"></span>
                        <button id="btn-refresh-ticker" type="button" class="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">Refresh</button>
                    </div>
                </div>
                <ul id="ticker-list" data-ticker
                    class="divide-y divide-slate-50">
                    @forelse($recentOrders as $order)
                        <li class="px-6 py-3">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-slate-700">{{ $order->invoice_number }}</span>
                                <span class="text-sm font-bold text-blue-700">Rp {{ number_format($order->grand_total, 0, ',', '.') }}</span>
                            </div>
                            <p class="text-xs text-slate-400">
                                {{ $order->outlet?->name ?? '—' }} · {{ $order->cashier?->name ?? '—' }} · {{ $order->created_at?->diffForHumans() }}
                                @if($order->customer)<span class="mx-1">·</span>{{ $order->customer->name }}@endif
                                <span class="mx-1">·</span>{{ strtoupper($order->payment_method) }}
                            </p>
                        </li>
                    @empty
                        <li class="px-6 py-10 text-center text-slate-400">Belum ada transaksi hari ini.</li>
                    @endforelse
                </ul>
            </section>
        </div>

        {{-- CRM Customer Monitoring --}}
        <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 class="text-base font-bold text-slate-800">CRM Customer Monitoring</h2>
                    <p class="text-sm text-slate-400">Direktori member &amp; poin loyalitas.</p>
                </div>
                <form method="GET" action="{{ route('dashboard') }}" class="flex gap-2">
                    <input type="search" name="q" value="{{ $search }}" placeholder="Cari nama / No. WA…"
                           class="w-64 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none">
                    <button type="submit" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Cari</button>
                </form>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="text-xs uppercase tracking-wide text-slate-400">
                        <tr class="border-b border-slate-100">
                            <th class="px-6 py-3">No. WhatsApp</th>
                            <th class="px-6 py-3">Nama</th>
                            <th class="px-6 py-3 text-right">Poin</th>
                            <th class="px-6 py-3 text-right">Total Belanja (LTV)</th>
                            <th class="px-6 py-3 text-right">Kunjungan</th>
                            <th class="px-6 py-3 text-right">Terakhir Datang</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($customers as $customer)
                            <tr class="border-b border-slate-50">
                                <td class="px-6 py-3 font-mono text-xs text-slate-600">{{ $customer->phone }}</td>
                                <td class="px-6 py-3 font-medium text-slate-700">{{ $customer->name }}</td>
                                <td class="px-6 py-3 text-right">
                                    <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{{ $customer->loyalty_points }} pt</span>
                                </td>
                                <td class="px-6 py-3 text-right text-slate-700">Rp {{ number_format($customer->total_spend, 0, ',', '.') }}</td>
                                <td class="px-6 py-3 text-right text-slate-600">{{ $customer->visit_count }}×</td>
                                <td class="px-6 py-3 text-right text-slate-400">{{ $customer->last_visit_at?->diffForHumans() ?? '—' }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="6" class="px-6 py-10 text-center text-slate-400">@if($search) Tidak ada pelanggan yang cocok. @else Belum ada pelanggan @endif</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>
    </main>
</div>
