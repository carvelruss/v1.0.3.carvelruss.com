import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Thank You | webstudio';
  }, []);

  return (
    <div className="ws-thankyou">
      <div className="ws-thankyou__card">

        {/* Animated checkmark */}
        <div className="ws-thankyou__check" aria-hidden="true">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="thankyou-check__circle" cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="2.5" />
            <path  className="thankyou-check__tick"   d="M14 26L22 34L38 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="ws-thankyou__heading">Thank you!</h1>
        <p className="ws-thankyou__sub">
          Your message has been received. I'll review it and get back to you within <strong>24–48 hours</strong>.
        </p>

        <div className="ws-thankyou__steps">
          {[
            { num: '01', title: 'Message received',      body: 'Your inquiry is in my inbox.' },
            { num: '02', title: "I'll review & respond", body: 'Expect a reply within 24–48 hours.' },
            { num: '03', title: 'We get to work',        body: "Let's build something great together." },
          ].map(s => (
            <div key={s.num} className="ws-thankyou__step">
              <span className="ws-thankyou__step-num">{s.num}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="ws-thankyou__actions">
          <button className="ws-btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
          <Link to="/case-studies" className="ws-btn-outline">View Case Studies</Link>
        </div>

      </div>
    </div>
  );
}
