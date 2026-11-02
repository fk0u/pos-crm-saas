import { useEffect, useState } from 'react';

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!now) return <span className="skeleton block h-4 w-36 rounded" />;
  const date = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Makassar',
  }).format(now);
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Makassar',
  }).format(now);
  return (
    <span className="text-xs text-slate-500">
      {date} · <span className="font-mono font-semibold text-slate-700">{time} WITA</span>
    </span>
  );
}
