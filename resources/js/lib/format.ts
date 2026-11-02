const integerFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

// Built manually so server and browser output is byte-identical (avoids hydration drift).
export const formatMoney = (value: number | null | undefined) => {
  const amount = Math.round(value ?? 0);
  return `${amount < 0 ? '-' : ''}Rp${integerFormat.format(Math.abs(amount))}`;
};

export const formatCompactMoney = (value: number) => {
  if (Math.abs(value) >= 1_000_000)
    return `Rp${(value / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  if (Math.abs(value) >= 1_000) return `Rp${Math.round(value / 1_000)} rb`;
  return formatMoney(value);
};

export const formatNumber = (value: number | null | undefined) =>
  new Intl.NumberFormat('id-ID').format(value ?? 0);

export const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Makassar',
      }).format(new Date(value))
    : '—';

export const dayKey = (value: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(new Date(value));

export const dayLabel = (value: Date | string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Makassar',
  }).format(new Date(value));

export const newClientKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
