// Get Single Asset by ID
// GET /api/assets/[id] - Return detailed asset information

import { NextRequest, NextResponse } from "next/server";
import { getAssetById } from "@/lib/data/assets";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  console.log(`📊 Fetching asset: ${id}`);
  
  try {
    const asset = getAssetById(id);
    
    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: `Asset not found: ${id}`
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      asset,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error(`❌ Error fetching asset ${id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch asset"
      },
      { status: 500 }
    );
  }
}
