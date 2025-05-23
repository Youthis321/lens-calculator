import { TokenData } from '../types/calculator';

export const STATIC_TOKEN_LIST: TokenData[] = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", market_cap_change_percentage_24h: 1.2 },
 { id: "ethereum", name: "Ethereum", symbol: "ETH", market_cap_change_percentage_24h: 2.5 },
        { id: "solana", name: "Solana", symbol: "SOL", market_cap_change_percentage_24h: 5.7 },
        { id: "cardano", name: "Cardano", symbol: "ADA", market_cap_change_percentage_24h: -1.2 },
        { id: "lens", name: "Lens", symbol: "LENS", market_cap_change_percentage_24h: 15.2 },
        { id: "ripple", name: "XRP", symbol: "XRP", market_cap_change_percentage_24h: 0.8 },
        { id: "polkadot", name: "Polkadot", symbol: "DOT", market_cap_change_percentage_24h: 3.1 },
        { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", market_cap_change_percentage_24h: 10.5 },
        { id: "shiba-inu", name: "Shiba Inu", symbol: "SHIB", market_cap_change_percentage_24h: 8.3 },
        { id: "chainlink", name: "Chainlink", symbol: "LINK", market_cap_change_percentage_24h: 4.2 },
        { id: "avalanche", name: "Avalanche", symbol: "AVAX", market_cap_change_percentage_24h: 6.3 },
        { id: "litecoin", name: "Litecoin", symbol: "LTC", market_cap_change_percentage_24h: 0.5 },
        { id: "uniswap", name: "Uniswap", symbol: "UNI", market_cap_change_percentage_24h: 1.9 },
        { id: "bnb", name: "BNB", symbol: "BNB", market_cap_change_percentage_24h: 0.3 },
        { id: "tron", name: "TRON", symbol: "TRX", market_cap_change_percentage_24h: 1.1 },
        { id: "monero", name: "Monero", symbol: "XMR", market_cap_change_percentage_24h: 2.8 },
        { id: "stellar", name: "Stellar", symbol: "XLM", market_cap_change_percentage_24h: -0.7 },
        { id: "cosmos", name: "Cosmos", symbol: "ATOM", market_cap_change_percentage_24h: 3.4 },
        { id: "tezos", name: "Tezos", symbol: "XTZ", market_cap_change_percentage_24h: 1.5 },
        { id: "mantra", name: "MANTRA", symbol: "OM", market_cap_change_percentage_24h: 7.8 },
        { id: "pepe", name: "Pepe", symbol: "PEPE", market_cap_change_percentage_24h: 25.6 },
        { id: "bonk", name: "Bonk", symbol: "BONK", market_cap_change_percentage_24h: 18.9 },
        { id: "near", name: "NEAR Protocol", symbol: "NEAR", market_cap_change_percentage_24h: 5.1 },
        { id: "aptos", name: "Aptos", symbol: "APT", market_cap_change_percentage_24h: 4.3 },
        { id: "troll-2", name: "Troll", symbol: "TROLL", market_cap_change_percentage_24h: 12.5 },
        { id: "lainnya", name: "Lainnya", symbol: "LAINNYA", market_cap_change_percentage_24h: 0 },
];

export const toIDR = (value: number) =>
  value.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

export const fetchTokenPrice = async (tokenId: string) => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}`);
  const data = await res.json();
  return data.market_data?.current_price?.usd;
};

export const fetchTokenHistory = async (tokenId: string) => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=7`);
  const data = await res.json();
  return data.prices;
};

export const notifyUser = (message: string) => {
  if (Notification.permission === 'granted') {
    new Notification('📢 Token Alert!', { body: message });
  } else {
    Notification.requestPermission();
  }
};