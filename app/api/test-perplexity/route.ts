// Test Perplexity API Connection
// GET /api/test-perplexity - Verify API key and connection

import { NextRequest, NextResponse } from "next/server";
import perplexityClient from "@/lib/perplexity/client";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log("🧪 Testing Perplexity API connection...");
    
    // Simple test query
    const completion = await perplexityClient.chat.completions.create({
      model: "sonar",
      messages: [
        {
          role: "user",
          content: "What is the capital of France? Answer in one word."
        }
      ],
    });

    const response = (completion as any).choices?.[0]?.message?.content || "";
    const responseTime = Date.now() - startTime;

    console.log("✅ Perplexity API test successful");
    console.log(`   Response: ${response}`);
    console.log(`   Time: ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      message: "Perplexity API connection successful",
      response,
      responseTime,
      timestamp: new Date().toISOString(),
      apiKey: process.env.PERPLEXITY_API_KEY ? `${process.env.PERPLEXITY_API_KEY.slice(0, 8)}...` : "NOT_SET"
    });
    
  } catch (error: any) {
    console.error("❌ Perplexity API test failed:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        details: error.toString(),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
