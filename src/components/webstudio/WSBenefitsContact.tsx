import { useState, FormEvent, ReactNode } from 'react';
import { FiGlobe, FiSliders, FiLayers, FiZap, FiCheck, FiArrowRight } from 'react-icons/fi';

interface Benefit {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: <FiGlobe size={20} aria-hidden="true" />,
    iconBg: '#eef2ff',
    iconColor: '#6366f1',
    title: "Time zones ain't no thing",
    description:
      'Async-first communication with daily written updates, flexible meeting windows, and always-on Slack support — wherever you are.',
  },
  {
    icon: <FiSliders size={20} aria-hidden="true" />,
    iconBg: '#f0fdf4',
    iconColor: '#22c55e',
    title: 'Flexible work terms',
    description:
      'Fixed-price projects, hourly retainers, or a dedicated team model — choose the engagement that fits your budget and timeline.',
  },
  {
    icon: <FiLayers size={20} aria-hidden="true" />,
    iconBg: '#fdf4ff',
    iconColor: '#c026d3',
    title: 'Full spectrum of services',
    description:
      'Design research, UI/UX, frontend, backend, mobile, DevOps — every layer of your product handled in-house by one cohesive team.',
  },
  {
    icon: <FiZap size={20} aria-hidden="true" />,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
    title: "Impossible? We're on it",
    description:
      'We thrive on complex, challenging projects. If other studios have turned you down, reach out — we love a great technical challenge.',
  },
];

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function WSBenefitsContact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [validated, setValidated] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.checkValidity()) {
      setValidated(true);
      return;
    }
    setSubmitted(true);
  }

  return (
    <section id="ws-contact" className="ws-section ws-bg-soft">
      <div className="container">
        <div className="row g-5 align-items-start">

          {/* Left: section title + contact form */}
          <div className="col-lg-6">
            <p className="ws-eyebrow">Get in touch</p>
            <h2 className="section-title mb-3">
              Benefits of working
              <br />
              with us
            </h2>
            <p style={{ color: 'var(--ws-body)', lineHeight: 1.75, marginBottom: '2.25rem', maxWidth: '460px' }}>
              Ready to bring your idea to life? Tell us what you're building and we'll get back to you within one business day.
            </p>

            <div className="ws-form-card">
              {submitted ? (
                <div className="ws-form-success">
                  <div
                    style={{
                      width: 72, height: 72,
                      background: '#f0fdf4',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontSize: '2rem',
                    }}
                    aria-hidden="true"
                  >
                    🎉
                  </div>
                  <h4 style={{ fontWeight: 700, color: 'var(--ws-navy)', marginBottom: '.5rem' }}>
                    Message received!
                  </h4>
                  <p style={{ color: 'var(--ws-body)', marginBottom: '1.5rem' }}>
                    We'll review your project and get back to you within one business day.
                  </p>
                  <button
                    type="button"
                    className="ws-btn-primary"
                    onClick={() => { setSubmitted(false); setValidated(false); setForm({ name: '', email: '', message: '' }); }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form
                  noValidate
                  className={validated ? 'was-validated' : ''}
                  onSubmit={handleSubmit}
                  aria-label="Contact form"
                >
                  <div className="mb-3">
                    <label htmlFor="ws-name" className="form-label">
                      Your name
                    </label>
                    <input
                      id="ws-name"
                      type="text"
                      className="form-control"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      minLength={2}
                      autoComplete="name"
                    />
                    <div className="invalid-feedback">
                      Please enter your full name (min 2 characters).
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="ws-email" className="form-label">
                      Work email
                    </label>
                    <input
                      id="ws-email"
                      type="email"
                      className="form-control"
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      autoComplete="email"
                    />
                    <div className="invalid-feedback">
                      Please enter a valid email address.
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="ws-message" className="form-label">
                      Tell us about your project
                    </label>
                    <textarea
                      id="ws-message"
                      className="form-control"
                      rows={4}
                      placeholder="I need help with a landing page for our SaaS product..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      required
                      minLength={20}
                      style={{ resize: 'vertical' }}
                    />
                    <div className="invalid-feedback">
                      Please describe your project in at least 20 characters.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="ws-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Send request
                    <FiArrowRight size={16} aria-hidden="true" />
                  </button>

                  <p style={{ fontSize: '.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '.875rem', marginBottom: 0 }}>
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right: benefit cards */}
          <div className="col-lg-6">
            {/* Spacer to align with form area on large screens */}
            <div className="d-none d-lg-block" style={{ height: '7.5rem' }} />
            <div className="row g-4">
              {BENEFITS.map(b => (
                <div className="col-12 col-sm-6" key={b.title}>
                  <article className="ws-benefit-card">
                    <div
                      className="ws-icon-circle mb-3"
                      style={{ background: b.iconBg, color: b.iconColor }}
                    >
                      {b.icon}
                    </div>
                    <h4
                      style={{
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: 'var(--ws-navy)',
                        marginBottom: '.5rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {b.title}
                    </h4>
                    <p
                      style={{
                        color: 'var(--ws-body)',
                        fontSize: '.9rem',
                        lineHeight: 1.65,
                        marginBottom: 0,
                      }}
                    >
                      {b.description}
                    </p>
                  </article>
                </div>
              ))}
            </div>

            {/* Reassurance row */}
            <div
              className="mt-4 p-4 rounded-3"
              style={{ background: '#fff', border: '1px solid var(--ws-border)' }}
            >
              <div className="d-flex flex-wrap gap-3">
                {[
                  'No long-term lock-in',
                  'Transparent pricing',
                  'Weekly progress reports',
                ].map(item => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '.4rem',
                      fontSize: '.875rem',
                      fontWeight: 500,
                      color: 'var(--ws-charcoal)',
                    }}
                  >
                    <FiCheck
                      size={14}
                      style={{ color: '#22c55e', flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
