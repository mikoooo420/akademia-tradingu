import { NextResponse, type NextRequest } from 'next/server';
import { searchSymbols } from '@/lib/api/providers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 40);
  const data = await searchSymbols(query);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
