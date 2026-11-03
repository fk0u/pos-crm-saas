{{-- Navigasi app: profil, tenant, badge role, link cepat, logout --}}
<header class="print-hide flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
    <div class="flex items-center gap-3">
        <span class="text-lg font-black tracking-tight text-slate-900">{{ $tenantName }}</span>
        <span class="hidden text-sm text-slate-400 md:inline">{{ $outletName }}</span>
    </div>

    <nav class="flex items-center gap-2">
        <a href="{{ route('dashboard') }}"
           class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold {{ request()->routeIs('dashboard') ? 'bg-[#0f2b5c] text-white' : 'text-slate-600 hover:bg-slate-100' }}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Dashboard
        </a>
        <a href="{{ route('pos.terminal') }}"
           class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold {{ request()->routeIs('pos.terminal') ? 'bg-[#0f2b5c] text-white' : 'text-slate-600 hover:bg-slate-100' }}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            POS
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
