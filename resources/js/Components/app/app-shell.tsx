import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio,
  ChevronRight,
  HelpCircle,
  X,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ToastProvider } from '@/Components/ui/toast';
import { LiveClock } from './live-clock';
import { isSoundEnabled, setSoundEnabled, playTap } from '@/lib/sound';

export type AppUser = {
  name: string;
  role: 'owner' | 'manager' | 'cashier';
  email?: string;
  outletName?: string;
  tenantName?: string;
};

const mobileTabs = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/pos', label: 'Kasir', icon: ShoppingCart },
  { href: '/dashboard#sales', label: 'Transaksi', icon: ReceiptText },
  { href: '/dashboard#crm', label: 'Pelanggan', icon: Users },
];

const groups = [
  {
    label: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Penjualan',
    items: [
      { href: '/pos', label: 'Kasir POS (Native)', icon: ShoppingCart, highlight: true },
      { href: '/dashboard#sales', label: 'Transaksi & Retur', icon: ReceiptText },
      { href: '/dashboard#shifts', label: 'Shift & Kasir Laci', icon: ClipboardList },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { href: '/dashboard#inventory', label: 'Inventori & Stok', icon: Package },
      { href: '/dashboard#crm', label: 'CRM & Loyalitas', icon: Users },
      { href: '/dashboard#reports', label: 'Laporan Keuangan', icon: BarChart3 },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { href: '/dashboard#settings', label: 'Pengaturan QLon', icon: Settings },
      { href: '/dashboard#audit', label: 'Audit Log Keamanan', icon: ShieldCheck },
    ],
  },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-10 rounded-xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border border-sky-400/30 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.25)]">
        <span className="font-extrabold text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
          Q
        </span>
        <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-navy-950 animate-pulse" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-white">QLon</span>
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm bg-sky-500/20 text-sky-300 border border-sky-400/30">
            PRO OS
          </span>
        </div>
        <p className="text-[10px] text-navy-200/80 tracking-wide font-medium">Native POS &amp; CRM</p>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  onNavigate,
  user,
}: {
  pathname: string;
  onNavigate?: () => void;
  user: AppUser;
}) {
  return (
    <div className="flex h-full flex-col bg-navy-950 text-white border-r border-navy-900/80 shadow-xl">
      {/* Brand Header */}
      <div className="flex h-18 items-center justify-between border-b border-white/10 px-5">
        <BrandLogo />
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-none">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-400/80">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items
                .filter(
                  (item) =>
                    !(
                      user.role === 'cashier' &&
                      ['/dashboard#reports', '/dashboard#settings', '/dashboard#audit'].includes(item.href)
                    )
                )
                .map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href === '/dashboard' && pathname === '/dashboard');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        playTap();
                        onNavigate?.();
                      }}
                      className={`group flex h-10 items-center justify-between rounded-lg px-3 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-gradient-to-r from-sky-600 to-navy-700 text-white shadow-sm glow-cyan border border-sky-400/20'
                          : 'text-navy-200/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`size-4 transition-transform group-hover:scale-110 ${active ? 'text-sky-300' : 'text-navy-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && (
                        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile info at bottom */}
      <div className="border-t border-white/10 p-3 bg-navy-900/60">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 border border-white/5">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-800 border border-sky-400/20 text-xs font-bold text-sky-400">
            {user.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">{user.name}</p>
            <p className="truncate text-[10px] capitalize text-sky-300 font-mono">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap();
              router.post('/logout');
            }}
            title="Keluar Akun"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-navy-300 transition hover:bg-rose-500/20 hover:text-rose-400"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  activeTab = 'overview',
  onTabChange,
  userName = 'Hendra Setiawan',
  role = 'owner',
  outletName = 'Cabang Utama',
  tenantName = 'Kopi Kawan Indonesia',
}: {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  userName?: string;
  role?: string;
  outletName?: string;
  tenantName?: string;
}) {
  const { url } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setSoundActive(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playTap();
  };

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

  const user: AppUser = {
    name: userName,
    role: role as any,
    outletName,
    tenantName,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950 font-sans">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block z-40">
          <Sidebar pathname={url} user={user} />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-navy-950/70 backdrop-blur-xs animate-fade-in"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
            />
            <div className="absolute inset-y-0 left-0 w-72 animate-slide-right">
              <Sidebar
                pathname={url}
                onNavigate={() => setMobileOpen(false)}
                user={user}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex min-h-screen flex-col pb-20 lg:pb-0 lg:pl-64">
          {/* Top Bar Navigation */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setMobileOpen(true);
                }}
                className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden border border-slate-200"
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" />
              </button>

              {/* Live Status Chip */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-slate-900">{tenantName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 hidden sm:inline">{outletName}</span>
              </div>
            </div>

            {/* Header Right Tools: Clock, Sound Toggle, Fullscreen, POS Button */}
            <div className="flex items-center gap-2.5">
              <LiveClock />

              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                  soundActive
                    ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={soundActive ? 'Suara Haptic Aktif' : 'Suara Dimatikan'}
              >
                {soundActive ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden sm:grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
                title="Layar Penuh (Kiosk Mode)"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>

              {/* POS Jump Button */}
              <Link href="/pos">
                <Button
                  size="sm"
                  onClick={() => playTap()}
                  className="bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-sm glow-cyan flex items-center gap-1.5"
                >
                  <ShoppingCart className="size-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Kasir QLon</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden shadow-lg">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = url.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => playTap()}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] font-bold transition ${
                  active ? 'text-navy-900 font-extrabold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className={`size-5 ${active ? 'text-sky-600' : ''}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
