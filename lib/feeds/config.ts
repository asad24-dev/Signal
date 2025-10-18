// Feed system configuration

export const FEED_MODE = {
  AUTO_SCAN: 'auto-scan',    // Auto-refresh every 3 min
  MANUAL: 'manual',          // User clicks "SCAN NOW"
  MOCK: 'mock'               // Pre-seeded headlines only
} as const;

export const FEED_CONFIG = {
  // Current mode (change for demo vs dev)
  mode: FEED_MODE.MANUAL,
  
  scanning: {
    interval: 180,           // 3 minutes in seconds
    autoStart: false,        // Don't auto-start on page load (manual control)
    maxHeadlinesPerSource: 20,
    timeout: 10000           // 10s timeout per RSS fetch
  },
  
  triage: {
    method: 'hybrid',        // keyword-filter + AI
    aiModel: 'sonar',        // Fast, cheap Perplexity model
    maxAITriagePerScan: 10,  // Only top 10 to Perplexity API
    confidenceThreshold: 0.75,
    keywordMatchBoost: 0.3   // Boost score if multiple keywords match
  },
  
  analysis: {
    model: 'sonar-pro',      // Deep analysis model
    trigger: 'user-click',   // Only when user clicks "ANALYZE THIS"
    maxConcurrent: 1,        // One deep analysis at a time
    timeout: 120000          // 2 minute timeout
  },
  
  costs: {
    triageCostPerHeadline: 0.0008,  // ~150 tokens at $0.005/1K tokens
    analysisCostPerRequest: 0.035,   // Sonar Pro estimate
    estimatedCostPerScan: 0.008,     // 10 headlines triaged
    estimatedCostPerHour: 0.16       // 20 scans/hour
  }
};

// RSS Feed Sources
export const RSS_SOURCES = [
  {
    id: 'reuters-world',
    name: 'Reuters World News',
    url: 'https://www.reuters.com/rssfeed/worldNews',
    enabled: true,
    category: 'general' as const
  },
  {
    id: 'al-jazeera',
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    enabled: true,
    category: 'geopolitical' as const
  },
  {
    id: 'ft-world',
    name: 'Financial Times World',
    url: 'https://www.ft.com/world?format=rss',
    enabled: true,
    category: 'general' as const
  },
  {
    id: 'mining-com',
    name: 'Mining.com',
    url: 'https://www.mining.com/feed/',
    enabled: true,
    category: 'commodities' as const
  },
  {
    id: 'offshore-technology',
    name: 'Offshore Technology',
    url: 'https://www.offshore-technology.com/feed/',
    enabled: true,
    category: 'commodities' as const
  },
  {
    id: 'semiconductor-engineering',
    name: 'Semiconductor Engineering',
    url: 'https://semiengineering.com/feed/',
    enabled: true,
    category: 'commodities' as const
  },
  {
    id: 'supply-chain-dive',
    name: 'Supply Chain Dive',
    url: 'https://www.supplychaindive.com/feeds/news/',
    enabled: true,
    category: 'supply-chain' as const
  },
  {
    id: 'freightwaves',
    name: 'FreightWaves',
    url: 'https://www.freightwaves.com/feed',
    enabled: true,
    category: 'supply-chain' as const
  },
  {
    id: 'joc',
    name: 'JOC.com',
    url: 'https://www.joc.com/rss/all/feed.xml',
    enabled: true,
    category: 'supply-chain' as const
  },
  {
    id: 'hellenic-shipping',
    name: 'Hellenic Shipping News',
    url: 'https://www.hellenicshippingnews.com/feed/',
    enabled: true,
    category: 'supply-chain' as const
  }
];

// Smart keyword patterns for 90% noise reduction
export const KEYWORD_PATTERNS = {
  lithium: {
    primary: ['lithium', 'li-ion', 'battery metal', 'sqm', 'albemarle', 'pilbara', 'livent'],
    locations: ['chile', 'atacama', 'argentina', 'australia', 'nevada', 'salar'],
    events: ['strike', 'protest', 'disruption', 'halt', 'shutdown', 'closure', 'suspend', 'drought'],
    companies: ['sqm', 'albemarle', 'pilbara', 'livent', 'ganfeng', 'tianqi']
  },
  oil: {
    primary: ['opec', 'crude', 'barrel', 'petroleum', 'wti', 'brent', 'oil price'],
    locations: ['hormuz', 'saudi', 'iran', 'russia', 'uae', 'iraq', 'venezuela', 'strait'],
    events: ['cut', 'sanction', 'embargo', 'attack', 'pipeline', 'tanker', 'spill', 'quota'],
    companies: ['aramco', 'exxon', 'chevron', 'bp', 'shell', 'total', 'rosneft']
  },
  semiconductors: {
    primary: ['tsmc', 'semiconductor', 'chip', 'wafer', 'foundry', 'fab', 'asml'],
    locations: ['taiwan', 'china', 'korea', 'arizona', 'netherlands', 'japan'],
    events: ['shortage', 'export', 'restriction', 'ban', 'subsidy', 'tariff', 'earthquake'],
    companies: ['tsmc', 'samsung', 'intel', 'asml', 'nvidia', 'amd', 'qualcomm']
  }
};
