import type { Metadata } from 'next';
import { HistoryView } from '@/components/trading/HistoryView';

export const metadata: Metadata = { title: 'Historia transakcji' };

export default function HistoryPage() {
  return <HistoryView />;
}
