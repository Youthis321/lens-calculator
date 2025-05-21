import { TokenData } from "../types/calculator";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const EXCHANGE_RATE_URL = "https://api.exchangerate.host";

// Simple in-memory cache
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

// Add delay between requests to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithCache(url: string, cacheKey: string) {
  // Check cache first
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Add delay between requests
  await delay(1100); // 1.1 second delay to stay under rate limit

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Update cache
    cache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

export const api = {
  async getExchangeRate(): Promise<number> {
    try {
      const data = await fetchWithCache(
        `${EXCHANGE_RATE_URL}/convert?from=USD&to=IDR`,
        'exchange_rate'
      );
      return data.info?.rate || 16000;
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return 16000;
    }
  },

  async getTokenList(): Promise<TokenData[]> {
    try {
      const data = await fetchWithCache(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`,
        'token_list'
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch token list:", error);
      return [];
    }
  },

  async getTokenPrice(tokenId: string): Promise<number | null> {
    try {
      const data = await fetchWithCache(
        `${COINGECKO_BASE_URL}/simple/price?ids=${tokenId}&vs_currencies=usd`,
        `price_${tokenId}`
      );
      return data[tokenId]?.usd || null;
    } catch (error) {
      console.error("Failed to fetch token price:", error);
      return null;
    }
  },

  async getTokenHistory(tokenId: string): Promise<[number, number][]> {
    try {
      const data = await fetchWithCache(
        `${COINGECKO_BASE_URL}/coins/${tokenId}/market_chart?vs_currency=usd&days=7&interval=daily`,
        `history_${tokenId}`
      );
      return data.prices || [];
    } catch (error) {
      console.error("Failed to fetch token history:", error);
      return [];
    }
  }
};