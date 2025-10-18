// Discovery Stream - Left sidebar with live headline feed

'use client';

import { useState, useEffect } from 'react';
import { Headline } from '@/lib/feeds/types';
import { Sparkles, AlertCircle, TrendingUp, Clock } from 'lucide-react';

interface DiscoveryStreamProps {
  onAnalyze?: (headline: Headline) => void;
  onBatchAnalyze?: (signals: any[]) => void;
}

export function DiscoveryStream({ onAnalyze, onBatchAnalyze }: DiscoveryStreamProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set());
  const [isLiveMode] = useState(true); // Always live mode
  const [newHeadlineIds, setNewHeadlineIds] = useState<Set<string>>(new Set());

  // Auto-refresh in live mode
  useEffect(() => {
    // Trigger immediate scan on mount
    triggerScan(false); // Show loading UI
    
    // Then auto-scan every 10 minutes (600 seconds)
    const interval = setInterval(() => {
      triggerScan(true); // Silent auto-scan
    }, 600000); // 10 minutes
    
    return () => clearInterval(interval);
  }, []); // Run once on mount

  // Poll for updates every 10 seconds
  useEffect(() => {
    fetchHeadlines();
    
    const interval = setInterval(() => {
      fetchHeadlines();
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchHeadlines = async () => {
    try {
      const response = await fetch('/api/feeds/stream');
      const data = await response.json();
      
      if (data.success) {
        const existingIds = new Set(headlines.map(h => h.id));
        const incoming = data.headlines || [];
        
        // Mark new headlines
        const newIds = new Set<string>(
          incoming
            .filter((h: Headline) => !existingIds.has(h.id))
            .map((h: Headline) => h.id)
        );
        
        if (newIds.size > 0) {
          setNewHeadlineIds(newIds);
          // Clear "NEW" badge after 10 seconds
          setTimeout(() => setNewHeadlineIds(new Set()), 10000);
        }
        
        // Flash signals
        const signalIds = incoming
          .filter((h: Headline) => h.triageStatus === 'flagged' && newIds.has(h.id))
          .map((h: Headline) => h.id);
        
        if (signalIds.length > 0) {
          setFlashingIds(new Set(signalIds));
          setTimeout(() => setFlashingIds(new Set()), 3000);
        }
        
        // Sort: chronological (newest first) in live mode, by confidence otherwise
        const sorted = isLiveMode
          ? [...incoming].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
          : [...incoming].sort((a, b) => b.confidence - a.confidence);
        
        setHeadlines(sorted);
        if (data.lastScan) {
          setLastScan(new Date(data.lastScan));
        }
      }
    } catch (error) {
      console.error('Failed to fetch headlines:', error);
    }
  };

  const triggerScan = async (silent = false) => {
    if (!silent) setIsScanning(true);
    
    const scanParams = {
      mode: 'auto', // Try real RSS first, fallback to mock
      enableAI: false, // Start with just keyword triage
      usePerplexity: isLiveMode // Use Perplexity discovery in live mode
    };
    
    console.log('🔍 [CLIENT] Triggering scan with params:', scanParams);
    
    try {
      const response = await fetch('/api/feeds/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanParams)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setHeadlines(data.headlines);
        setLastScan(new Date());
        
        // Flash signals
        const signalIds = data.signals.map((s: Headline) => s.id);
        setFlashingIds(new Set(signalIds));
        setTimeout(() => setFlashingIds(new Set()), 3000);
        
        // Show success message if Perplexity was used
        if (isLiveMode && data.scan?.perplexityCount > 0) {
          console.log(`✨ Perplexity discovered ${data.scan.perplexityCount} new signals`);
        }
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const triggerBatchAnalysis = async () => {
    const flaggedHeadlines = headlines.filter(h => h.triageStatus === 'flagged');
    
    if (flaggedHeadlines.length === 0) {
      console.log('⚠️ No flagged headlines to analyze');
      return;
    }
    
    setIsBatchAnalyzing(true);
    
    try {
      console.log(`🎯 [CLIENT] Triggering batch analysis for ${flaggedHeadlines.length} headlines`);
      
      const response = await fetch('/api/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlines: flaggedHeadlines })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Batch analysis complete! Updated ${data.signals.length} assets`);
        console.log('📊 Signals:', data.signals);
        
        // Notify parent component about ALL signals at once
        if (onBatchAnalyze && data.signals.length > 0) {
          onBatchAnalyze(data.signals);
          console.log('🎉 All assets updated with batch analysis via onBatchAnalyze!');
        } else {
          console.warn('⚠️ No onBatchAnalyze callback provided or no signals returned');
        }
        
        // Mark headlines as analyzed
        setHeadlines(prev => 
          prev.map(h => 
            flaggedHeadlines.some(fh => fh.id === h.id)
              ? { ...h, triageStatus: 'analyzed' as const }
              : h
          )
        );
      }
    } catch (error) {
      console.error('❌ Batch analysis failed:', error);
    } finally {
      setIsBatchAnalyzing(false);
    }
  };

  const signalsCount = headlines.filter(h => h.triageStatus === 'flagged').length;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Discovery Stream
          </h2>
          <div className="flex items-center gap-2">
            {lastScan && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(lastScan)}
              </span>
            )}
            <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          </div>
        </div>
        
        {/* Perplexity Discovery Status */}
        {!isScanning && (
          <div className="mb-3 p-2 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs text-purple-300 font-medium">
                Perplexity Discovery Active
              </span>
            </div>
            <p className="text-xs text-purple-400/60 mt-1">
              AI-powered web search for breaking signals
            </p>
          </div>
        )}
        
        {/* Live Mode Loading State */}
        {isLiveMode && isScanning && (
          <div className="mb-3 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-purple-200 font-semibold">
                🔍 Searching the Web with AI
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mb-2">
              Perplexity is analyzing breaking signals across lithium, oil, and semiconductors...
            </p>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1 bg-purple-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-shimmer" 
                     style={{ width: '100%', animation: 'shimmer 2s infinite' }} />
              </div>
              <span className="text-xs text-purple-400">20-30s</span>
            </div>
          </div>
        )}
        
        {/* Batch Analysis Button */}
        {signalsCount > 0 && (
          <button
            onClick={triggerBatchAnalysis}
            disabled={isBatchAnalyzing}
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isBatchAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">
                  Analyzing {signalsCount} signals<span className="animate-pulse">...</span>
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>ANALYZE ALL {signalsCount} SIGNALS</span>
              </>
            )}
          </button>
        )}
        
        {/* Batch Analysis Loading State */}
        {isBatchAnalyzing && (
          <div className="mt-3 p-3 bg-gradient-to-br from-green-900/30 to-cyan-900/30 border border-green-500/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-green-200 font-semibold">
                🎯 Holistic Analysis in Progress
              </span>
            </div>
            <p className="text-xs text-green-300/80 mb-2">
              Perplexity is analyzing all signals together with cross-asset impact consideration...
            </p>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-1 bg-green-950 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 animate-shimmer" />
              </div>
              <span className="text-xs text-green-400">30-45s</span>
            </div>
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <span>{headlines.length} headlines</span>
          <span className="text-cyan-400 font-medium">{signalsCount} signals</span>
        </div>
      </div>

      {/* Headlines List */}
      <div className="flex-1 overflow-y-auto">
        {headlines.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No headlines yet</p>
            <p className="text-xs mt-1">Click "SCAN FEEDS NOW" to start</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {headlines.map((headline) => (
              <HeadlineCard
                key={headline.id}
                headline={headline}
                isFlashing={flashingIds.has(headline.id)}
                isNew={newHeadlineIds.has(headline.id)}
                onAnalyze={onAnalyze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface HeadlineItemProps {
  headline: Headline;
  isFlashing: boolean;
  isNew?: boolean;
  onAnalyze?: (headline: Headline) => void;
}

function HeadlineCard({ headline, isFlashing, isNew, onAnalyze }: HeadlineItemProps) {
  const isSignal = headline.triageStatus === 'flagged';
  const isPerplexity = headline.id.startsWith('perplexity-');
  
  return (
    <div
      className={`
        p-3 rounded-lg transition-all duration-300 cursor-pointer
        ${isSignal 
          ? 'bg-green-900/20 border-2 border-green-500/50 hover:border-green-500' 
          : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'}
        ${isFlashing ? 'animate-pulse ring-2 ring-green-500' : ''}
        ${isPerplexity ? 'ring-1 ring-purple-500/30' : ''}
      `}
    >
      {/* Signal Badge */}
      {isSignal && (
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            POTENTIAL SIGNAL
          </span>
          {headline.matchedAssets.length > 0 && (
            <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 text-xs font-medium rounded uppercase">
              {headline.matchedAssets[0]}
            </span>
          )}
          {isPerplexity && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
              ⚡ AI
            </span>
          )}
          {isNew && (
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded animate-pulse">
              NEW
            </span>
          )}
        </div>
      )}

      {/* Headline */}
      <h3 className={`text-sm font-medium mb-1 ${isSignal ? 'text-white' : 'text-gray-400'}`}>
        {headline.title}
      </h3>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs">
        <span className={isSignal ? 'text-gray-300' : 'text-gray-500'}>
          {headline.source}
        </span>
        <span className={isSignal ? 'text-gray-400' : 'text-gray-600'}>
          {formatTimeAgo(new Date(headline.publishedAt))}
        </span>
      </div>

      {/* Confidence & Keywords */}
      {isSignal && headline.confidence > 0 && (
        <div className="mt-2 pt-2 border-t border-green-900/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Confidence</span>
            <span className="text-xs font-bold text-green-400">
              {Math.round(headline.confidence * 100)}%
            </span>
          </div>
          {headline.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {headline.matchedKeywords.slice(0, 4).map((keyword, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-gray-800 text-gray-300 text-xs rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Individual analysis removed - use batch analysis instead */}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
