'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pill } from '@/components/ui/Pill';
import { formatCurrency, formatDateTime, formatNumber, formatPrice, trendClass } from '@/lib/format';
import { ORDER_SIDE_LABELS, type Trade } from '@/lib/trading/types';
import { cn } from '@/lib/utils';

interface TradeHistoryTableProps {
  trades: Trade[];
  compact?: boolean;
  emptyDescription?: string;
}

export function TradeHistoryTable({ trades, compact = false, emptyDescription }: TradeHistoryTableProps) {
  if (trades.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-5 w-5" />}
        title="Brak transakcji"
        description={emptyDescription ?? 'Twoje zrealizowane zlecenia pojawią się tutaj.'}
      />
    );
  }

  return (
    <>
      {/* Widok tabeli – tablet i desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table-base">
          <thead>
            <tr>
              <th>Data i godzina</th>
              <th>Symbol</th>
              <th>Typ</th>
              {!compact && <th>Zlecenie</th>}
              <th className="text-right">Ilość</th>
              <th className="text-right">Cena wykonania</th>
              <th className="text-right">Wartość</th>
              {!compact && <th className="text-right">Prowizja</th>}
              <th className="text-right">Zrealizowany Z/S</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className="num text-xs text-ink-muted">{formatDateTime(trade.timestamp)}</td>
                <td>
                  <Link href={`/handel?symbol=${encodeURIComponent(trade.symbol)}`} className="font-mono font-semibold text-ink hover:text-brand-glow">
                    {trade.symbol}
                  </Link>
                </td>
                <td>
                  <Pill tone={trade.side === 'BUY' ? 'up' : 'down'}>{ORDER_SIDE_LABELS[trade.side]}</Pill>
                </td>
                {!compact && <td className="text-ink-muted">Rynkowe</td>}
                <td className="num text-right">{formatNumber(trade.quantity, 0)}</td>
                <td className="num text-right">{formatPrice(trade.price)}</td>
                <td className="num text-right">{formatCurrency(trade.total)}</td>
                {!compact && <td className="num text-right text-ink-muted">{formatCurrency(trade.fee)}</td>}
                <td className={cn('num text-right', trade.realizedPnl !== undefined ? trendClass(trade.realizedPnl) : 'text-ink-faint')}>
                  {trade.realizedPnl !== undefined ? formatCurrency(trade.realizedPnl, { signed: true }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Widok kart – telefon */}
      <ul className="divide-y divide-line md:hidden">
        {trades.map((trade) => (
          <li key={trade.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-ink">{trade.symbol}</span>
                <Pill tone={trade.side === 'BUY' ? 'up' : 'down'}>{ORDER_SIDE_LABELS[trade.side]}</Pill>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-faint">{formatDateTime(trade.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="num text-sm text-ink">
                {formatNumber(trade.quantity, 0)} × {formatPrice(trade.price)}
              </p>
              <p className={cn('num text-xs', trade.realizedPnl !== undefined ? trendClass(trade.realizedPnl) : 'text-ink-faint')}>
                {trade.realizedPnl !== undefined ? formatCurrency(trade.realizedPnl, { signed: true }) : formatCurrency(trade.total)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
