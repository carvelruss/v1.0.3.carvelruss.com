import { useNavigate } from 'react-router-dom';

interface CTABannerProps {
  heading?: string;
  subtext?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function CTABanner({
  heading = "Let's Build Something Great",
  subtext = "Open to freelance projects, full-time roles, and creative collaborations.",
  primaryLabel = "Get in Touch",
  primaryHref = "/#contact",
  secondaryLabel = "View Case Studies",
  secondaryHref = "/case-studies",
}: CTABannerProps) {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    if (href.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const id = href.slice(2);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(href);
    }
  };

  return (
    <section className="cta-banner" aria-label="Call to action">
      <div className="cta-banner__blob" aria-hidden="true" />
      <div className="cta-banner__blob cta-banner__blob--2" aria-hidden="true" />
      <div className="container-site" style={{ position: 'relative', zIndex: 1 }}>
        <p className="cta-banner__eyebrow">Available for work</p>
        <h2 className="cta-banner__heading">{heading}</h2>
        <p className="cta-banner__sub">{subtext}</p>
        <div className="cta-banner__actions">
          <button className="btn-white" onClick={() => handleClick(primaryHref)}>
            {primaryLabel} →
          </button>
          <button className="btn-outline-white" onClick={() => handleClick(secondaryHref)}>
            {secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
