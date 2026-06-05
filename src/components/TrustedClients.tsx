import { useRef } from 'react';

const LOGOS = [
  {
    name: 'LogoIpsum A',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <circle cx="14" cy="20" r="10" fill="#c9cfe8"/>
        <circle cx="14" cy="20" r="6" fill="#b0b8d8"/>
        <text x="30" y="25" fontFamily="serif" fontWeight="800" fontSize="14" fill="#b0b8d8" letterSpacing="1">LOGO</text>
        <text x="72" y="25" fontFamily="sans-serif" fontSize="11" fill="#c9cfe8" letterSpacing="2">IPSUM</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum B',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="24" height="24" rx="4" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <path d="M10 20 L16 14 L22 20 L16 26 Z" fill="#c9cfe8"/>
        <text x="34" y="25" fontFamily="sans-serif" fontSize="12" fill="#b0b8d8" letterSpacing="1">logoipsum</text>
        <text x="34" y="14" fontFamily="sans-serif" fontSize="6" fill="#c9cfe8" letterSpacing="3">®</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum C',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="13" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <line x1="20" y1="7" x2="20" y2="33" stroke="#c9cfe8" strokeWidth="2"/>
        <line x1="7" y1="20" x2="33" y2="20" stroke="#c9cfe8" strokeWidth="2"/>
        <text x="40" y="25" fontFamily="sans-serif" fontSize="12" fill="#b0b8d8" letterSpacing="1">logoipsum</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum D',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <rect x="4" y="14" width="4" height="12" fill="#c9cfe8"/>
        <rect x="10" y="10" width="4" height="20" fill="#c9cfe8"/>
        <rect x="16" y="6" width="4" height="28" fill="#c9cfe8"/>
        <rect x="22" y="10" width="4" height="20" fill="#c9cfe8"/>
        <rect x="28" y="14" width="4" height="12" fill="#c9cfe8"/>
        <text x="40" y="25" fontFamily="sans-serif" fontWeight="700" fontSize="11" fill="#b0b8d8" letterSpacing="2">LOGOIPSUM</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum E',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <rect x="4" y="8" width="14" height="14" rx="2" fill="#c9cfe8"/>
        <rect x="20" y="8" width="14" height="14" rx="2" fill="#b0b8d8"/>
        <rect x="4" y="24" width="14" height="8" rx="2" fill="#b0b8d8"/>
        <rect x="20" y="24" width="14" height="8" rx="2" fill="#c9cfe8"/>
        <text x="44" y="25" fontFamily="sans-serif" fontWeight="600" fontSize="12" fill="#b0b8d8" letterSpacing="1">LOGO</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum F',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <path d="M20 8 L32 14 L32 26 L20 32 L8 26 L8 14 Z" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <path d="M20 14 L26 17 L26 23 L20 26 L14 23 L14 17 Z" fill="#c9cfe8" opacity="0.5"/>
        <text x="40" y="25" fontFamily="sans-serif" fontSize="12" fill="#b0b8d8" letterSpacing="1">logoipsum</text>
        <text x="40" y="14" fontFamily="sans-serif" fontSize="6" fill="#c9cfe8" letterSpacing="3">®</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum G',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <circle cx="12" cy="20" r="8" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <circle cx="24" cy="20" r="8" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <text x="38" y="25" fontFamily="sans-serif" fontSize="11" fill="#b0b8d8" letterSpacing="1">logoipsum</text>
      </svg>
    ),
  },
  {
    name: 'LogoIpsum H',
    svg: (
      <svg viewBox="0 0 120 40" fill="none" aria-hidden="true">
        <polygon points="20,8 34,28 6,28" fill="none" stroke="#c9cfe8" strokeWidth="2.5"/>
        <polygon points="20,14 28,26 12,26" fill="#c9cfe8" opacity="0.4"/>
        <text x="42" y="25" fontFamily="sans-serif" fontWeight="700" fontSize="11" fill="#b0b8d8" letterSpacing="2">BRAND</text>
      </svg>
    ),
  },
];

const PrevIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const NextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const CARD_WIDTH = 200;
const GAP = 20;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export default function TrustedClients() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'next' ? SCROLL_AMOUNT * 2 : -SCROLL_AMOUNT * 2, behavior: 'smooth' });
  };

  return (
    <section className="trusted-clients" aria-label="Trusted by awesome clients">
      <div className="container-site">
        <div className="trusted-clients__head">
          <h2 className="trusted-clients__heading">Trusted by Awesome Clients</h2>
          <div className="trusted-clients__nav">
            <button className="trusted-clients__nav-btn" onClick={() => scroll('prev')} aria-label="Previous logos">
              <PrevIcon />
            </button>
            <button className="trusted-clients__nav-btn" onClick={() => scroll('next')} aria-label="Next logos">
              <NextIcon />
            </button>
          </div>
        </div>

        <div className="trusted-clients__track" ref={trackRef}>
          {LOGOS.map(({ name, svg }) => (
            <div key={name} className="trusted-clients__card" aria-label={name}>
              {svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
