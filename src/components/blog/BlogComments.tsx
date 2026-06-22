import { useState, type FormEvent } from 'react';

export default function BlogComments() {
  const [text, setText]           = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) setSubmitted(true);
  };

  return (
    <section className="bs-discussion" aria-label="Comments">
      <h2 className="bs-discussion__heading">Discussion</h2>

      <form onSubmit={handleSubmit} className="bs-discussion__form">
        <div className="bs-discussion__input-row">
          {/* User avatar placeholder */}
          <div className="bs-discussion__avatar" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <input
            type="text"
            className="bs-discussion__input"
            placeholder="Add your comment here..."
            value={text}
            onChange={e => setText(e.target.value)}
            aria-label="Write a comment"
          />
        </div>

        {text.trim() && !submitted && (
          <div className="bs-discussion__actions">
            <button type="submit" className="bs-discussion__submit">
              Post Comment
            </button>
          </div>
        )}

        {submitted && (
          <p className="bs-discussion__success">
            Thanks! Your comment will appear after review.
          </p>
        )}
      </form>

      {/* Empty state */}
      {!submitted && (
        <div className="bs-discussion__empty">
          <p className="bs-discussion__empty-text">No comments yet.</p>
        </div>
      )}
    </section>
  );
}
