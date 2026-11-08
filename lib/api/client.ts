/**
 * Publiczne API danych rynkowych dla komponentów.
 * Aplikacja jest w pełni statyczna (GitHub Pages), więc wszystkie dane pobierane są
 * bezpośrednio z przeglądarki – szczegóły w lib/api/market.ts.
 */
export { fetchCandles, fetchQuotes, searchSymbols } from './market';
