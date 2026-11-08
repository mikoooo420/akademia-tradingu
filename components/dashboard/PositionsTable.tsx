'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ChevronRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlashPrice } from '@/components/ui/FlashPrice';
import { getCompanyName } from '@/lib/api/catalog';
import { formatCurrency, formatNumber, formatPercent, formatPrice, pluralize, trendClass } from '@/lib/format';
import type { PortfolioMetrics } from '@/lib/trading/types';
import { cn } from '@/lib/utils';

export function PositionsTable({ metrics }: { metrics: PortfolioMetrics }) {
  const router = useRouter();
  const { holdings } = metrics;
  const open = (symbol: string) => router.push(`/handel?symbol=${encodeURIComponent(symbol)}`);

  return (
    <Card
      title="Otwarte pozycje"
      subtitle={holdings.length ? `${holdings.length} ${pluralize(holdings.length, 'pozycja', 'pozycje', 'pozycji')}` : undefined}
      icon={<Briefcase className="h-4 w-4" />}
      noPadding
    >
      {holdings.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-5 w-5" />}
          title="Nie masz jeszcze żadnych pozycji"
          description="Przejdź do symulatora, wybierz spółkę i złóż pierwsze zlecenie kupna."
          action={
            <Link href="/handel" className={buttonClasses('primary', 'sm')}>
              Otwórz symulator
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th className="text-right">Ilość</th>
                  <th className="text-right">Średnia cena wejścia</th>
                  <th className="text-right">Bieżąca cena</th>
                  <th className="text-right">Wartość rynkowa</th>
                  <th className="text-right">Niezrealizowany Z/S</th>
                  <th className="text-right">Udział</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.symbol} onClick={() => open(h.symbol)} className="cursor-pointer">
                    <td>
                      <p className="font-mono font-semibold text-ink">{h.symbol}</p>
                      <p className="max-w-[180px] truncate text-[11px] text-ink-faint">{getCompanyName(h.symbol)}</p>
                    </td>
                    <td className="num text-right">{formatNumber(h.quantity, 0)}</td>
                    <td className="num text-right text-ink-muted">{formatPrice(h.avgPrice)}</td>
                    <td className="text-right">
                      <FlashPrice price={h.price} />
                    </td>
                    <td className="num text-right">{formatCurrency(h.marketValue)}</td>
                    <td className={cn('num text-right', trendClass(h.unrealizedPnl))}>
                      <p>{formatCurrency(h.unrealizedPnl, { signed: true })}</p>
                      <p className="text-[11px] opacity-80">{formatPercent(h.unrealizedPnlPercent)}</p>
                    </td>
                    <td className="text-right">
                      <div className="ml-auto flex w-24 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elevated">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round(h.weight * 100)}%` }} />
                        </div>
                        <span className="num w-9 text-right text-xs text-ink-muted">{Math.round(h.weight * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-line md:hidden">
            {holdings.map((h) => (
              <li key={h.symbol}>
                <button type="button" onClick={() => open(h.symbol)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-bg-hover">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-ink">{h.symbol}</p>
                    <p className="num text-[11px] text-ink-faint">
                      {formatNumber(h.quantity, 0)} szt. · śr. {formatPrice(h.avgPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="num text-sm text-ink">{formatCurrency(h.marketValue)}</p>
                      <p className={cn('num text-xs', trendClass(h.unrealizedPnl))}>
                        {formatCurrency(h.unrealizedPnl, { signed: true })} ({formatPercent(h.unrealizedPnlPercent)})
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-faint" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
