'use client';

import { useMemo, useState } from 'react';
import { Download, Gift, Receipt, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, formatNumber, formatPercent, pluralize, trendClass } from '@/lib/format';
import { ORDER_SIDE_LABELS, type OrderSide, type Trade } from '@/lib/trading/types';
import { cn } from '@/lib/utils';
import { usePortfolioStore } from '@/store/portfolioStore';
import { toast } from '@/store/toastStore';
import { TradeHistoryTable } from './TradeHistoryTable';

type SideFilter = 'ALL' | OrderSide;

const FILTERS: Array<[SideFilter, string]> = [
  ['ALL', 'Wszystkie'],
  ['BUY', 'Kupno'],
  ['SELL', 'Sprzedaż'],
];

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportCsv(trades: Trade[]) {
  const header = ['Data i godzina', 'Symbol', 'Typ', 'Rodzaj zlecenia', 'Ilość', 'Cena wykonania (USD)', 'Wartość (USD)', 'Prowizja (USD)', 'Zrealizowany zysk/strata (USD)'];
  const decimal = (n: number) => n.toFixed(2).replace('.', ',');
  const rows = trades.map((t) => [
    formatDateTime(t.timestamp),
    t.symbol,
    ORDER_SIDE_LABELS[t.side],
    'Rynkowe',
    t.quantity,
    decimal(t.price),
    decimal(t.total),
    decimal(t.fee),
    t.realizedPnl !== undefined ? decimal(t.realizedPnl) : '',
  ]);
  // Średnik jako separator i BOM – plik poprawnie otworzy się w polskiej wersji Excela
  const csv = '﻿' + [header, ...rows].map((row) => row.map(csvEscape).join(';')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `historia-transakcji-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function HistoryView() {
  const trades = usePortfolioStore((s) => s.trades);
  const cashEvents = usePortfolioStore((s) => s.cashEvents);
  const [side, setSide] = useState<SideFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    return trades.filter((t) => (side === 'ALL' || t.side === side) && (!q || t.symbol.includes(q)));
  }, [trades, side, query]);

  const stats = useMemo(() => {
    const sells = trades.filter((t) => t.side === 'SELL');
    const winners = sells.filter((t) => (t.realizedPnl ?? 0) > 0);
    const realized = sells.reduce((sum, t) => sum + (t.realizedPnl ?? 0), 0);
    const turnover = trades.reduce((sum, t) => sum + t.total, 0);
    return {
      count: trades.length,
      turnover,
      realized,
      winRate: sells.length ? (winners.length / sells.length) * 100 : null,
      closed: sells.length,
    };
  }, [trades]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Liczba transakcji" value={formatNumber(stats.count, 0)} />
        <StatTile label="Łączny obrót" value={formatCurrency(stats.turnover)} />
        <StatTile label="Zrealizowany zysk/strata" value={formatCurrency(stats.realized, { signed: true })} valueClass={trendClass(stats.realized)} />
        <StatTile
          label="Skuteczność sprzedaży"
          value={stats.winRate === null ? '—' : formatPercent(stats.winRate, { signed: false })}
          hint={stats.closed ? `${stats.closed} ${pluralize(stats.closed, 'zamknięta transakcja', 'zamknięte transakcje', 'zamkniętych transakcji')}` : 'Brak zamkniętych transakcji'}
        />
      </div>

      <Card
        title="Historia transakcji"
        subtitle="Pełny dziennik zrealizowanych zleceń"
        icon={<Receipt className="h-4 w-4" />}
        noPadding
        action={
          <Button
            variant="secondary"
            size="sm"
            disabled={filtered.length === 0}
            onClick={() => {
              exportCsv(filtered);
              toast.success('Wyeksportowano historię', `Zapisano ${filtered.length} ${pluralize(filtered.length, 'transakcję', 'transakcje', 'transakcji')} do pliku CSV.`);
            }}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Eksportuj CSV</span>
          </Button>
        }
      >
        <div className="flex flex-col gap-2 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg border border-line bg-bg-soft p-0.5">
            {FILTERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSide(value)}
                aria-pressed={side === value}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none',
                  side === value ? 'bg-bg-elevated text-ink shadow' : 'text-ink-faint hover:text-ink-muted',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtruj po symbolu…"
              className="input-base h-9 pl-9"
              aria-label="Filtruj transakcje po symbolu"
            />
          </div>
        </div>
        <TradeHistoryTable
          trades={filtered}
          emptyDescription={trades.length ? 'Żadna transakcja nie pasuje do wybranych filtrów.' : 'Złóż pierwsze zlecenie w symulatorze, a pojawi się ono w tym miejscu.'}
        />
      </Card>

      <Card title="Nagrody i operacje gotówkowe" subtitle="Wirtualna gotówka zdobyta w kursie" icon={<Gift className="h-4 w-4" />} noPadding>
        {cashEvents.length === 0 ? (
          <EmptyState icon={<Gift className="h-5 w-5" />} title="Brak operacji" description="Ukończ moduł kursu, aby otrzymać nagrodę w wirtualnej gotówce." />
        ) : (
          <ul className="divide-y divide-line/60">
            {cashEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      event.kind === 'REWARD' ? 'bg-gold/10 text-gold' : 'bg-bg-elevated text-ink-muted',
                    )}
                  >
                    {event.kind === 'REWARD' ? <Gift className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{event.description}</p>
                    <p className="text-[11px] text-ink-faint">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
                <span className={cn('num shrink-0 text-sm', event.kind === 'REWARD' ? 'text-gold' : 'text-ink-muted')}>
                  {event.kind === 'REWARD' ? formatCurrency(event.amount, { signed: true }) : formatCurrency(event.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatTile({ label, value, valueClass, hint }: { label: string; value: string; valueClass?: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg-card p-4 shadow-card">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={cn('num mt-1.5 truncate text-lg font-semibold text-ink sm:text-xl', valueClass)}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </div>
  );
}
