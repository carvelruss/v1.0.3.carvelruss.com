/// <reference types="@cloudflare/workers-types" />

import { type Env, json, err, isAdmin } from '../_helpers';

interface GscRow {
  query?:      string;
  page?:       string;
  clicks:      number;
  impressions: number;
  ctr:         number;
  position:    number;
}
interface IndexingRow {
  url:        string;
  verdict:    string;
  lastCrawl?: string;
}

// ── Service-account JWT auth ──────────────────────────────────────────────────

function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  const sa   = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key:  string;
  };
  const now  = Math.floor(Date.now() / 1000);
  const hdr  = { alg: 'RS256', typ: 'JWT' };
  const pay  = {
    iss:   sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters',
    aud:   'https://oauth2.googleapis.com/token',
    exp:   now + 3600,
    iat:   now,
  };

  const sigInput  = `${b64url(hdr)}.${b64url(pay)}`;
  const keyPem    = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const keyBuffer = Uint8Array.from(atob(keyPem), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(sigInput),
  );

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const jwt = `${sigInput}.${sigB64}`;

  const tokenRes  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }),
  });
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };
  if (!tokenData.access_token) {
    throw new Error(tokenData.error_description ?? tokenData.error ?? 'Token exchange failed');
  }
  return tokenData.access_token;
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ── Key pages to inspect for indexing status ─────────────────────────────────

const KEY_PATHS = ['/', '/case-studies', '/skills', '/blog', '/contact'];

// GET /api/gsc?days=30 — admin only
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAdmin(request, env))) return err('Unauthorized', 401);

  const gscSa      = (env as unknown as Record<string, string | undefined>).GSC_SERVICE_ACCOUNT;
  const gscSiteUrl = (env as unknown as Record<string, string | undefined>).GSC_SITE_URL;

  if (!gscSa || !gscSiteUrl) {
    return json({ configured: false });
  }

  const url   = new URL(request.url);
  const days  = Math.min(parseInt(url.searchParams.get('days') ?? '28', 10) || 28, 90);
  // GSC data is typically 3–4 days behind
  const start = daysAgo(days + 4);
  const end   = daysAgo(4);

  try {
    const token = await getAccessToken(gscSa);
    const auth  = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const siteEnc = encodeURIComponent(gscSiteUrl);
    const baseUrl = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteEnc}/searchAnalytics/query`;

    const [totalsRes, kwRes, pgRes] = await Promise.all([
      fetch(baseUrl, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ startDate: start, endDate: end, rowLimit: 1 }),
      }),
      fetch(baseUrl, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          startDate:  start,
          endDate:    end,
          dimensions: ['query'],
          rowLimit:   25,
        }),
      }),
      fetch(baseUrl, {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({
          startDate:  start,
          endDate:    end,
          dimensions: ['page'],
          rowLimit:   10,
        }),
      }),
    ]);

    if (!kwRes.ok) {
      const errBody = await kwRes.text();
      return json({ configured: true, error: `GSC API error (${kwRes.status}): ${errBody.slice(0, 200)}` });
    }

    type GscApiRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };
    const totalsData = await totalsRes.json() as { rows?: GscApiRow[] };
    const kwData     = await kwRes.json()     as { rows?: GscApiRow[] };
    const pgData     = await pgRes.json()     as { rows?: GscApiRow[] };

    const t = totalsData.rows?.[0];
    const totals = {
      clicks:      t?.clicks      ?? 0,
      impressions: t?.impressions ?? 0,
      ctr:         t?.ctr         ?? 0,
      position:    t?.position    ?? 0,
    };

    const keywords: GscRow[] = (kwData.rows ?? []).map(r => ({
      query:       r.keys?.[0],
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         r.ctr,
      position:    r.position,
    }));

    const topPages: GscRow[] = (pgData.rows ?? []).map(r => ({
      page:        r.keys?.[0],
      clicks:      r.clicks,
      impressions: r.impressions,
      ctr:         r.ctr,
      position:    r.position,
    }));

    // URL inspection — parallel checks on key pages
    const origin       = gscSiteUrl.replace(/\/$/, '');
    const inspectUrl   = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
    const inspections  = await Promise.all(
      KEY_PATHS.map(async (path): Promise<IndexingRow> => {
        const fullUrl = `${origin}${path}`;
        try {
          const res  = await fetch(inspectUrl, {
            method:  'POST',
            headers: auth,
            body:    JSON.stringify({ inspectionUrl: fullUrl, siteUrl: gscSiteUrl }),
          });
          if (!res.ok) return { url: fullUrl, verdict: 'UNKNOWN' };
          const body = await res.json() as {
            inspectionResult?: {
              indexStatusResult?: {
                verdict:       string;
                lastCrawlTime?: string;
              };
            };
          };
          const r = body.inspectionResult?.indexStatusResult;
          return {
            url:       fullUrl,
            verdict:   r?.verdict    ?? 'UNKNOWN',
            lastCrawl: r?.lastCrawlTime ?? undefined,
          };
        } catch {
          return { url: fullUrl, verdict: 'UNKNOWN' };
        }
      }),
    );

    return json({ configured: true, totals, keywords, topPages, indexing: inspections });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return json({ configured: true, error: msg });
  }
};
