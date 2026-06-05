import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import CTABanner from '../components/CTABanner';
import type { Post } from '../types';

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

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <>
      {/* ── Page hero ── */}
      <section className="page-hero">
        <div className="container-site page-hero__inner">
          <div className="page-hero__content">
            <span className="page-hero__eyebrow">Writing</span>
            <h1 className="page-hero__heading">Blog</h1>
            <p className="page-hero__sub">
              Thoughts on UI/UX design, frontend engineering, and building digital products that people love.
            </p>
          </div>
        </div>
      </section>

      {/* ── Posts ── */}
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

                <span className="blog-card__readmore">
                  Read article →
                </span>
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
