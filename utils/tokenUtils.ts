export const SIGNAL_THRESHOLD = 10;
export const NOTIFY_THRESHOLD = 15;

export const fetchTokenDetails = async (id: string) => {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    symbol: data.symbol,
    image: data.image.large,
    current_price: data.market_data.current_price.usd,
    price_change_percentage_1h_in_currency: data.market_data.price_change_percentage_1h_in_currency.usd,
    price_change_percentage_24h_in_currency: data.market_data.price_change_percentage_24h_in_currency.usd,
    total_volume: data.market_data.total_volume.usd,
    sparkline_in_7d: data.market_data.sparkline_7d,
    twitter_username: data.links.twitter_screen_name,
  };
};

export const notifyUser = (title: string, message: string) => {
  if (typeof window !== 'undefined' && 'OneSignal' in window) {
    (window as any).OneSignal.push(() => {
      (window as any).OneSignal.sendSelfNotification(
        title,
        message,
        'https://lens-calculator.vercel.app/signal-token',
        'https://lens-calculator.vercel.app/icons/icon-512x512.png'
      );
    });
  }
};