// Feed Scan API - Triggers feed fetch, triage, and AI analysis

import { NextResponse } from 'next/server';
import { fetchAllFeeds, getMockHeadlines } from '@/lib/feeds/aggregator';
import { triageHeadlines, getTopFlagged } from '@/lib/feeds/triage';
import { batchAITriage, applyAITriage } from '@/lib/feeds/ai-triage';
import { hybridDiscovery } from '@/lib/feeds/perplexity-discovery';
import { FEED_CONFIG } from '@/lib/feeds/config';
import { updateFeedState } from '../stream/route';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mode = 'auto', enableAI = true, usePerplexity = true } = body;

    const startTime = Date.now();
    console.log('🔍 Starting feed scan...');
    console.log(`   Mode: ${mode}, AI: ${enableAI}, Perplexity: ${usePerplexity}`);

    // Step 1: Fetch headlines from RSS or mock
    let headlines;
    if (mode === 'mock') {
      console.log('Using mock headlines');
      headlines = getMockHeadlines();
    } else {
      console.log('Fetching real RSS feeds');
      headlines = await fetchAllFeeds();
      
      // Fallback to mock if no headlines fetched
      if (headlines.length === 0) {
        console.log('No headlines from RSS, using mock fallback');
        headlines = getMockHeadlines();
      }
    }

    console.log(`✅ Fetched ${headlines.length} RSS headlines`);

    // Step 1.5: Hybrid Discovery - Add Perplexity discoveries
    if (usePerplexity && mode !== 'mock') {
      headlines = await hybridDiscovery(headlines, true);
      console.log(`✅ After Perplexity discovery: ${headlines.length} total headlines`);
    }

    // Step 2: Keyword triage (FREE - filters 90% of noise)
    const triageResults = triageHeadlines(headlines);
    const flaggedHeadlines = triageResults
      .filter(r => r.flagged)
      .map(r => r.headline);

    console.log(`✅ Keyword triage: ${flaggedHeadlines.length} flagged`);

    // Step 3: AI triage on top N flagged headlines (COSTS MONEY)
    let finalHeadlines = triageResults.map(r => r.headline);
    let aiTriageCount = 0;
    let estimatedCost = 0;

    if (enableAI && flaggedHeadlines.length > 0) {
      // Only AI-triage top N headlines
      const topFlagged = getTopFlagged(triageResults, FEED_CONFIG.triage.maxAITriagePerScan);
      const topHeadlines = topFlagged.map(r => r.headline);

      console.log(`🤖 AI triaging top ${topHeadlines.length} headlines...`);

      const aiResults = await batchAITriage(topHeadlines);
      finalHeadlines = applyAITriage(finalHeadlines, aiResults);

      aiTriageCount = topHeadlines.length;
      estimatedCost = aiTriageCount * FEED_CONFIG.costs.triageCostPerHeadline;

      console.log(`✅ AI triage complete: ${aiTriageCount} headlines, ~$${estimatedCost.toFixed(4)}`);
    }

    // Step 4: Sort by confidence and update feed state
    finalHeadlines.sort((a, b) => b.confidence - a.confidence);
    updateFeedState(finalHeadlines);

    const duration = Date.now() - startTime;
    
    const signals = finalHeadlines.filter(h => h.triageStatus === 'flagged');

    console.log(`🎉 Scan complete in ${duration}ms`);
    console.log(`📊 Found ${signals.length} signals from ${headlines.length} headlines`);

    return NextResponse.json({
      success: true,
      scan: {
        totalHeadlines: headlines.length,
        flaggedCount: flaggedHeadlines.length,
        aiTriagedCount: aiTriageCount,
        signalsCount: signals.length,
        timestamp: new Date(),
        duration,
        estimatedCost
      },
      headlines: finalHeadlines,
      signals
    });

  } catch (error) {
    console.error('Feed scan error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      // Fallback to mock headlines on error
      headlines: getMockHeadlines()
    }, { status: 500 });
  }
}

// GET endpoint to check scan status
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      mode: FEED_CONFIG.mode,
      scanInterval: FEED_CONFIG.scanning.interval,
      maxAITriagePerScan: FEED_CONFIG.triage.maxAITriagePerScan,
      estimatedCostPerScan: FEED_CONFIG.costs.estimatedCostPerScan,
      estimatedCostPerHour: FEED_CONFIG.costs.estimatedCostPerHour
    }
  });
}
