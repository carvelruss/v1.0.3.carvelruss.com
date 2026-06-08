import type { Post } from '../../types';

interface Props {
  html: string;
  post: Post;
}

export default function BlogContent({ html, post }: Props) {
  const tags = post.keywords
    ? post.keywords.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bs-body">
      <div className="bs-container">
        {post.og_image && (
          <figure className="bs-featured-img" style={{ margin: '0 0 2.5rem' }}>
            <img src={post.og_image} alt={post.title} loading="lazy" />
            {post.featured_image_caption && (
              <figcaption className="bs-img-caption">{post.featured_image_caption}</figcaption>
            )}
          </figure>
        )}

        <div
          className="bs-prose"
          dangerouslySetInnerHTML={{ __html: html }}
          aria-label="Post content"
        />

        {tags.length > 0 && (
          <div className="bs-tags" aria-label="Post tags">
            <span className="bs-tags__label">Tags:</span>
            {tags.map(tag => (
              <span key={tag} className="bs-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
