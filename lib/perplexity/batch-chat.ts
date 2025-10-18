// Batch Impact Analysis - Analyze Multiple Headlines Holistically
// Uses Perplexity Sonar Pro to analyze all flagged headlines together
// Considers cross-asset impacts and provides balanced risk scoring

import { perplexityClient } from "./client";
import type { Asset, Opportunity, Citation, Impact } from "@/types";

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
}

interface AnalysisOptions {
  model?: "sonar" | "sonar-pro";
  searchType?: "basic" | "pro";
}

/**
 * Analyze all flagged headlines holistically with cross-asset impact consideration
 */
export async function analyzeBatchImpact(
  batch: BatchInput,
  options: AnalysisOptions = {}
): Promise<BatchAnalysisResult> {
  
  const { model = "sonar-pro", searchType = "pro" } = options;
  
  // Build comprehensive prompt with ALL headlines
  const prompt = buildBatchPrompt(batch);
  
  console.log("🤖 Batch Analysis Prompt built");
  console.log(`   Model: ${model}, Search: ${searchType}`);
  
  try {
    const response = await perplexityClient.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: `You are a senior geopolitical risk analyst conducting a holistic portfolio risk assessment. 
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
      "reasoning": "<2-3 sentence explanation considering ALL lithium headlines and cross-effects>",
      "impacts": [/* impact objects */]
    },
    "oil": { /* same structure */ },
    "semiconductors": { /* same structure */ }
  },
  "opportunities": [/* 5 trading opportunities */],
  "crossAssetImpacts": [
    {
      "description": "Oil price volatility increases semiconductor manufacturing costs",
      "affectedAssets": ["oil", "semiconductors"]
    }
  ]
}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4, // Balanced: not too random, not too rigid
      max_tokens: 3000,
      search_domain_filter: searchType === "pro" ? undefined : ["reuters.com", "ft.com", "bloomberg.com"]
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    
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
    
    // Parse JSON response
    let parsedResult: any;
    try {
      // Try markdown code block first
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[1]);
      } else {
        parsedResult = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("❌ Failed to parse batch analysis JSON:", content);
      throw new Error("Invalid JSON response from Perplexity");
    }
    
    console.log(`✅ Batch analysis parsed successfully`);
    console.log(`   Citations: ${citations.length}`);
    
    return {
      assetChanges: parsedResult.assetChanges,
      opportunities: parsedResult.opportunities || [],
      citations,
      crossAssetImpacts: parsedResult.crossAssetImpacts || []
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
   
4. PROVIDE 5 TRADING OPPORTUNITIES:
   - Mix of long and short positions
   - Specific stock symbols or commodities
   - Realistic ROI estimates (5-20% typical, 20-40% aggressive)
   - Timeframes: short (1-3mo), medium (3-6mo), long (6-12mo)
   - Diversified across risk levels (conservative, moderate, aggressive)

SCORING GUIDANCE:
- NOT EVERY NEGATIVE = CRITICAL (10/10)
- Pipeline shutdown affecting 2% supply = Maybe +1.5 change, not +7
- Multiple small positives can offset one negative
- Consider market sentiment, not just raw facts
- Score reflects PORTFOLIO RISK, not individual event severity

Return detailed JSON with reasoning for each asset.`;

  return prompt;
}
