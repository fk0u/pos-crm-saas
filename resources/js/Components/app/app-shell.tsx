import { useState, type ReactNode } from 'react';
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
  UserRound,
  X,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { ToastProvider } from '@/Components/ui/toast';
import { LiveClock } from './live-clock';

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
      { href: '/dashboard#sales', label: 'Transaksi & Retur', icon: ReceiptText },
      { href: '/dashboard#shifts', label: 'Shift Kasir', icon: ClipboardList },
    ],
  },
  {
    label: 'Operasional',
    items: [
      { href: '/dashboard#inventory', label: 'Produk & Stok', icon: Package },
      { href: '/dashboard#crm', label: 'Pelanggan & Loyalty', icon: Users },
      { href: '/dashboard#reports', label: 'Laporan Finansial', icon: BarChart3 },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { href: '/dashboard#settings', label: 'Pengaturan Bisnis', icon: Settings },
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
    <div className="flex h-full flex-col bg-navy-950 text-white">
      <div className="flex h-18 items-center gap-3 border-b border-white/10 px-5">
        <div className="grid size-9 place-items-center rounded-xl bg-white text-navy-800 shadow-sm">
          <Store className="size-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">Omnipoint</p>
          <p className="text-[11px] text-navy-200">POS + CRM SAAS</p>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items
                .filter(
                  (item) =>
                    !(
                      user.role === 'cashier' &&
                      ['/dashboard#reports', '/dashboard#settings'].includes(item.href)
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
                      onClick={onNavigate}
                      className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                        active
                          ? 'bg-navy-700 text-white shadow-sm'
                          : 'text-navy-100/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="size-4.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-700 text-xs font-bold text-white">
            {user.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs capitalize text-navy-200">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={() => router.post('/logout')}
            title="Keluar"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-navy-200 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const { url, props } = usePage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const authUser = (props.auth as any)?.user || {};
  const user: AppUser = {
    name: authUser.name || (props.userName as string) || 'Hendra Setiawan',
    role: (authUser.role || props.role || 'owner') as 'owner' | 'manager' | 'cashier',
    email: authUser.email || 'owner@kopikawan.com',
    outletName: (props.outletName as string) || 'Cabang Utama',
    tenantName: (props.tenantName as string) || 'Kopi Kawan Indonesia',
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-950">
        {/* Desktop Sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
          <Sidebar pathname={url} user={user} />
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
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
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid size-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 lg:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="size-5" />
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{user.tenantName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">{user.outletName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveClock />
              <Link href="/pos">
                <Button size="sm" variant="primary">
                  <ShoppingCart className="size-4" />
                  <span className="hidden sm:inline">Kasir Cepat</span>
                </Button>
              </Link>
            </div>
          </header>

          {/* Subheader / Page Header */}
          {title && (
            <div className="border-b border-slate-200 bg-white px-4 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            </div>
          )}

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-2 lg:hidden">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const active = url.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                  active ? 'text-navy-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ToastProvider>
  );
}
