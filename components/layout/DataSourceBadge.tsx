'use client';

import { useEffect, useState } from 'react';
import { useMarketStore } from '@/store/marketStore';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const LABELS = {
  finnhub: { text: 'Dane na żywo · Finnhub', dot: 'bg-up' },
  yahoo: { text: 'Dane rynkowe · Yahoo Finance', dot: 'bg-up' },
  mock: { text: 'Dane symulowane', dot: 'bg-gold' },
} as const;

export function DataSourceBadge({ compact = false }: { compact?: boolean }) {
  const source = useMarketStore((s) => s.source);
  const status = useMarketStore((s) => s.status);
  const lastUpdated = useMarketStore((s) => s.lastUpdated);
  const [, forceTick] = useState(0);

  // Odświeżenie etykiety czasu co 30 s
  useEffect(() => {
    const t = window.setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const meta = source ? LABELS[source] : { text: status === 'error' ? 'Brak połączenia' : 'Łączenie z rynkiem…', dot: status === 'error' ? 'bg-down' : 'bg-ink-faint' };

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-3 py-1 text-[11px] text-ink-muted"
      title={
        source === 'mock'
          ? 'Zewnętrzne API jest niedostępne lub przekroczono limit zapytań. Ceny są generowane przez symulator.'
          : 'Notowania odświeżane automatycznie co 15 sekund.'
      }
    >
      <span className="relative flex h-2 w-2">
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', meta.dot)} />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', meta.dot)} />
      </span>
      <span className="whitespace-nowrap">{compact && source ? (source === 'mock' ? 'Symulacja' : 'Na żywo') : meta.text}</span>
      {!compact && lastUpdated && <span className="hidden text-ink-faint xl:inline">· {formatTime(lastUpdated)}</span>}
    </div>
  );
}
