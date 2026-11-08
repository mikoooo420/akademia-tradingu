'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface FlashPriceProps {
  price: number | undefined;
  className?: string;
  suffix?: string;
}

/** Cena, która krótko podświetla się na zielono lub czerwono przy każdej zmianie. */
export function FlashPrice({ price, className, suffix }: FlashPriceProps) {
  const previous = useRef<number | undefined>(price);
  const [flash, setFlash] = useState<{ dir: 'up' | 'down'; key: number } | null>(null);

  useEffect(() => {
    const prev = previous.current;
    if (price !== undefined && prev !== undefined && price !== prev) {
      setFlash({ dir: price > prev ? 'up' : 'down', key: Date.now() });
    }
    previous.current = price;
  }, [price]);

  return (
    <span
      key={flash?.key}
      className={cn(
        'rounded px-1 -mx-1 font-mono tabular-nums',
        flash?.dir === 'up' && 'animate-flash-up',
        flash?.dir === 'down' && 'animate-flash-down',
        className,
      )}
    >
      {price === undefined ? '—' : formatPrice(price)}
      {suffix && price !== undefined ? ` ${suffix}` : ''}
    </span>
  );
}
