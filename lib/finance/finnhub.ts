/**
 * Finnhub Stock API Integration
 * 
 * Free Tier: 60 API calls per minute
 * Provides real-time stock quotes and company profiles
 * 
 * Endpoints:
 * - /quote: Real-time stock prices (current, change, high, low, etc.)
 * - /stock/profile2: Company information (name, industry, logo, market cap)
 * 
 * Documentation: https://finnhub.io/docs/api
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
}

export interface CompanyProfile {
  name: string;
  sector: string;
  logo?: string;
  marketCap?: number;
  website?: string;
}

/**
 * Get real-time stock quote from Finnhub
 * Free tier: 60 calls/minute
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  if (!FINNHUB_API_KEY) {
    console.error('❌ FINNHUB_API_KEY is not set in environment variables');
    return null;
  }

  try {
    console.log(`🔗 Calling Finnhub /quote for ${symbol}...`);
    
    const url = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Finnhub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: FinnhubQuote = await response.json();
    
    console.log(`📦 Finnhub response for ${symbol}:`, JSON.stringify(data).substring(0, 200));

    // Finnhub returns c=0 when symbol is not found
    if (data.c === 0 && data.d === 0 && data.dp === 0) {
      console.warn(`⚠️ No data found for ${symbol} (invalid symbol or delisted)`);
      return null;
    }

    const quote: StockQuote = {
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc
    };

    console.log(`✅ Got quote for ${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
    
    return quote;

  } catch (error) {
    console.error(`❌ Error fetching Finnhub quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get company profile from Finnhub
 * Free tier: 60 calls/minute
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  if (!FINNHUB_API_KEY) {
    console.error('❌ FINNHUB_API_KEY is not set in environment variables');
    return null;
  }

  try {
    console.log(`🔗 Calling Finnhub /stock/profile2 for ${symbol}...`);
    
    const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Finnhub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: FinnhubProfile = await response.json();
    
    console.log(`📦 Finnhub profile response for ${symbol}:`, JSON.stringify(data).substring(0, 200));

    // Finnhub returns empty object when company not found
    if (!data.name) {
      console.warn(`⚠️ No profile found for ${symbol}`);
      return null;
    }

    const profile: CompanyProfile = {
      name: data.name,
      sector: data.finnhubIndustry || 'Unknown',
      logo: data.logo,
      marketCap: data.marketCapitalization,
      website: data.weburl
    };

    console.log(`✅ Got profile for ${symbol}: ${profile.name} (${profile.sector})`);
    
    return profile;

  } catch (error) {
    console.error(`❌ Error fetching Finnhub profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get both quote and profile in a single function
 * This is the main function to use for stock discovery
 */
export async function getStockData(symbol: string): Promise<{
  quote: StockQuote | null;
  profile: CompanyProfile | null;
}> {
  console.log(`📊 Fetching complete stock data for ${symbol} from Finnhub...`);
  
  // Fetch both in parallel for better performance
  const [quote, profile] = await Promise.all([
    getStockQuote(symbol),
    getCompanyProfile(symbol)
  ]);

  if (quote && profile) {
    console.log(`✅ Complete data retrieved for ${symbol}: ${profile.name} - $${quote.price.toFixed(2)}`);
  } else if (!quote && !profile) {
    console.warn(`⚠️ No data available for ${symbol} (both quote and profile failed)`);
  } else {
    console.warn(`⚠️ Partial data for ${symbol} (quote: ${!!quote}, profile: ${!!profile})`);
  }

  return { quote, profile };
}
