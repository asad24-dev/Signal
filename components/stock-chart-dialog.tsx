"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

interface StockChartDialogProps {
  symbol: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StockChartDialog({ symbol, companyName, isOpen, onClose }: StockChartDialogProps) {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && symbol) {
      fetchCandles();
    }
  }, [isOpen, symbol]);

  const fetchCandles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stock/candles?symbol=${symbol}&resolution=D&days=30`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch candle data');
      }
      
      setCandles(data.candles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      console.error('Error fetching candles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Transform candle data for the chart
  const chartData = candles.map(candle => {
    const isGreen = candle.close >= candle.open;
    return {
      date: new Date(candle.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume,
      // For candlestick representation
      body: [Math.min(candle.open, candle.close), Math.max(candle.open, candle.close)],
      wick: [candle.low, candle.high],
      isGreen,
      color: isGreen ? '#10b981' : '#ef4444'
    };
  });

  // Calculate price change
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const priceChange = lastCandle && firstCandle ? 
    ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-semibold mb-2">{data.date}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Open: <span className="text-white font-medium">${data.open.toFixed(2)}</span></p>
            <p className="text-gray-300">High: <span className="text-green-400 font-medium">${data.high.toFixed(2)}</span></p>
            <p className="text-gray-300">Low: <span className="text-red-400 font-medium">${data.low.toFixed(2)}</span></p>
            <p className="text-gray-300">Close: <span className="text-white font-medium">${data.close.toFixed(2)}</span></p>
            <p className="text-gray-300">Volume: <span className="text-white font-medium">{(data.volume / 1000000).toFixed(2)}M</span></p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold">{symbol}</span>
              <span className="text-gray-400 ml-2">- {companyName}</span>
            </div>
            {lastCandle && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${lastCandle.close.toFixed(2)}</span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                  <span className="text-sm text-gray-400">(30 days)</span>
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Loading chart data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && chartData.length > 0 && (
          <div className="space-y-6">
            {/* Candlestick Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">30-Day Price Chart</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Wicks (High-Low lines) */}
                  <Line 
                    type="monotone" 
                    dataKey="wick" 
                    stroke="#666"
                    strokeWidth={1}
                    dot={false}
                    connectNulls
                  />
                  
                  {/* Candlestick bodies */}
                  <Bar dataKey="body" fill="#8884d8" barSize={8}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Volume Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Trading Volume</h3>
              <ResponsiveContainer width="100%" height={150}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${(value / 1000000).toFixed(2)}M`, 'Volume']}
                    labelStyle={{ color: '#fff' }}
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                  <Bar dataKey="volume" barSize={8}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isGreen ? '#10b98180' : '#ef444480'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {!loading && !error && chartData.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No chart data available for {symbol}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
