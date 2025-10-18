'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, X } from 'lucide-react';
import type { Opportunity } from '@/types';
import { StockChart } from './StockChart';

interface TradingOpportunitiesProps {
  opportunities: Opportunity[];
  assetName?: string;
}

export function TradingOpportunities({ opportunities, assetName }: TradingOpportunitiesProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  if (opportunities.length === 0) {
    return (
      <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Trading Opportunities</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No opportunities available</p>
          <p className="text-xs mt-1">Run an analysis to discover trading opportunities</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Trading Opportunities</h3>
        </div>
        {assetName && (
          <span className="px-3 py-1 bg-cyan-900 text-cyan-300 text-xs font-medium rounded uppercase">
            {assetName}
          </span>
        )}
      </div>
      
      {/* Opportunities Grid */}
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opp, index) => (
          <OpportunityCard 
            key={index} 
            opportunity={opp} 
            index={index}
            onClick={() => setSelectedOpportunity(opp)}
          />
        ))}
      </div>
      
      {/* Chart Modal */}
      {selectedOpportunity && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div 
            className="bg-[#0a0e1a] border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedOpportunity.company?.name || selectedOpportunity.company?.ticker || 'Stock Chart'}
              </h2>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {selectedOpportunity.company?.ticker && (
              <StockChart symbol={selectedOpportunity.company.ticker} days={30} />
            )}
            
            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-300">{selectedOpportunity.description}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-400/80">
          ⚠️ <strong>Disclaimer:</strong> These are AI-generated suggestions based on historical patterns. 
          Not financial advice. Always conduct your own research and consult a financial advisor.
        </p>
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
  onClick: () => void;
}

function OpportunityCard({ opportunity, index, onClick }: OpportunityCardProps) {
  const typeConfig: Record<string, {
    icon: any;
    color: string;
    bg: string;
    border: string;
    label: string;
  }> = {
    long: {
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-900/20',
      border: 'border-green-500/30',
      label: 'LONG'
    },
    short: {
      icon: TrendingDown,
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      border: 'border-red-500/30',
      label: 'SHORT'
    },
    arbitrage: {
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-900/20',
      border: 'border-purple-500/30',
      label: 'ARBITRAGE'
    },
    hedge: {
      icon: Target,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/30',
      label: 'HEDGE'
    }
  };
  
  // Get config with fallback to 'long' if type is not recognized
  const config = typeConfig[opportunity.type?.toLowerCase()] || typeConfig.long;
  const Icon = config.icon;
  
  // Risk level colors
  const riskColor = {
    low: 'text-green-400',
    moderate: 'text-yellow-400',
    elevated: 'text-orange-400',
    critical: 'text-red-400'
  }[opportunity.riskLevel];
  
  return (
    <div 
      className={`p-4 ${config.bg} border ${config.border} rounded-lg transition-all hover:border-opacity-60 cursor-pointer hover:shadow-lg`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className={`px-2 py-0.5 ${config.bg} ${config.color} text-xs font-bold rounded`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-500">#{index + 1}</span>
        </div>
        
        {/* Stock Performance Badge - Shows ACTUAL current movement */}
        {opportunity.company?.changePercent !== undefined && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <DollarSign className={`w-4 h-4 ${opportunity.company.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm font-bold ${opportunity.company.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {opportunity.company.changePercent > 0 ? '+' : ''}{opportunity.company.changePercent.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] text-gray-500">Current Move</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-300 mb-3">
        {opportunity.description || 'No description available'}
      </p>
      
      {/* Actions */}
      {opportunity.suggestedActions && opportunity.suggestedActions.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Suggested Actions:</p>
          <div className="flex flex-wrap gap-1">
            {opportunity.suggestedActions.map((action, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
              >
                {action}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{opportunity.timeframe || 'Short-term'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Risk:</span>
          <span className={`font-medium ${riskColor} uppercase`}>
            {opportunity.riskLevel || 'moderate'}
          </span>
        </div>
      </div>
      
      {/* Citations */}
      {opportunity.citations && opportunity.citations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 mb-1">Based on {opportunity.citations.length} source(s)</p>
        </div>
      )}
    </div>
  );
}
