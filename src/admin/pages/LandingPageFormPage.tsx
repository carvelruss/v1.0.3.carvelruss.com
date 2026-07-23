import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { LandingPageSections } from '../../types';
import { DEFAULT_LP_SECTIONS } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slug(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Tiny sub-components ─────────────────────────────────────────────────────

function SectionWrap({
  title,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`lp-section-block${enabled ? '' : ' lp-section-block--disabled'}`}>
      <div className="lp-section-block__header">
        <button
          type="button"
          className="lp-section-block__toggle-title"
          onClick={() => setOpen(o => !o)}
        >
          <span className="lp-section-block__chevron">{open ? '▾' : '▸'}</span>
          {title}
        </button>
        <label className="lp-toggle" title={enabled ? 'Disable section' : 'Enable section'}>
          <input type="checkbox" checked={enabled} onChange={onToggle} />
          <span className="lp-toggle__track" />
        </label>
      </div>
      {open && <div className="lp-section-block__body">{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ep-field">
      <label className="ep-label">{label}</label>
      {children}
    </div>
  );
}

function StringListEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, v: string) => {
    const copy = [...value];
    copy[i] = v;
    onChange(copy);
  };
  const add = () => onChange([...value, '']);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="lp-list-editor">
      {value.map((item, i) => (
        <div key={i} className="lp-list-editor__row">
          <input
            className="ep-input"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder ?? 'Item'}
          />
          <button type="button" className="ep-icon-btn ep-icon-btn--danger" onClick={() => remove(i)} title="Remove">×</button>
        </div>
      ))}
      <button type="button" className="ep-btn ep-btn-ghost ep-btn-sm" onClick={add}>+ Add item</button>
    </div>
  );
}

function CardListEditor<T extends Record<string, string>>({
  value,
  onChange,
  fields,
  defaultItem,
}: {
  value: T[];
  onChange: (v: T[]) => void;
  fields: { key: keyof T; label: string; multiline?: boolean }[];
  defaultItem: T;
}) {
  const update = (i: number, key: keyof T, v: string) => {
    const copy = value.map((item, idx) => idx === i ? { ...item, [key]: v } : item);
    onChange(copy);
  };
  const add    = () => onChange([...value, { ...defaultItem }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move   = (i: number, dir: -1 | 1) => {
    const copy = [...value];
    const j = i + dir;
    if (j < 0 || j >= copy.length) return;
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="lp-card-list">
      {value.map((item, i) => (
        <div key={i} className="lp-card-list__item">
          <div className="lp-card-list__controls">
            <span className="lp-card-list__num">#{i + 1}</span>
            <button type="button" className="ep-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
            <button type="button" className="ep-icon-btn" onClick={() => move(i, 1)} disabled={i === value.length - 1} title="Move down">↓</button>
            <button type="button" className="ep-icon-btn ep-icon-btn--danger" onClick={() => remove(i)} title="Remove">×</button>
          </div>
          {fields.map(f => (
            <div key={String(f.key)} className="ep-field">
              <label className="ep-label">{f.label}</label>
              {f.multiline ? (
                <textarea
                  className="ep-input ep-textarea"
                  value={item[f.key] as string}
                  onChange={e => update(i, f.key, e.target.value)}
                  rows={3}
                />
              ) : (
                <input
                  className="ep-input"
                  value={item[f.key] as string}
                  onChange={e => update(i, f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="ep-btn ep-btn-ghost ep-btn-sm" onClick={add}>+ Add item</button>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function LandingPageFormPage() {
  const { slug: editSlug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(editSlug);

  const [title,          setTitle]          = useState('');
  const [pageSlug,       setPageSlug]       = useState('');
  const [status,         setStatus]         = useState<'draft' | 'published'>('draft');
  const [seoTitle,       setSeoTitle]       = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [ogImage,        setOgImage]        = useState('');
  const [sections,       setSections]       = useState<LandingPageSections>(DEFAULT_LP_SECTIONS);
  const [slugManual,     setSlugManual]     = useState(false);

  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!isEdit || !editSlug) return;
    api.getLandingPageBySlug(editSlug, true)
      .then(p => {
        setTitle(p.title);
        setPageSlug(p.slug);
        setStatus(p.status);
        setSeoTitle(p.seo_title ?? '');
        setSeoDescription(p.seo_description ?? '');
        setOgImage(p.og_image ?? '');
        setSections(p.sections);
        setSlugManual(true);
      })
      .catch(() => setError('Failed to load page for editing.'))
      .finally(() => setLoading(false));
  }, [isEdit, editSlug]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugManual) setPageSlug(slug(v));
  };

  const setField = useCallback(<K extends keyof LandingPageSections, F extends keyof LandingPageSections[K]>(
    section: K,
    field: F,
    value: LandingPageSections[K][F],
  ) => {
    setSections(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  }, []);

  const toggleSection = useCallback(<K extends keyof LandingPageSections>(section: K) => {
    setSections(prev => ({
      ...prev,
      [section]: { ...prev[section], enabled: !(prev[section] as { enabled: boolean }).enabled },
    }));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pageSlug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        slug: pageSlug.trim(),
        status,
        sections,
        seo_title:       seoTitle || null,
        seo_description: seoDescription || null,
        og_image:        ogImage || null,
      };
      if (isEdit && editSlug) {
        const { slug: newSlug } = await api.updateLandingPage(editSlug, payload);
        navigate(`/admin/landing-pages/${newSlug}/edit`, { replace: true });
      } else {
        const { slug: newSlug } = await api.createLandingPage(payload);
        navigate(`/admin/landing-pages/${newSlug}/edit`, { replace: true });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout pageTitle="Landing Page">{<div className="ep-loading">Loading…</div>}</AdminLayout>;

  const s = sections;

  return (
    <AdminLayout pageTitle={isEdit ? 'Edit Landing Page' : 'New Landing Page'}>
      <form className="ep-page" onSubmit={handleSubmit} noValidate>
        <div className="ep-page-header">
          <div>
            <h1 className="ep-page-title">{isEdit ? 'Edit Landing Page' : 'New Landing Page'}</h1>
            <p className="ep-page-sub">All sections can be toggled on/off and fully edited.</p>
          </div>
          <div className="ep-header-actions">
            <button type="button" className="ep-btn ep-btn-ghost" onClick={() => navigate('/admin/landing-pages')}>
              Cancel
            </button>
            <button type="submit" className="ep-btn ep-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Page'}
            </button>
          </div>
        </div>

        {error && <div className="ep-alert ep-alert-error">{error}</div>}

        {/* ── Page Meta ── */}
        <div className="ep-card lp-meta-card">
          <h2 className="ep-card-title">Page Settings</h2>
          <div className="ep-grid-2">
            <Field label="Page Title *">
              <input
                className="ep-input"
                value={title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. SEO Services"
                required
              />
            </Field>
            <Field label="URL Slug *">
              <div className="ep-slug-wrap">
                <span className="ep-slug-prefix">/lp/</span>
                <input
                  className="ep-input ep-input--slug"
                  value={pageSlug}
                  onChange={e => { setPageSlug(slug(e.target.value)); setSlugManual(true); }}
                  placeholder="seo-services"
                  required
                />
              </div>
            </Field>
          </div>
          <div className="ep-grid-2">
            <Field label="Status">
              <select className="ep-input" value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="OG / Hero Image URL">
              <input className="ep-input" value={ogImage} onChange={e => setOgImage(e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <Field label="SEO Title">
            <input className="ep-input" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Overrides browser title" />
          </Field>
          <Field label="SEO Description">
            <textarea className="ep-input ep-textarea" value={seoDescription} onChange={e => setSeoDescription(e.target.value)} rows={2} placeholder="Meta description for search engines" />
          </Field>
        </div>

        {/* ── Sections ── */}
        <div className="ep-card">
          <h2 className="ep-card-title">Page Sections</h2>
          <p className="ep-card-sub">Toggle each section on/off. Click the section name to expand and edit its content.</p>

          {/* Header */}
          <SectionWrap title="Header / Nav" enabled={s.header.enabled} onToggle={() => toggleSection('header')}>
            <Field label="CTA Button Text">
              <input className="ep-input" value={s.header.ctaText} onChange={e => setField('header', 'ctaText', e.target.value)} />
            </Field>
          </SectionWrap>

          {/* Hero */}
          <SectionWrap title="Hero" enabled={s.hero.enabled} onToggle={() => toggleSection('hero')}>
            <Field label="Eyebrow Text">
              <input className="ep-input" value={s.hero.eyebrow} onChange={e => setField('hero', 'eyebrow', e.target.value)} />
            </Field>
            <div className="ep-grid-3">
              <Field label="Title Line 1">
                <input className="ep-input" value={s.hero.titleLine1} onChange={e => setField('hero', 'titleLine1', e.target.value)} />
              </Field>
              <Field label="Title Accent (highlighted)">
                <input className="ep-input" value={s.hero.titleAccent} onChange={e => setField('hero', 'titleAccent', e.target.value)} />
              </Field>
              <Field label="Title Line 2">
                <input className="ep-input" value={s.hero.titleLine2} onChange={e => setField('hero', 'titleLine2', e.target.value)} />
              </Field>
            </div>
            <Field label="Sub-copy">
              <textarea className="ep-input ep-textarea" value={s.hero.subCopy} onChange={e => setField('hero', 'subCopy', e.target.value)} rows={2} />
            </Field>
            <Field label="Trust Chips (one per line)">
              <StringListEditor value={s.hero.chips} onChange={v => setField('hero', 'chips', v)} placeholder="Chip text" />
            </Field>
            <Field label="Proof Cards">
              <CardListEditor
                value={s.hero.proofCards}
                onChange={v => setField('hero', 'proofCards', v)}
                fields={[{ key: 'title', label: 'Title' }, { key: 'copy', label: 'Copy' }]}
                defaultItem={{ title: '', copy: '' }}
              />
            </Field>
            <div className="ep-grid-2">
              <Field label="Primary CTA Text">
                <input className="ep-input" value={s.hero.primaryCtaText} onChange={e => setField('hero', 'primaryCtaText', e.target.value)} />
              </Field>
              <Field label="Secondary CTA Text">
                <input className="ep-input" value={s.hero.secondaryCtaText} onChange={e => setField('hero', 'secondaryCtaText', e.target.value)} />
              </Field>
            </div>
            <Field label="Secondary CTA Email">
              <input className="ep-input" type="email" value={s.hero.secondaryCtaEmail} onChange={e => setField('hero', 'secondaryCtaEmail', e.target.value)} />
            </Field>
            <div className="ep-grid-3">
              <Field label="Quote Card Badge">
                <input className="ep-input" value={s.hero.quoteCardBadge} onChange={e => setField('hero', 'quoteCardBadge', e.target.value)} />
              </Field>
              <Field label="Quote Card Title">
                <input className="ep-input" value={s.hero.quoteCardTitle} onChange={e => setField('hero', 'quoteCardTitle', e.target.value)} />
              </Field>
              <Field label="Quote Card Copy">
                <input className="ep-input" value={s.hero.quoteCardCopy} onChange={e => setField('hero', 'quoteCardCopy', e.target.value)} />
              </Field>
            </div>
          </SectionWrap>

          {/* Highlights */}
          <SectionWrap title="Service Highlights Strip" enabled={s.highlights.enabled} onToggle={() => toggleSection('highlights')}>
            <Field label="Highlight Cards">
              <CardListEditor
                value={s.highlights.cards}
                onChange={v => setField('highlights', 'cards', v)}
                fields={[{ key: 'title', label: 'Title' }, { key: 'copy', label: 'Copy', multiline: true }]}
                defaultItem={{ title: '', copy: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Standards */}
          <SectionWrap title="Process / Standards" enabled={s.standards.enabled} onToggle={() => toggleSection('standards')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.standards.heading} onChange={e => setField('standards', 'heading', e.target.value)} />
            </Field>
            <Field label="Section Sub-heading">
              <textarea className="ep-input ep-textarea" value={s.standards.subHeading} onChange={e => setField('standards', 'subHeading', e.target.value)} rows={2} />
            </Field>
            <Field label="Process Steps">
              <CardListEditor
                value={s.standards.cards}
                onChange={v => setField('standards', 'cards', v)}
                fields={[
                  { key: 'number', label: 'Number (e.g. 01)' },
                  { key: 'title',  label: 'Step Title' },
                  { key: 'copy',   label: 'Step Copy', multiline: true },
                ]}
                defaultItem={{ number: '', title: '', copy: '' }}
              />
            </Field>
          </SectionWrap>

          {/* CTA Band */}
          <SectionWrap title="CTA Band (Dark)" enabled={s.ctaBand.enabled} onToggle={() => toggleSection('ctaBand')}>
            <Field label="Headline">
              <input className="ep-input" value={s.ctaBand.headline} onChange={e => setField('ctaBand', 'headline', e.target.value)} />
            </Field>
            <Field label="Button Text">
              <input className="ep-input" value={s.ctaBand.buttonText} onChange={e => setField('ctaBand', 'buttonText', e.target.value)} />
            </Field>
          </SectionWrap>

          {/* Why */}
          <SectionWrap title="Why Clients Choose Us" enabled={s.why.enabled} onToggle={() => toggleSection('why')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.why.heading} onChange={e => setField('why', 'heading', e.target.value)} />
            </Field>
            <Field label="Intro Copy">
              <textarea className="ep-input ep-textarea" value={s.why.subCopy} onChange={e => setField('why', 'subCopy', e.target.value)} rows={2} />
            </Field>
            <Field label="Browser Mockup Hotspots (up to 4)">
              <CardListEditor
                value={s.why.hotspots.map(({ label, title, copy }) => ({ label, title, copy }))}
                onChange={v => setField('why', 'hotspots', v.map((item, i) => ({ id: i + 1, ...item })))}
                fields={[
                  { key: 'label', label: 'Hotspot Label' },
                  { key: 'title', label: 'Panel Title' },
                  { key: 'copy',  label: 'Panel Copy', multiline: true },
                ]}
                defaultItem={{ label: '', title: '', copy: '' }}
              />
            </Field>
            <Field label="Reason Cards">
              <CardListEditor
                value={s.why.reasons}
                onChange={v => setField('why', 'reasons', v)}
                fields={[
                  { key: 'title', label: 'Title' },
                  { key: 'copy',  label: 'Copy', multiline: true },
                ]}
                defaultItem={{ title: '', copy: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Longform */}
          <SectionWrap title="Long-Form / Sidebar" enabled={s.longform.enabled} onToggle={() => toggleSection('longform')}>
            <div className="ep-grid-2">
              <Field label="Kicker">
                <input className="ep-input" value={s.longform.kicker} onChange={e => setField('longform', 'kicker', e.target.value)} />
              </Field>
              <Field label="Section Heading">
                <input className="ep-input" value={s.longform.heading} onChange={e => setField('longform', 'heading', e.target.value)} />
              </Field>
            </div>
            <Field label="Body Copy">
              <textarea className="ep-input ep-textarea" value={s.longform.body} onChange={e => setField('longform', 'body', e.target.value)} rows={4} />
            </Field>
            <Field label="Checklist Items">
              <StringListEditor value={s.longform.checklist} onChange={v => setField('longform', 'checklist', v)} placeholder="Checklist item" />
            </Field>
            <Field label="Sidebar Title">
              <input className="ep-input" value={s.longform.sidebarTitle} onChange={e => setField('longform', 'sidebarTitle', e.target.value)} />
            </Field>
            <Field label="Sidebar Copy">
              <textarea className="ep-input ep-textarea" value={s.longform.sidebarCopy} onChange={e => setField('longform', 'sidebarCopy', e.target.value)} rows={3} />
            </Field>
            <Field label="Sidebar Checklist Items">
              <StringListEditor value={s.longform.sidebarChecklist} onChange={v => setField('longform', 'sidebarChecklist', v)} placeholder="Sidebar item" />
            </Field>
            <Field label="Sidebar CTA Text">
              <input className="ep-input" value={s.longform.sidebarCtaText} onChange={e => setField('longform', 'sidebarCtaText', e.target.value)} />
            </Field>
          </SectionWrap>

          {/* FAQ */}
          <SectionWrap title="FAQ" enabled={s.faq.enabled} onToggle={() => toggleSection('faq')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.faq.heading} onChange={e => setField('faq', 'heading', e.target.value)} />
            </Field>
            <Field label="FAQ Items">
              <CardListEditor
                value={s.faq.items}
                onChange={v => setField('faq', 'items', v)}
                fields={[
                  { key: 'question', label: 'Question' },
                  { key: 'answer',   label: 'Answer', multiline: true },
                ]}
                defaultItem={{ question: '', answer: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Promise */}
          <SectionWrap title="Promise / Proof" enabled={s.promise.enabled} onToggle={() => toggleSection('promise')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.promise.heading} onChange={e => setField('promise', 'heading', e.target.value)} />
            </Field>
            <Field label="Sub-copy">
              <textarea className="ep-input ep-textarea" value={s.promise.subCopy} onChange={e => setField('promise', 'subCopy', e.target.value)} rows={2} />
            </Field>
            <Field label="Credential Cards">
              <CardListEditor
                value={s.promise.cards}
                onChange={v => setField('promise', 'cards', v)}
                fields={[
                  { key: 'title', label: 'Title' },
                  { key: 'copy',  label: 'Copy', multiline: true },
                ]}
                defaultItem={{ title: '', copy: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Carousel */}
          <SectionWrap title="Work Carousel" enabled={s.carousel.enabled} onToggle={() => toggleSection('carousel')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.carousel.heading} onChange={e => setField('carousel', 'heading', e.target.value)} />
            </Field>
            <Field label="Slides">
              <CardListEditor
                value={s.carousel.slides}
                onChange={v => setField('carousel', 'slides', v)}
                fields={[
                  { key: 'tag',   label: 'Tag / Category' },
                  { key: 'title', label: 'Slide Title' },
                  { key: 'copy',  label: 'Slide Copy', multiline: true },
                ]}
                defaultItem={{ tag: '', title: '', copy: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Reviews */}
          <SectionWrap title="Reviews / Testimonials" enabled={s.reviews.enabled} onToggle={() => toggleSection('reviews')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.reviews.heading} onChange={e => setField('reviews', 'heading', e.target.value)} />
            </Field>
            <Field label="Sub-copy">
              <textarea className="ep-input ep-textarea" value={s.reviews.subCopy} onChange={e => setField('reviews', 'subCopy', e.target.value)} rows={2} />
            </Field>
            <Field label="Review Items">
              <CardListEditor
                value={s.reviews.items.map(r => ({ ...r, stars: String(r.stars) }))}
                onChange={v => setField('reviews', 'items', v.map(r => ({ ...r, stars: Number(r.stars) })))}
                fields={[
                  { key: 'stars', label: 'Stars (1–5)' },
                  { key: 'quote', label: 'Quote Text', multiline: true },
                  { key: 'name',  label: 'Reviewer Name' },
                ]}
                defaultItem={{ stars: '5', quote: '', name: '' }}
              />
            </Field>
          </SectionWrap>

          {/* Area */}
          <SectionWrap title="Service Area" enabled={s.area.enabled} onToggle={() => toggleSection('area')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.area.heading} onChange={e => setField('area', 'heading', e.target.value)} />
            </Field>
            <Field label="Copy">
              <textarea className="ep-input ep-textarea" value={s.area.copy} onChange={e => setField('area', 'copy', e.target.value)} rows={2} />
            </Field>
            <Field label="Area Chips">
              <StringListEditor value={s.area.chips} onChange={v => setField('area', 'chips', v)} placeholder="e.g. United States" />
            </Field>
          </SectionWrap>

          {/* Final Quote */}
          <SectionWrap title="Final Quote Form Section" enabled={s.finalQuote.enabled} onToggle={() => toggleSection('finalQuote')}>
            <Field label="Section Heading">
              <input className="ep-input" value={s.finalQuote.heading} onChange={e => setField('finalQuote', 'heading', e.target.value)} />
            </Field>
            <Field label="Copy">
              <textarea className="ep-input ep-textarea" value={s.finalQuote.copy} onChange={e => setField('finalQuote', 'copy', e.target.value)} rows={2} />
            </Field>
            <Field label="Checklist Items">
              <StringListEditor value={s.finalQuote.checklist} onChange={v => setField('finalQuote', 'checklist', v)} placeholder="Checklist item" />
            </Field>
          </SectionWrap>

          {/* Footer */}
          <SectionWrap title="Footer" enabled={s.footer.enabled} onToggle={() => toggleSection('footer')}>
            <div className="ep-grid-2">
              <Field label="Left Text">
                <input className="ep-input" value={s.footer.leftText} onChange={e => setField('footer', 'leftText', e.target.value)} />
              </Field>
              <Field label="Right Text">
                <input className="ep-input" value={s.footer.rightText} onChange={e => setField('footer', 'rightText', e.target.value)} />
              </Field>
            </div>
          </SectionWrap>

          {/* Mobile CTA */}
          <SectionWrap title="Sticky Mobile CTA" enabled={s.mobileCta.enabled} onToggle={() => toggleSection('mobileCta')}>
            <div className="ep-grid-3">
              <Field label="Primary Button Text">
                <input className="ep-input" value={s.mobileCta.primaryText} onChange={e => setField('mobileCta', 'primaryText', e.target.value)} />
              </Field>
              <Field label="Secondary Button Text">
                <input className="ep-input" value={s.mobileCta.secondaryText} onChange={e => setField('mobileCta', 'secondaryText', e.target.value)} />
              </Field>
              <Field label="Secondary Email">
                <input className="ep-input" type="email" value={s.mobileCta.secondaryEmail} onChange={e => setField('mobileCta', 'secondaryEmail', e.target.value)} />
              </Field>
            </div>
          </SectionWrap>
        </div>

        {/* Save */}
        <div className="ep-form-footer">
          <button type="button" className="ep-btn ep-btn-ghost" onClick={() => navigate('/admin/landing-pages')}>
            Cancel
          </button>
          <button type="submit" className="ep-btn ep-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Page'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
