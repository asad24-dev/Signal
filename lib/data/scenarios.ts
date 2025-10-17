// Pre-loaded Demo Scenarios for Signal
// ACT I: Curated Demo with Historical Event

import type { DemoScenario, ImpactAnalysis } from "@/types";

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "lithium-chile-strike",
    name: "Chilean Mining Strike - Salar de Atacama",
    assetId: "lithium",
    description: "Major strike at SQM's Salar de Atacama facility affecting 12% of global lithium supply",
    eventType: "strike",
    expectedRiskScore: 6.8,
    eventText: `Breaking: Workers at SQM's Salar de Atacama lithium facility have initiated an indefinite strike over wage disputes and working conditions. The facility, which produces approximately 12% of the world's lithium carbonate, has halted operations. Union spokesperson Carlos Mendoza stated: "We will not return until our demands are met." The strike affects approximately 800 workers and comes at a critical time as global demand for battery-grade lithium continues to surge.`,
    
    // Pre-loaded analysis for flawless demo (ACT I)
    preloadedAnalysis: {
      summary: "Strike at Chile's Salar de Atacama facility disrupts 12% of global lithium supply, directly impacting Tesla and Panasonic battery production with potential 6-8 week delivery delays. Historical patterns suggest Australian lithium miners will see 8-12% stock price increases.",
      
      impacts: [
        {
          order: "primary",
          description: "SQM's Salar de Atacama facility produces approximately 70,000 tonnes of lithium carbonate annually, representing 12% of global supply. With operations halted indefinitely, this creates immediate supply constraints in the spot market. Current lithium carbonate prices at $18,500/tonne could spike 15-20% within 2 weeks based on similar 2023 disruptions.",
          magnitude: 8.5,
          timeframe: "Immediate to 4 weeks",
          affectedEntities: [
            {
              type: "company",
              name: "SQM",
              symbol: "SQM",
              impactDescription: "Complete production halt at primary facility. Revenue impact estimated at $12-15M per week. Stock typically drops 5-8% on strike news.",
              impactMagnitude: 9
            },
            {
              type: "commodity",
              name: "Lithium Carbonate",
              impactDescription: "Spot prices expected to increase 15-20% due to supply shock. Long-term contracts may see force majeure clauses triggered.",
              impactMagnitude: 8
            }
          ],
          confidence: 0.92,
          citations: [
            {
              id: "cite-1",
              title: "SQM Salar de Atacama Production Capacity",
              url: "https://www.sqm.com/en/investors/production-capacity",
              source: "SQM Investor Relations",
              snippet: "Salar de Atacama operations capacity: 70,000 tonnes lithium carbonate per year",
              relevance: 0.98
            },
            {
              id: "cite-2",
              title: "Global Lithium Supply Analysis 2024",
              url: "https://www.benchmark-minerals.com/lithium-supply",
              source: "Benchmark Mineral Intelligence",
              snippet: "Chile accounts for 32% of global lithium production, with SQM's Atacama operations representing the largest single source.",
              relevance: 0.95
            }
          ]
        },
        
        {
          order: "first",
          description: "Tesla and Panasonic maintain 4-6 week lithium carbonate inventory for battery production. Both companies source approximately 25-30% of their lithium from SQM through long-term contracts. Extended strike (>6 weeks) would force production slowdowns at Gigafactory Nevada and trigger alternative sourcing at premium prices (+30-40% above contract rates).",
          magnitude: 7.5,
          timeframe: "6-8 weeks",
          affectedEntities: [
            {
              type: "company",
              name: "Tesla",
              symbol: "TSLA",
              impactDescription: "Gigafactory Nevada produces 35 GWh of battery capacity annually, requiring ~8,400 tonnes of lithium carbonate. SQM supplies 28% of this (~2,350 tonnes). Supply disruption could delay Model 3/Y production by 12-15 days in Q4 2025.",
              impactMagnitude: 7.8
            },
            {
              type: "company",
              name: "Panasonic",
              symbol: "PCRFY",
              impactDescription: "Battery division revenue $7.2B annually. SQM represents 24% of lithium sourcing. Will activate secondary suppliers (Albemarle, Ganfeng) but at 35-40% price premium, impacting Q4 margins by 180-220 basis points.",
              impactMagnitude: 7.2
            }
          ],
          confidence: 0.88,
          citations: [
            {
              id: "cite-3",
              title: "Tesla Gigafactory Nevada Supply Chain Report",
              url: "https://www.tesla.com/ns_videos/2023-impact-report.pdf",
              source: "Tesla Impact Report 2023",
              snippet: "Our Nevada facility maintains diversified lithium sourcing with primary contracts in Chile and Australia.",
              relevance: 0.89
            },
            {
              id: "cite-4",
              title: "Panasonic Battery Business Unit Disclosure",
              url: "https://www.panasonic.com/global/corporate/ir/pdf/disclosure-2024.pdf",
              source: "Panasonic Investor Relations",
              snippet: "Raw material procurement strategy includes 60-90 day inventory buffers for critical materials including lithium compounds.",
              relevance: 0.87
            }
          ]
        },
        
        {
          order: "second",
          description: "Downstream automotive manufacturers (GM, Ford, VW) who rely on Tesla/Panasonic battery supplies will face allocation pressures. Chinese battery manufacturers (CATL, BYD) gain competitive advantage as they source primarily from Australian and domestic Chinese lithium. European EV production schedules at risk for Q1 2026 delivery commitments.",
          magnitude: 6.2,
          timeframe: "3-6 months",
          affectedEntities: [
            {
              type: "company",
              name: "General Motors",
              symbol: "GM",
              impactDescription: "Ultium battery platform depends on LG Energy Solution (which sources from SQM competitors). Minimal direct impact but potential cost increases of 8-12% if lithium prices spike broadly.",
              impactMagnitude: 5.5
            },
            {
              type: "company",
              name: "BYD",
              symbol: "1211.HK",
              impactDescription: "Vertically integrated lithium sourcing from Australia and China. Actually benefits from competitors' supply constraints. Historical data shows 3-5% stock price increase during Chilean lithium disruptions.",
              impactMagnitude: -4.5
            }
          ],
          confidence: 0.75,
          citations: [
            {
              id: "cite-5",
              title: "Global EV Supply Chain Interdependencies",
              url: "https://www.mckinsey.com/industries/automotive/ev-supply-chain",
              source: "McKinsey & Company",
              snippet: "Battery supply constraints represent the primary bottleneck for EV production scaling through 2026.",
              relevance: 0.82
            }
          ]
        }
      ],
      
      opportunities: [
        {
          type: "long",
          description: "Australian lithium producers historically see 8-12% stock price increases within 7-10 days of Chilean supply disruptions as market anticipates demand shift. Pilbara Minerals (PLS.AX) and Liontown Resources (LTR.AX) are primary beneficiaries.",
          suggestedActions: [
            "Long PLS.AX (Pilbara Minerals) - Target +10% over 2 weeks",
            "Long ALB (Albemarle) - Non-Chilean producer gains pricing power",
            "Long LTHM (Livent) - Argentina operations unaffected"
          ],
          potentialReturn: 10,
          riskLevel: "moderate",
          timeframe: "2-4 weeks",
          citations: [
            {
              id: "cite-6",
              title: "Historical Analysis: Chilean Lithium Strikes and Market Response",
              url: "https://www.bloomberg.com/lithium-market-analysis-2023",
              source: "Bloomberg Intelligence",
              snippet: "2023 SQM strike: Pilbara Minerals gained 11.2% in 9 trading days while Albemarle rose 7.8%. Correlation coefficient: 0.87",
              relevance: 0.94
            },
            {
              id: "cite-7",
              title: "Lithium Market Dynamics During Supply Shocks",
              url: "https://www.ft.com/content/lithium-supply-analysis",
              source: "Financial Times",
              snippet: "Australian miners benefit disproportionately from South American production disruptions due to geographic diversification preferences among battery manufacturers.",
              relevance: 0.91
            }
          ]
        },
        
        {
          type: "arbitrage",
          description: "Lithium futures (CME) typically lag spot price increases by 3-5 days during supply shocks. Short-term futures contracts present arbitrage opportunity with 4-6% spread potential.",
          suggestedActions: [
            "Long CME Lithium Hydroxide futures (nearest month)",
            "Monitor LME lithium carbonate contract for entry points",
            "Consider spread trade: Long Australian producers / Short Chilean producers"
          ],
          potentialReturn: 5,
          riskLevel: "elevated",
          timeframe: "1-2 weeks",
          citations: [
            {
              id: "cite-8",
              title: "Lithium Futures Market Microstructure",
              url: "https://www.cmegroup.com/markets/lithium-futures-analysis",
              source: "CME Group",
              snippet: "Lithium hydroxide futures historically show 2-4 day lag in pricing relative to spot market disruptions.",
              relevance: 0.86
            }
          ]
        },
        
        {
          type: "hedge",
          description: "For existing long positions in Tesla or battery manufacturers, hedge with long positions in Australian lithium miners or broad materials ETFs (XLB). Ratio: 1:0.3 hedge ratio based on historical correlation.",
          suggestedActions: [
            "If long TSLA, hedge with PLS.AX at 30% position size",
            "Consider put options on TSLA with 60-90 day expiry",
            "Long XLB (Materials Select Sector ETF) for broad commodity exposure"
          ],
          potentialReturn: 0,
          riskLevel: "low",
          timeframe: "Duration of strike",
          citations: [
            {
              id: "cite-9",
              title: "Portfolio Hedging Strategies for Commodity Exposure",
              url: "https://www.jpmorgan.com/commodities/hedging-strategies",
              source: "J.P. Morgan Commodities Research",
              snippet: "Cross-commodity hedging effectiveness improves during supply-driven disruptions versus demand-driven volatility.",
              relevance: 0.79
            }
          ]
        }
      ],
      
      citations: [
        {
          id: "cite-1",
          title: "SQM Salar de Atacama Production Capacity",
          url: "https://www.sqm.com/en/investors/production-capacity",
          source: "SQM Investor Relations",
          snippet: "Salar de Atacama operations capacity: 70,000 tonnes lithium carbonate per year",
          date: "2024-08-15",
          relevance: 0.98
        },
        {
          id: "cite-2",
          title: "Global Lithium Supply Analysis 2024",
          url: "https://www.benchmark-minerals.com/lithium-supply",
          source: "Benchmark Mineral Intelligence",
          snippet: "Chile accounts for 32% of global lithium production, with SQM's Atacama operations representing the largest single source.",
          date: "2024-09-22",
          relevance: 0.95
        },
        {
          id: "cite-3",
          title: "Tesla Gigafactory Nevada Supply Chain Report",
          url: "https://www.tesla.com/ns_videos/2023-impact-report.pdf",
          source: "Tesla Impact Report 2023",
          snippet: "Our Nevada facility maintains diversified lithium sourcing with primary contracts in Chile and Australia.",
          date: "2023-04-10",
          relevance: 0.89
        },
        {
          id: "cite-4",
          title: "Panasonic Battery Business Unit Disclosure",
          url: "https://www.panasonic.com/global/corporate/ir/pdf/disclosure-2024.pdf",
          source: "Panasonic Investor Relations",
          snippet: "Raw material procurement strategy includes 60-90 day inventory buffers for critical materials including lithium compounds.",
          date: "2024-06-30",
          relevance: 0.87
        },
        {
          id: "cite-5",
          title: "Global EV Supply Chain Interdependencies",
          url: "https://www.mckinsey.com/industries/automotive/ev-supply-chain",
          source: "McKinsey & Company",
          snippet: "Battery supply constraints represent the primary bottleneck for EV production scaling through 2026.",
          date: "2024-07-18",
          relevance: 0.82
        },
        {
          id: "cite-6",
          title: "Historical Analysis: Chilean Lithium Strikes and Market Response",
          url: "https://www.bloomberg.com/lithium-market-analysis-2023",
          source: "Bloomberg Intelligence",
          snippet: "2023 SQM strike: Pilbara Minerals gained 11.2% in 9 trading days while Albemarle rose 7.8%. Correlation coefficient: 0.87",
          date: "2023-11-05",
          relevance: 0.94
        },
        {
          id: "cite-7",
          title: "Lithium Market Dynamics During Supply Shocks",
          url: "https://www.ft.com/content/lithium-supply-analysis",
          source: "Financial Times",
          snippet: "Australian miners benefit disproportionately from South American production disruptions due to geographic diversification preferences among battery manufacturers.",
          date: "2024-03-12",
          relevance: 0.91
        },
        {
          id: "cite-8",
          title: "Lithium Futures Market Microstructure",
          url: "https://www.cmegroup.com/markets/lithium-futures-analysis",
          source: "CME Group",
          snippet: "Lithium hydroxide futures historically show 2-4 day lag in pricing relative to spot market disruptions.",
          date: "2024-08-28",
          relevance: 0.86
        },
        {
          id: "cite-9",
          title: "Portfolio Hedging Strategies for Commodity Exposure",
          url: "https://www.jpmorgan.com/commodities/hedging-strategies",
          source: "J.P. Morgan Commodities Research",
          snippet: "Cross-commodity hedging effectiveness improves during supply-driven disruptions versus demand-driven volatility.",
          date: "2024-02-14",
          relevance: 0.79
        }
      ]
    }
  }
];

// Helper to get scenario by ID
export function getScenarioById(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find(scenario => scenario.id === id);
}

// Helper to get scenarios for an asset
export function getScenariosByAsset(assetId: string): DemoScenario[] {
  return DEMO_SCENARIOS.filter(scenario => scenario.assetId === assetId);
}
