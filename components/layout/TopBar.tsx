'use client';

import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { PriceChange } from '@/components/ui/PriceChange';
import { formatCurrency } from '@/lib/format';
import { usePortfolioMetrics } from '@/store/hooks';
import { useHydrated } from '@/store/hydrationStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataSourceBadge } from './DataSourceBadge';
import { isActive, NAV_ITEMS } from './navigation';
import { Logo } from './Sidebar';

export function TopBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const metrics = usePortfolioMetrics();
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="hidden truncate text-base font-semibold text-ink lg:block">{current?.label ?? 'Akademia Tradingu'}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <DataSourceBadge />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-bg-card px-3 py-1.5">
            <Wallet className="hidden h-4 w-4 text-ink-faint sm:block" />
            <div className="text-right leading-tight">
              <p className="text-[10px] uppercase tracking-wide text-ink-faint">Wartość portfela</p>
              {hydrated ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink">{formatCurrency(metrics.totalEquity)}</span>
                  <PriceChange percent={metrics.totalReturnPercent} showIcon={false} className="hidden text-[11px] md:inline-flex" />
                </div>
              ) : (
                <Skeleton className="mt-0.5 h-4 w-28" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center border-t border-line/60 py-1.5 sm:hidden">
        <DataSourceBadge compact />
      </div>
    </header>
  );
}
