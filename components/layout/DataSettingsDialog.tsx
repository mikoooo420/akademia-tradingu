'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink, KeyRound, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { hasBuildTimeKey, testFinnhubKey } from '@/lib/api/market';
import { formatPrice } from '@/lib/format';
import { useSettingsStore } from '@/store/settingsStore';
import { toast } from '@/store/toastStore';

/** Okno ustawień źródła notowań: wprowadzenie własnego klucza API Finnhub. */
export function DataSettingsDialog() {
  const open = useSettingsStore((s) => s.dataDialogOpen);
  const close = useSettingsStore((s) => s.closeDataDialog);
  const savedKey = useSettingsStore((s) => s.finnhubKey);
  const setFinnhubKey = useSettingsStore((s) => s.setFinnhubKey);
  const [value, setValue] = useState(savedKey);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValue(savedKey);
    setError(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, savedKey, close]);

  if (!open) return null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const key = value.trim();
    if (!key) {
      setError('Wpisz klucz API.');
      return;
    }
    setTesting(true);
    setError(null);
    const result = await testFinnhubKey(key);
    setTesting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setFinnhubKey(key);
    close();
    toast.success('Połączono z Finnhub', `Notowania na żywo są aktywne. Kurs AAPL: ${formatPrice(result.price)} USD.`);
  };

  const removeKey = () => {
    setFinnhubKey('');
    close();
    toast.info('Usunięto klucz API', hasBuildTimeKey() ? 'Aplikacja używa domyślnego klucza strony.' : 'Aplikacja korzysta teraz z danych symulowanych.');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="data-settings-title">
      <button type="button" aria-label="Zamknij okno" className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={close} />
      <form onSubmit={onSubmit} className="relative w-full max-w-lg rounded-2xl border border-line bg-bg-card p-6 shadow-2xl animate-pop">
        <button type="button" onClick={close} className="absolute right-4 top-4 rounded-md p-1 text-ink-faint hover:text-ink" aria-label="Zamknij">
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand-glow">
          <KeyRound className="h-5 w-5" />
        </div>
        <h2 id="data-settings-title" className="text-lg font-semibold text-ink">
          Źródło notowań
        </h2>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-muted">
          <p>
            Domyślnie symulator korzysta z <strong className="text-ink">danych symulowanych</strong>. Aby handlować po prawdziwych cenach z giełd w USA,
            wklej swój darmowy klucz API z serwisu Finnhub.
          </p>
          <p className="text-xs text-ink-faint">
            Klucz zostanie zapisany wyłącznie w Twojej przeglądarce i będzie wysyłany tylko do Finnhub. Darmowy plan pozwala na 60 zapytań na minutę –
            przy jego przekroczeniu aplikacja na chwilę wróci do ostatnich znanych cen.
          </p>
        </div>

        <label htmlFor="finnhub-key" className="mt-5 block text-xs font-medium text-ink-muted">
          Klucz API Finnhub
        </label>
        <input
          id="finnhub-key"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="np. c1a2b3c4d5e6f7g8h9i0"
          className="input-base mt-1.5 font-mono"
          autoComplete="off"
          spellCheck={false}
        />
        {error && (
          <p className="mt-2 text-xs text-down" role="alert">
            {error}
          </p>
        )}
        <a
          href="https://finnhub.io/register"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-brand-glow hover:underline"
        >
          Załóż darmowe konto i odbierz klucz <ExternalLink className="h-3 w-3" />
        </a>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {savedKey ? (
            <Button variant="danger" onClick={removeKey}>
              Usuń klucz
            </Button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={close}>
              Anuluj
            </Button>
            <Button type="submit" disabled={testing}>
              {testing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Zapisz i połącz
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
