import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import MediaPickerModal from '../components/MediaPickerModal';
import { api } from '../../lib/api';

interface FormData {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  content: string;
  icon_url: string;
  cover_url: string;
  features: string[];
  tags: string[];
  cta_label: string;
  cta_url: string;
  status: 'draft' | 'published';
  seo_title: string;
  seo_description: string;
}

const EMPTY: FormData = {
  title: '', slug: '', description: '', excerpt: '', content: '',
  icon_url: '', cover_url: '', features: [], tags: [],
  cta_label: '', cta_url: '', status: 'draft',
  seo_title: '', seo_description: '',
};

function toSlug(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function AdminServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isNew  = !id;
  const navigate = useNavigate();

  const [form, setForm]       = useState<FormData>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  // chip inputs
  const [tagInput,     setTagInput]     = useState('');
  const [featureInput, setFeatureInput] = useState('');

  // media pickers
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showIconPicker,  setShowIconPicker]  = useState(false);
  const [uploading,       setUploading]       = useState(false);
  const [uploadingIcon,   setUploadingIcon]   = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef  = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  // load existing
  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    api.getServices(true)
      .then(list => {
        const svc = list.find(s => String(s.id) === id);
        if (!svc) { setError('Service not found'); return; }
        setForm({
          title:           svc.title,
          slug:            svc.slug,
          description:     svc.description,
          excerpt:         svc.excerpt ?? '',
          content:         svc.content ?? '',
          icon_url:        svc.icon_url ?? '',
          cover_url:       svc.cover_url ?? '',
          features:        svc.features,
          tags:            svc.tags,
          cta_label:       svc.cta_label ?? '',
          cta_url:         svc.cta_url ?? '',
          status:          svc.status ?? 'draft',
          seo_title:       svc.seo_title ?? '',
          seo_description: svc.seo_description ?? '',
        });
        setSlugTouched(true);
      })
      .catch(() => setError('Failed to load service'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function uploadFile(file: File, field: 'cover_url' | 'icon_url', setBusy: (v: boolean) => void) {
    setBusy(true);
    try {
      const { url } = await api.uploadImage(file);
      set(field, url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  // tag chips
  function addTag() {
    const v = tagInput.trim();
    if (v && !form.tags.includes(v)) set('tags', [...form.tags, v]);
    setTagInput('');
  }
  function removeTag(t: string) { set('tags', form.tags.filter(x => x !== t)); }
  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    else if (e.key === 'Backspace' && !tagInput && form.tags.length) set('tags', form.tags.slice(0, -1));
  }

  // feature chips
  function addFeature() {
    const v = featureInput.trim();
    if (v) set('features', [...form.features, v]);
    setFeatureInput('');
  }
  function removeFeature(i: number) { set('features', form.features.filter((_, idx) => idx !== i)); }
  function handleFeatureKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); addFeature(); }
    else if (e.key === 'Backspace' && !featureInput && form.features.length) set('features', form.features.slice(0, -1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug:            form.slug || toSlug(form.title),
        title:           form.title.trim(),
        description:     form.description.trim(),
        excerpt:         form.excerpt.trim()  || null,
        icon_url:        form.icon_url.trim() || null,
        cover_url:       form.cover_url.trim() || null,
        cta_label:       form.cta_label.trim() || null,
        cta_url:         form.cta_url.trim()  || null,
        seo_title:       form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        sort_order:      0,
      };

      if (isNew) {
        await api.createService(payload);
      } else {
        await api.updateService(Number(id), payload);
      }
      setSuccess(isNew ? 'Service created.' : 'Service updated.');
      setTimeout(() => navigate('/admin/services'), 900);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <AdminLayout pageTitle="Service">
      <div className="a-loading" aria-label="Loading" />
    </AdminLayout>
  );

  return (
    <AdminLayout
      pageTitle={isNew ? 'New Service' : 'Edit Service'}
      headerAction={
        <button type="button" className="a-btn a-btn--ghost a-btn--sm" onClick={() => navigate(-1)}>
          Cancel
        </button>
      }
    >
      {showCoverPicker && (
        <MediaPickerModal onSelect={url => set('cover_url', url)} onClose={() => setShowCoverPicker(false)} />
      )}
      {showIconPicker && (
        <MediaPickerModal onSelect={url => set('icon_url', url)} onClose={() => setShowIconPicker(false)} />
      )}

      <input ref={coverInputRef} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'cover_url', setUploading); e.target.value = ''; }} />
      <input ref={iconInputRef} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, 'icon_url', setUploadingIcon); e.target.value = ''; }} />

      <form className="a-form" onSubmit={handleSubmit} noValidate>
        {error   && <div className="a-alert a-alert--error"   role="alert"  >{error}</div>}
        {success && <div className="a-alert a-alert--success" role="status">{success}</div>}

        <div className="a-form-two-col">

          {/* LEFT */}
          <div className="a-form-col">
            <div className="a-card">
              <div className="a-section-label">Content</div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-title">Title <span className="req">*</span></label>
                <input id="sv-title" className="a-input" value={form.title} required autoFocus
                  onChange={e => {
                    const v = e.target.value;
                    setForm(prev => ({ ...prev, title: v, slug: slugTouched ? prev.slug : toSlug(v) }));
                  }} placeholder="e.g. Web Development" />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-slug">Slug</label>
                <input id="sv-slug" className="a-input" value={form.slug}
                  onChange={e => { setSlugTouched(true); set('slug', e.target.value); }}
                  placeholder="auto-generated-from-title" />
                <span className="a-field__hint">URL: /services/{form.slug || 'your-slug'}</span>
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-desc">Short Description</label>
                <textarea id="sv-desc" className="a-textarea" rows={2} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="One-line description shown on service cards…" />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-excerpt">Excerpt</label>
                <textarea id="sv-excerpt" className="a-textarea" rows={3} value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  placeholder="Slightly longer intro shown in hero section…" />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-content">Full Description</label>
                <textarea id="sv-content" className="a-textarea" rows={8} value={form.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder="Detailed description of the service, process, deliverables…" />
              </div>
            </div>

            {/* Features */}
            <div className="a-card">
              <div className="a-section-label">What's Included</div>
              <div className="a-field">
                <label className="a-field__label">Features</label>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <span style={{ flex: 1 }}>{f}</span>
                      <button type="button" onClick={() => removeFeature(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, lineHeight: 1 }}>×</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="a-input" value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKey}
                    placeholder="e.g. Responsive design" />
                  <button type="button" className="a-btn a-btn--secondary a-btn--sm"
                    onClick={addFeature} style={{ whiteSpace: 'nowrap' }}>Add</button>
                </div>
                <span className="a-field__hint">Press Enter to add each feature</span>
              </div>
            </div>

            {/* CTA */}
            <div className="a-card">
              <div className="a-section-label">Call to Action</div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-cta-label">Button Label</label>
                <input id="sv-cta-label" className="a-input" value={form.cta_label}
                  onChange={e => set('cta_label', e.target.value)} placeholder="e.g. Get a Quote" />
              </div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-cta-url">Button URL</label>
                <input id="sv-cta-url" className="a-input" value={form.cta_url}
                  onChange={e => set('cta_url', e.target.value)} placeholder="/contact or https://…" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="a-form-col">

            {/* Cover Image */}
            <div className="a-card">
              <div className="a-section-label">Cover Image</div>
              {form.cover_url ? (
                <div className="a-cover-preview-wrap">
                  <img className="a-cover-preview" src={form.cover_url} alt="Cover" />
                  <div className="a-cover-preview-actions">
                    <button type="button" className="a-btn a-btn--secondary a-btn--sm"
                      onClick={() => setShowCoverPicker(true)} disabled={uploading}>
                      {uploading ? 'Uploading…' : 'Replace'}
                    </button>
                    <button type="button" className="a-btn a-btn--ghost a-btn--sm"
                      onClick={() => set('cover_url', '')}>Remove</button>
                  </div>
                </div>
              ) : (
                <div className="a-upload-zone" onClick={() => setShowCoverPicker(true)}
                  role="button" tabIndex={0} style={{ cursor: 'pointer' }}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowCoverPicker(true)}>
                  <div className="a-upload-zone__icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="a-upload-zone__text"><strong>Pick from media</strong></p>
                  <p className="a-upload-zone__hint">or <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={e => { e.stopPropagation(); coverInputRef.current?.click(); }}>upload a new file</span></p>
                </div>
              )}
            </div>

            {/* Icon */}
            <div className="a-card">
              <div className="a-section-label">Service Icon</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.icon_url ? (
                  <img src={form.icon_url} alt="icon"
                    style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--adm-border)' }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 8, border: '1px dashed var(--adm-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-muted)', fontSize: 22 }}>☁</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" className="a-btn a-btn--secondary a-btn--sm"
                    onClick={() => setShowIconPicker(true)} disabled={uploadingIcon}>
                    {form.icon_url ? 'Change Icon' : 'Pick Icon'}
                  </button>
                  {form.icon_url && (
                    <button type="button" className="a-btn a-btn--ghost a-btn--sm"
                      onClick={() => set('icon_url', '')}>Remove</button>
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="a-card">
              <div className="a-section-label">Details</div>

              <div className="a-field">
                <label className="a-field__label">Tags / Technologies</label>
                <div className="a-chips" onClick={() => document.getElementById('sv-tag-input')?.focus()}>
                  {form.tags.map(t => (
                    <span key={t} className="a-chip">
                      {t}<button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>×</button>
                    </span>
                  ))}
                  <input id="sv-tag-input" value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                    onBlur={addTag}
                    placeholder={form.tags.length ? '' : 'React, Node.js…'} />
                </div>
                <span className="a-field__hint">Press Enter or comma to add</span>
              </div>
            </div>

            {/* Visibility */}
            <div className="a-card">
              <div className="a-section-label">Visibility</div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-status">Status</label>
                <select id="sv-status" className="a-select" value={form.status}
                  onChange={e => set('status', e.target.value as 'draft' | 'published')}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* SEO */}
            <div className="a-card">
              <div className="a-section-label">SEO</div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-seo-title">SEO Title</label>
                <input id="sv-seo-title" className="a-input" value={form.seo_title}
                  onChange={e => set('seo_title', e.target.value)}
                  placeholder="Override page title for search engines" />
              </div>
              <div className="a-field">
                <label className="a-field__label" htmlFor="sv-seo-desc">SEO Description</label>
                <textarea id="sv-seo-desc" className="a-textarea" rows={3} value={form.seo_description}
                  onChange={e => set('seo_description', e.target.value)}
                  placeholder="Meta description (150–160 chars)" />
              </div>
            </div>

          </div>
        </div>

        <div className="a-form-actions-spacer" />
        <div className="a-form-actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
          <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create Service' : 'Update Service'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
