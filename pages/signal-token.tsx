import { useEffect, useState } from 'react';
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
import { Token } from '../types/token';
import { TokenCard } from '../components/TokenCard';
import { SIGNAL_THRESHOLD, NOTIFY_THRESHOLD, fetchTokenDetails, notifyUser } from '../utils/tokenUtils';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SignalTokenPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const getSparklineLabels = (prices: number[]) => {
    const now = new Date();
    return prices.map((_, i, arr) => {
      const daysAgo = arr.length - 1 - i;
      const date = new Date(now);
      date.setDate(now.getDate() - daysAgo);
      return date.toLocaleDateString();
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
    },
  };

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

      // Ambil detail token (termasuk twitter_username) secara paralel
      const tokensWithTwitter = await Promise.all(
        filtered.map(async (token) => {
          try {
            const detail = await fetchTokenDetails(token.id);
            return { ...token, twitter_username: detail.twitter_username };
          } catch {
            return { ...token, twitter_username: undefined };
          }
        })
      );

      // Kirim notifikasi jika memenuhi threshold
      tokensWithTwitter.forEach((token) => {
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

      // Urutkan berdasarkan volume
      const sorted = tokensWithTwitter.sort((a, b) => b.total_volume - a.total_volume);

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
        <div className="text-center text-gray-600">
          🚫 Tidak ada token yang naik ≥{SIGNAL_THRESHOLD}% dalam 1h atau 24h.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <TokenCard
              key={token.id}
              token={token}
              chartOptions={chartOptions}
              getSparklineLabels={getSparklineLabels}
            />
          ))}
        </div>
      )}
    </div>
  );
}
