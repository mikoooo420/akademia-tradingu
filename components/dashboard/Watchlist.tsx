'use client';

import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlashPrice } from '@/components/ui/FlashPrice';
import { PriceChange } from '@/components/ui/PriceChange';
import { Skeleton } from '@/components/ui/Skeleton';
import { SymbolSearch } from '@/components/trading/SymbolSearch';
import { getCompanyName } from '@/lib/api/catalog';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { toast } from '@/store/toastStore';

export function Watchlist() {
  const router = useRouter();
  const watchlist = usePortfolioStore((s) => s.watchlist);
  const addToWatchlist = usePortfolioStore((s) => s.addToWatchlist);
  const removeFromWatchlist = usePortfolioStore((s) => s.removeFromWatchlist);
  const quotes = useMarketStore((s) => s.quotes);
  const refreshQuotes = useMarketStore((s) => s.refreshQuotes);

  const onAdd = (symbol: string) => {
    if (addToWatchlist(symbol)) {
      toast.success(`Dodano ${symbol} do listy obserwowanych`);
      void refreshQuotes([symbol]);
    } else {
      toast.info(`${symbol} jest już na liście obserwowanych`);
    }
  };

  return (
    <Card title="Lista obserwowanych" subtitle="Kliknij instrument, aby otworzyć wykres" icon={<Eye className="h-4 w-4" />} noPadding>
      <div className="border-b border-line p-3">
        <SymbolSearch onSelect={onAdd} placeholder="Dodaj spółkę: symbol lub nazwa…" markedSymbols={watchlist} />
      </div>
      {watchlist.length === 0 ? (
        <EmptyState icon={<Eye className="h-5 w-5" />} title="Lista jest pusta" description="Wyszukaj spółkę powyżej, aby zacząć ją obserwować." />
      ) : (
        <ul className="max-h-[440px] divide-y divide-line/60 overflow-y-auto">
          {watchlist.map((symbol) => {
            const quote = quotes[symbol];
            return (
              <li key={symbol} className="group relative">
                <button
                  type="button"
                  onClick={() => router.push(`/handel?symbol=${encodeURIComponent(symbol)}`)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 pr-11 text-left transition-colors hover:bg-bg-hover/60"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-ink">{symbol}</p>
                    <p className="truncate text-[11px] text-ink-faint">{getCompanyName(symbol)}</p>
                  </div>
                  <div className="text-right">
                    {quote ? (
                      <>
                        <FlashPrice price={quote.price} className="text-sm text-ink" />
                        <div>
                          <PriceChange percent={quote.changePercent} variant="chip" className="mt-0.5" />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <Skeleton className="ml-auto h-4 w-16" />
                        <Skeleton className="ml-auto h-4 w-12" />
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeFromWatchlist(symbol);
                    toast.info(`Usunięto ${symbol} z listy obserwowanych`);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-faint opacity-100 transition-opacity hover:bg-bg-elevated hover:text-down lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100"
                  aria-label={`Usuń ${symbol} z listy obserwowanych`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
