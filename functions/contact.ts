/// <reference types="@cloudflare/workers-types" />

const TITLE       = 'Contact | Carvel Russ';
const DESCRIPTION = 'Get in touch with Carvel Russ for UI/UX design, web development, or digital product collaboration and project inquiries.';
const PATH        = '/contact';

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url     = new URL(request.url);
  const htmlRes = await fetch(`${url.origin}/index.html`);
  let   html    = await htmlRes.text();

  const canonical = `${url.origin}${PATH}`;

  const tags = `
  <link rel="canonical" href="${canonical}" />
  <meta name="description" content="${DESCRIPTION}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:url" content="${canonical}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />`;

  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
    .replace('</head>', `${tags}\n</head>`);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
};
