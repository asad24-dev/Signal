'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableSummaryCardProps {
  assetName: string;
  summary: string;
}

export function ExpandableSummaryCard({ assetName, summary }: ExpandableSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if summary is long enough to need expansion
  const needsExpansion = summary.length > 150; // ~3 lines
  
  return (
    <button
      onClick={() => setIsExpanded(!isExpanded)}
      className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg p-4 text-left transition-all w-full"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">{assetName} Analysis</h3>
        {needsExpansion && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        )}
      </div>
      
      <p className={`text-sm text-gray-300 transition-all ${
        isExpanded ? '' : 'line-clamp-3'
      }`}>
        {summary}
      </p>
      
      {needsExpansion && !isExpanded && (
        <div className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
          <span>Click to read more</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      )}
    </button>
  );
}
