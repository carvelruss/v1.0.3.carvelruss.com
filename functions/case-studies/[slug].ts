/// <reference types="@cloudflare/workers-types" />

import { type Env } from '../_helpers';

interface ProjectRow {
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug    = params.slug as string;
  const url     = new URL(request.url);
  const htmlRes = await fetch(`${url.origin}/index.html`);
  let   html    = await htmlRes.text();

  try {
    const row = await env.DB
      .prepare(`SELECT title, slug, description, cover_url FROM projects WHERE slug = ? LIMIT 1`)
      .bind(slug)
      .first<ProjectRow>();

    if (row) {
      const title       = esc(row.title) + ' | Carvel Russ';
      const description = esc(row.description.slice(0, 160));
      const canonical   = `${url.origin}/case-studies/${slug}`;

      const rawImage = (row.cover_url ?? '').trim();
      const image    = rawImage
        ? rawImage.startsWith('http')
          ? rawImage
          : `${url.origin}${rawImage.startsWith('/') ? rawImage : '/' + rawImage}`
        : '';

      const tags = `
  <link rel="canonical" href="${canonical}" />
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${canonical}" />${image ? `
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ''}
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />${image ? `
  <meta name="twitter:image" content="${image}" />` : ''}`;

      html = html
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace('</head>', `${tags}\n</head>`);
    }
  } catch {
    // DB error — return plain SPA shell
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
