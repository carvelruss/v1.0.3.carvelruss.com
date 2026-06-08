import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { api } from '../../lib/api';
import type { Project } from '../../types';

const TINYMCE_CDN = 'https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js';
const BASE_URL    = 'https://carvelruss.com/case-studies/';

function toSlug(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type Tab = 'details' | 'content';

interface Props {
  project?: Project;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSaved, onCancel }: Props) {
  const isEdit = !!project;
  const [tab, setTab]         = useState<Tab>('details');
  const [title, setTitle]     = useState(project?.title ?? '');
  const [description, setDesc]= useState(project?.description ?? '');
  const [tech, setTech]       = useState<string[]>(project?.tech ?? []);
  const [techInput, setTI]    = useState('');
  const [role, setRole]       = useState(project?.role ?? '');
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? '');
  const [caseUrl, setCaseUrl] = useState(project?.case_study_url ?? '');
  const [content, setContent] = useState(project?.content ?? '');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const caseUrlEdited = useRef(!!project?.case_study_url);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim())       { setError('Title is required');       setTab('details'); return; }
    if (!description.trim()) { setError('Description is required'); setTab('details'); return; }
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: toSlug(title),
        description: description.trim(),
        content,
        tech,
        role: role.trim(),
        live_url: liveUrl || null,
        case_study_url: caseUrl || null,
        github_url: null,
        sort_order: project?.sort_order ?? 0,
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

  const contentWordCount = content.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="a-modal-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit project' : 'Add project'}>
      <div className="a-modal a-modal--lg">

        {/* ── Header ── */}
        <div className="a-modal__header">
          <div>
            <h2 className="a-modal__title">{isEdit ? 'Edit Project' : 'Add Project'}</h2>
            <p className="a-modal__sub">
              {isEdit
                ? `Editing "${title || 'Untitled'}"`
                : 'Add a new case study to your portfolio'}
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
            {contentWordCount > 0 && (
              <span style={{ fontSize: 10, background: '#eef2ff', color: '#6366f1', borderRadius: 10, padding: '1px 6px', marginLeft: 2 }}>
                {contentWordCount}w
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

                {/* Title + Description */}
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

                {/* Role + Tech */}
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
                  <div className="a-field" style={{ flex: '1.4' }}>
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

            {/* ─── Content tab ─── */}
            {tab === 'content' && (
              <div>
                <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 14, lineHeight: 1.5 }}>
                  Write the full case study. Use headings, bullet lists, and images to tell the story of your work.
                </p>
                <Editor
                  tinymceScriptSrc={TINYMCE_CDN}
                  value={content}
                  onEditorChange={(val: string) => setContent(val)}
                  init={{
                    license_key: 'gpl',
                    height: 460,
                    menubar: false,
                    branding: false,
                    resize: false,
                    skin: 'oxide',
                    plugins: 'lists link image code table searchreplace wordcount fullscreen autolink',
                    toolbar:
                      'undo redo | blocks | bold italic underline | ' +
                      'bullist numlist | link image | table | code fullscreen',
                    block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Blockquote=blockquote',
                    content_style: [
                      'body {',
                      '  font-family: Inter, system-ui, -apple-system, sans-serif;',
                      '  font-size: 14px;',
                      '  color: #0f172a;',
                      '  line-height: 1.72;',
                      '  padding: 12px 18px;',
                      '  margin: 0;',
                      '}',
                      'h2 { font-size: 1.25em; font-weight: 700; margin: 1em 0 .35em; }',
                      'h3 { font-size: 1.05em; font-weight: 700; margin: .875em 0 .3em; }',
                      'a  { color: #6366f1; }',
                      'blockquote { border-left: 3px solid #6366f1; margin: .875em 0; padding: 8px 14px; background: #eef2ff; border-radius: 0 5px 5px 0; }',
                      'table { border-collapse: collapse; width: 100%; }',
                      'td, th { border: 1px solid #e5e7eb; padding: 6px 10px; font-size: .9em; }',
                      'th { background: #f6f8fb; font-weight: 600; }',
                    ].join('\n'),
                    link_default_target: '_blank',
                    link_assume_external_targets: true,
                    image_advtab: true,
                    statusbar: true,
                    elementpath: false,
                    wordcount_countregex: /[\w’\x27-]+/g,
                  }}
                />
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
            <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
