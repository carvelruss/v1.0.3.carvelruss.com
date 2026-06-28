/// <reference types="@cloudflare/workers-types" />

import { type Env } from '../_helpers';

interface PostRow {
  title: string;
  slug: string;
  excerpt: string | null;
  meta_description: string | null;
  og_image: string | null;
  author: string;
  published_at: string | null;
  status: 'draft' | 'published';
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = params.slug as string;

  // Fetch the SPA shell
  const url = new URL(request.url);
  const htmlRes = await fetch(`${url.origin}/index.html`);
  let html = await htmlRes.text();

  try {
    const row = await env.DB
      .prepare(`SELECT title, slug, excerpt, meta_description, og_image, author, published_at, status
                FROM posts WHERE slug = ? AND status = 'published' LIMIT 1`)
      .bind(slug)
      .first<PostRow>();

    if (row) {
      const title       = esc(row.title) + ' | Carvel Russ';
      const description = esc(row.meta_description ?? row.excerpt ?? '');
      const pageUrl     = `${url.origin}/blogs/${slug}`;

      const rawImage = (row.og_image ?? '').trim();
      const image = rawImage
        ? rawImage.startsWith('http')
          ? rawImage
          : `${url.origin}${rawImage.startsWith('/') ? rawImage : '/' + rawImage}`
        : '';

      const ogTags = `
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${pageUrl}" />${image ? `
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />${image ? `
  <meta name="twitter:image" content="${image}" />` : ''}`;

      // Replace generic title + inject OG tags before </head>
      html = html
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace('</head>', `${ogTags}\n</head>`);
    }
  } catch {
    // DB error — return plain SPA shell; client JS will handle it
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
