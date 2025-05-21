import { Line } from "react-chartjs-2";
import { Token } from "../types/token";

interface TokenCardProps {
  token: Token;
  chartOptions: any;
  getSparklineLabels: (prices: number[]) => string[];
}

export const TokenCard = ({ token, chartOptions, getSparklineLabels }: TokenCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 transition hover:shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full border border-gray-200" />
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{token.name}</h2>
          <p className="text-sm text-gray-500 uppercase">{token.symbol}</p>
        </div>
      </div>
      <div className="space-y-1 text-sm text-gray-700">
        <p>
          💵 Price: <span className="font-medium text-gray-900">${token.current_price.toLocaleString()}</span>
        </p>
        <p>
          📈 1h:{' '}
          <span
            className={`font-semibold ${
              token.price_change_percentage_1h_in_currency >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {token.price_change_percentage_1h_in_currency.toFixed(2)}%
          </span>
        </p>
        <p>
          📊 24h:{' '}
          <span
            className={`font-semibold ${
              token.price_change_percentage_24h_in_currency >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {token.price_change_percentage_24h_in_currency.toFixed(2)}%
          </span>
        </p>
        <p>🔁 Volume: ${token.total_volume.toLocaleString()}</p>
        {token.twitter_username ? (
          <a
            href={`https://x.com/${token.twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-0.5 bg-black text-white rounded text-xs hover:bg-gray-800 transition mt-2"
          >
            X
          </a>
        ) : (
          <span className="text-gray-400 text-xs mt-2 inline-block">Tidak ada akun X</span>
        )}
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
  );
};