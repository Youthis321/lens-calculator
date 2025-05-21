import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter()
  
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm d-none d-lg-block">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold fs-4 text-dark">Lens Calculator</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item mx-2">
                <Link 
                  href="/calculator-investasi" 
                  className={`nav-link fs-5 fw-medium text-dark ${router.pathname === '/calculator-investasi' ? 'active fw-bold' : ''}`}
                >
                  Kalkulator Investasi
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link 
                  href="/calculator-token" 
                  className={`nav-link fs-5 fw-medium text-dark ${router.pathname === '/calculator-token' ? 'active fw-bold' : ''}`}
                >
                  Kalkulator Token
                </Link>
              </li>
              <li className="nav-item mx-2">
                <Link 
                  href="/signal-token" 
                  className={`nav-link fs-5 fw-medium text-dark ${router.pathname === '/signal-token' ? 'active fw-bold' : ''}`}
                >
                  Sinyal Token
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container py-4 text-dark">
        {children}
      </main>
    </div>
  )
}