import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { api } from '../../lib/api';

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string;
  project_type: string;
  role: string;
  tools: string;
  timeline: string;
  client_name: string;
  status: 'draft' | 'published';
  featured: boolean;
  seo_title: string;
  seo_description: string;
  live_url: string;
  github_url: string;
}

const EMPTY_FORM: FormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_url: '',
  project_type: '',
  role: '',
  tools: '',
  timeline: '',
  client_name: '',
  status: 'draft',
  featured: false,
  seo_title: '',
  seo_description: '',
  live_url: '',
  github_url: '',
};

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCaseStudyFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${api.getToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(json.error ?? `Upload failed (${res.status})`);
      }
      const { url } = await res.json() as { url: string };
      set('cover_url', url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    fetch(`/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to load project (${res.status})`);
        return res.json();
      })
      .then((data: Record<string, unknown>) => {
        setForm({
          title:           String(data.title           ?? ''),
          slug:            String(data.slug            ?? ''),
          excerpt:         String(data.excerpt         ?? ''),
          content:         String(data.content         ?? ''),
          cover_url:       String(data.cover_url       ?? ''),
          project_type:    String(data.project_type    ?? ''),
          role:            String(data.role            ?? ''),
          tools:           String(data.tools           ?? ''),
          timeline:        String(data.timeline        ?? ''),
          client_name:     String(data.client_name     ?? ''),
          status:          (data.status === 'published' ? 'published' : 'draft'),
          featured:        Boolean(data.featured),
          seo_title:       String(data.seo_title       ?? ''),
          seo_description: String(data.seo_description ?? ''),
          live_url:        String(data.live_url        ?? ''),
          github_url:      String(data.github_url      ?? ''),
        });
        setSlugTouched(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(value: string) {
    setForm(prev => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : toSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    set('slug', value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug:            form.slug || toSlug(form.title),
        title:           form.title.trim(),
        excerpt:         form.excerpt.trim()         || null,
        cover_url:       form.cover_url.trim()       || null,
        project_type:    form.project_type           || null,
        role:            form.role.trim()            || null,
        tools:           form.tools.trim()           || null,
        timeline:        form.timeline.trim()        || null,
        client_name:     form.client_name.trim()     || null,
        seo_title:       form.seo_title.trim()       || null,
        seo_description: form.seo_description.trim() || null,
        live_url:        form.live_url.trim()        || null,
        github_url:      form.github_url.trim()      || null,
      };

      const url    = isNew ? '/api/projects' : `/api/projects/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) {
          navigate('/admin/login');
          return;
        }
        let message = `Save failed (${res.status})`;
        try {
          const json = await res.json();
          message = json.error ?? json.message ?? message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      setSuccess(isNew ? 'Case study created.' : 'Case study updated.');
      setTimeout(() => navigate('/admin/projects'), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout pageTitle="Edit Case Study">
        <div className="a-loading" aria-label="Loading case study" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle={isNew ? 'New Case Study' : 'Edit Case Study'}
      headerAction={
        <button
          type="button"
          className="a-btn a-btn--ghost a-btn--sm"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      }
    >
      <form className="a-form" onSubmit={handleSubmit} noValidate>

        {error   && <div className="a-alert a-alert--error"   role="alert"  >{error}</div>}
        {success && <div className="a-alert a-alert--success" role="status">{success}</div>}

        {/* ── Cover image ── */}
        <div className="a-card">
          <div className="a-section-label">Cover Image</div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = '';
            }}
          />

          <div className="a-field">
            <label className="a-field__label" htmlFor="cs-cover-url">Image URL</label>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input
                id="cs-cover-url"
                className="a-input"
                type="url"
                value={form.cover_url}
                onChange={e => set('cover_url', e.target.value)}
                placeholder="https://example.com/cover.jpg"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="a-btn a-btn--secondary a-btn--sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {uploading ? 'Uploading…' : 'Upload Image'}
              </button>
            </div>
            <span className="a-field__hint">Upload an image or paste a direct URL. Max 5 MB — JPEG, PNG, WebP, GIF, SVG.</span>
          </div>

          {form.cover_url ? (
            <div style={{ position: 'relative' }}>
              <img
                className="a-cover-preview"
                src={form.cover_url}
                alt="Cover preview"
              />
              <button
                type="button"
                className="a-btn a-btn--ghost a-btn--sm"
                onClick={() => set('cover_url', '')}
                style={{ position: 'absolute', top: 8, right: 8 }}
                aria-label="Remove cover image"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="a-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Click to upload cover image"
              style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              <div className="a-upload-zone__icon" aria-hidden="true">
                {uploading ? (
                  <div className="a-loading" style={{ width: 32, height: 32 }} />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                )}
              </div>
              <p className="a-upload-zone__text">{uploading ? 'Uploading…' : 'Click to upload'}</p>
              <p className="a-upload-zone__hint">JPEG, PNG, WebP, GIF, SVG — max 5 MB</p>
            </button>
          )}
        </div>

        {/* ── Two-column form ── */}
        <div className="a-form-two-col">

          {/* ── LEFT: Main fields ── */}
          <div className="a-form-col">

            <div className="a-card">
              <div className="a-section-label">Content</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-title">
                  Title <span className="req">*</span>
                </label>
                <input
                  id="cs-title"
                  className="a-input"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. HealthTrack Dashboard"
                  required
                  autoFocus
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-slug">Slug</label>
                <input
                  id="cs-slug"
                  className="a-input"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder="auto-generated-from-title"
                />
                <span className="a-field__hint">URL: /case-studies/{form.slug || 'your-slug'}</span>
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-excerpt">Excerpt</label>
                <textarea
                  id="cs-excerpt"
                  className="a-textarea"
                  rows={3}
                  value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  placeholder="A short summary shown on project cards…"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-content">Content</label>
                <textarea
                  id="cs-content"
                  className="a-textarea"
                  rows={14}
                  value={form.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder="Write your full case study here…"
                />
                <span className="a-field__hint">Rich editor coming soon</span>
              </div>
            </div>

            <div className="a-card">
              <div className="a-section-label">Links</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-live-url">Live URL</label>
                <input
                  id="cs-live-url"
                  className="a-input"
                  type="url"
                  value={form.live_url}
                  onChange={e => set('live_url', e.target.value)}
                  placeholder="https://…"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-github-url">GitHub URL</label>
                <input
                  id="cs-github-url"
                  className="a-input"
                  type="url"
                  value={form.github_url}
                  onChange={e => set('github_url', e.target.value)}
                  placeholder="https://github.com/…"
                />
              </div>
            </div>

          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="a-form-col">

            <div className="a-card">
              <div className="a-section-label">Project Details</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-project-type">Project Type</label>
                <select
                  id="cs-project-type"
                  className="a-select"
                  value={form.project_type}
                  onChange={e => set('project_type', e.target.value)}
                >
                  <option value="">Select type…</option>
                  <option value="Website Design">Website Design</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Web App">Web App</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Design System">Design System</option>
                  <option value="Branding">Branding</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-role">Role</label>
                <input
                  id="cs-role"
                  className="a-input"
                  value={form.role}
                  onChange={e => set('role', e.target.value)}
                  placeholder="e.g. Lead UI/UX Designer"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-tools">Tools</label>
                <input
                  id="cs-tools"
                  className="a-input"
                  value={form.tools}
                  onChange={e => set('tools', e.target.value)}
                  placeholder="Figma, Photoshop, Notion"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-timeline">Timeline</label>
                <input
                  id="cs-timeline"
                  className="a-input"
                  value={form.timeline}
                  onChange={e => set('timeline', e.target.value)}
                  placeholder="4 Weeks"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-client">Client</label>
                <input
                  id="cs-client"
                  className="a-input"
                  value={form.client_name}
                  onChange={e => set('client_name', e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            <div className="a-card">
              <div className="a-section-label">Visibility</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-status">Status</label>
                <select
                  id="cs-status"
                  className="a-select"
                  value={form.status}
                  onChange={e => set('status', e.target.value as 'draft' | 'published')}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="a-toggle-wrap">
                <label className="a-toggle">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={e => set('featured', e.target.checked)}
                  />
                  <span className="a-toggle__track" />
                </label>
                <span className="a-toggle-label">Featured project</span>
              </div>
            </div>

            <div className="a-card">
              <div className="a-section-label">SEO</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-seo-title">SEO Title</label>
                <input
                  id="cs-seo-title"
                  className="a-input"
                  value={form.seo_title}
                  onChange={e => set('seo_title', e.target.value)}
                  placeholder="Override page title for search engines"
                />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="cs-seo-desc">SEO Description</label>
                <textarea
                  id="cs-seo-desc"
                  className="a-textarea"
                  rows={3}
                  value={form.seo_description}
                  onChange={e => set('seo_description', e.target.value)}
                  placeholder="Meta description for search results (150–160 chars)"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom actions ── */}
        <div className="a-form-actions">
          <button
            type="button"
            className="a-btn a-btn--ghost"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="a-btn a-btn--primary"
            disabled={saving}
          >
            {saving ? 'Saving…' : isNew ? 'Create Case Study' : 'Update Case Study'}
          </button>
        </div>

      </form>
    </AdminLayout>
  );
}
