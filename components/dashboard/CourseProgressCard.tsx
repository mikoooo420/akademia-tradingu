'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap, Trophy } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COURSE_MODULES } from '@/lib/course/content';
import {
  BADGES,
  computeEarnedBadges,
  countCompletedLessons,
  courseProgress,
  isModulePassed,
  isModuleUnlocked,
  lessonKey,
  TOTAL_LESSONS,
} from '@/lib/course/progress';
import { LEVEL_LABELS } from '@/lib/course/types';
import { formatNumber } from '@/lib/format';
import { useCourseStore } from '@/store/courseStore';
import { usePortfolioStore } from '@/store/portfolioStore';

export function CourseProgressCard() {
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const quizResults = useCourseStore((s) => s.quizResults);
  const tradesCount = usePortfolioStore((s) => s.trades.length);

  const progress = courseProgress(completedLessons, quizResults);
  const badges = computeEarnedBadges({ completedLessons, quizResults, tradesCount });
  const nextModule = COURSE_MODULES.find((m) => !isModulePassed(m.id, quizResults) && isModuleUnlocked(m, quizResults));
  const nextLesson = nextModule?.lessons.find((l) => !completedLessons.includes(lessonKey(nextModule.id, l.id)));

  return (
    <Card title="Mini-kurs inwestowania" icon={<GraduationCap className="h-4 w-4" />}>
      <div className="flex items-end justify-between">
        <div>
          <p className="num text-3xl font-semibold text-ink">{Math.round(progress * 100)}%</p>
          <p className="text-xs text-ink-faint">
            {countCompletedLessons(completedLessons)} z {TOTAL_LESSONS} lekcji ukończonych
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1 text-xs text-gold">
          <Trophy className="h-3.5 w-3.5" />
          {badges.size}/{BADGES.length} odznak
        </div>
      </div>
      <ProgressBar value={progress} className="mt-3" />

      {nextModule ? (
        <div className="mt-4 rounded-xl border border-line bg-bg-soft p-3">
          <p className="text-[11px] uppercase tracking-wide text-ink-faint">Następny krok · {LEVEL_LABELS[nextModule.level]}</p>
          <p className="mt-1 text-sm font-medium text-ink">{nextModule.title}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{nextLesson ? `Lekcja: ${nextLesson.title}` : 'Wszystkie lekcje przeczytane – czas na quiz!'}</p>
          <Link href={`/kurs/${nextModule.id}`} className={buttonClasses('primary', 'sm', 'mt-3 w-full')}>
            {nextLesson ? 'Kontynuuj naukę' : 'Rozwiąż quiz'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="mt-2 text-center text-[11px] text-gold">Nagroda za moduł: +{formatNumber(nextModule.reward, 0)} USD wirtualnej gotówki</p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-center text-sm text-gold">
          Gratulacje! Ukończyłeś cały kurs. Wykorzystaj zdobytą wiedzę w symulatorze.
        </div>
      )}
    </Card>
  );
}
