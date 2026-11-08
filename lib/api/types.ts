export type DataSource = 'finnhub' | 'yahoo' | 'mock';

export type Timeframe = '1D' | '1W' | '1M' | '1Y';

export const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '1Y'];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  '1D': '1 dzień',
  '1W': '1 tydzień',
  '1M': '1 miesiąc',
  '1Y': '1 rok',
};

export interface Quote {
  symbol: string;
  /** Bieżąca cena */
  price: number;
  /** Zmiana względem poprzedniego zamknięcia */
  change: number;
  /** Zmiana procentowa względem poprzedniego zamknięcia */
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  /** Znacznik czasu w milisekundach */
  timestamp: number;
  source: DataSource;
}

export interface Candle {
  /** Unix timestamp w sekundach (UTC) */
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesResponse {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
  source: DataSource;
}

export interface QuotesResponse {
  quotes: Record<string, Quote>;
  source: DataSource;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  sector?: string;
}

export interface SearchResponse {
  results: SymbolInfo[];
  source: DataSource | 'local';
}
