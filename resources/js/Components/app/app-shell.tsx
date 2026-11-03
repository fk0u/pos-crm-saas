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
  Building2,
  Package,
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
  role: 'superadmin' | 'owner' | 'manager' | 'cashier';
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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pos', label: 'Terminal POS', icon: ShoppingCart },
    { href: '/dashboard#inventory', label: 'Katalog Produk', icon: Package },
    { href: '/dashboard#sales', label: 'Transaksi', icon: ReceiptText },
    { href: '/dashboard#cashflow', label: 'Arus Kas', icon: CircleDollarSign },
    { href: '/dashboard#crm', label: 'Pelanggan CRM', icon: Users },
    { href: '/dashboard#reports', label: 'Laporan', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { label: 'Panduan (Tour)', icon: Sparkles, action: onOpenTour },
    { href: '/dashboard#faq', label: 'FAQ', icon: FileQuestion },
    { href: '/dashboard#help', label: 'Pusat Bantuan', icon: Headphones },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen w-full bg-[#f8fafc] antialiased text-slate-900 font-sans flex flex-col lg:flex-row">
        <CommandPalette />

        {/* DESKTOP SIDEBAR (Edge-to-edge, Full Height Sticky) */}
        <aside className="w-60 xl:w-64 bg-white border-r border-slate-200/80 min-h-screen h-screen sticky top-0 flex flex-col justify-between p-4 shrink-0 hidden lg:flex select-none z-30">
          <div className="flex flex-col flex-1 overflow-y-auto pr-0.5">
            {/* Brand Header */}
              <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-100 px-1">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] flex items-center justify-center text-white shadow-xs">
                    <span className="font-black text-sm tracking-tighter text-sky-200">Q</span>
                  </div>
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">QLon</span>
                </Link>

                <div className="size-6 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-400">
                  <ChevronLeft className="size-3.5" />
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        active
                          ? 'bg-[#0f2b5c] text-white shadow-sm shadow-blue-950/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
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
                          item.action();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-[#0f2b5c] hover:bg-blue-50/60 transition cursor-pointer"
                      >
                        <Icon className="size-4 shrink-0 text-[#0f2b5c]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={idx}
                      href={item.href!}
                      onClick={() => playTap()}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Sidebar Box: Try QLon / Onboarding Tour Callout */}
            <div className="mt-6 rounded-2xl bg-[#f8fafc] border border-slate-200/80 p-3.5">
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-slate-900">
                <Sparkles className="size-3.5 text-[#0f2b5c]" />
                <span>QLon Enterprise Hub</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                Dirancang untuk performa tinggi saat event festival ramai &amp; cetak thermal multi-outlet.
              </p>
              <div className="flex gap-1.5">
                {onOpenTour && (
                  <button
                    type="button"
                    onClick={() => {
                      playTap();
                      onOpenTour();
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer text-center"
                  >
                    Mulai Tour
                  </button>
                )}
                <Link
                  href="/pos"
                  onClick={() => playTap()}
                  className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold bg-[#0f2b5c] hover:bg-[#163a75] text-white transition shadow-2xs text-center"
                >
                  Buka Kasir
                </Link>
              </div>
            </div>
        </aside>

        {/* MAIN VIEWPORT AREA (Edge-to-edge Full Width) */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f8fafc]">
          
          {/* TOP HEADER (Databrain Style) */}
          <header className="h-16 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 bg-white sticky top-0 z-20 shrink-0">
              
              {/* Left: Mobile Menu Trigger & Search Pill */}
              <div className="flex items-center gap-3 flex-1 max-w-xl">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="size-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 lg:hidden cursor-pointer"
                  aria-label="Buka navigasi"
                >
                  <Menu className="size-4" />
                </button>

                {/* Search Bar Pill */}
                <div className="relative flex-1 max-w-sm hidden sm:block">
                  <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search..."
                    className="w-full pl-8.5 pr-4 h-9 rounded-full border border-slate-200/90 bg-[#f8fafc] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2b5c] focus:bg-white transition"
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
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-[#0f2b5c]" />
                    <span>AI Assistant</span>
                  </button>
                )}
              </div>

              {/* Right: Master Tenant Switcher, Notifications, Settings, Profile */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Master Administrator Global Badge */}
                {isSuperAdmin && (
                  <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#0f2b5c] text-[10px] font-bold">
                    <ShieldCheck className="size-3 text-[#0f2b5c]" />
                    <span>Master Sovereign Mode</span>
                  </div>
                )}

                {/* Notification Bell */}
                <button
                  type="button"
                  onClick={() => playTap()}
                  className="size-9 rounded-full border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition relative cursor-pointer"
                  title="Notifikasi"
                  aria-label="Notifikasi"
                >
                  <Bell className="size-4" />
                  <span className="size-1.5 rounded-full bg-[#0f2b5c] absolute top-2 right-2" />
                </button>

                {/* Settings */}
                <Link
                  href="/dashboard#settings"
                  onClick={() => playTap()}
                  className="size-9 rounded-full border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Pengaturan"
                  aria-label="Pengaturan"
                >
                  <Settings className="size-4" />
                </Link>

                {/* User Avatar & Logout Dropdown */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                  <div className="size-8 rounded-full bg-[#0f2b5c] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{roleLabel}</p>
                  </div>

                  <form onSubmit={handleLogout}>
                    <button
                      type="submit"
                      title="Keluar"
                      className="size-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </header>

          {/* MAIN DASHBOARD VIEW CONTENT */}
          <main className="p-4 sm:p-6 lg:p-8 flex-1 bg-[#f8fafc]">
            <div className="w-full max-w-[1680px] mx-auto">
              {children}
            </div>
          </main>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Tutup navigasi"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative h-full w-72 bg-white shadow-2xl flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-gradient-to-br from-[#0f2b5c] to-[#1e4488] flex items-center justify-center text-white">
                      <span className="font-black text-sm tracking-tighter text-sky-200">Q</span>
                    </div>
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">QLon</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="size-8 rounded-lg text-slate-400 hover:text-slate-800"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1">
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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                          active
                            ? 'bg-[#0f2b5c] text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
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
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
                  >
                    <LogOut className="size-3.5" /> Keluar
                  </button>
                </form>
              </div>
            </aside>
          </div>
        )}
      </div>
    </ToastProvider>
  );
}
