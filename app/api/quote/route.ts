import { NextResponse, type NextRequest } from 'next/server';
import { isValidSymbol } from '@/lib/api/catalog';
import { getQuotes } from '@/lib/api/providers';
import type { DataSource, QuotesResponse } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('symbols') ?? '';
  const symbols = raw
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter((s) => s.length > 0 && isValidSymbol(s));

  if (symbols.length === 0) {
    return NextResponse.json({ error: 'Podaj co najmniej jeden prawidłowy symbol, np. ?symbols=AAPL,MSFT' }, { status: 400 });
  }

  const quotes = await getQuotes(symbols);
  const sources = new Set(Object.values(quotes).map((q) => q.source));
  const source: DataSource = sources.has('finnhub') ? 'finnhub' : sources.has('yahoo') ? 'yahoo' : 'mock';
  const body: QuotesResponse = { quotes, source };

  return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store' } });
}
