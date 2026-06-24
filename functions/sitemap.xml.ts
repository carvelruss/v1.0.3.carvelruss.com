/// <reference types="@cloudflare/workers-types" />

import { type Env } from './_helpers';

const BASE_URL = 'https://carvelruss.com';

const STATIC_PAGES = [
  { loc: '/',              changefreq: 'weekly',  priority: '1.0' },
  { loc: '/case-studies',  changefreq: 'weekly',  priority: '0.8' },
  { loc: '/blog',          changefreq: 'daily',   priority: '0.8' },
  { loc: '/skills',        changefreq: 'monthly', priority: '0.6' },
  { loc: '/contact',       changefreq: 'monthly', priority: '0.6' },
];

function urlEntry(loc: string, lastmod?: string | null, changefreq?: string, priority?: string): string {
  return [
    '  <url>',
    `    <loc>${BASE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ].filter(Boolean).join('\n');
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const [postsResult, projectsResult] = await Promise.all([
      env.DB.prepare(
        `SELECT slug, updated_at, published_at FROM posts WHERE status='published' ORDER BY published_at DESC`
      ).all<{ slug: string; updated_at: string; published_at: string | null }>(),

      env.DB.prepare(
        `SELECT slug, updated_at, published_at FROM projects WHERE status='published' ORDER BY published_at DESC`
      ).all<{ slug: string; updated_at: string; published_at: string | null }>(),
    ]);

    const today = new Date().toISOString().slice(0, 10);

    const entries: string[] = [
      // Static pages
      ...STATIC_PAGES.map(p => urlEntry(p.loc, today, p.changefreq, p.priority)),

      // Blog posts
      ...(postsResult.results ?? []).map(p =>
        urlEntry(`/blog/${p.slug}`, p.updated_at ?? p.published_at, 'weekly', '0.7')
      ),

      // Case studies
      ...(projectsResult.results ?? []).map(p =>
        urlEntry(`/case-studies/${p.slug}`, p.updated_at ?? p.published_at, 'monthly', '0.7')
      ),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      '</urlset>',
    ].join('\n');

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
};
