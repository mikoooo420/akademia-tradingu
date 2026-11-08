'use client';

import { Award, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { BADGES } from '@/lib/course/progress';
import { cn } from '@/lib/utils';
import { BADGE_ICONS } from './icons';

export function BadgeGrid({ earned }: { earned: Set<string> }) {
  return (
    <Card title="Odznaki" subtitle={`Zdobyte: ${earned.size} z ${BADGES.length}`} icon={<Award className="h-4 w-4" />}>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {BADGES.map((badge) => {
          const has = earned.has(badge.id);
          const Icon = BADGE_ICONS[badge.icon];
          return (
            <li
              key={badge.id}
              title={badge.description}
              className={cn(
                'flex flex-col items-center rounded-xl border p-3 text-center transition-all',
                has ? 'border-gold/30 bg-gradient-to-b from-gold/10 to-transparent animate-pop' : 'border-line bg-bg-soft opacity-60',
              )}
            >
              <span
                className={cn(
                  'relative mb-2 flex h-11 w-11 items-center justify-center rounded-full',
                  has ? 'bg-gold/15 text-gold shadow-[0_0_24px_-6px_rgba(245,185,66,0.6)]' : 'bg-bg-elevated text-ink-faint',
                )}
              >
                <Icon className="h-5 w-5" />
                {!has && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bg-card">
                    <Lock className="h-2.5 w-2.5" />
                  </span>
                )}
              </span>
              <p className={cn('text-xs font-semibold', has ? 'text-ink' : 'text-ink-muted')}>{badge.name}</p>
              <p className="mt-0.5 text-[10px] leading-snug text-ink-faint">{badge.description}</p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
