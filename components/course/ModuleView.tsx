'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, CircleCheck, Clock, Lock, Puzzle } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COURSE_MODULES, getModule } from '@/lib/course/content';
import { isModuleUnlocked, lessonKey, moduleProgress } from '@/lib/course/progress';
import { LEVEL_LABELS, LEVELS } from '@/lib/course/types';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCourseStore } from '@/store/courseStore';
import { MODULE_ICONS } from './icons';
import { LessonContent } from './LessonContent';
import { Quiz } from './Quiz';

export function ModuleView({ moduleId }: { moduleId: string }) {
  const mod = getModule(moduleId);
  const completedLessons = useCourseStore((s) => s.completedLessons);
  const quizResults = useCourseStore((s) => s.quizResults);
  const completeLesson = useCourseStore((s) => s.completeLesson);
  const topRef = useRef<HTMLDivElement>(null);

  const lessons = useMemo(() => mod?.lessons ?? [], [mod]);
  const quizStep = lessons.length;

  const initialStep = useMemo(() => {
    if (!mod) return 0;
    const firstUnread = lessons.findIndex((l) => !completedLessons.includes(lessonKey(mod.id, l.id)));
    return firstUnread === -1 ? quizStep : firstUnread;
    // Krok początkowy wyznaczamy tylko przy wejściu do modułu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod]);

  const [step, setStep] = useState(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  if (!mod) return null;

  const Icon = MODULE_ICONS[mod.icon];
  const unlocked = isModuleUnlocked(mod, quizResults);
  const moduleIndex = COURSE_MODULES.indexOf(mod);
  const nextModule = COURSE_MODULES[moduleIndex + 1];
  const progress = moduleProgress(mod, completedLessons, quizResults);
  const isRead = (lessonId: string) => completedLessons.includes(lessonKey(mod.id, lessonId));
  const allRead = lessons.every((l) => isRead(l.id));
  const passed = Boolean(quizResults[mod.id]?.passed);

  if (!unlocked) {
    const previousLevel = LEVELS[LEVELS.indexOf(mod.level) - 1];
    return (
      <Card className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated text-ink-faint">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-ink">Moduł jest jeszcze zablokowany</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Aby rozpocząć moduł „{mod.title}”, ukończ najpierw wszystkie moduły poziomu „{previousLevel ? LEVEL_LABELS[previousLevel] : ''}”.
        </p>
        <Link href="/kurs" className={buttonClasses('primary', 'md', 'mt-5')}>
          Wróć do kursu
        </Link>
      </Card>
    );
  }

  const lesson = step < quizStep ? lessons[step] : null;

  const markAndContinue = () => {
    if (!lesson) return;
    completeLesson(mod.id, lesson.id);
    setStep(step + 1);
  };

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-4">
      <Link href="/kurs" className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Wszystkie moduły
      </Link>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Spis treści modułu */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-glow">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-ink-faint">
                  Moduł {moduleIndex + 1} · {LEVEL_LABELS[mod.level]}
                </p>
                <h2 className="text-sm font-semibold leading-snug text-ink">{mod.title}</h2>
              </div>
            </div>
            <ProgressBar value={progress} size="sm" className="mt-4" tone={passed ? 'up' : 'brand'} />
            <p className="mt-1.5 text-[11px] text-ink-faint">Ukończono {Math.round(progress * 100)}% modułu</p>

            <ol className="mt-4 space-y-1">
              {lessons.map((l, i) => {
                const read = isRead(l.id);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={step === i ? 'step' : undefined}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                        step === i ? 'bg-brand/10 text-ink' : 'text-ink-muted hover:bg-bg-hover hover:text-ink',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                          read ? 'bg-up text-white' : step === i ? 'bg-brand text-white' : 'bg-bg-elevated text-ink-faint',
                        )}
                      >
                        {read ? <Check className="h-3 w-3" /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => allRead && setStep(quizStep)}
                  disabled={!allRead}
                  title={allRead ? undefined : 'Przeczytaj wszystkie lekcje, aby odblokować quiz'}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    step === quizStep ? 'bg-gold/10 text-ink' : 'text-ink-muted hover:bg-bg-hover hover:text-ink',
                    !allRead && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                      passed ? 'bg-up text-white' : 'bg-gold/20 text-gold',
                    )}
                  >
                    {passed ? <Check className="h-3 w-3" /> : allRead ? <Puzzle className="h-3 w-3" /> : <Lock className="h-2.5 w-2.5" />}
                  </span>
                  <span className="flex-1">Quiz sprawdzający</span>
                  {!passed && <span className="num text-[10px] text-gold">+{formatCurrency(mod.reward)}</span>}
                </button>
              </li>
            </ol>
          </Card>
        </aside>

        {/* Treść lekcji lub quiz */}
        <Card className="min-w-0" bodyClassName="p-5 sm:p-8">
          {lesson ? (
            <>
              <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink-faint">
                <Pill tone="brand">
                  <BookOpen className="h-3 w-3" /> Lekcja {step + 1} z {lessons.length}
                </Pill>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ok. {lesson.minutes} min czytania
                </span>
                {isRead(lesson.id) && (
                  <Pill tone="up">
                    <CircleCheck className="h-3 w-3" /> Ukończona
                  </Pill>
                )}
              </div>
              <h2 className="mb-5 text-2xl font-bold tracking-tight text-ink">{lesson.title}</h2>
              <LessonContent lesson={lesson} />

              <div className="mt-8 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                  <ArrowLeft className="h-4 w-4" /> Poprzednia lekcja
                </Button>
                <Button onClick={markAndContinue}>
                  {step + 1 < lessons.length ? (isRead(lesson.id) ? 'Następna lekcja' : 'Ukończ i przejdź dalej') : 'Ukończ i przejdź do quizu'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : allRead ? (
            <>
              <div className="mb-6">
                <Pill tone="gold">
                  <Puzzle className="h-3 w-3" /> Quiz · {mod.title}
                </Pill>
              </div>
              <Quiz key={mod.id} mod={mod} nextModuleId={nextModule?.id} />
            </>
          ) : (
            <div className="py-10 text-center">
              <Lock className="mx-auto h-8 w-8 text-ink-faint" />
              <p className="mt-3 text-sm text-ink-muted">Przeczytaj wszystkie lekcje, aby odblokować quiz.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
