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
          title: post.title,
          slug: post.slug,
          content: post.content ?? '',
          excerpt: post.excerpt ?? '',
          meta_description: post.meta_description ?? '',
          og_image: post.og_image ?? '',
          keywords: post.keywords ?? '',
          author: post.author,
          status: post.status,
          published_at: post.published_at ?? null,
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
    if (!form.slug.trim()) { setError('Slug is required'); return; }

    setError('');
    setSaving(true);
    const payload: Omit<Post, 'id'> = {
      ...form,
      status: asDraft ? 'draft' : form.status,
      published_at: !asDraft && form.status === 'published' ? (form.published_at || new Date().toISOString()) : form.published_at,
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
        {error && <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }}>{success}</div>}

        {/* ── Metadata card ── */}
        <div className="a-card a-card--pad" style={{ marginBottom: 16 }}>
          <div className="a-form">
            <div className="a-field">
              <label className="a-field__label" htmlFor="post-title">Title <span>*</span></label>
              <input id="post-title" className="a-input" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title" required />
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
                <label className="a-field__label" htmlFor="post-author">Author</label>
                <input id="post-author" className="a-input" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Your Name" />
              </div>
            </div>

            <div className="a-input-row">
              <div className="a-field">
                <label className="a-field__label" htmlFor="post-status">Status</label>
                <select id="post-status" className="a-select" value={form.status} onChange={e => set('status', e.target.value as Post['status'])}>
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
                  onChange={e => set('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                />
              </div>
            </div>

            <div className="a-field">
              <label className="a-field__label" htmlFor="post-excerpt">Excerpt</label>
              <textarea id="post-excerpt" className="a-textarea" style={{ minHeight: 60 }} value={form.excerpt ?? ''} onChange={e => set('excerpt', e.target.value)} placeholder="Short preview shown in blog list" />
            </div>

            <div className="a-field">
              <label className="a-field__label" htmlFor="post-meta-desc">Meta Description <span style={{ color: '#6c7a8d', fontWeight: 400 }}>(SEO)</span></label>
              <textarea id="post-meta-desc" className="a-textarea" style={{ minHeight: 60 }} value={form.meta_description ?? ''} onChange={e => set('meta_description', e.target.value)} placeholder="150–160 character description for search results" />
              <span className="a-field__hint">{(form.meta_description ?? '').length}/160 chars</span>
            </div>

            <div className="a-input-row">
              <div className="a-field">
                <label className="a-field__label" htmlFor="post-og">OG Image URL</label>
                <input id="post-og" className="a-input" type="url" value={form.og_image ?? ''} onChange={e => set('og_image', e.target.value)} placeholder="https://…" />
              </div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="post-kw">Keywords</label>
                <input id="post-kw" className="a-input" value={form.keywords ?? ''} onChange={e => set('keywords', e.target.value)} placeholder="react, ui, ux, design" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Content editor ── */}
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
                placeholder="Write your post in Markdown…&#10;&#10;## Introduction&#10;&#10;Start writing here…"
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

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="a-btn a-btn--ghost" onClick={() => navigate('/admin/posts')} disabled={saving}>Cancel</button>
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
