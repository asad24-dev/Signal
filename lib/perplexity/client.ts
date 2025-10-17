// Perplexity API Client using official SDK
import Perplexity from "@perplexity-ai/perplexity_ai";

// Initialize client
export const perplexityClient = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY || "",
});

// Export for use in API routes
export default perplexityClient;
