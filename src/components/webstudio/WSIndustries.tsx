import { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';

interface Industry {
  id: string;
  label: string;
  title: string;
  description: string;
  emoji: string;
  accentColor: string;
  accentBg: string;
  stats: { label: string; value: string }[];
}

const INDUSTRIES: Industry[] = [
  {
    id: 'finance',
    label: 'Finance and insurance',
    title: 'Finance & insurance solutions',
    description:
      'We build secure, compliant financial platforms — from trading dashboards to insurance claim portals. Our work meets the highest regulatory standards while delivering outstanding UX that customers actually enjoy using.',
    emoji: '🏦',
    accentColor: 'rgba(0,0,0,.07)',
    accentBg: '#f5f5f7',
    stats: [{ label: 'Projects', value: '40+' }, { label: 'Avg CSAT', value: '4.8★' }],
  },
  {
    id: 'startup',
    label: 'Startup and technology',
    title: 'Startup & technology',
    description:
      'Move fast and ship quality. We partner with startups from MVP to scale, providing development velocity that matches your growth ambitions without sacrificing craft or maintainability.',
    emoji: '🚀',
    accentColor: 'rgba(0,0,0,.07)',
    accentBg: '#f5f5f7',
    stats: [{ label: 'Startups', value: '60+' }, { label: 'Avg launch', value: '6 wk' }],
  },
  {
    id: 'medicine',
    label: 'Medicine and beauty',
    title: 'Medicine & beauty',
    description:
      'Thoughtful digital experiences for healthcare providers, wellness brands, and beauty businesses. We balance aesthetics with accessibility and compliance, including HIPAA where required.',
    emoji: '💊',
    accentColor: 'rgba(0,0,0,.07)',
    accentBg: '#f5f5f7',
    stats: [{ label: 'Clinics served', value: '25+' }, { label: 'WCAG', value: 'AA' }],
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    title: 'E-commerce platforms',
    description:
      'Conversion-optimized storefronts that delight customers and grow revenue. From Shopify customizations to fully bespoke commerce platforms built on a modern, headless stack.',
    emoji: '🛒',
    accentColor: 'rgba(0,0,0,.07)',
    accentBg: '#f5f5f7',
    stats: [{ label: 'Stores built', value: '80+' }, { label: 'Avg CR lift', value: '+34%' }],
  },
];

export default function WSIndustries() {
  const [activeId, setActiveId] = useState<string>(INDUSTRIES[0].id);
  const current = INDUSTRIES.find(i => i.id === activeId) ?? INDUSTRIES[0];

  return (
    <section id="ws-industries" className="ws-section">
      <div className="container">
        {/* Section header */}
        <div className="row justify-content-center mb-5">
          <div className="col-lg-7 text-center">
            <p className="ws-eyebrow">Where we excel</p>
            <h2 className="section-title">Industries we work in</h2>
            <p style={{ color: 'var(--ws-body)', fontSize: '1.0625rem', marginTop: '.75rem', marginBottom: 0 }}>
              Most of our projects come from the industries below
            </p>
          </div>
        </div>

        <div className="row g-4 g-lg-5 align-items-start">
          {/* Left: tab list */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-2" role="tablist" aria-label="Industry tabs">
              {INDUSTRIES.map((ind, i) => (
                <button
                  key={ind.id}
                  role="tab"
                  aria-selected={activeId === ind.id}
                  aria-controls={`ws-industry-panel-${ind.id}`}
                  id={`ws-industry-tab-${ind.id}`}
                  className={`ws-industry-tab${activeId === ind.id ? ' active' : ''}`}
                  onClick={() => setActiveId(ind.id)}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '.75rem',
                        color: activeId === ind.id ? 'var(--ws-navy)' : '#aeaeb2',
                        minWidth: '1.5rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      0{i + 1}
                    </span>
                    <span style={{ fontSize: '.9375rem' }}>{ind.label}</span>
                  </div>
                  {activeId === ind.id && (
                    <FiChevronRight size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: content panel */}
          <div className="col-lg-7">
            <div
              role="tabpanel"
              id={`ws-industry-panel-${current.id}`}
              aria-labelledby={`ws-industry-tab-${current.id}`}
              className="rounded-4xl p-4 p-lg-5"
              style={{
                background: current.accentBg,
                transition: 'background .3s ease',
                minHeight: '360px',
              }}
            >
              {/* Header row */}
              <div className="d-flex align-items-start gap-4 mb-4">
                <div
                  style={{
                    width: 68, height: 68,
                    background: current.accentColor,
                    borderRadius: '1.125rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {current.emoji}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '1.375rem',
                      fontWeight: 700,
                      color: 'var(--ws-navy)',
                      marginBottom: '.625rem',
                    }}
                  >
                    {current.title}
                  </h3>
                  <p
                    style={{
                      color: 'var(--ws-body)',
                      lineHeight: 1.75,
                      fontSize: '.9375rem',
                      marginBottom: 0,
                    }}
                  >
                    {current.description}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="d-flex gap-4 flex-wrap mb-4">
                {current.stats.map(s => (
                  <div
                    key={s.label}
                    style={{
                      background: '#fff',
                      borderRadius: '.875rem',
                      padding: '.75rem 1.25rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1.375rem', color: current.accentColor }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: '.8125rem', color: 'var(--ws-body)', marginTop: '.1rem' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Image placeholder grid */}
              <div className="row g-3">
                {[1, 2, 3].map(n => (
                  <div className="col-4" key={n}>
                    <div
                      className="rounded-3"
                      style={{
                        height: '72px',
                        background: `${current.accentColor}1a`,
                        border: `1.5px solid ${current.accentColor}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        opacity: .7,
                      }}
                      aria-hidden="true"
                    >
                      {['🖼️', '📐', '✨'][n - 1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
