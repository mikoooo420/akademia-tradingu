/**
 * Deterministyczny generator danych symulowanych.
 *
 * Cena każdego instrumentu jest funkcją czasu: suma kilku fal o różnych okresach
 * (trend roczny, cykle tygodniowe i dzienne) oraz wygładzonego szumu. Dzięki temu
 * notowania i świece są ze sobą spójne, zmieniają się w czasie "na żywo"
 * i wyglądają tak samo na serwerze oraz w przeglądarce.
 */
import { getCatalogEntry } from './catalog';
import type { Candle, Quote, Timeframe } from './types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Deterministyczna liczba z przedziału [0, 1) dla pary (ziarno, indeks). */
function hashUnit(seed: number, index: number): number {
  let x = (seed ^ Math.imul(index | 0, 0x9e3779b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}

/** Wygładzony szum wartości (value noise) – ciągły w czasie. */
function smoothNoise(seed: number, t: number, step: number): number {
  const position = t / step;
  const k = Math.floor(position);
  const frac = position - k;
  const a = hashUnit(seed, k) * 2 - 1;
  const b = hashUnit(seed, k + 1) * 2 - 1;
  const s = frac * frac * (3 - 2 * frac);
  return a + (b - a) * s;
}

interface MockProfile {
  seed: number;
  basePrice: number;
  volatility: number;
  phases: number[];
}

const profileCache = new Map<string, MockProfile>();

function getProfile(symbol: string): MockProfile {
  const key = symbol.toUpperCase();
  const cached = profileCache.get(key);
  if (cached) return cached;
  const seed = fnv1a(key);
  const entry = getCatalogEntry(key);
  const profile: MockProfile = {
    seed,
    basePrice: entry?.basePrice ?? 20 + (seed % 380),
    volatility: entry?.volatility ?? 0.35,
    phases: [0, 1, 2, 3].map((i) => hashUnit(seed, 1000 + i) * Math.PI * 2),
  };
  profileCache.set(key, profile);
  return profile;
}

/** Cena symulowana instrumentu w danym momencie (ms). */
export function mockPriceAt(symbol: string, timeMs: number): number {
  const { seed, basePrice, volatility: v, phases } = getProfile(symbol);
  const t = timeMs;
  const logReturn =
    v * 0.32 * Math.sin((2 * Math.PI * t) / (365 * DAY) + phases[0]) +
    v * 0.11 * Math.sin((2 * Math.PI * t) / (37 * DAY) + phases[1]) +
    v * 0.045 * Math.sin((2 * Math.PI * t) / (5.3 * DAY) + phases[2]) +
    v * 0.02 * Math.sin((2 * Math.PI * t) / (1.1 * DAY) + phases[3]) +
    v * 0.035 * smoothNoise(seed, t, 2 * DAY) +
    v * 0.012 * smoothNoise(seed + 7, t, 3 * HOUR) +
    v * 0.004 * smoothNoise(seed + 13, t, 15 * MINUTE) +
    v * 0.0015 * smoothNoise(seed + 29, t, MINUTE);
  return round2(basePrice * Math.exp(logReturn));
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getMockQuote(symbol: string, now: number = Date.now()): Quote {
  const upper = symbol.toUpperCase();
  const dayStart = Math.floor(now / DAY) * DAY;
  const price = mockPriceAt(upper, now);
  const open = mockPriceAt(upper, dayStart);
  const previousClose = mockPriceAt(upper, dayStart - 3 * HOUR);

  let high = Math.max(price, open);
  let low = Math.min(price, open);
  for (let t = dayStart; t < now; t += 10 * MINUTE) {
    const p = mockPriceAt(upper, t);
    if (p > high) high = p;
    if (p < low) low = p;
  }

  const change = round2(price - previousClose);
  return {
    symbol: upper,
    price,
    change,
    changePercent: previousClose ? round2((change / previousClose) * 100) : 0,
    high: round2(high),
    low: round2(low),
    open,
    previousClose,
    timestamp: now,
    source: 'mock',
  };
}

export interface TimeframeConfig {
  intervalMs: number;
  bars: number;
  yahooRange: string;
  yahooInterval: string;
}

export const TIMEFRAME_CONFIG: Record<Timeframe, TimeframeConfig> = {
  '1D': { intervalMs: 5 * MINUTE, bars: 288, yahooRange: '1d', yahooInterval: '5m' },
  '1W': { intervalMs: 30 * MINUTE, bars: 336, yahooRange: '5d', yahooInterval: '30m' },
  '1M': { intervalMs: HOUR, bars: 720, yahooRange: '1mo', yahooInterval: '1h' },
  '1Y': { intervalMs: DAY, bars: 365, yahooRange: '1y', yahooInterval: '1d' },
};

export function getMockCandles(symbol: string, timeframe: Timeframe, now: number = Date.now()): Candle[] {
  const upper = symbol.toUpperCase();
  const { seed, volatility } = getProfile(upper);
  const { intervalMs, bars } = TIMEFRAME_CONFIG[timeframe];
  const lastStart = Math.floor(now / intervalMs) * intervalMs;
  const firstStart = lastStart - (bars - 1) * intervalMs;
  const samples = 6;
  const candles: Candle[] = [];

  for (let start = firstStart; start <= lastStart; start += intervalMs) {
    const end = Math.min(start + intervalMs, now);
    const open = mockPriceAt(upper, start);
    const close = mockPriceAt(upper, end);
    let high = Math.max(open, close);
    let low = Math.min(open, close);
    for (let i = 1; i < samples; i++) {
      const p = mockPriceAt(upper, start + ((end - start) * i) / samples);
      high = Math.max(high, p);
      low = Math.min(low, p);
    }
    const index = Math.floor(start / intervalMs);
    const wickScale = volatility * 0.004 * Math.sqrt(intervalMs / HOUR);
    high *= 1 + hashUnit(seed + 101, index) * wickScale;
    low *= 1 - hashUnit(seed + 202, index) * wickScale;
    const move = Math.abs(close - open) / open;
    const baseVolume = 400_000 * Math.sqrt(intervalMs / MINUTE);
    const volume = Math.round(baseVolume * (0.6 + hashUnit(seed + 303, index) * 0.8) * (1 + move * 40));

    candles.push({
      time: Math.floor(start / 1000),
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      volume,
    });
  }
  return candles;
}
