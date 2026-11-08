import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { formatCurrency, formatPercent, trendClass } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PriceChangeProps {
  change?: number;
  percent: number;
  className?: string;
  showIcon?: boolean;
  variant?: 'text' | 'chip';
}

export function PriceChange({ change, percent, className, showIcon = true, variant = 'text' }: PriceChangeProps) {
  const value = change ?? percent;
  const Icon = value > 0.004 ? ArrowUpRight : value < -0.004 ? ArrowDownRight : Minus;
  const chipTone = value > 0.004 ? 'bg-up-soft' : value < -0.004 ? 'bg-down-soft' : 'bg-bg-elevated';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono tabular-nums',
        trendClass(value),
        variant === 'chip' && cn('rounded-md px-1.5 py-0.5 text-xs', chipTone),
        className,
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {change !== undefined && <span>{formatCurrency(change, { signed: true })}</span>}
      <span>{change !== undefined ? `(${formatPercent(percent)})` : formatPercent(percent)}</span>
    </span>
  );
}
