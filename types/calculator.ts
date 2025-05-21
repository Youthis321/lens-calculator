export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  market_cap_change_percentage_24h: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}