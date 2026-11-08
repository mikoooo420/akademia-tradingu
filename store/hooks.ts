'use client';

import { useMemo } from 'react';
import { computePortfolioMetrics, computeRealizedPnl } from '@/lib/trading/engine';
import type { PortfolioMetrics } from '@/lib/trading/types';
import { useMarketStore } from './marketStore';
import { usePortfolioStore } from './portfolioStore';

/** Wyliczone metryki portfela – przeliczane przy każdej zmianie notowań lub pozycji. */
export function usePortfolioMetrics(): PortfolioMetrics {
  const cash = usePortfolioStore((s) => s.cash);
  const positions = usePortfolioStore((s) => s.positions);
  const trades = usePortfolioStore((s) => s.trades);
  const totalDeposits = usePortfolioStore((s) => s.totalDeposits);
  const quotes = useMarketStore((s) => s.quotes);

  const realizedPnl = useMemo(() => computeRealizedPnl(trades), [trades]);

  return useMemo(
    () => computePortfolioMetrics(cash, positions, quotes, realizedPnl, totalDeposits),
    [cash, positions, quotes, realizedPnl, totalDeposits],
  );
}

/** Wszystkie symbole, dla których aplikacja powinna odświeżać notowania. */
export function useTrackedSymbols(): string[] {
  const watchlist = usePortfolioStore((s) => s.watchlist);
  const positions = usePortfolioStore((s) => s.positions);
  const tracked = useMarketStore((s) => s.trackedSymbols);
  const selected = useMarketStore((s) => s.selectedSymbol);

  return useMemo(
    () => Array.from(new Set([selected, ...watchlist, ...Object.keys(positions), ...tracked])),
    [selected, watchlist, positions, tracked],
  );
}
