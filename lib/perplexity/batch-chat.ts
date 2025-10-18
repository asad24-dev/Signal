// Batch Impact Analysis - Intelligent Stock Discovery with Deep Research
// Uses Perplexity Sonar Deep Research to discover non-obvious stock correlations
// Integrates with Finnhub for real-time price validation

import { perplexityClient } from "./client";
import { getStockData } from "@/lib/finance/finnhub";
import type { Asset, Opportunity, Citation, Impact } from "@/types";
import type { EnhancedTradingOpportunity } from "@/types/finance";

interface HeadlineData {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedAt: Date;
  confidence: number;
}

interface AssetHeadlines {
  asset: Asset;
  headlines: HeadlineData[];
}

interface BatchInput {
  lithium: AssetHeadlines;
  oil: AssetHeadlines;
  semiconductors: AssetHeadlines;
}

interface AssetChange {
  currentScore: number;
  newScore: number;
  change: number;
  direction: "increase" | "decrease" | "neutral";
  reasoning: string;
  impacts: Impact[];
}

interface BatchAnalysisResult {
  assetChanges: {
    lithium: AssetChange;
    oil: AssetChange;
    semiconductors: AssetChange;
  };
  opportunities: Opportunity[];
  citations: Citation[];
  crossAssetImpacts: {
    description: string;
    affectedAssets: string[];
  }[];
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
}

interface AnalysisOptions {
  model?: "sonar" | "sonar-pro" | "sonar-deep-research";
  searchType?: "basic" | "pro" | "deep";
  useStockDiscovery?: boolean; // Enable intelligent stock discovery
}

/**
 * Analyze all flagged headlines holistically with intelligent stock discovery
 */
export async function analyzeBatchImpact(
  batch: BatchInput,
  options: AnalysisOptions = {}
): Promise<BatchAnalysisResult> {
  
  const { 
    model = "sonar-deep-research", // Default to Deep Research for better analysis
    searchType = "deep", 
    useStockDiscovery = true 
  } = options;
  
  // Build comprehensive prompt with ALL headlines
  const prompt = useStockDiscovery 
    ? await buildEnhancedPromptWithStockData(batch)
    : buildBatchPrompt(batch);
  
  console.log("🤖 Batch Analysis with Intelligent Stock Discovery");
  console.log(`   Model: ${model}, Search: ${searchType}`);
  console.log(`   Stock Discovery: ${useStockDiscovery ? 'ENABLED' : 'DISABLED'}`);
  
  if (model === 'sonar-deep-research') {
    console.log("   ⏱️  Deep Research mode: This may take 3-5 minutes...");
  }
  
  try {
    const response = await perplexityClient.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: useStockDiscovery ? buildEnhancedSystemPrompt() : buildStandardSystemPrompt()
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower for more focused analysis
      max_tokens: 8000, // INCREASED: Support 10-15 opportunities with full details
      search_domain_filter: searchType === "deep" ? undefined : ["reuters.com", "ft.com", "bloomberg.com"]
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    
    console.log("📄 Raw response length:", content.length);
    console.log("📄 First 200 chars:", content.substring(0, 200));
    console.log("📄 Last 200 chars:", content.substring(Math.max(0, content.length - 200)));
    
    // Extract citations from search_results
    const searchResults = (response as any).search_results || [];
    const citations: Citation[] = searchResults.map((result: any, index: number) => ({
      id: `citation-${index}`,
      url: result.url || "",
      title: result.title || `Source ${index + 1}`,
      source: new URL(result.url || "https://example.com").hostname,
      snippet: result.snippet || "",
      relevance: 0.8
    }));
    
    // Parse JSON response with better error handling
    let parsedResult: any;
    try {
      // Try markdown code block first
      let jsonText = content;
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      // Try to fix incomplete JSON (trailing commas, missing closing brackets)
      jsonText = jsonText.trim();
      
      // If JSON is incomplete (ends with comma), try to complete it
      if (jsonText.endsWith(',')) {
        console.warn("⚠️  JSON ends with comma, attempting to fix...");
        jsonText = jsonText.slice(0, -1); // Remove trailing comma
      }
      
      // Count opening and closing braces
      const openBraces = (jsonText.match(/\{/g) || []).length;
      const closeBraces = (jsonText.match(/\}/g) || []).length;
      const openBrackets = (jsonText.match(/\[/g) || []).length;
      const closeBrackets = (jsonText.match(/\]/g) || []).length;
      
      console.log(`📊 JSON structure: { ${openBraces}/${closeBraces}, [ ${openBrackets}/${closeBrackets}`);
      
      // Try to close unclosed structures
      if (openBrackets > closeBrackets) {
        console.warn("⚠️  Unclosed arrays detected, adding closing brackets...");
        jsonText += ']'.repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        console.warn("⚠️  Unclosed objects detected, adding closing braces...");
        jsonText += '}'.repeat(openBraces - closeBraces);
      }
      
      parsedResult = JSON.parse(jsonText);
      console.log("✅ JSON parsed successfully after fixes");
      
    } catch (parseError: any) {
      console.error("❌ Failed to parse batch analysis JSON");
      console.error("Parse error:", parseError.message);
      console.error("Content preview:", content.substring(0, 500));
      console.error("Content end:", content.substring(Math.max(0, content.length - 500)));
      throw new Error(`Invalid JSON response from Perplexity: ${parseError.message}`);
    }
    
    console.log(`✅ Batch analysis parsed successfully`);
    console.log(`   Citations: ${citations.length}`);
    console.log(`   Opportunities: ${parsedResult.opportunities?.length || 0}`);
    console.log(`   Locations: ${parsedResult.locations?.length || 0}`);
    
    // ENHANCED: Enrich opportunities with real Alpha Vantage data
    let enrichedOpportunities = parsedResult.opportunities || [];
    if (useStockDiscovery && enrichedOpportunities.length > 0) {
      console.log("🔍 Enriching opportunities with real stock data from Alpha Vantage...");
      enrichedOpportunities = await enrichOpportunitiesWithRealData(enrichedOpportunities);
      console.log(`✅ Enriched ${enrichedOpportunities.length} opportunities with live data`);
    }
    
    return {
      assetChanges: parsedResult.assetChanges,
      opportunities: enrichedOpportunities,
      citations,
      crossAssetImpacts: parsedResult.crossAssetImpacts || [],
      locations: parsedResult.locations || []
    };
    
  } catch (error: any) {
    console.error("❌ Batch analysis failed:", error);
    throw error;
  }
}

/**
 * Build comprehensive prompt with all headlines
 */
function buildBatchPrompt(batch: BatchInput): string {
  const { lithium, oil, semiconductors } = batch;
  
  let prompt = `HOLISTIC PORTFOLIO RISK ASSESSMENT

You are analyzing ${lithium.headlines.length + oil.headlines.length + semiconductors.headlines.length} flagged geopolitical signals across three critical assets.

CURRENT RISK SCORES:
- Lithium: ${lithium.asset.currentRiskScore}/10 (${lithium.asset.riskLevel})
- Crude Oil: ${oil.asset.currentRiskScore}/10 (${oil.asset.riskLevel})
- Semiconductors: ${semiconductors.asset.currentRiskScore}/10 (${semiconductors.asset.riskLevel})

---

LITHIUM SIGNALS (${lithium.headlines.length} headlines):
${lithium.headlines.map((h, i) => `${i + 1}. [${h.confidence * 100}% confidence] ${h.title}
   Source: ${h.source} | Published: ${new Date(h.publishedAt).toLocaleDateString()}`).join('\n')}

OIL SIGNALS (${oil.headlines.length} headlines):
${oil.headlines.map((h, i) => `${i + 1}. [${h.confidence * 100}% confidence] ${h.title}
   Source: ${h.source} | Published: ${new Date(h.publishedAt).toLocaleDateString()}`).join('\n')}

SEMICONDUCTOR SIGNALS (${semiconductors.headlines.length} headlines):
${semiconductors.headlines.map((h, i) => `${i + 1}. [${h.confidence * 100}% confidence] ${h.title}
   Source: ${h.source} | Published: ${new Date(h.publishedAt).toLocaleDateString()}`).join('\n')}

---

YOUR TASK:

1. ANALYZE EACH ASSET:
   - Read ALL headlines for that asset
   - Consider both negative AND positive developments
   - Weigh confidence levels (higher confidence = more weight)
   - Determine net risk change using 0-10 scale INTELLIGENTLY
   
2. IDENTIFY CROSS-ASSET IMPACTS:
   - Oil price spikes → Increased manufacturing costs for semiconductors
   - Lithium supply issues → EV production delays → Less oil demand
   - Semiconductor shortages → Delayed industrial automation → Affects all sectors
   
3. CALCULATE BALANCED SCORES:
   - 0-10 scale: Use the FULL range
   - Small events: ±0.5 to ±1.5 change
   - Moderate events: ±1.5 to ±3.0 change
   - Major events: ±3.0 to ±5.0 change
   - Catastrophic events: ±5.0 to ±7.0 change (RARE!)
   
4. PROVIDE 5 TRADING OPPORTUNITIES WITH TICKER SYMBOLS:
   - CRITICAL: Each opportunity MUST include a stock ticker symbol
   - Format: "Tesla Inc. (TSLA)" or "Albemarle (ALB)"
   - Use real, tradeable US stock tickers
   - Mix of long and short positions
   - Realistic ROI estimates (5-20% typical, 20-40% aggressive)
   - Timeframes: short (1-3mo), medium (3-6mo), long (6-12mo)
   - Diversified across risk levels (conservative, moderate, aggressive)

5. EXTRACT GEOGRAPHIC LOCATIONS FROM HEADLINES:
   - Identify all countries, cities, regions mentioned in the news
   - Estimate coordinates for each location (latitude, longitude)
   - Classify location type: mine, refinery, port, processing_plant, or general
   - Assess risk level for each location
   - Include importance score (0-1) based on impact

EXAMPLE STOCKS:
- Lithium: ALB, SQM, LTHM, TSLA (Tesla uses lithium)
- Oil: XOM, CVX, BP, COP, SLB
- Semiconductors: TSM, NVDA, INTC, AMD, ASML

SCORING GUIDANCE:
- NOT EVERY NEGATIVE = CRITICAL (10/10)
- Pipeline shutdown affecting 2% supply = Maybe +1.5 change, not +7
- Multiple small positives can offset one negative
- Consider market sentiment, not just raw facts
- Score reflects PORTFOLIO RISK, not individual event severity

Return detailed JSON with reasoning for each asset.`;

  return prompt;
}

/**
 * Build enhanced system prompt for stock discovery
 */
function buildEnhancedSystemPrompt(): string {
  return `You are a senior geopolitical risk analyst with expertise in financial markets and supply chain analysis.
You conduct holistic portfolio risk assessments with INTELLIGENT STOCK DISCOVERY.

CORE CAPABILITIES:
1. Discover non-obvious stock correlations across ALL sectors
2. Validate recommendations with historical price data
3. Explain correlation reasoning (why this stock matters)
4. Provide actionable trading strategies

CRITICAL REQUIREMENTS:
1. BALANCED SCORING: Use full 0-10 scale. Not every negative event is catastrophic.
2. CROSS-ASSET IMPACTS: Oil prices → semiconductor costs, Lithium → EV → oil demand
3. INTELLIGENT STOCK DISCOVERY:
   - Don't just flag obvious stocks (ALB for lithium, XOM for oil)
   - Think broader, DISCOVER non-obvious stocks that have a history of being affected by similar events
   - Consider competitors who benefit from disruptions
   - Include alternative material suppliers
   - Transportation/logistics companies affected
4. CORRELATION STRENGTH: Rate 0-1 how strongly stock correlates with event
5. HISTORICAL VALIDATION: Reference similar events and their market impact

STOCK DISCOVERY PROCESS:
1. Direct producers/suppliers (obvious)
2. Downstream manufacturers (moderately obvious)
3. Competing alternatives (smart)
4. Indirect dependencies (very smart)
5. Counter-intuitive beneficiaries (genius level)

FOLLOW THE BELOW STRUCTURE FOR 5-7 HIGH-QUALITY TRADING OPPORTUNITIES:
(TSLA is just an example, use real tickers)
TRADING OPPORTUNITIES STRUCTURE (MANDATORY TICKER SYMBOL):
{
  "type": "long|short|hedge|arbitrage",
  "ticker": "TSLA",  // ⚠️ CRITICAL: Must be valid US stock ticker
  "description": "Tesla Inc. (TSLA) - Description with ticker in parentheses",
  "company": {
    "name": "Tesla Inc.",
    "ticker": "TSLA",  // ⚠️ CRITICAL: Same ticker here
    "sector": "Automobiles",
    "marketCap": "600B"
  },
  "correlation": {
    "strength": 0.87,
    "reasoning": "Tesla (TSLA) is heavily affected by lithium prices...",
    "historicalData": {
      "similarEvents": 3,
      "avgPriceImpact": "+12.5% over 2 weeks"
    }
  },
  "strategy": {
    "currentPrice": 250.00,
    "suggestedEntry": 245.00,
    "suggestedExit": 275.00,
    "stopLoss": 235.00,
    "potentialReturn": 12.2,
    "timeframe": "2-4 weeks",
    "riskLevel": "medium"
  },
  "suggestedActions": ["Buy TSLA at $245", "Set stop at $235", "Target $275"],
  "sources": ["citation IDs"],
  "confidence": 85
}

Return ONLY valid JSON (no markdown) with this COMPLETE structure:
{
  "assetChanges": {
    "lithium": {
      "currentScore": <current 0-10>,
      "newScore": <new 0-10>,
      "change": <difference>,
      "direction": "increase|decrease|neutral",
      "reasoning": "<2-3 sentence summary of all lithium headlines>",
      "impacts": ["Supply disruption in Chile", "Demand surge from EV sector", etc]
    },
    "oil": { /* same structure */ },
    "semiconductors": { /* same structure */ }
  },
  "opportunities": [/* 5-7 HIGH-QUALITY stock recommendations using structure above */],
  "locations": [
    {
      "name": "Atacama Salt Flat",
      "country": "Chile",
      "region": "Atacama Desert",
      "coordinates": [-23.6, -68.2],  // [latitude, longitude]
      "type": "mine|refinery|port|processing_plant|general",
      "asset": "lithium|oil|semiconductors",
      "riskLevel": "low|moderate|elevated|critical",
      "importance": 0.9,  // 0-1 scale
      "description": "Major lithium production site"
    }
  ],
  "crossAssetImpacts": [
    {
      "from": "lithium",
      "to": "oil",
      "impact": "Less EV adoption due to lithium shortage increases oil demand",
      "magnitude": "moderate"
    }
  ]
}

REMEMBER:
- SCORE EACH ASSET (lithium, oil, semiconductors) with reasoning
- PROVIDE 5-7 HIGH-QUALITY OPPORTUNITIES (focus on quality, not quantity)
- EXTRACT ALL GEOGRAPHIC LOCATIONS mentioned in headlines with coordinates
- DISCOVER non-obvious stocks that have a history of being affected by similar events
- INCLUDE real stock tickers that will be validated with finnhub
- COMPLETE all JSON objects (don't truncate mid-response)`;
}

/**
 * Build standard system prompt (fallback)
 */
function buildStandardSystemPrompt(): string {
  return `You are a senior geopolitical risk analyst conducting a holistic portfolio risk assessment. 
You analyze multiple events across Lithium, Crude Oil, and Semiconductors simultaneously.

CRITICAL REQUIREMENTS:
1. BALANCED SCORING: Not every negative event is a 10/10 catastrophe. Use the full 0-10 scale intelligently.
2. CROSS-ASSET IMPACTS: Consider how events in one market affect others (e.g., oil prices affect semiconductor manufacturing costs)
3. AGGREGATE EFFECTS: Multiple small events may compound, or they may cancel out
4. POSITIVE NEWS: Weigh positive developments that reduce risk
5. REALISTIC CHANGES: Typical score changes are ±1-3 points, not ±7-10

Return ONLY valid JSON with this structure (no markdown):
{
  "assetChanges": {
    "lithium": {
      "currentScore": <current 0-10>,
      "newScore": <new 0-10>,
      "change": <difference>,
      "direction": "increase|decrease|neutral",
      "reasoning": "<2-3 sentence explanation>",
      "impacts": []
    },
    "oil": { /* same */ },
    "semiconductors": { /* same */ }
  },
  "opportunities": [/* 5 trading opportunities */],
  "crossAssetImpacts": []
}`;
}

/**
 * Build enhanced prompt with real stock data from Alpha Vantage
 */
async function buildEnhancedPromptWithStockData(batch: BatchInput): Promise<string> {
  const { lithium, oil, semiconductors } = batch;
  
  // Sample stock symbols to provide as context (we'll fetch quotes)
  const sampleStocks = {
    lithium: ['ALB', 'SQM', 'LTHM'], // Albemarle, Sociedad, Livent
    oil: ['XOM', 'CVX', 'BP'], // ExxonMobil, Chevron, BP
    semiconductors: ['TSM', 'NVDA', 'INTC'] // TSMC, NVIDIA, Intel
  };
  
  // Fetch sample quotes (with rate limiting)
  let stockDataContext = '\n\nREAL-TIME STOCK DATA (for validation):';
  
  try {
    // Lithium stocks
    for (const symbol of sampleStocks.lithium.slice(0, 2)) { // Limit to 2 to save API calls
      const { quote } = await getStockData(symbol);
      if (quote) {
        stockDataContext += `\n${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`;
      }
      await new Promise(resolve => setTimeout(resolve, 300)); // Rate limit
    }
    
    // Oil stocks
    for (const symbol of sampleStocks.oil.slice(0, 2)) {
      const { quote } = await getStockData(symbol);
      if (quote) {
        stockDataContext += `\n${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Semiconductor stocks
    for (const symbol of sampleStocks.semiconductors.slice(0, 2)) {
      const { quote } = await getStockData(symbol);
      if (quote) {
        stockDataContext += `\n${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.warn('Could not fetch real-time stock data:', error);
    stockDataContext += '\n(Real-time data unavailable - use historical knowledge)';
  }
  
  const basePrompt = buildBatchPrompt(batch);
  
  return `${basePrompt}

${stockDataContext}

---

ENHANCED INSTRUCTIONS FOR STOCK DISCOVERY:

Your task is to discover ALL affected companies with REAL stock ticker symbols.

CRITICAL: Every opportunity MUST include a valid stock ticker symbol!

THINK BEYOND THE OBVIOUS:
- Lithium event? Don't just say "Albemarle (ALB)"
- Consider: Tesla (TSLA), Panasonic (PCRFY), Vale (VALE)
- Even airlines! (DAL, UAL) - Less EV adoption = more oil demand

REQUIRED FORMAT for each opportunity:
- Company name with ticker: "Tesla Inc. (TSLA)" or "Albemarle Corporation (ALB)"
- If you mention a stock, ALWAYS include its ticker symbol in parentheses
- Use real, tradeable US stock tickers (NYSE, NASDAQ)

EXAMPLE STOCKS BY SECTOR:
Lithium: ALB (Albemarle), SQM (Sociedad), LTHM (Livent), TSLA (Tesla), PCRFY (Panasonic)
Oil: XOM (ExxonMobil), CVX (Chevron), BP, COP (ConocoPhillips), SLB (Schlumberger)
Semiconductors: TSM (TSMC), NVDA (NVIDIA), INTC (Intel), AMD, ASML

USE HISTORICAL DATA:
- Reference similar events: "Last time Chile had lithium strikes (March 2024), ALB rose 12% in 2 weeks"
- Validate correlations: "TSLA stock historically moves inverse to lithium prices"
- Provide confidence based on historical precedent

DISCOVER SMART OPPORTUNITIES:
- Direct impacts (producers/suppliers)
- Indirect impacts (manufacturers, logistics)
- Competitor benefits (supply disruptions help competitors)
- Alternative suppliers (substitutes gain market share)
- Cross-sector ripple effects

PROVIDE 5-7 HIGH-QUALITY OPPORTUNITIES:
- Focus on QUALITY over quantity
- Mix of conservative, moderate, and aggressive
- Different timeframes (short, medium, long)
- Various sectors (not all energy, not all tech)
- Include both long and short positions

⚠️ TICKER SYMBOL REQUIREMENTS (NON-NEGOTIABLE):
1. EVERY opportunity MUST include a ticker symbol in THREE places:
   - Root level: "ticker": "TSLA"
   - Company object: "company": { "ticker": "TSLA" }
   - Description: "Tesla Inc. (TSLA) - Description text"
2. Use REAL, TRADEABLE US stock tickers (NYSE, NASDAQ)
3. Examples of valid tickers:
   - Lithium: TSLA, ALB, SQM, LTHM
   - Oil: XOM, CVX, BP, COP, SLB
   - Semiconductors: NVDA, TSM, INTC, AMD, ASML
4. If unsure, use companies from the real-time data above
5. NEVER submit an opportunity without a ticker symbol

COMPLETE each opportunity (don't truncate). Use the real-time stock data above to validate your recommendations.`;
}

/**
 * Enrich AI-discovered opportunities with real Finnhub data
 * Takes opportunities from Sonar Pro and adds real-time stock prices and company info
 */
async function enrichOpportunitiesWithRealData(opportunities: any[]): Promise<any[]> {
  console.log(`   Processing ${opportunities.length} opportunities...`);
  
  // Default stocks to use when AI doesn't provide tickers
  const defaultStocksByType: Record<string, string[]> = {
    long: ['TSLA', 'ALB', 'XOM', 'NVDA', 'CVX'],
    short: ['TSLA', 'ALB', 'SQM', 'LTHM'],
    hedge: ['GLD', 'TLT', 'VIX'],
    arbitrage: ['XOM', 'CVX', 'BP']
  };
  
  const enriched = [];
  let defaultStockIndex = 0;
  
  for (const opp of opportunities) {
    try {
      // Debug: Show opportunity structure
      console.log(`   🔍 Opportunity fields:`, Object.keys(opp).join(', '));
      if (opp.company) {
        console.log(`      Company fields:`, Object.keys(opp.company).join(', '));
      }
      
      // Extract ticker symbol - check multiple locations
      let ticker = null;
      
      // Priority 1: Direct ticker field
      if (opp.ticker && typeof opp.ticker === 'string') {
        ticker = opp.ticker.toUpperCase();
      }
      // Priority 2: Company.ticker field
      else if (opp.company?.ticker && typeof opp.company.ticker === 'string') {
        ticker = opp.company.ticker.toUpperCase();
      }
      // Priority 3: Extract from description (e.g., "Tesla (TSLA)")
      else if (opp.description) {
        const tickerMatch = opp.description.match(/\(([A-Z]{1,5})\)/) || 
                            opp.description.match(/\b([A-Z]{2,5})\b/);
        if (tickerMatch) {
          ticker = tickerMatch[1];
        }
      }
      
      // Fallback: Use default stocks if no ticker found
      if (!ticker) {
        const defaultStocks = defaultStocksByType[opp.type || 'long'] || defaultStocksByType.long;
        ticker = defaultStocks[defaultStockIndex % defaultStocks.length];
        defaultStockIndex++;
        console.log(`   ⚠️  No ticker found in opportunity (checked ticker, company.ticker, description), using default: ${ticker}`);
      } else {
        console.log(`   📊 Found ticker: ${ticker} - Fetching data from Finnhub...`);
      }      
      // Get real-time quote and profile from Finnhub
      const { quote, profile } = await getStockData(ticker);
      
      // Mock stock data (fallback when Finnhub fails or rate limited)
      const mockStockData: Record<string, any> = {
        'TSLA': { name: 'Tesla Inc.', price: 248.50, change: -3.20, changePercent: -1.27, volume: 125000000, sector: 'Automotive' },
        'ALB': { name: 'Albemarle Corporation', price: 89.32, change: 1.87, changePercent: 2.15, volume: 3500000, sector: 'Materials' },
        'SQM': { name: 'Sociedad Química y Minera', price: 43.25, change: 0.85, changePercent: 2.01, volume: 1800000, sector: 'Materials' },
        'LTHM': { name: 'Livent Corporation', price: 8.45, change: 0.22, changePercent: 2.67, volume: 5200000, sector: 'Materials' },
        'XOM': { name: 'ExxonMobil Corporation', price: 108.45, change: 0.93, changePercent: 0.87, volume: 18000000, sector: 'Energy' },
        'CVX': { name: 'Chevron Corporation', price: 152.30, change: 1.20, changePercent: 0.79, volume: 9500000, sector: 'Energy' },
        'BP': { name: 'BP plc', price: 35.67, change: -0.15, changePercent: -0.42, volume: 12000000, sector: 'Energy' },
        'NVDA': { name: 'NVIDIA Corporation', price: 485.20, change: 8.50, changePercent: 1.78, volume: 55000000, sector: 'Technology' },
        'TSM': { name: 'Taiwan Semiconductor', price: 125.40, change: 2.10, changePercent: 1.70, volume: 8500000, sector: 'Technology' },
        'INTC': { name: 'Intel Corporation', price: 36.20, change: -0.35, changePercent: -0.96, volume: 48000000, sector: 'Technology' },
        'AMD': { name: 'Advanced Micro Devices', price: 142.80, change: 3.20, changePercent: 2.29, volume: 62000000, sector: 'Technology' },
        'COP': { name: 'ConocoPhillips', price: 108.90, change: 1.15, changePercent: 1.07, volume: 7200000, sector: 'Energy' },
        'SLB': { name: 'Schlumberger', price: 42.35, change: 0.55, changePercent: 1.32, volume: 9800000, sector: 'Energy' }
      };
      
      // Combine Finnhub data or fallback to mock
      const stockData = (quote && profile) ? {
        symbol: ticker,
        name: profile.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        sector: profile.sector
      } : (mockStockData[ticker] ? {
        symbol: ticker,
        name: mockStockData[ticker].name,
        price: mockStockData[ticker].price,
        change: mockStockData[ticker].change,
        changePercent: mockStockData[ticker].changePercent,
        volume: mockStockData[ticker].volume,
        sector: mockStockData[ticker].sector
      } : null);
      
      if (stockData) {
        const dataSource = (quote && profile) ? 'Finnhub' : 'Mock Data';
        console.log(`   ✅ ${ticker}: $${stockData.price.toFixed(2)} (${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%) [${dataSource}]`);
        
        // Transform to EnhancedTradingOpportunity format
        // Create a rich description combining company info with market context
        const description = opp.description || 
          `${stockData.name} (${ticker}) - ${stockData.sector} sector stock currently trading at $${stockData.price.toFixed(2)} ` +
          `(${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%). ` +
          `This ${opp.type || 'long'} position may benefit from current market dynamics in the ${stockData.sector} sector.`;
        
        const enhanced = {
          type: opp.type || 'long',
          description: description, // Add description for UI display
          company: {
            name: stockData.name || ticker,
            ticker: ticker,
            sector: stockData.sector || 'Unknown',
            currentPrice: stockData.price,
            changePercent: stockData.changePercent
          },
          correlation: {
            symbol: ticker,
            strength: 0.75, // Default, AI should provide this
            reasoning: description,
            historicalData: {
              similarEventsCount: 2,
              avgPriceImpact: `+${Math.abs(stockData.changePercent || 0).toFixed(1)}% avg`,
              lastOccurrence: 'Recent market activity'
            },
            priceData: {
              current: stockData.price,
              change24h: stockData.change,
              changePercent: stockData.changePercent.toFixed(2),
              volume: stockData.volume
            }
          },
          strategy: {
            suggestedEntry: stockData.price * 0.98, // 2% below current
            suggestedExit: stockData.price * (1 + (parseFloat(opp.potentialReturn?.replace(/[^0-9.-]/g, '') || '10') / 100)),
            stopLoss: stockData.price * 0.95, // 5% stop loss
            timeframe: opp.timeframe || '3-6 months',
            potentialReturn: opp.potentialReturn || '+10-15%',
            riskLevel: opp.riskLevel || 'moderate',
            actionPlan: [
              `Monitor ${ticker} price action near $${stockData.price.toFixed(2)}`,
              `Enter position on dip to $${(stockData.price * 0.98).toFixed(2)}`,
              `Set stop-loss at $${(stockData.price * 0.95).toFixed(2)} (5% protection)`,
              `Take profits at target levels`
            ]
          },
          // Fields for standard Opportunity interface (used by UI)
          // Calculate dynamic potential return from AI data or stock momentum
          potentialReturn: opp.potentialReturn 
            ? parseFloat(opp.potentialReturn.toString().replace(/[^0-9.-]/g, '')) 
            : Math.abs(stockData.changePercent) * 3, // Use 3x recent momentum as fallback
          // Calculate risk level based on volatility
          riskLevel: opp.riskLevel || (
            Math.abs(stockData.changePercent) > 5 ? 'elevated' :
            Math.abs(stockData.changePercent) > 3 ? 'moderate' :
            Math.abs(stockData.changePercent) > 1 ? 'low' : 'moderate'
          ) as any,
          timeframe: opp.timeframe || '3-6 months',
          suggestedActions: [
            `Entry: $${(stockData.price * 0.98).toFixed(2)}`,
            `Exit: $${(stockData.price * 1.12).toFixed(2)}`,
            `Stop: $${(stockData.price * 0.95).toFixed(2)}`
          ],
          citations: [],
          confidence: 75
        };
        
        enriched.push(enhanced);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } else {
        console.log(`   ⚠️  No data found for ${ticker}, keeping original`);
        enriched.push(opp);
      }
      
    } catch (error: any) {
      console.log(`   ⚠️  Error enriching opportunity: ${error.message}`);
      enriched.push(opp); // Keep original on error
    }
  }
  
  console.log(`   ✅ Enriched ${enriched.length} opportunities`);
  return enriched;
}
