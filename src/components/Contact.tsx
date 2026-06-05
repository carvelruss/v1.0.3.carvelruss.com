import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

const CONTACT_LINKS = [
  { icon: '✉', label: 'Email',    href: 'mailto:hello@yourname.com',              display: 'hello@yourname.com' },
  { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/in/yourname',       display: 'linkedin.com/in/yourname' },
  { icon: '⌥',  label: 'GitHub',  href: 'https://github.com/yourname',            display: 'github.com/yourname' },
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export default function Contact() {
  const formRef        = useRef<HTMLFormElement>(null);
  const turnstileRef   = useRef<HTMLDivElement>(null);
  const widgetIdRef    = useRef<string | null>(null);
  const navigate       = useNavigate();
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');

  // Render Turnstile after the component mounts (React SPA — script already loaded)
  useEffect(() => {
    const mount = () => {
      if (!turnstileRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return; // already rendered
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
      });
    };

    // If turnstile is already available, render immediately
    if (window.turnstile) {
      mount();
    } else {
      // Otherwise wait for the script to load
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile"]',
      );
      script?.addEventListener('load', mount);
      return () => script?.removeEventListener('load', mount);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const fd      = new FormData(formRef.current);
    const name    = (fd.get('name')    as string)?.trim();
    const email   = (fd.get('email')   as string)?.trim();
    const message = (fd.get('message') as string)?.trim();
    const turnstileToken =
      widgetIdRef.current && window.turnstile
        ? (window.turnstile.getResponse(widgetIdRef.current) ?? '')
        : '';

    if (!turnstileToken) {
      setError('Please complete the spam check first.');
      return;
    }

    setError('');
    setSending(true);

    try {
      const res  = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, turnstileToken }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        navigate('/thank-you');
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="section" aria-label="Contact">
      <div className="container-site">
        <h2 className="section__title">Contact</h2>

        <div className="contact__grid">
          {/* ── Info card ── */}
          <div className="contact__info-card card">
            <h3 className="contact__info-title">Let's work together</h3>
            <p className="contact__info-text">
              Have a project in mind? I'd love to hear about it. Send me a message and I'll get back to you within 24–48 hours.
            </p>

            <nav className="contact__links" aria-label="Contact links">
              {CONTACT_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="contact__link"
                  target={link.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  aria-label={`${link.label}: ${link.display}`}
                >
                  <span className="contact__link-icon" aria-hidden="true">{link.icon}</span>
                  <span>{link.display}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* ── Form card ── */}
          <div className="contact__form-card card">
            <h3 className="contact__form-title">Send a message</h3>

            {error && (
              <div role="alert" className="contact__error">
                {error}
              </div>
            )}

            <form className="contact__form" ref={formRef} onSubmit={handleSubmit} noValidate>
              <div className="contact__field">
                <label htmlFor="contact-name">Name</label>
                <input id="contact-name" name="name" type="text" placeholder="Your name" required autoComplete="name" />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-email">Email</label>
                <input id="contact-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-message">Message</label>
                <textarea id="contact-message" name="message" placeholder="Tell me about your project…" required />
              </div>

              <div ref={turnstileRef} aria-label="Spam verification" />

              <button type="submit" className="btn-primary-custom" disabled={sending} style={{ width: '100%', justifyContent: 'center' }}>
                {sending ? 'Sending…' : 'Send Message →'}
              </button>

              <p className="contact__form-note">
                Protected by Cloudflare Turnstile · No spam bots
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
