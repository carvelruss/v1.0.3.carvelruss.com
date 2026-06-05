import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import CTABanner from '../components/CTABanner';
import type { Post } from '../types';

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
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
  'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
  'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
  'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
];

// ── Icons ────────────────────────────────────────────────────────────────────
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

const HeroShareIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const ShareUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
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

// ── Blog post card ────────────────────────────────────────────────────────────
function BlogPostCard({ post, index }: { post: Post; index: number }) {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied]       = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const postUrl = `${window.location.origin}/blog/${post.slug}`;

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
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
      className="blog-post-card"
      onClick={() => navigate(`/blog/${post.slug}`)}
      aria-label={`Read: ${post.title}`}
    >
      {/* Thumbnail */}
      <div className="blog-post-card__img-wrap">
        {post.og_image
          ? <img src={post.og_image} alt={post.title} loading="lazy" />
          : <div className="blog-post-card__placeholder" style={{ background: COVER_GRADIENTS[index % COVER_GRADIENTS.length] }} />
        }

        {/* Share button + popover */}
        <div className="blog-post-card__share-wrap" ref={shareRef}>
          <button
            className="blog-post-card__share-btn"
            onClick={e => { e.stopPropagation(); setShareOpen(v => !v); }}
            aria-label="Share post"
            aria-expanded={shareOpen}
          >
            <ShareUpIcon />
          </button>

          {shareOpen && (
            <div className="blog-post-card__share-menu" role="menu" onClick={e => e.stopPropagation()}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-post-card__share-item"
                role="menuitem"
              >
                <FbIcon /> Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-post-card__share-item"
                role="menuitem"
              >
                <XIcon /> X (Twitter)
              </a>
              <button className="blog-post-card__share-item" role="menuitem" onClick={copyLink}>
                <LinkIcon /> {copied ? '✓ Copied!' : 'Copy link'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="blog-post-card__body">
        <div className="blog-post-card__meta">
          <span className="blog-post-card__cat">{getCategory(post)}</span>
          <time className="blog-post-card__date" dateTime={post.published_at ?? undefined}>
            {formatDate(post.published_at)}
          </time>
        </div>
        <h3 className="blog-post-card__title">{post.title}</h3>
        <hr className="blog-post-card__divider" />
        <div className="blog-post-card__author">
          <span className="blog-post-card__avatar" aria-hidden="true">{getInitials(post.author)}</span>
          <span className="blog-post-card__author-name">{post.author}</span>
        </div>
      </div>
    </article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts]           = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    document.title = 'Blog | devfolio';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Thoughts on UI/UX design, frontend development, and building great digital products.');
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
      {/* ── Blog hero ── */}
      <section className="blog-hero" aria-label="Blog featured posts">
        <div className="container-site blog-hero__inner">

          <div className="blog-hero__featured">
            <nav className="blog-hero__breadcrumb" aria-label="Breadcrumb">
              <button onClick={() => navigate('/')} aria-label="Home">
                <HomeIcon /> Home
              </button>
              <span className="blog-hero__breadcrumb-sep" aria-hidden="true">»</span>
              <span className="blog-hero__breadcrumb-current">Blog</span>
            </nav>

            {!loading && featured ? (
              <>
                <span className="blog-hero__badge">🔥 Hot Topic</span>
                <h2
                  className="blog-hero__title"
                  onClick={() => navigate(`/blog/${featured.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/blog/${featured.slug}`)}
                >
                  {featured.title}
                </h2>
                <div className="blog-hero__meta">
                  <span className="blog-hero__cat">{getCategory(featured)}</span>
                  {featured.published_at && (
                    <>
                      <span className="blog-hero__sep" aria-hidden="true" />
                      <span className="blog-hero__time">{timeAgo(featured.published_at)}</span>
                    </>
                  )}
                </div>
                <button className="blog-hero__read-btn" onClick={() => navigate(`/blog/${featured.slug}`)}>
                  Read article →
                </button>
              </>
            ) : !loading && (
              <>
                <h2 className="blog-hero__title" style={{ cursor: 'default' }}>
                  Thoughts on design &amp; frontend
                </h2>
                <p className="blog-hero__empty">
                  Posts on UI/UX, frontend engineering, and building digital products are on their way.
                </p>
              </>
            )}
          </div>

          <div className="blog-hero__divider" aria-hidden="true" />

          <div className="blog-hero__sidebar">
            {sidePosts.map(post => (
              <div
                key={post.slug}
                className="blog-hero__side-post"
                onClick={() => navigate(`/blog/${post.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/blog/${post.slug}`)}
                aria-label={`Read: ${post.title}`}
              >
                <div className="blog-hero__side-meta">
                  <span className="blog-hero__cat">{getCategory(post)}</span>
                  <span className="blog-hero__time">{timeAgo(post.published_at)}</span>
                </div>
                <p className="blog-hero__side-title">{post.title}</p>
                <div className="blog-hero__side-stats" aria-hidden="true">
                  <span className="blog-hero__stat"><ThumbIcon /> 0</span>
                  <span className="blog-hero__stat"><CommentIcon /> 0</span>
                  <span className="blog-hero__stat"><HeroShareIcon /> 0</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Latest Posts ── */}
      <section className="blog-latest" aria-label="Latest posts">
        <div className="container-site">
          <h2 className="blog-latest__heading">Latest Posts</h2>

          {!loading && (
            <div className="blog-latest__filters" role="tablist" aria-label="Filter by topic">
              <button
                role="tab"
                aria-selected={activeFilter === 'all'}
                className={`blog-latest__filter-btn${activeFilter === 'all' ? ' active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Topics
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeFilter === cat}
                  className={`blog-latest__filter-btn${activeFilter === cat ? ' active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <p style={{ color: '#65676b', textAlign: 'center', padding: '60px 0' }}>Loading posts…</p>
          )}

          {!loading && posts.length === 0 && (
            <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✍️</p>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#1c1e21' }}>No posts yet</p>
              <p style={{ color: '#65676b', margin: 0 }}>Check back soon — posts are on the way.</p>
            </div>
          )}

          <div className="blog-latest__list">
            {filteredPosts.map((post, i) => (
              <BlogPostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="container-site" style={{ paddingBottom: '3rem' }}>
        <CTABanner
          heading="Have a project in mind?"
          subtext="I'm available for new opportunities. Let's build something together."
          primaryLabel="Get in Touch"
          primaryHref="/#contact"
          secondaryLabel="View Case Studies"
          secondaryHref="/case-studies"
        />
      </div>
    </>
  );
}
