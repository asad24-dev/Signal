// Batch Analysis - Analyze All Flagged Headlines at Once
// POST /api/analyze-batch - Holistic multi-asset risk analysis

import { NextRequest, NextResponse } from "next/server";
import { getAssetById } from "@/lib/data/assets";
import { analyzeBatchImpact } from "@/lib/perplexity/batch-chat";
import { scoreToLevel } from "@/lib/risk/scorer";
import type { Headline } from "@/lib/feeds/types";
import type { RiskSignal } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { headlines } = body;
    
    if (!headlines || !Array.isArray(headlines)) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: headlines (array)"
        },
        { status: 400 }
      );
    }
    
    if (headlines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No headlines to analyze"
        },
        { status: 400 }
      );
    }
    
    console.log(`🎯 BATCH ANALYSIS: Analyzing ${headlines.length} headlines`);
    
    // Get all assets
    const lithium = getAssetById("lithium");
    const oil = getAssetById("oil");
    const semiconductors = getAssetById("semiconductors");
    
    if (!lithium || !oil || !semiconductors) {
      return NextResponse.json(
        {
          success: false,
          error: "Assets not found"
        },
        { status: 404 }
      );
    }
    
    // Group headlines by asset
    const lithiumHeadlines = headlines.filter((h: Headline) => 
      h.matchedAssets.includes("lithium")
    );
    const oilHeadlines = headlines.filter((h: Headline) => 
      h.matchedAssets.includes("oil")
    );
    const semiconductorHeadlines = headlines.filter((h: Headline) => 
      h.matchedAssets.includes("semiconductors")
    );
    
    console.log(`   Lithium: ${lithiumHeadlines.length} headlines`);
    console.log(`   Oil: ${oilHeadlines.length} headlines`);
    console.log(`   Semiconductors: ${semiconductorHeadlines.length} headlines`);
    
    console.log("🤖 Calling Perplexity API for holistic batch analysis...");
    
    // LIVE PERPLEXITY BATCH ANALYSIS
    // This analyzes ALL headlines together with cross-asset impact consideration
    const batchAnalysis = await analyzeBatchImpact(
      {
        lithium: { asset: lithium, headlines: lithiumHeadlines },
        oil: { asset: oil, headlines: oilHeadlines },
        semiconductors: { asset: semiconductors, headlines: semiconductorHeadlines }
      },
      {
        model: "sonar-pro",
        searchType: "pro"
      }
    );
    
    const analysisTime = Date.now() - startTime;
    console.log(`✅ Batch analysis complete: ${analysisTime}ms`);
    console.log(`   Citations: ${batchAnalysis.citations.length}`);
    console.log(`   Lithium: ${batchAnalysis.assetChanges.lithium.currentScore} → ${batchAnalysis.assetChanges.lithium.newScore}`);
    console.log(`   Oil: ${batchAnalysis.assetChanges.oil.currentScore} → ${batchAnalysis.assetChanges.oil.newScore}`);
    console.log(`   Semiconductors: ${batchAnalysis.assetChanges.semiconductors.currentScore} → ${batchAnalysis.assetChanges.semiconductors.newScore}`);
    
    // Create risk signals for each asset
    const signals: RiskSignal[] = [];
    
    // Lithium signal
    if (lithiumHeadlines.length > 0) {
      signals.push({
        id: `batch-lithium-${Date.now()}`,
        assetId: "lithium",
        timestamp: new Date(),
        riskScore: batchAnalysis.assetChanges.lithium.newScore,
        riskLevel: scoreToLevel(batchAnalysis.assetChanges.lithium.newScore),
        previousRiskScore: batchAnalysis.assetChanges.lithium.currentScore,
        riskChange: batchAnalysis.assetChanges.lithium.change,
        event: {
          title: `Batch Analysis: ${lithiumHeadlines.length} Lithium Signals`,
          description: batchAnalysis.assetChanges.lithium.reasoning,
          source: {
            name: "Batch Analysis",
            url: "",
            snippet: batchAnalysis.assetChanges.lithium.reasoning,
            publishedAt: new Date(),
            credibility: 0.9
          },
          location: {
            country: "Global",
            coordinates: [0, 0] as [number, number]
          },
          eventType: "market_movement",
          detectedAt: new Date()
        },
        analysis: {
          summary: batchAnalysis.assetChanges.lithium.reasoning,
          impacts: batchAnalysis.assetChanges.lithium.impacts || [],
          opportunities: batchAnalysis.opportunities || [], // All opportunities available for each asset
          citations: batchAnalysis.citations
        },
        confidence: 0.85,
        severity: batchAnalysis.assetChanges.lithium.newScore,
        urgency: 7,
        status: "active"
      });
    }
    
    // Oil signal
    if (oilHeadlines.length > 0) {
      signals.push({
        id: `batch-oil-${Date.now()}`,
        assetId: "oil",
        timestamp: new Date(),
        riskScore: batchAnalysis.assetChanges.oil.newScore,
        riskLevel: scoreToLevel(batchAnalysis.assetChanges.oil.newScore),
        previousRiskScore: batchAnalysis.assetChanges.oil.currentScore,
        riskChange: batchAnalysis.assetChanges.oil.change,
        event: {
          title: `Batch Analysis: ${oilHeadlines.length} Oil Signals`,
          description: batchAnalysis.assetChanges.oil.reasoning,
          source: {
            name: "Batch Analysis",
            url: "",
            snippet: batchAnalysis.assetChanges.oil.reasoning,
            publishedAt: new Date(),
            credibility: 0.9
          },
          location: {
            country: "Global",
            coordinates: [0, 0] as [number, number]
          },
          eventType: "market_movement",
          detectedAt: new Date()
        },
        analysis: {
          summary: batchAnalysis.assetChanges.oil.reasoning,
          impacts: batchAnalysis.assetChanges.oil.impacts || [],
          opportunities: batchAnalysis.opportunities || [], // All opportunities available for each asset
          citations: batchAnalysis.citations
        },
        confidence: 0.85,
        severity: batchAnalysis.assetChanges.oil.newScore,
        urgency: 7,
        status: "active"
      });
    }
    
    // Semiconductors signal
    if (semiconductorHeadlines.length > 0) {
      signals.push({
        id: `batch-semiconductors-${Date.now()}`,
        assetId: "semiconductors",
        timestamp: new Date(),
        riskScore: batchAnalysis.assetChanges.semiconductors.newScore,
        riskLevel: scoreToLevel(batchAnalysis.assetChanges.semiconductors.newScore),
        previousRiskScore: batchAnalysis.assetChanges.semiconductors.currentScore,
        riskChange: batchAnalysis.assetChanges.semiconductors.change,
        event: {
          title: `Batch Analysis: ${semiconductorHeadlines.length} Semiconductor Signals`,
          description: batchAnalysis.assetChanges.semiconductors.reasoning,
          source: {
            name: "Batch Analysis",
            url: "",
            snippet: batchAnalysis.assetChanges.semiconductors.reasoning,
            publishedAt: new Date(),
            credibility: 0.9
          },
          location: {
            country: "Global",
            coordinates: [0, 0] as [number, number]
          },
          eventType: "market_movement",
          detectedAt: new Date()
        },
        analysis: {
          summary: batchAnalysis.assetChanges.semiconductors.reasoning,
          impacts: batchAnalysis.assetChanges.semiconductors.impacts || [],
          opportunities: batchAnalysis.opportunities || [], // All opportunities available for each asset
          citations: batchAnalysis.citations
        },
        confidence: 0.85,
        severity: batchAnalysis.assetChanges.semiconductors.newScore,
        urgency: 7,
        status: "active"
      });
    }
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      signals,
      batchAnalysis: {
        assetChanges: batchAnalysis.assetChanges,
        opportunities: batchAnalysis.opportunities,
        citations: batchAnalysis.citations,
        crossAssetImpacts: batchAnalysis.crossAssetImpacts
      },
      responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("❌ Batch analysis failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Batch analysis failed",
        details: error.toString(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
