import { useEffect, useState } from "react";
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

  // Saat pertama kali load halaman, baca dari localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-bs-theme', savedTheme);
    } else {
      // Default to light
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const [token, setToken] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [targetPrice, setTargetPrice] = useState(0);
  const isFomo = targetPrice >= buyPrice * 100;


  const rateUSDToIDR = 16000;
  const potential = token * targetPrice;
  const invested = token * buyPrice;
  const profit = potential - invested;

  const toIDR = (value: number) =>
    value.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  const targetPrices = [
    buyPrice * 2,
    buyPrice * 5,
    buyPrice * 10,
    buyPrice * 50,
    buyPrice * 100,
    buyPrice * 500,
  ];

  const chartMultipliers = [2, 5, 10, 50, 100, 200, 500];
  const chartLabels = chartMultipliers.map(mult => `${mult}x`);
  const chartDataPoints = chartMultipliers.map(mult => token * buyPrice * mult);

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
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: '📈 Simulasi Kenaikan Harga Token'
      }
    }
  };

  
  return (
    <>
    {isFomo && (
      <div className="alert alert-warning text-center" role="alert">
        🚨 <strong>FOMO Alert!</strong> Target harga kamu sangat tinggi. Pastikan ini berdasarkan analisa, bukan emosi! 🚀
      </div>
    )}

    <div className="container py-5">
      {/* Tema Switcher */}
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-secondary" onClick={toggleTheme}>
          Ganti Tema: {theme === 'light' ? '🌞' : '🌙'}
        </button>
      </div>

      <h2 className="text-center mb-4">💰 Kalkulator Token LENS</h2>
      <div className="row g-4">
        {/* Kiri - Form */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>🎯 Input Investasi</h5>
            <div className="mb-3">
              <label className="form-label">Jumlah Token</label>
              <input
                type="number"
                className="form-control"
                value={token}
                onChange={(e) => setToken(+e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Harga Beli per Token ($)</label>
              <input
                type="number"
                className="form-control"
                value={buyPrice}
                onChange={(e) => setBuyPrice(+e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Target Harga Jual ($)</label>
              <input
                type="number"
                className="form-control"
                value={targetPrice}
                onChange={(e) => setTargetPrice(+e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tengah - Output Simulasi */}
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
                    const total = token * price;
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

        {/* Kanan - Grafik */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3 h-100 d-flex flex-column justify-content-between">
            <h5 className="mb-3 text-center">📉 Grafik Kenaikan</h5>
            <div>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="text-center mt-3">
              <p className="text-muted small">* Simulasi ini untuk edukasi, bukan saran investasi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
