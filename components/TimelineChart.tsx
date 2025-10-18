'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend
} from 'recharts';
import { Calendar, TrendingUp } from 'lucide-react';

interface TimelineDataPoint {
  timestamp: Date;
  riskScore: number;
  event?: {
    title: string;
    type: string;
  };
}

interface TimelineChartProps {
  assetId: string;
  assetName: string;
  data: TimelineDataPoint[];
  currentScore: number;
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical';
}

export function TimelineChart({ assetId, assetName, data, currentScore, riskLevel }: TimelineChartProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  
  // Filter data based on time range
  const now = new Date();
  const cutoffTime = timeRange === '24h' 
    ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const filteredData = data
    .filter(d => d.timestamp >= cutoffTime)
    .map(d => ({
      time: d.timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        ...(timeRange === '7d' && { month: 'short', day: 'numeric' })
      }),
      score: d.riskScore,
      timestamp: d.timestamp.getTime(),
      event: d.event
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  
  // Add current point if data exists
  if (filteredData.length > 0) {
    filteredData.push({
      time: 'Now',
      score: currentScore,
      timestamp: now.getTime(),
      event: undefined
    });
  }
  
  // Color based on risk level
  const lineColor = {
    low: '#10b981',      // green
    moderate: '#f59e0b', // yellow  
    elevated: '#f97316', // orange
    critical: '#ef4444'  // red
  }[riskLevel];
  
  return (
    <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">{assetName} Risk Timeline</h3>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg">
          <button
            onClick={() => setTimeRange('24h')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeRange === '24h'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            24 Hours
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              timeRange === '7d'
                ? 'bg-cyan-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>
      
      {/* Chart */}
      {filteredData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <Calendar className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm">No historical data available</p>
          <p className="text-xs mt-1">Run analyses to build timeline</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                padding: '8px'
              }}
              labelStyle={{ color: '#fff', fontWeight: 600 }}
              itemStyle={{ color: lineColor }}
              formatter={(value: number) => [`${value.toFixed(1)}/10`, 'Risk Score']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            
            {/* Main line */}
            <Line
              type="monotone"
              dataKey="score"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ fill: lineColor, r: 4 }}
              activeDot={{ r: 6 }}
              name="Risk Score"
            />
            
            {/* Event markers */}
            {filteredData.map((point, index) => 
              point.event ? (
                <ReferenceDot
                  key={index}
                  x={point.time}
                  y={point.score}
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                  label={{
                    value: '!',
                    fill: '#fff',
                    fontSize: 12,
                    fontWeight: 'bold',
                    position: 'center'
                  }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
      
      {/* Legend for event markers */}
      {filteredData.some(d => d.event) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
          <span>Analysis event</span>
        </div>
      )}
    </div>
  );
}
