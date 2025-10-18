// Feed system types

export interface Headline {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  description?: string;
  triageStatus: 'noise' | 'flagged' | 'analyzing' | 'analyzed';
  matchedAssets: string[];
  matchedKeywords: string[];
  confidence: number;
  aiScore?: number;
  aiReason?: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  category: 'general' | 'commodities' | 'geopolitical' | 'supply-chain';
}

export interface TriageResult {
  headline: Headline;
  flagged: boolean;
  confidence: number;
  matchedAssets: string[];
  matchedKeywords: string[];
}

export interface AITriageResult {
  score: number; // 0-10
  reason: string;
  relevant: boolean;
  assets: string[];
}

export interface ScanResult {
  totalHeadlines: number;
  flaggedCount: number;
  aiTriagedCount: number;
  signals: Headline[];
  timestamp: Date;
  costEstimate: number;
}
