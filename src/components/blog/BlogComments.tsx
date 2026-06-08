import { useState, type FormEvent } from 'react';

interface Comment {
  id: number;
  name: string;
  date: string;
  text: string;
  replies?: Comment[];
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    date: 'June 3, 2026',
    text: 'Great article! Really enjoyed reading through your perspective on this. The examples are super clear and easy to follow.',
    replies: [
      {
        id: 2,
        name: 'Carvel Russ',
        date: 'June 3, 2026',
        text: 'Thanks Sarah, really appreciate the feedback! Let me know if you have any questions.',
      },
    ],
  },
  {
    id: 3,
    name: 'Marcus Webb',
    date: 'June 4, 2026',
    text: 'This is exactly what I was looking for. Bookmarked this for future reference — super helpful breakdown.',
  },
];

interface Props {
  count?: number | null;
}

function CommentAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0] ?? '').join('').slice(0, 2).toUpperCase();
  return <div className="bs-comment__avatar" aria-hidden="true">{initials}</div>;
}

function CommentItem({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) {
  return (
    <div className={`bs-comment${isReply ? ' bs-comment--reply' : ''}`}>
      <CommentAvatar name={comment.name} />
      <div className="bs-comment__body">
        <div className="bs-comment__header">
          <span className="bs-comment__name">{comment.name}</span>
          <span className="bs-comment__date">{comment.date}</span>
        </div>
        <p className="bs-comment__text">{comment.text}</p>
        {!isReply && (
          <button type="button" className="bs-comment__reply">Reply</button>
        )}
      </div>
    </div>
  );
}

export default function BlogComments({ count }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');

  const totalDemo = DEMO_COMMENTS.reduce((n, c) => n + 1 + (c.replies?.length ?? 0), 0);
  const displayCount = count ?? totalDemo;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && commentText.trim()) setSubmitted(true);
  };

  return (
    <div className="bs-container">
      <div className="bs-comments">
        <h2 className="bs-comments__heading">{displayCount} Comment{displayCount !== 1 ? 's' : ''}</h2>

        {DEMO_COMMENTS.map(comment => (
          <div key={comment.id}>
            <CommentItem comment={comment} />
            {comment.replies?.map(reply => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        ))}

        <div className="bs-comment-form">
          <h3 className="bs-comment-form__title">Leave a comment</h3>
          {submitted ? (
            <p style={{ color: 'var(--ws-violet)', fontWeight: 600, margin: 0 }}>
              Thanks for your comment! It will appear after review.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bs-comment-form__row">
                <input
                  className="ws-contact-field"
                  style={{ flex: 1 }}
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <input
                  className="ws-contact-field"
                  style={{ flex: 1 }}
                  type="email"
                  placeholder="Email (not published)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <textarea
                className="ws-contact-field"
                style={{ minHeight: 100, marginBottom: '1rem', resize: 'vertical' }}
                placeholder="Write your comment…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                required
              />
              <button type="submit" className="ws-btn-primary">Post Comment</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
