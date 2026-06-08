import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import CTABanner from '../components/CTABanner';
import type { Post } from '../types';

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return `${Math.max(1, Math.floor(hours))} hours ago`;
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)} day${Math.floor(days) > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategory(post: Post): string {
  if (post.keywords) {
    const first = post.keywords.split(',')[0].trim();
    if (first) return first;
  }
  return 'Article';
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase();
}

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #eef2ff 0%, #c7d2fe 100%)',
  'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
  'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
];

// ── Icons ──────────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ThumbIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);
const CommentIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const ShareUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5"/>
  </svg>
);
const FbIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

// ── Blog card ──────────────────────────────────────────────────────────────────
function BlogPostCard({ post, index }: { post: Post; index: number }) {
  const navigate    = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied,    setCopied]    = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const postUrl  = `${window.location.origin}/blog/${post.slug}`;

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [shareOpen]);

  const copyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  return (
    <article
      className="ws-blog-card"
      onClick={() => navigate(`/blog/${post.slug}`)}
      aria-label={`Read: ${post.title}`}
    >
      <div className="ws-blog-card__img">
        <div className="ws-blog-card__img-inner" style={{ position: 'relative', height: '100%' }}>
          {post.og_image
            ? <img src={post.og_image} alt={post.title} loading="lazy" />
            : <div className="ws-blog-card__placeholder" style={{ background: COVER_GRADIENTS[index % COVER_GRADIENTS.length] }} />
          }
          <div className="ws-blog-card__share-wrap" ref={shareRef}>
            <button
              className="ws-blog-card__share-btn"
              onClick={e => { e.stopPropagation(); setShareOpen(v => !v); }}
              aria-label="Share post"
              aria-expanded={shareOpen}
            >
              <ShareUpIcon />
            </button>
            {shareOpen && (
              <div className="ws-blog-card__share-menu" role="menu" onClick={e => e.stopPropagation()}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`} target="_blank" rel="noopener noreferrer" className="ws-blog-card__share-item" role="menuitem">
                  <FbIcon /> Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="ws-blog-card__share-item" role="menuitem">
                  <XIcon /> X (Twitter)
                </a>
                <button className="ws-blog-card__share-item" role="menuitem" onClick={copyLink}>
                  <LinkIcon /> {copied ? '✓ Copied!' : 'Copy link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ws-blog-card__body">
        <div className="ws-blog-card__meta">
          <span className="ws-blog-card__cat">{getCategory(post)}</span>
          <time className="ws-blog-card__date" dateTime={post.published_at ?? undefined}>
            {formatDate(post.published_at)}
          </time>
        </div>
        <h3 className="ws-blog-card__title">{post.title}</h3>
        <hr className="ws-blog-card__divider" />
        <div className="ws-blog-card__author">
          <span className="ws-blog-card__avatar" aria-hidden="true">{getInitials(post.author)}</span>
          <span className="ws-blog-card__author-name">{post.author}</span>
        </div>
      </div>
    </article>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BlogList() {
  const navigate = useNavigate();
  const [posts,        setPosts]        = useState<Post[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    document.title = 'Blog | webstudio';
    api.getPosts(false).then(setPosts).catch(() => []).finally(() => setLoading(false));
  }, []);

  const featured  = posts[0] ?? null;
  const sidePosts = posts.slice(1, 3);

  const categories = Array.from(new Set(
    posts.flatMap(p =>
      p.keywords ? p.keywords.split(',').map(k => k.trim()).filter(Boolean) : []
    )
  ));

  const filteredPosts = activeFilter === 'all'
    ? posts
    : posts.filter(p => p.keywords?.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <>
      {/* Blog hero */}
      <section className="ws-blog-hero" aria-label="Blog featured posts">
        <div className="container">
          <div className="d-flex align-items-start" style={{ gap: '0' }}>

            {/* Featured */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <nav className="ws-blog-breadcrumb" aria-label="Breadcrumb">
                <button onClick={() => navigate('/')} aria-label="Home">
                  <HomeIcon /> Home
                </button>
                <span className="ws-blog-breadcrumb__sep" aria-hidden="true">»</span>
                <span className="ws-blog-breadcrumb__current">Blog</span>
              </nav>

              {!loading && featured ? (
                <>
                  <div className="ws-blog-hero__badge">🔥 Hot Topic</div>
                  <h2
                    className="ws-blog-hero__title"
                    onClick={() => navigate(`/blog/${featured.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/blog/${featured.slug}`)}
                  >
                    {featured.title}
                  </h2>
                  <div className="d-flex align-items-center gap-2">
                    <span className="ws-blog-hero__cat">{getCategory(featured)}</span>
                    {featured.published_at && (
                      <span className="ws-blog-hero__time">{timeAgo(featured.published_at)}</span>
                    )}
                  </div>
                  <button className="ws-blog-hero__read-btn" onClick={() => navigate(`/blog/${featured.slug}`)}>
                    Read article →
                  </button>
                </>
              ) : !loading && (
                <>
                  <h2 className="ws-blog-hero__title" style={{ cursor: 'default' }}>
                    Thoughts on design &amp; frontend
                  </h2>
                  <p style={{ color: 'var(--ws-body)' }}>
                    Posts on UI/UX, frontend engineering, and building digital products are on their way.
                  </p>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="ws-blog-hero__divider d-none d-lg-block" aria-hidden="true" />

            {/* Sidebar */}
            <div className="d-none d-lg-block" style={{ flex: '0 0 320px', minWidth: 0 }}>
              {sidePosts.map(post => (
                <div
                  key={post.slug}
                  className="ws-blog-hero__side-post"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/blog/${post.slug}`)}
                  aria-label={`Read: ${post.title}`}
                >
                  <div className="ws-blog-hero__side-meta">
                    <span className="ws-blog-hero__cat">{getCategory(post)}</span>
                    <span className="ws-blog-hero__time">{timeAgo(post.published_at)}</span>
                  </div>
                  <p className="ws-blog-hero__side-title">{post.title}</p>
                  <div className="ws-blog-hero__side-stats" aria-hidden="true">
                    <span className="ws-blog-hero__side-stat"><ThumbIcon /> 0</span>
                    <span className="ws-blog-hero__side-stat"><CommentIcon /> 0</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="ws-section" aria-label="Latest posts">
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Latest Posts</h2>

          {!loading && (
            <div className="ws-filter-bar" role="tablist" aria-label="Filter by topic">
              <button
                role="tab"
                aria-selected={activeFilter === 'all'}
                className={`ws-filter-btn${activeFilter === 'all' ? ' ws-active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`ws-filter-btn${activeFilter === cat ? ' ws-active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading && <div className="ws-loading-state">Loading posts…</div>}

          {!loading && posts.length === 0 && (
            <div className="ws-empty-state">
              <p style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✍️</p>
              <p style={{ fontWeight: 600, marginBottom: '.25rem', color: 'var(--ws-navy)' }}>No posts yet</p>
              <p style={{ margin: 0 }}>Check back soon — posts are on the way.</p>
            </div>
          )}

          {!loading && filteredPosts.length > 0 && (
            <div className="row g-4">
              {filteredPosts.map((post, i) => (
                <div key={post.slug} className="col-sm-6 col-lg-4">
                  <BlogPostCard post={post} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <CTABanner
          heading="Have a project in mind?"
          subtext="I'm available for new opportunities. Let's build something together."
          primaryLabel="Get in Touch"
          primaryHref="/contact"
          secondaryLabel="View Case Studies"
          secondaryHref="/case-studies"
        />
      </div>
    </>
  );
}
