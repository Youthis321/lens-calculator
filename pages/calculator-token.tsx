import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { FaRegCopy, FaPaste } from "react-icons/fa"; // Add this import
import { TokenSelector } from "../components/TokenSelector";
import { InvestmentForm } from "../components/InvestmentForm";
import { 
  STATIC_TOKEN_LIST, 
  toIDR, 
  fetchTokenPrice, 
  fetchTokenHistory, 
  notifyUser 
} from "../utils/calculatorUtils";
import { TokenData, ChartData } from "../types/calculator";
import { api } from "../services/api";

export default function CalculatorToken() {
  // State definitions
  const [selectedMethod, setSelectedMethod] = useState("statis");
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin");
  const [tokenList, setTokenList] = useState<TokenData[]>([]);
  const [manualTokenPriceUSD, setManualTokenPriceUSD] = useState('');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateUSDToIDR, setRateUSDToIDR] = useState<number>(16000);
  const [history, setHistory] = useState<number[]>([]);
  const [historyLabels, setHistoryLabels] = useState<string[]>([]);

  const notifiedRef = useRef(false);

  // Utils functions
  const handleCopy = async (value: string | number) => {
    try {
      await navigator.clipboard.writeText(String(value));
    } catch (err) {
      alert("Gagal menyalin!");
    }
  };

  const handlePaste = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      setter(text.replace(/[^0-9.]/g, ""));
    } catch (err) {
      alert("Gagal paste!");
    }
  };

  // Fetch exchange rate
  useEffect(() => {
    api.getExchangeRate()
      .then(rate => setRateUSDToIDR(rate));
  }, []);

  // Fetch token list
  useEffect(() => {
    if (selectedMethod === "dinamis") {
      api.getTokenList()
        .then(data => setTokenList(data))
        .catch(err => {
          console.error("Error fetching token data:", err);
          setError("Gagal memuat data token.");
        });
    } else {
      setTokenList(STATIC_TOKEN_LIST);
    }
  }, [selectedMethod]);

  // Update token price and history
  useEffect(() => {
    if (!selectedToken || selectedToken === "lainnya") return;

    const updatePrice = async () => {
      try {
        const price = await api.getTokenPrice(selectedToken);
        if (price) {
          setPreviousPrice(currentPrice);
          setCurrentPrice(price);
          setTokenPriceUSD(price);
          setError(null);
        } else {
          setError("Harga token tidak tersedia");
        }
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Gagal mengambil data harga token.");
        setTokenPriceUSD(null);
      }
    };

    const updateHistory = async () => {
      try {
        const data = await api.getTokenHistory(selectedToken);
        if (data.length > 0) {
          setHistory(data.map(p => p[1]));
          setHistoryLabels(data.map(p => {
            const d = new Date(p[0]);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }));
        } else {
          setError("Data historis tidak tersedia");
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setHistory([]);
        setHistoryLabels([]);
      }
    };

    // Initial fetch
    const fetchData = async () => {
      await updatePrice();
      await updateHistory();
    };

    fetchData();

    // Set up interval for updates
    const PRICE_UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes
    const interval = setInterval(fetchData, PRICE_UPDATE_INTERVAL);

    // Cleanup interval on unmount or when selectedToken changes
    return () => clearInterval(interval);

  }, [selectedToken, currentPrice]); // Added currentPrice as dependency

  // Price notification
  useEffect(() => {
    if (currentPrice && previousPrice && !notifiedRef.current) {
      const diff = ((currentPrice - previousPrice) / previousPrice) * 100;
      if (diff >= 10) {
        notifyUser(`Harga token naik ${diff.toFixed(2)}%! Sekarang: $${currentPrice}`);
        notifiedRef.current = true;
      }
    }
  }, [currentPrice, previousPrice]);

  // Handlers
  const handleReset = () => {
    setToken('');
    setBuyPrice('');
    setTargetPrice('');
    setManualTokenPriceUSD('');
    setSelectedToken('bitcoin');
    setError(null);
  };

  const handleExportCSV = () => {
    const rows = [
      ["Jumlah Token", token],
      ["Harga Beli", buyPrice],
      ["Target Harga", targetPrice],
      ["Total Nilai (USD)", potential],
      ["Total Investasi (USD)", invested],
      ["Profit (USD)", profit]
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simulasi-token.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculations
  const tokenValue = parseFloat(token) || 0;
  const buyPriceValue = parseFloat(buyPrice) || 0;
  const targetPriceValue = parseFloat(targetPrice) || 0;
  const isFomo = targetPriceValue >= buyPriceValue * 100;

  const potential = tokenValue * targetPriceValue;
  const invested = tokenValue * buyPriceValue;
  const profit = potential - invested;

  const targetPrices = [2, 5, 10, 50, 100, 500].map(multiplier => buyPriceValue * multiplier);

  const predictionData = Array.from({ length: 7 }, (_, i) => 
    currentPrice ? currentPrice * Math.pow(1.05, i + 1) : 0
  );

  // Chart configurations
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '📈 Simulasi Prediksi Harga 7 Hari' }
    }
  };

  const predictionChart = {
    labels: ['+1 Hari', '+2 Hari', '+3 Hari', '+4 Hari', '+5 Hari', '+6 Hari', '+7 Hari'],
    datasets: [{
      label: 'Prediksi Harga (USD)',
      data: predictionData,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.3
    }]
  };

  const historyChart = {
    labels: historyLabels,
    datasets: [{
      label: 'Harga 7 Hari (USD)',
      data: history,
      borderColor: 'rgb(54, 162, 235)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      tension: 0.3
    }]
  };

  return (
    <div className="main-content container py-5">
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
      
      <TokenSelector
        selectedToken={selectedToken}
        selectedMethod={selectedMethod}
        tokenList={tokenList}
        onTokenChange={setSelectedToken}
        onMethodChange={setSelectedMethod}
      />
      
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>🎯 Input Investasi</h5>
            <div className="mb-3">
              <label className="form-label">Jumlah Token</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(token)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setToken)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Harga Beli per Token ($)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(buyPrice)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setBuyPrice)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Target Harga Jual ($)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(targetPrice)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setTargetPrice)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>
            {currentPrice && (
                <div className="d-flex align-items-center">
                  <p className="text-muted small mb-0">Harga Token saat ini: ${currentPrice}</p>
                  <button
                    className="btn btn-outline-secondary ms-2"
                    type="button"
                    title="Copy"
                    onClick={() => handleCopy(currentPrice)}
                  >
                    <FaRegCopy />
                  </button>
                </div>
              )}
            <button className="btn btn-secondary mb-3 mt-3" onClick={handleReset}>Reset</button>
            <button className="btn btn-success mb-3 ms-2" onClick={handleExportCSV}>Export CSV</button>
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

        <div className="col-md-12 mt-4">
          <div className="card shadow-sm p-3">
            <h5>📉 Grafik Harga 7 Hari Terakhir</h5>
            <Line data={historyChart} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}