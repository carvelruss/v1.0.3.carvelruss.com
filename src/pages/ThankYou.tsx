import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Thank You | devfolio';

    // ── Conversion tracking ────────────────────────────────────────────────────
    // Uncomment and replace with your tracking IDs:
    //
    // Google Analytics 4:
    // if (typeof window !== 'undefined' && (window as any).gtag) {
    //   (window as any).gtag('event', 'conversion', { event_category: 'contact', event_label: 'form_submission' });
    // }
    //
    // Meta Pixel:
    // if (typeof window !== 'undefined' && (window as any).fbq) {
    //   (window as any).fbq('track', 'Lead');
    // }
  }, []);

  return (
    <main className="thankyou-page" aria-label="Thank you page">
      <div className="thankyou-page__bg" aria-hidden="true" />

      <div className="thankyou-page__card">
        {/* ── Animated checkmark ── */}
        <div className="thankyou-check" aria-hidden="true">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="thankyou-check__circle" cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="2.5" />
            <path className="thankyou-check__tick" d="M14 26L22 34L38 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="thankyou-page__heading">Thank you!</h1>
        <p className="thankyou-page__sub">
          Your message has been received. I'll review it and get back to you within <strong>24–48 hours</strong>.
        </p>

        <div className="thankyou-page__steps">
          <div className="thankyou-step">
            <span className="thankyou-step__num">01</span>
            <div>
              <strong>Message received</strong>
              <p>Your inquiry is in my inbox.</p>
            </div>
          </div>
          <div className="thankyou-step">
            <span className="thankyou-step__num">02</span>
            <div>
              <strong>I'll review &amp; respond</strong>
              <p>Expect a reply within 24–48 hours.</p>
            </div>
          </div>
          <div className="thankyou-step">
            <span className="thankyou-step__num">03</span>
            <div>
              <strong>We get to work</strong>
              <p>Let's build something great together.</p>
            </div>
          </div>
        </div>

        <div className="thankyou-page__actions">
          <button className="btn-primary-custom" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
          <button className="btn-outline-custom" onClick={() => navigate('/case-studies')}>
            View Case Studies
          </button>
        </div>
      </div>
    </main>
  );
}
