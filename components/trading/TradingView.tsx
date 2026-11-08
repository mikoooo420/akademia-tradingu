'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ArrowRight, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { isValidSymbol } from '@/lib/api/catalog';
import { formatPercent, trendClass } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { OrderPanel } from './OrderPanel';
import { PositionInfo } from './PositionInfo';
import { PriceChart } from './PriceChart';
import { SymbolSearch } from './SymbolSearch';
import { TickerHeader } from './TickerHeader';
import { TradeHistoryTable } from './TradeHistoryTable';

export function TradingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const setSelectedSymbol = useMarketStore((s) => s.setSelectedSymbol);
  const quotes = useMarketStore((s) => s.quotes);
  const refreshQuotes = useMarketStore((s) => s.refreshQuotes);
  const watchlist = usePortfolioStore((s) => s.watchlist);
  const positions = usePortfolioStore((s) => s.positions);
  const trades = usePortfolioStore((s) => s.trades);

  const paramSymbol = searchParams.get('symbol')?.toUpperCase();

  // Synchronizacja wybranego instrumentu z parametrem ?symbol= w adresie
  useEffect(() => {
    if (paramSymbol && isValidSymbol(paramSymbol) && paramSymbol !== selectedSymbol) {
      setSelectedSymbol(paramSymbol);
    }
  }, [paramSymbol, selectedSymbol, setSelectedSymbol]);

  const symbol = paramSymbol && isValidSymbol(paramSymbol) ? paramSymbol : selectedSymbol;
  const quote = quotes[symbol];

  useEffect(() => {
    if (!quotes[symbol]) void refreshQuotes([symbol]);
  }, [symbol, quotes, refreshQuotes]);

  const selectSymbol = (next: string) => {
    setSelectedSymbol(next);
    router.replace(`/handel?symbol=${encodeURIComponent(next)}`, { scroll: false });
  };

  const quickSymbols = useMemo(
    () => Array.from(new Set([...Object.keys(positions), ...watchlist])).slice(0, 12),
    [positions, watchlist],
  );
  const symbolTrades = useMemo(() => trades.filter((t) => t.symbol === symbol).slice(0, 8), [trades, symbol]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SymbolSearch onSelect={selectSymbol} className="lg:w-96" markedSymbols={watchlist} />
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
          {quickSymbols.map((s) => {
            const q = quotes[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => selectSymbol(s)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                  s === symbol ? 'border-brand/60 bg-brand/10 text-ink' : 'border-line bg-bg-card text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                <span className="font-mono font-semibold">{s}</span>
                {q && <span className={cn('num', trendClass(q.changePercent))}>{formatPercent(q.changePercent)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card noPadding className="flex min-h-[520px] flex-col overflow-hidden" bodyClassName="flex flex-1 flex-col">
          <TickerHeader symbol={symbol} quote={quote} />
          <div className="mt-2 flex-1 pb-3">
            <PriceChart symbol={symbol} livePrice={quote?.price} />
          </div>
        </Card>

        <div className="space-y-4">
          <OrderPanel symbol={symbol} quote={quote} />
          <PositionInfo symbol={symbol} quote={quote} />
        </div>
      </div>

      <Card
        title={`Ostatnie transakcje: ${symbol}`}
        icon={<History className="h-4 w-4" />}
        noPadding
        action={
          <Link href="/historia" className="inline-flex items-center gap-1 text-xs text-brand-glow hover:underline">
            Pełna historia <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <TradeHistoryTable trades={symbolTrades} compact emptyDescription={`Nie zawarłeś jeszcze żadnej transakcji na ${symbol}.`} />
      </Card>
    </div>
  );
}
