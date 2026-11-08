'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { LoaderCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fetchQuotes } from '@/lib/api/client';
import type { Quote } from '@/lib/api/types';
import { formatCurrency, formatNumber, formatPrice, pluralize } from '@/lib/format';
import { COMMISSION, maxAffordableQuantity, validateOrder } from '@/lib/trading/engine';
import type { OrderSide } from '@/lib/trading/types';
import { cn } from '@/lib/utils';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { toast } from '@/store/toastStore';

interface OrderPanelProps {
  symbol: string;
  quote?: Quote;
}

const QUICK_FRACTIONS: Array<[string, number]> = [
  ['25%', 0.25],
  ['50%', 0.5],
  ['75%', 0.75],
  ['Maks.', 1],
];

export function OrderPanel({ symbol, quote }: OrderPanelProps) {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [quantityInput, setQuantityInput] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  const cash = usePortfolioStore((s) => s.cash);
  const positions = usePortfolioStore((s) => s.positions);
  const placeOrder = usePortfolioStore((s) => s.placeOrder);
  const upsertQuotes = useMarketStore((s) => s.upsertQuotes);

  const held = positions[symbol]?.quantity ?? 0;
  const price = quote?.price;
  const quantity = Number(quantityInput);
  const estimated = price && Number.isFinite(quantity) ? quantity * price : 0;
  const maxQuantity = side === 'BUY' ? maxAffordableQuantity(cash, price) : held;

  const validationError = useMemo(() => {
    if (quantityInput.trim() === '') return 'Podaj liczbę akcji.';
    return validateOrder({ cash, positions }, { symbol, side, quantity }, price);
  }, [quantityInput, cash, positions, symbol, side, quantity, price]);

  const cashAfter = side === 'BUY' ? cash - estimated - COMMISSION : cash + estimated - COMMISSION;

  const setFraction = (fraction: number) => {
    setQuantityInput(String(Math.max(Math.floor(maxQuantity * fraction), 0)));
  };

  const step = (delta: number) => {
    const current = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    setQuantityInput(String(Math.max(1, current + delta)));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (validationError || submitting) return;
    setSubmitting(true);

    // Pobieramy najświeższą cenę tuż przed realizacją zlecenia
    const fresh = await fetchQuotes([symbol]);
    const executionQuote = fresh[symbol] ?? quote;
    if (fresh[symbol]) upsertQuotes({ [symbol]: fresh[symbol] });

    const result = placeOrder({ symbol, side, quantity }, executionQuote?.price);
    setSubmitting(false);

    if (!result.ok) {
      toast.error('Zlecenie odrzucone', result.error);
      return;
    }

    const { trade } = result;
    const noun = pluralize(trade.quantity, 'akcję', 'akcje', 'akcji');
    if (trade.side === 'BUY') {
      toast.success('Zlecenie kupna zrealizowane', `Kupiono ${formatNumber(trade.quantity, 0)} ${noun} ${symbol} po ${formatPrice(trade.price)} USD. Wartość: ${formatCurrency(trade.total)}.`);
    } else {
      const pnl = trade.realizedPnl ?? 0;
      toast.success(
        'Zlecenie sprzedaży zrealizowane',
        `Sprzedano ${formatNumber(trade.quantity, 0)} ${noun} ${symbol} po ${formatPrice(trade.price)} USD. Zrealizowany ${pnl >= 0 ? 'zysk' : 'wynik'}: ${formatCurrency(pnl, { signed: true })}.`,
      );
    }
    setQuantityInput('1');
  };

  const isBuy = side === 'BUY';

  return (
    <Card title="Nowe zlecenie" subtitle="Zlecenie rynkowe · prowizja 0 USD">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg-soft p-1" role="tablist" aria-label="Rodzaj zlecenia">
          {(['BUY', 'SELL'] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={side === s}
              onClick={() => setSide(s)}
              className={cn(
                'rounded-lg py-2 text-sm font-semibold transition-all',
                side === s ? (s === 'BUY' ? 'bg-up text-white shadow' : 'bg-down text-white shadow') : 'text-ink-muted hover:text-ink',
              )}
            >
              {s === 'BUY' ? 'Kup' : 'Sprzedaj'}
            </button>
          ))}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <label htmlFor="order-qty" className="font-medium text-ink-muted">
              Ilość (szt.)
            </label>
            <span className="text-ink-faint">
              {isBuy ? 'Możesz kupić' : 'Posiadasz'}: <span className="num text-ink-muted">{formatNumber(maxQuantity, 0)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => step(-1)} aria-label="Zmniejsz ilość">
              <Minus className="h-4 w-4" />
            </Button>
            <input
              id="order-qty"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={quantityInput}
              onChange={(e) => setQuantityInput(e.target.value)}
              className="input-base num text-center text-base font-semibold"
            />
            <Button variant="secondary" size="icon" onClick={() => step(1)} aria-label="Zwiększ ilość">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {QUICK_FRACTIONS.map(([label, fraction]) => (
              <button
                key={label}
                type="button"
                onClick={() => setFraction(fraction)}
                disabled={maxQuantity === 0}
                className="rounded-md border border-line py-1 text-[11px] font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <dl className="space-y-2 rounded-xl border border-line bg-bg-soft p-3 text-sm">
          <Row label="Cena rynkowa" value={price ? `${formatPrice(price)} USD` : '—'} />
          <Row label="Szacowana wartość" value={formatCurrency(estimated)} strong />
          <Row label="Prowizja" value={formatCurrency(COMMISSION)} />
          <div className="my-1 border-t border-line" />
          <Row label="Dostępna gotówka" value={formatCurrency(cash)} />
          <Row label="Gotówka po transakcji" value={formatCurrency(validationError ? cash : cashAfter)} />
        </dl>

        {validationError && quantityInput.trim() !== '' && (
          <p className="rounded-lg border border-down/30 bg-down-soft px-3 py-2 text-xs text-down" role="alert">
            {validationError}
          </p>
        )}

        <Button type="submit" variant={isBuy ? 'buy' : 'sell'} size="lg" className="w-full" disabled={Boolean(validationError) || submitting}>
          {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {isBuy ? `Kup ${symbol}` : `Sprzedaj ${symbol}`}
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-ink-faint">
          Zlecenie zostanie zrealizowane natychmiast po bieżącej cenie rynkowej. Handel odbywa się wyłącznie na wirtualnych środkach.
        </p>
      </form>
    </Card>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className={cn('num text-right', strong ? 'font-semibold text-ink' : 'text-ink-muted')}>{value}</dd>
    </div>
  );
}
