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
import { FaRegCopy, FaPaste } from "react-icons/fa"; // Tambahkan di bagian import

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Fungsi filter dummy
const filterTokens = (data: any[]) => data; // Ganti sesuai logika filter yang diinginkan

export default function Home() {
  const [selectedMethod, setSelectedMethod] = useState("statis");
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin");
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [manualTokenPriceUSD, setManualTokenPriceUSD] = useState('');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [token, setToken] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateUSDToIDR, setRateUSDToIDR] = useState<number>(16000); // default
  const [history, setHistory] = useState<number[]>([]);
  const [historyLabels, setHistoryLabels] = useState<string[]>([]);

  const notifiedRef = useRef(false);

  // Fungsi copy dan paste
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
      setter(text.replace(/[^0-9.]/g, "")); // hanya angka/desimal
    } catch (err) {
      alert("Gagal paste!");
    }
  };

  // Ambil kurs dari API
  useEffect(() => {
    fetch('https://api.exchangerate.host/convert?from=USD&to=IDR')
      .then((res) => res.json())
      .then((data) => {
        if (data.info?.rate) setRateUSDToIDR(data.info.rate);
      })
      .catch((err) => console.error("Gagal mengambil kurs USD ke IDR:", err));
  }, []);

  // Ambil daftar token
  useEffect(() => {
    if (selectedMethod === "dinamis") {
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1")
        .then((res) => res.json())
        .then((data) => setTokenList(filterTokens(data)))
        .catch((err) => {
          console.error("Error fetching token data:", err);
          setError("Gagal memuat data token.");
        });
    } else {
      const staticTokenList = [
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
        { id: "lainnya", name: "Lainnya", symbol: "LAINNYA", market_cap_change_percentage_24h: 0 },
      ];
      setTokenList(staticTokenList);
    }
  }, [selectedMethod]);

  // Ambil harga token terpilih
  useEffect(() => {
    if (!selectedToken) return;

    if (selectedToken === "lainnya") {
      const manualPrice = parseFloat(manualTokenPriceUSD);
      if (!isNaN(manualPrice)) {
        setTokenPriceUSD(manualPrice);
      } else {
        setTokenPriceUSD(null);
      }
      return;
    }

    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
      .then((res) => {
        if (!res.ok) throw new Error("Token tidak ditemukan");
        return res.json();
      })
      .then((data) => {
        if (data.market_data?.current_price?.usd) {
          setTokenPriceUSD(data.market_data.current_price.usd);
          setError(null);
        } else {
          setError("Data harga token tidak tersedia.");
          setTokenPriceUSD(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching token data:", err);
        setError("Gagal mengambil data harga token.");
        setTokenPriceUSD(null);
      });
  }, [selectedToken, manualTokenPriceUSD]);

  // Harga naik 10%
  useEffect(() => {
    if (!selectedToken) return;
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.market_data && data.market_data.current_price) {
          setPreviousPrice(currentPrice);
          setCurrentPrice(data.market_data.current_price.usd);
        }
      });
  }, [selectedToken]);

  useEffect(() => {
    if (currentPrice && previousPrice && !notifiedRef.current) {
      const diff = ((currentPrice - previousPrice) / previousPrice) * 100;
      if (diff >= 10) {
        notifyUser(`Harga token naik ${diff.toFixed(2)}%! Sekarang: $${currentPrice}`);
        notifiedRef.current = true;
      }
    }
  }, [currentPrice, previousPrice]);

  useEffect(() => {
    if (!selectedToken || selectedToken === "lainnya") return;

    const fetchPrice = () => {
      fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.market_data?.current_price?.usd) {
            setCurrentPrice(data.market_data.current_price.usd);
          }
        });
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // 30 detik
    return () => clearInterval(interval);
  }, [selectedToken]);

  useEffect(() => {
    if (!selectedToken || selectedToken === "lainnya") return;
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=7`)
      .then(res => res.json())
      .then(data => {
        if (data.prices) {
          setHistory(data.prices.map((p: [number, number]) => p[1]));
          setHistoryLabels(data.prices.map((p: [number, number]) => {
            const d = new Date(p[0]);
            return `${d.getDate()}/${d.getMonth() + 1}`;
          }));
        }
      });
  }, [selectedToken]);

  const notifyUser = (message: string) => {
    if (Notification.permission === 'granted') {
      new Notification('📢 Token Alert!', { body: message });
    } else {
      Notification.requestPermission();
    }
  };

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

  const tokenValue = parseFloat(token) || 0;
  const buyPriceValue = parseFloat(buyPrice) || 0;
  const targetPriceValue = parseFloat(targetPrice) || 0;
  const isFomo = targetPriceValue >= buyPriceValue * 100;

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

  const historyChart = {
    labels: historyLabels,
    datasets: [
      {
        label: 'Harga 7 Hari (USD)',
        data: history,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
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
      <div className="row g-4">
        {/* Pilihan Metode */}
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <label className="form-label fw-bold">🔄 Pilih Metode:</label>
          <select
            className="form-select"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
          >
            <option value="statis">Statis</option>
            <option value="dinamis">Dinamis (Fetch dari API)</option>
          </select>
        </div>
      </div>
      
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
            {currentPrice && <p className="text-muted small">Harga Token saat ini: ${currentPrice}</p>}
            <button className="btn btn-secondary mb-3" onClick={handleReset}>Reset</button>
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