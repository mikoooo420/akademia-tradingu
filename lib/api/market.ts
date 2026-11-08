/**
 * Warstwa danych rynkowych działająca w całości w przeglądarce (statyczny hosting, np. GitHub Pages).
 *
 * Źródła danych:
 *  1. Finnhub (https://finnhub.io) – notowania w czasie rzeczywistym i wyszukiwanie spółek.
 *     Wymaga darmowego klucza API: użytkownik wpisuje go w ustawieniach aplikacji
 *     (zapisywany tylko w jego przeglądarce) lub właściciel strony ustawia
 *     NEXT_PUBLIC_FINNHUB_API_KEY podczas budowania.
 *  2. Dane symulowane – używane, gdy brak klucza, przekroczono limit zapytań lub API jest niedostępne.
 *
 * Wykresy świecowe: darmowy plan Finnhub nie udostępnia danych historycznych, dlatego
 * świece są generowane przez symulator i – gdy znamy prawdziwą cenę – skalowane tak,
 * aby ostatnia świeca kończyła się na bieżącym kursie.
 */
import { searchCatalog } from './catalog';
import { getMockCandles, getMockQuote, round2 } from './mock';
import type { Candle, CandlesResponse, Quote, SearchResponse, SymbolInfo, Timeframe } from './types';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';
const REQUEST_TIMEOUT_MS = 6000;
const QUOTE_TTL_MS = 12_000;
const SEARCH_TTL_MS = 10 * 60_000;
const RATE_LIMIT_COOLDOWN_MS = 60_000;

let userKey: string | undefined;
let cooldownUntil = 0;

const quoteCache = new Map<string, { quote: Quote; expires: number }>();
/** Ostatnie prawdziwe notowanie – używane, gdy chwilowo nie da się pobrać nowego. */
const lastRealQuote = new Map<string, Quote>();
const searchCache = new Map<string, { results: SymbolInfo[]; expires: number }>();

/** Ustawia klucz Finnhub podany przez użytkownika (pusty ciąg = brak klucza). */
export function setFinnhubKey(key: string | undefined): void {
  const trimmed = key?.trim() || undefined;
  if (trimmed === userKey) return;
  userKey = trimmed;
  cooldownUntil = 0;
  quoteCache.clear();
  lastRealQuote.clear();
  searchCache.clear();
}

export function getFinnhubKey(): string | undefined {
  return userKey || process.env.NEXT_PUBLIC_FINNHUB_API_KEY?.trim() || undefined;
}

export function hasBuildTimeKey(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_FINNHUB_API_KEY?.trim());
}

class RateLimitError extends Error {}

async function finnhubGet<T>(path: string, key: string): Promise<T> {
  if (Date.now() < cooldownUntil) throw new RateLimitError('Limit zapytań Finnhub');
  const separator = path.includes('?') ? '&' : '?';
  const response = await fetch(`${FINNHUB_BASE}${path}${separator}token=${encodeURIComponent(key)}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 429) {
    cooldownUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    throw new RateLimitError('Limit zapytań Finnhub');
  }
  if (response.status === 401 || response.status === 403) throw new Error('Nieprawidłowy klucz API Finnhub');
  if (!response.ok) throw new Error(`Finnhub: HTTP ${response.status}`);
  return (await response.json()) as T;
}

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

async function fetchFinnhubQuote(symbol: string, key: string): Promise<Quote> {
  const data = await finnhubGet<FinnhubQuote>(`/quote?symbol=${encodeURIComponent(symbol)}`, key);
  if (!data || typeof data.c !== 'number' || data.c <= 0) throw new Error(`Brak notowań dla ${symbol}`);
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

async function getQuote(symbol: string, key: string | undefined, now: number): Promise<Quote> {
  if (!key) return getMockQuote(symbol, now);

  const cached = quoteCache.get(symbol);
  if (cached && cached.expires > now) return cached.quote;

  try {
    const quote = await fetchFinnhubQuote(symbol, key);
    quoteCache.set(symbol, { quote, expires: now + QUOTE_TTL_MS });
    lastRealQuote.set(symbol, quote);
    return quote;
  } catch {
    // Wolimy ostatnią prawdziwą cenę niż nagłe przeskoczenie na dane symulowane.
    return lastRealQuote.get(symbol) ?? getMockQuote(symbol, now);
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const unique = Array.from(new Set(symbols.map((s) => s.toUpperCase()))).filter(Boolean).slice(0, 30);
  const key = getFinnhubKey();
  const now = Date.now();
  const entries = await Promise.all(unique.map(async (symbol) => [symbol, await getQuote(symbol, key, now)] as const));
  return Object.fromEntries(entries);
}

/** Skaluje świece symulowane tak, aby ostatnie zamknięcie było równe prawdziwej cenie. */
function anchorCandles(candles: Candle[], price: number): Candle[] {
  const last = candles[candles.length - 1]?.close;
  if (!last || !price) return candles;
  const ratio = price / last;
  return candles.map((c) => ({
    ...c,
    open: round2(c.open * ratio),
    high: round2(c.high * ratio),
    low: round2(c.low * ratio),
    close: round2(c.close * ratio),
  }));
}

export async function fetchCandles(symbol: string, timeframe: Timeframe): Promise<CandlesResponse> {
  const upper = symbol.toUpperCase();
  const candles = getMockCandles(upper, timeframe);
  const real = lastRealQuote.get(upper) ?? (getFinnhubKey() ? (await fetchQuotes([upper]))[upper] : undefined);
  if (real && real.source === 'finnhub') {
    return { symbol: upper, timeframe, candles: anchorCandles(candles, real.price), source: 'mock', anchored: true };
  }
  return { symbol: upper, timeframe, candles, source: 'mock' };
}

interface FinnhubSearch {
  result?: Array<{ symbol: string; description: string; type: string }>;
}

function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/\bInc\b/g, 'Inc.')
    .replace(/\bCorp\b/g, 'Corp.');
}

export async function searchSymbols(query: string): Promise<SearchResponse> {
  const q = query.trim();
  const local = searchCatalog(q, 8);
  const key = getFinnhubKey();
  if (!q || !key) return { results: local, source: 'local' };

  const cacheKey = q.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return { results: cached.results, source: 'finnhub' };

  try {
    const data = await finnhubGet<FinnhubSearch>(`/search?q=${encodeURIComponent(q)}&exchange=US`, key);
    const remote = (data.result ?? [])
      .filter((item) => ['Common Stock', 'ETP', 'ETF'].includes(item.type) && !item.symbol.includes(':'))
      .slice(0, 10)
      .map((item) => ({ symbol: item.symbol, name: toTitleCase(item.description) }));
    const seen = new Set(local.map((item) => item.symbol));
    const results = [...local, ...remote.filter((item) => !seen.has(item.symbol))].slice(0, 10);
    searchCache.set(cacheKey, { results, expires: Date.now() + SEARCH_TTL_MS });
    return { results, source: 'finnhub' };
  } catch {
    return { results: local, source: 'local' };
  }
}

/** Sprawdza, czy klucz Finnhub działa (pobiera notowanie AAPL). */
export async function testFinnhubKey(key: string): Promise<{ ok: true; price: number } | { ok: false; error: string }> {
  try {
    const quote = await fetchFinnhubQuote('AAPL', key.trim());
    return { ok: true, price: quote.price };
  } catch (error) {
    if (error instanceof RateLimitError) return { ok: false, error: 'Przekroczono limit zapytań. Spróbuj ponownie za minutę.' };
    const message = error instanceof Error ? error.message : '';
    if (message.includes('klucz')) return { ok: false, error: 'Klucz API jest nieprawidłowy.' };
    return { ok: false, error: 'Nie udało się połączyć z Finnhub. Sprawdź połączenie z internetem.' };
  }
}
