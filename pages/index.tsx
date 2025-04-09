import { useEffect, useState, useRef } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [token, setToken] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [tokenStats, setTokenStats] = useState<any>(null);
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

  const chartMultipliers = [2, 5, 10, 50, 100, 200, 500];
  const chartLabels = chartMultipliers.map(mult => `${mult}x`);
  const chartDataPoints = chartMultipliers.map(mult => tokenValue * buyPriceValue * mult);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Total Value (USD)',
        data: chartDataPoints,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '📈 Simulasi Kenaikan Harga Token' }
    }
  };

  const predictionData = Array.from({ length: 7 }, (_, i) => {
    return currentPrice ? (currentPrice * Math.pow(1.05, i + 1)) : 0;
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

  const notifyUser = (message: string) => {
    if (Notification.permission === 'granted') {
      new Notification('📢 Token Alert!', { body: message });
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-bs-theme', savedTheme);
    } else {
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }, []);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=lens&vs_currencies=usd')
      .then((res) => res.json())
      .then((data) => {
        const newPrice = data.lens?.usd;
        if (newPrice) {
          setPreviousPrice(currentPrice);
          setCurrentPrice(newPrice);
        }
      });

    fetch('https://api.coingecko.com/api/v3/coins/lens')
      .then(res => res.json())
      .then(data => {
        const stats = {
          marketCap: data.market_data.market_cap.usd,
          fdv: data.market_data.fully_diluted_valuation.usd,
          volume24h: data.market_data.total_volume.usd,
          circulating: data.market_data.circulating_supply,
          totalSupply: data.market_data.total_supply,
          maxSupply: data.market_data.max_supply
        };
        setTokenStats(stats);
      });
  }, []);

  useEffect(() => {
    if (currentPrice && previousPrice && !notifiedRef.current) {
      const diff = ((currentPrice - previousPrice) / previousPrice) * 100;
      if (diff >= 10) {
        notifyUser(`Harga LENS naik ${diff.toFixed(2)}%! Sekarang: $${currentPrice}`);
        notifiedRef.current = true;
      }
    }
  }, [currentPrice, previousPrice]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };


  return (
    <>
      {isFomo && (
        <div className="alert alert-warning text-center" role="alert">
          🚨 <strong>FOMO Alert!</strong> Target harga kamu sangat tinggi. Pastikan ini berdasarkan analisa, bukan emosi! 🚀
        </div>
      )}

      <div className="container py-5">
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-outline-secondary" onClick={toggleTheme}>
            Ganti Tema: {theme === 'light' ? '🌞' : '🌙'}
          </button>
        </div>

        <h2 className="text-center mb-4">💰 Kalkulator Token LENS</h2>

        {tokenStats && (
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="card shadow-sm p-3">
                <h5>📊 Statistik Token LENS (Realtime)</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Market Cap:</strong> ${tokenStats.marketCap.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Fully Diluted Valuation (FDV):</strong> ${tokenStats.fdv.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Volume 24 Jam:</strong> ${tokenStats.volume24h.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Circulating Supply:</strong> {tokenStats.circulating.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Total Supply:</strong> {tokenStats.totalSupply.toLocaleString()}</li>
                  <li className="list-group-item"><strong>Max Supply:</strong> {tokenStats.maxSupply.toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h5>🎯 Input Investasi</h5>
              <div className="mb-3">
                <label className="form-label">Jumlah Token</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="form-control"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Harga Beli per Token ($)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="form-control"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Target Harga Jual ($)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="form-control"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>
              {currentPrice && (
                <p className="text-muted small">Harga LENS saat ini: ${currentPrice}</p>
              )}
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-3">
              <h5>📊 Simulasi Investasi</h5>
              <ul className="list-group mb-3">
                <li className="list-group-item">
                  <strong>Total Nilai (USD):</strong> ${potential.toFixed(2)}
                </li>
                <li className="list-group-item">
                  <strong>Total Nilai (IDR):</strong> {toIDR(potential * rateUSDToIDR)}
                </li>
                <li className="list-group-item">
                  <strong>Total Investasi:</strong> ${invested.toFixed(2)} ({toIDR(invested * rateUSDToIDR)})
                </li>
                <li className="list-group-item">
                  <strong>Profit:</strong> ${profit.toFixed(2)} ({toIDR(profit * rateUSDToIDR)})
                </li>
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
            <div className="card shadow-sm p-3 mb-4">
              <h5 className="text-center">📉 Grafik Kenaikan</h5>
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="card shadow-sm p-3">
              <h5 className="text-center">📅 Prediksi 7 Hari</h5>
              <Line data={predictionChart} options={{ responsive: true, plugins: { title: { display: true, text: 'Prediksi Harga LENS Mingguan' } } }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
