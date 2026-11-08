import { cn, clamp } from '@/lib/utils';

interface ProgressBarProps {
  /** Wartość z przedziału 0–1 */
  value: number;
  className?: string;
  tone?: 'brand' | 'up' | 'gold';
  size?: 'sm' | 'md';
  label?: string;
}

const tones = {
  brand: 'from-brand to-brand-glow',
  up: 'from-emerald-600 to-up',
  gold: 'from-amber-500 to-gold',
};

export function ProgressBar({ value, className, tone = 'brand', size = 'md', label }: ProgressBarProps) {
  const percent = Math.round(clamp(value, 0, 1) * 100);
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-bg-elevated', size === 'sm' ? 'h-1.5' : 'h-2.5', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label ?? 'Postęp'}
    >
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
