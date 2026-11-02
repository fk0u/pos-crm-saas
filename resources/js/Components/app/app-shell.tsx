import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Boxes,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Store,
  Sparkles,
  Tag,
  CreditCard,
  Truck,
  UserCheck,
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

const navigationGroups = [
  {
    label: 'Main Menu',
    items: [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { href: '/pos', label: 'Kasir POS', icon: ShoppingCart, highlight: true },
      { href: '/dashboard#sales', label: 'Orders & Retur', icon: ReceiptText },
      { href: '/dashboard#categories', label: 'Categories', icon: Boxes },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/dashboard#inventory', label: 'Products & Stock', icon: Package },
      { href: '/dashboard#crm', label: 'Pelanggan & CRM', icon: Users },
    ],
  },
  {
    label: 'Report',
    items: [
      { href: '/dashboard#reports', label: 'Reporting & Sales', icon: BarChart3 },
      { href: '/dashboard#shifts', label: 'Shift Kasir', icon: ClipboardList },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/dashboard#settings', label: 'User Management', icon: UserCheck },
      { href: '/dashboard#audit', label: 'Security & Audit', icon: ShieldCheck },
    ],
  },
];

function QLonLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Changx-style geometric icon */}
      <div className="size-10 rounded-2xl bg-navy-800 text-white flex items-center justify-center shadow-sm relative overflow-hidden">
        <div className="size-6 rounded-xl border-2 border-sky-400 flex items-center justify-center font-black text-xs text-sky-400">
          Q
        </div>
        <span className="absolute bottom-1 right-1 size-2 rounded-full bg-emerald-400 ring-2 ring-navy-800" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold tracking-tight text-slate-900">QLon</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-navy-700 border border-blue-200">
            Cloud
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">POS &amp; Central Ops</p>
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
    <div className="flex h-full flex-col bg-white border-r border-slate-200/90 text-slate-800 shadow-xs">
      {/* Top Brand Logo */}
      <div className="flex h-20 items-center px-6 border-b border-slate-100">
        <QLonLogo />
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-4 scrollbar-none">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold text-slate-400 tracking-wider">
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
                    (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/dashboard#overview'));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        playTap();
                        onNavigate?.();
                      }}
                      className={`group flex h-11 items-center justify-between rounded-xl px-3.5 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-navy-800 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`size-4.5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && !active && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-navy-700">
                          Live
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Card at Bottom (Like Changx) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="size-9 rounded-full bg-navy-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900">{user.name}</p>
            <p className="truncate text-[10px] text-slate-400">{user.email || 'user@qlon.id'}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              playTap();
              router.post('/logout');
            }}
            title="Keluar"
            className="size-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
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
    email: `${userName.toLowerCase().replace(/\s+/g, '')}@qlon.id`,
    outletName,
    tenantName,
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block z-40">
          <Sidebar pathname={url} user={user} />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
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
          {/* Top Bar Header with Breadcrumb (Like Changx) */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setMobileOpen(true);
                }}
                className="grid size-9 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden border border-slate-200"
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" />
              </button>

              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Main Menu</span>
                <ChevronRight className="size-3 text-slate-300" />
                <span className="font-semibold text-slate-900 capitalize">
                  {activeTab === 'overview' ? 'Overview' : activeTab}
                </span>
              </div>
            </div>

            {/* Right Tools: Clock, Sound Toggle, Fullscreen, POS Button */}
            <div className="flex items-center gap-2.5">
              <LiveClock />

              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  soundActive
                    ? 'bg-blue-50 text-navy-800 border-blue-200 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
                }`}
                title={soundActive ? 'Suara Haptic Aktif' : 'Suara Dimatikan'}
              >
                {soundActive ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>

              {/* Fullscreen Kiosk Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden sm:grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
                title="Layar Penuh"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>

              {/* Direct Kasir Button */}
              <Link href="/pos">
                <Button
                  size="sm"
                  onClick={() => playTap()}
                  className="bg-navy-800 hover:bg-navy-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 px-3.5 h-9"
                >
                  <ShoppingCart className="size-3.5 text-sky-400" />
                  <span className="hidden sm:inline">Kasir POS</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Main Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">{children}</main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden shadow-lg">
          {[
            { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
            { href: '/pos', label: 'Kasir', icon: ShoppingCart },
            { href: '/dashboard#sales', label: 'Orders', icon: ReceiptText },
            { href: '/dashboard#crm', label: 'Pelanggan', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = url.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => playTap()}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[10px] font-bold transition ${
                  active ? 'text-navy-800 font-extrabold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Icon className={`size-5 ${active ? 'text-navy-800' : ''}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
