# Risk Score Explained - Your Questions Answered

## ❓ Question 1: What Does Risk Level Actually Mean?

### **Risk Score = Supply Disruption Probability × Impact Severity**

It's **NOT** directly "price will increase" - it's more nuanced:

### **What High Risk Score Means:**
- 🔴 **High probability of supply disruption**
- 📈 **Price volatility expected** (could go UP or DOWN)
- ⚠️ **Market uncertainty increases**
- 💰 **Trading opportunities emerge**

### **For Traders/Investors:**

| Risk Level | Score | Market Interpretation | Trading Strategy |
|------------|-------|----------------------|------------------|
| **Low** | 0-3 | Stable supply, business as usual | Hold positions, low volatility |
| **Moderate** | 3-5 | Minor disruptions possible | Monitor, small hedges |
| **Elevated** | 5-7 | Significant supply concerns | Active positioning, volatility plays |
| **Critical** | 7-10 | Major supply shock likely | Heavy hedging, opportunity plays |

### **Example: Chilean Lithium Strike (Risk 6.7)**

**What 6.7/10 "Elevated" Risk Means:**
- ✅ **Supply disruption**: 20% of global lithium at risk
- ✅ **Price impact**: Lithium prices likely to rise 15-30%
- ✅ **Company exposure**: SQM, Albemarle heavily affected
- ✅ **Opportunity**: Buy lithium miners, short EV stocks heavily dependent on Chilean supply

**NOT Just "Price Goes Up":**
- Could mean **shortage** → prices spike UP
- Could mean **demand destruction** → prices fall
- Could mean **increased volatility** → options premium rises
- Could mean **supply chain rerouting** → geographic arbitrage

### **Think of it like VIX (Volatility Index):**
- VIX doesn't tell you if market goes up or down
- It tells you **uncertainty/volatility is high**
- Risk Score = **Asset-specific VIX** with supply chain context

---

## ❓ Question 2: How is Event Type Set?

### **Current Implementation (HARDCODED - Not Ideal):**

**File**: `app/api/analyze/route.ts` (Line 56)
```typescript
eventType: "market_movement", // ← HARDCODED! Default for all events
```

### **The Problem:**
- ❌ **All RSS headlines** get "market_movement" 
- ❌ **No AI classification** happening
- ❌ **Reduces scoring accuracy** (market_movement = only 3.0/10 geopolitical severity)

### **Event Type Severity Map:**
```typescript
// lib/risk/scorer.ts
const severityMap: Record<string, number> = {
  market_movement: 3.0,      // ← Everything currently gets this
  strike: 6.0,
  regulation: 5.0,
  trade_policy: 6.5,
  natural_disaster: 7.5,
  political_unrest: 8.0,
  conflict: 9.0,
  technology_disruption: 4.0
};
```

### **Why That Oil Signal Got Low Score:**
```
Event: "WEST OF SUEZ DIRTY TANKER QUARTERLY: Production increases"
└── eventType: "market_movement" (hardcoded)
    └── Geopolitical Severity: 3.0/10 (15% of total score)
    └── Result: Risk stays ~5.8 (minimal change)
```

### **IMPROVEMENT: Add AI Event Classification**

**Option A: Use Perplexity Sonar (Fast) for Classification**
```typescript
// Before calling analyzeEventImpact(), classify the event
const eventType = await classifyEventType(eventText);

async function classifyEventType(text: string): Promise<string> {
  const response = await perplexityClient.chat.completions.create({
    model: "sonar",  // Fast, cheap ($0.0008)
    messages: [
      {
        role: "system",
        content: "Classify geopolitical events. Return ONE word: strike, natural_disaster, political_unrest, regulation, trade_policy, conflict, technology_disruption, or market_movement."
      },
      {
        role: "user",
        content: `Event: ${text}\n\nClassification:`
      }
    ],
    stream: false
  });
  
  return response.choices[0].message.content.trim().toLowerCase();
}
```

**Cost**: +$0.0008 per analysis (negligible)

**Option B: Keyword-based Classification (Free)**
```typescript
function classifyEventType(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.match(/strike|protest|walkout|union/)) return "strike";
  if (lower.match(/earthquake|flood|hurricane|fire|disaster/)) return "natural_disaster";
  if (lower.match(/war|conflict|attack|invasion|military/)) return "conflict";
  if (lower.match(/sanction|ban|regulation|policy|tariff/)) return "trade_policy";
  if (lower.match(/coup|unrest|riot|revolution/)) return "political_unrest";
  
  return "market_movement";
}
```

**Cost**: Free, instant

---

## ❓ Question 3: Should We Use Perplexity for RSS Search?

### **Current Architecture:**

```
RSS Feeds → rss-parser (free) → Keyword triage (free) → AI triage (Sonar) → Full analysis (Sonar Pro)
```

### **Your Question: Why not Perplexity for RSS too?**

Great instinct, but here's the **cost-benefit analysis**:

### **Option 1: Current (RSS Parser - FREE)**
```typescript
// lib/feeds/aggregator.ts
const parser = new RSSParser();
const feed = await parser.parseURL(source.url);

// Pros:
✅ FREE - unlimited RSS fetches
✅ Fast - 10 sources in ~2 seconds
✅ Reliable - direct XML parsing
✅ Real RSS headlines (not synthesized)

// Cons:
❌ Limited to RSS sources only
❌ No semantic understanding of headlines
❌ Can't search arbitrary topics
```

**Cost**: $0.00

### **Option 2: Perplexity Web Search API**
```typescript
// Theoretical: Use Perplexity to search for news
const completion = await perplexityClient.chat.completions.create({
  model: "sonar",
  messages: [{
    role: "user",
    content: "Find latest news about lithium strikes, oil disruptions, semiconductor supply chains"
  }],
  web_search_options: { search_type: "auto" }
});

// Pros:
✅ Semantic search - finds related topics
✅ Real-time web search
✅ Can discover non-RSS sources (Twitter, forums, govt sites)
✅ Natural language queries

// Cons:
❌ COSTS $0.0008 per search
❌ 10 sources × every 60s = 600 searches/hour = $0.48/hour = $11.52/day
❌ Would burn entire $15 budget in 30 hours
❌ Returns summarized content (not raw headlines)
❌ Can't get 50-200 headlines per scan
```

**Cost**: $11.52/day in live mode (unaffordable)

### **HYBRID APPROACH (Recommended):**

Keep current architecture but **enhance keyword triage with AI classification**:

```
1. RSS feeds (free) → 200 raw headlines
2. Keyword triage (free) → 10-20 flagged headlines  
3. AI event classification (Sonar $0.0008) → Classify event types
4. AI confidence scoring (Sonar $0.0008) → Top 5 by confidence
5. Full analysis (Sonar Pro $0.035) → Only when user clicks

Cost per scan: ~$0.016 (10 classifications)
Budget: $15 ÷ $0.016 = 937 scans (plenty for demo + development)
```

### **Alternative: Perplexity for Discovery (Not Replacement)**

Use Perplexity **alongside** RSS, not instead of:

```typescript
// New endpoint: /api/feeds/discover
async function discoverSignals(asset: string) {
  const response = await perplexityClient.chat.completions.create({
    model: "sonar",
    messages: [{
      role: "user",
      content: `Find breaking news from the last 24 hours about ${asset} supply disruptions, strikes, geopolitical events. Return titles and URLs only.`
    }],
    web_search_options: { search_type: "pro" }
  });
  
  // Parse response for URLs
  // Supplement RSS feeds with Perplexity discoveries
}
```

**Use Case**: 
- Run every 6 hours (not every 60 seconds)
- Discover non-RSS sources (Twitter, Telegram, govt alerts)
- Cost: $0.0008 × 4 scans/day = $0.003/day (affordable)

---

## 🎯 Recommendations

### **1. Event Type Classification (HIGH PRIORITY)**
**Add AI classification with Sonar** - small cost, big accuracy improvement

```typescript
// app/api/analyze/route.ts
const eventType = await classifyEventType(eventText); // +$0.0008

const event: Event = {
  // ...
  eventType: eventType, // ← Now intelligent!
};
```

**Impact**: 
- Strike events now get 6.0 severity (not 3.0)
- Conflict events get 9.0 severity
- More accurate risk scores

### **2. RSS Strategy (KEEP CURRENT)**
**Don't replace RSS with Perplexity** - too expensive for continuous monitoring

**Instead**: Add Perplexity discovery as a **supplement**
- RSS = primary feed (free, real-time)
- Perplexity = backup discovery (4x/day for non-RSS sources)

### **3. Enhanced Triage Pipeline**
```
RSS (free) 
  → Keyword filter (free)
  → Event classification (Sonar $0.0008)
  → Confidence scoring (Sonar $0.0008)
  → Top 5 displayed
  → Full analysis when user clicks (Sonar Pro $0.035)
```

**Budget**: $15 ÷ $0.037 = 405 full analysis cycles (more than enough)

---

## 💡 Summary

**Q1: What does risk mean?**
- **Volatility & disruption probability**, not just "price up"
- Elevated risk = trading opportunities (long/short/hedge)
- Think VIX for individual assets

**Q2: How is event type set?**
- **Currently hardcoded** to "market_movement" 
- **Should add AI classification** (cheap, high impact)
- Would improve scoring accuracy significantly

**Q3: Should we use Perplexity for RSS?**
- **No** - too expensive for continuous monitoring
- **Yes** - for supplemental discovery (4x/day)
- Current RSS approach is optimal for core feed
