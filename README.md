# Akademia Tradingu

Aplikacja do nauki inwestowania: symulator giełdowy z wirtualnym portfelem 100 000 USD, notowania rynkowe, wykresy świecowe oraz interaktywny mini-kurs inwestowania po polsku.

## Funkcje

- **Symulator tradingu** – zlecenia rynkowe Kup/Sprzedaj, prowizja 0 USD, średnia cena wejścia, zysk/strata zrealizowana i niezrealizowana.
- **Notowania** – Finnhub (z kluczem API) → Yahoo Finance (bez klucza) → dane symulowane. Przy limicie zapytań lub braku sieci aplikacja płynnie przechodzi na kolejne źródło.
- **Wykresy** – TradingView Lightweight Charts, świece lub linia, interwały 1D / 1W / 1M / 1Y, wolumen, aktualizacja ostatniej świecy na żywo.
- **Pulpit** – wartość portfela, alokacja aktywów (wykres pierścieniowy), otwarte pozycje, lista obserwowanych z wyszukiwarką.
- **Historia transakcji** – filtry, statystyki, eksport do CSV (format zgodny z polskim Excelem).
- **Mini-kurs** – 6 modułów, 22 lekcje, 3 poziomy (Początkujący, Średniozaawansowany, Zaawansowany), quizy, odznaki i nagrody w wirtualnej gotówce (łącznie 55 000 USD).

Stan portfela i postęp w kursie są zapisywane w `localStorage` przeglądarki.

## Uruchomienie

Wymagany Node.js 18.18 lub nowszy.

```bash
npm install
cp .env.example .env.local   # opcjonalnie: wpisz FINNHUB_API_KEY
npm run dev
```

Aplikacja będzie dostępna pod adresem http://localhost:3000.

Wersja produkcyjna: `npm run build && npm start`. Projekt można wdrożyć na Vercel bez dodatkowej konfiguracji (Route Handlery `/api/*` wymagają środowiska Node.js, więc statyczny eksport nie jest obsługiwany).

### Zmienne środowiskowe

| Zmienna | Opis |
| --- | --- |
| `FINNHUB_API_KEY` | Darmowy klucz z https://finnhub.io – notowania w czasie rzeczywistym i wyszukiwanie spółek. |
| `MARKET_DATA_MODE` | `auto` (domyślnie) lub `mock` – wymusza dane symulowane, np. podczas prezentacji offline. |

## Struktura projektu

```
app/                  Strony (App Router) i Route Handlery /api/quote, /api/candles, /api/search
components/dashboard  Pulpit: podsumowanie, alokacja, pozycje, lista obserwowanych
components/trading    Symulator: wykres, panel zleceń, wyszukiwarka, historia
components/course     Kurs: przegląd, moduł, lekcje, quiz, odznaki
components/layout     Szkielet aplikacji, nawigacja, dostawcy stanu
components/ui         Komponenty bazowe (przyciski, karty, powiadomienia)
lib/api               Typy, katalog spółek, dostawcy danych, generator danych symulowanych
lib/trading           Silnik realizacji zleceń (czyste funkcje)
lib/course            Treść kursu, postęp i odznaki
store/                Stan aplikacji (Zustand): portfel, rynek, kurs, powiadomienia
```

## Uwagi

- Dane symulowane są deterministyczne: ceny zmieniają się w czasie, a notowania i świece są ze sobą spójne.
- Nagrody za moduły można odebrać tylko raz – również po zresetowaniu postępu w kursie.
- Materiały mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnej.
