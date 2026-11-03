import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
  Search,
  ShoppingCart,
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Receipt,
  Keyboard,
  Maximize2,
  Volume2,
  ArrowRight,
  Sparkles,
  Store,
  X,
  CreditCard,
  Plus,
} from 'lucide-react';
import { playTap } from '@/lib/sound';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'Navigasi' | 'Kasir' | 'Operasional' | 'Alat';
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenShortcuts?: () => void;
  outletName?: string;
}

export function CommandPalette({ isOpen = false, onClose = () => {}, onOpenShortcuts, outletName = 'Outlet' }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    {
      id: 'pos',
      title: 'Buka Terminal Kasir POS',
      description: 'Layar kasir cepat, barcode scanner & tender fisik',
      icon: ShoppingCart,
      category: 'Kasir',
      shortcut: 'F2 / F4',
      action: () => {
        router.visit('/pos');
      },
    },
    {
      id: 'dashboard',
      title: 'Dashboard Ringkasan Penjualan',
      description: 'Pantau omzet hari ini, grafik hourly & KPI',
      icon: LayoutDashboard,
      category: 'Navigasi',
      shortcut: 'G D',
      action: () => {
        router.visit('/dashboard#overview');
      },
    },
    {
      id: 'sales',
      title: 'Daftar Transaksi & Retur',
      description: 'Cari riwayat invoice, struk belanja & retur',
      icon: Receipt,
      category: 'Navigasi',
      action: () => {
        router.visit('/dashboard#sales');
      },
    },
    {
      id: 'inventory',
      title: 'Katalog Produk & Stok Bahan',
      description: 'Cek stok produk menipis dan status per outlet',
      icon: Package,
      category: 'Operasional',
      action: () => {
        router.visit('/dashboard#inventory');
      },
    },
    {
      id: 'crm',
      title: 'Pelanggan & Member Loyalitas',
      description: 'Data kontak WhatsApp pelanggan dan poin reward',
      icon: Users,
      category: 'Operasional',
      action: () => {
        router.visit('/dashboard#crm');
      },
    },
    {
      id: 'reports',
      title: 'Laporan Penjualan & Rekap Pajak',
      description: 'Gross revenue, HPP margin, dan unduh CSV rekap',
      icon: BarChart3,
      category: 'Operasional',
      action: () => {
        router.visit('/dashboard#reports');
      },
    },
    {
      id: 'settings',
      title: 'Pengaturan Outlet & Kasir',
      description: 'Konfigurasi laci kasir, pajak PB1, dan staf',
      icon: Settings,
      category: 'Operasional',
      action: () => {
        router.visit('/dashboard#settings');
      },
    },
    {
      id: 'audit',
      title: 'Jejak Audit & Keamanan Kasir',
      description: 'Log pembukaan shift, otorisasi retur, dan perubahan harga',
      icon: ShieldCheck,
      category: 'Operasional',
      action: () => {
        router.visit('/dashboard#audit');
      },
    },
    {
      id: 'shortcuts',
      title: 'Daftar Shortcut Keyboard Kasir',
      description: 'Panduan tombol cepat F1, F4, Spasi, Esc untuk kasir',
      icon: Keyboard,
      category: 'Alat',
      shortcut: '?',
      action: () => {
        onOpenShortcuts?.();
      },
    },
    {
      id: 'fullscreen',
      title: 'Toggle Layar Penuh (Kiosk Mode)',
      description: 'Maksimalkan tampilan kasir tanpa distraksi browser',
      icon: Maximize2,
      category: 'Alat',
      shortcut: 'F9',
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      },
    },
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Keyboard listener for Navigation & Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        playTap();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
        }
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        playTap();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playTap();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          playTap();
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-100 flex items-center px-4 py-3">
          <Search className="size-5 text-slate-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Ketik nama halaman, aksi cepat, atau menu... (↑↓ navigasi, Enter pilih)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="size-8 mx-auto mb-2 opacity-30 stroke-[1.5]" />
              <p className="text-xs font-bold text-slate-600">Tidak ada aksi yang sesuai</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Coba cari dengan kata kunci "kasir", "laporan", atau "stok".</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playTap();
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'bg-navy-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-navy-900'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/20'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight className={`size-3.5 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-900">QLon OS</span>
            <span>•</span>
            <span>{outletName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Tekan <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">ESC</kbd> untuk keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
