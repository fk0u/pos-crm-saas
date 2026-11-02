import React, { useState, useEffect, type ReactNode } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CircleDollarSign,
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
  UserRound,
  X,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ToastProvider } from '@/Components/ui/toast';
import { LiveClock } from './live-clock';
import { CommandPalette } from './command-palette';
import { playTap } from '@/lib/sound';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

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
      { href: '/pos', label: 'Kasir / POS', icon: ShoppingCart },
      { href: '/dashboard#sales', label: 'Transaksi', icon: ReceiptText },
      { href: '/dashboard#shifts', label: 'Shift kasir', icon: ClipboardList },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { href: '/dashboard#inventory', label: 'Produk & Stok', icon: Package },
      { href: '/dashboard#inventory', label: 'Inventori', icon: Boxes },
      { href: '/dashboard#crm', label: 'Pelanggan', icon: Users },
      { href: '/dashboard#reports', label: 'Laporan', icon: BarChart3 },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { href: '/dashboard#staff', label: 'Tim & akses', icon: UserRound },
      { href: '/dashboard#settings', label: 'Pengaturan', icon: Settings },
    ],
  },
];

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
    <div className="flex h-full flex-col bg-navy-950 text-white select-none">
      {/* Brand Header */}
      <div className="flex h-18 items-center gap-3 border-b border-white/10 px-5">
        <div className="grid size-9 place-items-center rounded-xl bg-white text-navy-800 shadow-sm">
          <Store className="size-5 text-navy-800" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">QLon</p>
          <p className="text-[11px] text-navy-200">POS + CRM</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-none">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items
                .filter((item) => !(item.href === '/dashboard#staff' && user.role !== 'owner'))
                .filter(
                  (item) =>
                    !(
                      user.role === 'cashier' &&
                      ['/dashboard#reports', '/dashboard#settings', '/dashboard#inventory'].includes(item.href)
                    )
                )
                .map((item) => {
                  const active =
                    (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '/dashboard#overview')) ||
                    (item.href !== '/dashboard' && (pathname === item.href || (item.href.includes('#') && typeof window !== 'undefined' && window.location.hash === item.href.slice(item.href.indexOf('#')))));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        playTap();
                        onNavigate?.();
                      }}
                      className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                        active
                          ? 'bg-navy-700 text-white shadow-sm font-semibold'
                          : 'text-navy-100 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <Icon className="size-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Card */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/8">
          <div className="grid size-9 place-items-center rounded-full bg-navy-700 text-xs font-bold text-white shadow-xs">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-navy-200">{user.role}</p>
          </div>
          <ChevronDown className="size-4 text-navy-300" />
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  userName = 'Samantha W',
  role = 'cashier',
  outletName = 'Central Outlet',
  tenantName = 'QLon Store',
  activeTab = 'overview',
  onTabChange,
}: {
  children: ReactNode;
  userName?: string;
  role?: string;
  outletName?: string;
  tenantName?: string;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}) {
  const { url } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const handleHash = () => {
      setCurrentHash(window.location.hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const fullPath = typeof window !== 'undefined' ? `${window.location.pathname}${currentHash}` : url;
  const user: AppUser = {
    name: userName,
    role: (role as any) || 'cashier',
    outletName,
    tenantName,
  };

  const roleLabel = { owner: 'Owner', manager: 'Manager', cashier: 'Kasir' }[user.role] ?? 'Kasir';
  const business = tenantName || outletName || 'QLon Workspace';

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 antialiased text-slate-900">
        <CommandPalette />

        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block print:hidden shadow-xs">
          <Sidebar pathname={fullPath} user={user} />
        </aside>

        {/* Mobile Sidebar Overlay & Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Tutup navigasi"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm animate-fade-in"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-72 shadow-2xl animate-slide-right">
              <Sidebar
                pathname={fullPath}
                user={user}
                onNavigate={() => setMobileOpen(false)}
              />
              <Button
                type="button"
                variant="ghost"
                className="absolute right-3 top-3 text-white hover:bg-white/10 hover:text-white"
                aria-label="Tutup menu"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:h-18 lg:px-8 print:hidden">
            {/* Mobile Brand */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="grid size-9 place-items-center rounded-xl bg-navy-800 text-white">
                <Store className="size-4.5" />
              </div>
              <p className="max-w-36 truncate text-sm font-bold text-slate-950">{business}</p>
            </div>

            {/* Desktop Brand & Clock */}
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold text-slate-950">{business}</p>
              <LiveClock />
            </div>

            {/* Right Tools */}
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700 sm:inline-flex">
                {roleLabel}
              </span>

              {!url.startsWith('/pos') ? (
                <Link
                  href="/pos"
                  onClick={() => playTap()}
                  className="hidden h-10 items-center gap-2 rounded-lg bg-navy-700 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-navy-800 sm:inline-flex"
                >
                  <CircleDollarSign className="size-4" />
                  Buka kasir
                </Link>
              ) : null}

              <form onSubmit={handleLogout}>
                <Button type="submit" variant="ghost" aria-label="Keluar" className="px-3 text-slate-600 hover:text-slate-950">
                  <LogOut className="size-4.5" />
                </Button>
              </form>
            </div>
          </header>

          <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 print:p-0 flex-1">
            <div key={url} className="animate-fade-up">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Navigasi utama"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden print:hidden shadow-lg"
        >
          <div className="grid grid-cols-5">
            {mobileTabs.map((tab) => {
              const active =
                (tab.href === '/dashboard' && url === '/dashboard') ||
                (tab.href === '/pos' && url.startsWith('/pos')) ||
                (tab.href.includes('#') && currentHash === tab.href.slice(tab.href.indexOf('#')));
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  onClick={() => playTap()}
                  className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                    active ? 'text-navy-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {active ? (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-navy-700 animate-grow" />
                  ) : null}
                  <Icon className={`size-5 transition ${active ? 'scale-110' : ''}`} />
                  {tab.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                playTap();
                setMobileOpen(true);
              }}
              className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900"
            >
              <Menu className="size-5" />
              Menu
            </button>
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}
