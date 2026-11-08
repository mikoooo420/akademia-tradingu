'use client';

import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartPie } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { PortfolioMetrics } from '@/lib/trading/types';
import { cn } from '@/lib/utils';

const PALETTE = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6'];
const CASH_COLOR = '#475569';
const OTHER_COLOR = '#64748b';
const MAX_SLICES = 7;

interface Slice {
  name: string;
  label: string;
  value: number;
  color: string;
}

export function AllocationChart({ metrics }: { metrics: PortfolioMetrics }) {
  const [active, setActive] = useState<number | null>(null);

  const slices = useMemo<Slice[]>(() => {
    const holdings = metrics.holdings.filter((h) => h.marketValue > 0);
    const top = holdings.slice(0, MAX_SLICES);
    const rest = holdings.slice(MAX_SLICES);
    const result: Slice[] = top.map((h, i) => ({ name: h.symbol, label: h.symbol, value: h.marketValue, color: PALETTE[i % PALETTE.length] }));
    if (rest.length) {
      result.push({ name: 'Pozostałe', label: `Pozostałe (${rest.length})`, value: rest.reduce((s, h) => s + h.marketValue, 0), color: OTHER_COLOR });
    }
    if (metrics.cash > 0) result.push({ name: 'Gotówka', label: 'Gotówka', value: metrics.cash, color: CASH_COLOR });
    return result;
  }, [metrics]);

  const total = metrics.totalEquity;
  const focused = active !== null ? slices[active] : null;
  const investedShare = total ? (metrics.marketValue / total) * 100 : 0;

  return (
    <Card title="Alokacja aktywów" subtitle="Struktura portfela według wartości rynkowej" icon={<ChartPie className="h-4 w-4" />}>
      <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
        <div className="relative h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={slices.length > 1 ? 2 : 0}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                onMouseEnter={(_, index) => setActive(index)}
                onMouseLeave={() => setActive(null)}
                isAnimationActive
              >
                {slices.map((slice, index) => (
                  <Cell key={slice.name} fill={slice.color} opacity={active === null || active === index ? 1 : 0.35} style={{ transition: 'opacity 150ms' }} />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                content={({ active: tooltipActive, payload }) => {
                  if (!tooltipActive || !payload?.length) return null;
                  const item = payload[0].payload as Slice;
                  return (
                    <div className="rounded-lg border border-line bg-bg-elevated px-3 py-2 text-xs shadow-xl">
                      <p className="font-semibold text-ink">{item.label}</p>
                      <p className="num text-ink-muted">{formatCurrency(item.value)}</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-ink-faint">{focused ? focused.label : 'Zainwestowano'}</span>
            <span className="num text-lg font-semibold text-ink">
              {focused ? formatPercent(total ? (focused.value / total) * 100 : 0, { signed: false }) : formatPercent(investedShare, { signed: false })}
            </span>
          </div>
        </div>

        <ul className="w-full space-y-1.5">
          {slices.map((slice, index) => (
            <li
              key={slice.name}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              className={cn('flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm transition-colors', active === index && 'bg-bg-hover')}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} />
                <span className={cn('truncate', slice.name === 'Gotówka' ? 'text-ink-muted' : 'font-mono font-medium text-ink')}>{slice.label}</span>
              </span>
              <span className="num shrink-0 text-xs text-ink-muted">{formatPercent(total ? (slice.value / total) * 100 : 0, { signed: false })}</span>
            </li>
          ))}
        </ul>
      </div>
      {metrics.holdings.length === 0 && (
        <p className="mt-4 rounded-lg bg-bg-soft px-3 py-2 text-center text-xs text-ink-faint">
          Cały kapitał jest w gotówce. Kup pierwsze akcje, aby zobaczyć podział portfela.
        </p>
      )}
    </Card>
  );
}
