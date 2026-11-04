import React from 'react';
import { Link } from '@inertiajs/react';
import {
  ShieldCheck,
  Activity,
  Bug,
  Database,
  Landmark,
  Building2,
  Users,
  MessageSquare,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { playTap } from '@/lib/sound';

interface SuperadminNavProps {
  currentTab: 'overview' | 'incidents' | 'backups' | 'governance' | 'tenants' | 'users' | 'tickets';
  unresolvedIncidentsCount?: number;
  activeDelegation?: any;
  onOpenEmergencyModal?: () => void;
  onOpenClaimModal?: () => void;
}

export function SuperadminNav({
  currentTab,
  unresolvedIncidentsCount = 0,
  activeDelegation = null,
  onOpenEmergencyModal,
  onOpenClaimModal,
}: SuperadminNavProps) {
  const navItems = [
    {
      id: 'overview',
      label: 'Ikhtisar Platform',
      href: '/superadmin',
      icon: Activity,
    },
    {
      id: 'incidents',
      label: 'Deteksi Insiden & Bug',
      href: '/superadmin/incidents',
      icon: Bug,
      badge: unresolvedIncidentsCount > 0 ? unresolvedIncidentsCount : null,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'backups',
      label: 'Backup & Pemulihan',
      href: '/superadmin/backups',
      icon: Database,
    },
    {
      id: 'tenants',
      label: 'Penyewa Bisnis',
      href: '/superadmin/tenants',
      icon: Building2,
    },
    {
      id: 'users',
      label: 'Direktori Pengguna',
      href: '/superadmin/users',
      icon: Users,
    },
    {
      id: 'tickets',
      label: 'Tiket & Delegasi',
      href: '/superadmin/tickets',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-4">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0f2b5c] text-[10px] font-black uppercase tracking-wider">
              Platform Owner Sovereign
            </span>
            {activeDelegation && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Delegasi Aktif: {activeDelegation.name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <ShieldCheck className="size-6 text-[#0f2b5c]" />
            <span>Pusat Pengaturan Sistem (Sovereign Command Center)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen klaster SaaS multi-tenant, observabilitas audit perbankan, dan pengawasan kedaulatan data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenEmergencyModal && (
            <button
              type="button"
              onClick={() => {
                playTap();
                onOpenEmergencyModal();
              }}
              className="h-9 px-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
            >
              <ShieldAlert className="size-4 text-amber-600" />
              <span>Pemulihan Darurat</span>
            </button>
          )}

          {onOpenClaimModal && (
            <button
              type="button"
              onClick={() => {
                playTap();
                onOpenClaimModal();
              }}
              className="h-9 px-3.5 rounded-xl bg-[#0f2b5c] hover:bg-[#163a75] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/20 active:scale-95 transition cursor-pointer"
            >
              <KeyRound className="size-4" />
              <span>Klaim Token</span>
            </button>
          )}
        </div>
      </div>

      {/* MODULAR PAGE TABS (SUBNAV) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200/90 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => playTap()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-[#0f2b5c] text-white shadow-sm shadow-blue-950/15'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    item.badgeColor || 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

