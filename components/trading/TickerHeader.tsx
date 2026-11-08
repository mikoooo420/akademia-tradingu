'use client';

import { Star } from 'lucide-react';
import { FlashPrice } from '@/components/ui/FlashPrice';
import { PriceChange } from '@/components/ui/PriceChange';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCatalogEntry } from '@/lib/api/catalog';
import type { Quote } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { usePortfolioStore } from '@/store/portfolioStore';
import { toast } from '@/store/toastStore';

interface TickerHeaderProps {
  symbol: string;
  quote?: Quote;
}

export function TickerHeader({ symbol, quote }: TickerHeaderProps) {
  const entry = getCatalogEntry(symbol);
  const watched = usePortfolioStore((s) => s.watchlist.includes(symbol));
  const addToWatchlist = usePortfolioStore((s) => s.addToWatchlist);
  const removeFromWatchlist = usePortfolioStore((s) => s.removeFromWatchlist);

  const toggleWatch = () => {
    if (watched) {
      removeFromWatchlist(symbol);
      toast.info(`Usunięto ${symbol} z listy obserwowanych`);
    } else {
      addToWatchlist(symbol);
      toast.success(`Dodano ${symbol} do listy obserwowanych`);
    }
  };

  const stats: Array<[string, number | undefined]> = [
    ['Otwarcie', quote?.open],
    ['Maks. dnia', quote?.high],
    ['Min. dnia', quote?.low],
    ['Poprz. zamknięcie', quote?.previousClose],
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 sm:px-5 xl:flex-row xl:items-end xl:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-bg-elevated px-2 py-0.5 font-mono text-sm font-bold text-ink">{symbol}</span>
          <h2 className="truncate text-sm text-ink-muted">{entry?.name ?? 'Instrument spoza katalogu'}</h2>
          <button
            type="button"
            onClick={toggleWatch}
            aria-pressed={watched}
            title={watched ? 'Usuń z listy obserwowanych' : 'Dodaj do listy obserwowanych'}
            className="rounded-md p-1 text-ink-faint transition-colors hover:bg-bg-hover hover:text-gold"
          >
            <Star className={cn('h-4 w-4 transition-transform', watched && 'scale-110 fill-gold text-gold')} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {quote ? (
            <>
              <FlashPrice price={quote.price} suffix="USD" className="text-3xl font-semibold text-ink" />
              <PriceChange change={quote.change} percent={quote.changePercent} className="text-sm" />
              <span className="text-xs text-ink-faint">dziś</span>
            </>
          ) : (
            <Skeleton className="h-9 w-48" />
          )}
        </div>
        {entry?.sector && <p className="mt-1 text-xs text-ink-faint">Sektor: {entry.sector}</p>}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[11px] text-ink-faint">{label}</dt>
            <dd className="num text-sm text-ink">{value !== undefined ? formatPrice(value) : '—'}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
