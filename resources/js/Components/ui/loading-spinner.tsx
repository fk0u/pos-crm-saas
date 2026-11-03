import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  label,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-12',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-[#0f2b5c]`}
        aria-hidden="true"
      />
      {label && <span className="text-xs font-semibold text-slate-500">{label}</span>}
      <span className="sr-only">Memuat data...</span>
    </div>
  );
}

export function FullPageLoader({ message = 'Memuat sistem QLon...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="p-6 rounded-3xl bg-white/95 border border-slate-200/80 shadow-2xl flex flex-col items-center max-w-xs text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="size-14 rounded-2xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#0f2b5c]">
          <Loader2 className="size-7 animate-spin text-[#0f2b5c]" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm tracking-tight">{message}</p>
          <p className="text-[11px] text-slate-400 mt-1">Harap tunggu beberapa saat</p>
        </div>
      </div>
    </div>
  );
}

