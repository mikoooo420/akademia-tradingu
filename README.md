# Akademia Tradingu

Aplikacja do nauki inwestowania: symulator giełdowy z wirtualnym portfelem 100 000 USD, notowania rynkowe, wykresy świecowe oraz interaktywny mini-kurs inwestowania po polsku.

## Funkcje

- **Symulator tradingu** – zlecenia rynkowe Kup/Sprzedaj, prowizja 0 USD, średnia cena wejścia, zysk/strata zrealizowana i niezrealizowana.
- **Notowania** – domyślnie dane symulowane; po wpisaniu darmowego klucza Finnhub (przycisk „Źródło notowań”) – prawdziwe ceny z giełd w USA. Przy limicie zapytań aplikacja używa ostatnich znanych cen.
- **Wykresy** – TradingView Lightweight Charts, świece lub linia, interwały 1D / 1W / 1M / 1Y, wolumen, aktualizacja ostatniej świecy na żywo. Darmowy plan Finnhub nie udostępnia historii notowań, dlatego wykres jest poglądowy (symulowany), ale dopasowany do bieżącej ceny.
- **Pulpit** – wartość portfela, alokacja aktywów (wykres pierścieniowy), otwarte pozycje, lista obserwowanych z wyszukiwarką.
- **Historia transakcji** – filtry, statystyki, eksport do CSV (format zgodny z polskim Excelem).
- **Mini-kurs** – 6 modułów, 22 lekcje, 3 poziomy (Początkujący, Średniozaawansowany, Zaawansowany), quizy, odznaki i nagrody w wirtualnej gotówce (łącznie 55 000 USD).

Stan portfela i postęp w kursie są zapisywane w `localStorage` przeglądarki.

## Uruchomienie lokalne

Wymagany Node.js 18.18 lub nowszy.

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem http://localhost:3000.

## GitHub Pages

Aplikacja jest w pełni statyczna (`output: 'export'`) – wszystkie dane pobierane są bezpośrednio w przeglądarce.
Każdy push na gałąź `main` uruchamia workflow `.github/workflows/deploy.yml`, który buduje stronę i publikuje ją na GitHub Pages.

Jednorazowa konfiguracja: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### Klucz API Finnhub

- **Zalecane:** każdy użytkownik wpisuje własny darmowy klucz w aplikacji (przycisk „Źródło notowań”). Klucz zostaje tylko w jego przeglądarce.
- **Opcjonalnie:** domyślny klucz dla wszystkich odwiedzających – dodaj zmienną repozytorium `FINNHUB_API_KEY` (Settings → Secrets and variables → Actions → Variables). Uwaga: klucz będzie widoczny w kodzie strony, a limit 60 zapytań na minutę będzie wspólny dla wszystkich.

## Struktura projektu

```
app/                  Strony (App Router), eksportowane statycznie
components/dashboard  Pulpit: podsumowanie, alokacja, pozycje, lista obserwowanych
components/trading    Symulator: wykres, panel zleceń, wyszukiwarka, historia
components/course     Kurs: przegląd, moduł, lekcje, quiz, odznaki
components/layout     Szkielet aplikacji, nawigacja, dostawcy stanu
components/ui         Komponenty bazowe (przyciski, karty, powiadomienia)
lib/api               Typy, katalog spółek, klient Finnhub, generator danych symulowanych
lib/trading           Silnik realizacji zleceń (czyste funkcje)
lib/course            Treść kursu, postęp i odznaki
store/                Stan aplikacji (Zustand): portfel, rynek, kurs, ustawienia, powiadomienia
```

## Uwagi

- Dane symulowane są deterministyczne: ceny zmieniają się w czasie, a notowania i świece są ze sobą spójne.
- Nagrody za moduły można odebrać tylko raz – również po zresetowaniu postępu w kursie.
- Materiały mają charakter wyłącznie edukacyjny i nie stanowią rekomendacji inwestycyjnej.
