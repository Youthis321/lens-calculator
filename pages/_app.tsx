// pages/_app.tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OneSignalProvider from './OneSignalProvider';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Layout } from '../components/Layout'
import { BottomNavbar } from '../components/BottomNavbar';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isClicked, setIsClicked] = useState(false);
  const [mounted, setMounted] = useState(false); // untuk hindari mismatch SSR/CSR
  const [hideNavbar, setHideNavbar] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      // Cek jika sudah di bawah (5px tolerance)
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 5
      ) {
        setHideNavbar(true);
      } else {
        setHideNavbar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      <SpeedInsights />
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
      <div className="main-content container py-5" style={{ paddingBottom: '80px' }}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </div>

      {/* Bottom Navbar Component */}
      <BottomNavbar theme={theme} hideNavbar={hideNavbar} />

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
