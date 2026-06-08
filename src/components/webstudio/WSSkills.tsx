import { useRef } from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

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
  },
];

const CARD_BG = '#f1f5f9';

export default function WSSkills() {
  const trackRef = useRef<HTMLDivElement>(null);

  function slide(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.ws-skill-cc');
    if (!card) return;
    const step = card.offsetWidth + 24;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section id="ws-skills" className="ws-section" style={{ background: '#fff', overflow: 'hidden' }}>
      <div className="container">

        {/* Header row */}
        <div
          className="d-flex align-items-center justify-content-between mb-4"
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

      {/* Full-bleed scrollable track (no container clipping) */}
      <div style={{ paddingLeft: 'max(1rem, calc((100vw - 1320px) / 2 + 12px))' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            paddingBottom: '4px',
            paddingRight: '1.5rem',
          }}
          // hide webkit scrollbar via className
          className="ws-skills-track"
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              className="ws-skill-cc"
              style={{
                flex: '0 0 clamp(240px, 28vw, 340px)',
                scrollSnapAlign: 'start',
                background: card.type === 'icon' ? card.bg : CARD_BG,
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
              {card.type === 'quote' ? (
                <>
                  <p
                    style={{
                      fontStyle: 'italic',
                      fontSize: '.9375rem',
                      color: '#475569',
                      lineHeight: 1.7,
                      textAlign: 'center',
                      margin: 0,
                    }}
                  >
                    {card.quote}
                  </p>
                  <span style={card.companyStyle}>{card.company}</span>
                </>
              ) : (
                <div style={{ fontSize: '4rem', lineHeight: 1 }} aria-label={card.name}>
                  {card.emoji}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
