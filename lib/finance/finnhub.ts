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

export interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status (ok, no_data)
  t: number[];  // Timestamps
  v: number[];  // Volumes
}

export interface CandleData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
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
 * Generate realistic mock candle data based on current price
 * Used as fallback when Finnhub historical data is not available (free tier restriction)
 */
function generateMockCandles(
  symbol: string,
  currentPrice: number,
  changePercent: number,
  days: number = 30
): CandleData[] {
  const candles: CandleData[] = [];
  const volatility = Math.abs(changePercent) / 100; // Convert to decimal
  const now = Math.floor(Date.now() / 1000);
  
  // Start from 'days' ago and work forward
  let price = currentPrice * (1 - (changePercent / 100)); // Approximate starting price
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60);
    
    // Generate realistic daily movement
    const dailyChange = (Math.random() - 0.5) * 2 * volatility * price;
    const open = price;
    const close = price + dailyChange;
    
    // High and low with realistic wicks
    const wickRange = Math.abs(dailyChange) * (0.5 + Math.random());
    const high = Math.max(open, close) + Math.random() * wickRange;
    const low = Math.min(open, close) - Math.random() * wickRange;
    
    // Generate volume (random but realistic)
    const baseVolume = 10000000 + Math.random() * 20000000;
    const volume = Math.floor(baseVolume * (1 + Math.abs(dailyChange / price) * 5));
    
    candles.push({
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    
    price = close; // Next day starts at previous close
  }
  
  // Adjust last candle to match current price
  candles[candles.length - 1].close = currentPrice;
  
  return candles;
}

/**
 * Get historical candle data from Finnhub
 * Free tier: 60 calls/minute
 * NOTE: Free tier may restrict historical data - falls back to mock data
 * 
 * @param symbol - Stock ticker symbol
 * @param resolution - D (day), W (week), M (month), 1, 5, 15, 30, 60 (minutes)
 * @param days - Number of days of historical data (default: 30)
 */
export async function getStockCandles(
  symbol: string, 
  resolution: 'D' | 'W' | 'M' | '1' | '5' | '15' | '30' | '60' = 'D',
  days: number = 30
): Promise<CandleData[] | null> {
  if (!FINNHUB_API_KEY) {
    console.error('❌ FINNHUB_API_KEY is not set in environment variables');
    return null;
  }

  try {
    console.log(`🔗 Calling Finnhub /stock/candle for ${symbol} (${days} days, resolution: ${resolution})...`);
    
    const now = Math.floor(Date.now() / 1000);
    const from = now - (days * 24 * 60 * 60);
    
    const url = `${FINNHUB_BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    // If 403 Forbidden (free tier restriction), fall back to mock data
    if (response.status === 403) {
      console.warn(`⚠️ Finnhub historical data restricted (free tier). Generating mock candles for ${symbol}...`);
      
      // Get current quote to base mock data on
      const quote = await getStockQuote(symbol);
      if (quote) {
        const mockCandles = generateMockCandles(symbol, quote.price, quote.changePercent, days);
        console.log(`✅ Generated ${mockCandles.length} mock candles for ${symbol} based on current price $${quote.price.toFixed(2)}`);
        return mockCandles;
      }
      
      console.error(`❌ Cannot generate mock data without current quote for ${symbol}`);
      return null;
    }
    
    if (!response.ok) {
      console.error(`❌ Finnhub API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: FinnhubCandle = await response.json();
    
    if (data.s !== 'ok' || !data.t || data.t.length === 0) {
      console.warn(`⚠️ No candle data found for ${symbol}`);
      return null;
    }

    // Transform to our format
    const candles: CandleData[] = data.t.map((timestamp, i) => ({
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i]
    }));

    console.log(`✅ Got ${candles.length} candles for ${symbol} (${days} days)`);
    
    return candles;

  } catch (error) {
    console.error(`❌ Error fetching Finnhub candles for ${symbol}:`, error);
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
