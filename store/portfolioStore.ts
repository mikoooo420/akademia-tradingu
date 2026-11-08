'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_WATCHLIST } from '@/lib/api/catalog';
import { createId, executeMarketOrder, INITIAL_BALANCE, roundMoney, type ExecutionResult } from '@/lib/trading/engine';
import type { CashEvent, OrderRequest, Position, Trade } from '@/lib/trading/types';

export interface PortfolioState {
  cash: number;
  /** Suma wpłat: kapitał początkowy + nagrody z kursu. Służy do liczenia całkowitej stopy zwrotu. */
  totalDeposits: number;
  positions: Record<string, Position>;
  trades: Trade[];
  cashEvents: CashEvent[];
  watchlist: string[];
  createdAt: number;

  placeOrder: (order: OrderRequest, price: number | undefined) => ExecutionResult;
  creditReward: (amount: number, description: string) => void;
  addToWatchlist: (symbol: string) => boolean;
  removeFromWatchlist: (symbol: string) => void;
  resetPortfolio: () => void;
}

const MAX_TRADES = 2000;

function initialState() {
  return {
    cash: INITIAL_BALANCE,
    totalDeposits: INITIAL_BALANCE,
    positions: {} as Record<string, Position>,
    trades: [] as Trade[],
    cashEvents: [] as CashEvent[],
    watchlist: [...DEFAULT_WATCHLIST],
    createdAt: Date.now(),
  };
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      placeOrder: (order, price) => {
        const { cash, positions, trades } = get();
        const result = executeMarketOrder({ cash, positions }, order, price);
        if (result.ok) {
          set({
            cash: result.cash,
            positions: result.positions,
            trades: [result.trade, ...trades].slice(0, MAX_TRADES),
          });
        }
        return result;
      },

      creditReward: (amount, description) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const event: CashEvent = {
          id: createId('reward'),
          timestamp: Date.now(),
          amount,
          description,
          kind: 'REWARD',
        };
        set((state) => ({
          cash: roundMoney(state.cash + amount),
          totalDeposits: roundMoney(state.totalDeposits + amount),
          cashEvents: [event, ...state.cashEvents],
        }));
      },

      addToWatchlist: (symbol) => {
        const upper = symbol.toUpperCase();
        if (get().watchlist.includes(upper)) return false;
        set((state) => ({ watchlist: [...state.watchlist, upper] }));
        return true;
      },

      removeFromWatchlist: (symbol) => {
        const upper = symbol.toUpperCase();
        set((state) => ({ watchlist: state.watchlist.filter((s) => s !== upper) }));
      },

      resetPortfolio: () => {
        const fresh = initialState();
        set({
          ...fresh,
          watchlist: get().watchlist,
          cashEvents: [
            {
              id: createId('reset'),
              timestamp: fresh.createdAt,
              amount: INITIAL_BALANCE,
              description: 'Reset konta – nowy kapitał początkowy',
              kind: 'RESET',
            },
          ],
        });
      },
    }),
    {
      name: 'akademia-tradingu:portfel',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        cash: state.cash,
        totalDeposits: state.totalDeposits,
        positions: state.positions,
        trades: state.trades,
        cashEvents: state.cashEvents,
        watchlist: state.watchlist,
        createdAt: state.createdAt,
      }),
    },
  ),
);
