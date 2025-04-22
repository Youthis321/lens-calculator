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

export default function Dashboard() {
  const [selectedMethod, setSelectedMethod] = useState("statis"); // statis or dinamis
  const [tokenStats, setTokenStats] = useState<any>(null);
  const [tokenList, setTokenList] = useState<any[]>([]); // list of tokens fetched from CoinGecko
  const [searchText, setSearchText] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("lens");

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  const chartMultipliers = [2, 5, 10, 50, 100, 200, 500];
  const chartLabels = chartMultipliers.map(mult => `${mult}x`);
  const chartDataPoints = chartMultipliers.map(mult => 10000 * 0.0005 * mult);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Total Value (USD)",
        data: chartDataPoints,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3
      }
    ]
  };

  useEffect(() => {
    if (selectedMethod === "dinamis") {
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1")
        .then(res => res.json())
        .then(data => {
          const tokens = data.filter((token: any) => token.market_cap_change_percentage_24h > 0 || token.market_cap_change_percentage_7d > 0);
          setTokenList(tokens);
        })
        .catch(err => console.error("Error fetching token data:", err));
    } else {
      setTokenList([
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
      ]);
    }
  }, [selectedMethod]);

  useEffect(() => {
    if (selectedToken) {
      fetch(`https://api.coingecko.com/api/v3/coins/${selectedToken}`)
        .then(res => res.json())
        .then(data => {
          const marketData = data?.market_data;
          if (marketData) {
            const stats = {
              marketCap: marketData.market_cap?.usd ?? 0,
              fdv: marketData.fully_diluted_valuation?.usd ?? 0,
              volume24h: marketData.total_volume?.usd ?? 0,
              circulating: marketData.circulating_supply ?? 0,
              totalSupply: marketData.total_supply ?? 0,
              maxSupply: marketData.max_supply ?? 0
            };
            setTokenStats(stats);
          } else {
            setTokenStats(null);
          }
        })
        .catch(err => {
          console.error("Error fetching token data:", err);
          setTokenStats(null);
        });
    }
  }, [selectedToken]);

  const handleTokenSelect = (id: string) => {
    setSelectedToken(id);
    setSearchText("");
  };

  const filteredTokens = tokenList.filter(token =>
    token.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the A2HS prompt");
    } else {
      console.log("User dismissed the A2HS prompt");
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault(); // prevent auto prompt
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  return (
    <div className="container py-5">
      <h1 className="text-center">📊 Dashboard</h1>
      <p className="text-center">Selamat datang di aplikasi kalkulator token dan investasi.</p>

      {/* Install Button */}
      {canInstall && (
        <div className="text-center mb-4">
          <button className="btn btn-primary" onClick={handleInstallClick}>
            ➕ Install Aplikasi
          </button>
        </div>
      )}

      {/* Select Method */}
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <label className="form-label fw-bold">🔄 Pilih Metode:</label>
          <select
            className="form-select"
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
          >
            <option value="statis">Statis</option>
            <option value="dinamis">Dinamis (Fetch dari API)</option>
          </select>
        </div>
      </div>

      {/* Token Stats */}
      {tokenStats ? (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm p-3">
              <h5>📊 Statistik Token {selectedToken.toUpperCase()} (Realtime)</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Market Cap:</strong> ${tokenStats.marketCap.toLocaleString()}</li>
                <li className="list-group-item"><strong>FDV:</strong> ${tokenStats.fdv.toLocaleString()}</li>
                <li className="list-group-item"><strong>Volume 24 Jam:</strong> ${tokenStats.volume24h.toLocaleString()}</li>
                <li className="list-group-item"><strong>Circulating Supply:</strong> {tokenStats.circulating.toLocaleString()}</li>
                <li className="list-group-item"><strong>Total Supply:</strong> {tokenStats.totalSupply?.toLocaleString() ?? "N/A"}</li>
                <li className="list-group-item"><strong>Max Supply:</strong> {tokenStats.maxSupply?.toLocaleString() ?? "N/A"}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info">Memuat data statistik...</div>
      )}

      {/* Token Select */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Cari token..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <ul className="list-group mt-2">
          {filteredTokens.map(token => (
            <li
              key={token.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => handleTokenSelect(token.id)}
            >
              {token.name}
              <span className="badge bg-primary">{token.symbol.toUpperCase()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Chart */}
      <div className="mb-4">
        <Line data={chartData} />
      </div>
    </div>
  );
}
