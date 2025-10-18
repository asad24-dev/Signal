An AI-powered platform that monitors global geopolitical events and analyzes their potential impact on financial markets using real-time news analysis and stock market data.

**Live Demo:** https://signal-xfed.onrender.com/

**Demo Video:** https://youtu.be/6NOsOO-6VPc

## Overview

ForeSight combines AI-powered news analysis with real-time financial data to help traders and analysts understand how geopolitical events affect commodity markets. The platform automatically discovers relevant news, analyzes market impacts using AI, and provides actionable trading insights with live stock prices.

## How It Works

1. **Event Discovery**: The system monitors news sources for geopolitical events related to critical commodities (lithium, oil, semiconductors)
2. **AI Analysis**: Events are analyzed using Perplexity's Sonar Pro API to assess market impact and identify affected companies
3. **Stock Enrichment**: Trading opportunities are enriched with real-time stock data from Finnhub API
4. **Visualization**: Results are displayed on an interactive dashboard with geographic mapping and price charts

## Perplexity API Integration

### Usage

The Perplexity API is integrated through the Sonar Pro model and serves as the core intelligence engine for the platform.

### Implementation

**Location**: `lib/perplexity/batch-chat.ts`

**Model**: Sonar Pro

**Purpose**: 
- Analyzes geopolitical events from news headlines
- Identifies affected commodities and supply chains
- Discovers publicly traded companies impacted by events
- Calculates risk scores and potential market impacts
- Extracts geographic locations mentioned in news

**API Calls Per Analysis**:
- 1 batch analysis request containing multiple news events
- Returns structured JSON with risk assessments, trading opportunities, and location data

**Key Features Used**:
- Online search capabilities for real-time context
- Structured JSON output for reliable data extraction
- Batch processing to analyze multiple events simultaneously

### Response Structure

The Perplexity API returns:
- Risk scores (0-100) for each affected commodity
- List of affected public companies with stock tickers
- Potential return estimates based on event analysis
- Geographic locations extracted from news
- Detailed analysis text explaining the market impact

## Features

- Real-time geopolitical event monitoring
- AI-powered market impact analysis
- Live stock price data and company profiles
- Interactive geographic risk mapping
- 30-day stock price charts for identified opportunities
- Risk level classification (Low, Moderate, Elevated, High, Critical)
- Timeline tracking of risk score changes

## Technology Stack

**Frontend Framework**: Next.js 15 (App Router), React 19, TypeScript

**Styling**: Tailwind CSS

**AI & Data APIs**:
- Perplexity API (Sonar Pro) - Market impact analysis
- Finnhub API - Real-time stock quotes and company data

**UI Libraries**: Radix UI (accessible components), Lucide React (icons), Recharts (data visualization)

**Mapping**: React-Leaflet with OpenStreetMap tiles

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Perplexity API key
- Finnhub API key (free tier available)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/asad24-dev/ForeSight.git
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
# Required - Perplexity API for AI analysis
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Required - Finnhub for stock data
FINNHUB_API_KEY=your_finnhub_api_key_here

# Required - NextAuth configuration
NEXTAUTH_SECRET=generate_using_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000

# Required - Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - Feature flags
USE_DEEP_RESEARCH=false
DEMO_MODE=true
```

5. Generate NEXTAUTH_SECRET:
```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

## Getting API Keys

### Perplexity API
1. Visit [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
2. Create an account or sign in
3. Generate an API key
4. Add credits to your account (usage is pay-as-you-go)

### Finnhub API
1. Visit [https://finnhub.io/register](https://finnhub.io/register)
2. Create a free account
3. Copy your API key from the dashboard
4. Free tier includes 60 API calls per minute

## Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

Production build:
```bash
npm run build
npm start
```

## Usage

1. **Initial Load**: The dashboard displays three commodity categories (Lithium, Oil, Semiconductors) with risk tracking timelines

2. **Event Discovery**: Navigate to the "Discovery Stream" section to see recent geopolitical news events

3. **Batch Analysis**: Select multiple events and click "Analyze Selected" to run AI analysis through Perplexity API

4. **View Results**: 
   - Risk scores update in real-time on the timeline charts
   - Trading opportunities appear with live stock prices
   - Geographic locations are plotted on the interactive map
   - Click on opportunities to view 30-day price charts

5. **Monitor Changes**: The timeline shows how risk scores evolve as new events are analyzed

## Project Structure

```
signal/
├── app/
│   ├── api/                 # API routes
│   │   ├── analyze-batch/   # Batch event analysis endpoint
│   │   ├── assets/          # Asset data endpoints
│   │   └── stock/           # Stock data endpoints (Finnhub)
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── AnalysisModal.tsx    # Event analysis dialog
│   ├── DiscoveryStream.tsx  # News feed with batch analysis
│   ├── GlobalRiskMap.tsx    # Interactive geographic map
│   ├── StockChart.tsx       # 30-day price charts
│   └── TradingOpportunities.tsx # Stock opportunities list
├── lib/
│   ├── finance/
│   │   └── finnhub.ts       # Finnhub API client
│   ├── perplexity/
│   │   └── batch-chat.ts    # Perplexity API integration
│   └── data/
│       └── assets.ts        # Asset definitions
├── types/
│   ├── index.ts             # Core type definitions
│   └── finance.ts           # Financial data types
└── .env.local               # Environment variables (not in repo)
```

## Dependencies

### Core Dependencies
- `next`: ^15.0.3 - React framework with App Router
- `react`: ^19.0.0-rc - UI library
- `typescript`: ^5.7.2 - Type safety

### AI & Data
- `perplexity-ai`: Custom integration - AI analysis
- `axios`: ^1.7.9 - HTTP client for API calls

### UI & Visualization
- `@radix-ui/*`: Various - Accessible component primitives
- `recharts`: ^2.15.0 - Charts and graphs
- `react-leaflet`: ^4.2.1 - Interactive maps
- `leaflet`: ^1.9.4 - Mapping library
- `lucide-react`: ^0.468.0 - Icon library

### Utilities
- `tailwindcss`: ^3.4.17 - Utility-first CSS
- `date-fns`: ^4.1.0 - Date manipulation

See `package.json` for complete dependency list.

## API Rate Limits

**Perplexity API**:
- Pay-as-you-go pricing (~$0.035 per analysis)
- No hard rate limits on paid accounts
- Recommended: Monitor usage in Perplexity dashboard

**Finnhub API (Free Tier)**:
- 60 API calls per minute
- Real-time stock quotes included
- Historical data may be limited

## Troubleshooting

**Build errors about route handlers**:
Ensure you're using Next.js 15. Route parameters are now async and must be awaited.

**Missing stock data**:
Verify your Finnhub API key is set correctly in `.env.local` and that you haven't exceeded rate limits.

**No analysis results**:
Check that your Perplexity API key is valid and has sufficient credits.

**Map not displaying**:
Leaflet requires client-side rendering. Ensure components using maps have 'use client' directive.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## Acknowledgments

Built for the Perplexity API Hackathon, October 17-18, 2025.

This project demonstrates the integration of Perplexity's Sonar Pro API for real-time geopolitical analysis combined with financial market data to create actionable intelligence for traders and analysts.