# Perplexity Analysis Flow - Complete Breakdown

## 🎯 When You Click "ANALYZE THIS"

### Step 1: Frontend Triggers Analysis
**File**: `app/page.tsx` - `handleConfirmAnalysis()`

```typescript
// Extract the asset from the headline's matched keywords
const targetAssetId = headline.matchedAssets[0]; // e.g., "oil"

// Send request to backend
POST /api/analyze
{
  assetId: "oil",
  eventText: "WEST OF SUEZ DIRTY TANKER QUARTERLY: Production increases..."
}
```

---

## 📡 Step 2: Backend Calls Perplexity API
**File**: `app/api/analyze/route.ts`

```typescript
// Get asset data (lithium/oil/semiconductors)
const asset = getAssetById("oil");

// Create event object
const event = {
  title: "WEST OF SUEZ DIRTY TANKER...",
  description: full headline text,
  eventType: "market_movement",
  location: { country: "Unknown" }
};

// 🚀 LIVE PERPLEXITY API CALL
const analysis = await analyzeEventImpact(asset, event, {
  model: "sonar-pro",        // ← Grounded LLM with reasoning
  searchType: "pro"          // ← Pro Search (web search + reasoning)
});
```

**Cost**: ~$0.035 per request (Sonar Pro model)

---

## 🤖 Step 3: Perplexity Grounded LLM Analysis
**File**: `lib/perplexity/chat.ts`

### What Perplexity Does:

#### **1. System Prompt** (You are a geopolitical analyst)
```
You are a senior geopolitical risk analyst for a major hedge fund, 
specializing in Energy markets with a focus on Crude Oil.

Your analysis MUST be:
- QUANTITATIVE: Include exact percentages, timeframes, dollar amounts
- SPECIFIC: Name exact companies, facilities, trade routes
- EVIDENCE-BASED: Reference all claims with sources
- COMPREHENSIVE: Identify cascading effects (Primary → First → Second)

Current context for Crude Oil:
- Top producers: Saudi Arabia (13.2%), Russia (12.1%), USA (11.8%)
- Key exposed companies: ExxonMobil, Chevron, BP, Shell
- Critical regions: Middle East, North America, Russia, West Africa
```

#### **2. User Prompt** (Analyze this event)
```
URGENT RISK ASSESSMENT REQUEST

Asset: Crude Oil (CRUDE)
Current Risk Score: 5.8/10
Current Risk Level: elevated

NEW EVENT:
Title: WEST OF SUEZ DIRTY TANKER QUARTERLY...
Type: market_movement
Location: Unknown

REQUIRED ANALYSIS:

1. PRIMARY IMPACT
   - What % of global Crude Oil supply is directly affected?
   - Which specific facility/mine/production site?
   - When will the impact be felt in global markets?
   - SOURCE EVIDENCE for all claims

2. FIRST-ORDER IMPACTS
   - Which companies buy directly from this source?
   - What is each company's exposure percentage?
   - How will their stock prices respond?
   - Cite investor reports, supply chain disclosures

3. SECOND-ORDER IMPACTS
   - Which downstream industries depend on affected companies?
   - What geographic regions will feel effects?

4. HISTORICAL ANALYSIS
   - Find similar past events
   - What happened to Crude Oil prices then?
   - Which stocks benefited? Recovery time?

5. TRADING OPPORTUNITIES
   - Which assets historically rise during market_movement?
   - Specific stock symbols to buy/short
   - Arbitrage opportunities
```

#### **3. Perplexity Web Search (Pro Search)**
Perplexity's API:
- **Searches the web** for recent news, reports, analyst data
- **Finds sources**: Production data, company disclosures, historical prices
- **Returns citations**: URLs, snippets, dates
- **Reasoning steps**: Shows its thought process

#### **4. Perplexity Returns Structured JSON**
```json
{
  "summary": "2-sentence executive summary",
  "impacts": [
    {
      "order": "primary",
      "description": "15% of West African crude supply disrupted...",
      "magnitude": 7.5,
      "timeframe": "6-8 weeks",
      "affectedEntities": [
        {
          "type": "company",
          "name": "ExxonMobil",
          "symbol": "XOM",
          "impactDescription": "30% exposure to West African production",
          "impactMagnitude": 8.2
        }
      ],
      "confidence": 0.85,
      "citationIds": [0, 1, 2]
    }
  ],
  "opportunities": [
    {
      "type": "long",
      "description": "Historical patterns show 12% average gain...",
      "suggestedActions": ["Buy XOM calls", "Long crude futures"],
      "potentialReturn": 12.5,
      "riskLevel": "moderate",
      "timeframe": "3-6 months",
      "citationIds": [3, 4]
    }
  ]
}
```

Plus:
- `search_results`: Array of URLs with titles, snippets, dates
- `reasoning_steps`: Perplexity's thought process

---

## 📊 Step 4: Calculate Risk Score
**File**: `lib/risk/scorer.ts` - `calculateRiskScore()`

### 5 Components with Weights:

#### **1. Supply Disruption (30% weight)**
```typescript
// Extract % from Perplexity's primary impact
"15% of West African crude supply disrupted" → 15%

Score calculation:
- 0-5% = Low (0-3 points)
- 5-15% = Moderate (3-6 points)
- 15-30% = Elevated (6-8 points)  ← 15% = 7.0 points
- 30%+ = Critical (8-10 points)

Supply Score: 7.0
```

#### **2. Market Sentiment (20% weight)**
```typescript
// Count affected entities from Perplexity's response
Affected companies: 4 (ExxonMobil, Chevron, BP, Shell)
Average magnitude: 7.8

entityFactor = min(4/5, 1) * 5 = 4.0
magnitudeFactor = 7.8 * 0.5 = 3.9

Market Sentiment Score: 7.9
```

#### **3. Company Exposure (25% weight)**
```typescript
// Check if high-exposure companies (>70%) are affected
High exposure companies: ExxonMobil (85%), Chevron (78%)
Affected from list: 2

Average impact magnitude: 8.2

Company Exposure Score: 8.2
```

#### **4. Geopolitical Severity (15% weight)**
```typescript
// Event type severity map
event.eventType = "market_movement"

Severity map:
- market_movement: 3.0  ← This event
- strike: 6.0
- political_unrest: 8.0
- conflict: 9.0

Geopolitical Severity Score: 3.0
```

#### **5. Historical Precedent (10% weight)**
```typescript
// Check if Perplexity found historical patterns
Perplexity response mentions "historically" or "similar" events?
- Found in impacts: YES
- Found in opportunities: YES

Historical Precedent Score: 8.0
```

### **Final Calculation (Weighted Average)**
```typescript
totalScore = 
  (7.0 * 0.30) +  // Supply: 2.1
  (7.9 * 0.20) +  // Sentiment: 1.58
  (8.2 * 0.25) +  // Exposure: 2.05
  (3.0 * 0.15) +  // Geopolitical: 0.45
  (8.0 * 0.10)    // Historical: 0.8
= 7.0 (rounded to 1 decimal)

Risk Level = scoreToLevel(7.0) = "elevated"
```

---

## 🎨 Step 5: Update UI
**File**: `app/page.tsx`

```typescript
// Update the correct asset
assets.map(asset =>
  asset.id === "oil"  // ← Correct asset from signal
    ? { 
        ...asset, 
        currentRiskScore: 7.0,    // ← New score
        riskLevel: "elevated"     // ← New level
      }
    : asset
);
```

**RiskGauge** animates from 5.8 → 7.0 over 2 seconds
**Color** changes to orange gradient (elevated)
**Analysis Modal** shows full Perplexity response with citations

---

## 💰 Cost Breakdown

### Per Analysis:
1. **Perplexity Sonar Pro**: $0.035 per request
2. **Pro Search**: Included in Sonar Pro
3. **Web Citations**: Included

### Total Demo Budget:
- **Budget**: $15 allocated
- **Per analysis**: $0.035
- **Max analyses**: ~428 requests
- **Expected usage**: 10-20 analyses during demo = **$0.35 - $0.70**

---

## 🔍 What Makes This Powerful

### **1. Real Web Search**
- Not just an LLM hallucinating
- Actual current news, reports, data
- Citations you can verify

### **2. Structured Reasoning**
- Perplexity shows its thought process
- Multi-step analysis (Primary → First → Second order)
- Quantitative outputs

### **3. Historical Context**
- Finds similar past events
- Price patterns and correlations
- Precedent-based predictions

### **4. Trading Opportunities**
- Actionable suggestions (long/short)
- Specific stock symbols
- ROI estimates with timeframes

### **5. Transparent Scoring**
- 5 components with clear weights
- Each component has explicit logic
- Reproducible calculations

---

## 🎯 Summary

**When you click "ANALYZE THIS":**

1. ✅ **YES, it's sent to Perplexity** (Sonar Pro model)
2. ✅ **Uses Grounded LLM** (not just search API)
3. ✅ **Pro Search enabled** (web search + reasoning)
4. ✅ **Returns structured JSON** with citations
5. ✅ **Risk score calculated** from 5 weighted components
6. ✅ **UI updates** with new score and analysis

**This is the real deal** - live web search, AI reasoning, quantitative scoring, all in ~5 seconds! 🚀
