'use client';

import type { ReactNode } from 'react';
import { Banknote, BriefcaseBusiness, CircleDollarSign, TrendingUp, Wallet } from 'lucide-react';
import { PriceChange } from '@/components/ui/PriceChange';
import { formatCurrency, formatPercent, trendClass } from '@/lib/format';
import type { PortfolioMetrics } from '@/lib/trading/types';
import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: string;
  icon: ReactNode;
  footer?: ReactNode;
  valueClassName?: string;
  highlight?: boolean;
}

function Stat({ label, value, icon, footer, valueClassName, highlight }: StatProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-line bg-bg-card p-4 shadow-card transition-colors hover:border-line-strong animate-fade-in',
        highlight && 'border-brand/30 bg-gradient-to-br from-brand/10 via-bg-card to-bg-card',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-faint">{label}</p>
        <span className="text-ink-faint transition-colors group-hover:text-ink-muted">{icon}</span>
      </div>
      <p className={cn('num mt-2 truncate text-xl font-semibold text-ink 2xl:text-2xl', valueClassName)}>{value}</p>
      {footer && <div className="mt-1.5 text-xs text-ink-faint">{footer}</div>}
    </div>
  );
}

export function PortfolioSummary({ metrics }: { metrics: PortfolioMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <div className="sm:col-span-2 xl:col-span-1">
        <Stat
          highlight
          label="Wartość portfela"
          value={formatCurrency(metrics.totalEquity)}
          icon={<Wallet className="h-4 w-4" />}
          footer={
            <span className="flex flex-wrap items-center gap-1.5">
              Całkowity wynik:
              <PriceChange change={metrics.totalReturn} percent={metrics.totalReturnPercent} showIcon={false} />
            </span>
          }
        />
      </div>
      <Stat
        label="Dostępna gotówka"
        value={formatCurrency(metrics.cash)}
        icon={<Banknote className="h-4 w-4" />}
        footer={`${formatPercent(metrics.totalEquity ? (metrics.cash / metrics.totalEquity) * 100 : 0, { signed: false })} portfela`}
      />
      <Stat
        label="Wartość pozycji"
        value={formatCurrency(metrics.marketValue)}
        icon={<BriefcaseBusiness className="h-4 w-4" />}
        footer={
          <span className="flex items-center gap-1.5">
            Dziś: <span className={cn('num', trendClass(metrics.dayChange))}>{formatCurrency(metrics.dayChange, { signed: true })}</span>
          </span>
        }
      />
      <Stat
        label="Niezrealizowany zysk/strata"
        value={formatCurrency(metrics.unrealizedPnl, { signed: true })}
        valueClassName={trendClass(metrics.unrealizedPnl)}
        icon={<TrendingUp className="h-4 w-4" />}
        footer={`${formatPercent(metrics.unrealizedPnlPercent)} względem kosztu nabycia`}
      />
      <Stat
        label="Zrealizowany zysk/strata"
        value={formatCurrency(metrics.realizedPnl, { signed: true })}
        valueClassName={trendClass(metrics.realizedPnl)}
        icon={<CircleDollarSign className="h-4 w-4" />}
        footer="Wynik z zamkniętych transakcji"
      />
    </div>
  );
}
