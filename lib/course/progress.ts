import { COURSE_MODULES, getModulesByLevel, TOTAL_LESSONS } from './content';
import { LEVEL_LABELS, LEVELS, type Badge, type CourseModule, type Level, type QuizResult } from './types';

export interface ProgressSnapshot {
  completedLessons: string[];
  quizResults: Record<string, QuizResult>;
  tradesCount: number;
}

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

export const BADGES: Badge[] = [
  { id: 'pierwszy-krok', name: 'Pierwszy krok', description: 'Ukończ pierwszą lekcję kursu.', icon: 'footprints' },
  { id: 'pierwsza-transakcja', name: 'Debiut na rynku', description: 'Zrealizuj pierwszą transakcję w symulatorze.', icon: 'zap' },
  { id: 'perfekcjonista', name: 'Perfekcjonista', description: 'Rozwiąż dowolny quiz bez ani jednego błędu.', icon: 'target' },
  { id: 'aktywny-trader', name: 'Aktywny trader', description: 'Zrealizuj co najmniej 10 transakcji.', icon: 'layers' },
  { id: 'poziom-beginner', name: 'Początkujący inwestor', description: `Ukończ wszystkie moduły poziomu „${LEVEL_LABELS.beginner}”.`, icon: 'sprout' },
  { id: 'poziom-intermediate', name: 'Analityk rynku', description: `Ukończ wszystkie moduły poziomu „${LEVEL_LABELS.intermediate}”.`, icon: 'line-chart' },
  { id: 'poziom-advanced', name: 'Strateg', description: `Ukończ wszystkie moduły poziomu „${LEVEL_LABELS.advanced}”.`, icon: 'compass' },
  { id: 'mistrz-rynku', name: 'Mistrz rynku', description: 'Ukończ cały kurs inwestowania.', icon: 'crown' },
];

export function isModulePassed(moduleId: string, quizResults: Record<string, QuizResult>): boolean {
  return Boolean(quizResults[moduleId]?.passed);
}

export function isLevelCompleted(level: Level, quizResults: Record<string, QuizResult>): boolean {
  return getModulesByLevel(level).every((m) => isModulePassed(m.id, quizResults));
}

export function isCourseCompleted(quizResults: Record<string, QuizResult>): boolean {
  return COURSE_MODULES.every((m) => isModulePassed(m.id, quizResults));
}

/** Postęp modułu (0–1): lekcje mają wagę 70%, zaliczony quiz – 30%. */
export function moduleProgress(mod: CourseModule, completedLessons: string[], quizResults: Record<string, QuizResult>): number {
  const done = mod.lessons.filter((l) => completedLessons.includes(lessonKey(mod.id, l.id))).length;
  const lessonsPart = mod.lessons.length ? (done / mod.lessons.length) * 0.7 : 0.7;
  const quizPart = isModulePassed(mod.id, quizResults) ? 0.3 : 0;
  return lessonsPart + quizPart;
}

export function levelProgress(level: Level, completedLessons: string[], quizResults: Record<string, QuizResult>): number {
  const modules = getModulesByLevel(level);
  if (modules.length === 0) return 0;
  return modules.reduce((sum, m) => sum + moduleProgress(m, completedLessons, quizResults), 0) / modules.length;
}

export function courseProgress(completedLessons: string[], quizResults: Record<string, QuizResult>): number {
  return COURSE_MODULES.reduce((sum, m) => sum + moduleProgress(m, completedLessons, quizResults), 0) / COURSE_MODULES.length;
}

export function countCompletedLessons(completedLessons: string[]): number {
  const valid = new Set(COURSE_MODULES.flatMap((m) => m.lessons.map((l) => lessonKey(m.id, l.id))));
  return completedLessons.filter((key) => valid.has(key)).length;
}

export { TOTAL_LESSONS };

/** Moduł jest dostępny, jeśli wszystkie moduły z poprzednich poziomów zostały zaliczone. */
export function isModuleUnlocked(mod: CourseModule, quizResults: Record<string, QuizResult>): boolean {
  const levelIndex = LEVELS.indexOf(mod.level);
  return LEVELS.slice(0, levelIndex).every((level) => isLevelCompleted(level, quizResults));
}

export function computeEarnedBadges(snapshot: ProgressSnapshot): Set<string> {
  const earned = new Set<string>();
  const { completedLessons, quizResults, tradesCount } = snapshot;
  if (countCompletedLessons(completedLessons) > 0) earned.add('pierwszy-krok');
  if (tradesCount > 0) earned.add('pierwsza-transakcja');
  if (tradesCount >= 10) earned.add('aktywny-trader');
  if (Object.values(quizResults).some((r) => r.total > 0 && r.bestScore === r.total)) earned.add('perfekcjonista');
  for (const level of LEVELS) {
    if (isLevelCompleted(level, quizResults)) earned.add(`poziom-${level}`);
  }
  if (isCourseCompleted(quizResults)) earned.add('mistrz-rynku');
  return earned;
}
