import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/write-review.css';

interface FormState {
  full_name: string;
  company_name: string;
  role: string;
  website_url: string;
  message: string;
}

const BLANK: FormState = { full_name: '', company_name: '', role: '', website_url: '', message: '' };

export default function WriteReviewButton() {
  const { pathname }                = useLocation();
  const [open, setOpen]             = useState(false);
  const [form, setForm]             = useState<FormState>(BLANK);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  // All hooks above — safe to return early now
  if (pathname.startsWith('/admin')) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res  = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setSuccess(true);
      setForm(BLANK);
    } catch (ex) {
      setError(ex instanceof Error ? ex.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => { setSuccess(false); setError(''); setForm(BLANK); }, 300);
  };

  return (
    <>
      <button
        className="wr-fab"
        onClick={() => setOpen(true)}
        aria-label="Write a review"
        title="Write a review"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
          aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span>Write a Review</span>
      </button>

      {open && (
        <div className="wr-overlay" role="dialog" aria-modal="true" aria-labelledby="wr-title">
          <div className="wr-backdrop" onClick={handleClose} aria-hidden="true" />

          <div className="wr-modal">
            <button className="wr-modal__close" onClick={handleClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {success ? (
              <div className="wr-modal__success">
                <div className="wr-modal__success-icon" aria-hidden="true">✓</div>
                <h2 className="wr-modal__success-title">Thank you!</h2>
                <p className="wr-modal__success-msg">
                  Your review has been submitted and is pending approval.
                  It will appear on the site once reviewed.
                </p>
                <button className="wr-modal__btn" onClick={handleClose}>Close</button>
              </div>
            ) : (
              <>
                <div className="wr-modal__head">
                  <span className="wr-modal__eyebrow">Share Your Experience</span>
                  <h2 className="wr-modal__title" id="wr-title">Write a Review</h2>
                  <p className="wr-modal__subtitle">
                    Your feedback helps others understand the value of working together.
                  </p>
                </div>

                <form className="wr-modal__form" onSubmit={handleSubmit} noValidate>
                  <div className="wr-modal__row">
                    <div className="wr-modal__field">
                      <label className="wr-modal__label" htmlFor="wr-full-name">
                        Full Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="wr-full-name"
                        name="full_name"
                        type="text"
                        className="wr-modal__input"
                        placeholder="Jane Smith"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="wr-modal__field">
                      <label className="wr-modal__label" htmlFor="wr-company">
                        Company Name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="wr-company"
                        name="company_name"
                        type="text"
                        className="wr-modal__input"
                        placeholder="Acme Corp"
                        value={form.company_name}
                        onChange={handleChange}
                        required
                        autoComplete="organization"
                      />
                    </div>
                  </div>

                  <div className="wr-modal__row">
                    <div className="wr-modal__field">
                      <label className="wr-modal__label" htmlFor="wr-role">
                        Role <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="wr-role"
                        name="role"
                        type="text"
                        className="wr-modal__input"
                        placeholder="CEO, Designer…"
                        value={form.role}
                        onChange={handleChange}
                        required
                        autoComplete="organization-title"
                      />
                    </div>
                    <div className="wr-modal__field">
                      <label className="wr-modal__label" htmlFor="wr-website">
                        Website URL <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="wr-website"
                        name="website_url"
                        type="url"
                        className="wr-modal__input"
                        placeholder="https://example.com"
                        value={form.website_url}
                        onChange={handleChange}
                        required
                        autoComplete="url"
                      />
                    </div>
                  </div>

                  <div className="wr-modal__field">
                    <label className="wr-modal__label" htmlFor="wr-message">
                      Testimonial Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="wr-message"
                      name="message"
                      className="wr-modal__textarea"
                      placeholder="Share your experience working with Carvel…"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                    />
                  </div>

                  {error && <p className="wr-modal__error" role="alert">{error}</p>}

                  <button type="submit" className="wr-modal__btn" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
