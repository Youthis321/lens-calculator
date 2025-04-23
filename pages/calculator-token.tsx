import { useEffect, useState, useRef } from "react";
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
  { id: "troll-2", name: "Troll", symbol: "TROLL", market_cap_change_percentage_24h: 12.5 },
];

export default function Home() {
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin");
  const [token, setToken] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notifiedRef = useRef(false);

  const tokenValue = parseFloat(token) || 0;
  const buyPriceValue = parseFloat(buyPrice) || 0;
  const targetPriceValue = parseFloat(targetPrice) || 0;
  const isFomo = targetPriceValue >= buyPriceValue * 100;

  const rateUSDToIDR = 16000;
  const potential = tokenValue * targetPriceValue;
  const invested = tokenValue * buyPriceValue;
  const profit = potential - invested;

  const toIDR = (value: number) =>
    value.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  const targetPrices = [
    buyPriceValue * 2,
    buyPriceValue * 5,
    buyPriceValue * 10,
    buyPriceValue * 50,
    buyPriceValue * 100,
    buyPriceValue * 500,
  ];

  const predictionData = Array.from({ length: 7 }, (_, i) => {
    return currentPrice ? currentPrice * Math.pow(1.05, i + 1) : 0;
  });

  const predictionChart = {
    labels: ['+1 Hari', '+2 Hari', '+3 Hari', '+4 Hari', '+5 Hari', '+6 Hari', '+7 Hari'],
    datasets: [
      {
        label: 'Prediksi Harga (USD)',
        data: predictionData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '📈 Simulasi Prediksi Harga 7 Hari' }
    }
  };

  const notifyUser = (message: string) => {
    if (Notification.permission === 'granted') {
      new Notification('📢 Token Alert!', { body: message });
    } else {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.market_data && data.market_data.current_price) {
          setPreviousPrice(currentPrice); // simpan harga lama
          setCurrentPrice(data.market_data.current_price.usd); // update harga sekarang
          setError(null);
        } else {
          setError('Data harga token tidak tersedia.');
          setCurrentPrice(null);
        }
      })
      .catch(err => {
        console.error("Error fetching token data:", err);
        setError('Gagal mengambil data harga token.');
        setCurrentPrice(null);
      });
  }, [selectedToken]);

  useEffect(() => {
    if (currentPrice && previousPrice && !notifiedRef.current) {
      const diff = ((currentPrice - previousPrice) / previousPrice) * 100;
      if (diff >= 10) {
        notifyUser(`Harga token pilihan kamu naik ${diff.toFixed(2)}%! Sekarang: $${currentPrice}`);
        notifiedRef.current = true;
      }
    }
  }, [currentPrice, previousPrice]);

  return (
    <div className="container py-5">
      {isFomo && (
        <div className="alert alert-warning text-center" role="alert">
          🚨 <strong>FOMO Alert!</strong> Target harga kamu sangat tinggi. Pastikan ini berdasarkan analisa, bukan emosi! 🚀
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          ⚠️ {error}
        </div>
      )}

      <h2 className="text-center mb-4">💰 Kalkulator Token Pilihan</h2>
      <div className="row g-4">
        <div className="mb-3">
          <label className="form-label">Pilih Token</label>
          <select className="form-select" value={selectedToken} onChange={(e) => {
            setSelectedToken(e.target.value);
            notifiedRef.current = false; // reset notifikasi saat ganti token
          }}>
            {tokenList.map(token => (
              <option key={token.id} value={token.id}>
                {token.name} ({token.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>🎯 Input Investasi</h5>
            <div className="mb-3">
              <label className="form-label">Jumlah Token</label>
              <input type="number" className="form-control" value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Harga Beli per Token ($)</label>
              <input type="number" className="form-control" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Target Harga Jual ($)</label>
              <input type="number" className="form-control" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
            </div>
            {currentPrice && <p className="text-muted small">Harga Token saat ini: ${currentPrice}</p>}
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>📊 Simulasi Investasi</h5>
            <ul className="list-group mb-3">
              <li className="list-group-item"><strong>Total Nilai (USD):</strong> ${potential.toFixed(2)}</li>
              <li className="list-group-item"><strong>Total Nilai (IDR):</strong> {toIDR(potential * rateUSDToIDR)}</li>
              <li className="list-group-item"><strong>Total Investasi:</strong> ${invested.toFixed(2)} ({toIDR(invested * rateUSDToIDR)})</li>
              <li className="list-group-item"><strong>Profit:</strong> ${profit.toFixed(2)} ({toIDR(profit * rateUSDToIDR)})</li>
            </ul>

            <h6 className="mt-4 mb-2">📈 Auto Exit Plan</h6>
            <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}>
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    <th>Target ($)</th>
                    <th>Jual (USD)</th>
                    <th>Profit (USD)</th>
                    <th>Profit (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  {targetPrices.map((price, idx) => {
                    const total = tokenValue * price;
                    const gain = total - invested;
                    return (
                      <tr key={idx}>
                        <td>${price.toFixed(5)}</td>
                        <td>${total.toFixed(2)}</td>
                        <td>${gain.toFixed(2)}</td>
                        <td>{toIDR(gain * rateUSDToIDR)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>📉 Prediksi Harga Mingguan</h5>
            <Line data={predictionChart} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
