// Enhanced types for intelligent stock discovery and correlation analysis

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: string;
  volume: number;
  marketCap?: string;
  sector?: string;
}

export interface StockCorrelation {
  symbol: string;
  strength: number; // FIXED: Added strength property (0-1 correlation)
  reasoning: string; // AI explanation of why this stock is affected
  historicalData: {
    similarEventsCount: number;
    avgPriceImpact: string; // e.g., "+12.5% over 2 weeks"
    lastOccurrence?: string; // e.g., "March 2024"
  };
  priceData: {
    current: number;
    change24h: number;
    changePercent: string;
    volume: number;
  };
}

export interface EnhancedTradingOpportunity {
  // Basic info
  type: 'long' | 'short' | 'hedge' | 'arbitrage';
  
  // Company information
  company: {
    name: string;
    ticker: string;
    sector: string;
    marketCap?: string;
  };
  
  // AI-powered correlation analysis
  correlation: StockCorrelation;
  
  // Trading strategy
  strategy: {
    currentPrice: number;
    suggestedEntry: number;
    suggestedExit: number;
    stopLoss: number;
    potentialReturn: string; // e.g., "+15-20%"
    timeframe: string; // e.g., "2-4 weeks"
    riskLevel: 'low' | 'medium' | 'high';
  };
  
  // Actionable insights
  suggestedActions: string[];
  
  // Evidence
  sources: string[];
  confidence: number; // 0-100
}

export interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface StockDiscoveryRequest {
  asset: 'lithium' | 'oil' | 'semiconductors';
  eventDescription: string;
  headlines: string[];
  currentRiskScore: number;
}

export interface StockDiscoveryResponse {
  opportunities: EnhancedTradingOpportunity[];
  summary: string;
  assetImpact: {
    riskScore: number;
    reasoning: string;
  };
}

export interface ExtractedLocation {
  id: string;
  name: string;
  country: string;
  region?: string;
  coordinates: [number, number]; // [latitude, longitude]
  type: 'mine' | 'refinery' | 'port' | 'processing_plant' | 'general';
  asset: 'lithium' | 'oil' | 'semiconductors';
  riskLevel: 'low' | 'moderate' | 'elevated' | 'critical';
  importance: number; // 0-1
  description?: string;
}
