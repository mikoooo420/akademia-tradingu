'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { LoaderCircle, Search } from 'lucide-react';
import { searchSymbols } from '@/lib/api/client';
import { isValidSymbol } from '@/lib/api/catalog';
import type { SymbolInfo } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface SymbolSearchProps {
  onSelect: (symbol: string, info?: SymbolInfo) => void;
  placeholder?: string;
  className?: string;
  /** Symbole oznaczone w wynikach (np. już obserwowane) */
  markedSymbols?: string[];
  markedLabel?: string;
  autoFocus?: boolean;
}

export function SymbolSearch({
  onSelect,
  placeholder = 'Szukaj spółki lub symbolu, np. AAPL, Tesla…',
  className,
  markedSymbols = [],
  markedLabel = 'Obserwowana',
  autoFocus,
}: SymbolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const response = await searchSymbols(q);
      if (cancelled) return;
      setResults(response.results);
      setHighlight(0);
      setLoading(false);
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (symbol: string, info?: SymbolInfo) => {
    onSelect(symbol.toUpperCase(), info);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const trimmed = query.trim().toUpperCase();
  const canUseRaw = trimmed.length > 0 && isValidSymbol(trimmed) && !results.some((r) => r.symbol === trimmed);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const picked = results[highlight];
      if (picked) choose(picked.symbol, picked);
      else if (canUseRaw) choose(trimmed);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="input-base pl-9 pr-9"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Wyszukiwarka instrumentów"
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" />}
      </div>

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-line bg-bg-elevated p-1 shadow-2xl animate-fade-in"
        >
          {results.map((item, index) => {
            const marked = markedSymbols.includes(item.symbol);
            return (
              <li key={item.symbol} role="option" aria-selected={index === highlight}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => choose(item.symbol, item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    index === highlight ? 'bg-bg-hover' : 'hover:bg-bg-hover',
                  )}
                >
                  <span className="w-16 shrink-0 font-mono text-sm font-semibold text-ink">{item.symbol}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink-muted">{item.name}</span>
                    {item.sector && <span className="block truncate text-[11px] text-ink-faint">{item.sector}</span>}
                  </span>
                  {marked && <span className="shrink-0 text-[10px] uppercase tracking-wide text-brand-glow">{markedLabel}</span>}
                </button>
              </li>
            );
          })}
          {canUseRaw && (
            <li role="option" aria-selected={results.length === 0}>
              <button
                type="button"
                onClick={() => choose(trimmed)}
                className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink-muted hover:bg-bg-hover', results.length === 0 && 'bg-bg-hover')}
              >
                Użyj symbolu <span className="font-mono font-semibold text-ink">{trimmed}</span>
              </button>
            </li>
          )}
          {!loading && results.length === 0 && !canUseRaw && (
            <li className="px-3 py-4 text-center text-sm text-ink-faint">Brak wyników dla „{query.trim()}”.</li>
          )}
        </ul>
      )}
    </div>
  );
}
