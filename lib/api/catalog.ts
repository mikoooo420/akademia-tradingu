import type { SymbolInfo } from './types';

export interface CatalogEntry extends SymbolInfo {
  /** Cena bazowa wykorzystywana przez generator danych symulowanych */
  basePrice: number;
  /** Roczna zmienność (np. 0.3 = 30%) wykorzystywana przez generator danych symulowanych */
  volatility: number;
}

/**
 * Katalog popularnych spółek z rynku amerykańskiego.
 * Służy do lokalnego wyszukiwania oraz jako źródło parametrów dla danych symulowanych.
 */
export const CATALOG: CatalogEntry[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technologia', basePrice: 228, volatility: 0.26 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technologia', basePrice: 432, volatility: 0.24 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Półprzewodniki', basePrice: 138, volatility: 0.48 },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (klasa A)', sector: 'Technologia', basePrice: 178, volatility: 0.28 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Handel internetowy', basePrice: 196, volatility: 0.31 },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Media społecznościowe', basePrice: 585, volatility: 0.36 },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Motoryzacja', basePrice: 255, volatility: 0.58 },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Półprzewodniki', basePrice: 152, volatility: 0.47 },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Półprzewodniki', basePrice: 23, volatility: 0.42 },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Media i rozrywka', basePrice: 765, volatility: 0.35 },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Oprogramowanie', basePrice: 172, volatility: 0.3 },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Oprogramowanie', basePrice: 298, volatility: 0.32 },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Oprogramowanie', basePrice: 505, volatility: 0.33 },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Półprzewodniki', basePrice: 172, volatility: 0.4 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Bankowość', basePrice: 222, volatility: 0.22 },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Bankowość', basePrice: 42, volatility: 0.26 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', sector: 'Bankowość inwestycyjna', basePrice: 520, volatility: 0.27 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Usługi finansowe', basePrice: 290, volatility: 0.19 },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Usługi finansowe', basePrice: 515, volatility: 0.2 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. (klasa B)', sector: 'Konglomerat', basePrice: 465, volatility: 0.16 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Ochrona zdrowia', basePrice: 158, volatility: 0.16 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Farmacja', basePrice: 28, volatility: 0.24 },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Farmacja', basePrice: 880, volatility: 0.34 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Ochrona zdrowia', basePrice: 580, volatility: 0.25 },
  { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Dobra konsumpcyjne', basePrice: 68, volatility: 0.14 },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Dobra konsumpcyjne', basePrice: 165, volatility: 0.15 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Dobra konsumpcyjne', basePrice: 170, volatility: 0.14 },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Handel detaliczny', basePrice: 82, volatility: 0.18 },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', sector: 'Handel detaliczny', basePrice: 900, volatility: 0.2 },
  { symbol: 'MCD', name: "McDonald's Corporation", sector: 'Gastronomia', basePrice: 295, volatility: 0.17 },
  { symbol: 'NKE', name: 'Nike Inc.', sector: 'Odzież i obuwie', basePrice: 78, volatility: 0.3 },
  { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Media i rozrywka', basePrice: 96, volatility: 0.27 },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energetyka', basePrice: 118, volatility: 0.23 },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energetyka', basePrice: 155, volatility: 0.24 },
  { symbol: 'BA', name: 'The Boeing Company', sector: 'Przemysł lotniczy', basePrice: 155, volatility: 0.38 },
  { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Przemysł', basePrice: 385, volatility: 0.27 },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Transport', basePrice: 74, volatility: 0.4 },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: 'Oprogramowanie', basePrice: 42, volatility: 0.62 },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Kryptowaluty', basePrice: 205, volatility: 0.75 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'Fundusz ETF', basePrice: 575, volatility: 0.15 },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100)', sector: 'Fundusz ETF', basePrice: 495, volatility: 0.2 },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'Fundusz ETF', basePrice: 528, volatility: 0.15 },
];

export const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'SPY'];

const catalogMap = new Map(CATALOG.map((entry) => [entry.symbol, entry]));

export function getCatalogEntry(symbol: string): CatalogEntry | undefined {
  return catalogMap.get(symbol.toUpperCase());
}

export function getCompanyName(symbol: string): string {
  return getCatalogEntry(symbol)?.name ?? symbol.toUpperCase();
}

/** Lokalne wyszukiwanie po symbolu lub nazwie spółki (bez rozróżniania wielkości liter). */
export function searchCatalog(query: string, limit = 8): SymbolInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = CATALOG.map((entry) => {
    const symbol = entry.symbol.toLowerCase();
    const name = entry.name.toLowerCase();
    let score = -1;
    if (symbol === q) score = 100;
    else if (symbol.startsWith(q)) score = 80;
    else if (name.startsWith(q)) score = 60;
    else if (name.includes(q)) score = 40;
    else if (symbol.includes(q)) score = 30;
    return { entry, score };
  })
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.entry.symbol.localeCompare(b.entry.symbol));

  return scored.slice(0, limit).map(({ entry }) => ({
    symbol: entry.symbol,
    name: entry.name,
    sector: entry.sector,
  }));
}

/** Prawidłowy symbol giełdowy: litery, cyfry, kropka lub myślnik, maksymalnie 10 znaków. */
export function isValidSymbol(symbol: string): boolean {
  return /^[A-Z0-9][A-Z0-9.\-]{0,9}$/.test(symbol.toUpperCase());
}
