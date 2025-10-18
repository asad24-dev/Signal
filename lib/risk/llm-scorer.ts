// LLM-Powered Risk Scoring
// Uses Perplexity to read the news and decide risk direction/magnitude

import type { Asset, Event, ImpactAnalysis } from "@/types";
import { perplexityClient } from "@/lib/perplexity/client";

interface RiskWeighting {
  direction: "increase" | "decrease" | "neutral";
  magnitude: number; // 0-10 scale
  confidence: number; // 0-1
  reasoning: string;
  components: {
    supplyDisruption: number; // 0-10
    marketSentiment: number; // 0-10
    companyExposure: number; // 0-10
    geopoliticalSeverity: number; // 0-10
    historicalPrecedent: number; // 0-10
  };
}

/**
 * Ask Perplexity LLM to analyze the event and determine risk impact
 * This is the "grounded" approach - let the AI read the news and decide!
 */
export async function getLLMRiskWeighting(
  asset: Asset,
  event: Event,
  analysis: ImpactAnalysis
): Promise<RiskWeighting> {
  
  const prompt = `You are a geopolitical risk analyst. Analyze this event and determine its impact on ${asset.name} risk.

**EVENT:**
${event.title}
${event.description}

**CURRENT RISK LEVEL:** ${asset.currentRiskScore}/10

**ANALYSIS SUMMARY:**
${analysis.impacts.map(i => `- ${i.order.toUpperCase()}: ${i.description}`).join('\n')}

**YOUR TASK:**
Read the event carefully and determine:

1. **Direction**: Should risk INCREASE, DECREASE, or stay NEUTRAL?
   - INCREASE if: Supply disruption, conflict escalation, production shutdown, sanctions, political instability
   - DECREASE if: Resolution, increased production, stability, trade agreements, positive developments
   - NEUTRAL if: Minor news with no clear impact

2. **Magnitude**: How much should it change? (0-10 scale)
   - 0-2: Negligible (minor news, limited scope)
   - 3-4: Moderate (affects one region/company)
   - 5-6: Significant (major company/region affected)
   - 7-8: Severe (global supply concerns)
   - 9-10: Critical (existential threat, war, complete shutdown)

3. **Component Scores** (0-10 each):
   - Supply Disruption: How much is physical supply affected?
   - Market Sentiment: How will investors react?
   - Company Exposure: Are major companies directly impacted?
   - Geopolitical Severity: How severe is the political/military situation?
   - Historical Precedent: How does this compare to past events?

**EXAMPLES:**
- "Pipeline temporarily shut after security incident" → INCREASE by 6-7 (supply disruption, uncertainty)
- "Mine strike resolved after 3 days" → DECREASE by 3-4 (production resumes)
- "OPEC maintains quotas" → NEUTRAL or slight DECREASE by 1-2 (stability)
- "War escalates in major oil region" → INCREASE by 9-10 (severe disruption)

**CRITICAL RULES:**
- Read the event carefully - don't just use keywords
- Pipeline shutdown = INCREASE risk (supply disruption!)
- Strike/conflict = INCREASE risk
- Resolution/agreement = DECREASE risk
- Think about the real-world impact on supply and prices

Return ONLY a JSON object (no markdown):
{
  "direction": "increase|decrease|neutral",
  "magnitude": <number 0-10>,
  "confidence": <number 0-1>,
  "reasoning": "<1-2 sentence explanation>",
  "components": {
    "supplyDisruption": <0-10>,
    "marketSentiment": <0-10>,
    "companyExposure": <0-10>,
    "geopoliticalSeverity": <0-10>,
    "historicalPrecedent": <0-10>
  }
}`;

  try {
    console.log("🤖 Asking LLM to determine risk direction...");
    
    const response = await perplexityClient.chat.completions.create({
      model: "sonar", // Use cheaper Sonar for risk weighting
      messages: [
        {
          role: "system",
          content: "You are a geopolitical risk analyst. Analyze events and determine their impact on asset risk levels. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Low temperature for consistent scoring
      max_tokens: 500
    });

    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : "{}";
    
    // Parse JSON (handle markdown code blocks)
    let weighting: RiskWeighting;
    try {
      // Try parsing markdown code block first
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        weighting = JSON.parse(jsonMatch[1]);
      } else {
        // Try direct JSON parse
        weighting = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("❌ LLM response parsing failed:", content);
      throw new Error("Invalid JSON response from LLM");
    }

    console.log(`✅ LLM Risk Weighting: ${weighting.direction.toUpperCase()} by ${weighting.magnitude}`);
    console.log(`   Reasoning: ${weighting.reasoning}`);
    
    return weighting;
    
  } catch (error: any) {
    console.error("❌ LLM risk weighting failed:", error);
    
    // Fallback to neutral if LLM fails
    return {
      direction: "neutral",
      magnitude: 0,
      confidence: 0.5,
      reasoning: "LLM analysis unavailable, using neutral default",
      components: {
        supplyDisruption: 5,
        marketSentiment: 5,
        companyExposure: 5,
        geopoliticalSeverity: 5,
        historicalPrecedent: 5
      }
    };
  }
}

/**
 * Apply LLM weighting to calculate new risk score
 */
export function applyLLMWeighting(
  currentScore: number,
  weighting: RiskWeighting
): number {
  let newScore = currentScore;
  
  if (weighting.direction === "increase") {
    // Increase by magnitude, but cap at 10
    newScore = Math.min(currentScore + weighting.magnitude, 10);
  } else if (weighting.direction === "decrease") {
    // Decrease by magnitude, but floor at 0
    newScore = Math.max(currentScore - weighting.magnitude, 0);
  }
  // neutral = no change
  
  // Round to 1 decimal
  return Math.round(newScore * 10) / 10;
}
