export interface Token {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  total_volume: number;
  sparkline_in_7d?: {
    price: number[];
  };
  twitter_username?: string;
}