import { useState, useEffect, useRef, useCallback } from 'react';
import type { FormEvent } from 'react';
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
import '../styles/WebsiteDevelopmentPage.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteFormVariant = 'hero' | 'final' | 'modal';

type ServiceHighlight = {
  title: string;
  copy:  string;
};

type StandardCard = {
  number: string;
  title:  string;
  copy:   string;
};

type Hotspot = {
  id:    number;
  label: string;
  top:   string;
  left:  string;
  title: string;
  copy:  string;
};

type ReasonCard = {
  title: string;
  copy:  string;
};

type FAQItem = {
  question: string;
  answer:   string;
};

type CaseStudy = {
  tag:   string;
  title: string;
  copy:  string;
};

type Review = {
  stars: number;
  quote: string;
  name:  string;
};

type CredentialCard = {
  title: string;
  copy:  string;
};

// ─── Static Data ─────────────────────────────────────────────────────────────

const HIGHLIGHT_ICONS = [BsBarChartLine, BsPalette, BsCodeSlash, BsClipboardCheck];

const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  { title: 'Conversion Strategy', copy: 'Offer, structure, CTA flow' },
  { title: 'Custom Design',       copy: 'Polished, branded, responsive' },
  { title: 'Website Build',       copy: 'Clean launch-ready development' },
  { title: 'Lead Capture',        copy: 'Forms, routing, calendar handoff' },
];

const STANDARD_CARDS: StandardCard[] = [
  {
    number: '01',
    title:  'Website Strategy',
    copy:   'Define the buyer, offer, page structure, calls to action, proof, and conversion path before design begins.',
  },
  {
    number: '02',
    title:  'UI/UX Design',
    copy:   'Create a clean, mobile-first experience that guides visitors through trust, value, and action.',
  },
  {
    number: '03',
    title:  'Responsive Build',
    copy:   'Develop pages that look polished across desktop, tablet, and mobile without adding unnecessary friction.',
  },
  {
    number: '04',
    title:  'Launch Handoff',
    copy:   'Prepare forms, analytics events, calendar flow, and lead routing so conversions become real conversations.',
  },
];

const HOTSPOTS: Hotspot[] = [
  {
    id: 1, label: 'Clear headline area', top: '26%', left: '20%',
    title: 'Clear headline',
    copy:  'The first screen says what you do, who it is for, and why the visitor should care within seconds.',
  },
  {
    id: 2, label: 'Trust badges area', top: '44%', left: '68%',
    title: 'Trust above the fold',
    copy:  'Badges, proof points, sharp visuals, and a confident CTA reduce hesitation before the visitor scrolls.',
  },
  {
    id: 3, label: 'CTA button area', top: '63%', left: '28%',
    title: 'One conversion path',
    copy:  'This page avoids competing service offers and guides visitors toward one action: requesting a website quote.',
  },
  {
    id: 4, label: 'Lead form area', top: '79%', left: '62%',
    title: 'Lead handoff',
    copy:  'The form should connect to tracking, CRM, and calendar follow-up so new opportunities do not get lost.',
  },
];

const REASON_CARDS: ReasonCard[] = [
  {
    title: 'Strategy before design',
    copy:  'The site is planned around the buyer journey, conversion event, and sales handoff before visual polish is added.',
  },
  {
    title: 'Built for trust',
    copy:  'Visual hierarchy, proof, messaging, and page flow work together so prospects feel confident enough to engage.',
  },
  {
    title: 'Launch-ready systems',
    copy:  'Forms, events, routing, and calendar flow help bridge the gap between a website conversion and a real sales conversation.',
  },
  {
    title: 'No generic brochure build',
    copy:  'This page sells a conversion asset, not just a prettier set of pages.',
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Is this page only for Website Development?',
    answer:   'Yes. This version is intentionally focused on one service only: Website Development. Other Carvel Russ services should each have their own dedicated landing page.',
  },
  {
    question: 'What kind of website is this best for?',
    answer:   'It is best for businesses that need a clearer, more credible, conversion-focused website or service landing page designed to generate quote requests, calls, and qualified leads.',
  },
  {
    question: 'What should be prepared before the build?',
    answer:   'The best inputs are current website URL, business goals, audience, key offers, examples of sites you like, available brand assets, and the primary action you want visitors to take.',
  },
  {
    question: 'Can the form connect to CRM or calendar booking?',
    answer:   'Yes. The page is structured for CRM/calendar handoff. The demo form is not connected, but the production version should route requests immediately and trigger a booking step.',
  },
  {
    question: 'Will this include other marketing services?',
    answer:   'No. This page should not sell paid ads, SEO, AI, or social media. It can mention launch-readiness, but the offer remains Website Development.',
  },
];

const CASE_STUDIES: CaseStudy[] = [
  {
    tag:   'Conversion Redesign',
    title: 'From vague homepage to clear quote flow.',
    copy:  'A cleaner hero, stronger proof order, and simplified form path help prospects understand the offer and take action faster.',
  },
  {
    tag:   'Mobile UX Build',
    title: 'A smoother mobile path from visit to call.',
    copy:  'A mobile-first layout keeps the CTA visible, reduces scanning friction, and makes the next action easier for high-intent visitors.',
  },
  {
    tag:   'Lead Capture System',
    title: 'Forms built for faster follow-up.',
    copy:  'The page collects enough project context to qualify the inquiry while keeping the quote request simple and action-oriented.',
  },
];

const REVIEWS: Review[] = [
  {
    stars: 5,
    quote: 'Replace this with a verified review about design quality, communication, and business impact.',
    name:  'Verified client placeholder',
  },
  {
    stars: 5,
    quote: 'Replace this with a verified review about website clarity, speed, and easier lead capture.',
    name:  'Verified client placeholder',
  },
  {
    stars: 5,
    quote: 'Replace this with a verified review about the process from strategy to launch.',
    name:  'Verified client placeholder',
  },
];

const CREDENTIALS: CredentialCard[] = [
  {
    title: '10+ years',
    copy:  'Experience building strategies and systems around business growth, revenue, and customer acquisition.',
  },
  {
    title: 'UI/UX focused',
    copy:  'Responsive layouts, user-friendly experiences, clear hierarchy, and polished presentation.',
  },
  {
    title: 'Partner mindset',
    copy:  'Built with transparent recommendations, goal-focused planning, and a roadmap to launch.',
  },
];

const AREA_CHIPS: string[] = [
  'Remote-first', 'Worldwide clients', 'Service businesses',
  'Growth-stage teams', 'Digital brands', 'Startups',
];

const LONGFORM_CHECKLIST: string[] = [
  'Custom page structure based on the offer and buyer intent',
  'Mobile-first UI/UX design with clear content hierarchy',
  'Lead form strategy with phone, email, website, and project context',
  'Launch checklist for QA, analytics, and conversion tracking',
  'Follow-up path recommendation to reduce lead decay',
];

const MINI_CHECKLIST: string[] = [
  'Homepage clarity', 'Mobile UX', 'CTA placement', 'Form and tracking flow',
];

const FINAL_CHECKLIST: string[] = [
  'Website strategy and conversion path',
  'Responsive UI/UX design',
  'Development and launch QA',
  'Lead capture and handoff planning',
];

const TRUST_CHIPS: string[] = [
  'Conversion-first structure', 'Mobile-first UX', 'Tracking-ready launch',
];

// ─── QuoteForm ────────────────────────────────────────────────────────────────

interface QuoteFormProps {
  variant:   QuoteFormVariant;
  onSuccess?: () => void;
}

function QuoteForm({ variant, onSuccess }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const idp = `qf-${variant}`;

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
        <p>Thanks — this demo quote request was received. Carvel Russ will be in touch soon.</p>
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

      {variant === 'modal' && (
        <div className="wdp-form-field">
          <label htmlFor={`${idp}-priority`}>Project Priority</label>
          <select id={`${idp}-priority`} name="priority">
            <option value="">Select one...</option>
            <option value="new">New website</option>
            <option value="redesign">Website redesign</option>
            <option value="landing">Landing page build</option>
            <option value="conversion">Conversion improvement</option>
          </select>
        </div>
      )}

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
            <label htmlFor={`${idp}-notes`}>What needs to change?</label>
            <textarea
              id={`${idp}-notes`}
              name="notes"
              rows={4}
              placeholder="Describe your current website challenges and goals..."
            />
          </div>
        </>
      )}

      <button type="submit" className="wdp-btn wdp-btn--gold wdp-btn--full">
        {variant === 'hero'
          ? 'Book My Website Review'
          : variant === 'final'
          ? 'Get My Free Website Quote'
          : 'Submit My Quote Request'}
      </button>

      <p className="wdp-form-privacy">
        All personal information is stored in a safe location. Demo form only.
      </p>
    </form>
  );
}

// ─── QuoteModal ───────────────────────────────────────────────────────────────

interface QuoteModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'input, select, textarea'
      );
      firstFocusable?.focus();
    }, 60);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="wdp-modal-backdrop"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="wdp-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wdp-modal-title"
      >
        <div className="wdp-modal__header">
          <h2 id="wdp-modal-title" className="wdp-modal__title">
            Get Your Free Website Development Quote
          </h2>
          <button
            type="button"
            className="wdp-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <p className="wdp-modal__copy">
          Fill out the form below and I'll review your project goals, current site, and ideal
          launch timeline.
        </p>
        <div className="wdp-modal__body">
          <QuoteForm variant="modal" />
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function WebsiteDevelopmentPage() {
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(1);
  const [carouselIndex,   setCarouselIndex]   = useState(0);
  const [openFaqIndex,    setOpenFaqIndex]    = useState<number | null>(null);

  const openModal  = useCallback(() => setIsModalOpen(true),  []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  useEffect(() => {
    document.title = 'Website Development | Carvel Russ';
  }, []);

  const currentHotspot = HOTSPOTS.find((h) => h.id === selectedHotspot) ?? HOTSPOTS[0];

  const prevSlide = () =>
    setCarouselIndex((i) => (i === 0 ? CASE_STUDIES.length - 1 : i - 1));
  const nextSlide = () =>
    setCarouselIndex((i) => (i === CASE_STUDIES.length - 1 ? 0 : i + 1));

  const toggleFaq = (index: number) =>
    setOpenFaqIndex((prev) => (prev === index ? null : index));

  const slide = CASE_STUDIES[carouselIndex];

  return (
    <div className="website-development-page">

      {/* ── 2. Sticky Header ── */}
      <header className="wdp-header">
        <div className="wdp-header__inner container">
          <a href="/" className="wdp-logo" aria-label="Carvel Russ – Home">
            <img src="/logos/carvelruss-logo.png" alt="Carvel Russ" />
          </a>
          <div className="wdp-header__actions">
            <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
              Get A Free Quote
            </button>
          </div>
        </div>
      </header>

      {/* ── 3. Hero ── */}
      <section className="wdp-hero" aria-labelledby="wdp-hero-heading">
        <div className="wdp-hero__grid" aria-hidden="true" />
        <div className="wdp-hero__glow"  aria-hidden="true" />
        <div className="wdp-hero__shape wdp-hero__shape--1" aria-hidden="true" />
        <div className="wdp-hero__shape wdp-hero__shape--2" aria-hidden="true" />

        <div className="container">
          <div className="wdp-hero__layout">

            {/* Left */}
            <div className="wdp-hero__left">
              <span className="wdp-eyebrow">
                #1 Conversion Website Development Page Concept
              </span>

              <h1 id="wdp-hero-heading" className="wdp-hero__title">
                Website Development Experts for{' '}
                <span className="wdp-hero__title-accent">Growth-Ready</span> Businesses
              </h1>

              <p className="wdp-hero__sub">
                Get a fast, polished, mobile-first website built around one job: turning visitors
                into calls, quote requests, and qualified sales opportunities.
              </p>

              <div className="wdp-hero__chips">
                {TRUST_CHIPS.map((chip) => (
                  <span key={chip} className="wdp-chip">
                    <FiCheck aria-hidden="true" size={12} /> {chip}
                  </span>
                ))}
              </div>

              <div className="wdp-hero__ctas">
                <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
                  Get My Free Website Quote
                </button>
                <a href="mailto:hello@carvelruss.com" className="wdp-btn wdp-btn--outline-dark">
                  Email Carvel Russ
                </a>
              </div>

              <div className="wdp-hero__proof">
                <div className="wdp-proof-card">
                  <div className="wdp-proof-card__title">10+ yrs</div>
                  <div className="wdp-proof-card__copy">experience guiding revenue-focused campaigns</div>
                </div>
                <div className="wdp-proof-card">
                  <div className="wdp-proof-card__title">1 service</div>
                  <div className="wdp-proof-card__copy">this page sells Website Development only</div>
                </div>
                <div className="wdp-proof-card">
                  <div className="wdp-proof-card__title">CRM-ready</div>
                  <div className="wdp-proof-card__copy">forms, routing, calendar handoff, and tracking plan</div>
                </div>
              </div>
            </div>

            {/* Right — Quote Card */}
            <div className="wdp-hero__right">
              <div className="wdp-quote-card">
                <div className="wdp-quote-card__header">
                  <div className="wdp-quote-card__badge">Free Estimate</div>
                  <h2 className="wdp-quote-card__title">Free Website Development Quote</h2>
                  <p className="wdp-quote-card__copy">
                    Tell us what you need built. I'll review your goals, current site, and launch
                    timeline.
                  </p>
                </div>
                <QuoteForm variant="hero" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. Service Highlight Strip ── */}
      <section className="wdp-highlights" aria-label="Service highlights">
        <div className="container">
          <div className="wdp-highlights__grid">
            {SERVICE_HIGHLIGHTS.map((item, i) => {
              const Icon = HIGHLIGHT_ICONS[i];
              return (
                <div key={item.title} className="wdp-highlight-card">
                  <div className="wdp-highlight-card__icon" aria-hidden="true">
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="wdp-highlight-card__title">{item.title}</h3>
                  <p className="wdp-highlight-card__copy">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Standards Section ── */}
      <section className="wdp-standards" aria-labelledby="wdp-standards-heading">
        <div className="container">
          <div className="wdp-section-header text-center">
            <span className="wdp-kicker">Website Development Standards</span>
            <h2 id="wdp-standards-heading" className="wdp-section-title">
              Built for clarity, credibility, and conversion.
            </h2>
            <p className="wdp-section-sub">
              This single-service page keeps the buyer focused on one outcome: a better website
              that makes the next step obvious.
            </p>
          </div>
          <div className="wdp-standards__grid">
            {STANDARD_CARDS.map((card) => (
              <div key={card.number} className="wdp-standard-card">
                <div className="wdp-standard-card__number" aria-hidden="true">{card.number}</div>
                <h3 className="wdp-standard-card__title">{card.title}</h3>
                <p className="wdp-standard-card__copy">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Dark CTA Band ── */}
      <section className="wdp-cta-band">
        <div className="container">
          <div className="wdp-cta-band__inner">
            <div className="wdp-cta-band__copy">
              <h2 className="wdp-cta-band__title">
                Your website should sell before your sales team speaks.
              </h2>
              <p className="wdp-cta-band__sub">
                Replace vague messaging, outdated design, and weak lead capture with a website built
                around trust, speed, and action.
              </p>
            </div>
            <button type="button" className="wdp-btn wdp-btn--white" onClick={openModal}>
              Request a Website Quote
            </button>
          </div>
        </div>
      </section>

      {/* ── 7. Why Clients Choose Carvel Russ ── */}
      <section className="wdp-why" aria-labelledby="wdp-why-heading">
        <div className="container">
          <div className="wdp-why__layout">

            {/* Left — Interactive Mockup */}
            <div className="wdp-why__left">
              <div className="wdp-browser-wrap">
                <div
                  className="wdp-browser"
                  aria-label="Interactive website mockup — click numbered hotspots to learn more"
                >
                  {/* Browser chrome */}
                  <div className="wdp-browser__bar" aria-hidden="true">
                    <span className="wdp-browser__dot wdp-browser__dot--red" />
                    <span className="wdp-browser__dot wdp-browser__dot--yellow" />
                    <span className="wdp-browser__dot wdp-browser__dot--green" />
                    <span className="wdp-browser__addr" />
                  </div>

                  {/* Fake content */}
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

                  {/* Hotspot buttons */}
                  {HOTSPOTS.map((hs) => (
                    <button
                      key={hs.id}
                      type="button"
                      className={`wdp-hotspot${selectedHotspot === hs.id ? ' wdp-hotspot--active' : ''}`}
                      style={{ top: hs.top, left: hs.left }}
                      onClick={() => setSelectedHotspot(hs.id)}
                      aria-label={`Hotspot ${hs.id}: ${hs.label}`}
                      aria-pressed={selectedHotspot === hs.id}
                    >
                      {hs.id}
                    </button>
                  ))}
                </div>

                {/* Insight card */}
                <div className="wdp-insight-card" aria-live="polite" aria-atomic="true">
                  <div className="wdp-insight-card__num" aria-hidden="true">
                    {currentHotspot.id}
                  </div>
                  <div className="wdp-insight-card__body">
                    <h4 className="wdp-insight-card__title">{currentHotspot.title}</h4>
                    <p className="wdp-insight-card__copy">{currentHotspot.copy}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Reasons */}
            <div className="wdp-why__right">
              <span className="wdp-kicker">Why clients choose Carvel Russ</span>
              <h2 id="wdp-why-heading" className="wdp-section-title">
                A website build with revenue direction.
              </h2>
              <p className="wdp-why__intro">
                The layout mirrors a quote-driven service page, but the message is tailored to
                Carvel Russ's Website Development offer.
              </p>
              <div className="wdp-reasons">
                {REASON_CARDS.map((card, i) => (
                  <div key={card.title} className="wdp-reason-card">
                    <div className="wdp-reason-card__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </div>
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

      {/* ── 8. Long-Form Section ── */}
      <section className="wdp-longform" aria-labelledby="wdp-longform-heading">
        <div className="container">
          <div className="wdp-longform__layout">

            {/* Main copy */}
            <div className="wdp-longform__main">
              <span className="wdp-kicker">Custom UI/UX Website Development</span>
              <h2 id="wdp-longform-heading" className="wdp-section-title">
                A better website starts with a better buyer journey.
              </h2>
              <div className="wdp-prose">
                <p>
                  Most websites underperform because the visitor has to work too hard. The headline
                  is vague, the offer is scattered, the proof appears too late, and the contact form
                  feels disconnected from the sales process.
                </p>
                <p>
                  This Website Development approach makes the value clear immediately: the business
                  gets a polished, responsive, conversion-focused website that helps turn qualified
                  traffic into calls and quote requests.
                </p>
                <p>
                  This page keeps the layout quote-focused: top CTA, authority signals, immediate
                  form, service-specific details, proof sections, FAQ, and a final quote request.
                </p>
              </div>
              <ul className="wdp-checklist">
                {LONGFORM_CHECKLIST.map((item) => (
                  <li key={item} className="wdp-checklist__item">
                    <FiCheck className="wdp-checklist__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sticky sidebar */}
            <aside className="wdp-longform__sidebar">
              <div className="wdp-mini-quote">
                <h3 className="wdp-mini-quote__title">Not sure what your website needs?</h3>
                <p className="wdp-mini-quote__copy">
                  Start with a free website review. A quick review can identify messaging gaps, UX
                  friction, and conversion handoff issues before recommending a build path.
                </p>
                <button
                  type="button"
                  className="wdp-btn wdp-btn--white wdp-btn--full"
                  onClick={openModal}
                >
                  Get My Website Review
                </button>
                <ul className="wdp-mini-checklist">
                  {MINI_CHECKLIST.map((item) => (
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

      {/* ── 9. FAQ ── */}
      <section className="wdp-faq" aria-labelledby="wdp-faq-heading">
        <div className="container">
          <div className="wdp-section-header text-center">
            <span className="wdp-kicker">Website Development FAQ</span>
            <h2 id="wdp-faq-heading" className="wdp-section-title">
              Questions buyers ask before requesting a quote.
            </h2>
          </div>
          <div className="wdp-faq__list">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`wdp-faq-item${openFaqIndex === i ? ' wdp-faq-item--open' : ''}`}
              >
                <button
                  type="button"
                  className="wdp-faq-item__btn"
                  onClick={() => toggleFaq(i)}
                  aria-expanded={openFaqIndex === i}
                  aria-controls={`faq-body-${i}`}
                  id={`faq-btn-${i}`}
                >
                  <span>{item.question}</span>
                  <span className="wdp-faq-item__chevron" aria-hidden="true">
                    {openFaqIndex === i ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </button>
                <div
                  id={`faq-body-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
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

      {/* ── 10. Promise / Proof Section ── */}
      <section className="wdp-promise" aria-labelledby="wdp-promise-heading">
        <div className="container">
          <div className="wdp-section-header text-center">
            <span className="wdp-kicker wdp-kicker--light">The Carvel Russ promise</span>
            <h2 id="wdp-promise-heading" className="wdp-section-title wdp-section-title--light">
              Conversion-focused development, not decoration.
            </h2>
            <p className="wdp-section-sub wdp-section-sub--light">
              The page's proof system should show why Carvel Russ is qualified to build websites
              that support growth and sales conversations.
            </p>
          </div>
          <div className="wdp-promise__grid">
            {CREDENTIALS.map((card, i) => (
              <div key={i} className="wdp-promise-card">
                <div className="wdp-promise-card__title">{card.title}</div>
                <p className="wdp-promise-card__copy">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Carousel ── */}
      <section className="wdp-carousel-section" aria-labelledby="wdp-carousel-heading">
        <div className="container">
          <div className="wdp-section-header">
            <span className="wdp-kicker">Previous Work Style</span>
            <h2 id="wdp-carousel-heading" className="wdp-section-title">
              Example website build outcomes.
            </h2>
            <p className="wdp-section-sub">
              Use this carousel for real Carvel Russ case studies or verified screenshots. The
              current cards are safe placeholders for prototype review.
            </p>
          </div>

          <div className="wdp-carousel" aria-roledescription="carousel" aria-label="Example case studies">
            <div
              className="wdp-carousel__slide"
              aria-roledescription="slide"
              aria-label={`Slide ${carouselIndex + 1} of ${CASE_STUDIES.length}`}
            >
              <div className="wdp-carousel__content">
                <span className="wdp-carousel__tag">{slide.tag}</span>
                <h3 className="wdp-carousel__title">{slide.title}</h3>
                <p className="wdp-carousel__copy">{slide.copy}</p>
                <button type="button" className="wdp-btn wdp-btn--gold" onClick={openModal}>
                  Plan My Website Build
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
                    <div className="wdp-ms-line wdp-ms-line--short" />
                    <div className="wdp-ms-line" />
                  </div>
                </div>
              </div>
            </div>

            <div className="wdp-carousel__controls">
              <button
                type="button"
                className="wdp-carousel__btn"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
              <span
                className="wdp-carousel__counter"
                aria-live="polite"
                aria-atomic="true"
              >
                {carouselIndex + 1} / {CASE_STUDIES.length}
              </span>
              <button
                type="button"
                className="wdp-carousel__btn"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Review Placeholders ── */}
      <section className="wdp-reviews" aria-labelledby="wdp-reviews-heading">
        <div className="container">
          <div className="wdp-section-header text-center">
            <span className="wdp-kicker">Review Proof Placement</span>
            <h2 id="wdp-reviews-heading" className="wdp-section-title">
              Trust belongs before the final form.
            </h2>
            <p className="wdp-section-sub">
              Replace these placeholders with verified client reviews or real project proof before
              publishing.
            </p>
          </div>
          <div className="wdp-reviews__grid">
            {REVIEWS.map((review, i) => (
              <figure
                key={i}
                className="wdp-review-card"
                aria-label="Placeholder review — not a real client review"
              >
                <div className="wdp-review-card__stars" aria-label={`${review.stars} out of 5 stars`}>
                  {'★'.repeat(review.stars)}
                </div>
                <blockquote className="wdp-review-card__quote">
                  <p>"{review.quote}"</p>
                </blockquote>
                <figcaption className="wdp-review-card__name">— {review.name}</figcaption>
                <span className="wdp-review-card__placeholder-badge">
                  Placeholder — replace before publishing
                </span>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. Service Area ── */}
      <section className="wdp-area" aria-labelledby="wdp-area-heading">
        <div className="container">
          <div className="wdp-area__layout">
            <div className="wdp-area__left">
              <span className="wdp-kicker">Service Area</span>
              <h2 id="wdp-area-heading" className="wdp-section-title">
                Website development for growth-focused teams worldwide.
              </h2>
              <p className="wdp-area__copy">
                Carvel Russ's remote-first approach means businesses anywhere can get a sharper
                digital storefront built around clarity, trust, and conversion.
              </p>
              <div className="wdp-area__chips">
                {AREA_CHIPS.map((chip) => (
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

      {/* ── 14. Final Quote Section ── */}
      <section className="wdp-final-quote" aria-labelledby="wdp-final-heading">
        <div className="container">
          <div className="wdp-final-quote__layout">

            <div className="wdp-final-quote__left">
              <span className="wdp-kicker wdp-kicker--light">
                Bad website friction costs real opportunities
              </span>
              <h2 id="wdp-final-heading" className="wdp-section-title wdp-section-title--light">
                Get a website quote from Carvel Russ.
              </h2>
              <p className="wdp-final-quote__copy">
                A focused Website Development page should end exactly how it began: one service,
                one outcome, one quote request.
              </p>
              <ul className="wdp-checklist wdp-checklist--light">
                {FINAL_CHECKLIST.map((item) => (
                  <li key={item} className="wdp-checklist__item">
                    <FiCheck className="wdp-checklist__icon" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="wdp-final-quote__right">
              <div className="wdp-final-form-card">
                <h3 className="wdp-final-form-card__title">Request your free website quote</h3>
                <p className="wdp-final-form-card__copy">
                  Fill out the form and I'll review the best path for your website build.
                </p>
                <QuoteForm variant="final" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 15. Footer ── */}
      <footer className="wdp-footer">
        <div className="container">
          <div className="wdp-footer__inner">
            <p className="wdp-footer__left">
              Carvel Russ — Website Development Landing Page Prototype
            </p>
            <p className="wdp-footer__right">
              <a href="mailto:hello@carvelruss.com">hello@carvelruss.com</a> · Based Worldwide
            </p>
          </div>
        </div>
      </footer>

      {/* ── 16. Modal ── */}
      <QuoteModal isOpen={isModalOpen} onClose={closeModal} />

      {/* ── 17. Sticky Mobile CTA ── */}
      <div className="wdp-sticky-cta" aria-label="Quick actions">
        <button
          type="button"
          className="wdp-sticky-cta__btn wdp-sticky-cta__btn--primary"
          onClick={openModal}
        >
          Free Quote
        </button>
        <a
          href="mailto:hello@carvelruss.com"
          className="wdp-sticky-cta__btn wdp-sticky-cta__btn--call"
        >
          <FiMail aria-hidden="true" size={16} /> Email
        </a>
      </div>

    </div>
  );
}
