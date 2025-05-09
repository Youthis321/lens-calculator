// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OneSignalProvider from './OneSignalProvider';
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false); // untuk hindari mismatch SSR/CSR

  useEffect(() => {
    setMounted(true);

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

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  if (!mounted) return null; // hindari flicker tema saat SSR

  return (
    <>
      <Analytics />
      <OneSignalProvider />

      {/* Tombol Toggle Tema */}
      <button
        onClick={toggleTheme}
        className={`btn btn-light position-fixed top-0 end-0 m-3 shadow-sm border rounded-circle d-flex flex-column align-items-center justify-content-center transition-transform ${
          isClicked ? 'scale-effect' : ''
        }`}
        style={{ width: '48px', height: '48px', zIndex: 1050 }}
        title={`Ubah ke mode ${theme === 'light' ? 'gelap' : 'terang'}`}
      >
        <span className="fs-5">{theme === 'light' ? '🌞' : '🌙'}</span>
      </button>

      {/* Halaman utama */}
      <Component {...pageProps} />

      {/* Bottom Navbar */}
      <nav className={`navbar fixed-bottom ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} border-top py-2`}>
        <div className="container d-flex justify-content-between">
          <Link href="/" className={`nav-link text-center ${router.pathname === '/' ? 'text-primary' : ''} p-2`}>
            <div className="fs-4">🏠</div>
            <small className="d-block">Dashboard</small>
          </Link>
          <Link href="/calculator-investasi" className={`nav-link text-center ${router.pathname === '/calculator-investasi' ? 'text-primary' : ''} p-2`}>
            <div className="fs-4">📊</div>
            <small className="d-block">Investasi</small>
          </Link>
          <Link href="/calculator-token" className={`nav-link text-center ${router.pathname === '/calculator-token' ? 'text-primary' : ''} p-2`}>
            <div className="fs-4">🧮</div>
            <small className="d-block">Token</small>
          </Link>
          <Link href="/signal-token" className={`nav-link text-center ${router.pathname === '/signal-token' ? 'text-primary' : ''} p-2`}>
            <div className="fs-4">📈</div>
            <small className="d-block">Signal</small>
          </Link>
        </div>
      </nav>

      {/* Global Style: Efek klik tema */}
      <style jsx global>{`
        .scale-effect {
          transform: scale(1.2);
          transition: transform 0.2s ease-in-out;
        }
        .transition-transform {
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
}
