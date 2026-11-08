'use client';

import { create } from 'zustand';

interface HydrationState {
  hydrated: boolean;
  setHydrated: () => void;
}

/** Informuje, czy dane z localStorage zostały już wczytane (zapobiega błędom hydracji SSR). */
export const useHydrationStore = create<HydrationState>()((set) => ({
  hydrated: false,
  setHydrated: () => set({ hydrated: true }),
}));

export const useHydrated = () => useHydrationStore((s) => s.hydrated);
