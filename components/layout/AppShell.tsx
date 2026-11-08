'use client';

import type { ReactNode } from 'react';
import { useHydrated } from '@/store/hydrationStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Wczytywanie danych">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 rounded-xl xl:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="mx-auto max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 lg:pb-10">{hydrated ? children : <PageSkeleton />}</main>
      </div>
      <MobileNav />
    </div>
  );
}
