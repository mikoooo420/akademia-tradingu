'use client';

import Link from 'next/link';
import { CircleCheck, Clock, Gift, Lock } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Pill } from '@/components/ui/Pill';
import { formatCurrency } from '@/lib/format';
import { lessonKey, moduleProgress } from '@/lib/course/progress';
import { LEVEL_LABELS, type CourseModule, type QuizResult } from '@/lib/course/types';
import { cn } from '@/lib/utils';
import { MODULE_ICONS } from './icons';

interface ModuleCardProps {
  mod: CourseModule;
  index: number;
  completedLessons: string[];
  quizResults: Record<string, QuizResult>;
  unlocked: boolean;
}

export function ModuleCard({ mod, index, completedLessons, quizResults, unlocked }: ModuleCardProps) {
  const Icon = MODULE_ICONS[mod.icon];
  const progress = moduleProgress(mod, completedLessons, quizResults);
  const doneLessons = mod.lessons.filter((l) => completedLessons.includes(lessonKey(mod.id, l.id))).length;
  const result = quizResults[mod.id];
  const passed = Boolean(result?.passed);
  const minutes = mod.lessons.reduce((sum, l) => sum + l.minutes, 0);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            passed ? 'bg-up-soft text-up' : unlocked ? 'bg-brand/10 text-brand-glow' : 'bg-bg-elevated text-ink-faint',
          )}
        >
          {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </span>
        {passed ? (
          <Pill tone="up">
            <CircleCheck className="h-3 w-3" /> Zaliczony
          </Pill>
        ) : (
          <Pill tone="gold">
            <Gift className="h-3 w-3" /> +{formatCurrency(mod.reward)}
          </Pill>
        )}
      </div>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        Moduł {index} · {LEVEL_LABELS[mod.level]}
      </p>
      <h3 className="mt-1 text-base font-semibold text-ink">{mod.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{mod.description}</p>
      <div className="mt-4 flex items-center gap-4 text-xs text-ink-faint">
        <span>
          {doneLessons}/{mod.lessons.length} lekcji
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> ok. {minutes} min
        </span>
        {result && (
          <span>
            Quiz: {result.bestScore}/{result.total}
          </span>
        )}
      </div>
      <ProgressBar value={progress} size="sm" tone={passed ? 'up' : 'brand'} className="mt-3" />
    </>
  );

  if (!unlocked) {
    return (
      <div className="relative flex flex-col rounded-xl border border-line bg-bg-card/60 p-5 opacity-70" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/kurs/${mod.id}`}
      className="group flex flex-col rounded-xl border border-line bg-bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-glow"
    >
      {content}
    </Link>
  );
}
