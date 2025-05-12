import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Freecurrencyapi from '@everapi/freecurrencyapi-js';
import { FaRegCopy, FaPaste } from "react-icons/fa";
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

// Tambahkan interface untuk type safety
interface TokenData {
  id: string;
  name: string;
  symbol: string;
  market_cap_change_percentage_24h: number;
  current_price?: number;
  market_cap?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
}

interface MarketData {
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
}

export default function InvestmentCalculator() {
  const [selectedToken, setSelectedToken] = useState<string>("bitcoin");
  const [investmentIDR, setInvestmentIDR] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number>(16000);
  const freecurrencyapi = new Freecurrencyapi('fca_live_TKIDKKcV7kRiZk3MX4b1cWt3nU7mujf0zZB50ike');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const [targetTokenAmount, setTargetTokenAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("statis");
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [idrValue, setIdrValue] = useState<number>(0);
  const [usdValue, setUsdValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [futurePrice, setFuturePrice] = useState<string>("");
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<[number, number][]>([]);
  const [marketInfo, setMarketInfo] = useState<MarketData | null>(null);
  const [timeframe, setTimeframe] = useState<string>("30");

  const investmentUSD = parseFloat(investmentIDR) / exchangeRate || 0;
  const tokensReceived = tokenPriceUSD ? investmentUSD / tokenPriceUSD : 0;
  const targetToken = parseFloat(targetTokenAmount) || 0;
  const costToReachTarget = tokenPriceUSD ? targetToken * tokenPriceUSD * exchangeRate : 0;

  const [manualTokenPriceUSD, setManualTokenPriceUSD] = useState<string>("");

  // Tambahan calculations
  const profitLoss = tokenPriceUSD && futurePrice ? 
    (parseFloat(futurePrice) - tokenPriceUSD) * tokensReceived * exchangeRate : 0;

  const monthsToTarget = tokenPriceUSD && monthlyInvestment ? 
    Math.ceil((targetToken * tokenPriceUSD - investmentUSD) / 
    (parseFloat(monthlyInvestment) / exchangeRate)) : 0;

  const annualizedReturn = profitLoss > 0 ? 
    ((profitLoss / parseFloat(investmentIDR)) * 100) : 0;

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
    const freecurrencyapi = new Freecurrencyapi('fca_live_TKIDKKcV7kRiZk3MX4b1cWt3nU7mujf0zZB50ike');
  
    freecurrencyapi.latest({
      base_currency: 'USD',
      currencies: 'IDR',
    }).then((response) => {
      console.log(response); // debug
      if (response.data && response.data.IDR) {
        setExchangeRate(response.data.IDR);
      }
    }).catch((err) => {
      console.error("Gagal ambil kurs USD ke IDR:", err);
      setError("Gagal mengambil kurs USD ke IDR. Silakan coba lagi nanti.");
    });
  }, []);
  
  // Tambahkan useEffect untuk load dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem("investmentCalculatorData");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.selectedToken) setSelectedToken(data.selectedToken);
      if (data.investmentIDR) setInvestmentIDR(data.investmentIDR);
      if (data.manualTokenPriceUSD) setManualTokenPriceUSD(data.manualTokenPriceUSD);
      if (data.targetTokenAmount) setTargetTokenAmount(data.targetTokenAmount);
      if (data.futurePrice) setFuturePrice(data.futurePrice);
      if (data.monthlyInvestment) setMonthlyInvestment(data.monthlyInvestment);
      if (data.idrValue) setIdrValue(data.idrValue);
      if (data.usdValue) setUsdValue(data.usdValue);
      if (data.selectedMethod) setSelectedMethod(data.selectedMethod);
    }
  }, []);

  // Simpan ke localStorage setiap kali field utama berubah
  useEffect(() => {
    localStorage.setItem(
      "investmentCalculatorData",
      JSON.stringify({
        selectedToken,
        investmentIDR,
        manualTokenPriceUSD,
        targetTokenAmount,
        futurePrice,
        monthlyInvestment,
        idrValue,
        usdValue,
        selectedMethod,
      })
    );
  }, [
    selectedToken,
    investmentIDR,
    manualTokenPriceUSD,
    targetTokenAmount,
    futurePrice,
    monthlyInvestment,
    idrValue,
    usdValue,
    selectedMethod,
  ]);

  // Ambil daftar token dari API atau gunakan data statis
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
  
    // Jika token adalah "lainnya", abaikan fetch
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
  
  useEffect(() => {
    if (selectedToken === 'lainnya' || !selectedToken) return;
    
    setIsLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}/market_chart?vs_currency=usd&days=${timeframe}`)
      .then(res => res.json())
      .then(data => {
        setHistoricalData(data.prices);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching historical data:", err);
        setError("Gagal memuat data historis.");
        setIsLoading(false);
      });
  }, [selectedToken, timeframe]);

  const historicalChartData = {
    labels: historicalData.map(item => new Date(item[0]).toLocaleDateString()),
    datasets: [{
      label: `Harga ${timeframe} Hari Terakhir`,
      data: historicalData.map(item => item[1]),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false
    }]
  };

  const historicalChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: '📈 Historical Price Chart' }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    }
  };

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

  return (
    <div className="main-content container py-4">
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
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={investmentIDR}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                    setInvestmentIDR(value);
                  }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(investmentIDR)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setInvestmentIDR)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>

            {/* jika pilhan token lainnya, maka tampil form inputan token harga lainnya */}
            {selectedToken === "lainnya" && (
              <div className="mb-3">
                <label className="form-label">Harga Token (USD) - Manual</label>
                <input
                  type="number"
                  className="form-control"
                  value={manualTokenPriceUSD}
                  onChange={(e) => {
                    setManualTokenPriceUSD(e.target.value);
                  }}
                  placeholder="Contoh: 0.0005"
                />
              </div>
            )}



            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mt-3">
              <p>📈 Harga Saat Ini: {tokenPriceUSD ? `$${tokenPriceUSD}` : "Loading..."} 
                <button
                  className="btn btn-outline-secondary ms-2"
                  type="button"
                  title="Copy"
                  onClick={() => tokenPriceUSD !== null && handleCopy(tokenPriceUSD)}
                >
                  <FaRegCopy />
                </button>
              </p>
              <p>🎯 Token Didapat: {tokensReceived.toFixed(4)}
                <button
                  className="btn btn-outline-secondary ms-2"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(tokensReceived)}
                >
                  <FaRegCopy />
                </button>
              </p>

              {/* Form Konversi IDR ⇌ USD */}
              <div className="card shadow-sm p-4 mt-5">
                <h4 className="mb-3">💱 Konversi IDR ⇌ USD</h4>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">IDR</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        value={idrValue}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setIdrValue(value);
                          setUsdValue(value / exchangeRate);
                        }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        title="Copy"
                        onClick={() => handleCopy(idrValue)}
                      >
                        <FaRegCopy />
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        title="Paste"
                        onClick={() => handlePaste((val) => setIdrValue(parseFloat(val)))}
                      >
                        <FaPaste />
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">USD</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control"
                        value={usdValue}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setUsdValue(value);
                          setIdrValue(value * exchangeRate);
                        }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        title="Copy"
                        onClick={() => handleCopy(usdValue)}
                      >
                        <FaRegCopy />
                      </button>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        title="Paste"
                        onClick={() => handlePaste((val) => setUsdValue(parseFloat(val)))}
                      >
                        <FaPaste />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <p>💱 Kurs USD ke IDR: {exchangeRate.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="mb-3 mt-4">
            <label className="form-label">Target Token (Jumlah)</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={targetTokenAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                  setTargetTokenAmount(value);
                }}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                title="Copy"
                onClick={() => handleCopy(targetTokenAmount)}
              >
                <FaRegCopy />
              </button>
              <button
                className="btn btn-outline-secondary"
                type="button"
                title="Paste"
                onClick={() => handlePaste(setTargetTokenAmount)}
              >
                <FaPaste />
              </button>
            </div>
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

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm p-4">
            <h4>📊 Historical Data</h4>
            <div className="mb-3">
              <select 
                className="form-select" 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <option value="1">24 Jam</option>
                <option value="7">7 Hari</option>
                <option value="30">30 Hari</option>
                <option value="90">90 Hari</option>
              </select>
            </div>
            {isLoading ? (
              <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Line data={historicalChartData} options={historicalChartOptions} />
            )}
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h4>💰 Proyeksi Profit/Loss</h4>
            <div className="mb-3">
              <label className="form-label">Perkiraan Harga Masa Depan (USD)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={futurePrice}
                  onChange={(e) => setFuturePrice(e.target.value)}
                  placeholder="Contoh: 1.5"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(futurePrice)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setFuturePrice)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>
            {profitLoss !== 0 && (
              <div className={`alert ${profitLoss > 0 ? 'alert-success' : 'alert-danger'}`}>
                <p className="mb-1">{profitLoss > 0 ? '📈 Potensi Profit' : '📉 Potensi Loss'}</p>
                <h5 className="mb-0">{toIDR(Math.abs(profitLoss))}</h5>
                {profitLoss > 0 && (
                  <small>Return: {annualizedReturn.toFixed(2)}%</small>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm p-4">
            <h4>⏱️ Rencana Investasi</h4>
            <div className="mb-3">
              <label className="form-label">Investasi Bulanan (IDR)</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(e.target.value)}
                  placeholder="Contoh: 1000000"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Copy"
                  onClick={() => handleCopy(monthlyInvestment)}
                >
                  <FaRegCopy />
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  title="Paste"
                  onClick={() => handlePaste(setMonthlyInvestment)}
                >
                  <FaPaste />
                </button>
              </div>
            </div>
            {monthsToTarget > 0 && (
              <div className="alert alert-info">
                <p className="mb-1">Waktu mencapai target:</p>
                <h5 className="mb-0">{monthsToTarget} bulan</h5>
                <small>({Math.floor(monthsToTarget/12)} tahun {monthsToTarget%12} bulan)</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}