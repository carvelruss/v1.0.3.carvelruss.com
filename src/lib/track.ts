const SESSION_KEY = '_sid';

export function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function trackPageView(path: string): void {
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      session_id: getSessionId(),
      referrer: document.referrer || null,
    }),
  }).catch(() => {});
}

export function trackEvent(eventType: string, label?: string | null, value?: number | null): void {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      label: label ?? null,
      path: window.location.pathname,
      session_id: getSessionId(),
      value: value ?? null,
    }),
  }).catch(() => {});
}
