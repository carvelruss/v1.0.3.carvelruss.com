import { Link } from 'react-router-dom';
import type { Post } from '../../types';

interface Props {
  posts: Post[];
}

const PLACEHOLDERS = [
  'linear-gradient(135deg, #1a4a9e 0%, #0D215A 100%)',
  'linear-gradient(135deg, #0D215A 0%, #071440 100%)',
  'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
];

function formatDate(d?: string | null) {
  return d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
}

export default function RelatedArticles({ posts }: Props) {
  if (posts.length === 0) return null;

  const visible = posts.slice(0, 3);

  return (
    <section className="bs-rj" aria-label="Related articles">

      {/* Header row */}
      <div className="bs-rj__header">
        <h2 className="bs-rj__heading">Latest from the journal</h2>
        <span className="bs-rj__count">
          {visible.length} {visible.length === 1 ? 'story' : 'stories'} published
        </span>
      </div>

      {/* Cards grid */}
      <div className="bs-rj__grid">
        {visible.map((post, i) => (
          <Link
            key={post.slug}
            to={`/blogs/${post.slug}`}
            className="bs-rj-card"
            aria-label={post.title}
          >
            {/* Background image */}
            {post.og_image ? (
              <img
                src={post.og_image}
                alt=""
                className="bs-rj-card__img"
                loading="lazy"
              />
            ) : (
              <div
                className="bs-rj-card__img bs-rj-card__img--placeholder"
                style={{ background: PLACEHOLDERS[i % PLACEHOLDERS.length] }}
                aria-hidden="true"
              />
            )}

            {/* Dark gradient overlay */}
            <div className="bs-rj-card__overlay" aria-hidden="true" />

            {/* Category badge */}
            {post.category && (
              <span className="bs-rj-card__badge">{post.category}</span>
            )}

            {/* Bottom text */}
            <div className="bs-rj-card__body">
              <p className="bs-rj-card__title">{post.title}</p>
              <p className="bs-rj-card__meta">
                {post.author}
                {post.published_at && (
                  <> · <time dateTime={post.published_at}>{formatDate(post.published_at)}</time></>
                )}
                {post.reading_time && <> · {post.reading_time}</>}
              </p>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
