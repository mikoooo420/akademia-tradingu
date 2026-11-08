/**
 * Silnik realizacji zleceń – czyste funkcje bez efektów ubocznych.
 * Łatwe do testowania i niezależne od warstwy stanu (Zustand).
 */
import type { Quote } from '../api/types';
import { formatCurrency, formatNumber } from '../format';
import type { Holding, OrderRequest, PortfolioMetrics, Position, Trade } from './types';

export const INITIAL_BALANCE = 100_000;
export const COMMISSION = 0;
export const MAX_ORDER_QUANTITY = 1_000_000;

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundPrice(value: number): number {
  return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
}

export function createId(prefix = 'tx'): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

export interface ExecutionState {
  cash: number;
  positions: Record<string, Position>;
}

export type ExecutionResult =
  | { ok: true; cash: number; positions: Record<string, Position>; trade: Trade }
  | { ok: false; error: string };

export function validateOrder(state: ExecutionState, order: OrderRequest, price: number | undefined): string | null {
  const { quantity, side } = order;
  const symbol = order.symbol.toUpperCase();

  if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    return 'Ilość musi być dodatnią liczbą całkowitą.';
  }
  if (quantity > MAX_ORDER_QUANTITY) {
    return `Maksymalna wielkość pojedynczego zlecenia to ${formatNumber(MAX_ORDER_QUANTITY, 0)} akcji.`;
  }
  if (price === undefined || !Number.isFinite(price) || price <= 0) {
    return `Brak aktualnej ceny dla ${symbol}. Spróbuj ponownie za chwilę.`;
  }

  if (side === 'BUY') {
    const cost = roundMoney(quantity * price + COMMISSION);
    if (cost > state.cash + 1e-9) {
      return `Niewystarczające środki. Zlecenie wymaga ${formatCurrency(cost)}, a dostępna gotówka to ${formatCurrency(state.cash)}.`;
    }
  } else {
    const held = state.positions[symbol]?.quantity ?? 0;
    if (held === 0) return `Nie posiadasz akcji ${symbol}, więc nie możesz ich sprzedać.`;
    if (quantity > held) {
      return `Nie posiadasz wystarczającej liczby akcji ${symbol}. Dostępne do sprzedaży: ${formatNumber(held, 0)} szt.`;
    }
  }
  return null;
}

/** Realizuje zlecenie rynkowe po podanej cenie i zwraca nowy stan portfela. */
export function executeMarketOrder(
  state: ExecutionState,
  order: OrderRequest,
  price: number | undefined,
  now: number = Date.now(),
): ExecutionResult {
  const symbol = order.symbol.toUpperCase();
  const error = validateOrder(state, { ...order, symbol }, price);
  if (error || price === undefined) return { ok: false, error: error ?? 'Nieznany błąd zlecenia.' };

  const quantity = order.quantity;
  const total = roundMoney(quantity * price);
  const positions = { ...state.positions };
  const existing = positions[symbol];

  if (order.side === 'BUY') {
    const newQuantity = (existing?.quantity ?? 0) + quantity;
    const newCostBasis = roundMoney((existing?.costBasis ?? 0) + total);
    positions[symbol] = {
      symbol,
      quantity: newQuantity,
      avgPrice: roundPrice(newCostBasis / newQuantity),
      costBasis: newCostBasis,
      realizedPnl: existing?.realizedPnl ?? 0,
      openedAt: existing?.openedAt ?? now,
    };
    const trade: Trade = {
      id: createId('buy'),
      timestamp: now,
      symbol,
      side: 'BUY',
      orderType: 'MARKET',
      quantity,
      price,
      total,
      fee: COMMISSION,
    };
    return { ok: true, cash: roundMoney(state.cash - total - COMMISSION), positions, trade };
  }

  // SELL – validateOrder gwarantuje istnienie pozycji
  const position = existing as Position;
  const avgPrice = position.avgPrice;
  const realizedPnl = roundMoney((price - avgPrice) * quantity - COMMISSION);
  const remaining = position.quantity - quantity;

  if (remaining === 0) {
    delete positions[symbol];
  } else {
    positions[symbol] = {
      ...position,
      quantity: remaining,
      costBasis: roundMoney(avgPrice * remaining),
      realizedPnl: roundMoney(position.realizedPnl + realizedPnl),
    };
  }

  const trade: Trade = {
    id: createId('sell'),
    timestamp: now,
    symbol,
    side: 'SELL',
    orderType: 'MARKET',
    quantity,
    price,
    total,
    fee: COMMISSION,
    realizedPnl,
    avgPriceAtSale: avgPrice,
  };
  return { ok: true, cash: roundMoney(state.cash + total - COMMISSION), positions, trade };
}

/** Maksymalna liczba akcji możliwa do kupienia za dostępną gotówkę. */
export function maxAffordableQuantity(cash: number, price: number | undefined): number {
  if (!price || price <= 0) return 0;
  return Math.max(0, Math.floor((cash - COMMISSION) / price + 1e-9));
}

export function computeRealizedPnl(trades: Trade[]): number {
  return roundMoney(trades.reduce((sum, trade) => sum + (trade.realizedPnl ?? 0), 0));
}

export function computePortfolioMetrics(
  cash: number,
  positions: Record<string, Position>,
  quotes: Record<string, Quote | undefined>,
  realizedPnl: number,
  totalDeposits: number,
): PortfolioMetrics {
  const list = Object.values(positions);
  const raw = list.map((position) => {
    const quote = quotes[position.symbol];
    const price = quote?.price ?? position.avgPrice;
    const marketValue = roundMoney(price * position.quantity);
    const unrealizedPnl = roundMoney(marketValue - position.costBasis);
    const dayChange = quote ? roundMoney(quote.change * position.quantity) : 0;
    return {
      ...position,
      price,
      marketValue,
      unrealizedPnl,
      unrealizedPnlPercent: position.costBasis ? (unrealizedPnl / position.costBasis) * 100 : 0,
      dayChange,
      dayChangePercent: quote?.changePercent ?? 0,
      hasLivePrice: Boolean(quote),
      weight: 0,
    } satisfies Holding;
  });

  const marketValue = roundMoney(raw.reduce((sum, h) => sum + h.marketValue, 0));
  const costBasis = roundMoney(raw.reduce((sum, h) => sum + h.costBasis, 0));
  const unrealizedPnl = roundMoney(marketValue - costBasis);
  const totalEquity = roundMoney(cash + marketValue);
  const holdings = raw
    .map((h) => ({ ...h, weight: marketValue > 0 ? h.marketValue / marketValue : 0 }))
    .sort((a, b) => b.marketValue - a.marketValue);
  const totalReturn = roundMoney(totalEquity - totalDeposits);

  return {
    cash,
    marketValue,
    totalEquity,
    costBasis,
    unrealizedPnl,
    unrealizedPnlPercent: costBasis ? (unrealizedPnl / costBasis) * 100 : 0,
    realizedPnl,
    totalReturn,
    totalReturnPercent: totalDeposits ? (totalReturn / totalDeposits) * 100 : 0,
    dayChange: roundMoney(raw.reduce((sum, h) => sum + h.dayChange, 0)),
    holdings,
  };
}
