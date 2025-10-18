# Finance API Integration - Intelligent Stock Discovery

## Overview
Signal now features an **AI-powered correlation discovery engine** that goes beyond predefined stock lists to discover **any company** that might be affected by commodity assets (oil, lithium, semiconductors, etc.).

### How It Works
1. **Perplexity Sonar Deep Research** analyzes the asset and discovers non-obvious correlations
2. **Alpha Vantage API** validates discoveries with real-time stock data and historical patterns
3. **Enhanced UI** displays 10-15 smart opportunities with correlation strength and "Why this stock?" explanations

### Example
- **Input**: Chile lithium mine strike
- **AI Discovers**: Tesla, Panasonic, Vale, airlines (cross-sector impacts)
- **Validates**: Historical price correlations, similar events
- **Outputs**: Trading strategies with entry/exit points

---

## Setup

### 1. Get Your Free Alpha Vantage API Key
1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email (no credit card required)
3. Copy your API key

### 2. Add API Key to Environment
Open `.env.local` and replace the placeholder:
```env
ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Restart Development Server
```powershell
npm run dev
```

### 4. Configure AI Model (Important!)

Deep Research is **slow** (3-5 minutes) and **expensive** ($5-10). For development, use Sonar Pro:

**In `.env.local`:**
```env
# For testing/development (RECOMMENDED)
USE_DEEP_RESEARCH=false  # Fast, cheap ($0.035/call)

# For final demo only
USE_DEEP_RESEARCH=true   # Slow, expensive ($5-10/call), but smarter
```

**⚠️ Important**: 
- Deep Research takes **3-5 minutes** per analysis
- Next.js timeout is set to **5 minutes** (300 seconds)
- Use Sonar Pro (`false`) for all testing
- Only switch to Deep Research (`true`) for final demo

---

## API Capabilities

### Alpha Vantage Functions (`lib/finance/alpha-vantage.ts`)

#### Real-Time Stock Data
```typescript
// Get current stock quote
const quote = await getStockQuote('TSLA');
// Returns: { symbol, name, price, change, changePercent, volume, marketCap, sector }

// Get batch quotes (rate-limited)
const quotes = await getBatchQuotes(['TSLA', 'NVDA', 'ALB']);
```

#### Historical Analysis
```typescript
// Get historical prices (daily OHLCV)
const history = await getHistoricalPrices('TSLA', 30); // Last 30 days

// Calculate price impact around events
const impact = await calculatePriceImpact('TSLA', '2024-01-15', 14);
// Returns: { beforePrice, afterPrice, percentChange, daysAnalyzed, correlation }
```

#### Commodity Data
```typescript
// Get WTI crude oil prices
const oilPrices = await getWTIOilPrices('daily'); // or 'weekly', 'monthly'
```

#### Company Research
```typescript
// Search for stock symbols
const results = await searchSymbol('Tesla');

// Get company fundamentals
const overview = await getCompanyOverview('TSLA');

// Validate symbols exist
const valid = await validateSymbols(['TSLA', 'NVDA', 'INVALID']);
// Returns: { valid: ['TSLA', 'NVDA'], invalid: ['INVALID'] }
```

### Rate Limits
- **Free Tier**: 25 API calls per day, 25 calls per minute
- **Built-in Protection**: Automatic 250ms delays between requests
- **Tracking**: `apiCallCount` variable tracks usage

---

## Cost Comparison

### Perplexity Models

| Model | Cost per Analysis | Speed | Use Case |
|-------|-------------------|-------|----------|
| **Sonar Pro** | ~$0.035 | 10-30 sec | Testing, development, demos |
| **Sonar Deep Research** | $5-10 | **3-5 minutes** | Final demo only (if needed) |

### ⚠️ Deep Research Timeout Warning

Deep Research is **very slow**:
- Takes **3-5 minutes** per batch analysis
- May timeout on some platforms
- **Not recommended** for development
- Use only for final demo if judges want to see AI discovery in action

### Recommendation
1. **Development**: Use Sonar Pro (`USE_DEEP_RESEARCH=false`)
   - Fast responses (10-30 seconds)
   - ~400 analyses with $14.64 budget
   - Still shows intelligent insights

2. **Final Demo**: Optionally use Deep Research (`USE_DEEP_RESEARCH=true`)
   - Only if you want to show live AI stock discovery
   - Pre-generate results beforehand to avoid waiting
   - 1-2 calls maximum ($5-20 total)

3. **Best Strategy**: 
   - Use Sonar Pro for live demos (fast, reliable)
   - Show Deep Research results from pre-saved analysis
   - Explain: "We can use Deep Research for deeper insights (takes 5 min)"

---

## Enhanced Features

### 1. Smart Stock Discovery
Deep Research discovers stocks by:
- **Direct impacts**: Companies directly affected (lithium miners)
- **Indirect impacts**: Supply chain dependencies (battery manufacturers)
- **Competitor benefits**: Companies that gain from disruptions
- **Alternative suppliers**: Beneficiaries of supply shifts

### 2. Correlation Validation
Each discovered stock includes:
- **Correlation strength**: 0-100% confidence score
- **Historical precedent**: Similar events and average impact
- **Real-time data**: Current price, volume, market cap
- **AI reasoning**: "Why this stock?" explanation

### 3. Trading Strategies
For each opportunity:
- **Entry point**: Suggested buy price
- **Exit target**: Take-profit level
- **Stop-loss**: Risk management level
- **Timeframe**: Expected duration
- **Risk level**: Low/Medium/High assessment
- **Action plan**: Step-by-step execution

---

## Usage Example

### Batch Analysis with Stock Discovery
```typescript
// In app/api/analyze-batch/route.ts
const result = await analyzeBatchImpact([
  { assetId: '1', name: 'WTI Crude Oil', price: 75.20 },
  { assetId: '2', name: 'Lithium', price: 12000 }
], {
  model: 'sonar-deep-research',  // AI-powered discovery
  searchType: 'deep',
  useStockDiscovery: true,       // Enable intelligent correlation
  temperature: 0.3,              // Focused analysis
  max_tokens: 4000               // Detailed responses
});
```

### What You Get
```json
{
  "opportunities": [
    {
      "type": "long",
      "company": {
        "name": "Tesla",
        "ticker": "TSLA",
        "sector": "Automotive"
      },
      "correlation": {
        "symbol": "TSLA",
        "strength": 0.78,
        "reasoning": "Tesla's battery production heavily depends on lithium...",
        "historicalData": {
          "similarEventsCount": 3,
          "avgPriceImpact": "+12.5% over 2 weeks",
          "lastOccurrence": "March 2024"
        },
        "priceData": {
          "current": 248.50,
          "change24h": -3.20,
          "changePercent": "-1.27%",
          "volume": 125000000
        }
      },
      "strategy": {
        "suggestedEntry": 245.00,
        "suggestedExit": 275.00,
        "stopLoss": 235.00,
        "timeframe": "2-4 weeks",
        "potentialReturn": "+12.2%",
        "riskLevel": "medium",
        "actionPlan": [
          "Monitor lithium price stabilization",
          "Enter on dip below $245",
          "Set stop-loss at $235",
          "Take profit at $275"
        ]
      },
      "confidence": 85
    }
  ]
}
```

---

## UI Components

### EnhancedTradingOpportunities
Displays intelligent stock recommendations with:
- **AI Discovery Badge**: Highlights smart correlation discovery
- **Expandable Cards**: Click to see detailed reasoning
- **Correlation Strength**: Visual percentage bar (0-100%)
- **"Why This Stock?" Section**: AI explanation in cyan-bordered card
- **Historical Data**: Similar events count and average impact
- **Trading Strategy**: Entry/exit/stop-loss with current price
- **Confidence Score**: AI confidence in recommendation

---

## Testing Workflow

### 1. Development (Sonar Pro)
```powershell
# Test with cheaper model
# Modify app/api/analyze-batch/route.ts:
model: 'sonar-pro'  # ~$0.035 per analysis
useStockDiscovery: false  # Use predefined stocks
```

### 2. Demo Preparation (Deep Research)
```powershell
# Switch to intelligent discovery
model: 'sonar-deep-research'  # $5-10 per analysis
useStockDiscovery: true  # AI-powered correlation
```

### 3. Verify Integration
1. Add Alpha Vantage API key to `.env.local`
2. Run batch analysis on your oil asset
3. Check console for:
   - Stock quotes fetched successfully
   - Rate limiting working (250ms delays)
   - 10-15 opportunities returned (not 5)
4. Verify UI displays:
   - Company names and tickers
   - Correlation percentages
   - Expandable "Why this stock?" sections
   - Trading strategies with prices

---

## Troubleshooting

### "Alpha Vantage API key required"
- Ensure `.env.local` has your actual API key
- Restart dev server after adding key

### "Rate limit exceeded"
- Free tier: 25 calls/day, 25/min
- Built-in delays handle per-minute limit
- For daily limit, wait 24 hours or upgrade

### "Symbol not found"
- Use `searchSymbol('company name')` to find ticker
- Validate with `validateSymbols(['TICKER'])`

### Component not showing enhanced data
- Check console for Perplexity API responses
- Verify `useStockDiscovery: true` in batch analysis
- Ensure Deep Research model is being used

---

## Next Steps

1. **Insert your Alpha Vantage API key** in `.env.local`
2. **Test with Sonar Pro** to validate integration ($0.035/call)
3. **Verify UI** displays correlation data correctly
4. **Switch to Deep Research** for final demo ($5-10/call)
5. **Prepare demo script** showing AI discovering non-obvious stocks
6. **Practice pitch**: "AI-powered correlation discovery engine"

---

## Demo Talking Points

### Problem
Traditional risk monitoring only tracks **predefined stocks** in the same sector. You miss:
- Cross-sector impacts (lithium → airlines)
- Indirect effects (supply chain disruptions)
- Competitor advantages (alternative suppliers)

### Solution
**Signal's AI Correlation Discovery Engine**:
1. Analyzes commodity assets (oil, lithium, semiconductors)
2. Discovers **any affected company** across **all sectors**
3. Validates correlations with **real historical data**
4. Generates **actionable trading strategies**

### Value Proposition
- **Discover the non-obvious**: AI finds stocks humans miss
- **Data-validated**: Not just guesses - historical proof
- **Actionable insights**: Entry, exit, stop-loss for each stock
- **Cross-sector coverage**: From miners to manufacturers to airlines

---

## Architecture Summary

```
User selects asset (Oil, Lithium, Semiconductor)
         ↓
Perplexity Sonar Deep Research
- Analyzes asset impact
- Discovers correlated stocks (any sector)
- Explains reasoning for each
         ↓
Alpha Vantage API
- Fetches real-time quotes
- Gets historical data
- Calculates price impacts
         ↓
Enhanced UI
- Displays 10-15 opportunities
- Shows correlation strength
- Explains "Why this stock?"
- Provides trading strategies
```

---

## Budget Tracking

**Remaining**: $14.64

**Testing Phase** (Sonar Pro - $0.035/call):
- ~400 API calls available
- Use for development and iteration

**Demo Phase** (Deep Research - $5-10/call):
- 1-2 high-quality analyses for judges
- Better correlations, insights, recommendations

**Alpha Vantage** (Free):
- 25 calls/day
- Enough for demo (6 stocks per analysis)

---

## Support

For issues or questions:
- Check `.env.local` has correct API key
- Verify rate limits not exceeded
- Review console for error messages
- Test with single asset first before batch

**Good luck with your hackathon demo! 🚀**
