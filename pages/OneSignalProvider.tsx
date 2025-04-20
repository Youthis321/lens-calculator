import { useEffect } from 'react';

const OneSignalProvider = () => {
  useEffect(() => {
    // Hanya aktif saat production dan bukan localhost
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'production' &&
      window.location.hostname !== 'localhost'
    ) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        const oneSignal = (window as any).OneSignal = (window as any).OneSignal || [];
        oneSignal.push(function () {
          oneSignal.init({
            appId: '9aea84cf-4a94-4823-a6a5-89f2f08cb29d',
            notifyButton: { enable: true },
          });
        });
      };      
    } else {
      console.log('[OneSignal] Tidak diaktifkan karena bukan production atau sedang di localhost.');
    }
  }, []);

  return null;
};

export default OneSignalProvider;
