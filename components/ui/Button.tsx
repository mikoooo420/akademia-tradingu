import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'buy' | 'sell' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-glow shadow-[0_6px_20px_-8px_rgba(59,130,246,0.7)]',
  secondary: 'bg-bg-elevated text-ink border border-line hover:border-line-strong hover:bg-bg-hover',
  ghost: 'text-ink-muted hover:text-ink hover:bg-bg-hover',
  buy: 'bg-up text-white hover:brightness-110 shadow-[0_6px_20px_-8px_rgba(34,197,94,0.7)]',
  sell: 'bg-down text-white hover:brightness-110 shadow-[0_6px_20px_-8px_rgba(239,68,68,0.7)]',
  danger: 'bg-down/15 text-down border border-down/30 hover:bg-down/25',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
  icon: 'h-9 w-9 justify-center',
};

/** Klasy przycisku – do użycia np. z komponentem Link (bez zagnieżdżania <button> w <a>). */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string): string {
  return cn(
    'inline-flex select-none items-center justify-center rounded-lg font-medium transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
});
