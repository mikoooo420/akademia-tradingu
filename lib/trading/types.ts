export type OrderSide = 'BUY' | 'SELL';

export const ORDER_SIDE_LABELS: Record<OrderSide, string> = {
  BUY: 'Kupno',
  SELL: 'Sprzedaż',
};

export interface Position {
  symbol: string;
  quantity: number;
  /** Średnia cena wejścia (ważona wolumenem) */
  avgPrice: number;
  /** Łączny koszt nabycia otwartej pozycji */
  costBasis: number;
  /** Zrealizowany zysk/strata na tym instrumencie od początku */
  realizedPnl: number;
  openedAt: number;
}

export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: OrderSide;
  orderType: 'MARKET';
  quantity: number;
  price: number;
  /** Wartość transakcji (ilość × cena) */
  total: number;
  /** Prowizja – w symulatorze zawsze 0 USD */
  fee: number;
  /** Zrealizowany wynik – tylko dla sprzedaży */
  realizedPnl?: number;
  /** Średnia cena wejścia przed sprzedażą – tylko dla sprzedaży */
  avgPriceAtSale?: number;
}

export interface CashEvent {
  id: string;
  timestamp: number;
  amount: number;
  description: string;
  kind: 'REWARD' | 'RESET';
}

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  quantity: number;
}

export interface Holding extends Position {
  price: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  /** Udział pozycji w wartości wszystkich pozycji (0–1) */
  weight: number;
  dayChange: number;
  dayChangePercent: number;
  hasLivePrice: boolean;
}

export interface PortfolioMetrics {
  cash: number;
  marketValue: number;
  totalEquity: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  realizedPnl: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  holdings: Holding[];
}
