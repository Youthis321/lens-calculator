import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'; // Jika kamu punya styling tambahan
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OneSignalProvider from './OneSignalProvider'; // Pastikan file ini ada

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-bs-theme', savedTheme);
    } else {
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <OneSignalProvider />
      
      {/* Halaman utama */}
      <Component {...pageProps} />

      {/* Bottom Navbar */}
      <nav className="navbar fixed-bottom navbar-light bg-light border-top">
        <div className="container d-flex justify-content-around">
          <Link href="/" className={`nav-link text-center ${router.pathname === '/' ? 'text-primary' : ''}`}>
            <div>🏠</div>
            <small>Dashboard</small>
          </Link>
          <Link href="/calculator-token" className={`nav-link text-center ${router.pathname === '/calculator-token' ? 'text-primary' : ''}`}>
            <div>🧮</div>
            <small>Token</small>
          </Link>
          <Link href="/calculator-investasi" className={`nav-link text-center ${router.pathname === '/calculator-investasi' ? 'text-primary' : ''}`}>
            <div>📊</div>
            <small>Investasi</small>
          </Link>
          <button onClick={toggleTheme} className="btn btn-sm nav-link text-center border-0">
            <div>{theme === 'light' ? '🌞' : '🌙'}</div>
            <small>{theme === 'light' ? 'Terang' : 'Gelap'}</small>
          </button>
        </div>
      </nav>
    </>
  );
}
