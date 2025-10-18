// Feed Stream API - Returns current headlines with triage status

import { NextResponse } from 'next/server';
import { Headline } from '@/lib/feeds/types';

// In-memory storage for current feed state
// In production, this would be Redis or similar
let currentHeadlines: Headline[] = [];
let lastScanTime: Date | null = null;

export function GET() {
  return NextResponse.json({
    success: true,
    headlines: currentHeadlines,
    lastScan: lastScanTime,
    count: currentHeadlines.length,
    flaggedCount: currentHeadlines.filter(h => h.triageStatus === 'flagged').length
  });
}

// Allow other API routes to update the feed state
export function updateFeedState(headlines: Headline[]) {
  currentHeadlines = headlines;
  lastScanTime = new Date();
}

export function getFeedState() {
  return {
    headlines: currentHeadlines,
    lastScan: lastScanTime
  };
}
