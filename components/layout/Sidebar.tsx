'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { RotateCcw, TrendingUp } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { courseProgress } from '@/lib/course/progress';
import { formatCurrency } from '@/lib/format';
import { INITIAL_BALANCE } from '@/lib/trading/engine';
import { cn } from '@/lib/utils';
import { useCourseStore } from '@/store/courseStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { toast } from '@/store/toastStore';
import { isActive, NAV_ITEMS } from './navigation';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Akademia Tradingu – strona główna">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-indigo-600 shadow-glow">
        <TrendingUp className="h-5 w-5 text-white" />
      </span>
      <span className="leading-tight">
        <span className="block whitespace-nowrap text-sm font-bold tracking-tight text-ink">Akademia Tradingu</span>
        <span className="hidden text-[11px] text-ink-faint sm:block">Symulator i kurs</span>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const quizResults = useCourseStore((s) => s.quizResults);
  const resetPortfolio = usePortfolioStore((s) => s.resetPortfolio);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const progress = courseProgress(completedLessons, quizResults);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-bg-soft/80 backdrop-blur lg:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Nawigacja główna">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-brand/10 text-ink' : 'text-ink-muted hover:bg-bg-hover hover:text-ink',
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand" />}
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-glow' : 'text-ink-faint group-hover:text-ink-muted')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-4">
        <Link href="/kurs" className="block rounded-xl border border-line bg-bg-card p-4 transition-colors hover:border-line-strong">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">Postęp w kursie</span>
            <span className="font-mono text-brand-glow">{Math.round(progress * 100)}%</span>
          </div>
          <ProgressBar value={progress} size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-faint transition-colors hover:bg-bg-hover hover:text-ink-muted"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Resetuj portfel
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Zresetować portfel?"
        description={
          <>
            Wszystkie pozycje i historia transakcji zostaną usunięte, a saldo wróci do{' '}
            <strong className="text-ink">{formatCurrency(INITIAL_BALANCE)}</strong>. Lista obserwowanych i postęp w kursie pozostaną bez zmian.
            Tej operacji nie można cofnąć.
          </>
        }
        confirmLabel="Tak, resetuj portfel"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetPortfolio();
          setConfirmOpen(false);
          toast.info('Portfel został zresetowany', `Masz do dyspozycji ${formatCurrency(INITIAL_BALANCE)} wirtualnej gotówki.`);
        }}
      />
    </aside>
  );
}
