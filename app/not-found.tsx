import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated text-ink-faint">
        <Compass className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold text-ink">Nie znaleziono strony</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        Strona, której szukasz, nie istnieje lub została przeniesiona. Wróć na pulpit i kontynuuj naukę inwestowania.
      </p>
      <Link href="/" className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-glow">
        Wróć na pulpit
      </Link>
    </div>
  );
}
