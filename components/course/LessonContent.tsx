import { Fragment, type ReactNode } from 'react';
import { Calculator, Lightbulb, NotebookPen, TriangleAlert } from 'lucide-react';
import type { CalloutVariant, Lesson, LessonBlock } from '@/lib/course/types';
import { cn } from '@/lib/utils';

/** Obsługa prostego formatowania: **pogrubienie**. */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const CALLOUTS: Record<CalloutVariant, { icon: typeof Lightbulb; className: string; iconClass: string }> = {
  tip: { icon: Lightbulb, className: 'border-brand/30 bg-brand/5', iconClass: 'text-brand-glow' },
  warning: { icon: TriangleAlert, className: 'border-down/30 bg-down/5', iconClass: 'text-down' },
  example: { icon: NotebookPen, className: 'border-up/30 bg-up/5', iconClass: 'text-up' },
  formula: { icon: Calculator, className: 'border-gold/30 bg-gold/5', iconClass: 'text-gold' },
};

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="leading-relaxed text-ink-muted">{renderInline(block.text)}</p>;
    case 'heading':
      return <h3 className="pt-2 text-lg font-semibold text-ink">{block.text}</h3>;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={cn('space-y-2 pl-5 text-ink-muted', block.ordered ? 'list-decimal' : 'list-disc marker:text-brand')}>
          {block.items.map((item, i) => (
            <li key={i} className="pl-1 leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </Tag>
      );
    }
    case 'callout': {
      const { icon: Icon, className, iconClass } = CALLOUTS[block.variant];
      return (
        <div className={cn('flex gap-3 rounded-xl border p-4', className)}>
          <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden />
          <div className="min-w-0">
            {block.title && <p className={cn('mb-1 text-sm font-semibold', iconClass)}>{block.title}</p>}
            <p className={cn('text-sm leading-relaxed text-ink-muted', block.variant === 'formula' && 'font-mono text-ink')}>{renderInline(block.text)}</p>
          </div>
        </div>
      );
    }
    case 'terms':
      return (
        <dl className="grid gap-2 sm:grid-cols-2">
          {block.terms.map(({ term, definition }) => (
            <div key={term} className="rounded-xl border border-line bg-bg-soft p-3">
              <dt className="text-sm font-semibold text-ink">{term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-muted">{definition}</dd>
            </div>
          ))}
        </dl>
      );
    default:
      return null;
  }
}

export function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <article className="space-y-4 text-[15px]">
      {lesson.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </article>
  );
}
