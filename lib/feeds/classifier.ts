// Event Type Classifier - Quick implementation
// lib/feeds/classifier.ts

import type { EventType } from "@/types";

/**
 * Classify event type from headline text
 * Free keyword-based approach (Option A)
 */
export function classifyEventType(text: string): EventType {
  const lower = text.toLowerCase();
  
  // Conflict/War
  if (lower.match(/war|conflict|attack|invasion|military|battle|combat|missile|strike force/i)) {
    return "conflict";
  }
  
  // Labor Strike/Protest
  if (lower.match(/\bstrike\b|protest|walkout|union|labor action|workers|picket/i)) {
    return "strike";
  }
  
  // Natural Disaster
  if (lower.match(/earthquake|flood|hurricane|typhoon|fire|wildfire|disaster|tsunami|drought/i)) {
    return "natural_disaster";
  }
  
  // Political Unrest
  if (lower.match(/coup|unrest|riot|revolution|uprising|protest|instability|regime change/i)) {
    return "political_unrest";
  }
  
  // Trade/Regulation
  if (lower.match(/sanction|ban|regulation|policy|tariff|embargo|restriction|compliance|law/i)) {
    return "trade_policy";
  }
  
  // Technology
  if (lower.match(/innovation|breakthrough|chip|semiconductor|ai|technology|patent|disruption/i)) {
    return "technology_disruption";
  }
  
  // Default
  return "market_movement";
}

/**
 * Get event severity score
 */
export function getEventSeverity(eventType: string): number {
  const severityMap: Record<string, number> = {
    market_movement: 3.0,
    technology_disruption: 4.0,
    regulation: 5.0,
    strike: 6.0,
    trade_policy: 6.5,
    natural_disaster: 7.5,
    political_unrest: 8.0,
    conflict: 9.0
  };
  
  return severityMap[eventType] || 5.0;
}
