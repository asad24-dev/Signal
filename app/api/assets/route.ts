// Get All Assets
// GET /api/assets - Return list of all monitored assets

import { NextResponse } from "next/server";
import { ASSETS } from "@/lib/data/assets";

export async function GET() {
  console.log("📊 Fetching all assets...");
  
  try {
    return NextResponse.json({
      success: true,
      assets: ASSETS,
      total: ASSETS.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("❌ Error fetching assets:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch assets"
      },
      { status: 500 }
    );
  }
}
