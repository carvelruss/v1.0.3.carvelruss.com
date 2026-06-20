import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import '../../styles/recent-blogs.css';

/* ── Types ──────────────────────────────────────────────────── */

type ThumbnailType = 'principles' | 'system' | 'colors';

type RecentBlog = {
  title: string;
  category: string;
  excerpt: string;
  metadata: string;
  slug: string;
  thumbnailType: ThumbnailType;
  coverImage?: string | null;
};

/* ── Static placeholder data ────────────────────────────────── */

const STATIC_BLOGS: RecentBlog[] = [
  {
    title: '10 UI/UX Design Principles Every Designer Should Know',
    category: 'UI/UX Design',
    excerpt:
      'A practical guide to creating clear, usable, and visually effective digital interfaces.',
    metadata: 'May 12, 2026 · 6 min read',
    slug: 'ui-ux-design-principles',
    thumbnailType: 'principles',
  },
  {
    title: 'How to Create a Design System from Scratch',
    category: 'Design Systems',
    excerpt:
      'Learn how to build a scalable design system that improves consistency and speeds up product design.',
    metadata: 'May 5, 2026 · 8 min read',
    slug: 'create-design-system-from-scratch',
    thumbnailType: 'system',
  },
  {
    title: 'The Psychology of Colors in UI Design',
    category: 'UI Design',
    excerpt:
      'Understand how color choices influence trust, emotion, attention, and user behavior.',
    metadata: 'April 28, 2026 · 5 min read',
    slug: 'psychology-of-colors-ui-design',
    thumbnailType: 'colors',
  },
];

/* ── Date formatter ─────────────────────────────────────────── */

function formatPostMeta(post: Post): string {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const read = post.reading_time ? `${post.reading_time} read` : '';
  return [date, read].filter(Boolean).join(' · ');
}

/* ── CSS Thumbnail Mockups ──────────────────────────────────── */

function PrinciplesMockup() {
  return (
    <div className="blog-mock blog-mock--principles" aria-hidden="true">
      {/* Nav bar */}
      <div className="blog-mock__nav-bar">
        <div className="blog-mock__nav-logo" />
        <div className="blog-mock__nav-spacer" />
        <div className="blog-mock__nav-links">
          <div /><div /><div />
        </div>
        <div className="blog-mock__nav-btn" />
      </div>

      {/* UI Cards grid */}
      <div className="blog-mock__cards-grid">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="blog-mock__card">
            <div className="blog-mock__card-icon" />
            <div className="blog-mock__card-line" />
            <div className="blog-mock__card-line blog-mock__card-line--short" />
            <div className="blog-mock__card-line blog-mock__card-line--accent" />
          </div>
        ))}
      </div>

      {/* Cursor SVG */}
      <svg
        className="blog-mock__cursor"
        viewBox="0 0 14 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1l5.5 14 2.5-5.5L14.5 7 1 1z"
          fill="#0D215A"
          stroke="#fff"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SystemMockup() {
  return (
    <div className="blog-mock blog-mock--system" aria-hidden="true">
      {/* Color swatches */}
      <div className="blog-mock__swatches">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="blog-mock__swatch" />
        ))}
      </div>

      {/* Typography block */}
      <div className="blog-mock__type-block">
        <div className="blog-mock__type-heading" />
        <div className="blog-mock__type-body" />
        <div className="blog-mock__type-body blog-mock__type-body--mid" />
      </div>

      {/* Buttons row */}
      <div className="blog-mock__buttons">
        <div className="blog-mock__btn blog-mock__btn--filled" />
        <div className="blog-mock__btn blog-mock__btn--outline" />
        <div className="blog-mock__btn blog-mock__btn--ghost" />
      </div>

      {/* Token grid */}
      <div className="blog-mock__tokens">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="blog-mock__token">
            <div className="blog-mock__token-dot" />
            <div className="blog-mock__token-label" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorsMockup() {
  return (
    <div className="blog-mock blog-mock--colors" aria-hidden="true">
      {/* Overlapping orbs */}
      <div className="blog-mock__orbs">
        <div className="blog-mock__orb" />
        <div className="blog-mock__orb" />
        <div className="blog-mock__orb" />
        <div className="blog-mock__orb" />
      </div>

      {/* Title lines on dark */}
      <div className="blog-mock__dark-lines">
        <div className="blog-mock__dark-line" />
        <div className="blog-mock__dark-line" />
      </div>

      {/* Color palette bar */}
      <div className="blog-mock__palette">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="blog-mock__palette-swatch" />
        ))}
      </div>
    </div>
  );
}

const MOCKUPS: Record<ThumbnailType, () => JSX.Element> = {
  principles: PrinciplesMockup,
  system:     SystemMockup,
  colors:     ColorsMockup,
};

/* ── Loading skeleton ───────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="rb__skeleton">
      <div className="rb__skeleton-media" />
      <div className="rb__skeleton-body">
        <div className="rb__skeleton-line rb__skeleton-line--short" />
        <div className="rb__skeleton-line rb__skeleton-line--title" />
        <div className="rb__skeleton-line rb__skeleton-line--full" />
        <div className="rb__skeleton-line rb__skeleton-line--mid" />
        <div className="rb__skeleton-line rb__skeleton-line--short" />
      </div>
    </div>
  );
}

/* ── Blog Card ──────────────────────────────────────────────── */

function BlogCard({ blog }: { blog: RecentBlog }) {
  const Mockup = MOCKUPS[blog.thumbnailType];

  return (
    <article className={`blog-card blog-card--${blog.thumbnailType}`}>
      <div className="blog-card__media">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="blog-card__cover-img"
            loading="lazy"
          />
        ) : (
          <Mockup />
        )}
      </div>

      <div className="blog-card__body">
        <span className="blog-card__category">{blog.category}</span>
        <h3 className="blog-card__title">{blog.title}</h3>
        <p className="blog-card__excerpt">{blog.excerpt}</p>
        <p className="blog-card__meta">{blog.metadata}</p>
        <Link
          to={`/blogs/${blog.slug}`}
          className="blog-card__link"
          aria-label={`Read article: ${blog.title}`}
        >
          Read Article
          <span className="blog-card__link-arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export default function RecentBlogs() {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then((data: Post[]) =>
        setPosts(
          data
            .filter(p => p.status === 'published')
            .slice(0, 3),
        ),
      )
      .catch(() => setPosts([]));
  }, []);

  const loading  = posts === null;
  const hasPosts = !loading && posts.length > 0;

  /* Map live posts over static placeholders when available */
  const displayBlogs: RecentBlog[] = hasPosts
    ? posts.map((p, i) => ({
        title:         p.title,
        category:      p.category ?? 'Design',
        excerpt:       p.excerpt ?? p.meta_description ?? '',
        metadata:      formatPostMeta(p),
        slug:          p.slug,
        thumbnailType: STATIC_BLOGS[i % STATIC_BLOGS.length].thumbnailType,
        coverImage:    p.og_image,
      }))
    : STATIC_BLOGS;

  return (
    <section className="rb" aria-labelledby="rb-title">
      <div className="container">

        {/* ── Section Header ── */}
        <div className="rb__head">
          <div className="rb__head-left">
            <span className="rb__eyebrow">Recent Blogs</span>
            <h2 className="rb__title" id="rb-title">Latest Insights</h2>
            <p className="rb__description">
              Thoughts, ideas, and practical lessons about UI/UX design,
              web design, and digital product experiences.
            </p>
          </div>

          <Link to="/blogs" className="rb__view-all">
            View All Blogs →
          </Link>
        </div>

        {/* ── Card Grid ── */}
        {loading ? (
          <div className="rb__loading" aria-busy="true" aria-label="Loading blog posts">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="rb__grid">
            {displayBlogs.map(blog => (
              <BlogCard key={blog.slug} blog={blog} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
