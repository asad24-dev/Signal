// Analyze Custom Event with Live Perplexity API (ACT II)
// POST /api/analyze - Live analysis of user-provided event

import { NextRequest, NextResponse } from "next/server";
import { getAssetById } from "@/lib/data/assets";
import { analyzeEventImpact } from "@/lib/perplexity/chat";
import { calculateRiskScore, scoreToLevel } from "@/lib/risk/scorer";
import { getLLMRiskWeighting, applyLLMWeighting } from "@/lib/risk/llm-scorer";
import { classifyEventType } from "@/lib/feeds/classifier";
import type { RiskSignal, Event } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { assetId, eventText, eventSource } = body;
    
    if (!assetId || !eventText) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: assetId, eventText"
        },
        { status: 400 }
      );
    }
    
    console.log(`🔥 ACT II: Live analysis for ${assetId}`);
    console.log(`   Event: ${eventText.slice(0, 100)}...`);
    
    // Get asset
    const asset = getAssetById(assetId);
    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: `Asset not found: ${assetId}`
        },
        { status: 404 }
      );
    }
    
    // Create event object
    const event: Event = {
      title: eventText.split('.')[0] || eventText.slice(0, 100),
      description: eventText,
      source: eventSource || {
        name: "User Provided",
        url: "",
        snippet: eventText.slice(0, 200),
        publishedAt: new Date(),
        credibility: 0.85
      },
      location: {
        country: "Unknown",
        coordinates: [0, 0] as [number, number]
      },
      eventType: classifyEventType(eventText), // ✅ AI-powered classification
      detectedAt: new Date()
    };
    
    console.log(`   Event type classified as: ${event.eventType}`);
    
    console.log("🤖 Calling Perplexity API for live analysis...");
    
    // LIVE PERPLEXITY API CALL
    const analysis = await analyzeEventImpact(asset, event, {
      model: "sonar-pro",
      searchType: "pro" // Use Pro Search for deep reasoning
    });
    
    const analysisTime = Date.now() - startTime;
    console.log(`✅ Live analysis complete: ${analysisTime}ms`);
    console.log(`   Citations: ${analysis.citations.length}`);
    console.log(`   Impacts: ${analysis.impacts.length}`);
    console.log(`   Opportunities: ${analysis.opportunities.length}`);
    
    // ✨ NEW: Get LLM-powered risk weighting (reads the news and decides!)
    console.log("🧠 Getting LLM risk weighting...");
    const llmWeighting = await getLLMRiskWeighting(asset, event, analysis);
    
    // Apply LLM weighting to current score
    const newRiskValue = applyLLMWeighting(asset.currentRiskScore, llmWeighting);
    
    // Still use traditional scorer for component breakdown (UI display)
    const riskScore = calculateRiskScore(asset, event, analysis);
    
    // Override the value with LLM-determined score
    riskScore.value = newRiskValue;
    riskScore.level = scoreToLevel(newRiskValue);
    
    console.log(`   Risk: ${asset.currentRiskScore} → ${riskScore.value} (${riskScore.level})`);
    console.log(`   LLM Decision: ${llmWeighting.direction.toUpperCase()} by ${llmWeighting.magnitude}`);
    
    // Create risk signal
    const signal: RiskSignal = {
      id: `signal-${Date.now()}`,
      assetId: asset.id,
      timestamp: new Date(),
      riskScore: riskScore.value,
      riskLevel: riskScore.level,
      previousRiskScore: asset.currentRiskScore,
      riskChange: riskScore.value - asset.currentRiskScore,
      event,
      analysis,
      confidence: 0.85, // Slightly lower for live analysis
      severity: riskScore.value,
      urgency: 7,
      status: "active"
    };
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      signal,
      before: {
        value: asset.currentRiskScore,
        level: asset.riskLevel,
        components: [],
        calculatedAt: new Date()
      },
      after: riskScore,
      responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("❌ Live analysis failed:", error);
    
    // ACT II error handling: Show loading indefinitely (as per requirements)
    // But return error for client to handle
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Analysis failed",
        details: error.toString(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
