import { Link } from 'react-router-dom';
import '../../styles/blogs-hero.css';

/* ── Data ─────────────────────────────────────────────────────── */

type HeroStat = { value: string; label: string };

const STATS: HeroStat[] = [
  { value: '24+',    label: 'Articles Published' },
  { value: '6+',     label: 'Topics Covered'     },
  { value: '5 min',  label: 'Avg. Read Time'     },
];

const TOPICS = ['UI/UX Design', 'Design Systems', 'Visual Design', 'Web Development'];

/* ── Article preview mockup ───────────────────────────────────── */

function ArticleMockup() {
  return (
    <div className="bph__main-card">

      {/* Browser chrome */}
      <div className="bph__browser">
        <div className="bph__browser-dots">
          <span className="bph__dot bph__dot--r" />
          <span className="bph__dot bph__dot--y" />
          <span className="bph__dot bph__dot--g" />
        </div>
        <div className="bph__browser-bar" />
      </div>

      {/* Article layout */}
      <div className="bph__article">

        {/* Category + heading */}
        <div className="bph__article-header">
          <div className="bph__article-cat-pill" />
          <div className="bph__article-h1 bph__article-h1--xl" />
          <div className="bph__article-h1 bph__article-h1--lg" />
          <div className="bph__article-h1 bph__article-h1--md" />
        </div>

        {/* Author row */}
        <div className="bph__article-author-row">
          <div className="bph__article-avatar" />
          <div className="bph__article-author-meta">
            <div className="bph__article-author-name" />
            <div className="bph__article-author-date" />
          </div>
        </div>

        {/* Hero image block */}
        <div className="bph__article-cover" />

        {/* Body paragraphs */}
        <div className="bph__article-body">
          {[100, 88, 95, 70].map((w, i) => (
            <div key={i} className="bph__article-line" style={{ width: `${w}%` }} />
          ))}

          {/* Pull quote */}
          <div className="bph__article-quote">
            <div className="bph__article-quote-accent" />
            <div className="bph__article-quote-lines">
              <div className="bph__article-quote-line" style={{ width: '90%' }} />
              <div className="bph__article-quote-line" style={{ width: '75%' }} />
            </div>
          </div>

          {[88, 62].map((w, i) => (
            <div key={i} className="bph__article-line" style={{ width: `${w}%` }} />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────── */

export default function BlogsHero() {
  return (
    <section className="bph" aria-label="Blog introduction">
      <div className="container bph__container">
        <div className="bph__grid">

          {/* ── Left: Content ── */}
          <div className="bph__content">

            <span className="bph__eyebrow">Blogs</span>

            <h1 className="bph__title">
              Insights on UI/UX, Design &amp; Web Development
            </h1>

            <p className="bph__description">
              Thoughts, tips and in-depth insights about UI/UX design, design systems,
              visual design, and building clean digital experiences that work beautifully
              across every device.
            </p>

            <div className="bph__actions">
              <a href="#blogs-list" className="bph__btn-primary">
                Start Reading →
              </a>
              <Link to="/contact" className="bph__btn-secondary">
                Work Together
              </Link>
            </div>

            {/* Topic pills */}
            <div className="bph__topics-row">
              <span className="bph__topics-label">Topics:</span>
              {TOPICS.map(topic => (
                <span key={topic} className="bph__topic-pill">{topic}</span>
              ))}
            </div>

            {/* Stats */}
            <div className="bph__stats">
              {STATS.map(({ value, label }) => (
                <div key={value} className="bph__stat">
                  <span className="bph__stat-value">{value}</span>
                  <span className="bph__stat-label">{label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* ── Right: Visual ── */}
          <div className="bph__visual" aria-hidden="true">

            <div className="bph__glow" />

            <div className="bph__visual-frame">

              <ArticleMockup />

              {/* Floating reading time card — top-right */}
              <div className="bph__reading-card">
                <div className="bph__reading-icon">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="bph__reading-info">
                  <span className="bph__reading-value">5 min</span>
                  <span className="bph__reading-label">Average read</span>
                </div>
              </div>

              {/* Floating category card — bottom-left */}
              <div className="bph__latest-card">
                <span className="bph__latest-label">Latest topic</span>
                <span className="bph__latest-value">UI/UX Design</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
