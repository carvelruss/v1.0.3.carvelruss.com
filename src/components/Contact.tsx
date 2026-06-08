import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    turnstile?: {
      render:      (container: HTMLElement, opts: Record<string, unknown>) => string;
      reset:       (widgetId: string) => void;
      remove:      (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
  }
}

const CONTACT_LINKS = [
  { icon: '✉',  label: 'Email',    href: 'mailto:hello@yourname.com',        display: 'hello@yourname.com'         },
  { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/in/yourname', display: 'linkedin.com/in/yourname'   },
  { icon: '⌥',  label: 'GitHub',  href: 'https://github.com/yourname',      display: 'github.com/yourname'        },
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export default function Contact() {
  const formRef      = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);
  const navigate     = useNavigate();
  const [sending, setSending] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const mount = () => {
      if (!turnstileRef.current || !window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
      });
    };

    if (window.turnstile) {
      mount();
    } else {
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

    const fd             = new FormData(formRef.current);
    const name           = (fd.get('name')    as string)?.trim();
    const email          = (fd.get('email')   as string)?.trim();
    const message        = (fd.get('message') as string)?.trim();
    const turnstileToken = widgetIdRef.current && window.turnstile
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
    <div className="ws-contact-grid">

      {/* Info panel */}
      <div className="ws-contact-info">
        <h3>Let's work together</h3>
        <p>
          Have a project in mind? I'd love to hear about it. Send me a message and
          I'll get back to you within 24–48 hours.
        </p>
        <nav className="ws-contact-links" aria-label="Contact links">
          {CONTACT_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="ws-contact-link"
              target={link.href.startsWith('mailto') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              aria-label={`${link.label}: ${link.display}`}
            >
              <span className="ws-contact-link-icon" aria-hidden="true">{link.icon}</span>
              <span>{link.display}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Form panel */}
      <div className="ws-contact-form-card">
        <h3>Send a message</h3>

        {error && (
          <div role="alert" className="ws-contact-error">{error}</div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          <div className="ws-contact-field">
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" name="name" type="text" placeholder="Your name" required autoComplete="name" />
          </div>

          <div className="ws-contact-field">
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
          </div>

          <div className="ws-contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" placeholder="Tell me about your project…" required />
          </div>

          <div ref={turnstileRef} aria-label="Spam verification" style={{ marginBottom: '1.25rem' }} />

          <button
            type="submit"
            className="ws-btn-primary"
            disabled={sending}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {sending ? 'Sending…' : 'Send Message →'}
          </button>

          <p className="ws-contact-note">Protected by Cloudflare Turnstile · No spam bots</p>
        </form>
      </div>

    </div>
  );
}
