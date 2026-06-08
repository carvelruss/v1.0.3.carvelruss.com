import { Link } from 'react-router-dom';
import type { Post } from '../../types';

interface Props {
  posts: Post[];
}

const PLACEHOLDERS = [
  'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
  'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
];

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export default function RelatedArticles({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="bs-related" aria-label="Related articles">
      <div className="container">
        <h2 className="bs-related__heading">Related Articles</h2>
        <div className="row g-4">
          {posts.slice(0, 4).map((post, i) => (
            <div key={post.slug} className="col-sm-6 col-lg-3">
              <Link to={`/blog/${post.slug}`} className="bs-related-card">
                <div className="bs-related-card__img">
                  {post.og_image ? (
                    <img src={post.og_image} alt={post.title} loading="lazy" />
                  ) : (
                    <div
                      className="bs-related-card__placeholder"
                      style={{ background: PLACEHOLDERS[i % PLACEHOLDERS.length] }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="bs-related-card__body">
                  {post.category && (
                    <span className="bs-related-card__cat">{post.category}</span>
                  )}
                  <p className="bs-related-card__title">{post.title}</p>
                  {post.published_at && (
                    <p style={{ fontSize: '.775rem', color: 'var(--ws-body)', marginTop: '.5rem', marginBottom: 0 }}>
                      {formatDate(post.published_at)}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
