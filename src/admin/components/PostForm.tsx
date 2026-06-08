import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { renderMarkdown, slugify } from '../../lib/markdown';
import type { Post } from '../../types';
import AdminLayout from './AdminLayout';

type Tab = 'write' | 'preview';
type Section = 'content' | 'media' | 'author' | 'seo' | 'settings';

const EMPTY: Omit<Post, 'id'> = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  meta_description: '',
  og_image: '',
  keywords: '',
  author: 'Carvel Russ',
  status: 'draft',
  published_at: null,
  category: '',
  author_avatar: '',
  author_bio: '',
  featured_image_caption: '',
  reading_time: '',
  views_count: null,
};

const SECTION_LABELS: Record<Section, string> = {
  content:  '✏️ Content',
  media:    '🖼 Media',
  author:   '👤 Author',
  seo:      '🔍 SEO',
  settings: '⚙️ Settings',
};

export default function PostForm() {
  const navigate = useNavigate();
  const { slug: editSlug } = useParams<{ slug?: string }>();
  const isEdit = !!editSlug;

  const [form, setForm] = useState<Omit<Post, 'id'>>(EMPTY);
  const [slugManual, setSlugManual] = useState(false);
  const [tab, setTab] = useState<Tab>('write');
  const [section, setSection] = useState<Section>('content');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isEdit || !editSlug) return;
    api.getPostBySlug(editSlug)
      .then(post => {
        setForm({
          title:                   post.title,
          slug:                    post.slug,
          content:                 post.content ?? '',
          excerpt:                 post.excerpt ?? '',
          meta_description:        post.meta_description ?? '',
          og_image:                post.og_image ?? '',
          keywords:                post.keywords ?? '',
          author:                  post.author,
          status:                  post.status,
          published_at:            post.published_at ?? null,
          category:                post.category ?? '',
          author_avatar:           post.author_avatar ?? '',
          author_bio:              post.author_bio ?? '',
          featured_image_caption:  post.featured_image_caption ?? '',
          reading_time:            post.reading_time ?? '',
          views_count:             post.views_count ?? null,
        });
        setSlugManual(true);
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false));
  }, [isEdit, editSlug]);

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleTitleChange = (value: string) => {
    set('title', value);
    if (!slugManual) set('slug', slugify(value));
  };

  const handleTabChange = (t: Tab) => {
    if (t === 'preview') setPreview(renderMarkdown(form.content ?? ''));
    setTab(t);
  };

  const handleSubmit = async (e: FormEvent, asDraft = false) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim())  { setError('Slug is required');  return; }

    setError('');
    setSaving(true);
    const payload: Omit<Post, 'id'> = {
      ...form,
      status: asDraft ? 'draft' : form.status,
      published_at: !asDraft && form.status === 'published'
        ? (form.published_at || new Date().toISOString())
        : form.published_at,
    };

    try {
      if (isEdit && editSlug) {
        const { slug: newSlug } = await api.updatePost(editSlug, payload);
        setSuccess('Post saved successfully.');
        if (newSlug !== editSlug) navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
      } else {
        const { slug: newSlug } = await api.createPost(payload);
        setSuccess('Post created successfully.');
        navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Edit Post">
        <p style={{ color: '#6c7a8d' }}>Loading post…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={isEdit ? 'Edit Post' : 'New Post'}
      headerAction={
        <button className="a-btn a-btn--ghost" onClick={() => navigate('/admin/posts')}>
          ← Back
        </button>
      }
    >
      <form onSubmit={(e) => handleSubmit(e)}>
        {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }}>{success}</div>}

        {/* ── Section tabs ── */}
        <div className="a-card" style={{ marginBottom: 16, padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid #e2e8f0' }}>
            {(Object.keys(SECTION_LABELS) as Section[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: section === s ? '2px solid #6366f1' : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: section === s ? 700 : 500,
                  color: section === s ? '#6366f1' : '#6c7a8d',
                  fontSize: '.875rem',
                  whiteSpace: 'nowrap',
                  marginBottom: -1,
                  transition: 'color .15s',
                }}
              >
                {SECTION_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content section ── */}
        {section === 'content' && (
          <>
            <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
              <div className="a-form">
                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-title">Title <span>*</span></label>
                  <input
                    id="post-title"
                    className="a-input"
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Post title"
                    required
                  />
                </div>

                <div className="a-input-row">
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="post-slug">Slug <span>*</span></label>
                    <input
                      id="post-slug"
                      className="a-input"
                      value={form.slug}
                      onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                      placeholder="my-post-slug"
                      required
                    />
                    <span className="a-field__hint">URL: /blog/{form.slug || 'my-post-slug'}</span>
                  </div>

                  <div className="a-field">
                    <label className="a-field__label" htmlFor="post-category">Category</label>
                    <input
                      id="post-category"
                      className="a-input"
                      value={form.category ?? ''}
                      onChange={e => set('category', e.target.value)}
                      placeholder="e.g. Design, Development"
                    />
                  </div>
                </div>

                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-excerpt">Excerpt</label>
                  <textarea
                    id="post-excerpt"
                    className="a-textarea"
                    style={{ minHeight: 72 }}
                    value={form.excerpt ?? ''}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="Short preview shown in the blog list and hero section"
                  />
                </div>
              </div>
            </div>

            {/* Content editor */}
            <div className="a-card" style={{ marginBottom: 16 }}>
              <div className="a-md-editor">
                <div className="a-md-editor__tabs" role="tablist">
                  {(['write', 'preview'] as Tab[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      role="tab"
                      className={`a-md-editor__tab${tab === t ? ' active' : ''}`}
                      onClick={() => handleTabChange(t)}
                      aria-selected={tab === t}
                    >
                      {t === 'write' ? '✏️ Write' : '👁 Preview'}
                    </button>
                  ))}
                </div>
                {tab === 'write' ? (
                  <textarea
                    value={form.content ?? ''}
                    onChange={e => set('content', e.target.value)}
                    placeholder="Write your post in Markdown…&#10;&#10;## Introduction&#10;&#10;Start writing here…&#10;&#10;> Blockquote with attribution&#10;> &#10;> — Author Name"
                    aria-label="Post content in Markdown"
                  />
                ) : (
                  <div
                    className="a-md-preview"
                    dangerouslySetInnerHTML={{ __html: preview }}
                    aria-label="Rendered post preview"
                  />
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Media section ── */}
        {section === 'media' && (
          <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
            <div className="a-form">
              <div className="a-field">
                <label className="a-field__label" htmlFor="post-og">Featured Image URL</label>
                <input
                  id="post-og"
                  className="a-input"
                  type="url"
                  value={form.og_image ?? ''}
                  onChange={e => set('og_image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                <span className="a-field__hint">Used as the hero image and og:image for social sharing</span>
              </div>

              {form.og_image && (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={form.og_image}
                    alt="Featured image preview"
                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <div className="a-field">
                <label className="a-field__label" htmlFor="post-img-caption">Image Caption</label>
                <input
                  id="post-img-caption"
                  className="a-input"
                  value={form.featured_image_caption ?? ''}
                  onChange={e => set('featured_image_caption', e.target.value)}
                  placeholder="Optional caption displayed below the featured image"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Author section ── */}
        {section === 'author' && (
          <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
            <div className="a-form">
              <div className="a-input-row">
                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-author">Author Name</label>
                  <input
                    id="post-author"
                    className="a-input"
                    value={form.author}
                    onChange={e => set('author', e.target.value)}
                    placeholder="Your Name"
                  />
                </div>
                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-avatar">Author Avatar URL</label>
                  <input
                    id="post-avatar"
                    className="a-input"
                    type="url"
                    value={form.author_avatar ?? ''}
                    onChange={e => set('author_avatar', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              {form.author_avatar && (
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={form.author_avatar}
                    alt="Author avatar preview"
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <div className="a-field">
                <label className="a-field__label" htmlFor="post-bio">Author Bio</label>
                <textarea
                  id="post-bio"
                  className="a-textarea"
                  style={{ minHeight: 80 }}
                  value={form.author_bio ?? ''}
                  onChange={e => set('author_bio', e.target.value)}
                  placeholder="A short bio shown in the author box below each post"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SEO section ── */}
        {section === 'seo' && (
          <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
            <div className="a-form">
              <div className="a-field">
                <label className="a-field__label" htmlFor="post-meta-desc">
                  Meta Description <span style={{ color: '#6c7a8d', fontWeight: 400 }}>(SEO)</span>
                </label>
                <textarea
                  id="post-meta-desc"
                  className="a-textarea"
                  style={{ minHeight: 72 }}
                  value={form.meta_description ?? ''}
                  onChange={e => set('meta_description', e.target.value)}
                  placeholder="150–160 character description for search results"
                />
                <span className="a-field__hint">{(form.meta_description ?? '').length}/160 chars</span>
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="post-kw">
                  Keywords / Tags <span style={{ color: '#6c7a8d', fontWeight: 400 }}>(comma-separated)</span>
                </label>
                <input
                  id="post-kw"
                  className="a-input"
                  value={form.keywords ?? ''}
                  onChange={e => set('keywords', e.target.value)}
                  placeholder="react, ui, ux, design, frontend"
                />
                <span className="a-field__hint">Shown as tag pills on the post page</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Settings section ── */}
        {section === 'settings' && (
          <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
            <div className="a-form">
              <div className="a-input-row">
                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-status">Status</label>
                  <select
                    id="post-status"
                    className="a-select"
                    value={form.status}
                    onChange={e => set('status', e.target.value as Post['status'])}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-pub-date">Published date</label>
                  <input
                    id="post-pub-date"
                    className="a-input"
                    type="datetime-local"
                    value={form.published_at ? form.published_at.slice(0, 16) : ''}
                    onChange={e =>
                      set('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                  />
                </div>
              </div>

              <div className="a-input-row">
                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-reading-time">Reading Time</label>
                  <input
                    id="post-reading-time"
                    className="a-input"
                    value={form.reading_time ?? ''}
                    onChange={e => set('reading_time', e.target.value)}
                    placeholder="e.g. 5 min read"
                  />
                </div>

                <div className="a-field">
                  <label className="a-field__label" htmlFor="post-views">Views Count</label>
                  <input
                    id="post-views"
                    className="a-input"
                    type="number"
                    min="0"
                    value={form.views_count ?? ''}
                    onChange={e => set('views_count', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => navigate('/admin/posts')} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="a-btn a-btn--ghost" onClick={(e) => handleSubmit(e, true)} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="submit"
            className="a-btn a-btn--primary"
            disabled={saving}
            onClick={() => set('status', 'published')}
          >
            {saving ? 'Saving…' : form.status === 'published' ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
