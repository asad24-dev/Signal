// Risk Gauge - Circular gauge with animated counting and color gradient

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskGaugeProps {
  score: number; // 0-10
  previousScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function RiskGauge({ 
  score, 
  previousScore, 
  label = 'Risk Score',
  size = 'lg',
  animated = true 
}: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(previousScore || score);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate score changes
  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    if (displayScore !== score) {
      setIsAnimating(true);
      
      // Smooth counting animation
      const startScore = displayScore;
      const endScore = score;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentScore = startScore + (endScore - startScore) * easeProgress;
        setDisplayScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animate();
    }
  }, [score, animated]);

  const level = getRiskLevel(displayScore);
  const change = previousScore !== undefined ? displayScore - previousScore : 0;

  const sizes = {
    sm: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    md: { width: 200, stroke: 12, fontSize: 'text-4xl' },
    lg: { width: 280, stroke: 16, fontSize: 'text-6xl' }
  };

  const config = sizes[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 10) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Gauge SVG */}
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="#1f2937"
            strokeWidth={config.stroke}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={`url(#gradient-${level.name.toLowerCase()})`}
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={`transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
          />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-moderate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gradient-elevated" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="gradient-critical" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`${config.fontSize} font-bold ${level.textColor}`}>
            {displayScore.toFixed(1)}
          </div>
          <div className="text-sm text-gray-400 mt-1">/ 10</div>
        </div>
      </div>

      {/* Label & Level */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <div className={`px-4 py-1.5 rounded-lg font-semibold ${level.bgColor} ${level.textColor} inline-block`}>
          {level.name.toUpperCase()}
        </div>
      </div>

      {/* Change Indicator */}
      {previousScore !== undefined && Math.abs(change) > 0.1 && (
        <div className="mt-3 flex items-center gap-2">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-red-400" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4 text-green-400" />
          ) : (
            <Minus className="w-4 h-4 text-gray-400" />
          )}
          <span className={`text-sm font-medium ${
            change > 0 ? 'text-red-400' : change < 0 ? 'text-green-400' : 'text-gray-400'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}
          </span>
        </div>
      )}

      {/* Component Breakdown (optional for large size) */}
      {size === 'lg' && (
        <div className="mt-6 w-full max-w-xs">
          <div className="text-xs text-gray-400 mb-2">Risk Components</div>
          <div className="space-y-2">
            <ComponentBar label="Supply Disruption" value={displayScore * 0.35} max={displayScore} color={level.color} />
            <ComponentBar label="Market Sentiment" value={displayScore * 0.25} max={displayScore} color={level.color} />
            <ComponentBar label="Company Exposure" value={displayScore * 0.28} max={displayScore} color={level.color} />
            <ComponentBar label="Geopolitical" value={displayScore * 0.12} max={displayScore} color={level.color} />
          </div>
        </div>
      )}
    </div>
  );
}

interface ComponentBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function ComponentBar({ label, value, max, color }: ComponentBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-medium">{value.toFixed(1)}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function getRiskLevel(score: number): {
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (score < 3) {
    return {
      name: 'Low',
      color: 'bg-green-500',
      bgColor: 'bg-green-900/30',
      textColor: 'text-green-400'
    };
  } else if (score < 5) {
    return {
      name: 'Moderate',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-900/30',
      textColor: 'text-yellow-400'
    };
  } else if (score < 7) {
    return {
      name: 'Elevated',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-900/30',
      textColor: 'text-orange-400'
    };
  } else {
    return {
      name: 'Critical',
      color: 'bg-red-500',
      bgColor: 'bg-red-900/30',
      textColor: 'text-red-400'
    };
  }
}
