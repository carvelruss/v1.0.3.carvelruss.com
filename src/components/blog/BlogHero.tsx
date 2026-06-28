import { FiCalendar, FiClock } from 'react-icons/fi';
import type { Post } from '../../types';

function formatDate(d?: string | null) {
  return d
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' })
    : '';
}

export default function BlogHero({ post }: { post: Post }) {
  return (
    <div className="bs-container">
      <nav className="bs-breadcrumb" aria-label="Breadcrumb">
        <span className="bs-bc-link">Home</span>
        <span className="bs-bc-sep" aria-hidden="true">›</span>
        <span className="bs-bc-link">Blog</span>
        <span className="bs-bc-sep" aria-hidden="true">›</span>
        <span className="bs-bc-current" aria-current="page">{post.title}</span>
      </nav>

      <header className="bs-post-header">
        {post.category && <span className="bs-cat">{post.category}</span>}
        <h1 className="bs-title">{post.title}</h1>
        {post.excerpt && <p className="bs-excerpt">{post.excerpt}</p>}
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
          {post.author && (
            <>
              <li className="bs-meta__div" aria-hidden="true" />
              <li className="bs-meta__item">
                By&nbsp;<strong>{post.author}</strong>
              </li>
            </>
          )}
        </ul>
      </header>
    </div>
  );
}
