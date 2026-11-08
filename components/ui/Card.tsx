import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function Card({ title, subtitle, icon, action, children, className, bodyClassName, noPadding }: CardProps) {
  return (
    <section className={cn('rounded-xl border border-line bg-bg-card shadow-card animate-fade-in', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon && <span className="text-ink-muted">{icon}</span>}
            <div className="min-w-0">
              {title && <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>}
              {subtitle && <p className="truncate text-xs text-ink-faint">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(!noPadding && 'p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
