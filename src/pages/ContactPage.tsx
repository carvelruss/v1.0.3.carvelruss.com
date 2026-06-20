import { useEffect } from 'react';
import Contact from '../components/Contact';

export default function ContactPage() {
  useEffect(() => { document.title = 'Contact | Carvel Russ'; }, []);

  return (
    <>
      <section className="pf-page-hero">
        <div className="container">
          <h1 className="pf-page-hero__title">Let's Work Together</h1>
          <p className="pf-page-hero__sub">
            Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you soon.
          </p>
        </div>
      </section>

      <section className="pf-section pf-section--sm">
        <div className="container">
          <div className="pf-contact-layout">
            <Contact />

            <div className="pf-contact-info">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '.5rem' }}>
                Contact Information
              </h3>
              <p style={{ color: 'var(--pf-muted)', fontSize: '.9375rem', marginBottom: '1.5rem' }}>
                Fill out the form and I will get back to you within 24 hours.
              </p>

              <div className="pf-contact-detail">
                <span className="pf-contact-detail__icon">✉</span>
                <div>
                  <div style={{ fontSize: '.75rem', color: 'var(--pf-muted)', fontWeight: 500 }}>Email</div>
                  <a
                    href="mailto:hello@carvelruss.com"
                    style={{ color: 'var(--pf-text)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    hello@carvelruss.com
                  </a>
                </div>
              </div>

              <div className="pf-contact-detail">
                <span className="pf-contact-detail__icon">🌐</span>
                <div>
                  <div style={{ fontSize: '.75rem', color: 'var(--pf-muted)', fontWeight: 500 }}>Availability</div>
                  <span style={{ color: 'var(--pf-text)', fontWeight: 600 }}>Available for projects</span>
                </div>
              </div>

              <div className="pf-social-row">
                <a
                  href="https://linkedin.com/in/carvelruss"
                  className="pf-social-btn"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  in
                </a>
                <a
                  href="#"
                  className="pf-social-btn"
                  aria-label="Twitter"
                >
                  𝕏
                </a>
                <a
                  href="https://github.com/carvelruss"
                  className="pf-social-btn"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⌥
                </a>
              </div>

              <div className="pf-response-card">
                <span className="pf-response-card__icon">⚡</span>
                <div>
                  <div className="pf-response-card__title">Quick Response</div>
                  <p className="pf-response-card__text">I usually reply within 24 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
