// Core type definitions for Signal

export type AssetType = 'commodity' | 'stock' | 'currency' | 'crypto';
export type AssetCategory = 'energy' | 'metals' | 'agriculture' | 'technology' | 'finance';
export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'critical';
export type ImpactOrder = 'primary' | 'first' | 'second' | 'third';
export type EventType =
  | 'strike'
  | 'natural_disaster'
  | 'political_unrest'
  | 'regulation'
  | 'trade_policy'
  | 'conflict'
  | 'technology_disruption'
  | 'market_movement';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  category: AssetCategory;
  description: string;
  currentRiskScore: number;
  riskLevel: RiskLevel;
  lastUpdated: Date;

  monitoringConfig: {
    regions: string[];
    keywords: string[];
    relatedCompanies: Company[];
    sources: string[];
  };

  supplyChain: {
    topProducers: Producer[];
    topConsumers: Consumer[];
    criticalNodes: CriticalNode[];
  };
}

export interface Producer {
  name: string;
  country: string;
  globalShare: number;
  coordinates: [number, number];
}

export interface Consumer {
  name: string;
  country: string;
  demand: number;
}

export interface CriticalNode {
  name: string;
  type: 'port' | 'refinery' | 'mine' | 'processing_plant';
  location: string;
  importance: number;
}

export interface Company {
  name: string;
  symbol: string;
  exposure: number;
  relationship: 'supplier' | 'consumer' | 'producer' | 'competitor';
}

export interface RiskSignal {
  id: string;
  assetId: string;
  timestamp: Date;

  riskScore: number;
  riskLevel: RiskLevel;
  previousRiskScore: number;
  riskChange: number;

  event: Event;
  analysis: ImpactAnalysis;
  
  locations?: Array<{
    id?: string;
    name: string;
    country: string;
    region?: string;
    coordinates: [number, number];
    type: 'mine' | 'refinery' | 'port' | 'processing_plant' | 'general';
    asset: 'lithium' | 'oil' | 'semiconductors';
    riskLevel: 'low' | 'moderate' | 'elevated' | 'critical';
    importance: number;
    description?: string;
  }>;

  confidence: number;
  severity: number;
  urgency: number;
  status: 'active' | 'monitoring' | 'resolved';
}

export interface Event {
  title: string;
  description: string;
  source: NewsSource;
  location: Location;
  eventType: EventType;
  detectedAt: Date;
}

export interface NewsSource {
  name: string;
  url: string;
  snippet: string;
  publishedAt: Date;
  credibility: number;
}

export interface Location {
  country: string;
  region?: string;
  coordinates: [number, number];
}

export interface ImpactAnalysis {
  summary: string;
  impacts: Impact[];
  opportunities: Opportunity[];
  citations: Citation[];
  reasoningSteps?: ReasoningStep[];
}

export interface Impact {
  order: ImpactOrder;
  description: string;
  magnitude: number;
  timeframe: string;
  affectedEntities: AffectedEntity[];
  confidence: number;
  citations: Citation[];
}

export interface AffectedEntity {
  type: 'company' | 'country' | 'commodity' | 'market';
  name: string;
  symbol?: string;
  impactDescription: string;
  impactMagnitude: number;
}

export interface Opportunity {
  type: 'long' | 'short' | 'arbitrage' | 'hedge';
  description: string;
  suggestedActions: string[];
  potentialReturn: number;
  riskLevel: RiskLevel;
  timeframe: string;
  citations: Citation[];
  company?: {
    name: string;
    ticker: string;
    sector?: string;
    currentPrice?: number;
  };
  confidence?: number;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  source: string;
  snippet: string;
  date?: string;
  relevance: number;
}

export interface ReasoningStep {
  thought: string;
  type: 'web_search' | 'fetch_url_content' | 'execute_python';
  data?: any;
}

export interface RiskScore {
  value: number;
  level: RiskLevel;
  components: RiskComponent[];
  calculatedAt: Date;
}

export interface RiskComponent {
  factor: string;
  weight: number;
  score: number;
  description: string;
}

export interface RiskHistory {
  assetId: string;
  dataPoints: RiskDataPoint[];
}

export interface RiskDataPoint {
  timestamp: Date;
  riskScore: number;
  riskLevel: RiskLevel;
  event?: {
    title: string;
    type: EventType;
  };
}

// API Response types
export interface SignalsResponse {
  signals: RiskSignal[];
  total: number;
}

export interface AssetsResponse {
  assets: Asset[];
  total: number;
}

export interface SimulationResponse {
  simulation: {
    before: RiskScore;
    after: RiskScore;
    signal: RiskSignal;
    timeline: SimulationStep[];
  };
}

export interface SimulationStep {
  step: number;
  timestamp: number;
  description: string;
  type: 'event' | 'analysis' | 'impact' | 'opportunity';
  data: any;
}

// Demo scenarios
export interface DemoScenario {
  id: string;
  name: string;
  assetId: string;
  description: string;
  eventText: string;
  eventType: EventType;
  expectedRiskScore: number;
  preloadedAnalysis?: ImpactAnalysis;
}
