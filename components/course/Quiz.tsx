'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, CircleCheck, CircleX, Gift, RotateCcw, Trophy } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QUIZ_PASS_THRESHOLD } from '@/lib/course/content';
import type { CourseModule, QuizQuestion } from '@/lib/course/types';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCourseStore, type QuizSubmission } from '@/store/courseStore';
import { toast } from '@/store/toastStore';

interface ShuffledQuestion extends QuizQuestion {
  /** Kolejność wyświetlania: indeksy oryginalnych odpowiedzi */
  order: number[];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function Quiz({ mod, nextModuleId }: { mod: CourseModule; nextModuleId?: string }) {
  const submitQuiz = useCourseStore((s) => s.submitQuiz);
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);

  // Nowa kolejność odpowiedzi przy każdym podejściu
  const questions = useMemo<ShuffledQuestion[]>(
    () => mod.quiz.map((q) => ({ ...q, order: shuffle(q.options.map((_, i) => i)) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mod, attempt],
  );

  const question = questions[index];
  const total = questions.length;
  const required = Math.ceil(total * QUIZ_PASS_THRESHOLD);

  const check = () => {
    if (selected === null) return;
    setChecked(true);
    setAnswers((prev) => [...prev, selected === question.correctIndex]);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
      return;
    }
    const score = answers.filter(Boolean).length;
    const result = submitQuiz(mod.id, score, total);
    setSubmission(result);
    if (result.passed) {
      toast.success('Quiz zaliczony!', `Wynik: ${score}/${total}. Moduł „${mod.title}” został ukończony.`);
    } else {
      toast.error('Quiz niezaliczony', `Wynik: ${score}/${total}. Potrzebujesz co najmniej ${required} poprawnych odpowiedzi.`);
    }
    if (result.moduleReward > 0) {
      toast.reward(`Nagroda: +${formatCurrency(result.moduleReward)}`, 'Wirtualna gotówka trafiła na Twój rachunek w symulatorze.');
    }
    if (result.courseBonus > 0) {
      toast.reward(`Bonus za ukończenie kursu: +${formatCurrency(result.courseBonus)}`, 'Gratulacje! Przeszedłeś cały mini-kurs inwestowania.');
    }
  };

  const restart = () => {
    setAttempt((a) => a + 1);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
    setSubmission(null);
  };

  if (submission) {
    const { score, passed, moduleReward, courseBonus } = submission;
    return (
      <div className="animate-fade-in text-center">
        <div
          className={cn(
            'mx-auto flex h-20 w-20 items-center justify-center rounded-full animate-pop',
            passed ? 'bg-up-soft text-up shadow-[0_0_40px_-8px_rgba(34,197,94,0.6)]' : 'bg-down-soft text-down',
          )}
        >
          {passed ? <Trophy className="h-9 w-9" /> : <RotateCcw className="h-9 w-9" />}
        </div>
        <h3 className="mt-5 text-2xl font-bold text-ink">{passed ? 'Świetna robota!' : 'Prawie się udało!'}</h3>
        <p className="mt-2 text-sm text-ink-muted">
          Twój wynik: <span className="num font-semibold text-ink">{score}/{total}</span> ({Math.round((score / total) * 100)}%).{' '}
          {passed ? 'Moduł został zaliczony.' : `Do zaliczenia potrzebujesz co najmniej ${required} poprawnych odpowiedzi.`}
        </p>

        {(moduleReward > 0 || courseBonus > 0) && (
          <div className="mx-auto mt-5 max-w-sm space-y-2">
            {moduleReward > 0 && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold animate-pop">
                <Gift className="h-4 w-4" /> Nagroda za moduł: <span className="num font-semibold">+{formatCurrency(moduleReward)}</span>
              </div>
            )}
            {courseBonus > 0 && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold animate-pop">
                <Trophy className="h-4 w-4" /> Bonus za cały kurs: <span className="num font-semibold">+{formatCurrency(courseBonus)}</span>
              </div>
            )}
          </div>
        )}
        {passed && moduleReward === 0 && courseBonus === 0 && (
          <p className="mt-3 text-xs text-ink-faint">Nagroda za ten moduł została już wcześniej odebrana.</p>
        )}

        <ul className="mx-auto mt-6 max-w-lg space-y-1.5 text-left">
          {questions.map((q, i) => (
            <li key={q.id} className="flex items-start gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
              {answers[i] ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-up" /> : <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-down" />}
              <span className="text-ink-muted">{q.question}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button variant="secondary" onClick={restart}>
            <RotateCcw className="h-4 w-4" /> Rozwiąż ponownie
          </Button>
          {passed && nextModuleId && (
            <Link href={`/kurs/${nextModuleId}`} className={buttonClasses('primary', 'md')}>
              Następny moduł <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {passed && !nextModuleId && (
            <Link href="/handel" className={buttonClasses('primary', 'md')}>
              Przejdź do symulatora <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {!passed && (
            <Link href="/kurs" className={buttonClasses('ghost', 'md')}>
              Wróć do listy modułów
            </Link>
          )}
        </div>
      </div>
    );
  }

  const isCorrect = checked && selected === question.correctIndex;

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between text-xs text-ink-faint">
        <span>
          Pytanie {index + 1} z {total}
        </span>
        <span>Próg zaliczenia: {required}/{total}</span>
      </div>
      <ProgressBar value={(index + (checked ? 1 : 0)) / total} size="sm" className="mb-6" />

      <h3 className="text-lg font-semibold leading-snug text-ink">{question.question}</h3>

      <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Odpowiedzi">
        {question.order.map((optionIndex, position) => {
          const isSelected = selected === optionIndex;
          const showCorrect = checked && optionIndex === question.correctIndex;
          const showWrong = checked && isSelected && optionIndex !== question.correctIndex;
          return (
            <button
              key={optionIndex}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={checked}
              onClick={() => setSelected(optionIndex)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-all',
                !checked && (isSelected ? 'border-brand bg-brand/10 text-ink' : 'border-line bg-bg-soft text-ink-muted hover:border-line-strong hover:text-ink'),
                showCorrect && 'border-up bg-up-soft text-ink',
                showWrong && 'border-down bg-down-soft text-ink',
                checked && !showCorrect && !showWrong && 'border-line bg-bg-soft text-ink-faint opacity-70',
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold',
                  showCorrect ? 'bg-up text-white' : showWrong ? 'bg-down text-white' : isSelected ? 'bg-brand text-white' : 'bg-bg-elevated text-ink-muted',
                )}
              >
                {showCorrect ? <CircleCheck className="h-4 w-4" /> : showWrong ? <CircleX className="h-4 w-4" /> : LETTERS[position]}
              </span>
              <span className="pt-0.5 leading-relaxed">{question.options[optionIndex]}</span>
            </button>
          );
        })}
      </div>

      {checked && (
        <div
          className={cn('mt-4 rounded-xl border p-4 text-sm leading-relaxed animate-slide-in', isCorrect ? 'border-up/30 bg-up/5' : 'border-down/30 bg-down/5')}
          role="status"
        >
          <p className={cn('mb-1 font-semibold', isCorrect ? 'text-up' : 'text-down')}>{isCorrect ? 'Dobrze!' : 'Niestety, to nie jest poprawna odpowiedź.'}</p>
          <p className="text-ink-muted">{question.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {!checked ? (
          <Button onClick={check} disabled={selected === null}>
            Sprawdź odpowiedź
          </Button>
        ) : (
          <Button onClick={next}>
            {index + 1 < total ? 'Następne pytanie' : 'Zobacz wynik'} <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
