import { FiMail, FiZap } from 'react-icons/fi';
import '../../styles/contact-hero.css';

export default function ContactHero() {
  return (
    <section className="cth" aria-label="Contact introduction">
      <div className="container cth__container">
        <div className="cth__inner">

          <span className="cth__eyebrow">Contact</span>

          <h1 className="cth__title">
            Let's Build Something Great Together
          </h1>

          <p className="cth__description">
            Have a project in mind? I'd love to hear about it. Tell me about your goals
            and I'll get back to you within 24 hours.
          </p>

          <div className="cth__info-row" aria-label="Quick contact details">
            <div className="cth__info-item">
              <FiMail size={14} className="cth__info-icon" aria-hidden />
              <a href="mailto:hello@carvelruss.com" className="cth__info-link">
                hello@carvelruss.com
              </a>
            </div>
            <div className="cth__info-sep" aria-hidden="true" />
            <div className="cth__info-item">
              <span className="cth__avail-dot" aria-hidden="true" />
              <span className="cth__info-text">Available for projects</span>
            </div>
            <div className="cth__info-sep" aria-hidden="true" />
            <div className="cth__info-item">
              <FiZap size={14} className="cth__info-icon" aria-hidden />
              <span className="cth__info-text">24h response time</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
