import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiLinkedin, FiLink, FiCheck,
  FiCalendar, FiClock, FiShare2,
} from 'react-icons/fi';
import { api } from '../lib/api';
import { renderMarkdown } from '../lib/markdown';
import type { Post } from '../types';
import '../styles/blog-single.css';
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
  const [post, setPost]             = useState<Post | null>(null);
  const [html, setHtml]             = useState('');
  const [related, setRelated]       = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [copied, setCopied]         = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  const articleRef = useRef<HTMLElement>(null);

  /* ── Sync real header height → --site-header-height on :root ── */
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.sh');
    if (!header) return;

    const update = () =>
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${header.offsetHeight}px`
      );

    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  /* ── Reading progress ── */
  useEffect(() => {
    const update = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrolled = Math.max(0, -top);
      const total    = height - window.innerHeight;
      setReadProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [post]);

  /* ── Share handler ── */
  const handleShare = useCallback(async (platform: string) => {
    const url   = window.location.href;
    const title = post?.title ?? '';
    if (platform === 'native') {
      if (navigator.share) {
        try { await navigator.share({ title, url }); } catch { /* user cancelled */ }
      }
      return;
    }
    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    const intents: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (intents[platform]) window.open(intents[platform], '_blank', 'noopener,noreferrer');
  }, [post]);

  /* ── Data fetch + SEO ── */
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
        } catch { /* related posts are optional */ }
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

  const tags     = post.keywords?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
  const initials = post.author.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase();
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <>
      {/* Reading progress bar — fixed at top of viewport */}
      <div
        className="bs-read-progress"
        style={{ transform: `scaleX(${readProgress / 100})` }}
        aria-hidden="true"
      />

      <article className="bs-page" ref={articleRef}>
        <div className="bs-container">

          {/* ── Breadcrumb ── */}
          <nav className="bs-breadcrumb" aria-label="Breadcrumb">
            <Link to="/" className="bs-bc-link">Home</Link>
            <span className="bs-bc-sep" aria-hidden="true">›</span>
            <Link to="/blog" className="bs-bc-link">Blog</Link>
            <span className="bs-bc-sep" aria-hidden="true">›</span>
            <span className="bs-bc-current" aria-current="page">{post.title}</span>
          </nav>

          {/* ── Post header: category + title + meta (above the hero image) ── */}
          <header className="bs-post-header">
            {post.category && (
              <span className="bs-cat">{post.category}</span>
            )}
            <h1 className="bs-title">{post.title}</h1>
            <ul className="bs-meta" role="list">
              {post.published_at && (
                <li className="bs-meta__item">
                  <FiCalendar size={13} aria-hidden="true" />
                  <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </li>
              )}
              {post.reading_time && (
                <>
                  <li className="bs-meta__div" aria-hidden="true" />
                  <li className="bs-meta__item">
                    <FiClock size={13} aria-hidden="true" />
                    <span>{post.reading_time}</span>
                  </li>
                </>
              )}
            </ul>
          </header>

          {/* ── Hero image — full container width ── */}
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

          {/* ── Article shell: sidebar (left) + article content (right) ── */}
          <div className="bs-article-shell">

            {/* Sticky share sidebar — visibility handled by CSS, no Bootstrap utilities */}
            <div className="bs-share-wrapper">
            <aside
              className="bs-share-sidebar"
              aria-label="Share this post"
            >
              <button
                type="button"
                className="bs-share-btn"
                onClick={() => handleShare('facebook')}
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <FiFacebook size={15} />
              </button>

              <button
                type="button"
                className="bs-share-btn"
                onClick={() => handleShare('twitter')}
                aria-label="Share on X / Twitter"
                title="Share on X / Twitter"
              >
                <FiTwitter size={15} />
              </button>

              <button
                type="button"
                className="bs-share-btn"
                onClick={() => handleShare('linkedin')}
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <FiLinkedin size={15} />
              </button>

              <button
                type="button"
                className={`bs-share-btn${copied ? ' bs-share-btn--copied' : ''}`}
                onClick={() => handleShare('copy')}
                aria-label={copied ? 'Link copied!' : 'Copy link'}
                title={copied ? 'Link copied!' : 'Copy link'}
              >
                {copied ? <FiCheck size={15} /> : <FiLink size={15} />}
              </button>
            </aside>
            </div>

            {/* ── Article content column ── */}
            <main className="bs-article-content">

              {/* Author byline — inline, below hero */}
              <div className="bs-byline">
                {post.author_avatar ? (
                  <img
                    src={post.author_avatar}
                    alt={post.author}
                    className="bs-byline__avatar"
                    width={44}
                    height={44}
                  />
                ) : (
                  <div className="bs-byline__initials" aria-hidden="true">
                    {initials}
                  </div>
                )}
                <div className="bs-byline__info">
                  <span className="bs-byline__name">{post.author}</span>
                  {post.author_bio && (
                    <span className="bs-byline__role">
                      {post.author_bio.split('.')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Prose content */}
              <div
                className="bs-prose"
                dangerouslySetInnerHTML={{ __html: html }}
                aria-label="Post content"
              />

              {/* Inline share row — shown on mobile only (< lg) */}
              <div className="bs-share-inline">
                <span className="bs-share-inline__label">Share this post:</span>
                <div className="bs-share-inline__btns">
                  {canShare && (
                    <button type="button" className="bs-share-btn" onClick={() => handleShare('native')} aria-label="Share">
                      <FiShare2 size={15} />
                    </button>
                  )}
                  <button type="button" className="bs-share-btn" onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                    <FiFacebook size={15} />
                  </button>
                  <button type="button" className="bs-share-btn" onClick={() => handleShare('twitter')} aria-label="Share on X">
                    <FiTwitter size={15} />
                  </button>
                  <button type="button" className="bs-share-btn" onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
                    <FiLinkedin size={15} />
                  </button>
                  <button
                    type="button"
                    className={`bs-share-btn${copied ? ' bs-share-btn--copied' : ''}`}
                    onClick={() => handleShare('copy')}
                    aria-label={copied ? 'Link copied!' : 'Copy link'}
                  >
                    {copied ? <FiCheck size={15} /> : <FiLink size={15} />}
                  </button>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="bs-tags" aria-label="Post tags">
                  <span className="bs-tags__label">Tags:</span>
                  {tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="bs-tag"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author bio card */}
              {(post.author_bio || post.author_avatar) && (
                <div className="bs-author-bio">
                  <div className="bs-author-bio__header">
                    {post.author_avatar ? (
                      <img
                        src={post.author_avatar}
                        alt={post.author}
                        className="bs-author-bio__avatar"
                        width={72}
                        height={72}
                      />
                    ) : (
                      <div className="bs-author-bio__initials" aria-hidden="true">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="bs-author-bio__label">Written by</p>
                      <h6 className="bs-author-bio__name">{post.author}</h6>
                    </div>
                  </div>
                  {post.author_bio && (
                    <p className="bs-author-bio__text">{post.author_bio}</p>
                  )}
                  <Link to="/blog" className="bs-author-bio__link">
                    Browse all articles →
                  </Link>
                </div>
              )}

            </main>
          </div>

          {/* Related posts — full container width (1400px) */}
          <RelatedArticles posts={related} />

        </div>
      </article>
    </>
  );
}
