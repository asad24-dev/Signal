'use client';

import { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area,
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar,
  Line,
  CartesianGrid
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface CandleData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  symbol: string;
  days?: number;
}

export function StockChart({ symbol, days = 30 }: StockChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);

  useEffect(() => {
    async function fetchCandles() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/stock/candles?symbol=${symbol}&days=${days}&resolution=D`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch candle data');
        }

        const data = await response.json();
        setCandles(data.candles || []);
      } catch (err: any) {
        console.error('Error fetching candles:', err);
        setError(err.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchCandles();
    }
  }, [symbol, days]);

  // Transform data for candlestick visualization
  const chartData = candles.map(candle => {
    const isPositive = candle.close >= candle.open;
    return {
      date: new Date(candle.timestamp * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      // For candlestick body
      candleBottom: Math.min(candle.open, candle.close),
      candleTop: Math.max(candle.open, candle.close),
      candleHeight: Math.abs(candle.close - candle.open),
      // For wicks
      wickLow: candle.low,
      wickHigh: candle.high,
      // Original values
      open: candle.open,
      close: candle.close,
      high: candle.high,
      low: candle.low,
      volume: candle.volume,
      // Color indicator
      fill: isPositive ? '#10b981' : '#ef4444',
      isPositive
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No chart data available for {symbol}</p>
      </div>
    );
  }

  const priceChange = candles[candles.length - 1].close - candles[0].open;
  const priceChangePercent = ((priceChange / candles[0].open) * 100);
  const isPositivePeriod = priceChange >= 0;

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">
            ${candles[candles.length - 1].close.toFixed(2)}
          </h3>
          <p className="text-sm text-gray-400">{symbol}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded ${
          isPositivePeriod ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
        }`}>
          {isPositivePeriod ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-semibold">
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Data Source Notice */}
      <div className="text-xs text-gray-500 bg-gray-900/30 px-3 py-2 rounded">
        ℹ️ Chart data generated from current market price and volatility (Finnhub free tier limitation)
      </div>

      {/* Candlestick Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0]?.payload;
                if (!data) return null;
                
                return (
                  <div className="bg-[#1f2937] border border-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">{data.date}</p>
                    <div className="space-y-1 text-xs">
                      <p className="text-white">Open: <span className="font-semibold">${data.open?.toFixed(2)}</span></p>
                      <p className="text-green-400">High: <span className="font-semibold">${data.high?.toFixed(2)}</span></p>
                      <p className="text-red-400">Low: <span className="font-semibold">${data.low?.toFixed(2)}</span></p>
                      <p className="text-white">Close: <span className="font-semibold">${data.close?.toFixed(2)}</span></p>
                      <p className="text-blue-400">Volume: <span className="font-semibold">{data.volume?.toLocaleString()}</span></p>
                    </div>
                  </div>
                );
              }}
            />
            
            {/* Price area chart */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="#06b6d4"
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
            
            {/* High/Low range indicators */}
            <Line
              type="monotone"
              dataKey="high"
              stroke="#10b981"
              strokeWidth={0.5}
              dot={false}
              opacity={0.3}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#ef4444"
              strokeWidth={0.5}
              dot={false}
              opacity={0.3}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="w-full h-24">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              hide
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              width={60}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
              formatter={(value: any) => [value.toLocaleString(), 'Volume']}
            />
            <Bar 
              dataKey="volume" 
              fill="#3b82f6"
              opacity={0.6}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-400">Open</p>
          <p className="text-sm font-semibold text-white">${candles[0].open.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">High</p>
          <p className="text-sm font-semibold text-green-400">
            ${Math.max(...candles.map(c => c.high)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Low</p>
          <p className="text-sm font-semibold text-red-400">
            ${Math.min(...candles.map(c => c.low)).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Close</p>
          <p className="text-sm font-semibold text-white">
            ${candles[candles.length - 1].close.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
