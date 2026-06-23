import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiLinkedin, FiLink, FiCheck } from 'react-icons/fi';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { Post } from '../types';
import '../styles/blog-single.css';
import BlogAuthorBox from '../components/blog/BlogAuthorBox';
import RelatedArticles from '../components/blog/RelatedArticles';

function formatDate(d?: string | null) {
  return d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
}

export default function BlogSingle() {
  const { slug }     = useParams<{ slug: string }>();
  const navigate     = useNavigate();
  const [post, setPost]       = useState<Post | null>(null);
  const [html, setHtml]       = useState('');
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const sidebarRef    = useRef<HTMLElement>(null);
  const sidebarColRef = useRef<HTMLDivElement>(null);
  const mainRef       = useRef<HTMLElement>(null);
  const shareBarRef   = useRef<HTMLDivElement>(null);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Floating share bar (left of main content) ── */
  useEffect(() => {
    const bar  = shareBarRef.current;
    const main = mainRef.current;
    if (!bar || !main) return;

    const update = () => {
      const mainRect = main.getBoundingClientRect();
      const barW     = bar.offsetWidth;
      const barH     = bar.offsetHeight;
      const leftPos  = mainRect.left - barW - 20;

      if (leftPos < 8 || window.innerWidth <= 991) {
        bar.style.opacity   = '0';
        bar.style.pointerEvents = 'none';
        return;
      }

      // Hide when scrolled past article
      if (mainRect.bottom < 88 || mainRect.top > window.innerHeight) {
        bar.style.opacity   = '0';
        bar.style.pointerEvents = 'none';
        return;
      }

      bar.style.opacity   = '1';
      bar.style.pointerEvents = 'auto';
      bar.style.left = `${leftPos}px`;

      // Vertical: center in viewport, clamped within article
      const idealTop = window.innerHeight / 2 - barH / 2;
      const minTop   = 88;
      const maxTop   = mainRect.bottom + window.scrollY - barH - window.scrollY;
      bar.style.top  = `${Math.min(Math.max(idealTop, minTop), maxTop)}px`;
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [post]);

  /* ── JS sticky sidebar ── */
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const col     = sidebarColRef.current;
    if (!sidebar || !col) return;

    const OFFSET = 88; // fixed header height + gap

    const update = () => {
      if (window.innerWidth <= 991) {
        sidebar.style.transform = '';
        return;
      }
      const colRect  = col.getBoundingClientRect();
      const sidebarH = sidebar.offsetHeight;
      const maxTY    = col.offsetHeight - sidebarH;
      const ty       = Math.max(0, Math.min(OFFSET - colRect.top, maxTY));
      sidebar.style.transform = ty > 0 ? `translateY(${ty}px)` : '';
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [post]);

  useEffect(() => {
    if (!slug) return;

    const setMeta = (name: string, content: string, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(prop ? 'property' : 'name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    api.getPostBySlug(slug)
      .then(async p => {
        setPost(p);
        const raw = p.content ?? '';
        setHtml(raw.trim().startsWith('<') ? raw : renderMarkdown(raw));
        document.title = `${p.title} | Carvel Russ`;

        if (p.meta_description) setMeta('description', p.meta_description);
        if (p.keywords)         setMeta('keywords', p.keywords);
        setMeta('author', p.author);
        setMeta('og:type',  'article', true);
        setMeta('og:title', p.title,   true);
        if (p.meta_description) setMeta('og:description', p.meta_description, true);
        if (p.og_image)         setMeta('og:image', p.og_image, true);
        setMeta('og:url', window.location.href, true);
        setMeta('twitter:card',  'summary_large_image');
        setMeta('twitter:title', p.title);
        if (p.meta_description) setMeta('twitter:description', p.meta_description);
        if (p.og_image)         setMeta('twitter:image', p.og_image);

        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          document.head.appendChild(canonical);
        }
        canonical.href = window.location.href;

        document.getElementById('blog-ld')?.remove();
        const ld = document.createElement('script');
        ld.id   = 'blog-ld';
        ld.type = 'application/ld+json';
        ld.text = JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline:      p.title,
          description:   p.meta_description,
          author:        { '@type': 'Person', name: p.author },
          datePublished: p.published_at,
          dateModified:  p.updated_at,
          image:         p.og_image,
          url:           window.location.href,
        });
        document.head.appendChild(ld);

        try {
          const all = await api.getPosts(false);
          setRelated(all.filter(o => o.slug !== slug).slice(0, 3));
        } catch {
          /* related posts are optional */
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => { document.getElementById('blog-ld')?.remove(); };
  }, [slug]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="bs-loading" aria-live="polite">
        <span className="bs-loading__spinner" aria-hidden="true" />
      </div>
    );
  }

  /* ── 404 ── */
  if (notFound || !post) {
    return (
      <div className="bs-not-found">
        <p className="bs-not-found__code">404</p>
        <h1 className="bs-not-found__title">Post not found</h1>
        <p className="bs-not-found__body">This post doesn't exist or has been removed.</p>
        <button className="bs-not-found__btn" onClick={() => navigate('/blog')}>
          ← Back to Blog
        </button>
      </div>
    );
  }

  const tags = post.keywords
    ? post.keywords.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <article className="bs-page">
      <div className="bs-container">

        {/* ── Breadcrumb ── */}
        <nav className="bs-breadcrumb" aria-label="Breadcrumb">
          <Link to="/"     className="bs-bc-link">Home</Link>
          <span className="bs-bc-sep" aria-hidden="true">›</span>
          <Link to="/blog" className="bs-bc-link">Blog</Link>
          <span className="bs-bc-sep" aria-hidden="true">›</span>
          <span className="bs-bc-current" aria-current="page">{post.title}</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="bs-layout">

          {/* ────────── Main content ────────── */}
          <main className="bs-main" ref={mainRef}>

            {post.category && (
              <span className="bs-cat">{post.category}</span>
            )}

            <h1 className="bs-title">{post.title}</h1>

            <div className="bs-meta">
              <span className="bs-meta__author">{post.author}</span>
              {post.published_at && (
                <>
                  <span className="bs-meta__dot" aria-hidden="true">·</span>
                  <time className="bs-meta__date" dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                </>
              )}
              {post.reading_time && (
                <>
                  <span className="bs-meta__dot" aria-hidden="true">·</span>
                  <span className="bs-meta__read">{post.reading_time}</span>
                </>
              )}
            </div>

            {post.og_image && (
              <figure className="bs-feat-img">
                <img src={post.og_image} alt={post.title} loading="lazy" />
                {post.featured_image_caption && (
                  <figcaption className="bs-img-caption">
                    {post.featured_image_caption}
                  </figcaption>
                )}
              </figure>
            )}

            <div
              className="bs-prose"
              dangerouslySetInnerHTML={{ __html: html }}
              aria-label="Post content"
            />

            {/* Inline share – shown on mobile only */}
            <div className="bs-share bs-share--inline">
              <span className="bs-share__label">Share this post:</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on Facebook"><FiFacebook size={16} /></a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on X / Twitter"><FiTwitter size={16} /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on LinkedIn"><FiLinkedin size={16} /></a>
              <button type="button" className={`bs-share__btn${copied ? ' bs-share__btn--copied' : ''}`} onClick={copyLink} aria-label={copied ? 'Link copied!' : 'Copy link'}>{copied ? <FiCheck size={16} /> : <FiLink size={16} />}</button>
            </div>

            <RelatedArticles posts={related} />

          </main>

          {/* ────────── Sidebar ────────── */}
          <div className="bs-sidebar-col" ref={sidebarColRef}>
            <aside className="bs-sidebar" ref={sidebarRef} aria-label="Sidebar">
              <BlogAuthorBox
                author={post.author}
                avatar={post.author_avatar}
                bio={post.author_bio}
              />
              {tags.length > 0 && (
                <div className="bs-tags" aria-label="Post tags">
                  <span className="bs-tags__label">Tags:</span>
                  {tags.map(tag => (
                    <span key={tag} className="bs-tag">{tag}</span>
                  ))}
                </div>
              )}
            </aside>
          </div>

        </div>
      </div>

      {/* ── Floating share bar (desktop) ── */}
      <div className="bs-share-float" ref={shareBarRef} aria-label="Share this post">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on Facebook"><FiFacebook size={16} /></a>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on X / Twitter"><FiTwitter size={16} /></a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="bs-share__btn" aria-label="Share on LinkedIn"><FiLinkedin size={16} /></a>
        <button type="button" className={`bs-share__btn${copied ? ' bs-share__btn--copied' : ''}`} onClick={copyLink} aria-label={copied ? 'Link copied!' : 'Copy link'}>{copied ? <FiCheck size={16} /> : <FiLink size={16} />}</button>
      </div>

    </article>
  );
}
