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
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  Bell,
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  FileQuestion,
  Headphones,
  CircleDollarSign,
  ShieldCheck,
  Shield,
  Scale,
  Building2,
  Package,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ToastProvider } from '@/Components/ui/toast';
import { LiveClock } from './live-clock';
import { CommandPalette } from './command-palette';
import { playTap } from '@/lib/sound';
import { QlonLogo } from '@/Components/ui/QlonLogo';
import { VirtualKeyboard } from '@/Components/ui/VirtualKeyboard';
import { RealtimeSupportWidget } from '@/Components/ui/RealtimeSupportWidget';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export type AppUser = {
  name: string;
  role: 'superadmin' | 'developer' | 'owner' | 'manager' | 'cashier';
  email?: string;
  outletName?: string;
  tenantName?: string;
};

interface AppShellProps {
  children: ReactNode;
  userName?: string;
  role?: string;
  outletName?: string;
  tenantName?: string;
  activeTab?: string;
  isSuperAdmin?: boolean;
  allTenants?: { id: string; name: string; subdomain: string }[];
  selectedTenantId?: string;
  onTabChange?: (tab: any) => void;
  onOpenTour?: () => void;
}

export function AppShell({
  children,
  userName = 'Samantha W',
  role = 'owner',
  outletName = 'Central Outlet',
  tenantName = 'QLon Store',
  activeTab = 'overview',
  isSuperAdmin = false,
  allTenants = [],
  selectedTenantId,
  onTabChange,
  onOpenTour,
}: AppShellProps) {
  const { url } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    role: (role as any) || 'owner',
    outletName,
    tenantName,
  };

  const roleLabel =
    user.role === 'superadmin'
      ? 'Master Admin'
      : user.role === 'developer'
      ? 'Developer PaaS'
      : user.role === 'owner'
      ? 'Owner Tenant'
      : user.role === 'manager'
      ? 'Manager'
      : 'Kasir POS';

  const business = tenantName || outletName || 'QLon Workspace';

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  const navMenuItems = [
    { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { href: '/kasir', label: 'Kasir', icon: ShoppingCart },
    { href: '/products', label: 'Katalog Produk', icon: Package },
    { href: '/transactions', label: 'Transaksi', icon: ReceiptText },
    { href: '/cashflow', label: 'Arus Kas', icon: CircleDollarSign },
    { href: '/customers', label: 'Pelanggan', icon: Users },
    { href: '/reports', label: 'Laporan', icon: BarChart3 },
    ...(role === 'developer' || role === 'owner' || role === 'superadmin'
      ? [{ href: '/developer', label: 'Developer Hub', icon: Building2 }]
      : []),
    ...(role === 'superadmin'
      ? [{ href: '/superadmin', label: 'Sovereign Control', icon: ShieldCheck }]
      : []),
  ];

  const secondaryNavItems = [
    { label: 'Panduan (Tour)', icon: Sparkles, action: onOpenTour },
    { href: '/terms', label: 'Ketentuan Layanan', icon: Scale },
    { href: '/privacy', label: 'Kebijakan Privasi', icon: Shield },
    { href: '/help', label: 'Pusat Bantuan', icon: Headphones },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen w-full bg-[#f8fafc] antialiased text-slate-900 font-sans flex flex-col lg:flex-row pb-20 lg:pb-0">
        <CommandPalette />

        {/* DESKTOP & TABLET SIDEBAR (Wider w-72 xl:w-80 for high ergonomics & touch friendliness) */}
        <aside className="w-72 xl:w-80 bg-white border-r border-slate-200/90 min-h-screen h-screen sticky top-0 flex flex-col justify-between p-5 xl:p-6 shrink-0 hidden lg:flex select-none z-30 shadow-xs">
          <div className="flex flex-col flex-1 overflow-y-auto pr-1">
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-6 mb-5 border-b border-slate-100">
              <Link href="/dashboard" onClick={() => playTap()} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2b5c] rounded-xl p-1 -m-1">
                <QlonLogo variant="full" size="md" subtitle="Event & Store POS" animated />
              </Link>

              <div className="size-8 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-400">
                <ChevronLeft className="size-4" />
              </div>
            </div>

            {/* Navigation Menu with larger, comfortable touch-friendly targets */}
            <nav className="space-y-1.5" aria-label="Navigasi Utama">
              {navMenuItems.map((item) => {
                const active =
                  (item.href === '/dashboard' && (fullPath === '/dashboard' || fullPath === '/dashboard#overview')) ||
                  (item.href !== '/dashboard' && (fullPath === item.href || (item.href.includes('#') && currentHash === item.href.slice(item.href.indexOf('#')))));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => playTap()}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f2b5c] ${
                      active
                        ? 'bg-[#0f2b5c] text-white shadow-md shadow-blue-950/20 translate-x-0.5'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 active:bg-slate-200/60'
                    }`}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="tracking-tight">{item.label}</span>
                  </Link>
                );
              })}

              <div className="my-4 border-t border-slate-100" />

              {secondaryNavItems.map((item, idx) => {
                const Icon = item.icon;
                if (item.action) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        playTap();
                        item.action();
                      }}
                      className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-[#0f2b5c] hover:bg-blue-50/70 transition cursor-pointer touch-manipulation"
                    >
                      <Icon className="size-4.5 shrink-0 text-[#0f2b5c]" />
                      <span>{item.label}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={idx}
                    href={item.href!}
                    onClick={() => playTap()}
                    className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition touch-manipulation"
                  >
                    <Icon className="size-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Box: QLon Enterprise Hub */}
          <div className="mt-6 rounded-2xl bg-[#f8fafc] border border-slate-200/90 p-4">
            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-900">
              <Sparkles className="size-4 text-[#0f2b5c]" />
              <span>QLon Enterprise Hub</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3.5">
              Siap operasional kasir cepat, scan barcode &amp; struk thermal multi-outlet.
            </p>
            <div className="flex gap-2">
              {onOpenTour && (
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    onOpenTour();
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 active:scale-95 transition shadow-2xs cursor-pointer text-center"
                >
                  Panduan
                </button>
              )}
              <Link
                href="/kasir"
                onClick={() => playTap()}
                className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-[#0f2b5c] hover:bg-[#163a75] active:scale-95 text-white transition shadow-sm shadow-blue-950/20 text-center"
              >
                Buka Kasir
              </Link>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT AREA (Edge-to-edge Full Width) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
          
          {/* TOP HEADER (High Accessibility, Responsive Touch Targets) */}
          <header className="h-16 lg:h-18 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 bg-white sticky top-0 z-20 shrink-0">
            
            {/* Left: Mobile Menu Trigger & Search Pill */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="size-11 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-950 hover:bg-slate-100 lg:hidden cursor-pointer touch-manipulation active:scale-95"
                aria-label="Buka navigasi menu"
              >
                <Menu className="size-5" />
              </button>

              {/* Mobile Brand Link */}
              <div className="lg:hidden flex items-center">
                <Link href="/dashboard" onClick={() => playTap()}>
                  <QlonLogo variant="icon" size="sm" />
                </Link>
              </div>

              {/* Search Bar Pill */}
              <div className="relative flex-1 max-w-sm hidden sm:block">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi, produk, pelanggan..."
                  aria-label="Pencarian cepat"
                  className="w-full pl-9.5 pr-4 h-10 rounded-full border border-slate-200/90 bg-[#f8fafc] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] focus:bg-white transition"
                />
              </div>

              {/* AI Assistant Pill */}
              {onOpenTour && (
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    onOpenTour();
                  }}
                  className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Sparkles className="size-4 text-[#0f2b5c]" />
                  <span>AI Assistant</span>
                </button>
              )}
            </div>

            {/* Right: Master Tenant Switcher, Notifications, Settings, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Master Administrator Global Badge */}
              {isSuperAdmin && (
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-[#0f2b5c] text-xs font-bold">
                  <ShieldCheck className="size-3.5 text-[#0f2b5c]" />
                  <span>Master Sovereign</span>
                </div>
              )}

              {/* Quick POS Shortcut Button for Tablet/Desktop */}
              <Link
                href="/kasir"
                onClick={() => playTap()}
                className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold shadow-sm shadow-blue-950/20 hover:bg-[#163a75] active:scale-95 transition"
              >
                <ShoppingCart className="size-4" />
                <span>Kasir POS</span>
              </Link>

              {/* Notification Bell */}
              <button
                type="button"
                onClick={() => playTap()}
                className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition relative cursor-pointer active:scale-95"
                title="Notifikasi"
                aria-label="Notifikasi"
              >
                <Bell className="size-4.5" />
                <span className="size-2 rounded-full bg-[#0f2b5c] absolute top-2 right-2 ring-2 ring-white" />
              </button>

              {/* Settings */}
              <Link
                href="/dashboard#settings"
                onClick={() => playTap()}
                className="size-10 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer active:scale-95"
                title="Pengaturan"
                aria-label="Pengaturan"
              >
                <Settings className="size-4.5" />
              </Link>

              {/* User Avatar & Logout Dropdown */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="size-9 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[11px] text-slate-400 capitalize mt-0.5">{roleLabel}</p>
                </div>

                <form onSubmit={handleLogout}>
                  <button
                    type="submit"
                    title="Keluar"
                    className="size-9 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition cursor-pointer active:scale-95"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              </div>
            </div>
          </header>

          {/* MAIN VIEWPORT CONTENT */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 bg-[#f8fafc]">
            <div className="w-full max-w-[1680px] mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* MOBILE ONE-HAND OPERATION BOTTOM BAR (Fixed Bottom for Phones & Small Tablets) */}
        <nav
          aria-label="Navigasi Satu Tangan Handphone"
          className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-40 flex items-center justify-around px-2 lg:hidden shadow-lg"
        >
          {/* Dasbor */}
          <Link
            href="/dashboard"
            onClick={() => playTap()}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition active:scale-90 ${
              fullPath === '/dashboard' || fullPath === '/dashboard#overview'
                ? 'text-[#0f2b5c] font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <LayoutDashboard className="size-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Dasbor</span>
          </Link>

          {/* Produk */}
          <Link
            href="/products"
            onClick={() => playTap()}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition active:scale-90 ${
              fullPath.startsWith('/products') || fullPath.startsWith('/katalog')
                ? 'text-[#0f2b5c] font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Package className="size-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Produk</span>
          </Link>

          {/* Kasir POS (Center Thumb Hero Action Button for Easy One-Hand Reach) */}
          <Link
            href="/kasir"
            onClick={() => playTap()}
            aria-label="Kasir POS Cepat"
            className="relative -top-3 flex flex-col items-center justify-center size-14 rounded-2xl bg-[#0f2b5c] text-white shadow-lg shadow-blue-950/30 transition active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
          >
            <ShoppingCart className="size-6" />
            <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">KASIR</span>
          </Link>

          {/* Transaksi */}
          <Link
            href="/transactions"
            onClick={() => playTap()}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition active:scale-90 ${
              fullPath.startsWith('/transactions') || fullPath.startsWith('/transaksi')
                ? 'text-[#0f2b5c] font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <ReceiptText className="size-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Transaksi</span>
          </Link>

          {/* Menu Lainnya (Drawer Sheet) */}
          <button
            type="button"
            onClick={() => {
              playTap();
              setMobileOpen(true);
            }}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center text-slate-500 hover:text-slate-800 font-medium transition active:scale-90"
          >
            <MoreHorizontal className="size-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Lainnya</span>
          </button>
        </nav>

        {/* MOBILE SIDEBAR DRAWER (Full height touch slide) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Tutup navigasi"
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-left duration-200">
              <div className="overflow-y-auto">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <QlonLogo variant="full" size="md" subtitle="Event & Store POS" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Tutup panel navigasi"
                    className="size-10 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* User quick badge in mobile menu */}
                <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="size-10 rounded-xl bg-[#0f2b5c] text-white flex items-center justify-center text-sm font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{roleLabel} · {outletName}</p>
                  </div>
                </div>

                <nav className="space-y-1.5" aria-label="Menu Mobile">
                  {navMenuItems.map((item) => {
                    const active = fullPath === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          playTap();
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold touch-manipulation active:scale-95 ${
                          active
                            ? 'bg-[#0f2b5c] text-white shadow-sm shadow-blue-950/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="my-3 border-t border-slate-100" />

                  {secondaryNavItems.map((item, idx) => {
                    const Icon = item.icon;
                    if (item.action) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            playTap();
                            setMobileOpen(false);
                            item.action();
                          }}
                          className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-[#0f2b5c] hover:bg-blue-50/70"
                        >
                          <Icon className="size-4.5 shrink-0 text-[#0f2b5c]" />
                          <span>{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={idx}
                        href={item.href!}
                        onClick={() => {
                          playTap();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        <Icon className="size-4.5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleLogout}>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition active:scale-95"
                  >
                    <LogOut className="size-4" /> Keluar dari Akun
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}

        {/* Global On-Screen Virtual Keyboard for Touchscreens/POS */}
        <VirtualKeyboard />

        {/* Global Real-time CS Live Support Widget */}
        <RealtimeSupportWidget />
      </div>
    </ToastProvider>
  );
}
