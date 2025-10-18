'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, ChevronDown, ChevronUp, Info, BarChart3, TrendingUpDown } from 'lucide-react';
import type { Opportunity } from '@/types';
import type { EnhancedTradingOpportunity } from '@/types/finance';

interface EnhancedTradingOpportunitiesProps {
  opportunities: (Opportunity | EnhancedTradingOpportunity)[];
  assetName?: string;
}

export function EnhancedTradingOpportunities({ opportunities, assetName }: EnhancedTradingOpportunitiesProps) {
  if (opportunities.length === 0) {
    return (
      <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Smart Trading Opportunities</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No opportunities discovered</p>
          <p className="text-xs mt-1">Run deep research analysis to discover intelligent stock correlations</p>
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
          <h3 className="text-lg font-semibold text-white">Smart Trading Opportunities</h3>
          <span className="ml-2 px-2 py-0.5 bg-purple-900/30 border border-purple-500/30 rounded text-[10px] text-purple-300 font-medium">
            AI DISCOVERY
          </span>
        </div>
        {assetName && (
          <span className="px-3 py-1 bg-cyan-900 text-cyan-300 text-xs font-medium rounded uppercase">
            {assetName}
          </span>
        )}
      </div>
      
      {/* Opportunities List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {opportunities.slice(0, 15).map((opp, index) => (
          <EnhancedOpportunityCard key={index} opportunity={opp} index={index} />
        ))}
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-xs text-yellow-400/80">
          ⚠️ <strong>Disclaimer:</strong> AI-powered correlation discovery. Not financial advice. 
          Always verify data and consult a licensed financial advisor before trading.
        </p>
      </div>
    </div>
  );
}

interface EnhancedOpportunityCardProps {
  opportunity: Opportunity | EnhancedTradingOpportunity;
  index: number;
}

function EnhancedOpportunityCard({ opportunity, index }: EnhancedOpportunityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if this is an enhanced opportunity with correlation data
  const isEnhanced = 'correlation' in opportunity;
  const enhanced = isEnhanced ? (opportunity as EnhancedTradingOpportunity) : null;
  const basic = !isEnhanced ? (opportunity as Opportunity) : null;
  
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
    hedge: {
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-900/20',
      border: 'border-purple-500/30',
      label: 'HEDGE'
    },
    arbitrage: {
      icon: TrendingUpDown,
      color: 'text-blue-400',
      bg: 'bg-blue-900/20',
      border: 'border-blue-500/30',
      label: 'ARBITRAGE'
    }
  };
  
  const config = typeConfig[opportunity.type?.toLowerCase()] || typeConfig.long;
  const Icon = config.icon;
  
  // Get company info (enhanced or basic)
  const companyName = enhanced?.company.name || basic?.description?.split(':')[0] || 'Trading Opportunity';
  const ticker = enhanced?.company.ticker || '';
  const sector = enhanced?.company.sector || '';
  
  // Get strategy info (enhanced or basic)
  const potentialReturn = enhanced?.strategy.potentialReturn || (basic?.potentialReturn ? `+${basic.potentialReturn}%` : 'N/A');
  const timeframe = enhanced?.strategy.timeframe || basic?.timeframe || 'Medium term';
  const riskLevel = enhanced?.strategy.riskLevel || basic?.riskLevel || 'medium';
  
  // Correlation strength (0-100)
  const correlationPercent = enhanced ? Math.round(enhanced.correlation.strength * 100) : null;
  
  return (
    <div 
      className={`${config.bg} border ${config.border} rounded-lg p-4 transition-all hover:border-opacity-50 cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${config.bg} p-2 rounded-lg mt-1`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold ${config.color} uppercase tracking-wide`}>
                {config.label}
              </span>
              {ticker && (
                <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs font-mono rounded">
                  {ticker}
                </span>
              )}
              {correlationPercent !== null && (
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400 font-medium">{correlationPercent}%</span>
                </div>
              )}
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{companyName}</h4>
            {sector && (
              <span className="text-xs text-gray-400">{sector}</span>
            )}
          </div>
        </div>
        
        {/* Expand/Collapse Icon */}
        <button className="p-1 hover:bg-gray-800 rounded transition-colors">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      
      {/* Quick Stats Row */}
      <div className="flex items-center gap-4 text-xs mt-3">
        {potentialReturn && potentialReturn !== 'N/A' && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-semibold">{potentialReturn}</span>
          </div>
        )}
        {timeframe && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">{timeframe}</span>
          </div>
        )}
        {riskLevel && (
          <div className={`px-2 py-0.5 rounded ${
            riskLevel === 'low' ? 'bg-green-900/30 text-green-400' :
            riskLevel === 'high' ? 'bg-red-900/30 text-red-400' :
            'bg-yellow-900/30 text-yellow-400'
          }`}>
            {riskLevel.toUpperCase()} RISK
          </div>
        )}
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          {/* Why this stock? (Correlation Reasoning) */}
          {enhanced?.correlation.reasoning && (
            <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <h5 className="text-xs font-semibold text-cyan-400 uppercase">Why This Stock?</h5>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {enhanced.correlation.reasoning}
              </p>
            </div>
          )}
          
          {/* Historical Data */}
          {enhanced?.correlation.historicalData && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900/30 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">Similar Events</div>
                <div className="text-sm font-semibold text-white">
                  {enhanced.correlation.historicalData.similarEventsCount} times
                </div>
              </div>
              <div className="bg-gray-900/30 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">Avg Impact</div>
                <div className="text-sm font-semibold text-green-400">
                  {enhanced.correlation.historicalData.avgPriceImpact}
                </div>
              </div>
            </div>
          )}
          
          {/* Trading Strategy */}
          {enhanced?.strategy && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase">Trading Strategy</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Entry:</span>
                  <span className="ml-2 text-white font-mono">${enhanced.strategy.suggestedEntry.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Exit:</span>
                  <span className="ml-2 text-green-400 font-mono">${enhanced.strategy.suggestedExit.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Stop-Loss:</span>
                  <span className="ml-2 text-red-400 font-mono">${enhanced.strategy.stopLoss.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current:</span>
                  <span className="ml-2 text-white font-mono">${enhanced.strategy.currentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Suggested Actions */}
          {enhanced?.suggestedActions && enhanced.suggestedActions.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">Action Plan</h5>
              <ul className="space-y-1">
                {enhanced.suggestedActions.map((action, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-400 mt-0.5">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Confidence Score */}
          {enhanced?.confidence && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all"
                  style={{ width: `${enhanced.confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{enhanced.confidence}% confidence</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
