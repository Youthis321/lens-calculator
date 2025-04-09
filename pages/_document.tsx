import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#0d6efd" />

        {/* ✅ OneSignal Web Push SDK */}
        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.OneSignal = window.OneSignal || [];
              OneSignal.push(function() {
                OneSignal.init({
                  appId: "9aea84cf-4a94-4823-a6a5-89f2f08cb29d",
                  notifyButton: {
                    enable: true,
                  },
                  allowLocalhostAsSecureOrigin: true
                });
              });
            `
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
