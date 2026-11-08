/**
 * Klient danych rynkowych używany w przeglądarce.
 * Odpytuje własne Route Handlery (/api/*), a w razie ich niedostępności
 * generuje dane symulowane lokalnie – interfejs nigdy nie zostaje bez danych.
 */
import { searchCatalog } from './catalog';
import { getMockCandles, getMockQuote } from './mock';
import type { CandlesResponse, Quote, QuotesResponse, SearchResponse, Timeframe } from './types';

const CLIENT_TIMEOUT_MS = 8000;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  if (symbols.length === 0) return {};
  try {
    const data = await getJson<QuotesResponse>(`/api/quote?symbols=${encodeURIComponent(symbols.join(','))}`);
    return data.quotes;
  } catch {
    const now = Date.now();
    return Object.fromEntries(symbols.map((symbol) => [symbol, getMockQuote(symbol, now)]));
  }
}

export async function fetchCandles(symbol: string, timeframe: Timeframe): Promise<CandlesResponse> {
  try {
    return await getJson<CandlesResponse>(
      `/api/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}`,
    );
  } catch {
    return { symbol, timeframe, candles: getMockCandles(symbol, timeframe), source: 'mock' };
  }
}

export async function searchSymbols(query: string): Promise<SearchResponse> {
  try {
    return await getJson<SearchResponse>(`/api/search?q=${encodeURIComponent(query)}`);
  } catch {
    return { results: searchCatalog(query), source: 'local' };
  }
}
