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

  return (
    <div className="bs-sidebar-related">
      <p className="bs-sidebar-related__heading">Related articles</p>
      <div className="bs-related-list">
        {posts.slice(0, 3).map((post, i) => (
          <Link
            key={post.slug}
            to={`/blogs/${post.slug}`}
            className="bs-related-item"
            aria-label={post.title}
          >
            <div
              className="bs-related-item__img"
              style={
                post.og_image
                  ? { backgroundImage: `url(${post.og_image})` }
                  : { background: PLACEHOLDERS[i % PLACEHOLDERS.length] }
              }
              aria-hidden="true"
            />
            <div className="bs-related-item__body">
              <p className="bs-related-item__title">{post.title}</p>
              <p className="bs-related-item__meta">
                {(post.views_count ?? 0) > 0
                  ? `${post.views_count!.toLocaleString()} views · `
                  : ''}
                {formatDate(post.published_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
