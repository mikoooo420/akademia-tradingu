import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'up' | 'down' | 'brand' | 'gold';

const tones: Record<Tone, string> = {
  neutral: 'bg-bg-elevated text-ink-muted border-line',
  up: 'bg-up-soft text-up border-up/25',
  down: 'bg-down-soft text-down border-down/25',
  brand: 'bg-brand/10 text-brand-glow border-brand/25',
  gold: 'bg-gold/10 text-gold border-gold/25',
};

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
