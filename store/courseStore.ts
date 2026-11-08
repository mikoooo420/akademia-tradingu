'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { COURSE_COMPLETION_BONUS, getModule, QUIZ_PASS_THRESHOLD } from '@/lib/course/content';
import { isCourseCompleted, lessonKey } from '@/lib/course/progress';
import type { QuizResult } from '@/lib/course/types';
import { usePortfolioStore } from './portfolioStore';

export interface QuizSubmission {
  score: number;
  total: number;
  passed: boolean;
  /** Nagroda przyznana za pierwsze zaliczenie modułu (0, jeśli już odebrana) */
  moduleReward: number;
  /** Bonus za ukończenie całego kursu (0, jeśli nie dotyczy) */
  courseBonus: number;
}

interface CourseState {
  completedLessons: string[];
  quizResults: Record<string, QuizResult>;
  claimedRewards: string[];

  completeLesson: (moduleId: string, lessonId: string) => boolean;
  isLessonCompleted: (moduleId: string, lessonId: string) => boolean;
  submitQuiz: (moduleId: string, score: number, total: number) => QuizSubmission;
  resetProgress: () => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      quizResults: {},
      claimedRewards: [],

      completeLesson: (moduleId, lessonId) => {
        const key = lessonKey(moduleId, lessonId);
        if (get().completedLessons.includes(key)) return false;
        set((state) => ({ completedLessons: [...state.completedLessons, key] }));
        return true;
      },

      isLessonCompleted: (moduleId, lessonId) => get().completedLessons.includes(lessonKey(moduleId, lessonId)),

      submitQuiz: (moduleId, score, total) => {
        const mod = getModule(moduleId);
        const passed = total > 0 && score / total >= QUIZ_PASS_THRESHOLD;
        const previous = get().quizResults[moduleId];
        const result: QuizResult = {
          bestScore: Math.max(previous?.bestScore ?? 0, score),
          lastScore: score,
          total,
          attempts: (previous?.attempts ?? 0) + 1,
          passed: Boolean(previous?.passed) || passed,
          passedAt: previous?.passedAt ?? (passed ? Date.now() : undefined),
        };
        const quizResults = { ...get().quizResults, [moduleId]: result };
        const claimed = new Set(get().claimedRewards);
        const credit = usePortfolioStore.getState().creditReward;

        let moduleReward = 0;
        if (passed && mod && !claimed.has(`modul:${moduleId}`)) {
          moduleReward = mod.reward;
          claimed.add(`modul:${moduleId}`);
          credit(moduleReward, `Nagroda za ukończenie modułu „${mod.title}”`);
        }

        let courseBonus = 0;
        if (isCourseCompleted(quizResults) && !claimed.has('kurs:ukonczony')) {
          courseBonus = COURSE_COMPLETION_BONUS;
          claimed.add('kurs:ukonczony');
          credit(courseBonus, 'Bonus za ukończenie całego kursu inwestowania');
        }

        set({ quizResults, claimedRewards: Array.from(claimed) });
        return { score, total, passed, moduleReward, courseBonus };
      },

      resetProgress: () => set({ completedLessons: [], quizResults: {}, claimedRewards: get().claimedRewards }),
    }),
    {
      name: 'akademia-tradingu:kurs',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        quizResults: state.quizResults,
        claimedRewards: state.claimedRewards,
      }),
    },
  ),
);
