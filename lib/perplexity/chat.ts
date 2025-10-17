// Perplexity Chat Completions (Grounded LLM) wrapper
import perplexityClient from "./client";
import type { Asset, Event, ImpactAnalysis, Citation, ReasoningStep } from "@/types";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  stream?: boolean;
  searchType?: "fast" | "pro" | "auto";
  temperature?: number;
}

/**
 * Analyze a geopolitical event and its impact on an asset
 */
export async function analyzeEventImpact(
  asset: Asset,
  event: Event,
  options: ChatCompletionOptions = {}
): Promise<ImpactAnalysis> {
  const systemPrompt = buildAnalystPrompt(asset);
  const userPrompt = buildEventPrompt(asset, event);

  try {
    const completion = await perplexityClient.chat.completions.create({
      model: options.model || "sonar-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false, // Non-streaming for this method
      web_search_options: {
        search_type: options.searchType || "pro", // Use Pro Search for reasoning
      },
    });

    // Parse the response (cast to proper type)
    const completionData = completion as any;
    const response = completionData.choices?.[0]?.message?.content || "";
    const searchResults = completionData.search_results || [];
    const reasoningSteps = completionData.reasoning_steps || [];

    // Extract citations from search results
    const citations: Citation[] = searchResults.map((result: any, index: number) => ({
      id: `cite-${index}`,
      title: result.title || "",
      url: result.url || "",
      source: result.source || "web",
      snippet: result.snippet || "",
      date: result.date,
      relevance: 1 - index * 0.1, // Simple relevance scoring
    }));

    // Parse the structured response (expecting JSON or structured text)
    const analysis = parseAnalysisResponse(response, citations, reasoningSteps);

    return analysis;
  } catch (error) {
    console.error("Error analyzing event:", error);
    throw new Error(`Failed to analyze event: ${error}`);
  }
}

/**
 * Build the system prompt for the geopolitical analyst
 */
function buildAnalystPrompt(asset: Asset): string {
  const producers = asset.supplyChain.topProducers
    .map((p) => `${p.name} (${p.globalShare}%)`)
    .join(", ");

  const companies = asset.monitoringConfig.relatedCompanies
    .map((c) => c.name)
    .join(", ");

  return `You are a senior geopolitical risk analyst for a major hedge fund, specializing in ${asset.category} markets with a focus on ${asset.name}.

Your expertise includes:
- Supply chain analysis and critical node identification
- Financial impact quantification with specific company exposure
- Historical pattern recognition and correlation analysis
- Opportunity identification (arbitrage, hedging, positioning)

Your analysis MUST be:
1. QUANTITATIVE: Include exact percentages, timeframes, dollar amounts
2. SPECIFIC: Name exact companies, facilities, trade routes, mine names
3. EVIDENCE-BASED: Reference all claims with sources
4. COMPREHENSIVE: Identify cascading effects (Primary → First-order → Second-order)
5. ACTIONABLE: Find non-obvious opportunities based on historical patterns

Current context for ${asset.name}:
- Top producers: ${producers}
- Key exposed companies: ${companies}
- Critical regions: ${asset.monitoringConfig.regions.join(", ")}

Respond in JSON format with this exact structure:
{
  "summary": "Brief 2-sentence executive summary",
  "impacts": [
    {
      "order": "primary|first|second",
      "description": "Specific, quantified impact description",
      "magnitude": 0-10,
      "timeframe": "e.g., 6-8 weeks, immediate, 3-6 months",
      "affectedEntities": [
        {
          "type": "company|country|commodity",
          "name": "Specific name",
          "symbol": "Stock symbol if applicable",
          "impactDescription": "How they're affected",
          "impactMagnitude": 0-10
        }
      ],
      "confidence": 0-1,
      "citationIds": [0, 1, 2]
    }
  ],
  "opportunities": [
    {
      "type": "long|short|arbitrage|hedge",
      "description": "Specific trading opportunity",
      "suggestedActions": ["Buy XYZ", "Short ABC"],
      "potentialReturn": percentage as number,
      "riskLevel": "low|moderate|elevated|critical",
      "timeframe": "time horizon",
      "citationIds": [3, 4]
    }
  ]
}`;
}

/**
 * Build the event analysis prompt
 */
function buildEventPrompt(asset: Asset, event: Event): string {
  return `URGENT RISK ASSESSMENT REQUEST

Asset Under Analysis: ${asset.name} (${asset.symbol})
Current Risk Score: ${asset.currentRiskScore}/10
Current Risk Level: ${asset.riskLevel}

NEW EVENT DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${event.title}
Type: ${event.eventType}
Location: ${event.location.country}${event.location.region ? ", " + event.location.region : ""}
Source: ${event.source.name}
Published: ${event.source.publishedAt}

Event Details:
${event.description}

Source Snippet:
"${event.source.snippet}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED ANALYSIS:

1. PRIMARY IMPACT
   - What % of global ${asset.name} supply is directly affected?
   - Which specific facility/mine/production site is impacted?
   - What is the production capacity of this site?
   - When will the impact be felt in global markets?
   - Provide SOURCE EVIDENCE for all claims

2. FIRST-ORDER IMPACTS
   - Which companies buy directly from this source?
   - What is each company's exposure percentage?
   - How will their stock prices likely respond?
   - What are their alternative supply options?
   - Cite investor reports, supply chain disclosures

3. SECOND-ORDER IMPACTS
   - Which downstream industries depend on affected companies?
   - What geographic regions will feel secondary effects?
   - How will competitors respond?
   - Market psychology and sentiment shifts

4. HISTORICAL ANALYSIS
   - Find similar past events (strikes, closures, disruptions)
   - What happened to ${asset.name} prices then?
   - Which stocks benefited? Which suffered?
   - What was the typical recovery time?

5. TRADING OPPORTUNITIES
   - Which assets historically rise during ${event.eventType} in ${event.location.country}?
   - Specific stock symbols to buy/short
   - Arbitrage opportunities between related assets
   - Hedging strategies with concrete positions

Analyze comprehensively using web search to find:
- Recent ${asset.name} production data
- Company supply chain disclosures
- Historical price correlations
- Expert analyst opinions
- Government/industry reports

Return structured JSON with all citation IDs referenced.`;
}

/**
 * Parse the analysis response from the LLM
 */
function parseAnalysisResponse(
  response: string,
  citations: Citation[],
  reasoningSteps: any[]
): ImpactAnalysis {
  try {
    // Try to parse as JSON first
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Map citation IDs to actual citations
      const mapCitations = (citationIds: number[] = []) =>
        citationIds.map((id) => citations[id]).filter(Boolean);

      const impacts = (parsed.impacts || []).map((impact: any) => ({
        ...impact,
        citations: mapCitations(impact.citationIds),
      }));

      const opportunities = (parsed.opportunities || []).map((opp: any) => ({
        ...opp,
        citations: mapCitations(opp.citationIds),
      }));

      return {
        summary: parsed.summary || "Analysis complete",
        impacts,
        opportunities,
        citations,
        reasoningSteps: reasoningSteps.map((step: any) => ({
          thought: step.thought || "",
          type: step.type || "web_search",
          data: step.data,
        })),
      };
    }

    // Fallback: parse as structured text
    return parseStructuredText(response, citations, reasoningSteps);
  } catch (error) {
    console.error("Error parsing analysis:", error);
    // Return minimal structure with raw response
    return {
      summary: "Analysis completed. See full details below.",
      impacts: [
        {
          order: "primary",
          description: response.slice(0, 500),
          magnitude: 5,
          timeframe: "Unknown",
          affectedEntities: [],
          confidence: 0.5,
          citations: citations.slice(0, 3),
        },
      ],
      opportunities: [],
      citations,
      reasoningSteps: reasoningSteps.map((step: any) => ({
        thought: step.thought || "",
        type: step.type || "web_search",
        data: step.data,
      })),
    };
  }
}

/**
 * Fallback parser for structured text responses
 */
function parseStructuredText(
  response: string,
  citations: Citation[],
  reasoningSteps: any[]
): ImpactAnalysis {
  // Extract sections using common markers
  const sections = {
    primary: extractSection(response, ["PRIMARY", "PRIMARY IMPACT"]),
    firstOrder: extractSection(response, ["FIRST-ORDER", "FIRST ORDER"]),
    secondOrder: extractSection(response, ["SECOND-ORDER", "SECOND ORDER"]),
    opportunities: extractSection(response, ["OPPORTUNIT", "TRADING"]),
  };

  const impacts = [];

  if (sections.primary) {
    impacts.push({
      order: "primary" as const,
      description: sections.primary,
      magnitude: 7,
      timeframe: "Immediate to 4 weeks",
      affectedEntities: [],
      confidence: 0.8,
      citations: citations.slice(0, 2),
    });
  }

  if (sections.firstOrder) {
    impacts.push({
      order: "first" as const,
      description: sections.firstOrder,
      magnitude: 6,
      timeframe: "4-12 weeks",
      affectedEntities: [],
      confidence: 0.7,
      citations: citations.slice(2, 4),
    });
  }

  const opportunities = sections.opportunities
    ? [
        {
          type: "arbitrage" as const,
          description: sections.opportunities,
          suggestedActions: [],
          potentialReturn: 0,
          riskLevel: "moderate" as const,
          timeframe: "Short to medium term",
          citations: citations.slice(4, 6),
        },
      ]
    : [];

  return {
    summary: response.slice(0, 200) + "...",
    impacts,
    opportunities,
    citations,
    reasoningSteps: reasoningSteps.map((step: any) => ({
      thought: step.thought || "",
      type: step.type || "web_search",
      data: step.data,
    })),
  };
}

/**
 * Extract a section from text
 */
function extractSection(text: string, markers: string[]): string {
  for (const marker of markers) {
    const regex = new RegExp(`${marker}[:\\s]+([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, "i");
    const match = text.match(regex);
    if (match) {
      return match[1].trim();
    }
  }
  return "";
}

/**
 * Stream analysis for real-time updates
 */
export async function streamEventAnalysis(
  asset: Asset,
  event: Event,
  onChunk: (chunk: string) => void
): Promise<void> {
  const systemPrompt = buildAnalystPrompt(asset);
  const userPrompt = buildEventPrompt(asset, event);

  const stream = await perplexityClient.chat.completions.create({
    model: "sonar-pro",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    stream: true,
    web_search_options: {
      search_type: "pro",
    },
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content && typeof content === 'string') {
      onChunk(content);
    }
  }
}
