// RSS Feed Aggregator - Fetches headlines from multiple sources

import Parser from 'rss-parser';
import { Headline, FeedSource } from './types';
import { RSS_SOURCES, FEED_CONFIG } from './config';

const parser = new Parser({
  timeout: FEED_CONFIG.scanning.timeout,
  headers: {
    'User-Agent': 'Signal-Risk-Monitor/1.0'
  }
});

/**
 * Fetch headlines from a single RSS feed
 */
async function fetchSingleFeed(source: FeedSource): Promise<Headline[]> {
  try {
    const feed = await parser.parseURL(source.url);
    
    const headlines: Headline[] = (feed.items || [])
      .slice(0, FEED_CONFIG.scanning.maxHeadlinesPerSource)
      .map((item, index) => ({
        id: `${source.id}-${Date.now()}-${index}`,
        title: item.title || 'Untitled',
        url: item.link || '',
        source: source.name,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        description: item.contentSnippet || item.content || '',
        triageStatus: 'noise' as const,
        matchedAssets: [],
        matchedKeywords: [],
        confidence: 0
      }));
    
    return headlines;
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error);
    return [];
  }
}

/**
 * Fetch headlines from all enabled RSS sources
 */
export async function fetchAllFeeds(): Promise<Headline[]> {
  const enabledSources = RSS_SOURCES.filter(s => s.enabled);
  
  console.log(`Fetching from ${enabledSources.length} RSS sources...`);
  
  // Fetch all feeds in parallel
  const feedPromises = enabledSources.map(source => fetchSingleFeed(source));
  const feedResults = await Promise.allSettled(feedPromises);
  
  // Combine all successful results
  const allHeadlines = feedResults
    .filter((result): result is PromiseFulfilledResult<Headline[]> => 
      result.status === 'fulfilled'
    )
    .flatMap(result => result.value);
  
  // Sort by publish date (newest first)
  allHeadlines.sort((a, b) => 
    b.publishedAt.getTime() - a.publishedAt.getTime()
  );
  
  console.log(`Fetched ${allHeadlines.length} total headlines`);
  
  return allHeadlines;
}

/**
 * Get mock headlines for testing (when RSS is unavailable)
 */
export function getMockHeadlines(): Headline[] {
  return [
    {
      id: 'mock-1',
      title: 'Chilean workers announce indefinite strike at Salar de Atacama lithium mine',
      url: 'https://reuters.com/mock/chile-lithium-strike',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 120000), // 2 min ago
      description: 'Workers at SQM\'s flagship lithium operation demand better conditions',
      triageStatus: 'flagged',
      matchedAssets: ['lithium'],
      matchedKeywords: ['Chile', 'lithium', 'strike', 'SQM'],
      confidence: 0.89
    },
    {
      id: 'mock-2',
      title: 'TSMC reports earthquake damage at Taiwan fab, production delays expected',
      url: 'https://bloomberg.com/mock/tsmc-earthquake',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 300000), // 5 min ago
      description: 'Magnitude 6.5 earthquake disrupts semiconductor manufacturing',
      triageStatus: 'flagged',
      matchedAssets: ['semiconductors'],
      matchedKeywords: ['TSMC', 'Taiwan', 'earthquake', 'fab'],
      confidence: 0.92
    },
    {
      id: 'mock-3',
      title: 'Houthi rebels target oil tanker in Red Sea, shipping routes at risk',
      url: 'https://aljazeera.com/mock/oil-tanker-attack',
      source: 'Al Jazeera',
      publishedAt: new Date(Date.now() - 480000), // 8 min ago
      description: 'Escalating tensions threaten critical oil shipping lanes',
      triageStatus: 'flagged',
      matchedAssets: ['oil'],
      matchedKeywords: ['oil', 'tanker', 'attack', 'shipping'],
      confidence: 0.85
    },
    {
      id: 'mock-4',
      title: 'Federal Reserve signals steady interest rates through Q1 2026',
      url: 'https://reuters.com/mock/fed-rates',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 600000),
      description: 'Fed maintains current monetary policy stance',
      triageStatus: 'noise',
      matchedAssets: [],
      matchedKeywords: [],
      confidence: 0.15
    },
    {
      id: 'mock-5',
      title: 'European markets open slightly higher amid earnings season',
      url: 'https://ft.com/mock/europe-markets',
      source: 'Financial Times',
      publishedAt: new Date(Date.now() - 720000),
      description: 'Major indices show modest gains in morning trading',
      triageStatus: 'noise',
      matchedAssets: [],
      matchedKeywords: [],
      confidence: 0.10
    },
    {
      id: 'mock-6',
      title: 'Tech sector braces for earnings season with mixed expectations',
      url: 'https://bloomberg.com/mock/tech-earnings',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 900000),
      description: 'Analysts divided on outlook for major technology companies',
      triageStatus: 'noise',
      matchedAssets: [],
      matchedKeywords: [],
      confidence: 0.08
    }
  ];
}
