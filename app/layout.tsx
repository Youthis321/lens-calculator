export const metadata = {
    title: 'Kalkulator Token LENS',
    description: 'Simulasi token LENS: profit, strategi, dan auto exit plan',
    manifest: '/manifest.json'
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="id">
        <head>
          {/* PWA META */}
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <meta name="theme-color" content="#0d6efd" />
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
  