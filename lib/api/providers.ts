/**
 * Dostawcy danych rynkowych – wykorzystywani wyłącznie po stronie serwera (Route Handlers).
 * Kolejność: Finnhub (gdy ustawiono FINNHUB_API_KEY) → Yahoo Finance → dane symulowane.
 * Każda awaria (limit zapytań, brak sieci, błędny symbol) kończy się płynnym przejściem
 * na kolejne źródło, więc aplikacja zawsze otrzymuje dane.
 */
import { getMockCandles, getMockQuote, round2, TIMEFRAME_CONFIG } from './mock';
import { searchCatalog } from './catalog';
import type { Candle, CandlesResponse, Quote, SearchResponse, SymbolInfo, Timeframe } from './types';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const REQUEST_TIMEOUT_MS = 5000;

const QUOTE_TTL_MS = 15_000;
const CANDLES_TTL_MS = 60_000;
const SEARCH_TTL_MS = 10 * 60_000;
/** Po otrzymaniu błędu 429 dostawca jest pomijany przez ten czas. */
const RATE_LIMIT_COOLDOWN_MS = 60_000;

interface CacheEntry<T> {
  value: T;
  expires: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const cooldownUntil: Record<'finnhub' | 'yahoo', number> = { finnhub: 0, yahoo: 0 };

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T, ttl: number): void {
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, { value, expires: Date.now() + ttl });
}

class RateLimitError extends Error {
  constructor(provider: string) {
    super(`Przekroczono limit zapytań: ${provider}`);
  }
}

function forceMock(): boolean {
  return process.env.MARKET_DATA_MODE === 'mock';
}

function finnhubKey(): string | undefined {
  const key = process.env.FINNHUB_API_KEY?.trim();
  return key ? key : undefined;
}

async function fetchJson(url: string, provider: 'finnhub' | 'yahoo', headers?: Record<string, string>): Promise<unknown> {
  if (Date.now() < cooldownUntil[provider]) throw new RateLimitError(provider);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', ...headers },
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 429) {
    cooldownUntil[provider] = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    throw new RateLimitError(provider);
  }
  if (!response.ok) throw new Error(`${provider}: HTTP ${response.status}`);
  return response.json();
}

/* ----------------------------------------------------------------------------
 * Finnhub
 * ------------------------------------------------------------------------- */

interface FinnhubQuote {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

async function finnhubQuote(symbol: string, key: string): Promise<Quote> {
  const data = (await fetchJson(
    `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
    'finnhub',
  )) as FinnhubQuote;
  if (!data || typeof data.c !== 'number' || data.c <= 0) throw new Error(`finnhub: brak notowań dla ${symbol}`);
  const change = data.d ?? data.c - data.pc;
  return {
    symbol,
    price: round2(data.c),
    change: round2(change),
    changePercent: round2(data.dp ?? (data.pc ? (change / data.pc) * 100 : 0)),
    high: round2(data.h || data.c),
    low: round2(data.l || data.c),
    open: round2(data.o || data.c),
    previousClose: round2(data.pc || data.c),
    timestamp: data.t ? data.t * 1000 : Date.now(),
    source: 'finnhub',
  };
}

interface FinnhubSearch {
  result?: Array<{ symbol: string; description: string; type: string }>;
}

async function finnhubSearch(query: string, key: string): Promise<SymbolInfo[]> {
  const data = (await fetchJson(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&exchange=US&token=${key}`,
    'finnhub',
  )) as FinnhubSearch;
  return (data.result ?? [])
    .filter((item) => item.type === 'Common Stock' || item.type === 'ETP' || item.type === 'ETF')
    .filter((item) => !item.symbol.includes(':'))
    .slice(0, 10)
    .map((item) => ({ symbol: item.symbol, name: toTitleCase(item.description) }));
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/\bInc\b/g, 'Inc.')
    .replace(/\bCorp\b/g, 'Corp.');
}

/* ----------------------------------------------------------------------------
 * Yahoo Finance (publiczny endpoint wykresów, bez klucza)
 * ------------------------------------------------------------------------- */

interface YahooChart {
  chart?: {
    result?: Array<{
      meta: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
    error?: unknown;
  };
}

function yahooSymbol(symbol: string): string {
  return symbol.replace('.', '-');
}

async function yahooChart(symbol: string, range: string, interval: string): Promise<NonNullable<NonNullable<YahooChart['chart']>['result']>[number]> {
  const data = (await fetchJson(
    `${YAHOO_BASE}/${encodeURIComponent(yahooSymbol(symbol))}?range=${range}&interval=${interval}&includePrePost=false`,
    'yahoo',
    { 'User-Agent': 'Mozilla/5.0 (compatible; AkademiaTradingu/1.0)' },
  )) as YahooChart;
  const result = data.chart?.result?.[0];
  if (!result) throw new Error(`yahoo: brak danych dla ${symbol}`);
  return result;
}

async function yahooQuote(symbol: string): Promise<Quote> {
  const result = await yahooChart(symbol, '1d', '5m');
  const meta = result.meta;
  const price = meta.regularMarketPrice;
  if (typeof price !== 'number' || price <= 0) throw new Error(`yahoo: brak ceny dla ${symbol}`);
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const opens = result.indicators?.quote?.[0]?.open ?? [];
  const firstOpen = opens.find((value): value is number => typeof value === 'number');
  const change = price - previousClose;
  return {
    symbol,
    price: round2(price),
    change: round2(change),
    changePercent: previousClose ? round2((change / previousClose) * 100) : 0,
    high: round2(meta.regularMarketDayHigh ?? price),
    low: round2(meta.regularMarketDayLow ?? price),
    open: round2(firstOpen ?? price),
    previousClose: round2(previousClose),
    timestamp: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
    source: 'yahoo',
  };
}

async function yahooCandles(symbol: string, timeframe: Timeframe): Promise<Candle[]> {
  const { yahooRange, yahooInterval } = TIMEFRAME_CONFIG[timeframe];
  const result = await yahooChart(symbol, yahooRange, yahooInterval);
  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  if (!quote || timestamps.length === 0) throw new Error(`yahoo: brak świec dla ${symbol}`);

  const candles: Candle[] = [];
  let lastTime = -1;
  timestamps.forEach((time, i) => {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    if ([open, high, low, close].some((v) => typeof v !== 'number' || !Number.isFinite(v))) return;
    if (time <= lastTime) return; // lightweight-charts wymaga rosnących znaczników czasu
    lastTime = time;
    candles.push({
      time,
      open: round2(open as number),
      high: round2(high as number),
      low: round2(low as number),
      close: round2(close as number),
      volume: quote.volume?.[i] ?? 0,
    });
  });
  if (candles.length < 2) throw new Error(`yahoo: za mało świec dla ${symbol}`);
  return candles;
}

/* ----------------------------------------------------------------------------
 * Publiczne API serwera
 * ------------------------------------------------------------------------- */

export async function getQuote(symbol: string): Promise<Quote> {
  const upper = symbol.toUpperCase();
  if (forceMock()) return getMockQuote(upper);

  const cacheKey = `quote:${upper}`;
  const cached = getCached<Quote>(cacheKey);
  if (cached) return cached;

  const key = finnhubKey();
  const attempts: Array<() => Promise<Quote>> = [];
  if (key) attempts.push(() => finnhubQuote(upper, key));
  attempts.push(() => yahooQuote(upper));

  for (const attempt of attempts) {
    try {
      const quote = await attempt();
      setCached(cacheKey, quote, QUOTE_TTL_MS);
      return quote;
    } catch {
      // Przechodzimy do następnego źródła danych.
    }
  }
  return getMockQuote(upper);
}

export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const unique = Array.from(new Set(symbols.map((s) => s.toUpperCase()))).slice(0, 30);
  const entries = await Promise.all(unique.map(async (symbol) => [symbol, await getQuote(symbol)] as const));
  return Object.fromEntries(entries);
}

export async function getCandles(symbol: string, timeframe: Timeframe): Promise<CandlesResponse> {
  const upper = symbol.toUpperCase();
  if (forceMock()) return { symbol: upper, timeframe, candles: getMockCandles(upper, timeframe), source: 'mock' };

  const cacheKey = `candles:${upper}:${timeframe}`;
  const cached = getCached<CandlesResponse>(cacheKey);
  if (cached) return cached;

  try {
    const candles = await yahooCandles(upper, timeframe);
    const response: CandlesResponse = { symbol: upper, timeframe, candles, source: 'yahoo' };
    setCached(cacheKey, response, CANDLES_TTL_MS);
    return response;
  } catch {
    return { symbol: upper, timeframe, candles: getMockCandles(upper, timeframe), source: 'mock' };
  }
}

export async function searchSymbols(query: string): Promise<SearchResponse> {
  const q = query.trim();
  const local = searchCatalog(q, 8);
  const key = finnhubKey();
  if (!q || !key || forceMock()) return { results: local, source: 'local' };

  const cacheKey = `search:${q.toLowerCase()}`;
  const cached = getCached<SearchResponse>(cacheKey);
  if (cached) return cached;

  try {
    const remote = await finnhubSearch(q, key);
    const seen = new Set(local.map((item) => item.symbol));
    const merged = [...local, ...remote.filter((item) => !seen.has(item.symbol))].slice(0, 10);
    const response: SearchResponse = { results: merged, source: 'finnhub' };
    setCached(cacheKey, response, SEARCH_TTL_MS);
    return response;
  } catch {
    return { results: local, source: 'local' };
  }
}
