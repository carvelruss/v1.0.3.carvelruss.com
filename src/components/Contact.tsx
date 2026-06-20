import { type FormEvent, useEffect, useRef, useState } from 'react';

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
  { icon: '✉',  label: 'Email',    href: 'mailto:hello@carvelruss.com',                      display: 'hello@carvelruss.com'           },
  { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/in/carvelruss',               display: 'linkedin.com/in/carvelruss'      },
  { icon: '⌥',  label: 'GitHub',   href: 'https://github.com/carvelruss',                    display: 'github.com/carvelruss'           },
];

const PROJECT_TYPES = [
  'Website Design',
  'UI/UX Design',
  'Web App Design',
  'Dashboard Design',
  'Design System',
  'Frontend Development',
  'Consultation',
  'Other',
];

const BUDGET_RANGES = [
  'Not sure yet',
  'Below $500',
  '$500 – $1,000',
  '$1,000 – $3,000',
  '$3,000 – $5,000',
  '$5,000+',
];

const TIMELINES = [
  'ASAP',
  '1 – 2 weeks',
  '2 – 4 weeks',
  '1 – 2 months',
  'Flexible',
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export default function Contact() {
  const formRef      = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);
  const [sending, setSending]   = useState(false);
  const [error,   setError]     = useState('');
  const [success, setSuccess]   = useState(false);
  const [errors,  setErrors]    = useState<Record<string, string>>({});

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

  const validate = (fd: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name    = (fd.get('name')    as string)?.trim();
    const email   = (fd.get('email')   as string)?.trim();
    const message = (fd.get('message') as string)?.trim();

    if (!name)    errs.name    = 'Your name is required.';
    if (!email)   errs.email   = 'Your email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email.';
    if (!message) errs.message = 'Please write a message.';
    else if (message.length < 10) errs.message = 'Message must be at least 10 characters.';

    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const fd             = new FormData(formRef.current);
    const validationErrs = validate(fd);
    if (Object.keys(validationErrs).length > 0) { setErrors(validationErrs); return; }
    setErrors({});

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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:          (fd.get('name')         as string)?.trim(),
          email:         (fd.get('email')        as string)?.trim(),
          subject:       (fd.get('subject')      as string)?.trim() || undefined,
          message:       (fd.get('message')      as string)?.trim(),
          project_type:  (fd.get('project_type') as string) || undefined,
          budget_range:  (fd.get('budget_range') as string) || undefined,
          timeline:      (fd.get('timeline')     as string) || undefined,
          turnstileToken,
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        setSuccess(true);
        formRef.current?.reset();
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  if (success) {
    return (
      <div className="ws-contact-grid">
        <div className="ws-contact-info">
          <h3>Let's work together</h3>
          <p>Have a project in mind? I'd love to hear about it.</p>
          <nav className="ws-contact-links" aria-label="Contact links">
            {CONTACT_LINKS.map(link => (
              <a key={link.label} href={link.href} className="ws-contact-link"
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                aria-label={`${link.label}: ${link.display}`}>
                <span className="ws-contact-link-icon" aria-hidden="true">{link.icon}</span>
                <span>{link.display}</span>
              </a>
            ))}
          </nav>
        </div>
        <div className="ws-contact-form-card ws-contact-form-card--success">
          <div className="ws-contact-success-icon" aria-hidden="true">✓</div>
          <h3>Message Sent!</h3>
          <p>Thanks for reaching out. I'll get back to you within 24–48 hours.</p>
          <button
            className="ws-btn-primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => setSuccess(false)}
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

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

        <div className="ws-contact-availability" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Available for new projects</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="ws-contact-form-card">
        <h3>Send a message</h3>

        {error && (
          <div role="alert" className="ws-contact-error">{error}</div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate>
          {/* Name + Email row */}
          <div className="ws-contact-row">
            <div className="ws-contact-field">
              <label htmlFor="contact-name">
                Name <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="contact-name" name="name" type="text"
                placeholder="Your full name"
                required autoComplete="name"
                aria-describedby={errors.name ? 'err-name' : undefined}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span id="err-name" className="ws-field-error" role="alert">{errors.name}</span>}
            </div>

            <div className="ws-contact-field">
              <label htmlFor="contact-email">
                Email <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="contact-email" name="email" type="email"
                placeholder="you@example.com"
                required autoComplete="email"
                aria-describedby={errors.email ? 'err-email' : undefined}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span id="err-email" className="ws-field-error" role="alert">{errors.email}</span>}
            </div>
          </div>

          {/* Subject */}
          <div className="ws-contact-field">
            <label htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject" name="subject" type="text"
              placeholder="What's this about?"
              autoComplete="off"
            />
          </div>

          {/* Project Type + Budget row */}
          <div className="ws-contact-row">
            <div className="ws-contact-field">
              <label htmlFor="contact-project-type">Project Type</label>
              <select id="contact-project-type" name="project_type" defaultValue="">
                <option value="">Select a type…</option>
                {PROJECT_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="ws-contact-field">
              <label htmlFor="contact-budget">Budget Range</label>
              <select id="contact-budget" name="budget_range" defaultValue="">
                <option value="">Select a budget…</option>
                {BUDGET_RANGES.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="ws-contact-field">
            <label htmlFor="contact-timeline">Timeline</label>
            <select id="contact-timeline" name="timeline" defaultValue="">
              <option value="">Select a timeline…</option>
              {TIMELINES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div className="ws-contact-field">
            <label htmlFor="contact-message">
              Message <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              id="contact-message" name="message"
              placeholder="Tell me about your project or idea…"
              required
              rows={5}
              aria-describedby={errors.message ? 'err-message' : undefined}
              aria-invalid={!!errors.message}
            />
            {errors.message && <span id="err-message" className="ws-field-error" role="alert">{errors.message}</span>}
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
