import { NextRequest, NextResponse } from 'next/server';
import { getStockCandles } from '@/lib/finance/finnhub';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const resolution = searchParams.get('resolution') as 'D' | 'W' | 'M' | '1' | '5' | '15' | '30' | '60' || 'D';
  const days = parseInt(searchParams.get('days') || '30');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const candles = await getStockCandles(symbol, resolution, days);
    
    if (!candles) {
      return NextResponse.json(
        { error: 'No candle data available for this symbol' },
        { status: 404 }
      );
    }

    return NextResponse.json({ candles });
  } catch (error) {
    console.error('Error fetching candles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candle data' },
      { status: 500 }
    );
  }
}
