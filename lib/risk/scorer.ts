// Risk Scoring Algorithm
// Calculates quantitative risk scores from event analysis

import type { Asset, Event, ImpactAnalysis, RiskScore, RiskLevel, RiskComponent } from "@/types";

/**
 * Calculate comprehensive risk score from event analysis
 */
export function calculateRiskScore(
  asset: Asset,
  event: Event,
  analysis: ImpactAnalysis
): RiskScore {
  const components: RiskComponent[] = [
    {
      factor: "Supply Disruption",
      weight: 0.30,
      score: scoreSupplyDisruption(event, analysis),
      description: "Impact on global supply availability"
    },
    {
      factor: "Market Sentiment",
      weight: 0.20,
      score: scoreMarketSentiment(analysis),
      description: "Investor reaction and market volatility"
    },
    {
      factor: "Company Exposure",
      weight: 0.25,
      score: scoreCompanyExposure(asset, analysis),
      description: "Direct exposure of key companies"
    },
    {
      factor: "Geopolitical Severity",
      weight: 0.15,
      score: scoreGeopoliticalSeverity(event),
      description: "Political stability and conflict risk"
    },
    {
      factor: "Historical Precedent",
      weight: 0.10,
      score: scoreHistoricalPrecedent(asset, event, analysis),
      description: "Comparison to past similar events"
    }
  ];

  // Weighted average
  const totalScore = components.reduce(
    (sum, component) => sum + (component.weight * component.score),
    0
  );

  return {
    value: Math.round(totalScore * 10) / 10,
    level: scoreToLevel(totalScore),
    components,
    calculatedAt: new Date()
  };
}

/**
 * Score supply disruption impact (0-10)
 */
function scoreSupplyDisruption(event: Event, analysis: ImpactAnalysis): number {
  const primaryImpact = analysis.impacts.find(i => i.order === "primary");
  if (!primaryImpact) return 0;

  // Extract percentage from description
  const percentMatch = primaryImpact.description.match(/(\d+(?:\.\d+)?)%/);
  const supplyPercent = percentMatch ? parseFloat(percentMatch[1]) : 0;

  // Score based on supply disruption percentage
  // 0-5% = Low (0-3)
  // 5-15% = Moderate (3-6)
  // 15-30% = Elevated (6-8)
  // 30%+ = Critical (8-10)
  if (supplyPercent >= 30) return 9.5;
  if (supplyPercent >= 15) return 7.0;
  if (supplyPercent >= 5) return 4.5;
  return Math.min(supplyPercent / 2, 3.0);
}

/**
 * Score market sentiment impact (0-10)
 */
function scoreMarketSentiment(analysis: ImpactAnalysis): number {
  // Count affected entities and their impact magnitude
  const affectedCount = analysis.impacts.reduce(
    (sum, impact) => sum + impact.affectedEntities.length,
    0
  );

  const avgMagnitude = analysis.impacts.reduce(
    (sum, impact) => sum + impact.magnitude,
    0
  ) / Math.max(analysis.impacts.length, 1);

  // More affected entities = higher market concern
  const entityFactor = Math.min(affectedCount / 5, 1) * 5;
  const magnitudeFactor = avgMagnitude * 0.5;

  return Math.min(entityFactor + magnitudeFactor, 10);
}

/**
 * Score company exposure (0-10)
 */
function scoreCompanyExposure(asset: Asset, analysis: ImpactAnalysis): number {
  const firstOrderImpact = analysis.impacts.find(i => i.order === "first");
  if (!firstOrderImpact) return 5; // Default moderate

  // Check if high-exposure companies are affected
  const highExposureCompanies = asset.monitoringConfig.relatedCompanies
    .filter(c => c.exposure >= 70);

  const affectedHighExposure = firstOrderImpact.affectedEntities.filter(entity =>
    highExposureCompanies.some(c => c.name === entity.name)
  );

  // Calculate average impact on high-exposure companies
  if (affectedHighExposure.length === 0) return 3;

  const avgImpact = affectedHighExposure.reduce(
    (sum, entity) => sum + entity.impactMagnitude,
    0
  ) / affectedHighExposure.length;

  return avgImpact;
}

/**
 * Score geopolitical severity (0-10)
 */
function scoreGeopoliticalSeverity(event: Event): number {
  const severityMap: Record<string, number> = {
    strike: 6.0,
    natural_disaster: 7.5,
    political_unrest: 8.0,
    regulation: 5.0,
    trade_policy: 6.5,
    conflict: 9.0,
    technology_disruption: 4.0,
    market_movement: 3.0
  };

  return severityMap[event.eventType] || 5.0;
}

/**
 * Score based on historical precedent (0-10)
 */
function scoreHistoricalPrecedent(
  asset: Asset,
  event: Event,
  analysis: ImpactAnalysis
): number {
  // Look for historical references in analysis
  const hasHistoricalData = analysis.impacts.some(impact =>
    impact.description.toLowerCase().includes("historical") ||
    impact.description.toLowerCase().includes("similar") ||
    impact.description.toLowerCase().includes("past")
  );

  // Check opportunities for historical patterns
  const hasHistoricalOpportunities = analysis.opportunities.some(opp =>
    opp.description.toLowerCase().includes("historically") ||
    opp.description.toLowerCase().includes("pattern")
  );

  // Higher score if we have good historical precedent
  if (hasHistoricalData && hasHistoricalOpportunities) return 8.0;
  if (hasHistoricalData || hasHistoricalOpportunities) return 6.0;
  return 4.0; // Limited historical data
}

/**
 * Convert numeric score to risk level
 */
export function scoreToLevel(score: number): RiskLevel {
  if (score >= 8) return "critical";
  if (score >= 6) return "elevated";
  if (score >= 3) return "moderate";
  return "low";
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(level: RiskLevel): string {
  const colors = {
    low: "#10b981",      // green
    moderate: "#f59e0b", // yellow
    elevated: "#f97316", // orange
    critical: "#ef4444"  // red
  };
  return colors[level];
}

/**
 * Get risk level label
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  const labels = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    elevated: "Elevated Risk",
    critical: "Critical Risk"
  };
  return labels[level];
}
