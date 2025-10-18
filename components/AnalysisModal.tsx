// Analysis Modal - Confirmation, loading stages, and results display

'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { Headline } from '@/lib/feeds/types';

interface AnalysisModalProps {
  headline: Headline | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (headline: Headline) => Promise<void>;
}

export function AnalysisModal({ headline, isOpen, onClose, onConfirm }: AnalysisModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    { name: 'Initializing Analysis', duration: 5 },
    { name: 'Searching Global Sources', duration: 20 },
    { name: 'Analyzing Supply Chain Impacts', duration: 25 },
    { name: 'Calculating Risk Scores', duration: 20 },
    { name: 'Identifying Trading Opportunities', duration: 15 },
    { name: 'Generating Citations', duration: 10 }
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(0);
      setProgress(0);
      return;
    }

    let elapsed = 0;
    const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0);

    const interval = setInterval(() => {
      elapsed += 0.5; // Update every 500ms
      const newProgress = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(newProgress);

      // Determine current stage
      let cumulativeDuration = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration;
        if (elapsed < cumulativeDuration) {
          setCurrentStage(i);
          break;
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleConfirm = async () => {
    if (!headline) return;

    setIsAnalyzing(true);
    try {
      await onConfirm(headline);
      setProgress(100);
      setCurrentStage(stages.length - 1);
      setTimeout(() => {
        onClose();
        setIsAnalyzing(false);
      }, 1000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  if (!isOpen || !headline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121827] border-2 border-cyan-500/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            {isAnalyzing ? 'Running Deep Analysis' : 'Confirm Analysis'}
          </h2>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!isAnalyzing ? (
            /* Confirmation View */
            <div className="space-y-6">
              {/* Headline */}
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{headline.title}</h3>
                    <p className="text-sm text-gray-400">{headline.source}</p>
                  </div>
                </div>
                {headline.matchedAssets.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {headline.matchedAssets.map((asset, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-cyan-900/30 text-cyan-300 text-sm font-medium rounded uppercase"
                      >
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-400 mb-1">This will use 1 analysis credit</h4>
                    <p className="text-sm text-gray-400">
                      Deep analysis uses Perplexity Pro Search to scan thousands of sources.
                      This typically takes 60-90 seconds and costs approximately $0.035.
                    </p>
                  </div>
                </div>
              </div>

              {/* Expected Output */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Analysis will include:</h4>
                <ul className="space-y-2">
                  {[
                    'Multi-tier impact cascade (Primary, First-Order, Second-Order)',
                    'Risk score calculation across 5 components',
                    'Identified trading opportunities',
                    'Real-time citations from global sources',
                    'Supply chain disruption assessment'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Run Analysis
                </button>
              </div>
            </div>
          ) : (
            /* Loading View */
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-red-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-gradient-to-r from-red-500 to-red-700 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Stages */}
              <div className="space-y-3">
                {stages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                      ${idx === currentStage 
                        ? 'bg-cyan-900/20 border border-cyan-500/30' 
                        : idx < currentStage 
                        ? 'bg-gray-900/50 border border-gray-800' 
                        : 'bg-gray-900/20 border border-gray-800/50 opacity-50'}
                    `}
                  >
                    {idx < currentStage ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : idx === currentStage ? (
                      <Loader2 className="w-5 h-5 text-cyan-400 flex-shrink-0 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-700 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        idx === currentStage 
                          ? 'text-white' 
                          : idx < currentStage 
                          ? 'text-gray-400' 
                          : 'text-gray-600'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Live Updates */}
              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="text-xs text-gray-500 mb-2">LIVE STATUS</div>
                <p className="text-sm text-gray-300">
                  {currentStage < stages.length ? stages[currentStage].name : 'Finalizing...'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
