// Development Debug Endpoint
// GET /api/dev/debug - Show raw API responses and system state

import { NextRequest, NextResponse } from "next/server";
import { ASSETS } from "@/lib/data/assets";
import { DEMO_SCENARIOS } from "@/lib/data/scenarios";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "overview";
  
  // Check if in demo mode
  const isDemoMode = process.env.DEMO_MODE === "true";
  
  console.log(`🔍 Debug endpoint accessed: mode=${mode}`);
  
  if (mode === "overview") {
    return NextResponse.json({
      system: {
        demoMode: isDemoMode,
        apiKeySet: !!process.env.PERPLEXITY_API_KEY,
        apiKeyPrefix: process.env.PERPLEXITY_API_KEY?.slice(0, 8) || "NOT_SET",
        timestamp: new Date().toISOString()
      },
      data: {
        assetsCount: ASSETS.length,
        assets: ASSETS.map(a => ({ id: a.id, name: a.name, riskScore: a.currentRiskScore })),
        scenariosCount: DEMO_SCENARIOS.length,
        scenarios: DEMO_SCENARIOS.map(s => ({ id: s.id, name: s.name, assetId: s.assetId }))
      },
      endpoints: {
        test: "/api/test-perplexity",
        assets: "/api/assets",
        assetById: "/api/assets/[id]",
        inject: "POST /api/inject",
        analyze: "POST /api/analyze",
        debug: "/api/dev/debug"
      }
    });
  }
  
  if (mode === "assets") {
    return NextResponse.json({
      assets: ASSETS,
      count: ASSETS.length
    });
  }
  
  if (mode === "scenarios") {
    return NextResponse.json({
      scenarios: DEMO_SCENARIOS,
      count: DEMO_SCENARIOS.length
    });
  }
  
  return NextResponse.json({
    error: "Unknown mode",
    validModes: ["overview", "assets", "scenarios"]
  });
}
