export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: 'Początkujący',
  intermediate: 'Średniozaawansowany',
  advanced: 'Zaawansowany',
};

export const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  beginner: 'Fundamenty: jak działa giełda, czym są akcje i jak nie stracić pieniędzy na starcie.',
  intermediate: 'Narzędzia analityka: czytanie wykresów i ocena kondycji finansowej spółek.',
  advanced: 'Wskaźniki techniczne, precyzyjne zarządzanie ryzykiem i psychologia inwestowania.',
};

export type CalloutVariant = 'tip' | 'warning' | 'example' | 'formula';

export type LessonBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'callout'; variant: CalloutVariant; title?: string; text: string }
  | { type: 'terms'; terms: Array<{ term: string; definition: string }> };

export interface Lesson {
  id: string;
  title: string;
  /** Szacowany czas czytania w minutach */
  minutes: number;
  blocks: LessonBlock[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ModuleIcon = 'landmark' | 'shield' | 'candlestick' | 'file-text' | 'activity' | 'brain';

export interface CourseModule {
  id: string;
  level: Level;
  title: string;
  description: string;
  icon: ModuleIcon;
  /** Nagroda (wirtualna gotówka w USD) za pierwsze zaliczenie quizu */
  reward: number;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface QuizResult {
  bestScore: number;
  lastScore: number;
  total: number;
  attempts: number;
  passed: boolean;
  passedAt?: number;
}

export type BadgeIcon = 'footprints' | 'target' | 'sprout' | 'line-chart' | 'compass' | 'crown' | 'zap' | 'layers';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
}
