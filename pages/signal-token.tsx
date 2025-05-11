import { useEffect, useState } from 'react';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Token {
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
}

const SIGNAL_THRESHOLD = 10;
const NOTIFY_THRESHOLD = 15;

function notifyUser(title: string, message: string) {
  if (typeof window !== 'undefined' && 'OneSignal' in window) {
    (window as any).OneSignal.push(() => {
      (window as any).OneSignal.sendSelfNotification(
        title,
        message,
        'https://lens-calculator.vercel.app/signal-token',
        'https://lens-calculator.vercel.app/icons/icon-512x512.png'
      );
    });
  }
}

export default function SignalTokenPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function fetchTokens() {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      if (!res.ok) throw new Error('Gagal mengambil data dari API');
      const data: Token[] = await res.json();

      const filtered = data.filter(
        (token) =>
          token.price_change_percentage_1h_in_currency >= SIGNAL_THRESHOLD ||
          token.price_change_percentage_24h_in_currency >= SIGNAL_THRESHOLD
      );

      filtered.forEach((token) => {
        if (
          token.price_change_percentage_1h_in_currency >= NOTIFY_THRESHOLD ||
          token.price_change_percentage_24h_in_currency >= NOTIFY_THRESHOLD
        ) {
          notifyUser(
            `🚀 ${token.name} Naik Cepat!`,
            `${token.name} naik ${token.price_change_percentage_1h_in_currency.toFixed(2)}% dalam 1 jam!`
          );
        }
      });

      const sorted = filtered.sort((a, b) => b.total_volume - a.total_volume);

      setTokens(sorted);
      setLastUpdated(new Date().toLocaleString());
    } catch (error: any) {
      setFetchError(error.message || 'Gagal mengambil data token');
      console.error('Failed to fetch token data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
    },
  };

  // Helper to generate date labels for sparkline (7 days)
  function getSparklineLabels(prices: number[]) {
    const now = new Date();
    return prices.map((_, i, arr) => {
      const daysAgo = arr.length - 1 - i;
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);
      return date.toLocaleDateString();
    });
  }

  return (
    <div className="main-content min-h-screen bg-gradient-to-b from-purple-100 to-white p-4 sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">🚀 Signal Token</h1>
        <button
          onClick={fetchTokens}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
        >
          🔄 Refresh
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdated}</p>

      {fetchError && (
        <div className="text-center text-red-500 mb-4">{fetchError}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading data...</div>
      ) : tokens.length === 0 ? (
        <div className="text-center text-gray-600">🚫 Tidak ada token yang naik ≥{SIGNAL_THRESHOLD}% dalam 1h atau 24h.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <div key={token.id} className="bg-white rounded-xl shadow-md p-5 transition hover:shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full border border-gray-200" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{token.name}</h2>
                  <p className="text-sm text-gray-500 uppercase">{token.symbol}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>💵 Price: <span className="font-medium text-gray-900">${token.current_price.toLocaleString()}</span></p>
                <p>📈 1h: <span className={`font-semibold ${token.price_change_percentage_1h_in_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>{token.price_change_percentage_1h_in_currency.toFixed(2)}%</span></p>
                <p>📊 24h: <span className={`font-semibold ${token.price_change_percentage_24h_in_currency >= 0 ? 'text-green-600' : 'text-red-600'}`}>{token.price_change_percentage_24h_in_currency.toFixed(2)}%</span></p>
                <p>🔁 Volume: ${token.total_volume.toLocaleString()}</p>
              </div>
              <div className="mt-3">
                {token.sparkline_in_7d?.price && (
                  <Line
                    data={{
                      labels: getSparklineLabels(token.sparkline_in_7d.price),
                      datasets: [
                        {
                          label: `${token.name} Price Movement`,
                          data: token.sparkline_in_7d.price,
                          borderColor: '#4c51bf',
                          backgroundColor: 'rgba(76, 81, 191, 0.2)',
                          fill: true,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
