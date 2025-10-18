// Main Dashboard Page

'use client';

import { useState, useEffect } from 'react';
import { Activity, Sparkles } from 'lucide-react';
import { DiscoveryStream } from '@/components/DiscoveryStream';
import { RiskGauge } from '@/components/RiskGauge';
import { AssetSelector } from '@/components/AssetSelector';
import { ImpactCascade } from '@/components/ImpactCascade';
import { AnalysisModal } from '@/components/AnalysisModal';
import { Headline } from '@/lib/feeds/types';
import { Asset, ImpactAnalysis } from '@/types';

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('lithium');
  const [currentAnalysis, setCurrentAnalysis] = useState<ImpactAnalysis | null>(null);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          <p className="text-gray-400">Loading Signal...</p>
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SIGNAL</h1>
              <p className="text-xs text-gray-400">AI Geopolitical Risk Arbiter</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleInjectDemo}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              INJECT EVENT
            </button>
            
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Discovery Stream */}
        <div className="w-80 flex-shrink-0">
          <DiscoveryStream onAnalyze={handleAnalyzeHeadline} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Asset Selector */}
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-4">SELECT ASSET</h2>
              <AssetSelector
                assets={assets}
                selectedAssetId={selectedAssetId}
                onSelect={setSelectedAssetId}
              />
            </div>

            {/* Risk Gauge - Hero Element */}
            {selectedAsset && (
              <div className="flex justify-center py-8">
                <RiskGauge
                  score={selectedAsset.currentRiskScore}
                  label={`${selectedAsset.name} Risk Score`}
                  size="lg"
                  animated={true}
                />
              </div>
            )}

            {/* Impact Cascade */}
            {currentAnalysis && (
              <div className="mt-8">
                <ImpactCascade analysis={currentAnalysis} animated={true} />
              </div>
            )}

            {/* Empty State */}
            {!currentAnalysis && (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">No Analysis Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Click "SCAN FEEDS NOW" in the Discovery Stream to find signals,
                  or click "INJECT EVENT" to run the demo scenario.
                </p>
              </div>
            )}
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

