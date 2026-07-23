import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
} from 'react-icons/fi';
import {
  BsBarChartLine,
  BsPalette,
  BsCodeSlash,
  BsClipboardCheck,
} from 'react-icons/bs';
import { api } from '../lib/api';
import type { LandingPage } from '../types';
import '../styles/WebsiteDevelopmentPage.scss';

const HIGHLIGHT_ICONS = [BsBarChartLine, BsPalette, BsCodeSlash, BsClipboardCheck];

const HOTSPOT_POSITIONS = [
  { top: '26%', left: '20%' },
  { top: '44%', left: '68%' },
  { top: '63%', left: '28%' },
  { top: '79%', left: '62%' },
];

// ─── QuoteForm ────────────────────────────────────────────────────────────────

type QuoteFormVariant = 'hero' | 'final' | 'modal';

function QuoteForm({ variant, onSuccess }: { variant: QuoteFormVariant; onSuccess?: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const idp = `slp-${variant}`;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <div className="wdp-form-success" role="status" aria-live="polite">
        <div className="wdp-form-success__icon" aria-hidden="true">
          <FiCheck size={22} />
        </div>
        <p>Thanks — your request was received. We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className={`wdp-quote-form wdp-quote-form--${variant}`} onSubmit={handleSubmit} noValidate>
      <div className="wdp-form-row">
        <div className="wdp-form-field">
          <label htmlFor={`${idp}-name`}>Full Name</label>
          <input id={`${idp}-name`} type="text" name="name" required placeholder="Your full name" />
        </div>
        <div className="wdp-form-field">
          <label htmlFor={`${idp}-phone`}>Phone Number</label>
          <input id={`${idp}-phone`} type="tel" name="phone" required placeholder="(000) 000-0000" />
        </div>
      </div>
      <div className="wdp-form-field">
        <label htmlFor={`${idp}-email`}>Email Address</label>
        <input id={`${idp}-email`} type="email" name="email" required placeholder="you@company.com" />
      </div>
      <div className="wdp-form-field">
        <label htmlFor={`${idp}-website`}>Current Website</label>
        <input id={`${idp}-website`} type="url" name="website" placeholder="https://yoursite.com" />
      </div>
      {variant === 'final' && (
        <>
          <div className="wdp-form-field">
            <label htmlFor={`${idp}-timeline`}>Project Timeline</label>
            <select id={`${idp}-timeline`} name="timeline">
              <option value="">Select one...</option>
              <option value="asap">ASAP</option>
              <option value="30-60">30–60 days</option>
              <option value="60-90">60–90 days</option>
              <option value="exploring">Exploring options</option>
            </select>
          </div>
          <div className="wdp-form-field">
            <label htmlFor={`${idp}-notes`}>Tell us about your project</label>
            <textarea id={`${idp}-notes`} name="notes" rows={4} placeholder="Describe your goals and any challenges..." />
          </div>
        </>
      )}
      {variant === 'modal' && (
        <div className="wdp-form-field">
          <label htmlFor={`${idp}-priority`}>Project Priority</label>
          <select id={`${idp}-priority`} name="priority">
            <option value="">Select one...</option>
            <option value="new">New build</option>
            <option value="redesign">Redesign / refresh</option>
            <option value="landing">Landing page</option>
            <option value="other">Other</option>
          </select>
        </div>
      )}
      <button type="submit" className="wdp-btn wdp-btn--gold wdp-btn--full">
        {variant === 'hero' ? 'Book a Free Review' : variant === 'final' ? 'Get My Free Quote' : 'Submit My Request'}
      </button>
      <p className="wdp-form-privacy">Your information is kept private and never shared.</p>
    </form>
  );
}

// ─── QuoteModal ───────────────────────────────────────────────────────────────

function QuoteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>('input, select, textarea')?.focus();
    }, 60);
    return () => { clearTimeout(t); document.removeEventListener('keydown', handleKey); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="wdp-modal-backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="wdp-modal" role="dialog" aria-modal="true" aria-labelledby="slp-modal-title">
        <div className="wdp-modal__header">
          <h2 id="slp-modal-title" className="wdp-modal__title">Get Your Free Quote</h2>
          <button type="button" className="wdp-modal__close" onClick={onClose} aria-label="Close modal">
            <FiX aria-hidden="true" />
          </button>
        </div>
        <p className="wdp-modal__copy">Fill out the form below and we'll be in touch within one business day.</p>
        <div className="wdp-modal__body">
          <QuoteForm variant="modal" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServiceLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [page,     setPage]     = useState<LandingPage | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(0);
  const [carouselIndex,   setCarouselIndex]   = useState(0);
  const [openFaqIndex,    setOpenFaqIndex]    = useState<number | null>(null);
  const [activeReview,    setActiveReview]    = useState(0);
  const reviewsGridRef = useRef<HTMLDivElement>(null);

  const openModal  = useCallback(() => setIsModalOpen(true),  []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleReviewsScroll = useCallback(() => {
    const el = reviewsGridRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 16;
    setActiveReview(Math.min(Math.round(el.scrollLeft / step), (page?.sections.reviews.items.length ?? 1) - 1));
  }, [page]);

  const scrollToReview = useCallback((index: number) => {
    const el = reviewsGridRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    el.scrollTo({ left: index * (card.offsetWidth + 16), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!slug) return;
    api.getLandingPageBySlug(slug)
      .then(p => {
        setPage(p);
        document.title = p.seo_title ?? `${p.title} | Carvel Russ`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="website-development-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="a-loading">Loading…</div>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="website-development-page">
        <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem', textAlign: 'center' }}>
          <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>404</p>
          <h1 className="wdp-section-title">Page not found</h1>
          <p style={{ marginBottom: '1.5rem' }}>This landing page doesn't exist or hasn't been published yet.</p>
          <button className="wdp-btn wdp-btn--gold" onClick={() => navigate('/')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  const s = page.sections;

  const slides = s.carousel.slides;
  const slide  = slides[carouselIndex] ?? slides[0];
  const hotspots = s.why.hotspots;
  const currentHotspot = hotspots[selectedHotspot] ?? hotspots[0];

  const prevSlide = () => setCarouselIndex(i => (i === 0 ? slides.length - 1 : i - 1));
  const nextSlide = () => setCarouselIndex(i => (i === slides.length - 1 ? 0 : i + 1));
  const toggleFaq = (i: number) => setOpenFaqIndex(prev => (prev === i ? null : i));

  return (
    <div className="website-development-page">

      {/* ── Header ── */}
      {s.header.enabled && (
        <header className="wdp-header">
          <div className="wdp-header__inner container">
            <a href="/" className="wdp-logo" aria-label="Carvel Russ – Home">
              <img src="/logos/carvelruss-logo.png" alt="Carvel Russ" />
            </a>
            <div className="wdp-header__actions">
              <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
                {s.header.ctaText}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Hero ── */}
      {s.hero.enabled && (
        <section className="wdp-hero" aria-labelledby="slp-hero-heading">
          <div className="wdp-hero__grid" aria-hidden="true" />
          <div className="wdp-hero__glow"  aria-hidden="true" />
          <div className="wdp-hero__shape wdp-hero__shape--1" aria-hidden="true" />
          <div className="wdp-hero__shape wdp-hero__shape--2" aria-hidden="true" />
          <div className="container">
            <div className="wdp-hero__layout">
              <div className="wdp-hero__left">
                <span className="wdp-eyebrow">{s.hero.eyebrow}</span>
                <h1 id="slp-hero-heading" className="wdp-hero__title">
                  {s.hero.titleLine1}{' '}
                  <span className="wdp-hero__title-accent">{s.hero.titleAccent}</span>{' '}
                  {s.hero.titleLine2}
                </h1>
                <p className="wdp-hero__sub">{s.hero.subCopy}</p>
                <div className="wdp-hero__chips">
                  {s.hero.chips.map(chip => (
                    <span key={chip} className="wdp-chip"><FiCheck aria-hidden="true" size={12} /> {chip}</span>
                  ))}
                </div>
                <div className="wdp-hero__ctas">
                  <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
                    {s.hero.primaryCtaText}
                  </button>
                  <a href={`mailto:${s.hero.secondaryCtaEmail}`} className="wdp-btn wdp-btn--outline-dark">
                    {s.hero.secondaryCtaText}
                  </a>
                </div>
                <div className="wdp-hero__proof">
                  {s.hero.proofCards.map(card => (
                    <div key={card.title} className="wdp-proof-card">
                      <div className="wdp-proof-card__title">{card.title}</div>
                      <div className="wdp-proof-card__copy">{card.copy}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="wdp-hero__right">
                <div className="wdp-quote-card">
                  <div className="wdp-quote-card__header">
                    <div className="wdp-quote-card__badge">{s.hero.quoteCardBadge}</div>
                    <h2 className="wdp-quote-card__title">{s.hero.quoteCardTitle}</h2>
                    <p className="wdp-quote-card__copy">{s.hero.quoteCardCopy}</p>
                  </div>
                  <QuoteForm variant="hero" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Highlights ── */}
      {s.highlights.enabled && (
        <section className="wdp-highlights" aria-label="Service highlights">
          <div className="container">
            <div className="wdp-highlights__grid">
              {s.highlights.cards.map((card, i) => {
                const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                return (
                  <div key={card.title} className="wdp-highlight-card">
                    <div className="wdp-highlight-card__icon" aria-hidden="true">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <h3 className="wdp-highlight-card__title">{card.title}</h3>
                    <p className="wdp-highlight-card__copy">{card.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Standards ── */}
      {s.standards.enabled && (
        <section className="wdp-standards" aria-labelledby="slp-standards-heading">
          <div className="container">
            <div className="wdp-section-header text-center">
              <span className="wdp-kicker">Our Process</span>
              <h2 id="slp-standards-heading" className="wdp-section-title">{s.standards.heading}</h2>
              <p className="wdp-section-sub">{s.standards.subHeading}</p>
            </div>
            <div className="wdp-standards__grid">
              {s.standards.cards.map(card => (
                <div key={card.number} className="wdp-standard-card">
                  <div className="wdp-standard-card__number" aria-hidden="true">{card.number}</div>
                  <h3 className="wdp-standard-card__title">{card.title}</h3>
                  <p className="wdp-standard-card__copy">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Band ── */}
      {s.ctaBand.enabled && (
        <section className="wdp-cta-band">
          <div className="container">
            <div className="wdp-cta-band__inner">
              <div className="wdp-cta-band__copy">
                <h2 className="wdp-cta-band__title">{s.ctaBand.headline}</h2>
              </div>
              <button type="button" className="wdp-btn wdp-btn--white" onClick={openModal}>
                {s.ctaBand.buttonText}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Why ── */}
      {s.why.enabled && (
        <section className="wdp-why" aria-labelledby="slp-why-heading">
          <div className="container">
            <div className="wdp-why__layout">
              <div className="wdp-why__left">
                <div className="wdp-browser-wrap">
                  <div className="wdp-browser" aria-label="Interactive mockup — click hotspots to learn more">
                    <div className="wdp-browser__bar" aria-hidden="true">
                      <span className="wdp-browser__dot wdp-browser__dot--red" />
                      <span className="wdp-browser__dot wdp-browser__dot--yellow" />
                      <span className="wdp-browser__dot wdp-browser__dot--green" />
                      <span className="wdp-browser__addr" />
                    </div>
                    <div className="wdp-browser__body" aria-hidden="true">
                      <div className="wdp-mock-logo" />
                      <div className="wdp-mock-nav"><span /><span /><span /></div>
                      <div className="wdp-mock-hero-block">
                        <div className="wdp-mock-h1" />
                        <div className="wdp-mock-h2" />
                        <div className="wdp-mock-cta-btn" />
                      </div>
                      <div className="wdp-mock-content">
                        <div className="wdp-mock-line" />
                        <div className="wdp-mock-line wdp-mock-line--med" />
                        <div className="wdp-mock-line wdp-mock-line--short" />
                      </div>
                      <div className="wdp-mock-form-block">
                        <div className="wdp-mock-input" />
                        <div className="wdp-mock-input" />
                        <div className="wdp-mock-submit" />
                      </div>
                    </div>
                    {hotspots.slice(0, 4).map((hs, i) => (
                      <button
                        key={hs.id}
                        type="button"
                        className={`wdp-hotspot${selectedHotspot === i ? ' wdp-hotspot--active' : ''}`}
                        style={HOTSPOT_POSITIONS[i]}
                        onClick={() => setSelectedHotspot(i)}
                        aria-label={`Hotspot ${i + 1}: ${hs.label}`}
                        aria-pressed={selectedHotspot === i}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="wdp-insight-card" aria-live="polite" aria-atomic="true">
                    <div className="wdp-insight-card__num" aria-hidden="true">{selectedHotspot + 1}</div>
                    <div className="wdp-insight-card__body">
                      <h4 className="wdp-insight-card__title">{currentHotspot.title}</h4>
                      <p className="wdp-insight-card__copy">{currentHotspot.copy}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="wdp-why__right">
                <span className="wdp-kicker">Why clients choose us</span>
                <h2 id="slp-why-heading" className="wdp-section-title">{s.why.heading}</h2>
                <p className="wdp-why__intro">{s.why.subCopy}</p>
                <div className="wdp-reasons">
                  {s.why.reasons.map((card, i) => (
                    <div key={card.title} className="wdp-reason-card">
                      <div className="wdp-reason-card__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
                      <div>
                        <h4 className="wdp-reason-card__title">{card.title}</h4>
                        <p className="wdp-reason-card__copy">{card.copy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Longform ── */}
      {s.longform.enabled && (
        <section className="wdp-longform" aria-labelledby="slp-longform-heading">
          <div className="container">
            <div className="wdp-longform__layout">
              <div className="wdp-longform__main">
                <span className="wdp-kicker">{s.longform.kicker}</span>
                <h2 id="slp-longform-heading" className="wdp-section-title">{s.longform.heading}</h2>
                <div className="wdp-prose"><p>{s.longform.body}</p></div>
                <ul className="wdp-checklist">
                  {s.longform.checklist.map(item => (
                    <li key={item} className="wdp-checklist__item">
                      <FiCheck className="wdp-checklist__icon" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="wdp-longform__sidebar">
                <div className="wdp-mini-quote">
                  <h3 className="wdp-mini-quote__title">{s.longform.sidebarTitle}</h3>
                  <p className="wdp-mini-quote__copy">{s.longform.sidebarCopy}</p>
                  <button type="button" className="wdp-btn wdp-btn--white wdp-btn--full" onClick={openModal}>
                    {s.longform.sidebarCtaText}
                  </button>
                  <ul className="wdp-mini-checklist">
                    {s.longform.sidebarChecklist.map(item => (
                      <li key={item} className="wdp-mini-checklist__item">
                        <FiCheck aria-hidden="true" size={13} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {s.faq.enabled && (
        <section className="wdp-faq" aria-labelledby="slp-faq-heading">
          <div className="container">
            <div className="wdp-section-header text-center">
              <span className="wdp-kicker">FAQ</span>
              <h2 id="slp-faq-heading" className="wdp-section-title">{s.faq.heading}</h2>
            </div>
            <div className="wdp-faq__list">
              {s.faq.items.map((item, i) => (
                <div key={i} className={`wdp-faq-item${openFaqIndex === i ? ' wdp-faq-item--open' : ''}`}>
                  <button
                    type="button"
                    className="wdp-faq-item__btn"
                    onClick={() => toggleFaq(i)}
                    aria-expanded={openFaqIndex === i}
                    aria-controls={`slp-faq-body-${i}`}
                    id={`slp-faq-btn-${i}`}
                  >
                    <span>{item.question}</span>
                    <span className="wdp-faq-item__chevron" aria-hidden="true">
                      {openFaqIndex === i ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </button>
                  <div
                    id={`slp-faq-body-${i}`}
                    role="region"
                    aria-labelledby={`slp-faq-btn-${i}`}
                    className={`wdp-faq-item__body${openFaqIndex === i ? ' wdp-faq-item__body--open' : ''}`}
                  >
                    <div className="wdp-faq-item__body-inner">
                      <p className="wdp-faq-item__answer">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promise ── */}
      {s.promise.enabled && (
        <section className="wdp-promise" aria-labelledby="slp-promise-heading">
          <div className="container">
            <div className="wdp-section-header text-center">
              <span className="wdp-kicker wdp-kicker--light">Our promise</span>
              <h2 id="slp-promise-heading" className="wdp-section-title wdp-section-title--light">{s.promise.heading}</h2>
              <p className="wdp-section-sub wdp-section-sub--light">{s.promise.subCopy}</p>
            </div>
            <div className="wdp-promise__grid">
              {s.promise.cards.map((card, i) => (
                <div key={i} className="wdp-promise-card">
                  <div className="wdp-promise-card__title">{card.title}</div>
                  <p className="wdp-promise-card__copy">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Carousel ── */}
      {s.carousel.enabled && slides.length > 0 && (
        <section className="wdp-carousel-section" aria-labelledby="slp-carousel-heading">
          <div className="container">
            <div className="wdp-section-header">
              <span className="wdp-kicker">Recent Work</span>
              <h2 id="slp-carousel-heading" className="wdp-section-title">{s.carousel.heading}</h2>
            </div>
            <div className="wdp-carousel" aria-roledescription="carousel" aria-label="Recent work examples">
              <div className="wdp-carousel__slide" aria-roledescription="slide" aria-label={`Slide ${carouselIndex + 1} of ${slides.length}`}>
                <div className="wdp-carousel__content">
                  <span className="wdp-carousel__tag">{slide.tag}</span>
                  <h3 className="wdp-carousel__title">{slide.title}</h3>
                  <p className="wdp-carousel__copy">{slide.copy}</p>
                  <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
                    {s.ctaBand.buttonText}
                  </button>
                </div>
                <div className="wdp-carousel__visual" aria-hidden="true">
                  <div className="wdp-mock-screen">
                    <div className="wdp-mock-screen__bar">
                      <span className="wdp-mock-screen__dot" />
                      <span className="wdp-mock-screen__dot" />
                      <span className="wdp-mock-screen__dot" />
                    </div>
                    <div className="wdp-mock-screen__body">
                      <div className="wdp-ms-hero" data-slide={String(carouselIndex)} />
                      <div className="wdp-ms-line" />
                      <div className="wdp-ms-line wdp-ms-line--med" />
                      <div className="wdp-ms-cta" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="wdp-carousel__controls">
                <button type="button" className="wdp-carousel__btn" onClick={prevSlide} aria-label="Previous slide">
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <span className="wdp-carousel__counter" aria-live="polite" aria-atomic="true">
                  {carouselIndex + 1} / {slides.length}
                </span>
                <button type="button" className="wdp-carousel__btn" onClick={nextSlide} aria-label="Next slide">
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Reviews ── */}
      {s.reviews.enabled && (
        <section className="wdp-reviews" aria-labelledby="slp-reviews-heading">
          <div className="container">
            <div className="wdp-section-header text-center">
              <span className="wdp-kicker">What clients say</span>
              <h2 id="slp-reviews-heading" className="wdp-section-title">{s.reviews.heading}</h2>
              <p className="wdp-section-sub">{s.reviews.subCopy}</p>
            </div>
            <div className="wdp-reviews__grid" ref={reviewsGridRef} onScroll={handleReviewsScroll}>
              {s.reviews.items.map((review, i) => (
                <figure key={i} className="wdp-review-card">
                  <div className="wdp-review-card__stars" aria-label={`${review.stars} out of 5 stars`}>
                    {'★'.repeat(review.stars)}
                  </div>
                  <blockquote className="wdp-review-card__quote">
                    <p>"{review.quote}"</p>
                  </blockquote>
                  <figcaption className="wdp-review-card__name">— {review.name}</figcaption>
                </figure>
              ))}
            </div>
            {s.reviews.items.length > 1 && (
              <div className="wdp-reviews__dots" aria-hidden="true">
                {s.reviews.items.map((_, i) => (
                  <button
                    key={i}
                    className={`wdp-reviews__dot${activeReview === i ? ' wdp-reviews__dot--active' : ''}`}
                    onClick={() => scrollToReview(i)}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Area ── */}
      {s.area.enabled && (
        <section className="wdp-area" aria-labelledby="slp-area-heading">
          <div className="container">
            <div className="wdp-area__layout">
              <div className="wdp-area__left">
                <span className="wdp-kicker">Service Area</span>
                <h2 id="slp-area-heading" className="wdp-section-title">{s.area.heading}</h2>
                <p className="wdp-area__copy">{s.area.copy}</p>
                <div className="wdp-area__chips">
                  {s.area.chips.map(chip => (
                    <span key={chip} className="wdp-area-chip">{chip}</span>
                  ))}
                </div>
              </div>
              <div className="wdp-area__right" aria-hidden="true">
                <div className="wdp-map">
                  <div className="wdp-map__ring wdp-map__ring--outer" />
                  <div className="wdp-map__ring wdp-map__ring--middle" />
                  <div className="wdp-map__ring wdp-map__ring--inner" />
                  <div className="wdp-map__center"><span>CR</span></div>
                  <div className="wdp-map__pin wdp-map__pin--1" />
                  <div className="wdp-map__pin wdp-map__pin--2" />
                  <div className="wdp-map__pin wdp-map__pin--3" />
                  <div className="wdp-map__pin wdp-map__pin--4" />
                  <div className="wdp-map__label wdp-map__label--1">Remote</div>
                  <div className="wdp-map__label wdp-map__label--2">Global</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Final Quote ── */}
      {s.finalQuote.enabled && (
        <section className="wdp-final-quote" aria-labelledby="slp-final-heading">
          <div className="container">
            <div className="wdp-final-quote__layout">
              <div className="wdp-final-quote__left">
                <span className="wdp-kicker wdp-kicker--light">Let's get started</span>
                <h2 id="slp-final-heading" className="wdp-section-title wdp-section-title--light">
                  {s.finalQuote.heading}
                </h2>
                <p className="wdp-final-quote__copy">{s.finalQuote.copy}</p>
                <ul className="wdp-checklist wdp-checklist--light">
                  {s.finalQuote.checklist.map(item => (
                    <li key={item} className="wdp-checklist__item">
                      <FiCheck className="wdp-checklist__icon" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wdp-final-quote__right">
                <div className="wdp-final-form-card">
                  <h3 className="wdp-final-form-card__title">Request your free quote</h3>
                  <p className="wdp-final-form-card__copy">
                    Fill out the form and we'll review the best path forward for your project.
                  </p>
                  <QuoteForm variant="final" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      {s.footer.enabled && (
        <footer className="wdp-footer">
          <div className="container">
            <div className="wdp-footer__inner">
              <p className="wdp-footer__left">{s.footer.leftText}</p>
              <p className="wdp-footer__right">{s.footer.rightText}</p>
            </div>
          </div>
        </footer>
      )}

      {/* ── Modal ── */}
      <QuoteModal isOpen={isModalOpen} onClose={closeModal} />

      {/* ── Sticky Mobile CTA ── */}
      {s.mobileCta.enabled && (
        <div className="wdp-sticky-cta" aria-label="Quick actions">
          <button type="button" className="wdp-sticky-cta__btn wdp-sticky-cta__btn--primary" onClick={openModal}>
            {s.mobileCta.primaryText}
          </button>
          <a href={`mailto:${s.mobileCta.secondaryEmail}`} className="wdp-sticky-cta__btn wdp-sticky-cta__btn--call">
            <FiMail aria-hidden="true" size={16} /> {s.mobileCta.secondaryText}
          </a>
        </div>
      )}

    </div>
  );
}
