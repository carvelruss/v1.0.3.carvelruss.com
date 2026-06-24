import { Link } from 'react-router-dom';
import { FiLinkedin, FiGithub } from 'react-icons/fi';
import { SiBehance, SiDribbble } from 'react-icons/si';
import '../../styles/footer.css';

/* ── Data ────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Home',          to: '/'             },
  { label: 'Case Studies',  to: '/case-studies' },
  { label: 'Blogs',         to: '/blogs'        },
  { label: 'Skills',        to: '/skills'       },
  { label: 'Contact',       to: '/contact'      },
] as const;

const EXPERTISE_ITEMS = [
  'UI Design',
  'UX Research',
  'Wireframing',
  'Prototyping',
  'Design Systems',
  'Frontend Development',
] as const;

const SOCIAL_LINKS = [
  { label: 'LinkedIn', icon: FiLinkedin,  href: '#' },
  { label: 'Behance',  icon: SiBehance,   href: '#' },
  { label: 'Dribbble', icon: SiDribbble,  href: '#' },
  { label: 'GitHub',   icon: FiGithub,    href: '#' },
] as const;

/* ── Component ───────────────────────────────────────────────── */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="container">
        <div className="footer-card">

          {/* ── Main Grid ── */}
          <div className="footer-main">

            {/* Brand column */}
            <div className="footer-brand">
              <Link to="/" className="footer-logo-wrap" aria-label="Carvel Russ – Home">
                <img
                  src="/logos/carvelruss-logo.png"
                  alt="Carvel Russ"
                  className="footer-logo-img"
                />
              </Link>

              <div className="footer-brand-text">
                <p className="footer-description">
                  Designing clean, strategic, and user-centered digital experiences
                  for modern brands, websites, and digital products.
                </p>

                <Link to="/contact" className="footer-cta">
                  Let's Work Together
                  <span className="footer-cta-arrow" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* Navigation column */}
            <div className="footer-column">
              <h3 className="footer-column-title">Navigation</h3>
              <ul className="footer-links" role="list">
                {NAV_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to} className="footer-link">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expertise column */}
            <div className="footer-column">
              <h3 className="footer-column-title">Expertise</h3>
              <ul className="footer-expertise-list" role="list">
                {EXPERTISE_ITEMS.map(item => (
                  <li key={item} className="footer-expertise-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div className="footer-column">
              <h3 className="footer-column-title">Contact</h3>

              <ul className="footer-contact-list" role="list">
                <li className="footer-contact-item">
                  <a
                    href="mailto:hello@carvelruss.com"
                    className="footer-contact-link"
                  >
                    hello@carvelruss.com
                  </a>
                </li>
                <li className="footer-contact-item">
                  Available for freelance projects
                </li>
                <li className="footer-contact-item">
                  Based Worldwide
                </li>
              </ul>

              <ul className="footer-socials" aria-label="Social media links">
                {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="footer-social-link"
                      aria-label={label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>{/* end .footer-main */}

          {/* ── Divider ── */}
          <div className="footer-divider" aria-hidden="true" />

          {/* ── Bottom Bar ── */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {year} Carvel Russ. All rights reserved.
            </p>
            <p className="footer-built-with">
              Built with React, TypeScript &amp; Cloudflare Pages.
            </p>
          </div>

        </div>{/* end .footer-card */}
      </div>
    </footer>
  );
}
