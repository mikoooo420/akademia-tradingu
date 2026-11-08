'use client';

import type { ReactNode } from 'react';
import { BookOpen, CircleCheck, Gift, GraduationCap, Lock } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COURSE_COMPLETION_BONUS, COURSE_MODULES, getModulesByLevel } from '@/lib/course/content';
import {
  computeEarnedBadges,
  countCompletedLessons,
  courseProgress,
  isLevelCompleted,
  isModuleUnlocked,
  levelProgress,
  TOTAL_LESSONS,
} from '@/lib/course/progress';
import { LEVEL_DESCRIPTIONS, LEVEL_LABELS, LEVELS } from '@/lib/course/types';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCourseStore } from '@/store/courseStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { BadgeGrid } from './BadgeGrid';
import { ModuleCard } from './ModuleCard';

export function CourseOverview() {
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const quizResults = useCourseStore((s) => s.quizResults);
  const tradesCount = usePortfolioStore((s) => s.trades.length);
  const claimedRewards = useCourseStore((s) => s.claimedRewards);

  const progress = courseProgress(completedLessons, quizResults);
  const passedModules = COURSE_MODULES.filter((m) => quizResults[m.id]?.passed).length;
  const earnedRewards =
    COURSE_MODULES.filter((m) => claimedRewards.includes(`modul:${m.id}`)).reduce((sum, m) => sum + m.reward, 0) +
    (claimedRewards.includes('kurs:ukonczony') ? COURSE_COMPLETION_BONUS : 0);
  const totalRewards = COURSE_MODULES.reduce((sum, m) => sum + m.reward, 0) + COURSE_COMPLETION_BONUS;
  const badges = computeEarnedBadges({ completedLessons, quizResults, tradesCount });

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-brand/15 via-bg-card to-bg-card p-5 shadow-card sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-glow">
              <GraduationCap className="h-4 w-4" /> Mini-kurs inwestowania
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">Od pierwszej akcji do własnej strategii</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Sześć modułów na trzech poziomach zaawansowania. Każdy moduł kończy się quizem – zalicz go (min. 80% poprawnych odpowiedzi), aby
              otrzymać wirtualną gotówkę do symulatora. Za ukończenie całego kursu czeka bonus {formatCurrency(COURSE_COMPLETION_BONUS)}.
            </p>
          </div>
          <div className="grid w-full grid-cols-3 gap-3 lg:w-auto lg:min-w-[380px]">
            <Metric icon={<BookOpen className="h-4 w-4" />} label="Lekcje" value={`${countCompletedLessons(completedLessons)}/${TOTAL_LESSONS}`} />
            <Metric icon={<CircleCheck className="h-4 w-4" />} label="Moduły" value={`${passedModules}/${COURSE_MODULES.length}`} />
            <Metric icon={<Gift className="h-4 w-4" />} label="Nagrody" value={`${Math.round((earnedRewards / totalRewards) * 100)}%`} tone="gold" />
          </div>
        </div>
        <div className="relative mt-6">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-ink-muted">Postęp całego kursu</span>
            <span className="num text-ink">{Math.round(progress * 100)}%</span>
          </div>
          <ProgressBar value={progress} />
          <p className="mt-2 text-[11px] text-ink-faint">
            Zdobyte nagrody: <span className="num text-gold">{formatCurrency(earnedRewards)}</span> z {formatCurrency(totalRewards)} możliwych
          </p>
        </div>
      </section>

      {LEVELS.map((level, levelIndex) => {
        const modules = getModulesByLevel(level);
        const lp = levelProgress(level, completedLessons, quizResults);
        const completed = isLevelCompleted(level, quizResults);
        const locked = modules.length > 0 && !isModuleUnlocked(modules[0], quizResults);
        const previousLevel = levelIndex > 0 ? LEVELS[levelIndex - 1] : null;

        return (
          <section key={level} aria-labelledby={`level-${level}`}>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      completed ? 'bg-up text-white' : locked ? 'bg-bg-elevated text-ink-faint' : 'bg-brand text-white',
                    )}
                  >
                    {completed ? <CircleCheck className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3 w-3" /> : levelIndex + 1}
                  </span>
                  <h2 id={`level-${level}`} className="text-lg font-semibold text-ink">
                    Poziom: {LEVEL_LABELS[level]}
                  </h2>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{LEVEL_DESCRIPTIONS[level]}</p>
                {locked && previousLevel && (
                  <p className="mt-1 text-xs text-gold">Ukończ poziom „{LEVEL_LABELS[previousLevel]}”, aby odblokować te moduły.</p>
                )}
              </div>
              <div className="flex w-full items-center gap-2 sm:w-48">
                <ProgressBar value={lp} size="sm" tone={completed ? 'up' : 'brand'} />
                <span className="num w-10 text-right text-xs text-ink-muted">{Math.round(lp * 100)}%</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  index={COURSE_MODULES.indexOf(mod) + 1}
                  completedLessons={completedLessons}
                  quizResults={quizResults}
                  unlocked={isModuleUnlocked(mod, quizResults)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <BadgeGrid earned={badges} />

      <p className="text-center text-[11px] leading-relaxed text-ink-faint">
        Materiały mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnej w rozumieniu przepisów prawa. Inwestowanie na
        prawdziwym rynku wiąże się z ryzykiem utraty kapitału.
      </p>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: ReactNode; label: string; value: string; tone?: 'gold' }) {
  return (
    <div className="rounded-xl border border-line bg-bg-soft/80 p-3 text-center backdrop-blur">
      <div className={cn('mx-auto mb-1 flex justify-center', tone === 'gold' ? 'text-gold' : 'text-ink-faint')}>{icon}</div>
      <p className="num text-lg font-semibold text-ink">{value}</p>
      <p className="text-[11px] text-ink-faint">{label}</p>
    </div>
  );
}
