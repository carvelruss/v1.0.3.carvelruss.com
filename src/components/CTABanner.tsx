import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/track';

interface CTABannerProps {
  heading?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTABanner({
  heading      = "Let's Build Something Great",
  subtext      = 'Open to freelance projects, full-time roles, and creative collaborations.',
  primaryLabel = 'Get in Touch',
  primaryHref  = '/contact',
  secondaryLabel = 'View Case Studies',
  secondaryHref  = '/case-studies',
}: CTABannerProps) {
  const navigate = useNavigate();

  const go = (href: string) => {
    if (href.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(href);
    }
  };

  return (
    <section className="ws-cta-banner" aria-label="Call to action">
      <span className="ws-cta-banner__eyebrow">Available for work</span>
      <h2 className="ws-cta-banner__heading">{heading}</h2>
      <p className="ws-cta-banner__sub">{subtext}</p>
      <div className="ws-cta-banner__actions">
        <button className="ws-cta-btn-white"
          onClick={() => { trackEvent('cta_click', 'cta_banner_primary'); go(primaryHref); }}>
          {primaryLabel} →
        </button>
        <button className="ws-cta-btn-outline"
          onClick={() => { trackEvent('cta_click', 'cta_banner_secondary'); go(secondaryHref); }}>
          {secondaryLabel}
        </button>
      </div>
    </section>
  );
}
