import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const tokenList = [
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
];

export default function InvestmentCalculator() {
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin"); // Inisialisasi token yang dipilih
  const [investmentIDR, setInvestmentIDR] = useState('');
  const [exchangeRate, setExchangeRate] = useState(16000); // 1 USD = 16000 IDR
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [targetTokenAmount, setTargetTokenAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const investmentUSD = parseFloat(investmentIDR) / exchangeRate || 0;
  const tokensReceived = tokenPriceUSD ? investmentUSD / tokenPriceUSD : 0;
  const targetToken = parseFloat(targetTokenAmount) || 0;
  const costToReachTarget = tokenPriceUSD ? targetToken * tokenPriceUSD * exchangeRate : 0;

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.market_data && data.market_data.current_price) {
          setTokenPriceUSD(data.market_data.current_price.usd);
          setError(null); // Reset error if data is valid
        } else {
          setError('Data harga token tidak tersedia.');
          setTokenPriceUSD(null); // Set price to null if data is invalid
        }
      })
      .catch(err => {
        console.error("Error fetching token data:", err);
        setError('Gagal mengambil data harga token.');
        setTokenPriceUSD(null);
      });
  }, [selectedToken]); // Trigger fetch data saat selectedToken berubah

  const toIDR = (value: number) => value.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR"
  });

  const chartData = {
    labels: ["Investasi Awal", "Target Token"],
    datasets: [
      {
        label: "Biaya Investasi (IDR)",
        data: [parseFloat(investmentIDR) || 0, costToReachTarget],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "📊 Grafik Investasi Token LENS" }
    },
    scales: {
      y: {
        ticks: {
          callback: function (value: number) {
            return 'Rp' + value.toLocaleString('id-ID');
          }
        }
      }
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">💰 Kalkulator Investasi Token Pilihan</h2>

      <div className="row g-4">
        {/* Form Input */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <div className="mb-3">
              <label className="form-label">Pilih Token</label>
              <select
                className="form-select"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                {tokenList.map(token => (
                  <option key={token.id} value={token.id}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Jumlah Investasi (IDR)</label>
              <input
                type="number"
                className="form-control"
                value={investmentIDR}
                onChange={(e) => setInvestmentIDR(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nilai Investasi (USD)</label>
              <input
                type="text"
                className="form-control"
                value={investmentUSD.toFixed(2)}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Harga Token (USD)</label>
              <input
                type="text"
                className="form-control"
                value={tokenPriceUSD ? `$${tokenPriceUSD.toFixed(6)}` : error || 'Memuat...'}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Total Token Didapat</label>
              <input
                type="text"
                className="form-control"
                value={tokenPriceUSD ? tokensReceived.toFixed(4) : '-'}
                readOnly
              />
            </div>

            <hr />

            <div className="mb-3">
              <label className="form-label">Target Token yang Diinginkan</label>
              <input
                type="number"
                className="form-control"
                value={targetTokenAmount}
                onChange={(e) => setTargetTokenAmount(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Biaya yang Diperlukan (IDR)</label>
              <input
                type="text"
                className="form-control"
                value={toIDR(costToReachTarget)}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Grafik */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
