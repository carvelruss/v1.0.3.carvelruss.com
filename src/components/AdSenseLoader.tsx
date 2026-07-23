import { useEffect } from 'react';

const CLIENT_ID = 'ca-pub-5011507295212266';
const SCRIPT_ID = 'adsense-script';

export default function AdSenseLoader() {
  useEffect(() => {
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
