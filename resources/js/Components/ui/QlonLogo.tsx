import React from 'react';

export interface QlonLogoProps {
  variant?: 'full' | 'icon' | 'mark' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'navy' | 'light' | 'white' | 'dark';
  animated?: boolean;
  className?: string;
  subtitle?: string;
}

const sizeMap = {
  xs: { icon: 20, font: 'text-xs', sub: 'text-[8px]', gap: 'gap-1.5' },
  sm: { icon: 26, font: 'text-sm', sub: 'text-[9px]', gap: 'gap-2' },
  md: { icon: 34, font: 'text-lg', sub: 'text-[10px]', gap: 'gap-2.5' },
  lg: { icon: 44, font: 'text-2xl', sub: 'text-xs', gap: 'gap-3' },
  xl: { icon: 56, font: 'text-3xl', sub: 'text-sm', gap: 'gap-3.5' },
};

export function QlonLogo({
  variant = 'full',
  size = 'md',
  theme = 'navy',
  animated = false,
  className = '',
  subtitle = 'POS & CRM',
}: QlonLogoProps) {
  const currentSize = sizeMap[size] || sizeMap.md;
  const isWhite = theme === 'white';
  const isDark = theme === 'dark';

  // SVG Mark: Stylized geometric continuous loop "Q" with transaction speed connector
  const mark = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
      aria-label="QLon Monogram"
    >
      <defs>
        {/* Primary Navy-to-Cyan Gradient */}
        <linearGradient id="qlon_grad_primary" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f2b5c" />
          <stop offset="55%" stopColor="#1e4488" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Pulse Core Glow Accent */}
        <linearGradient id="qlon_grad_accent" x1="28" y1="20" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Subtle Depth Shadow */}
        <filter id="qlon_glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f2b5c" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Rounded Outer Pill Shield (Subtle Elevation) */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="18"
        fill={isWhite ? '#ffffff' : isDark ? '#0b192e' : 'url(#qlon_grad_primary)'}
        filter="url(#qlon_glow)"
      />

      {/* Outer Continuous 'Q' Torus Ring */}
      <path
        d="M32 14C22.0589 14 14 22.0589 14 32C14 41.9411 22.0589 50 32 50C36.8521 50 41.2678 48.0772 44.5215 44.9525"
        stroke={isWhite ? '#0f2b5c' : '#ffffff'}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Dynamic Terminal Sparkle Loop (The 'Q' Tail / Event Concurrency Node) */}
      <path
        d="M30 34L48 48M48 48L48 38M48 48L38 48"
        stroke={isWhite ? '#0284c7' : '#38bdf8'}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Transaction Sync Hub (Center Quantum Node) */}
      <circle
        cx="32"
        cy="32"
        r="6.5"
        fill={isWhite ? '#0f2b5c' : '#38bdf8'}
        fillOpacity={isWhite ? '0.15' : '0.25'}
        stroke={isWhite ? '#0f2b5c' : '#38bdf8'}
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="2.5"
        fill={isWhite ? '#0f2b5c' : '#ffffff'}
      />
    </svg>
  );

  if (variant === 'icon' || variant === 'mark') {
    return <span className={`inline-flex items-center justify-center ${className}`}>{mark}</span>;
  }

  // Full Brand Logo with Typographic Lockup
  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {mark}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${currentSize.font} ${
              isWhite ? 'text-white' : 'text-slate-900'
            }`}
          >
            QLon
          </span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded-md text-[9px] tracking-wide uppercase ${
              isWhite
                ? 'bg-white/20 text-white'
                : 'bg-blue-50 text-[#0f2b5c] border border-blue-200/60'
            }`}
          >
            2026
          </span>
        </div>
        {subtitle && (
          <span
            className={`font-semibold tracking-wider uppercase mt-0.5 ${currentSize.sub} ${
              isWhite ? 'text-blue-100/70' : 'text-slate-400'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default QlonLogo;

