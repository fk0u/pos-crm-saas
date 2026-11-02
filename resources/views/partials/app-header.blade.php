{{-- Navigasi app: profil, tenant, badge role, link cepat, logout --}}
<header class="print-hide flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
    <div class="flex items-center gap-3">
        <span class="text-lg font-black tracking-tight text-slate-900">{{ $tenantName }}</span>
        <span class="hidden text-sm text-slate-400 md:inline">{{ $outletName }}</span>
    </div>

    <nav class="flex items-center gap-2">
        <a href="{{ route('dashboard') }}"
           class="rounded-lg px-3 py-2 text-sm font-semibold {{ request()->routeIs('dashboard') ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100' }}">
            📊 Dashboard
        </a>
        <a href="{{ route('pos.terminal') }}"
           class="rounded-lg px-3 py-2 text-sm font-semibold {{ request()->routeIs('pos.terminal') ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100' }}">
            ☕ POS
        </a>

        <div class="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3">
            <div class="text-right leading-tight">
                <p class="text-sm font-semibold text-slate-800">{{ $userName }}</p>
                <span class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                    {{ $role === 'owner' ? 'bg-purple-100 text-purple-700' : ($role === 'cashier' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700') }}">
                    {{ $role }}
                </span>
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="rounded-lg px-3 py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200">Logout</button>
            </form>
        </div>
    </nav>
</header>
