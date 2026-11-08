'use client';

import { create } from 'zustand';
import { fetchQuotes } from '@/lib/api/client';
import type { DataSource, Quote } from '@/lib/api/types';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export interface MarketState {
  quotes: Record<string, Quote>;
  /** Poprzednia cena – do animacji zmian (zielony/czerwony błysk) */
  previousPrices: Record<string, number>;
  source: DataSource | null;
  status: Status;
  lastUpdated: number | null;
  selectedSymbol: string;
  /** Dodatkowe symbole, które mają być odświeżane (np. ostatnio przeglądany instrument) */
  trackedSymbols: string[];

  refreshQuotes: (symbols: string[]) => Promise<void>;
  upsertQuotes: (quotes: Record<string, Quote>) => void;
  setSelectedSymbol: (symbol: string) => void;
  trackSymbol: (symbol: string) => void;
}

function resolveSource(quotes: Quote[]): DataSource {
  if (quotes.some((q) => q.source === 'finnhub')) return 'finnhub';
  if (quotes.some((q) => q.source === 'yahoo')) return 'yahoo';
  return 'mock';
}

let inFlight: Promise<void> | null = null;

export const useMarketStore = create<MarketState>()((set, get) => ({
  quotes: {},
  previousPrices: {},
  source: null,
  status: 'idle',
  lastUpdated: null,
  selectedSymbol: 'AAPL',
  trackedSymbols: [],

  refreshQuotes: async (symbols) => {
    const unique = Array.from(new Set(symbols.map((s) => s.toUpperCase()))).filter(Boolean);
    if (unique.length === 0) return;
    if (inFlight) return inFlight;

    if (get().status === 'idle') set({ status: 'loading' });
    inFlight = (async () => {
      try {
        const fresh = await fetchQuotes(unique);
        const current = get().quotes;
        const previousPrices: Record<string, number> = { ...get().previousPrices };
        for (const symbol of Object.keys(fresh)) {
          if (current[symbol]) previousPrices[symbol] = current[symbol].price;
        }
        set({
          quotes: { ...current, ...fresh },
          previousPrices,
          source: resolveSource(Object.values(fresh)),
          status: 'ready',
          lastUpdated: Date.now(),
        });
      } catch {
        set({ status: 'error' });
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },

  upsertQuotes: (fresh) => {
    const current = get().quotes;
    const previousPrices: Record<string, number> = { ...get().previousPrices };
    for (const symbol of Object.keys(fresh)) {
      if (current[symbol]) previousPrices[symbol] = current[symbol].price;
    }
    set({ quotes: { ...current, ...fresh }, previousPrices, lastUpdated: Date.now() });
  },

  setSelectedSymbol: (symbol) => {
    const upper = symbol.toUpperCase();
    set({ selectedSymbol: upper });
    get().trackSymbol(upper);
  },

  trackSymbol: (symbol) => {
    const upper = symbol.toUpperCase();
    const tracked = get().trackedSymbols;
    if (tracked.includes(upper)) return;
    set({ trackedSymbols: [upper, ...tracked].slice(0, 10) });
  },
}));
