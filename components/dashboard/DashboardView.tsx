'use client';

import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TradeHistoryTable } from '@/components/trading/TradeHistoryTable';
import { usePortfolioMetrics } from '@/store/hooks';
import { usePortfolioStore } from '@/store/portfolioStore';
import { AllocationChart } from './AllocationChart';
import { CourseProgressCard } from './CourseProgressCard';
import { PortfolioSummary } from './PortfolioSummary';
import { PositionsTable } from './PositionsTable';
import { Watchlist } from './Watchlist';

export function DashboardView() {
  const metrics = usePortfolioMetrics();
  const trades = usePortfolioStore((s) => s.trades);
  const recent = trades.slice(0, 5);

  return (
    <div className="space-y-4">
      <PortfolioSummary metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <PositionsTable metrics={metrics} />
          <Card
            title="Ostatnie transakcje"
            icon={<History className="h-4 w-4" />}
            noPadding
            action={
              <Link href="/historia" className="inline-flex items-center gap-1 text-xs text-brand-glow hover:underline">
                Zobacz wszystkie <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <TradeHistoryTable trades={recent} compact />
          </Card>
        </div>
        <div className="space-y-4">
          <AllocationChart metrics={metrics} />
          <Watchlist />
          <CourseProgressCard />
        </div>
      </div>
    </div>
  );
}
