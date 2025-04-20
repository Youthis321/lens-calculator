import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OneSignalProvider from './OneSignalProvider' // atau @/components/OneSignalProvider

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.body.setAttribute('data-bs-theme', savedTheme)
    } else {
      document.body.setAttribute('data-bs-theme', 'light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.setAttribute('data-bs-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <>
      <OneSignalProvider />

      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <Link href="/" className="navbar-brand">🧮 Kalkulator Token</Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${router.pathname === '/' ? 'active' : ''}`} href="/">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${router.pathname === '/calculator-token' ? 'active' : ''}`} href="/calculator-token">Calculator Token</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${router.pathname === '/calculator-investasi' ? 'active' : ''}`} href="/calculator-investasi">Calculator Investasi</Link>
            </li>
            {/* Toggle Theme Button */}
            <li className="nav-item ms-3">
              <button onClick={toggleTheme} className="btn btn-sm btn-outline-light">
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <Component {...pageProps} />
    </>
  )
}
