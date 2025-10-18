// Impact Cascade - Vertical flow with 3-tier impacts and staggered reveal

'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, TrendingUp, Factory, Users, DollarSign } from 'lucide-react';
import { ImpactAnalysis } from '@/types';

interface ImpactCascadeProps {
  analysis: ImpactAnalysis;
  animated?: boolean;
}

export function ImpactCascade({ analysis, animated = true }: ImpactCascadeProps) {
  const [visibleTiers, setVisibleTiers] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!animated) {
      setVisibleTiers(new Set([0, 1, 2]));
      return;
    }

    // Staggered reveal animation
    setVisibleTiers(new Set());
    
    const timers = [
      setTimeout(() => setVisibleTiers(new Set([0])), 300),
      setTimeout(() => setVisibleTiers(new Set([0, 1])), 800),
      setTimeout(() => setVisibleTiers(new Set([0, 1, 2])), 1300)
    ];

    return () => timers.forEach(clearTimeout);
  }, [analysis, animated]);

  const impacts = analysis.impacts || [];
  
  // Group by order
  const primary = impacts.filter(i => i.order === 'primary');
  const firstOrder = impacts.filter(i => i.order === 'first');
  const secondOrder = impacts.filter(i => i.order === 'second');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-semibold text-white">Impact Cascade</h3>
      </div>

      {/* Primary Impact */}
      {primary.length > 0 && (
        <ImpactTier
          order="PRIMARY"
          impacts={primary}
          icon={Factory}
          color="red"
          visible={visibleTiers.has(0)}
        />
      )}

      {visibleTiers.has(0) && primary.length > 0 && firstOrder.length > 0 && (
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-gray-600 animate-bounce" />
        </div>
      )}

      {/* First-Order Impact */}
      {firstOrder.length > 0 && (
        <ImpactTier
          order="FIRST-ORDER"
          impacts={firstOrder}
          icon={Users}
          color="orange"
          visible={visibleTiers.has(1)}
        />
      )}

      {visibleTiers.has(1) && firstOrder.length > 0 && secondOrder.length > 0 && (
        <div className="flex justify-center">
          <ArrowDown className="w-6 h-6 text-gray-600 animate-bounce" />
        </div>
      )}

      {/* Second-Order Impact */}
      {secondOrder.length > 0 && (
        <ImpactTier
          order="SECOND-ORDER"
          impacts={secondOrder}
          icon={DollarSign}
          color="yellow"
          visible={visibleTiers.has(2)}
        />
      )}
    </div>
  );
}

interface ImpactTierProps {
  order: string;
  impacts: any[];
  icon: React.ComponentType<{ className?: string }>;
  color: 'red' | 'orange' | 'yellow';
  visible: boolean;
}

function ImpactTier({ order, impacts, icon: Icon, color, visible }: ImpactTierProps) {
  const colors = {
    red: {
      border: 'border-red-500/50',
      bg: 'bg-red-900/20',
      text: 'text-red-400',
      badge: 'bg-red-500'
    },
    orange: {
      border: 'border-orange-500/50',
      bg: 'bg-orange-900/20',
      text: 'text-orange-400',
      badge: 'bg-orange-500'
    },
    yellow: {
      border: 'border-yellow-500/50',
      bg: 'bg-yellow-900/20',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500'
    }
  };

  const theme = colors[color];

  // Calculate average magnitude
  const avgMagnitude = impacts.reduce((sum, imp) => sum + (imp.magnitude || 0), 0) / impacts.length;

  return (
    <div
      className={`
        border-2 rounded-xl p-6 transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${theme.border} ${theme.bg}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${theme.badge}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className={`font-semibold ${theme.text}`}>{order} IMPACTS</h4>
            <p className="text-xs text-gray-400 mt-0.5">{impacts.length} identified</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-400">Magnitude</div>
          <div className={`text-2xl font-bold ${theme.text}`}>
            {avgMagnitude.toFixed(1)}<span className="text-sm">/10</span>
          </div>
        </div>
      </div>

      {/* Impacts List */}
      <div className="space-y-3">
        {impacts.map((impact, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-900/50 rounded-lg border border-gray-800"
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className="text-sm font-medium text-white flex-1">{impact.description}</h5>
              {impact.magnitude && (
                <span className={`text-xs font-bold ${theme.text} ml-2`}>
                  {impact.magnitude.toFixed(1)}
                </span>
              )}
            </div>
            {impact.details && (
              <p className="text-xs text-gray-400">{impact.details}</p>
            )}
            {impact.affected && impact.affected.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {impact.affected.map((entity: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                  >
                    {entity}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
