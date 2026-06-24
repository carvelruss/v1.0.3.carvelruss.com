import { onLCP, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';
import { getSessionId } from './track';

export function initVitals(): void {
  const report = (name: string, value: number, rating: string) => {
    fetch('/api/analytics/cwv', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        metric:     name,
        value,
        rating,
        path:       window.location.pathname,
        session_id: getSessionId(),
      }),
    }).catch(() => {});
  };

  onLCP(m  => report(m.name, m.value, m.rating));
  onCLS(m  => report(m.name, m.value, m.rating));
  onINP(m  => report(m.name, m.value, m.rating));
  onFCP(m  => report(m.name, m.value, m.rating));
  onTTFB(m => report(m.name, m.value, m.rating));
}
