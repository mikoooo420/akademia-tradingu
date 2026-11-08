'use client';

import { useEffect, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

const LABELS = {
  finnhub: { text: 'Dane na żywo · Finnhub', short: 'Na żywo', dot: 'bg-up' },
  mock: { text: 'Dane symulowane', short: 'Symulacja', dot: 'bg-gold' },
} as const;

export function DataSourceBadge({ compact = false }: { compact?: boolean }) {
  const source = useMarketStore((s) => s.source);
  const status = useMarketStore((s) => s.status);
  const lastUpdated = useMarketStore((s) => s.lastUpdated);
  const openDataDialog = useSettingsStore((s) => s.openDataDialog);
  const [, forceTick] = useState(0);

  // Odświeżenie etykiety czasu co 30 s
  useEffect(() => {
    const t = window.setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const meta = source
    ? LABELS[source]
    : { text: 'Łączenie z rynkiem…', short: 'Łączenie…', dot: status === 'error' ? 'bg-down' : 'bg-ink-faint' };

  return (
    <button
      type="button"
      onClick={openDataDialog}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-3 py-1 text-[11px] text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      title={
        source === 'mock'
          ? 'Ceny są generowane przez symulator. Kliknij, aby podłączyć notowania na żywo.'
          : 'Notowania odświeżane automatycznie co 15 sekund. Kliknij, aby zmienić ustawienia.'
      }
    >
      <span className="relative flex h-2 w-2">
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', meta.dot)} />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', meta.dot)} />
      </span>
      <span className="whitespace-nowrap">{compact ? meta.short : meta.text}</span>
      {!compact && lastUpdated && <span className="hidden text-ink-faint xl:inline">· {formatTime(lastUpdated)}</span>}
      <Settings2 className="h-3 w-3 text-ink-faint" />
    </button>
  );
}
