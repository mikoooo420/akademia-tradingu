'use client';

import { Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Quote } from '@/lib/api/types';
import { formatCurrency, formatNumber, formatPercent, formatPrice, trendClass } from '@/lib/format';
import { cn } from '@/lib/utils';
import { usePortfolioStore } from '@/store/portfolioStore';

export function PositionInfo({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const position = usePortfolioStore((s) => s.positions[symbol]);
  const trades = usePortfolioStore((s) => s.trades);
  const realizedOnSymbol = trades.filter((t) => t.symbol === symbol).reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0);

  if (!position) {
    return (
      <Card title={`Twoja pozycja: ${symbol}`}>
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="Nie posiadasz jeszcze tych akcji"
          description={
            realizedOnSymbol !== 0
              ? `Zrealizowany wynik na ${symbol}: ${formatCurrency(realizedOnSymbol, { signed: true })}.`
              : 'Złóż zlecenie kupna, aby otworzyć pozycję.'
          }
          className="py-6"
        />
      </Card>
    );
  }

  const price = quote?.price ?? position.avgPrice;
  const marketValue = price * position.quantity;
  const unrealized = marketValue - position.costBasis;
  const unrealizedPct = position.costBasis ? (unrealized / position.costBasis) * 100 : 0;

  const rows: Array<[string, string, string?]> = [
    ['Liczba akcji', formatNumber(position.quantity, 0)],
    ['Średnia cena wejścia', `${formatPrice(position.avgPrice)} USD`],
    ['Koszt nabycia', formatCurrency(position.costBasis)],
    ['Wartość rynkowa', formatCurrency(marketValue)],
    ['Niezrealizowany zysk/strata', `${formatCurrency(unrealized, { signed: true })} (${formatPercent(unrealizedPct)})`, trendClass(unrealized)],
    ['Zrealizowany zysk/strata', formatCurrency(realizedOnSymbol, { signed: true }), trendClass(realizedOnSymbol)],
  ];

  return (
    <Card title={`Twoja pozycja: ${symbol}`}>
      <dl className="space-y-2.5 text-sm">
        {rows.map(([label, value, tone]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="text-ink-faint">{label}</dt>
            <dd className={cn('num text-right', tone ?? 'text-ink')}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
