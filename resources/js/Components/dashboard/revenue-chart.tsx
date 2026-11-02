import React, { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/Components/ui/card';
import { Segmented } from '@/Components/ui/segmented';
import type { DailyPoint } from '@/lib/analytics';
import { formatCompactMoney, formatMoney } from '@/lib/format';

const W = 640;
const H = 240;

export function RevenueChart({
  series,
  title = 'Tren Omzet Penjualan',
}: {
  series: DailyPoint[];
  title?: string;
}) {
  const [range, setRange] = useState<7 | 14 | 30>(14);
  const [active, setActive] = useState<number | null>(null);

  // If series is shorter than range, handle gracefully
  const data = series.length >= range ? series.slice(-range) : series;
  const previous = series.slice(-range * 2, -range);
  const max = Math.max(...data.map((point) => point.revenue), 1);
  const total = data.reduce((sum, point) => sum + point.revenue, 0);
  const previousTotal = previous.reduce((sum, point) => sum + point.revenue, 0);
  const growth = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : null;

  const x = (index: number) => (data.length <= 1 ? W / 2 : (index * W) / (data.length - 1));
  const y = (value: number) => H - 12 - (value / max) * (H - 40);

  const line = data.length > 0
    ? data.map((point, index) => `${index ? 'L' : 'M'}${x(index)},${y(point.revenue)}`).join(' ')
    : '';
  const area = data.length > 0
    ? `${line} L${x(data.length - 1)},${H} L0,${H} Z`
    : '';

  const shown = active !== null && data[active] ? data[active] : null;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <Card className="p-5 sm:p-6 bg-white border-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="money mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {formatMoney(shown ? shown.revenue : total)}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs">
            {shown ? (
              <span className="text-slate-500">
                {shown.label} &middot; {shown.count} transaksi
              </span>
            ) : growth !== null ? (
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  growth >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {growth >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {Math.abs(growth).toFixed(1).replace('.', ',')}% vs {range} hari sebelumnya
              </span>
            ) : (
              <span className="text-slate-500">Total {range} hari terakhir</span>
            )}
          </div>
        </div>

        <Segmented
          label="Rentang grafik"
          value={range}
          onChange={(value) => {
            setRange(value);
            setActive(null);
          }}
          options={[
            { value: 7, label: '7 Hari' },
            { value: 14, label: '14 Hari' },
            { value: 30, label: '30 Hari' },
          ]}
        />
      </div>

      <div className="relative mt-6 h-56 touch-pan-y sm:h-64" onMouseLeave={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label={`Grafik omzet ${range} hari terakhir`}
        >
          <defs>
            <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={W}
              y1={y(max * ratio)}
              y2={y(max * ratio)}
              className="stroke-slate-100"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {data.length > 0 && (
            <g key={range} className="animate-reveal">
              <path d={area} fill="url(#revenue-fill)" />
              <path
                d={line}
                fill="none"
                className="stroke-navy-700"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}

          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1="0"
              y2={H}
              className="stroke-navy-400"
              strokeDasharray="4 4"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {data.map((point, index) => (
            <rect
              key={point.key}
              x={x(index) - W / data.length / 2}
              y="0"
              width={W / data.length}
              height={H}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
              onTouchStart={() => setActive(index)}
              onFocus={() => setActive(index)}
              tabIndex={0}
              aria-label={`${point.label}: ${formatMoney(point.revenue)}`}
              className="cursor-pointer"
            />
          ))}
        </svg>

        {shown && active !== null ? (
          <>
            <span
              className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-navy-700 shadow-md"
              style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(shown.revenue) / H) * 100}%` }}
            />
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-navy-950 px-3 py-2 text-center text-white shadow-xl animate-scale-in"
              style={{
                left: `${Math.min(88, Math.max(12, (x(active) / W) * 100))}%`,
                top: `calc(${(y(shown.revenue) / H) * 100}% - 12px)`,
              }}
            >
              <p className="money text-xs font-bold text-white">{formatCompactMoney(shown.revenue)}</p>
              <p className="text-[10px] text-navy-200">{shown.label} &bull; {shown.count} trx</p>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-slate-400">
        {data.map((point, index) =>
          index % labelEvery === 0 || index === data.length - 1 ? (
            <span key={point.key}>{point.label}</span>
          ) : null,
        )}
      </div>
    </Card>
  );
}
