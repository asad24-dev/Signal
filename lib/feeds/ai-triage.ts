// AI Triage with Perplexity Sonar (cheap, fast model)

import { perplexityClient } from '../perplexity/client';
import { Headline, AITriageResult } from './types';
import { FEED_CONFIG } from './config';

/**
 * Use Perplexity Sonar to score headline relevance
 * Sonar is 10x cheaper than Sonar Pro
 */
export async function aiTriageHeadline(
  headline: Headline,
  assetName: string
): Promise<AITriageResult> {
  const prompt = `You are a geopolitical risk detection system.

Headline: "${headline.title}"
Source: ${headline.source}
Asset: ${assetName}

Rate this headline's relevance to ${assetName} supply chain disruptions or geopolitical risk (0-10).

Respond ONLY with valid JSON (no markdown):
{
  "score": 7.5,
  "reason": "brief explanation",
  "relevant": true,
  "assets": ["${assetName.toLowerCase()}"]
}`;

  try {
    const response = await perplexityClient.chat.completions.create({
      model: 'sonar',  // Fast, cheap model
      messages: [
        {
          role: 'system',
          content: 'You are a risk detection AI. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,  // Low temperature for consistent scoring
      max_tokens: 100    // Keep it short and cheap
    });

    const content = response.choices[0]?.message?.content;
    const contentStr = typeof content === 'string' ? content : '';
    
    // Try to parse JSON response
    try {
      const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.score || 0,
          reason: parsed.reason || 'No reason provided',
          relevant: parsed.relevant || false,
          assets: parsed.assets || []
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI triage response:', parseError);
    }

    // Fallback if parsing fails
    return {
      score: 0,
      reason: 'Failed to parse AI response',
      relevant: false,
      assets: []
    };

  } catch (error) {
    console.error('AI triage error:', error);
    
    // Return safe fallback
    return {
      score: headline.confidence * 10, // Use keyword score as fallback
      reason: 'AI triage unavailable, using keyword score',
      relevant: headline.confidence > 0.5,
      assets: headline.matchedAssets
    };
  }
}

/**
 * Batch AI triage for multiple headlines
 * Processes in parallel for speed
 */
export async function batchAITriage(
  headlines: Headline[]
): Promise<Map<string, AITriageResult>> {
  const results = new Map<string, AITriageResult>();

  // Process in parallel (but respect rate limits)
  const promises = headlines.map(async (headline) => {
    // Use first matched asset, or 'Unknown' if none
    const assetName = headline.matchedAssets[0] || 'Unknown';
    
    try {
      const result = await aiTriageHeadline(headline, assetName);
      results.set(headline.id, result);
    } catch (error) {
      console.error(`Failed to triage headline ${headline.id}:`, error);
      // Set fallback result
      results.set(headline.id, {
        score: headline.confidence * 10,
        reason: 'Triage failed',
        relevant: false,
        assets: []
      });
    }
  });

  await Promise.all(promises);

  console.log(`AI triaged ${results.size} headlines`);
  
  return results;
}

/**
 * Apply AI triage results to headlines
 */
export function applyAITriage(
  headlines: Headline[],
  triageResults: Map<string, AITriageResult>
): Headline[] {
  return headlines.map(headline => {
    const aiResult = triageResults.get(headline.id);
    
    if (!aiResult) {
      return headline;
    }

    // Update headline with AI scores
    return {
      ...headline,
      aiScore: aiResult.score,
      aiReason: aiResult.reason,
      // Boost confidence if AI agrees
      confidence: aiResult.relevant 
        ? Math.max(headline.confidence, aiResult.score / 10)
        : headline.confidence * 0.5,
      triageStatus: aiResult.relevant && aiResult.score >= 7 ? 'flagged' : headline.triageStatus
    };
  });
}
