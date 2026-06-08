import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { renderMarkdown, slugify } from '../../lib/markdown';
import type { Post } from '../../types';
import AdminLayout from './AdminLayout';

type Tab = 'write' | 'preview';

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

export default function PostForm() {
  const navigate = useNavigate();
  const { slug: editSlug } = useParams<{ slug?: string }>();
  const isEdit = !!editSlug;

  const [form, setForm] = useState<Omit<Post, 'id'>>(EMPTY);
  const [slugManual, setSlugManual] = useState(false);
  const [tab, setTab] = useState<Tab>('write');
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
          title:                  post.title,
          slug:                   post.slug,
          content:                post.content ?? '',
          excerpt:                post.excerpt ?? '',
          meta_description:       post.meta_description ?? '',
          og_image:               post.og_image ?? '',
          keywords:               post.keywords ?? '',
          author:                 post.author,
          status:                 post.status,
          published_at:           post.published_at ?? null,
          category:               post.category ?? '',
          author_avatar:          post.author_avatar ?? '',
          author_bio:             post.author_bio ?? '',
          featured_image_caption: post.featured_image_caption ?? '',
          reading_time:           post.reading_time ?? '',
          views_count:            post.views_count ?? null,
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

  const save = async (overrideStatus?: Post['status']) => {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim())  { setError('Slug is required');  return; }

    setError('');
    setSaving(true);

    const status = overrideStatus ?? form.status;
    const payload: Omit<Post, 'id'> = {
      ...form,
      status,
      published_at: status === 'published'
        ? (form.published_at || new Date().toISOString())
        : form.published_at,
    };

    try {
      if (isEdit && editSlug) {
        const { slug: newSlug } = await api.updatePost(editSlug, payload);
        setSuccess('Post saved.');
        setForm(prev => ({ ...prev, status }));
        if (newSlug !== editSlug) navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
      } else {
        const { slug: newSlug } = await api.createPost(payload);
        setSuccess('Post created.');
        navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    save(form.status === 'draft' ? 'draft' : 'published');
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Edit Post">
        <p style={{ color: '#6c7a8d' }}>Loading post…</p>
      </AdminLayout>
    );
  }

  const isPublished = form.status === 'published';

  return (
    <AdminLayout
      pageTitle={isEdit ? 'Edit Post' : 'New Post'}
      headerAction={
        <button className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate('/admin/posts')}>
          ← Posts
        </button>
      }
    >
      <form onSubmit={handleSubmit}>
        {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 14 }}>{error}</div>}
        {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 14 }}>{success}</div>}

        <div className="a-post-editor">

          {/* ── Main column ── */}
          <div className="a-post-main">

            {/* Title + slug */}
            <div className="a-card a-card--pad">
              <input
                className="a-post-title"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Post title…"
                required
                aria-label="Post title"
              />
              <div className="a-slug-bar">
                <span className="a-slug-prefix">/blog/</span>
                <input
                  className="a-slug-input"
                  value={form.slug}
                  onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                  placeholder="my-post-slug"
                  required
                  aria-label="URL slug"
                />
                <span className="a-slug-sep">·</span>
                <input
                  className="a-slug-category"
                  value={form.category ?? ''}
                  onChange={e => set('category', e.target.value)}
                  placeholder="Category"
                  aria-label="Category"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="a-card a-card--pad" style={{ paddingBottom: 14 }}>
              <label className="a-side-label" htmlFor="post-excerpt">Excerpt</label>
              <textarea
                id="post-excerpt"
                className="a-textarea"
                style={{ minHeight: 68, marginTop: 2, width: '100%' }}
                value={form.excerpt ?? ''}
                onChange={e => set('excerpt', e.target.value)}
                placeholder="Short summary shown in the blog list…"
              />
            </div>

            {/* Markdown editor */}
            <div className="a-card">
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
                    placeholder={`Write your post in Markdown…\n\n## Introduction\n\nStart writing here…\n\n> Blockquote text\n>\n> — Attribution`}
                    aria-label="Post content"
                    style={{ minHeight: 420 }}
                  />
                ) : (
                  <div
                    className="a-md-preview"
                    dangerouslySetInnerHTML={{ __html: preview }}
                    aria-label="Rendered preview"
                    style={{ minHeight: 420 }}
                  />
                )}
              </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="a-post-sidebar">

            {/* Publish card */}
            <div className="a-side-card">
              <div className="a-side-card__head">
                <span className="a-side-card__head-icon">🚦</span>
                <span className="a-side-card__head-title">Publish</span>
              </div>
              <div className="a-side-card__body">
                <div>
                  <label className="a-side-label" htmlFor="post-status">
                    Status
                    <span
                      className={`a-status-dot a-status-dot--${form.status}`}
                      style={{ marginLeft: 6 }}
                      aria-hidden="true"
                    />
                  </label>
                  <select
                    id="post-status"
                    className="a-select"
                    style={{ width: '100%' }}
                    value={form.status}
                    onChange={e => set('status', e.target.value as Post['status'])}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="a-side-label" htmlFor="post-pub-date">Publish date</label>
                  <input
                    id="post-pub-date"
                    className="a-input"
                    style={{ width: '100%' }}
                    type="datetime-local"
                    value={form.published_at ? form.published_at.slice(0, 16) : ''}
                    onChange={e =>
                      set('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)
                    }
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="a-side-label" htmlFor="post-reading-time">Read time</label>
                    <input
                      id="post-reading-time"
                      className="a-input"
                      style={{ width: '100%' }}
                      value={form.reading_time ?? ''}
                      onChange={e => set('reading_time', e.target.value)}
                      placeholder="5 min"
                    />
                  </div>
                  <div>
                    <label className="a-side-label" htmlFor="post-views">Views</label>
                    <input
                      id="post-views"
                      className="a-input"
                      style={{ width: '100%' }}
                      type="number"
                      min="0"
                      value={form.views_count ?? ''}
                      onChange={e => set('views_count', e.target.value ? Number(e.target.value) : null)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <div className="a-side-card__actions">
                <button
                  type="button"
                  className="a-btn a-btn--ghost a-btn--sm"
                  style={{ flex: 1 }}
                  onClick={() => save('draft')}
                  disabled={saving}
                >
                  {saving ? '…' : 'Save Draft'}
                </button>
                <button
                  type="submit"
                  className="a-btn a-btn--primary a-btn--sm"
                  style={{ flex: 1 }}
                  disabled={saving}
                  onClick={() => set('status', 'published')}
                >
                  {saving ? '…' : isPublished ? 'Update' : 'Publish →'}
                </button>
              </div>
            </div>

            {/* Featured image card */}
            <div className="a-side-card">
              <div className="a-side-card__head">
                <span className="a-side-card__head-icon">🖼</span>
                <span className="a-side-card__head-title">Featured Image</span>
              </div>
              <div className="a-side-card__body">
                {form.og_image && (
                  <img
                    src={form.og_image}
                    alt="Featured image preview"
                    className="a-img-preview"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <div>
                  <label className="a-side-label" htmlFor="post-og">Image URL</label>
                  <input
                    id="post-og"
                    className="a-input"
                    style={{ width: '100%' }}
                    type="url"
                    value={form.og_image ?? ''}
                    onChange={e => set('og_image', e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="a-side-label" htmlFor="post-img-caption">Caption</label>
                  <input
                    id="post-img-caption"
                    className="a-input"
                    style={{ width: '100%' }}
                    value={form.featured_image_caption ?? ''}
                    onChange={e => set('featured_image_caption', e.target.value)}
                    placeholder="Optional image caption"
                  />
                </div>
              </div>
            </div>

            {/* Author card */}
            <div className="a-side-card">
              <div className="a-side-card__head">
                <span className="a-side-card__head-icon">👤</span>
                <span className="a-side-card__head-title">Author</span>
              </div>
              <div className="a-side-card__body">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  {form.author_avatar && (
                    <img
                      src={form.author_avatar}
                      alt="Avatar preview"
                      className="a-avatar-preview"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label className="a-side-label" htmlFor="post-author">Name</label>
                    <input
                      id="post-author"
                      className="a-input"
                      style={{ width: '100%' }}
                      value={form.author}
                      onChange={e => set('author', e.target.value)}
                      placeholder="Carvel Russ"
                    />
                  </div>
                </div>
                <div>
                  <label className="a-side-label" htmlFor="post-avatar">Avatar URL</label>
                  <input
                    id="post-avatar"
                    className="a-input"
                    style={{ width: '100%' }}
                    type="url"
                    value={form.author_avatar ?? ''}
                    onChange={e => set('author_avatar', e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="a-side-label" htmlFor="post-bio">Bio</label>
                  <textarea
                    id="post-bio"
                    className="a-textarea"
                    style={{ minHeight: 68 }}
                    value={form.author_bio ?? ''}
                    onChange={e => set('author_bio', e.target.value)}
                    placeholder="Short bio shown below the post"
                  />
                </div>
              </div>
            </div>

            {/* SEO card */}
            <div className="a-side-card">
              <div className="a-side-card__head">
                <span className="a-side-card__head-icon">🔍</span>
                <span className="a-side-card__head-title">SEO &amp; Tags</span>
              </div>
              <div className="a-side-card__body">
                <div>
                  <label className="a-side-label" htmlFor="post-kw">Tags</label>
                  <input
                    id="post-kw"
                    className="a-input"
                    style={{ width: '100%' }}
                    value={form.keywords ?? ''}
                    onChange={e => set('keywords', e.target.value)}
                    placeholder="react, ui, design"
                  />
                  <span className="a-side-hint">Comma-separated · shown as pills on the post</span>
                </div>
                <div>
                  <label className="a-side-label" htmlFor="post-meta-desc">
                    Meta description
                    <span style={{ fontWeight: 400, color: '#6c7a8d', marginLeft: 4 }}>
                      ({(form.meta_description ?? '').length}/160)
                    </span>
                  </label>
                  <textarea
                    id="post-meta-desc"
                    className="a-textarea"
                    style={{ minHeight: 76 }}
                    value={form.meta_description ?? ''}
                    onChange={e => set('meta_description', e.target.value)}
                    placeholder="150–160 char description for search results"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
