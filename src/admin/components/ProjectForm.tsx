import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { api } from '../../lib/api';
import type { Project } from '../../types';

const BASE_URL = 'https://carvelruss.com/case-studies/';

function toSlug(text: string) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

interface Props {
  project?: Project;
  onSaved: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSaved, onCancel }: Props) {
  const isEdit = !!project;

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [tech, setTech] = useState<string[]>(project?.tech ?? []);
  const [techInput, setTechInput] = useState('');
  const [role, setRole] = useState(project?.role ?? '');
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? '');
  const [caseUrl, setCaseUrl] = useState(project?.case_study_url ?? '');
  const [content, setContent] = useState(project?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const caseUrlEdited = useRef(!!project?.case_study_url);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!caseUrlEdited.current) {
      setCaseUrl(val.trim() ? BASE_URL + toSlug(val) : '');
    }
  };

  const addChip = () => {
    const val = techInput.trim();
    if (val && !tech.includes(val)) {
      setTech(prev => [...prev, val]);
    }
    setTechInput('');
  };

  const removeChip = (chip: string) => setTech(prev => prev.filter(t => t !== chip));

  const handleTechKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip();
    } else if (e.key === 'Backspace' && !techInput && tech.length) {
      setTech(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!description.trim()) { setError('Description is required'); return; }
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
      if (isEdit && project?.id) {
        await api.updateProject(project.id, payload);
      } else {
        await api.createProject(payload);
      }
      onSaved();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="a-modal-overlay" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit project' : 'Add project'}>
      <div className="a-modal">
        <div className="a-modal__header">
          <h2 className="a-modal__title">{isEdit ? 'Edit Project' : 'Add Project'}</h2>
          <button className="a-modal__close" onClick={onCancel} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="a-modal__body">
            {error && <div className="a-alert a-alert--error" role="alert">{error}</div>}

            <div className="a-form">
              <div className="a-field">
                <label className="a-field__label" htmlFor="pf-title">Title <span className="a-req">*</span></label>
                <input id="pf-title" className="a-input" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. HealthTrack Dashboard" required />
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="pf-desc">Description <span className="a-req">*</span></label>
                <textarea id="pf-desc" className="a-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you build? What was the impact?" required />
              </div>

              <div className="a-field">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
                  <label className="a-field__label" htmlFor="pf-content" style={{ marginBottom: 0 }}>Case Study Content</label>
                  <span className="a-field__hint" style={{ marginTop: 0 }}>Markdown supported</span>
                </div>
                <textarea id="pf-content" className="a-textarea a-textarea--tall" value={content} onChange={e => setContent(e.target.value)} placeholder="Write the full case study here. Use ## headings, **bold**, bullet lists, etc." />
              </div>

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
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={handleTechKey}
                    onBlur={addChip}
                    placeholder={tech.length ? '' : 'React, Figma… press Enter to add'}
                    aria-label="Add technology"
                  />
                </div>
                <span className="a-field__hint">Press Enter or comma to add each item</span>
              </div>

              <div className="a-field">
                <label className="a-field__label" htmlFor="pf-role">Your Role</label>
                <input id="pf-role" className="a-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Lead UI/UX Designer" />
              </div>

              <div className="a-input-row">
                <div className="a-field">
                  <label className="a-field__label" htmlFor="pf-live">Live URL</label>
                  <input id="pf-live" className="a-input" type="url" value={liveUrl} onChange={e => setLiveUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="a-field">
                  <label className="a-field__label" htmlFor="pf-case">Case Study URL</label>
                  <input id="pf-case" className="a-input" type="url" value={caseUrl} onChange={e => { caseUrlEdited.current = true; setCaseUrl(e.target.value); }} placeholder="https://…" />
                </div>
              </div>

            </div>
          </div>

          <div className="a-modal__footer">
            <button type="button" className="a-btn a-btn--ghost" onClick={onCancel} disabled={saving}>Cancel</button>
            <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
