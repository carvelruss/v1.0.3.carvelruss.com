import { useEffect, useState } from 'react';
import type { Testimonial } from '../../types';
import '../../styles/testimonials-section.css';

function QuoteIcon() {
  return (
    <svg className="ts__quote-icon" width="28" height="22" viewBox="0 0 36 28" fill="none"
      aria-hidden="true">
      <path
        d="M0 28V17.6C0 12.587 1.44 8.533 4.32 5.44 7.2 2.347 11.147.693 16.16.48L17.12 4c-3.093.747-5.413 2.16-6.96 4.24C8.613 10.32 7.84 12.72 8 15.44h8V28H0zm20 0V17.6c0-5.013 1.44-9.067 4.32-12.16C27.2 2.347 31.147.693 36.16.48L37.12 4c-3.093.747-5.413 2.16-6.96 4.24C28.613 10.32 27.84 12.72 28 15.44h8V28H20z"
        fill="currentColor"
      />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="ts__stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= rating ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={i <= rating ? 0 : 1.5}
          className={i <= rating ? 'ts__star--on' : 'ts__star--off'}
          aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="ts__card">
      <QuoteIcon />
      <StarRating rating={t.rating ?? 5} />
      <div className="ts__message-wrap">
        <p className={`ts__message${expanded ? ' ts__message--expanded' : ''}`}>"{t.message}"</p>
        <button className="ts__toggle" onClick={() => setExpanded(v => !v)}>
          {expanded ? 'See less ↑' : 'See more ↓'}
        </button>
      </div>
      <div className="ts__author">
        <div className="ts__author-avatar" aria-hidden="true">
          {t.full_name.charAt(0).toUpperCase()}
        </div>
        <div className="ts__author-info">
          <strong className="ts__author-name">{t.full_name}</strong>
          <span className="ts__author-company-name">
            {[t.role, t.company_name].filter(Boolean).join(', ')}
          </span>
          <a
            href={t.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ts__author-domain"
          >
            {t.website_url}
          </a>
        </div>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="ts__skeleton">
      <div className="ts__skeleton-line ts__skeleton-line--short" />
      <div className="ts__skeleton-line ts__skeleton-line--full" />
      <div className="ts__skeleton-line ts__skeleton-line--full" />
      <div className="ts__skeleton-line ts__skeleton-line--mid" />
      <div className="ts__skeleton-author">
        <div className="ts__skeleton-avatar" />
        <div>
          <div className="ts__skeleton-line ts__skeleton-line--name" />
          <div className="ts__skeleton-line ts__skeleton-line--sub" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [items, setItems] = useState<Testimonial[] | null>(null);

  useEffect(() => {
    fetch('/api/testimonials')
      .then(r => r.json())
      .then((d: Testimonial[]) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]));
  }, []);

  const loading  = items === null;
  const hasItems = !loading && items!.length > 0;

  if (!loading && !hasItems) return null;

  const avg = hasItems
    ? items!.reduce((sum, t) => sum + (t.rating ?? 5), 0) / items!.length
    : 0;
  const avgDisplay  = avg.toFixed(1);
  const fullStars   = Math.floor(avg);
  const track = hasItems ? [...items!, ...items!] : [];

  return (
    <section className="ts" aria-labelledby="ts-title">

      {/* Header stays inside the container */}
      <div className="container">
        <div className="ts__head">
          <div className="ts__head-left">
            <span className="ts__eyebrow">Client Reviews</span>
            <h2 className="ts__title" id="ts-title">What Clients Say</h2>
            <p className="ts__description">
              Real feedback from clients I've had the pleasure of working with.
            </p>
          </div>

          {hasItems && (
            <div className="ts__avg" aria-label={`Average rating: ${avgDisplay} out of 5`}>
              <div className="ts__avg-score">{avgDisplay}</div>
              <div className="ts__avg-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} width="18" height="18" viewBox="0 0 24 24"
                    fill={i <= fullStars ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth={i <= fullStars ? 0 : 1.5}
                    className={i <= fullStars ? 'ts__star--on' : 'ts__star--off'}
                    aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <div className="ts__avg-label">
                Based on {items!.length} review{items!.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marquee — full bleed, faded edges */}
      {loading ? (
        <div className="ts__marquee-wrap">
          <div className="ts__marquee ts__marquee--paused">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : (
        <div className="ts__marquee-wrap" aria-label="Client testimonials carousel">
          <div className="ts__marquee">
            {track.map((t, i) => (
              <TestimonialCard key={`${t.id}-${i}`} t={t} />
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
