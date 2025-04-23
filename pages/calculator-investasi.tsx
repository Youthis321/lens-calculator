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
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function InvestmentCalculator() {
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin");
  const [investmentIDR, setInvestmentIDR] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(16000);
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [targetTokenAmount, setTargetTokenAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("statis");
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [idrValue, setIdrValue] = useState<number>(0);
  const [usdValue, setUsdValue] = useState<number>(0);

  const investmentUSD = parseFloat(investmentIDR) / exchangeRate || 0;
  const tokensReceived = tokenPriceUSD ? investmentUSD / tokenPriceUSD : 0;
  const targetToken = parseFloat(targetTokenAmount) || 0;
  const costToReachTarget = tokenPriceUSD ? targetToken * tokenPriceUSD * exchangeRate : 0;

  // Utility function untuk format IDR
  const toIDR = (value: number): string =>
    value.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

  // Filter token berdasarkan kondisi tertentu
  const filterTokens = (tokens: any[]) =>
    tokens.filter(
      (token) =>
        token.market_cap_change_percentage_24h > 0 ||
        token.market_cap_change_percentage_7d > 0
    );

  // Ambil kurs USD ke IDR dari API exchangerate.host
  useEffect(() => {
    fetch("https://api.exchangerate.host/convert?from=USD&to=IDR")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil kurs USD ke IDR");
        return res.json();
      })
      .then((data) => {
        if (data.result) {
          setExchangeRate(data.result);
        }
      })
      .catch((err) => {
        console.error("Gagal ambil kurs USD ke IDR:", err);
        setError("Gagal mengambil kurs USD ke IDR. Silakan coba lagi nanti.");
      });
  }, []);

  // Ambil daftar token dari API atau gunakan data statis
  useEffect(() => {
    if (selectedMethod === "dinamis") {
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1")
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
        // ... tambahkan token lainnya sesuai kebutuhan
      ];
      setTokenList(staticTokenList);
    }
  }, [selectedMethod]);

  // Ambil harga token terpilih
  useEffect(() => {
    if (!selectedToken) return;
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
  }, [selectedToken]);

  // Data grafik
  const chartData = {
    labels: ["Investasi Awal", "Target Token"],
    datasets: [
      {
        label: "Biaya Investasi (IDR)",
        data: [parseFloat(investmentIDR) || 0, costToReachTarget],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "📊 Grafik Investasi Token" },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number) => `Rp${value.toLocaleString("id-ID")}`,
        },
      },
    },
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">💰 Kalkulator Investasi Token Pilihan</h2>

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

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <div className="mb-3">
              <label className="form-label">Pilih Token</label>
              <select
                className="form-select"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                {tokenList.map((token) => (
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
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                  setInvestmentIDR(value);
                }}
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mt-3">
              <p>📈 Harga Saat Ini: {tokenPriceUSD ? `$${tokenPriceUSD}` : "Loading..."}</p>
              <p>🎯 Token Didapat: {tokensReceived.toFixed(4)}</p>

              {/* Form Konversi IDR ⇌ USD */}
              <div className="card shadow-sm p-4 mt-5">
                <h4 className="mb-3">💱 Konversi IDR ⇌ USD</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">IDR</label>
                    <input
                      type="number"
                      className="form-control"
                      value={idrValue}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setIdrValue(value);
                        setUsdValue(value / exchangeRate);
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">USD</label>
                    <input
                      type="number"
                      className="form-control"
                      value={usdValue}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setUsdValue(value);
                        setIdrValue(value * exchangeRate);
                      }}
                    />
                  </div>
                </div>
              </div>

              <p>💱 Kurs USD ke IDR: {exchangeRate.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="mb-3 mt-4">
            <label className="form-label">Target Token (Jumlah)</label>
            <input
              type="number"
              className="form-control"
              value={targetTokenAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                setTargetTokenAmount(value);
              }}
            />
          </div>

          <div className="mt-3">
            <p>💸 Biaya Capai Target: {toIDR(costToReachTarget)}</p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}