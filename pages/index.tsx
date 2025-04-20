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
  const [tokenStats, setTokenStats] = useState<any>(null);
  
  const [tokenValue, setTokenValue] = useState<number>(10000); // default value
  const [buyPriceValue, setBuyPriceValue] = useState<number>(0.0005); // default value

  // Fetch data from CoinGecko
  useEffect(() => {
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

  // Chart Data
  const chartMultipliers = [2, 5, 10, 50, 100, 200, 500];
  const chartLabels = chartMultipliers.map(mult => `${mult}x`);
  const chartDataPoints = chartMultipliers.map(mult => tokenValue * buyPriceValue * mult);

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

  return (
    <div className="container py-5">
      <h1 className="text-center">📊 Dashboard</h1>
      <p className="text-center">Selamat datang di aplikasi kalkulator token dan investasi.</p>

      {tokenStats && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow-sm p-3">
              <h5>📊 Statistik Token LENS (Realtime)</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Market Cap:</strong> ${tokenStats.marketCap.toLocaleString()}</li>
                <li className="list-group-item"><strong>FDV:</strong> ${tokenStats.fdv.toLocaleString()}</li>
                <li className="list-group-item"><strong>Volume 24 Jam:</strong> ${tokenStats.volume24h.toLocaleString()}</li>
                <li className="list-group-item"><strong>Circulating Supply:</strong> {tokenStats.circulating.toLocaleString()}</li>
                <li className="list-group-item"><strong>Total Supply:</strong> {tokenStats.totalSupply.toLocaleString()}</li>
                <li className="list-group-item"><strong>Max Supply:</strong> {tokenStats.maxSupply.toLocaleString()}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm p-4">
            <h5>📈 Grafik Kenaikan Harga Token</h5>
            <Line data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
