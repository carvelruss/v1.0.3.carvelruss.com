import { useEffect } from 'react';

const CLIENT_ID = 'ca-pub-5011507295212266';
const SCRIPT_ID = 'adsense-script';
const META_NAME = 'google-adsense-account';

export default function AdSenseLoader() {
  useEffect(() => {
    // Ensure the AdSense account meta tag is present
    if (!document.querySelector(`meta[name="${META_NAME}"]`)) {
      const meta = document.createElement('meta');
      meta.name = META_NAME;
      meta.content = CLIENT_ID;
      document.head.appendChild(meta);
    }

    // Inject the auto-ads script once per session
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  return null;
}
