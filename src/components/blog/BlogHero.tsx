import { Link } from 'react-router-dom';
import { FiEye, FiCalendar, FiClock } from 'react-icons/fi';
import type { Post } from '../../types';

interface Props {
  post: Post;
}

function formatDate(d?: string | null) {
  return d
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
}

export default function BlogHero({ post }: Props) {
  return (
    <header className="bs-hero">
      <div className="bs-container">
        <nav className="bs-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="bs-breadcrumb__item">Home</Link>
          <span className="bs-breadcrumb__sep" aria-hidden="true">›</span>
          <Link to="/blog" className="bs-breadcrumb__item">Blog</Link>
          <span className="bs-breadcrumb__sep" aria-hidden="true">›</span>
          <span className="bs-breadcrumb__item bs-breadcrumb__item--current" aria-current="page">
            {post.title}
          </span>
        </nav>

        {post.category && <span className="bs-cat">{post.category}</span>}

        <h1 className="bs-title">{post.title}</h1>

        {post.excerpt && <p className="bs-excerpt">{post.excerpt}</p>}

        <div className="bs-meta">
          {(post.views_count ?? 0) > 0 && (
            <span className="bs-meta-item">
              <FiEye size={14} aria-hidden="true" />
              {post.views_count?.toLocaleString()} views
            </span>
          )}
          {post.published_at && (
            <span className="bs-meta-item">
              <FiCalendar size={14} aria-hidden="true" />
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
            </span>
          )}
          {post.reading_time && (
            <span className="bs-meta-item">
              <FiClock size={14} aria-hidden="true" />
              {post.reading_time}
            </span>
          )}
          <span className="bs-meta-item">
            By <strong style={{ marginLeft: '.25rem' }}>{post.author}</strong>
          </span>
        </div>
      </div>
    </header>
  );
}
