import { useState, useEffect } from 'react';
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

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

// Home icon SVG
const HomeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog | devfolio';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Thoughts on UI/UX design, frontend development, and building great digital products.');
    api.getPosts(false).then(setPosts).catch(() => []).finally(() => setLoading(false));
  }, []);

  const featured  = posts[0] ?? null;
  const sidePosts = posts.slice(1, 3);

  return (
    <>
      {/* ── Blog hero ── */}
      <section className="blog-hero" aria-label="Blog featured posts">
        <div className="container-site blog-hero__inner">

          {/* Left: featured post */}
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
                <button
                  className="blog-hero__read-btn"
                  onClick={() => navigate(`/blog/${featured.slug}`)}
                >
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

          {/* Vertical divider */}
          <div className="blog-hero__divider" aria-hidden="true" />

          {/* Right: sidebar posts */}
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
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Posts list ── */}
      <div className="container-site" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <article
              key={post.slug}
              className="blog-card card"
              onClick={() => navigate(`/blog/${post.slug}`)}
              style={{ cursor: 'pointer' }}
              aria-label={`Read: ${post.title}`}
            >
              <div className="blog-card__inner">
                <div className="blog-card__meta">
                  {post.published_at && (
                    <time dateTime={post.published_at} className="blog-card__date">
                      {formatDate(post.published_at)}
                    </time>
                  )}
                  <span className="blog-card__author">By {post.author}</span>
                </div>

                <h2 className="blog-card__title">{post.title}</h2>

                {post.excerpt && (
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                )}

                <span className="blog-card__readmore">Read article →</span>
              </div>
            </article>
          ))}
        </div>
      </div>

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
