/**
 * Alpha Vantage Finance API Service
 * 
 * Provides stock quotes, historical price data, and correlation analysis
 * Free tier: 25 API calls per day, 25 calls per minute
 * Documentation: https://www.alphavantage.co/documentation/
 */

import { 
  AlphaVantageQuoteResponse, 
  AlphaVantageTimeSeriesResponse, 
  StockQuote 
} from '@/types/finance';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://www.alphavantage.co/query';

// Rate limiting: Track API calls to stay within limits
let apiCallCount = 0;
let lastResetTime = Date.now();

function checkRateLimit() {
  const now = Date.now();
  const oneMinute = 60 * 1000;
  
  // Reset counter every minute
  if (now - lastResetTime > oneMinute) {
    apiCallCount = 0;
    lastResetTime = now;
  }
  
  if (apiCallCount >= 25) {
    throw new Error('Alpha Vantage rate limit exceeded (25 calls/minute). Please wait.');
  }
  
  apiCallCount++;
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    checkRateLimit();
    
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log(`   🔗 Calling Alpha Vantage for ${symbol}...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`   ❌ Alpha Vantage API HTTP error: ${response.status}`);
      return null;
    }
    
    const data: AlphaVantageQuoteResponse = await response.json();
    console.log(`   📦 Response for ${symbol}:`, JSON.stringify(data).substring(0, 200));
    
    // Check for API error messages
    if ('Error Message' in data) {
      console.error(`   ❌ Alpha Vantage error message:`, data['Error Message']);
      return null;
    }
    
    if ('Note' in data) {
      console.error(`   ⚠️  Alpha Vantage rate limit:`, data['Note']);
      return null;
    }
    
    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      console.error(`   ⚠️  No quote data returned for ${symbol}`);
      return null;
    }
    
    console.log(`   ✅ Got quote for ${symbol}: $${quote['05. price']}`);
    
    return {
      symbol: quote['01. symbol'],
      name: symbol, // Alpha Vantage doesn't return company name in quote
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'].replace('%', ''),
      volume: parseInt(quote['06. volume']),
    };
  } catch (error) {
    console.error(`   ❌ Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get historical daily price data
 */
export async function getHistoricalPrices(
  symbol: string,
  days: number = 30
): Promise<Array<{ date: string; close: number; volume: number }> | null> {
  try {
    checkRateLimit();
    
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }
    
    const data: AlphaVantageTimeSeriesResponse = await response.json();
    
    if ('Error Message' in data || 'Note' in data) {
      console.error('Alpha Vantage API error:', data);
      return null;
    }
    
    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return null;
    }
    
    // Convert to array and sort by date (most recent first)
    const prices = Object.entries(timeSeries)
      .slice(0, days)
      .map(([date, values]) => ({
        date,
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      }))
      .reverse(); // Oldest to newest
    
    return prices;
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    return null;
  }
}

/**
 * Calculate price correlation with an event
 * Returns percentage change over specified period
 */
export async function calculatePriceImpact(
  symbol: string,
  eventDate: Date,
  daysAfter: number = 14
): Promise<{ priceChange: number; percentChange: string; volumeChange: number } | null> {
  try {
    const historicalPrices = await getHistoricalPrices(symbol, 60);
    if (!historicalPrices || historicalPrices.length < 2) {
      return null;
    }
    
    // Find price at event date (or closest date)
    const eventDateStr = eventDate.toISOString().split('T')[0];
    const eventIndex = historicalPrices.findIndex(p => p.date >= eventDateStr);
    
    if (eventIndex === -1 || eventIndex + daysAfter >= historicalPrices.length) {
      // Use most recent data if event date not found
      const startPrice = historicalPrices[0].close;
      const endPrice = historicalPrices[Math.min(daysAfter, historicalPrices.length - 1)].close;
      const priceChange = endPrice - startPrice;
      const percentChange = ((priceChange / startPrice) * 100).toFixed(2);
      
      const startVolume = historicalPrices[0].volume;
      const endVolume = historicalPrices[Math.min(daysAfter, historicalPrices.length - 1)].volume;
      const volumeChange = ((endVolume - startVolume) / startVolume) * 100;
      
      return {
        priceChange,
        percentChange: `${percentChange}%`,
        volumeChange,
      };
    }
    
    // Calculate change from event date to daysAfter
    const startPrice = historicalPrices[eventIndex].close;
    const endPrice = historicalPrices[eventIndex + daysAfter].close;
    const priceChange = endPrice - startPrice;
    const percentChange = ((priceChange / startPrice) * 100).toFixed(2);
    
    const startVolume = historicalPrices[eventIndex].volume;
    const endVolume = historicalPrices[eventIndex + daysAfter].volume;
    const volumeChange = ((endVolume - startVolume) / startVolume) * 100;
    
    return {
      priceChange,
      percentChange: `${percentChange}%`,
      volumeChange,
    };
  } catch (error) {
    console.error(`Error calculating price impact for ${symbol}:`, error);
    return null;
  }
}

/**
 * Batch fetch quotes for multiple stocks (used for validation)
 */
export async function getBatchQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
  const quotes = new Map<string, StockQuote>();
  
  // Alpha Vantage free tier doesn't support batch requests
  // Fetch sequentially with small delay to respect rate limits
  for (const symbol of symbols) {
    const quote = await getStockQuote(symbol);
    if (quote) {
      quotes.set(symbol, quote);
    }
    
    // Small delay between requests (250ms = max 4 per second, well under 25/min limit)
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return quotes;
}

/**
 * Get WTI Crude Oil prices (Alpha Vantage has commodity data!)
 */
export async function getWTIOilPrices(interval: 'daily' | 'weekly' | 'monthly' = 'daily') {
  try {
    checkRateLimit();
    
    const url = `${BASE_URL}?function=WTI&interval=${interval}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if ('Error Message' in data || 'Note' in data) {
      console.error('Alpha Vantage API error:', data);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching WTI oil prices:', error);
    return null;
  }
}

/**
 * Search for stock symbols (useful for finding tickers)
 */
export async function searchSymbol(keywords: string): Promise<Array<{ symbol: string; name: string }> | null> {
  try {
    checkRateLimit();
    
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keywords)}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if ('Error Message' in data || 'Note' in data) {
      console.error('Alpha Vantage API error:', data);
      return null;
    }
    
    const matches = data.bestMatches || [];
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
    }));
  } catch (error) {
    console.error(`Error searching for ${keywords}:`, error);
    return null;
  }
}

/**
 * Get company overview (fundamental data)
 */
export async function getCompanyOverview(symbol: string) {
  try {
    checkRateLimit();
    
    const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if ('Error Message' in data || 'Note' in data || Object.keys(data).length === 0) {
      console.error('Alpha Vantage API error:', data);
      return null;
    }
    
    return {
      symbol: data.Symbol,
      name: data.Name,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: data.MarketCapitalization,
      description: data.Description,
      pe_ratio: data.PERatio,
      week_high_52: data['52WeekHigh'],
      week_low_52: data['52WeekLow'],
    };
  } catch (error) {
    console.error(`Error fetching company overview for ${symbol}:`, error);
    return null;
  }
}

/**
 * Validate stock symbols exist
 */
export async function validateSymbols(symbols: string[]): Promise<string[]> {
  const validSymbols: string[] = [];
  
  for (const symbol of symbols) {
    const quote = await getStockQuote(symbol);
    if (quote) {
      validSymbols.push(symbol);
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  
  return validSymbols;
}
