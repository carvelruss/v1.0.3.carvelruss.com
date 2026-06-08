import { useRef, useEffect, type MouseEvent as RMouseEvent } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { SiPython, SiFigma, SiBootstrap, SiCss } from 'react-icons/si';

type QuoteCard = {
  type: 'quote';
  quote: string;
  company: string;
  companyStyle: React.CSSProperties;
};
type IconCard = {
  type: 'icon';
  name: string;
  emoji: string;
  bg: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor: string;
  description: string;
};
type Card = QuoteCard | IconCard;

const CARDS: Card[] = [
  {
    type: 'quote',
    quote:
      '"Their Figma prototypes saved us weeks of back-and-forth. The design system handed off to dev was impeccably organized and production-ready."',
    company: '///ALPINE',
    companyStyle: {
      fontWeight: 800,
      fontSize: '.8125rem',
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: '#1e293b',
    },
  },
  {
    type: 'icon',
    name: 'Python',
    emoji: '🐍',
    bg: '#f0fdf4',
    Icon: SiPython,
    iconColor: '#3776ab',
    description:
      'Python is a programming language that lets you work quickly and integrate systems more effectively.',
  },
  {
    type: 'quote',
    quote:
      '"The Python API they built handles over 100k requests daily without a hiccup. Performance was a top priority and they delivered every time."',
    company: 'Deloitte.',
    companyStyle: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 900,
      fontSize: '1.375rem',
      color: '#0a1628',
      letterSpacing: '-.01em',
    },
  },
  {
    type: 'icon',
    name: 'Figma',
    emoji: '🎨',
    bg: '#fff7ed',
    Icon: SiFigma,
    iconColor: '#f24e1e',
    description:
      'Figma is a collaborative interface design tool used to create and prototype UI/UX designs in real time.',
  },
  {
    type: 'quote',
    quote:
      '"Every hover state, every transition felt intentional and polished. The attention to CSS detail was remarkable throughout the project."',
    company: 'FinTech Labs',
    companyStyle: {
      fontWeight: 700,
      fontSize: '.875rem',
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: '#334155',
    },
  },
  {
    type: 'icon',
    name: 'Bootstrap',
    emoji: '⚡',
    bg: '#f5f3ff',
    Icon: SiBootstrap,
    iconColor: '#7952b3',
    description:
      "Bootstrap is the world's most popular CSS framework for responsive, mobile-first web development.",
  },
  {
    type: 'quote',
    quote:
      '"They built our entire admin interface in 3 weeks — responsive, accessible, and perfectly on-brand. Remarkable execution from start to finish."',
    company: 'SaaS Platform X',
    companyStyle: {
      fontWeight: 700,
      fontSize: '.875rem',
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: '#334155',
    },
  },
  {
    type: 'icon',
    name: 'CSS3',
    emoji: '🌊',
    bg: '#eff6ff',
    Icon: SiCss,
    iconColor: '#264de4',
    description:
      'CSS3 powers modern layouts, animations, and responsive designs with custom properties and flexbox.',
  },
];

const CARD_BG = '#f1f5f9';

export default function WSSkills() {
  const trackRef   = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const scrollLeft = useRef(0);
  const velocity   = useRef(0);
  const lastX      = useRef(0);
  const rafId      = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  function slide(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.ws-skill-cc');
    if (!card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: 'smooth' });
  }

  function onMouseDown(e: RMouseEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    cancelAnimationFrame(rafId.current);
    isDragging.current     = true;
    startX.current         = e.pageX - track.offsetLeft;
    scrollLeft.current     = track.scrollLeft;
    lastX.current          = e.pageX;
    velocity.current       = 0;
    track.style.cursor          = 'grabbing';
    track.style.userSelect      = 'none';
    track.style.scrollSnapType  = 'none';   // disable snap while dragging
  }

  function onMouseMove(e: RMouseEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!isDragging.current || !track) return;
    e.preventDefault();
    velocity.current  = e.pageX - lastX.current;
    lastX.current     = e.pageX;
    const walk = (e.pageX - track.offsetLeft) - startX.current;
    track.scrollLeft  = scrollLeft.current - walk;
  }

  function stopDrag() {
    const track = trackRef.current;
    if (!track || !isDragging.current) return;
    isDragging.current     = false;
    track.style.cursor     = 'grab';
    track.style.userSelect = '';
    momentum(velocity.current);
  }

  function momentum(v: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = () => {
      v *= 0.88;                          // friction — tune lower = more glide
      if (Math.abs(v) < 0.5) {
        track.style.scrollSnapType = '';  // restore snap once settled
        return;
      }
      track.scrollLeft -= v;
      rafId.current = requestAnimationFrame(step);
    };
    rafId.current = requestAnimationFrame(step);
  }

  return (
    <section id="ws-skills" className="ws-section" style={{ background: '#fff', overflow: 'hidden' }}>
      <div className="container">

        {/* Header row */}
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ marginBottom: '2rem' }}
        >
          <h2 className="section-title" style={{ marginBottom: 0 }}>Our skills</h2>

          {/* Arrow buttons */}
          <div className="d-flex gap-2">
            {[
              { dir: -1 as const, icon: <FiArrowLeft size={16} />, label: 'Previous' },
              { dir:  1 as const, icon: <FiArrowRight size={16} />, label: 'Next' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => slide(btn.dir)}
                aria-label={btn.label}
                style={{
                  width: 40, height: 40,
                  borderRadius: '50%',
                  border: '1.5px solid var(--ws-border)',
                  background: '#fff',
                  color: 'var(--ws-charcoal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'border-color .2s, background .2s, color .2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--ws-violet)';
                  el.style.background  = 'var(--ws-violet)';
                  el.style.color       = '#fff';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.borderColor = 'var(--ws-border)';
                  el.style.background  = '#fff';
                  el.style.color       = 'var(--ws-charcoal)';
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Full-bleed scrollable track */}
      <div style={{ paddingLeft: 'max(1rem, calc((100vw - 1320px) / 2 + 12px))' }}>
        <div
          ref={trackRef}
          className="ws-skills-track"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            paddingBottom: '4px',
            paddingRight: '1.5rem',
            cursor: 'grab',
          }}
        >
          {CARDS.map((card, i) =>
            card.type === 'icon' ? (
              /* ── Flip card ── */
              <div
                key={i}
                className="ws-skill-cc ws-flip-card"
                style={{
                  flex: '0 0 clamp(240px, 28vw, 340px)',
                  scrollSnapAlign: 'start',
                  minHeight: '280px',
                  background: card.bg,
                  borderRadius: '1.125rem',
                  position: 'relative',
                }}
                tabIndex={0}
              >
                <div className="ws-flip-inner">
                  {/* Front */}
                  <div className="ws-flip-face ws-flip-front">
                    <div style={{ fontSize: '4rem', lineHeight: 1 }} aria-hidden="true">
                      {card.emoji}
                    </div>
                  </div>

                  {/* Back */}
                  <div className="ws-flip-face ws-flip-back">
                    <card.Icon size={56} color={card.iconColor} aria-hidden="true" />
                    <p style={{
                      fontSize: '.875rem',
                      color: '#475569',
                      lineHeight: 1.65,
                      textAlign: 'center',
                      margin: 0,
                    }}>
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Quote card (no flip) ── */
              <div
                key={i}
                className="ws-skill-cc"
                style={{
                  flex: '0 0 clamp(240px, 28vw, 340px)',
                  scrollSnapAlign: 'start',
                  background: CARD_BG,
                  borderRadius: '1.125rem',
                  padding: '2.25rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '280px',
                  gap: '1.5rem',
                }}
              >
                <p style={{
                  fontStyle: 'italic',
                  fontSize: '.9375rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {card.quote}
                </p>
                <span style={card.companyStyle}>{card.company}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
