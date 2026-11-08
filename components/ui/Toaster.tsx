'use client';

import { useEffect } from 'react';
import { CircleCheck, CircleX, Gift, Info, X } from 'lucide-react';
import { useToastStore, type Toast } from '@/store/toastStore';
import { cn } from '@/lib/utils';

const styles: Record<Toast['type'], { icon: typeof Info; ring: string; iconClass: string }> = {
  success: { icon: CircleCheck, ring: 'border-up/30', iconClass: 'text-up' },
  error: { icon: CircleX, ring: 'border-down/30', iconClass: 'text-down' },
  info: { icon: Info, ring: 'border-brand/30', iconClass: 'text-brand-glow' },
  reward: { icon: Gift, ring: 'border-gold/40', iconClass: 'text-gold' },
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const { icon: Icon, ring, iconClass } = styles[toast.type];

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-bg-elevated/95 p-3.5 shadow-2xl backdrop-blur animate-slide-in',
        ring,
        toast.type === 'reward' && 'bg-gradient-to-br from-bg-elevated to-amber-950/40',
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="rounded p-0.5 text-ink-faint transition-colors hover:text-ink"
        aria-label="Zamknij powiadomienie"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end lg:px-0"
    >
      <div className="flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </div>
  );
}
