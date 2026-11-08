/** Formatowanie liczb, kwot i dat zgodnie z polskimi konwencjami (pl-PL). */

// W pl-PL liczby czterocyfrowe domyślnie nie mają separatora tysięcy ("2500,00").
// Wymuszamy grupowanie, aby wszystkie kwoty w interfejsie wyglądały spójnie ("2 500,00").
const GROUPING = { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions;

const currencyFormatter = new Intl.NumberFormat('pl-PL', {
  ...GROUPING,
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number, options?: { signed?: boolean }): string {
  const safe = Number.isFinite(value) ? value : 0;
  const formatted = currencyFormatter.format(Math.abs(safe) < 0.005 ? 0 : safe);
  if (options?.signed && safe > 0.004) return `+${formatted}`;
  return formatted;
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatNumber(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('pl-PL', {
    ...GROUPING,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatPrice(value: number): string {
  return formatNumber(value, value !== 0 && Math.abs(value) < 1 ? 4 : 2);
}

export function formatPercent(value: number, options?: { signed?: boolean }): string {
  const safe = Number.isFinite(value) ? value : 0;
  const rounded = Math.abs(safe) < 0.005 ? 0 : safe;
  const formatted = `${formatNumber(rounded, 2)}%`;
  if (options?.signed !== false && rounded > 0) return `+${formatted}`;
  return formatted;
}

export function formatVolume(value: number): string {
  return new Intl.NumberFormat('pl-PL', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(new Date(timestamp));
}

export function formatTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp));
}

/** Polska odmiana rzeczownika przez liczby, np. pluralize(5, 'akcja', 'akcje', 'akcji'). */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const n = Math.abs(Math.trunc(count));
  if (n === 1) return one;
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

/** Klasa koloru dla wartości dodatnich/ujemnych. */
export function trendClass(value: number): string {
  if (value > 0.004) return 'text-up';
  if (value < -0.004) return 'text-down';
  return 'text-ink-muted';
}
