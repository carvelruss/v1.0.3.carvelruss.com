/// <reference types="@cloudflare/workers-types" />

import { type Env } from './_helpers';

const BASE_URL = 'https://carvelruss.com';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const [postsResult, projectsResult] = await Promise.all([
      env.DB.prepare(
        `SELECT title, slug, excerpt FROM posts WHERE status='published' ORDER BY published_at DESC`
      ).all<{ title: string; slug: string; excerpt: string | null }>(),

      env.DB.prepare(
        `SELECT title, slug, excerpt FROM projects WHERE status='published' ORDER BY sort_order ASC, published_at DESC`
      ).all<{ title: string; slug: string; excerpt: string | null }>(),
    ]);

    const posts    = postsResult.results    ?? [];
    const projects = projectsResult.results ?? [];

    const lines: string[] = [
      '# Carvel Russ — UI/UX Developer Portfolio',
      '',
      '> Carvel Russ is a UI/UX developer who designs and builds clean, user-centered digital experiences. This site showcases case studies, technical blog posts, and services.',
      '',
      '## Main Pages',
      '',
      `- [Home](${BASE_URL}/): Portfolio overview, featured work, and skills summary.`,
      `- [Case Studies](${BASE_URL}/case-studies): Full list of UI/UX and development projects.`,
      `- [Blog](${BASE_URL}/blog): Articles on UI/UX design, frontend development, and web technology.`,
      `- [Skills](${BASE_URL}/skills): Technologies, tools, and areas of expertise.`,
      `- [Contact](${BASE_URL}/contact): Get in touch for project inquiries or collaborations.`,
    ];

    if (projects.length > 0) {
      lines.push('', '## Case Studies', '');
      for (const p of projects) {
        const desc = p.excerpt ? `: ${p.excerpt}` : '';
        lines.push(`- [${p.title}](${BASE_URL}/case-studies/${p.slug})${desc}`);
      }
    }

    if (posts.length > 0) {
      lines.push('', '## Blog Posts', '');
      for (const p of posts) {
        const desc = p.excerpt ? `: ${p.excerpt}` : '';
        lines.push(`- [${p.title}](${BASE_URL}/blog/${p.slug})${desc}`);
      }
    }

    return new Response(lines.join('\n') + '\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('# Carvel Russ\n\n> UI/UX Developer Portfolio\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
};
