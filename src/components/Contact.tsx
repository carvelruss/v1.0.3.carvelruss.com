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
  '$500–$1,000',
  '$1,000–$3,000',
  '$3,000–$5,000',
  '$5,000+',
];

const TIMELINES = [
  'ASAP',
  '1–2 weeks',
  '2–4 weeks',
  '1–2 months',
  'Flexible',
];

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA';

export default function Contact() {
  const formRef      = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | null>(null);

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [subject,     setSubject]     = useState('');
  const [projectType, setProjectType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline,    setTimeline]    = useState('');
  const [message,     setMessage]     = useState('');
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [globalError, setGlobalError] = useState('');

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
    const nameVal    = (fd.get('name')    as string)?.trim();
    const emailVal   = (fd.get('email')   as string)?.trim();
    const messageVal = (fd.get('message') as string)?.trim();

    if (!nameVal)    errs.name    = 'Your name is required.';
    if (!emailVal)   errs.email   = 'Your email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) errs.email = 'Please enter a valid email.';
    if (!messageVal) errs.message = 'Please write a message.';
    else if (messageVal.length < 10) errs.message = 'Message must be at least 10 characters.';

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
      setGlobalError('Please complete the spam check first.');
      return;
    }

    setGlobalError('');
    setLoading(true);

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
        setSubmitted(true);
        formRef.current?.reset();
        setName(''); setEmail(''); setSubject('');
        setProjectType(''); setBudgetRange(''); setTimeline(''); setMessage('');
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      } else {
        setGlobalError(data.error ?? 'Something went wrong. Please try again.');
        if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
      }
    } catch {
      setGlobalError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pf-contact-success">
        <div className="pf-contact-success__icon" aria-hidden="true">✓</div>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
        <button
          className="ws-btn-primary"
          style={{ marginTop: '1.5rem' }}
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div role="alert" className="pf-form-error" style={{ marginBottom: '1rem' }}>{globalError}</div>
      )}

      {/* Name + Email row */}
      <div className="pf-form-row">
        <div className="pf-form-field">
          <label className="pf-form-label" htmlFor="contact-name">
            Full Name <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className="pf-input"
            placeholder="Your full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="name"
            aria-describedby={errors.name ? 'err-name' : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && <span id="err-name" className="pf-form-error" role="alert">{errors.name}</span>}
        </div>

        <div className="pf-form-field">
          <label className="pf-form-label" htmlFor="contact-email">
            Email Address <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="pf-input"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-describedby={errors.email ? 'err-email' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span id="err-email" className="pf-form-error" role="alert">{errors.email}</span>}
        </div>
      </div>

      {/* Subject */}
      <div className="pf-form-field">
        <label className="pf-form-label" htmlFor="contact-subject">Subject</label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          className="pf-input"
          placeholder="What's this about?"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Project Type + Budget row */}
      <div className="pf-form-row">
        <div className="pf-form-field">
          <label className="pf-form-label" htmlFor="contact-project-type">Project Type</label>
          <select
            id="contact-project-type"
            name="project_type"
            className="pf-form-select"
            value={projectType}
            onChange={e => setProjectType(e.target.value)}
          >
            <option value="">Select a type…</option>
            {PROJECT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="pf-form-field">
          <label className="pf-form-label" htmlFor="contact-budget">Budget Range</label>
          <select
            id="contact-budget"
            name="budget_range"
            className="pf-form-select"
            value={budgetRange}
            onChange={e => setBudgetRange(e.target.value)}
          >
            <option value="">Select a budget…</option>
            {BUDGET_RANGES.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="pf-form-field">
        <label className="pf-form-label" htmlFor="contact-timeline">Timeline</label>
        <select
          id="contact-timeline"
          name="timeline"
          className="pf-form-select"
          value={timeline}
          onChange={e => setTimeline(e.target.value)}
        >
          <option value="">Select a timeline…</option>
          {TIMELINES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div className="pf-form-field">
        <label className="pf-form-label" htmlFor="contact-message">
          Message <span aria-hidden="true" style={{ color: '#ef4444' }}>*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="pf-textarea"
          placeholder="Tell me about your project or idea…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
          rows={5}
          aria-describedby={errors.message ? 'err-message' : undefined}
          aria-invalid={!!errors.message}
        />
        {errors.message && <span id="err-message" className="pf-form-error" role="alert">{errors.message}</span>}
      </div>

      <div ref={turnstileRef} aria-label="Spam verification" style={{ marginBottom: '1.25rem' }} />

      <div className="pf-form-submit">
        <button
          type="submit"
          className="ws-btn-primary"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? 'Sending…' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
