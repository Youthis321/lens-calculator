import Link from 'next/link';
import { useRouter } from 'next/router';

interface BottomNavbarProps {
  theme: 'light' | 'dark';
  hideNavbar: boolean;
}

export const BottomNavbar = ({ theme, hideNavbar }: BottomNavbarProps) => {
  const router = useRouter();

  return (
    <nav
      className={`navbar fixed-bottom d-lg-none ${
        theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
      } border-top py-2${hideNavbar ? ' d-none' : ''}`}
    >
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
  );
};