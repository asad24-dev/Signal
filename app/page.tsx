// Main Dashboard Page

'use client';

import { useState, useEffect } from 'react';
import { Activity, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscoveryStream } from '@/components/DiscoveryStream';
import { RiskGauge } from '@/components/RiskGauge';
import { AssetSelector } from '@/components/AssetSelector';
import { ImpactCascade } from '@/components/ImpactCascade';
import { AnalysisModal } from '@/components/AnalysisModal';
import { TimelineChart } from '@/components/TimelineChart';
import { TradingOpportunities } from '@/components/TradingOpportunities';
import { GlobalRiskMap, SAMPLE_LOCATIONS } from '@/components/GlobalRiskMap';
import { ExpandableSummaryCard } from '@/components/ExpandableSummaryCard';
import { Headline } from '@/lib/feeds/types';
import { Asset, ImpactAnalysis } from '@/types';
import { ExtractedLocation } from '@/types/finance';

interface TimelineDataPoint {
  timestamp: Date;
  riskScore: number;
  event?: {
    title: string;
    type: string;
  };
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('lithium');
  const [currentAnalysis, setCurrentAnalysis] = useState<ImpactAnalysis | null>(null);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  
  // Timeline data for each asset
  const [timelineData, setTimelineData] = useState<{
    lithium: TimelineDataPoint[];
    oil: TimelineDataPoint[];
    semiconductors: TimelineDataPoint[];
  }>({
    lithium: [],
    oil: [],
    semiconductors: []
  });
  
  // Store asset-specific analysis summaries
  const [assetSummaries, setAssetSummaries] = useState<{
    lithium?: string;
    oil?: string;
    semiconductors?: string;
  }>({});
  
  // Store extracted locations from AI analysis
  const [extractedLocations, setExtractedLocations] = useState<ExtractedLocation[]>([]);

  // Sidebar resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 250 && newWidth <= 600) { // Min 250px, Max 600px
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Double-click to collapse/expand
  const handleDoubleClick = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Load timeline data from localStorage on mount
  useEffect(() => {
    const savedTimeline = localStorage.getItem('foresight_timeline_data');
    if (savedTimeline) {
      try {
        const parsed = JSON.parse(savedTimeline);
        // Convert timestamp strings back to Date objects
        Object.keys(parsed).forEach(key => {
          parsed[key] = parsed[key].map((point: any) => ({
            ...point,
            timestamp: new Date(point.timestamp)
          }));
        });
        setTimelineData(parsed);
      } catch (error) {
        console.error('Failed to load timeline data:', error);
      }
    }
  }, []);

  // Save timeline data to localStorage whenever it changes
  useEffect(() => {
    if (timelineData.lithium.length > 0 || timelineData.oil.length > 0 || timelineData.semiconductors.length > 0) {
      localStorage.setItem('foresight_timeline_data', JSON.stringify(timelineData));
    }
  }, [timelineData]);

  // Fetch assets on mount
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      if (data.success) {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const handleAnalyzeHeadline = (headline: Headline) => {
    setSelectedHeadline(headline);
    setIsModalOpen(true);
  };

  // Handler for batch analysis results (called by DiscoveryStream)
  const handleBatchAnalysisResult = (signals: any[]) => {
    console.log('📊 [PAGE] Processing batch analysis results:', signals.length, 'signals');
    console.log('📊 [PAGE] Signals data:', JSON.stringify(signals, null, 2));
    console.log('📊 [PAGE] Current assets:', assets.map(a => ({ id: a.id, score: a.currentRiskScore })));
    
    // Extract locations from analysis if available
    if (signals.length > 0 && signals[0].locations) {
      console.log('📍 [PAGE] Extracting locations from AI analysis:', signals[0].locations.length);
      setExtractedLocations(signals[0].locations);
    }
    
    // Update all affected assets at once
    const updatedAssets = [...assets];
    const timelineUpdates: any = { ...timelineData };
    
    signals.forEach((signal, index) => {
      console.log(`🔄 [PAGE] Processing signal ${index + 1}:`, {
        assetId: signal.assetId,
        riskScore: signal.riskScore,
        riskLevel: signal.riskLevel,
        hasAnalysis: !!signal.analysis
      });
      
      const assetIndex = updatedAssets.findIndex(a => a.id === signal.assetId);
      console.log(`🔍 [PAGE] Asset index for ${signal.assetId}:`, assetIndex);
      
      if (assetIndex !== -1) {
        console.log(`✅ [PAGE] Updating ${signal.assetId}: ${updatedAssets[assetIndex].currentRiskScore} → ${signal.riskScore}`);
        updatedAssets[assetIndex] = {
          ...updatedAssets[assetIndex],
          currentRiskScore: signal.riskScore,
          riskLevel: signal.riskLevel
        };
        
        // Add to timeline
        const assetKey = signal.assetId as 'lithium' | 'oil' | 'semiconductors';
        if (assetKey in timelineUpdates) {
          timelineUpdates[assetKey] = [
            ...timelineUpdates[assetKey],
            {
              timestamp: new Date(),
              riskScore: signal.riskScore,
              event: {
                title: signal.event.title,
                type: signal.event.eventType
              }
            }
          ];
          console.log(`📈 [PAGE] Added timeline point for ${assetKey}:`, signal.riskScore);
        }
      } else {
        console.warn(`⚠️ [PAGE] Asset not found:`, signal.assetId);
      }
    });
    
    console.log('🔄 [PAGE] Setting updated assets:', updatedAssets.map(a => ({ id: a.id, score: a.currentRiskScore })));
    setAssets(updatedAssets);
    setTimelineData(timelineUpdates);
    
    // Store asset summaries
    const summaries: any = {};
    signals.forEach((signal) => {
      const assetKey = signal.assetId as 'lithium' | 'oil' | 'semiconductors';
      if (assetKey in summaries || assetKey === 'lithium' || assetKey === 'oil' || assetKey === 'semiconductors') {
        summaries[assetKey] = signal.analysis?.summary || signal.event?.description || 'Analysis completed';
      }
    });
    setAssetSummaries(summaries);
    console.log('📝 [PAGE] Asset summaries:', summaries);
    
    // Set the first signal as current analysis (to show opportunities)
    if (signals.length > 0) {
      console.log('📊 [PAGE] Setting current analysis to first signal:', signals[0].assetId);
      setCurrentAnalysis(signals[0].analysis);
    }
  };

  const handleConfirmAnalysis = async (headline: Headline) => {
    try {
      // Use the headline's matched asset (first one if multiple)
      const targetAssetId = headline.matchedAssets[0] || selectedAssetId;
      
      console.log('🎯 Analyzing headline for asset:', targetAssetId, '(matched:', headline.matchedAssets, ')');
      
      // Trigger live Perplexity analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: targetAssetId,
          eventText: headline.title + '. ' + (headline.description || '')
        })
      });

      const data = await response.json();

      console.log('📊 Analysis response:', {
        success: data.success,
        assetId: data.signal?.assetId,
        before: data.before?.value,
        after: data.after?.value,
        change: data.after?.value - data.before?.value
      });

      if (data.success && data.signal) {
        const { signal, after } = data;
        setCurrentAnalysis(signal);
        
        // Update the CORRECT asset (from signal.assetId, not selectedAssetId)
        const updatedAssets = assets.map(asset =>
          asset.id === signal.assetId
            ? { ...asset, currentRiskScore: after.value, riskLevel: after.level }
            : asset
        );
        setAssets(updatedAssets);
        
        // Add to timeline data
        const assetKey = signal.assetId as 'lithium' | 'oil' | 'semiconductors';
        if (assetKey in timelineData) {
          setTimelineData(prev => ({
            ...prev,
            [assetKey]: [
              ...prev[assetKey],
              {
                timestamp: new Date(),
                riskScore: after.value,
                event: {
                  title: signal.event.title,
                  type: signal.event.eventType
                }
              }
            ]
          }));
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  };

  const handleInjectDemo = async () => {
    try {
      setIsLoading(true);
      
      // Inject curated Chilean lithium strike scenario
      const response = await fetch('/api/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: 'lithium-chile-strike'
        })
      });

      const data = await response.json();

      if (data.success && data.simulation) {
        const { signal, after } = data.simulation;
        setCurrentAnalysis(signal);
        setSelectedAssetId('lithium');
        
        // Update lithium to the calculated risk score
        const updatedAssets = assets.map(asset =>
          asset.id === 'lithium'
            ? { ...asset, currentRiskScore: after.value, riskLevel: after.level }
            : asset
        );
        setAssets(updatedAssets);
        
        // Add to timeline data
        setTimelineData(prev => ({
          ...prev,
          lithium: [
            ...prev.lithium,
            {
              timestamp: new Date(),
              riskScore: after.value,
              event: {
                title: signal.event.title,
                type: signal.event.eventType
              }
            }
          ]
        }));
      }
    } catch (error) {
      console.error('Demo injection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading ForeSight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080a12] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-[#0d1018]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ForeSight Logo */}
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="ForeSight Logo" 
                className="w-16 h-16"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FORESIGHT</h1>
              <p className="text-xs text-gray-400">AI Geopolitical Risk Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Left Sidebar - Discovery Stream - Resizable */}
        <div 
          className={`flex-shrink-0 ${isSidebarCollapsed ? 'w-0 overflow-hidden' : ''} ${isResizing ? '' : 'transition-all duration-300'}`}
          style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
        >
          <DiscoveryStream 
            onAnalyze={handleAnalyzeHeadline}
            onBatchAnalyze={handleBatchAnalysisResult}
          />
        </div>
        
        {/* Resize Handle & Double-Click Border */}
        {!isSidebarCollapsed && (
          <div
            className="w-1 bg-gray-800 hover:bg-cyan-500 cursor-col-resize relative group transition-colors"
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
          >
            {/* Hover indicator */}
            <div className="absolute inset-0 w-4 -left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-full h-full bg-cyan-500/20" />
            </div>
          </div>
        )}
        
        {/* Collapsed State - Small Expand Button */}
        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-16 bg-gray-800 hover:bg-cyan-600 border-r border-gray-700 hover:border-cyan-500 rounded-r flex items-center justify-center transition-all duration-300 group z-50"
          >
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
          </button>
        )}

        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300`}>
          <div className="p-6 space-y-6">
            {/* Asset Selector */}
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-4">SELECT ASSET</h2>
              <AssetSelector
                assets={assets}
                selectedAssetId={selectedAssetId}
                onSelect={setSelectedAssetId}
              />
              
              {/* Asset Analysis Summaries */}
              {(assetSummaries.lithium || assetSummaries.oil || assetSummaries.semiconductors) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {assets.map((asset) => {
                    const assetKey = asset.id as 'lithium' | 'oil' | 'semiconductors';
                    const summary = assetSummaries[assetKey];
                    if (!summary) return null;
                    
                    return (
                      <ExpandableSummaryCard
                        key={asset.id}
                        assetName={asset.name}
                        summary={summary}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Map and Risk Gauge Side by Side */}
            {selectedAsset && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Global Risk Map - 2/3 width */}
                <div className="lg:col-span-2">
                  <h2 className="text-sm font-medium text-gray-400 mb-4">GLOBAL SUPPLY CHAIN</h2>
                  <GlobalRiskMap
                    locations={extractedLocations.length > 0 ? extractedLocations : SAMPLE_LOCATIONS}
                    selectedAsset={selectedAssetId}
                  />
                  {extractedLocations.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Showing {extractedLocations.length} location{extractedLocations.length > 1 ? 's' : ''} extracted from news analysis
                    </p>
                  )}
                  {extractedLocations.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ℹ️ Run batch analysis to extract real locations from news
                    </p>
                  )}
                </div>

                {/* Risk Gauge - 1/3 width, centered */}
                <div className="flex items-start justify-center pt-4">
                  <div className="scale-75">
                    <RiskGauge
                      score={selectedAsset.currentRiskScore}
                      label={`${selectedAsset.name} Risk Score`}
                      size="lg"
                      animated={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Impact Cascade */}
            {currentAnalysis && (
              <div className="mt-8">
                <ImpactCascade analysis={currentAnalysis} animated={true} />
              </div>
            )}

            {/* Trading Opportunities */}
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-4">TRADING OPPORTUNITIES</h2>
              <TradingOpportunities
                opportunities={currentAnalysis?.opportunities || []}
                assetName="Cross-Asset Analysis"
              />
            </div>

            {/* Timeline Charts - Show history for all 3 assets */}
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-4">RISK TIMELINE</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TimelineChart
                  assetId="lithium"
                  assetName="Lithium"
                  data={timelineData.lithium}
                  currentScore={assets.find(a => a.id === 'lithium')?.currentRiskScore || 0}
                  riskLevel={assets.find(a => a.id === 'lithium')?.riskLevel || 'low'}
                />
                <TimelineChart
                  assetId="oil"
                  assetName="Crude Oil"
                  data={timelineData.oil}
                  currentScore={assets.find(a => a.id === 'oil')?.currentRiskScore || 0}
                  riskLevel={assets.find(a => a.id === 'oil')?.riskLevel || 'low'}
                />
                <TimelineChart
                  assetId="semiconductors"
                  assetName="Semiconductors"
                  data={timelineData.semiconductors}
                  currentScore={assets.find(a => a.id === 'semiconductors')?.currentRiskScore || 0}
                  riskLevel={assets.find(a => a.id === 'semiconductors')?.riskLevel || 'low'}
                />
              </div>
            </div>

            {/* Empty State - Removed, AI discovery is always active */}
          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        headline={selectedHeadline}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHeadline(null);
        }}
        onConfirm={handleConfirmAnalysis}
      />
    </div>
  );
}

