import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { FiCornerDownRight } from 'react-icons/fi';

interface Comment {
  id: number;
  parent_id: number | null;
  author: string;
  body: string;
  created_at: string;
}

interface CommentNode extends Comment {
  children: CommentNode[];
}

interface Props {
  slug: string;
  onCountChange?: (count: number) => void;
}

const MAX_LEN = 2000;

/* Build a nested tree from a flat list ordered by created_at ASC */
function buildTree(flat: Comment[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];
  flat.forEach(c => map.set(c.id, { ...c, children: [] }));
  flat.forEach(c => {
    const node = map.get(c.id)!;
    if (c.parent_id != null && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function formatRelative(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ── Comment form ──────────────────────────────────────────────────────────── */

interface FormState {
  name: string;
  email: string;
  text: string;
  hp: string; // honeypot
}
type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.name.trim())   e.name  = 'Name is required.';
  if (!f.email.trim())  e.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email address.';
  if (!f.text.trim())   e.text  = 'Comment is required.';
  else if (f.text.length > MAX_LEN) e.text = `Max ${MAX_LEN} characters.`;
  return e;
}

interface CommentFormProps {
  slug: string;
  parentId: number | null;
  onSuccess: () => void;
  compact?: boolean;
}

function CommentForm({ slug, parentId, onSuccess, compact = false }: CommentFormProps) {
  const [form, setForm]           = useState<FormState>({ name: '', email: '', text: '', hp: '' });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const uid = parentId != null ? `reply-${parentId}` : 'root';

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(prev => ({ ...prev, [field]: val }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };

  const blur = (field: keyof FormState) => () => {
    const e = validate(form);
    if (e[field]) setErrors(prev => ({ ...prev, [field]: e[field] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author:    form.name.trim(),
          email:     form.email.trim(),
          text:      form.text.trim(),
          parent_id: parentId,
          _hp:       form.hp,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      onSuccess();
    } catch {
      setErrors(prev => ({ ...prev, text: 'Failed to submit. Please try again.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className="bs-cf-success">
        Thanks! Your comment will appear after review.
      </p>
    );
  }

  const remaining = MAX_LEN - form.text.length;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`bs-cf${compact ? ' bs-cf--compact' : ''}`}
    >
      {/* Honeypot — hidden from real users via CSS, bots fill it */}
      <div className="bs-cf-hp" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.hp}
          onChange={set('hp')}
        />
      </div>

      <div className="bs-cf-row">
        {/* Name */}
        <div className="bs-cf-field">
          <label htmlFor={`cf-name-${uid}`} className="bs-cf-label">
            Name <span className="bs-cf-req" aria-hidden="true">*</span>
          </label>
          <input
            id={`cf-name-${uid}`}
            type="text"
            className={`bs-cf-input${errors.name ? ' bs-cf-input--err' : ''}`}
            value={form.name}
            onChange={set('name')}
            onBlur={blur('name')}
            placeholder="Your name"
            autoComplete="name"
          />
          {errors.name && <p className="bs-cf-error">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="bs-cf-field">
          <label htmlFor={`cf-email-${uid}`} className="bs-cf-label">
            Email <span className="bs-cf-req" aria-hidden="true">*</span>
          </label>
          <input
            id={`cf-email-${uid}`}
            type="email"
            className={`bs-cf-input${errors.email ? ' bs-cf-input--err' : ''}`}
            value={form.email}
            onChange={set('email')}
            onBlur={blur('email')}
            placeholder="your@email.com (not shown)"
            autoComplete="email"
          />
          {errors.email && <p className="bs-cf-error">{errors.email}</p>}
        </div>
      </div>

      {/* Text */}
      <div className="bs-cf-field">
        <label htmlFor={`cf-text-${uid}`} className="bs-cf-label">
          Comment <span className="bs-cf-req" aria-hidden="true">*</span>
        </label>
        <textarea
          id={`cf-text-${uid}`}
          className={`bs-cf-textarea${errors.text ? ' bs-cf-textarea--err' : ''}`}
          value={form.text}
          onChange={set('text')}
          onBlur={blur('text')}
          rows={compact ? 3 : 5}
          placeholder="What are your thoughts?"
          maxLength={MAX_LEN}
        />
        <div className="bs-cf-footer">
          {errors.text
            ? <p className="bs-cf-error">{errors.text}</p>
            : <span />}
          <span className={`bs-cf-count${remaining < 100 ? ' bs-cf-count--warn' : ''}`}>
            {remaining.toLocaleString()} left
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="bs-cf-submit"
      >
        {submitting ? 'Posting…' : compact ? 'Post Reply' : 'Post Comment'}
      </button>
    </form>
  );
}

/* ── Single comment (recursive) ────────────────────────────────────────────── */

interface CommentItemProps {
  node: CommentNode;
  slug: string;
  depth?: number;
  onReplyPosted: () => void;
}

function CommentItem({ node, slug, depth = 0, onReplyPosted }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const replyRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    setShowReply(v => {
      if (!v) setTimeout(() => replyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      return !v;
    });
  };

  const handleSuccess = () => {
    setShowReply(false);
    onReplyPosted();
  };

  /* Cap visual indent at 4 levels (96px) to avoid runaway nesting */
  const indentPx = Math.min(depth, 4) * 24;

  return (
    <div
      className={`bs-comment${depth > 0 ? ' bs-comment--reply' : ''}`}
      style={depth > 0 ? { marginLeft: `${indentPx}px` } : undefined}
    >
      {/* Thread connector for replies */}
      {depth > 0 && <span className="bs-comment__connector" aria-hidden="true" />}

      <div className="bs-comment__header">
        <div className="bs-comment__avatar" aria-hidden="true">
          {node.author.charAt(0).toUpperCase()}
        </div>
        <div className="bs-comment__meta">
          <span className="bs-comment__name">{node.author}</span>
          <time className="bs-comment__time" dateTime={node.created_at}>
            {formatRelative(node.created_at)}
          </time>
        </div>
      </div>

      <p className="bs-comment__body">{node.body}</p>

      <button
        type="button"
        className={`bs-comment__reply-btn${showReply ? ' bs-comment__reply-btn--active' : ''}`}
        onClick={toggle}
        aria-expanded={showReply}
      >
        <FiCornerDownRight size={12} aria-hidden="true" />
        {showReply ? 'Cancel' : 'Reply'}
      </button>

      {showReply && (
        <div ref={replyRef} className="bs-comment__reply-form">
          <CommentForm slug={slug} parentId={node.id} onSuccess={handleSuccess} compact />
        </div>
      )}

      {node.children.length > 0 && (
        <div className="bs-comment__children">
          {node.children.map(child => (
            <CommentItem
              key={child.id}
              node={child}
              slug={slug}
              depth={depth + 1}
              onReplyPosted={onReplyPosted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export default function BlogComments({ slug, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);

  /* Use ref so load() can call the latest onCountChange without it being a dep */
  const onCountRef = useRef(onCountChange);
  useEffect(() => { onCountRef.current = onCountChange; }, [onCountChange]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      if (!res.ok) throw new Error();
      const data = await res.json() as Comment[];
      setComments(data);
      onCountRef.current?.(data.length);
    } catch {
      /* comments are optional — fail silently */
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  const tree = buildTree(comments);

  return (
    <div className="bs-comments">

      <h2 className="bs-comments__heading">
        {comments.length > 0
          ? `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`
          : 'Comments'}
      </h2>

      {/* Thread */}
      {loading ? (
        <p className="bs-comments__loading">Loading comments…</p>
      ) : tree.length > 0 ? (
        <div className="bs-comments__thread">
          {tree.map(node => (
            <CommentItem
              key={node.id}
              node={node}
              slug={slug}
              onReplyPosted={load}
            />
          ))}
        </div>
      ) : (
        <p className="bs-comments__empty">No comments yet — start the discussion below.</p>
      )}

      {/* Leave a comment */}
      <div className="bs-comments__form-wrap">
        <h3 className="bs-comments__form-heading">Leave a comment</h3>
        <CommentForm slug={slug} parentId={null} onSuccess={load} />
      </div>

    </div>
  );
}
