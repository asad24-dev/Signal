// Smart Keyword Triage - 90% noise reduction before AI

import { Headline, TriageResult } from './types';
import { KEYWORD_PATTERNS } from './config';

/**
 * Check if headline matches asset-specific keyword patterns
 */
function matchAssetKeywords(
  headline: Headline,
  assetId: string
): { matches: boolean; keywords: string[]; score: number } {
  const pattern = KEYWORD_PATTERNS[assetId as keyof typeof KEYWORD_PATTERNS];
  if (!pattern) {
    return { matches: false, keywords: [], score: 0 };
  }

  const text = `${headline.title} ${headline.description || ''}`.toLowerCase();
  const matchedKeywords: string[] = [];
  let score = 0;

  // Check primary keywords (highest weight)
  const primaryMatches = pattern.primary.filter(kw => text.includes(kw.toLowerCase()));
  if (primaryMatches.length > 0) {
    matchedKeywords.push(...primaryMatches);
    score += 0.4 * primaryMatches.length;
  }

  // Check location keywords
  const locationMatches = pattern.locations.filter(kw => text.includes(kw.toLowerCase()));
  if (locationMatches.length > 0) {
    matchedKeywords.push(...locationMatches);
    score += 0.2 * locationMatches.length;
  }

  // Check event keywords
  const eventMatches = pattern.events.filter(kw => text.includes(kw.toLowerCase()));
  if (eventMatches.length > 0) {
    matchedKeywords.push(...eventMatches);
    score += 0.3 * eventMatches.length;
  }

  // Check company keywords
  const companyMatches = pattern.companies.filter(kw => text.includes(kw.toLowerCase()));
  if (companyMatches.length > 0) {
    matchedKeywords.push(...companyMatches);
    score += 0.1 * companyMatches.length;
  }

  // Consider it a match if:
  // 1. Has primary keyword + (location OR event)
  // 2. Score > 0.5
  const hasPrimary = primaryMatches.length > 0;
  const hasContext = locationMatches.length > 0 || eventMatches.length > 0;
  const matches = (hasPrimary && hasContext) || score > 0.5;

  // Normalize score to 0-1 range
  score = Math.min(score, 1.0);

  return { matches, keywords: matchedKeywords, score };
}

/**
 * Triage headlines using keyword matching
 * This filters out ~90% of noise before expensive AI calls
 */
export function triageHeadlines(headlines: Headline[]): TriageResult[] {
  const results: TriageResult[] = [];

  for (const headline of headlines) {
    // Skip triage for Perplexity-discovered headlines (already AI-triaged)
    if (headline.id.startsWith('perplexity-')) {
      results.push({
        headline: headline,
        flagged: headline.triageStatus === 'flagged',
        confidence: headline.confidence,
        matchedAssets: headline.matchedAssets,
        matchedKeywords: headline.matchedKeywords
      });
      continue;
    }

    let bestMatch = { matches: false, keywords: [] as string[], score: 0, asset: '' };

    // Check against all asset patterns
    for (const assetId of Object.keys(KEYWORD_PATTERNS)) {
      const match = matchAssetKeywords(headline, assetId);
      if (match.matches && match.score > bestMatch.score) {
        bestMatch = { ...match, asset: assetId };
      }
    }

    // Create triage result
    const result: TriageResult = {
      headline: {
        ...headline,
        triageStatus: bestMatch.matches ? 'flagged' : 'noise',
        matchedAssets: bestMatch.matches ? [bestMatch.asset] : [],
        matchedKeywords: bestMatch.keywords,
        confidence: bestMatch.score
      },
      flagged: bestMatch.matches,
      confidence: bestMatch.score,
      matchedAssets: bestMatch.matches ? [bestMatch.asset] : [],
      matchedKeywords: bestMatch.keywords
    };

    results.push(result);
  }

  // Sort by confidence (highest first)
  results.sort((a, b) => b.confidence - a.confidence);

  const flaggedCount = results.filter(r => r.flagged).length;
  console.log(`Keyword triage: ${flaggedCount}/${headlines.length} flagged (${Math.round(flaggedCount/headlines.length*100)}%)`);

  return results;
}

/**
 * Get top N flagged headlines for AI triage
 */
export function getTopFlagged(results: TriageResult[], limit: number = 10): TriageResult[] {
  return results
    .filter(r => r.flagged)
    .slice(0, limit);
}
