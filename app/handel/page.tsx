import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TradingView } from '@/components/trading/TradingView';

export const metadata: Metadata = { title: 'Symulator tradingu' };

export default function TradingPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[600px] rounded-xl" />}>
      <TradingView />
    </Suspense>
  );
}
