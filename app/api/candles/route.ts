import { NextResponse, type NextRequest } from 'next/server';
import { isValidSymbol } from '@/lib/api/catalog';
import { getCandles } from '@/lib/api/providers';
import { TIMEFRAMES, type Timeframe } from '@/lib/api/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const symbol = (request.nextUrl.searchParams.get('symbol') ?? '').trim().toUpperCase();
  const timeframeParam = (request.nextUrl.searchParams.get('timeframe') ?? '1M').toUpperCase();

  if (!symbol || !isValidSymbol(symbol)) {
    return NextResponse.json({ error: 'Nieprawidłowy symbol instrumentu.' }, { status: 400 });
  }
  if (!TIMEFRAMES.includes(timeframeParam as Timeframe)) {
    return NextResponse.json({ error: 'Nieprawidłowy interwał. Dozwolone: 1D, 1W, 1M, 1Y.' }, { status: 400 });
  }

  const data = await getCandles(symbol, timeframeParam as Timeframe);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
