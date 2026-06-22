import { useState, type FormEvent } from 'react';

const TOPICS = ['UI/UX Design', 'Frontend Dev', 'Case Studies', 'Tech Tips', 'Career'];

export default function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTopic = (t: string) =>
    setSelectedTopics(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() && agreed) setSubmitted(true);
  };

  return (
    <section className="bs-newsletter" aria-label="Newsletter signup">
      <div className="bs-container">
        <div className="bs-newsletter__card">
          {submitted ? (
            <>
              <p style={{ fontSize: '2.5rem', marginBottom: '.875rem' }}>✓</p>
              <h3 className="bs-newsletter__title">You're subscribed!</h3>
              <p className="bs-newsletter__sub">
                Thanks for subscribing. Great content is on its way.
              </p>
            </>
          ) : (
            <>
              <h3 className="bs-newsletter__title">Stay in the loop</h3>
              <p className="bs-newsletter__sub">
                Get design tips, case studies, and dev insights straight to your inbox — no spam, ever.
              </p>

              <div className="bs-newsletter__topics" role="group" aria-label="Topics of interest">
                {TOPICS.map(topic => (
                  <label key={topic} className="bs-newsletter__topic">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={() => toggleTopic(topic)}
                    />
                    {topic}
                  </label>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="bs-newsletter__input-row">
                  <input
                    type="email"
                    className="bs-newsletter__email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="ws-btn-primary">Subscribe</button>
                </div>

                <label className="bs-newsletter__terms">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    required
                  />
                  I agree to receive emails and can unsubscribe at any time.
                </label>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
