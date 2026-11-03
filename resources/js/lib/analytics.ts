import { dayKey, dayLabel } from './format';

export type DailyPoint = { key: string; label: string; revenue: number; count: number };

type SaleLike = { completedAt: string; grandTotal: number };

export function buildDailySeries(sales: SaleLike[], days: number): DailyPoint[] {
  const points = new Map<string, DailyPoint>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 86_400_000);
    const key = dayKey(date);
    points.set(key, { key, label: dayLabel(date), revenue: 0, count: 0 });
  }
  for (const sale of sales) {
    const point = points.get(dayKey(sale.completedAt));
    if (!point) continue;
    point.revenue += sale.grandTotal;
    point.count += 1;
  }
  return [...points.values()];
}

export const categoryTone = (color?: string | null) => {
  const tones: Record<string, { tile: string; dot: string }> = {
    navy: { tile: 'from-navy-500 to-navy-800', dot: 'bg-navy-500' },
    sky: { tile: 'from-sky-400 to-sky-700', dot: 'bg-sky-500' },
    amber: { tile: 'from-amber-400 to-orange-600', dot: 'bg-amber-500' },
    emerald: { tile: 'from-emerald-400 to-emerald-700', dot: 'bg-emerald-500' },
    rose: { tile: 'from-rose-400 to-rose-700', dot: 'bg-rose-500' },
    violet: { tile: 'from-violet-400 to-violet-700', dot: 'bg-violet-500' },
  };
  return tones[color ?? 'navy'] ?? tones.navy;
};

export const initials = (name?: string | null) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';
