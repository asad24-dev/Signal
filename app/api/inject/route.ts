// Inject Pre-loaded Demo Scenario (ACT I)
// POST /api/inject - Run curated demo with pre-loaded analysis

import { NextRequest, NextResponse } from "next/server";
import { getScenarioById } from "@/lib/data/scenarios";
import { getAssetById } from "@/lib/data/assets";
import { calculateRiskScore } from "@/lib/risk/scorer";
import type { RiskSignal, SimulationStep } from "@/types";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { scenarioId } = body;
    
    console.log(`🎬 ACT I: Injecting curated scenario: ${scenarioId}`);
    
    // Get pre-loaded scenario
    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        {
          success: false,
          error: `Scenario not found: ${scenarioId}`
        },
        { status: 404 }
      );
    }
    
    // Get asset
    const asset = getAssetById(scenario.assetId);
    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: `Asset not found: ${scenario.assetId}`
        },
        { status: 404 }
      );
    }
    
    // Simulate realistic processing time (for demo effect)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use pre-loaded analysis
    const analysis = scenario.preloadedAnalysis!;
    
    // Calculate risk score from pre-loaded analysis
    const event = {
      title: scenario.name,
      description: scenario.eventText,
      source: {
        name: "Demo Event Source",
        url: "https://example.com",
        snippet: scenario.eventText.slice(0, 200),
        publishedAt: new Date(),
        credibility: 0.95
      },
      location: {
        country: "Chile",
        region: "Atacama",
        coordinates: [-23.6980, -68.2650] as [number, number]
      },
      eventType: scenario.eventType,
      detectedAt: new Date()
    };
    
    const riskScore = calculateRiskScore(asset, event, analysis);
    
    // Create simulation timeline for visualization
    const timeline: SimulationStep[] = [
      {
        step: 1,
        timestamp: Date.now(),
        description: "Event detected and validated",
        type: "event",
        data: { event }
      },
      {
        step: 2,
        timestamp: Date.now() + 500,
        description: "Analyzing primary supply chain impact",
        type: "analysis",
        data: { impact: analysis.impacts[0] }
      },
      {
        step: 3,
        timestamp: Date.now() + 1000,
        description: "Identifying first-order company exposures",
        type: "impact",
        data: { impact: analysis.impacts[1] }
      },
      {
        step: 4,
        timestamp: Date.now() + 1500,
        description: "Calculating trading opportunities",
        type: "opportunity",
        data: { opportunities: analysis.opportunities }
      }
    ];
    
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
      confidence: 0.92,
      severity: riskScore.value,
      urgency: 8,
      status: "active"
    };
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ ACT I complete: Risk ${asset.currentRiskScore} → ${riskScore.value}`);
    console.log(`   Citations: ${analysis.citations.length}`);
    console.log(`   Impacts: ${analysis.impacts.length}`);
    console.log(`   Opportunities: ${analysis.opportunities.length}`);
    console.log(`   Response time: ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      simulation: {
        before: {
          value: asset.currentRiskScore,
          level: asset.riskLevel,
          components: [],
          calculatedAt: new Date()
        },
        after: riskScore,
        signal,
        timeline
      },
      responseTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error("❌ Injection failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Injection failed",
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
