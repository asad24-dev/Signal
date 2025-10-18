# Signal - Geopolitical Event Intelligence Platform

An AI-powered real-time monitoring and analysis platform for geopolitical events and their market impacts. Built for the Perplexity Hackathon (Oct 17-18, 2025).

## What It Does

Signal monitors global news for geopolitical events, uses AI to analyze potential market impacts, and provides real-time stock data with trading opportunities. It combines news aggregation, AI analysis (via Perplexity Sonar Pro), and live financial data (via Finnhub) to help traders, analysts, and researchers understand how world events affect markets.

## Key Features

- **News Monitoring**: Discovers geopolitical events from news sources
- **AI Analysis**: Batch analysis using Perplexity Sonar Pro (Deep Research mode)
- **Live Stock Data**: Real-time quotes and company profiles via Finnhub API
- **Interactive Map**: Geographic visualization of global events
- **Trading Opportunities**: AI-identified opportunities with live stock prices and company data

## Quick Start

### Installation

```bash
npm install
```

### Required API Keys

1. **Perplexity API**: Get from [perplexity.ai](https://www.perplexity.ai/settings/api)
2. **Finnhub API**: Get free tier from [finnhub.io](https://finnhub.io/register) (60 calls/min)

### Environment Setup

Create a `.env.local` file:

```env
# Required
PERPLEXITY_API_KEY=your_perplexity_api_key
FINNHUB_API_KEY=your_finnhub_api_key

# Optional
NEXT_PUBLIC_MAP_CENTER_LAT=20
NEXT_PUBLIC_MAP_CENTER_LNG=0
NEXT_PUBLIC_MAP_ZOOM=2
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Discover Events**: Click "Discover Events" to find geopolitical events from news
2. **Batch Analysis**: Select events and run batch analysis with Perplexity Sonar Pro
3. **Review Results**: View AI analysis, trading opportunities, and live stock data
4. **Export**: Export results to JSON or CSV

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **AI**: Perplexity Sonar Pro (llama-3.1-sonar-large-128k-online)
- **Financial Data**: Finnhub API (real-time stock quotes, company profiles)
- **UI Components**: Radix UI, Lucide Icons
- **Maps**: React-Leaflet, OpenStreetMap

## Troubleshooting

### Rate Limits

- **Perplexity**: ~$0.035 per analysis (3 requests per event)
- **Finnhub**: 60 API calls/min (free tier)

### Common Issues

- **No trading opportunities**: Check that Finnhub API key is set correctly
- **Rate limit errors**: Reduce batch size or wait between analyses
- **TypeScript errors**: Run `npm run type-check` to see detailed errors

## Project Structure

```
signal/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/
│   ├── finance/      # Finnhub API integration
│   ├── perplexity/   # Perplexity API client
│   └── utils/        # Utilities
└── types/            # TypeScript types
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run type-check   # Check TypeScript
npm run lint         # Run ESLint
```

## License

MIT

---

**Built for Perplexity Hackathon** | October 17-18, 2025
