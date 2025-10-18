// Asset Selector - Clickable cards/tiles to focus on one asset

'use client';

import { useState } from 'react';
import { Battery, Droplet, Cpu, TrendingUp, AlertTriangle } from 'lucide-react';
import { Asset } from '@/types';

interface AssetSelectorProps {
  assets: Asset[];
  selectedAssetId?: string;
  onSelect: (assetId: string) => void;
}

export function AssetSelector({ assets, selectedAssetId, onSelect }: AssetSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={asset.id === selectedAssetId}
          onSelect={() => onSelect(asset.id)}
        />
      ))}
    </div>
  );
}

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: () => void;
}

function AssetCard({ asset, isSelected, onSelect }: AssetCardProps) {
  const Icon = getAssetIcon(asset.id);
  const level = getRiskLevel(asset.currentRiskScore);

  return (
    <button
      onClick={onSelect}
      className={`
        relative p-6 rounded-xl transition-all duration-300 text-left
        ${isSelected 
          ? 'bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105' 
          : 'bg-gray-900/50 border-2 border-gray-800 hover:border-gray-700 hover:bg-gray-900/70'}
      `}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
      )}

      {/* Icon & Name */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`
          p-3 rounded-lg
          ${isSelected ? 'bg-cyan-500/20' : 'bg-gray-800'}
        `}>
          <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
            {asset.name}
          </h3>
          <p className="text-xs text-gray-500">{asset.category}</p>
        </div>
      </div>

      {/* Risk Score */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${level.textColor}`}>
            {asset.currentRiskScore.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">/ 10</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${level.bgColor}`}>
          <AlertTriangle className={`w-3 h-3 ${level.textColor}`} />
          <span className={`text-xs font-medium ${level.textColor}`}>
            {level.name.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
        <div>
          <div className="text-xs text-gray-500 mb-1">Sources</div>
          <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
            {asset.monitoringConfig.sources.length}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Companies</div>
          <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
            {asset.monitoringConfig.relatedCompanies.length}
          </div>
        </div>
      </div>

      {/* Top Regions */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-2">Top Producers</div>
        <div className="flex flex-wrap gap-1">
          {asset.supplyChain.topProducers.slice(0, 3).map((producer, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 text-xs rounded ${
                isSelected 
                  ? 'bg-cyan-900/30 text-cyan-300' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {producer.country}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Effect */}
      {!isSelected && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-blue-500/0 hover:from-cyan-500/5 hover:to-blue-500/5 transition-all duration-300" />
      )}
    </button>
  );
}

function getAssetIcon(assetId: string) {
  switch (assetId) {
    case 'lithium':
      return Battery;
    case 'oil':
      return Droplet;
    case 'semiconductors':
      return Cpu;
    default:
      return TrendingUp;
  }
}

function getRiskLevel(score: number) {
  if (score < 3) {
    return {
      name: 'Low',
      bgColor: 'bg-green-900/30',
      textColor: 'text-green-400'
    };
  } else if (score < 5) {
    return {
      name: 'Moderate',
      bgColor: 'bg-yellow-900/30',
      textColor: 'text-yellow-400'
    };
  } else if (score < 7) {
    return {
      name: 'Elevated',
      bgColor: 'bg-orange-900/30',
      textColor: 'text-orange-400'
    };
  } else {
    return {
      name: 'Critical',
      bgColor: 'bg-red-900/30',
      textColor: 'text-red-400'
    };
  }
}
