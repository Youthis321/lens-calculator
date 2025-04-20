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

export default function InvestmentCalculator() {
  const [investmentIDR, setInvestmentIDR] = useState('');
  const [exchangeRate, setExchangeRate] = useState(16000); // 1 USD = 16000 IDR
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [targetTokenAmount, setTargetTokenAmount] = useState('');
  
  const investmentUSD = parseFloat(investmentIDR) / exchangeRate || 0;
  const tokensReceived = tokenPriceUSD ? investmentUSD / tokenPriceUSD : 0;
  const targetToken = parseFloat(targetTokenAmount) || 0;
  const costToReachTarget = tokenPriceUSD ? targetToken * tokenPriceUSD * exchangeRate : 0;

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=lens&vs_currencies=usd")
      .then(res => res.json())
      .then(data => {
        setTokenPriceUSD(data.lens?.usd || null);
      });
  }, []);

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
      <h2 className="mb-4 text-center">💰 Kalkulator Investasi Token LENS</h2>

      <div className="row g-4">
        {/* Form Input */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
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
              <label className="form-label">Harga Token LENS (USD)</label>
              <input
                type="text"
                className="form-control"
                value={tokenPriceUSD ? `$${tokenPriceUSD.toFixed(4)}` : 'Memuat...'}
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
