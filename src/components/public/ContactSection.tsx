import { FiMail, FiLinkedin, FiGithub, FiTwitter } from 'react-icons/fi';
import Contact from '../Contact';
import '../../styles/contact-section.css';

/* ── Data ─────────────────────────────────────────────────────── */

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Submit the form',
    desc:  'Tell me about your project, goals, and timeline.',
  },
  {
    step: '02',
    title: 'I review your project',
    desc:  "I'll carefully read your message and consider your requirements.",
  },
  {
    step: '03',
    title: 'You hear back from me',
    desc:  "Expect a reply within 24 hours with my thoughts and next steps.",
  },
];

/* ── Component ────────────────────────────────────────────────── */

export default function ContactSection() {
  return (
    <section className="cts" aria-labelledby="cts-form-title">
      <div className="container cts__container">
        <div className="cts__grid">

          {/* ── Left: Contact form card ── */}
          <div className="cts__form-card">
            <div className="cts__form-header">
              <h2 id="cts-form-title" className="cts__form-title">Send a Message</h2>
              <p className="cts__form-subtitle">
                Fill in the details below and I'll respond as soon as possible.
              </p>
            </div>
            <Contact />
          </div>

          {/* ── Right: Sidebar ── */}
          <aside className="cts__sidebar">

            {/* Contact info card */}
            <div className="cts-info-card">
              <h3 className="cts-info-card__title">Contact Information</h3>
              <p className="cts-info-card__sub">
                Reach out directly or use the form to the left.
              </p>

              <div className="cts-detail">
                <div className="cts-detail__icon-wrap">
                  <FiMail size={15} aria-hidden />
                </div>
                <div>
                  <div className="cts-detail__label">Email</div>
                  <a
                    href="mailto:hello@carvelruss.com"
                    className="cts-detail__value cts-detail__value--link"
                  >
                    hello@carvelruss.com
                  </a>
                </div>
              </div>

              <div className="cts-detail">
                <div className="cts-detail__icon-wrap cts-detail__icon-wrap--avail">
                  <span className="cts-detail__avail-dot" aria-hidden="true" />
                </div>
                <div>
                  <div className="cts-detail__label">Availability</div>
                  <div className="cts-detail__value">Available for projects</div>
                </div>
              </div>

              <div className="cts-info-card__divider" />

              <p className="cts-social-label">Find me online</p>
              <div className="cts-social-row">
                <a
                  href="https://linkedin.com/in/carvelruss"
                  className="cts-social-btn"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiLinkedin size={17} aria-hidden />
                </a>
                <a
                  href="https://github.com/carvelruss"
                  className="cts-social-btn"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiGithub size={17} aria-hidden />
                </a>
                <a
                  href="#"
                  className="cts-social-btn"
                  aria-label="X / Twitter"
                >
                  <FiTwitter size={17} aria-hidden />
                </a>
              </div>
            </div>

            {/* Process card */}
            <div className="cts-process-card">
              <h3 className="cts-process-card__title">What happens next?</h3>
              <div className="cts-process-steps">
                {PROCESS_STEPS.map(({ step, title, desc }) => (
                  <div key={step} className="cts-step">
                    <div className="cts-step__num" aria-hidden="true">{step}</div>
                    <div>
                      <div className="cts-step__title">{title}</div>
                      <p className="cts-step__desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </section>
  );
}
