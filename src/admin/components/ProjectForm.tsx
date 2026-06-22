import { useState, useRef, useCallback, type FormEvent, type KeyboardEvent, type DragEvent } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import { api } from '../../lib/api';
import type { Project } from '../../types';

const BASE_URL = 'https://carvelruss.com/case-studies/';

function toSlug(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Case Study Content Structure ──────────────────────────────

export type CsContent = {
  overview: string;
  background: string;
  challenge: string;
  objectives: string[];
  approach: string;
  solution: string;
  key_features: { title: string; description: string }[];
  development_process: string;
  challenges_solutions: { challenge: string; solution: string; result: string }[];
  results: string;
  screenshots: { url: string; caption: string }[];
  takeaways: string;
};

export const EMPTY_CS: CsContent = {
  overview: '', background: '', challenge: '', objectives: [],
  approach: '', solution: '', key_features: [], development_process: '',
  challenges_solutions: [], results: '', screenshots: [], takeaways: '',
};

const CS_SECTIONS = [
  { key: 'overview'              as const, label: 'Overview' },
  { key: 'background'            as const, label: 'Background' },
  { key: 'challenge'             as const, label: 'Challenge' },
  { key: 'objectives'            as const, label: 'Objectives' },
  { key: 'approach'              as const, label: 'Approach' },
  { key: 'solution'              as const, label: 'Solution' },
  { key: 'key_features'          as const, label: 'Key Features' },
  { key: 'development_process'   as const, label: 'Development Process' },
  { key: 'challenges_solutions'  as const, label: 'Challenges & Solutions' },
  { key: 'results'               as const, label: 'Results' },
  { key: 'screenshots'           as const, label: 'Screenshots' },
  { key: 'takeaways'             as const, label: 'Takeaways' },
];

type SectionKey = typeof CS_SECTIONS[number]['key'];

const PLACEHOLDERS: Partial<Record<SectionKey, string>> = {
  overview:            'Describe what this project is, who it serves, and what makes it unique...',
  background:          "Explain the client's business, target audience, and the situation before development...",
  challenge:           'Describe the problems that existed, user frustrations, and blocked business goals...',
  approach:            'Explain the overall strategy and methodology used to tackle this project...',
  solution:            'Describe the solution delivered — overall approach, UX, technical, and business improvements...',
  development_process: 'Walk through the technical implementation — frontend, backend, APIs, database, performance...',
  results:             'Describe outcomes, performance gains, UX improvements, and business impact...',
  takeaways:           'Share lessons learned, technical insights, and ideas for future improvements...',
};

export function parseCs(raw: string): CsContent {
  if (!raw) return { ...EMPTY_CS };
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object' && ('overview' in p || 'background' in p)) {
      return { ...EMPTY_CS, ...p };
    }
  } catch {}
  return { ...EMPTY_CS };
}

function hasContent(val: unknown): boolean {
  if (!val) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  return false;
}

function totalWordCount(cs: CsContent): number {
  return [
    cs.overview, cs.background, cs.challenge, cs.approach,
    cs.solution, cs.development_process, cs.results, cs.takeaways,
    ...cs.objectives,
    ...cs.key_features.flatMap(f => [f.title, f.description]),
    ...cs.challenges_solutions.flatMap(c => [c.challenge, c.solution, c.result]),
  ].join(' ').trim().split(/\s+/).filter(Boolean).length;
}

// ── Section sub-editors ────────────────────────────────────────

function ObjectivesPanel({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const update = (i: number, v: string) => { const a = [...value]; a[i] = v; onChange(a); };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, '']);
  return (
    <div className="cs-list-editor">
      <p className="cs-list-editor__hint">List the main goals and deliverables. Press Enter to add the next one.</p>
      {value.map((obj, i) => (
        <div key={i} className="cs-list-editor__row">
          <span className="cs-list-editor__bullet">•</span>
          <input
            className="a-input"
            value={obj}
            onChange={e => update(i, e.target.value)}
            placeholder={`Objective ${i + 1}`}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
          <button type="button" className="cs-list-editor__remove" onClick={() => remove(i)}>×</button>
        </div>
      ))}
      <button type="button" className="cs-list-editor__add" onClick={add}>+ Add Objective</button>
    </div>
  );
}

function FeaturesPanel({
  value, onChange,
}: { value: { title: string; description: string }[]; onChange: (v: { title: string; description: string }[]) => void }) {
  const update = (i: number, field: 'title' | 'description', v: string) => {
    const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { title: '', description: '' }]);
  return (
    <div className="cs-card-editor">
      {value.map((f, i) => (
        <div key={i} className="cs-card-editor__card">
          <div className="cs-card-editor__header">
            <span className="cs-card-editor__num">Feature {i + 1}</span>
            <button type="button" className="cs-list-editor__remove" onClick={() => remove(i)}>×</button>
          </div>
          <input
            className="a-input"
            value={f.title}
            onChange={e => update(i, 'title', e.target.value)}
            placeholder="Feature name"
          />
          <textarea
            className="a-textarea"
            rows={3}
            value={f.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="What it does and why it matters..."
          />
        </div>
      ))}
      <button type="button" className="cs-list-editor__add" onClick={add}>+ Add Feature</button>
    </div>
  );
}

function ChallengesPanel({
  value, onChange,
}: { value: { challenge: string; solution: string; result: string }[]; onChange: (v: { challenge: string; solution: string; result: string }[]) => void }) {
  const update = (i: number, field: 'challenge' | 'solution' | 'result', v: string) => {
    const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { challenge: '', solution: '', result: '' }]);
  return (
    <div className="cs-card-editor">
      {value.map((c, i) => (
        <div key={i} className="cs-card-editor__card">
          <div className="cs-card-editor__header">
            <span className="cs-card-editor__num">Entry {i + 1}</span>
            <button type="button" className="cs-list-editor__remove" onClick={() => remove(i)}>×</button>
          </div>
          {(['challenge', 'solution', 'result'] as const).map(field => (
            <div key={field} className="a-field">
              <label className="a-field__label" style={{ textTransform: 'capitalize' }}>{field}</label>
              <textarea
                className="a-textarea"
                rows={2}
                value={c[field]}
                onChange={e => update(i, field, e.target.value)}
                placeholder={
                  field === 'challenge' ? 'What was the obstacle?' :
                  field === 'solution'  ? 'How was it resolved?' :
                                         'What was the outcome?'
                }
              />
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="cs-list-editor__add" onClick={add}>+ Add Entry</button>
    </div>
  );
}

function ScreenshotsPanel({
  value, onChange,
}: { value: { url: string; caption: string }[]; onChange: (v: { url: string; caption: string }[]) => void }) {
  const update = (i: number, field: 'url' | 'caption', v: string) => {
    const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a);
  };
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add    = () => onChange([...value, { url: '', caption: '' }]);
  return (
    <div className="cs-card-editor">
      {value.map((s, i) => (
        <div key={i} className="cs-card-editor__card">
          <div className="cs-card-editor__header">
            <span className="cs-card-editor__num">Screenshot {i + 1}</span>
            <button type="button" className="cs-list-editor__remove" onClick={() => remove(i)}>×</button>
          </div>
          {s.url && (
            <img
              src={s.url}
              alt={s.caption || `Screenshot ${i + 1}`}
              style={{ width: '100%', borderRadius: 6, border: '1px solid #e5e7eb', maxHeight: 140, objectFit: 'cover' }}
            />
          )}
          <div className="a-field">
            <label className="a-field__label">Image URL</label>
            <input className="a-input" type="url" value={s.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://…" />
          </div>
          <div className="a-field">
            <label className="a-field__label">Caption</label>
            <input className="a-input" value={s.caption} onChange={e => update(i, 'caption', e.target.value)} placeholder="Describe what's shown…" />
          </div>
        </div>
      ))}
      <button type="button" className="cs-list-editor__add" onClick={add}>+ Add Screenshot</button>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────

type Tab = 'details' | 'content';

interface Props {
  project?: Project;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSaved, onCancel }: Props) {
  const isEdit = !!project;

  const [tab, setTab]               = useState<Tab>('details');
  const [title, setTitle]           = useState(project?.title       ?? '');
  const [description, setDesc]      = useState(project?.description ?? '');
  const [tech, setTech]             = useState<string[]>(project?.tech ?? []);
  const [techInput, setTI]          = useState('');
  const [role, setRole]             = useState(project?.role         ?? '');
  const [clientName, setClientName] = useState(project?.client_name ?? '');
  const [projectType, setProjType]  = useState(project?.project_type ?? '');
  const [timeline, setTimeline]     = useState(project?.timeline     ?? '');
  const [logoUrl, setLogoUrl]       = useState(project?.logo_url     ?? '');
  const [status, setStatus]         = useState<'draft' | 'published'>(project?.status ?? 'draft');
  const [featured, setFeatured]     = useState(!!project?.featured);
  const [liveUrl, setLiveUrl]       = useState(project?.live_url          ?? '');
  const [caseUrl, setCaseUrl]       = useState(project?.case_study_url    ?? '');
  const [coverUrl, setCoverUrl]     = useState<string>(project?.cover_url ?? '');
  const [sections, setSections]     = useState<CsContent>(() => parseCs(project?.content ?? ''));
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [dragOver, setDragOver]     = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');

  const caseUrlEdited = useRef(!!project?.case_study_url);
  const fileInputRef  = useRef<HTMLInputElement>(null);

  const setSection = <K extends SectionKey>(key: K, val: CsContent[K]) =>
    setSections(prev => ({ ...prev, [key]: val }));

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!caseUrlEdited.current) setCaseUrl(val.trim() ? BASE_URL + toSlug(val) : '');
  };

  const addChip = () => {
    const val = techInput.trim();
    if (val && !tech.includes(val)) setTech(prev => [...prev, val]);
    setTI('');
  };
  const removeChip = (c: string) => setTech(prev => prev.filter(t => t !== c));
  const handleTechKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip(); }
    else if (e.key === 'Backspace' && !techInput && tech.length) setTech(p => p.slice(0, -1));
  };

  const uploadFile = useCallback(async (file: File) => {
    setUploadError('');
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setCoverUrl(url);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDragOver  = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim())       { setError('Title is required');       setTab('details'); return; }
    if (!description.trim()) { setError('Description is required'); setTab('details'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        title:          title.trim(),
        slug:           toSlug(title),
        description:    description.trim(),
        content:        JSON.stringify(sections),
        tech,
        role:           role.trim(),
        client_name:    clientName.trim()   || null,
        project_type:   projectType.trim()  || null,
        timeline:       timeline.trim()     || null,
        logo_url:       logoUrl.trim()      || null,
        cover_url:      coverUrl            || null,
        live_url:       liveUrl             || null,
        case_study_url: caseUrl             || null,
        github_url:     null,
        sort_order:     project?.sort_order ?? 0,
        status,
        featured:       featured ? 1 : 0,
      };
      if (isEdit && project?.id) await api.updateProject(project.id, payload);
      else                       await api.createProject(payload);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const wc = totalWordCount(sections);

  function renderSectionPanel() {
    const key = activeSection;
    if (key === 'objectives')
      return <ObjectivesPanel value={sections.objectives} onChange={v => setSection('objectives', v)} />;
    if (key === 'key_features')
      return <FeaturesPanel value={sections.key_features} onChange={v => setSection('key_features', v)} />;
    if (key === 'challenges_solutions')
      return <ChallengesPanel value={sections.challenges_solutions} onChange={v => setSection('challenges_solutions', v)} />;
    if (key === 'screenshots')
      return <ScreenshotsPanel value={sections.screenshots} onChange={v => setSection('screenshots', v)} />;
    return (
      <textarea
        className="cs-editor__textarea"
        value={sections[key] as string}
        onChange={e => setSection(key, e.target.value as CsContent[typeof key])}
        placeholder={PLACEHOLDERS[key] ?? ''}
      />
    );
  }

  return (
    <div className="a-modal-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit project' : 'Add project'}>
      <div className="a-modal a-modal--lg">

        {/* ── Header ── */}
        <div className="a-modal__header">
          <div>
            <h2 className="a-modal__title">{isEdit ? 'Edit Project' : 'Add Project'}</h2>
            <p className="a-modal__sub">
              {isEdit ? `Editing "${title || 'Untitled'}"` : 'Add a new case study to your portfolio'}
            </p>
          </div>
          <button className="a-modal__close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        {/* ── Tabs ── */}
        <div className="a-modal__tabs">
          <button
            type="button"
            className={`a-modal__tab${tab === 'details' ? ' is-active' : ''}`}
            onClick={() => setTab('details')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Details
          </button>
          <button
            type="button"
            className={`a-modal__tab${tab === 'content' ? ' is-active' : ''}`}
            onClick={() => setTab('content')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Case Study
            {wc > 0 && (
              <span style={{ fontSize: 10, background: '#eef2ff', color: '#6366f1', borderRadius: 10, padding: '1px 6px', marginLeft: 2 }}>
                {wc}w
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="a-modal__body">
            {error && (
              <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 18 }}>
                {error}
              </div>
            )}

            {/* ─── Details tab ─── */}
            {tab === 'details' && (
              <div className="a-form">

                {/* Cover Photo */}
                <div className="a-field">
                  <label className="a-field__label">Cover Photo</label>
                  <div
                    className={`a-dropzone${dragOver ? ' a-dropzone--over' : ''}${uploading ? ' a-dropzone--uploading' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload cover photo"
                    onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    {coverUrl ? (
                      <div className="a-dropzone__preview">
                        <img src={coverUrl} alt="Cover preview" />
                        <button
                          type="button"
                          className="a-dropzone__remove"
                          onClick={e => { e.stopPropagation(); setCoverUrl(''); }}
                          aria-label="Remove cover photo"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="a-dropzone__prompt">
                        <FiUploadCloud size={28} className="a-dropzone__icon" />
                        {uploading ? (
                          <span className="a-dropzone__label">Uploading…</span>
                        ) : (
                          <>
                            <span className="a-dropzone__label">
                              <strong>Click to upload</strong> or drag &amp; drop
                            </span>
                            <span className="a-dropzone__hint">PNG, JPG, WebP — max 5 MB</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {uploadError && <span className="a-field__error">{uploadError}</span>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    hidden
                    onChange={handleFileChange}
                  />
                </div>

                {/* Title */}
                <div className="a-field">
                  <label className="a-field__label" htmlFor="pf-title">
                    Title <span className="a-req">*</span>
                  </label>
                  <input
                    id="pf-title"
                    className="a-input"
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. HealthTrack Dashboard"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div className="a-field">
                  <label className="a-field__label" htmlFor="pf-desc">
                    Description <span className="a-req">*</span>
                  </label>
                  <textarea
                    id="pf-desc"
                    className="a-textarea"
                    rows={3}
                    value={description}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="What did you build and what was the impact?"
                  />
                  <span className="a-field__hint">{description.length} / 200 chars — shown on project cards</span>
                </div>

                {/* Client + Project Type */}
                <div className="a-input-row">
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="pf-client">Client Name</label>
                    <input
                      id="pf-client"
                      className="a-input"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="e.g. Smash Interactive Agency"
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="pf-type">Project Type</label>
                    <input
                      id="pf-type"
                      className="a-input"
                      value={projectType}
                      onChange={e => setProjType(e.target.value)}
                      placeholder="e.g. Website Design"
                    />
                  </div>
                </div>

                {/* Role + Timeline */}
                <div className="a-input-row">
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="pf-role">Your Role</label>
                    <input
                      id="pf-role"
                      className="a-input"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="e.g. Lead UI/UX Designer"
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="pf-timeline">Timeline</label>
                    <input
                      id="pf-timeline"
                      className="a-input"
                      value={timeline}
                      onChange={e => setTimeline(e.target.value)}
                      placeholder="e.g. 3 months"
                    />
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="a-field">
                  <label className="a-field__label">Tech Stack</label>
                  <div className="a-chips" onClick={() => document.getElementById('pf-tech')?.focus()}>
                    {tech.map(chip => (
                      <span key={chip} className="a-chip">
                        {chip}
                        <button type="button" onClick={() => removeChip(chip)} aria-label={`Remove ${chip}`}>×</button>
                      </span>
                    ))}
                    <input
                      id="pf-tech"
                      value={techInput}
                      onChange={e => setTI(e.target.value)}
                      onKeyDown={handleTechKey}
                      onBlur={addChip}
                      placeholder={tech.length ? '' : 'React, Figma… Enter to add'}
                      aria-label="Add technology"
                    />
                  </div>
                </div>

                {/* Logo + Status + Featured */}
                <div className="a-input-row">
                  <div className="a-field" style={{ flex: '1.4' }}>
                    <label className="a-field__label" htmlFor="pf-logo">Client Logo URL</label>
                    <input
                      id="pf-logo"
                      className="a-input"
                      type="url"
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="a-field">
                    <label className="a-field__label" htmlFor="pf-status">Status</label>
                    <select
                      id="pf-status"
                      className="a-input"
                      value={status}
                      onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="a-field" style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label className="a-field__label" style={{ visibility: 'hidden' }}>Featured</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer', height: 38 }}>
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                      />
                      Featured
                    </label>
                  </div>
                </div>

                {/* URLs */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748b', marginBottom: 12 }}>
                    Links
                  </div>
                  <div className="a-input-row">
                    <div className="a-field">
                      <label className="a-field__label" htmlFor="pf-live">Live URL</label>
                      <input id="pf-live" className="a-input" type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://…" />
                    </div>
                    <div className="a-field">
                      <label className="a-field__label" htmlFor="pf-case">Case Study URL</label>
                      <input
                        id="pf-case"
                        className="a-input"
                        type="url"
                        value={caseUrl}
                        onChange={e => { caseUrlEdited.current = true; setCaseUrl(e.target.value); }}
                        placeholder="https://…"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ─── Case Study tab ─── */}
            {tab === 'content' && (
              <div className="cs-editor">
                <nav className="cs-editor__nav" aria-label="Case study sections">
                  {CS_SECTIONS.map(({ key, label }, i) => (
                    <button
                      key={key}
                      type="button"
                      className={`cs-editor__nav-item${activeSection === key ? ' is-active' : ''}`}
                      onClick={() => setActiveSection(key)}
                    >
                      <span className="cs-editor__num">{i + 1}</span>
                      <span>{label}</span>
                      {hasContent(sections[key]) && <span className="cs-editor__dot" />}
                    </button>
                  ))}
                </nav>
                <div className="cs-editor__panel">
                  {renderSectionPanel()}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="a-modal__footer">
            <button type="button" className="a-btn a-btn--ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            {tab === 'details' && (
              <button type="button" className="a-btn a-btn--ghost" onClick={() => setTab('content')}>
                Case Study →
              </button>
            )}
            <button type="submit" className="a-btn a-btn--primary" disabled={saving || uploading}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
