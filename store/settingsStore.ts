'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  /** Klucz API Finnhub podany przez użytkownika – przechowywany wyłącznie w jego przeglądarce */
  finnhubKey: string;
  /** Czy okno ustawień źródła danych jest otwarte (nie jest zapisywane) */
  dataDialogOpen: boolean;

  setFinnhubKey: (key: string) => void;
  openDataDialog: () => void;
  closeDataDialog: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      finnhubKey: '',
      dataDialogOpen: false,
      setFinnhubKey: (key) => set({ finnhubKey: key.trim() }),
      openDataDialog: () => set({ dataDialogOpen: true }),
      closeDataDialog: () => set({ dataDialogOpen: false }),
    }),
    {
      name: 'akademia-tradingu:ustawienia',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ finnhubKey: state.finnhubKey }),
    },
  ),
);
