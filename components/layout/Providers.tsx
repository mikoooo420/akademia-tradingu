'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { BADGES, computeEarnedBadges } from '@/lib/course/progress';
import { useCourseStore } from '@/store/courseStore';
import { useHydrated, useHydrationStore } from '@/store/hydrationStore';
import { useTrackedSymbols } from '@/store/hooks';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useSettingsStore } from '@/store/settingsStore';
import { setFinnhubKey } from '@/lib/api/market';
import { toast } from '@/store/toastStore';
import { Toaster } from '@/components/ui/Toaster';

const POLL_INTERVAL_MS = 15_000;

/** Wczytuje zapisany stan z localStorage dopiero po zamontowaniu – bez błędów hydracji SSR. */
function StoreHydrator() {
  const setHydrated = useHydrationStore((s) => s.setHydrated);
  useEffect(() => {
    Promise.all([
      usePortfolioStore.persist.rehydrate(),
      useCourseStore.persist.rehydrate(),
      useSettingsStore.persist.rehydrate(),
    ]).finally(setHydrated);
  }, [setHydrated]);
  return null;
}

/** Cyklicznie odświeża notowania wszystkich obserwowanych i posiadanych instrumentów. */
function MarketPoller() {
  const hydrated = useHydrated();
  const symbols = useTrackedSymbols();
  const refreshQuotes = useMarketStore((s) => s.refreshQuotes);
  const resetQuotes = useMarketStore((s) => s.resetQuotes);
  const finnhubKey = useSettingsStore((s) => s.finnhubKey);
  const previousKey = useRef<string | null>(null);
  const symbolsKey = symbols.join(',');

  useEffect(() => {
    if (!hydrated) return;
    // Zmiana klucza API = zmiana źródła danych: czyścimy stare notowania, by ich nie mieszać
    setFinnhubKey(finnhubKey);
    if (previousKey.current !== null && previousKey.current !== finnhubKey) resetQuotes();
    previousKey.current = finnhubKey;

    const list = symbolsKey.split(',').filter(Boolean);
    const refresh = () => {
      if (document.visibilityState === 'visible') void refreshQuotes(list);
    };
    refresh();
    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [hydrated, symbolsKey, refreshQuotes, resetQuotes, finnhubKey]);

  return null;
}

/** Wyświetla powiadomienie, gdy użytkownik zdobędzie nową odznakę. */
function BadgeWatcher() {
  const hydrated = useHydrated();
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const quizResults = useCourseStore((s) => s.quizResults);
  const tradesCount = usePortfolioStore((s) => s.trades.length);
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const earned = computeEarnedBadges({ completedLessons, quizResults, tradesCount });
    if (known.current === null) {
      known.current = earned;
      return;
    }
    for (const id of earned) {
      if (!known.current.has(id)) {
        const badge = BADGES.find((b) => b.id === id);
        if (badge) toast.reward(`Nowa odznaka: ${badge.name}`, badge.description);
      }
    }
    known.current = earned;
  }, [hydrated, completedLessons, quizResults, tradesCount]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreHydrator />
      <MarketPoller />
      <BadgeWatcher />
      {children}
      <Toaster />
    </>
  );
}
