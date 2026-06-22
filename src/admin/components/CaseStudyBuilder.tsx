import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import {
  FiChevronDown, FiChevronUp, FiCheck,
  FiPlus, FiTrash2, FiUploadCloud, FiDownload, FiCopy,
} from 'react-icons/fi';
import { api } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────

export type Feature = {
  title: string;
  description: string;
  user_benefit: string;
  business_benefit: string;
};

export type ChallengeEntry = {
  challenge: string;
  solution: string;
  result: string;
};

export type Screenshot = {
  url: string;
  caption: string;
  category: 'desktop' | 'mobile' | 'dashboard' | 'other';
};

export type BuilderData = {
  // Card 1
  industry: string;
  overview: string;
  // Card 2
  about_client: string;
  target_audience: string;
  business_context: string;
  existing_situation: string;
  // Card 3
  main_challenge: string;
  pain_points: string[];
  business_impact: string;
  why_new_solution: string;
  // Card 4
  objectives: string[];
  // Card 5
  discovery: string;
  research: string;
  competitor_analysis: string;
  planning: string;
  strategy: string;
  technical_considerations: string;
  // Card 6
  solution_summary: string;
  how_solved: string;
  ux_improvements: string;
  technical_improvements: string;
  business_improvements: string;
  // Card 7
  key_features: Feature[];
  // Card 8
  frontend_tech: string[];
  backend_tech: string[];
  database_tech: string[];
  apis_integrations: string;
  architecture: string;
  security: string;
  performance: string;
  scalability: string;
  deployment: string;
  // Card 9
  challenges_solutions: ChallengeEntry[];
  // Card 10
  project_outcomes: string;
  performance_improvements: string;
  business_benefits: string;
  client_feedback: string;
  achievements: string[];
  // Card 11
  screenshots: Screenshot[];
  // Card 12
  lessons_learned: string;
  technical_insights: string;
  ux_insights: string;
  business_insights: string;
  future_improvements: string;
};

export const EMPTY_BUILDER: BuilderData = {
  industry: '', overview: '',
  about_client: '', target_audience: '', business_context: '', existing_situation: '',
  main_challenge: '', pain_points: [], business_impact: '', why_new_solution: '',
  objectives: [],
  discovery: '', research: '', competitor_analysis: '', planning: '', strategy: '', technical_considerations: '',
  solution_summary: '', how_solved: '', ux_improvements: '', technical_improvements: '', business_improvements: '',
  key_features: [],
  frontend_tech: [], backend_tech: [], database_tech: [],
  apis_integrations: '', architecture: '', security: '', performance: '', scalability: '', deployment: '',
  challenges_solutions: [],
  project_outcomes: '', performance_improvements: '', business_benefits: '', client_feedback: '', achievements: [],
  screenshots: [],
  lessons_learned: '', technical_insights: '', ux_insights: '', business_insights: '', future_improvements: '',
};

export function parseBuilderData(raw: string): BuilderData {
  if (!raw) return { ...EMPTY_BUILDER };
  try {
    const p = JSON.parse(raw);
    if (p && typeof p === 'object') return { ...EMPTY_BUILDER, ...p };
  } catch {}
  return { ...EMPTY_BUILDER };
}

// ── Markdown Generator ─────────────────────────────────────────────────

interface ProjectMeta {
  title?: string;
  role?: string;
  tech?: string[];
  timeline?: string;
  client_name?: string;
  project_type?: string;
}

function generateMarkdown(d: BuilderData, meta: ProjectMeta): string {
  const lines: string[] = [];
  const push  = (s: string) => lines.push(s);
  const blank = () => lines.push('');
  const h2    = (t: string) => { blank(); push(`## ${t}`); blank(); };
  const h3    = (t: string) => { blank(); push(`### ${t}`); blank(); };
  const body  = (s: string) => { if (s.trim()) { push(s.trim()); blank(); } };
  const list  = (items: string[]) => {
    const f = items.filter(i => i.trim());
    if (f.length) { f.forEach(i => push(`- ${i}`)); blank(); }
  };

  push(`# ${meta.title || 'Case Study'}`);
  const cats = [meta.project_type, d.industry].filter(Boolean).join(' — ');
  if (cats) { push(`**${cats}**`); blank(); }
  body(d.overview);

  const metaRows = [
    meta.role        && `| Role        | ${meta.role} |`,
    meta.timeline    && `| Timeline    | ${meta.timeline} |`,
    meta.client_name && `| Client      | ${meta.client_name} |`,
    meta.tech?.length && `| Tech Stack  | ${meta.tech!.join(', ')} |`,
  ].filter(Boolean) as string[];
  if (metaRows.length) { push('| | |'); push('|---|---|'); metaRows.forEach(r => push(r)); blank(); }

  if (d.about_client || d.target_audience || d.business_context || d.existing_situation) {
    h2('Background');
    body(d.about_client);
    if (d.target_audience) { push(`**Target Audience:** ${d.target_audience}`); blank(); }
    body(d.business_context);
    body(d.existing_situation);
  }

  if (d.main_challenge || d.pain_points.length || d.business_impact || d.why_new_solution) {
    h2('The Challenge');
    body(d.main_challenge);
    if (d.pain_points.filter(p => p.trim()).length) { push('**Pain Points:**'); list(d.pain_points); }
    body(d.business_impact);
    body(d.why_new_solution);
  }

  if (d.objectives.filter(o => o.trim()).length) { h2('Objectives'); list(d.objectives); }

  if (d.discovery || d.research || d.competitor_analysis || d.planning || d.strategy || d.technical_considerations) {
    h2('Approach');
    if (d.discovery)                { h3('Discovery');                body(d.discovery); }
    if (d.research)                 { h3('Research');                 body(d.research); }
    if (d.competitor_analysis)      { h3('Competitor Analysis');      body(d.competitor_analysis); }
    if (d.planning)                 { h3('Planning');                 body(d.planning); }
    if (d.strategy)                 { h3('Strategy');                 body(d.strategy); }
    if (d.technical_considerations) { h3('Technical Considerations'); body(d.technical_considerations); }
  }

  if (d.solution_summary || d.how_solved || d.ux_improvements || d.technical_improvements || d.business_improvements) {
    h2('Solution');
    body(d.solution_summary);
    if (d.how_solved)             { h3('How the Solution Solved the Problem'); body(d.how_solved); }
    if (d.ux_improvements)        { h3('UX Improvements');            body(d.ux_improvements); }
    if (d.technical_improvements) { h3('Technical Improvements');     body(d.technical_improvements); }
    if (d.business_improvements)  { h3('Business Improvements');      body(d.business_improvements); }
  }

  if (d.key_features.length) {
    h2('Key Features');
    d.key_features.filter(f => f.title).forEach(f => {
      h3(f.title);
      body(f.description);
      if (f.user_benefit)     { push(`**User Benefit:** ${f.user_benefit}`);     blank(); }
      if (f.business_benefit) { push(`**Business Benefit:** ${f.business_benefit}`); blank(); }
    });
  }

  const hasDev = d.frontend_tech.length || d.backend_tech.length || d.database_tech.length ||
    d.apis_integrations || d.architecture || d.security || d.performance || d.scalability || d.deployment;
  if (hasDev) {
    h2('Development Process');
    if (d.frontend_tech.length) { push(`**Frontend:** ${d.frontend_tech.join(', ')}`); blank(); }
    if (d.backend_tech.length)  { push(`**Backend:** ${d.backend_tech.join(', ')}`);  blank(); }
    if (d.database_tech.length) { push(`**Database:** ${d.database_tech.join(', ')}`); blank(); }
    if (d.apis_integrations)    { h3('APIs & Integrations'); body(d.apis_integrations); }
    if (d.architecture)         { h3('Architecture');        body(d.architecture); }
    if (d.security)             { h3('Security');            body(d.security); }
    if (d.performance)          { h3('Performance');         body(d.performance); }
    if (d.scalability)          { h3('Scalability');         body(d.scalability); }
    if (d.deployment)           { h3('Deployment');          body(d.deployment); }
  }

  if (d.challenges_solutions.length) {
    h2('Challenges & Solutions');
    d.challenges_solutions.forEach((c, i) => {
      if (c.challenge || c.solution || c.result) {
        h3(`Challenge ${i + 1}`);
        if (c.challenge) { push(`**Challenge:** ${c.challenge}`); blank(); }
        if (c.solution)  { push(`**Solution:** ${c.solution}`);  blank(); }
        if (c.result)    { push(`**Result:** ${c.result}`);      blank(); }
      }
    });
  }

  if (d.project_outcomes || d.performance_improvements || d.business_benefits || d.client_feedback || d.achievements.length) {
    h2('Results & Outcomes');
    body(d.project_outcomes);
    if (d.performance_improvements) { h3('Performance'); body(d.performance_improvements); }
    if (d.business_benefits)        { h3('Business Benefits'); body(d.business_benefits); }
    if (d.achievements.filter(a => a.trim()).length) { push('**Key Achievements:**'); list(d.achievements); }
    if (d.client_feedback) { push(`> ${d.client_feedback}`); blank(); }
  }

  if (d.lessons_learned || d.technical_insights || d.ux_insights || d.business_insights || d.future_improvements) {
    h2('Key Takeaways');
    body(d.lessons_learned);
    if (d.technical_insights)  { h3('Technical Insights');  body(d.technical_insights); }
    if (d.ux_insights)         { h3('UX Insights');         body(d.ux_insights); }
    if (d.business_insights)   { h3('Business Insights');   body(d.business_insights); }
    if (d.future_improvements) { h3('Future Improvements'); body(d.future_improvements); }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ── BuilderCard ────────────────────────────────────────────────────────

interface BuilderCardProps {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function BuilderCard({ number, title, description, isComplete, defaultOpen = false, children }: BuilderCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`bld-card${open ? ' bld-card--open' : ''}${isComplete ? ' bld-card--done' : ''}`}>
      <button type="button" className="bld-card__header" onClick={() => setOpen(o => !o)}>
        <span className={`bld-card__num${isComplete ? ' bld-card__num--done' : ''}`}>
          {isComplete ? <FiCheck size={11} /> : number}
        </span>
        <span className="bld-card__meta">
          <span className="bld-card__title">{title}</span>
          {!open && isComplete && <span className="bld-card__pill">Complete</span>}
        </span>
        <span className="bld-card__chevron">
          {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      </button>
      {open && (
        <div className="bld-card__body">
          <p className="bld-card__desc">{description}</p>
          {children}
        </div>
      )}
    </div>
  );
}

// ── TagInput ────────────────────────────────────────────────────────────

function TagInput({ id, value, onChange, placeholder = 'Type and press Enter to add' }: {
  id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };
  return (
    <div className="bld-tags" onClick={() => document.getElementById(id || '')?.focus()}>
      {value.map((tag, i) => (
        <span key={i} className="bld-tag">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${tag}`}>×</button>
        </span>
      ))}
      <input
        id={id}
        className="bld-tags__input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}

// ── Repeater ────────────────────────────────────────────────────────────

function Repeater({ value, onChange, placeholder = 'Add item', addLabel = '+ Add Item' }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string;
}) {
  const update = (i: number, v: string) => { const a = [...value]; a[i] = v; onChange(a); };
  const add    = () => onChange([...value, '']);
  return (
    <div className="bld-repeater">
      {value.map((item, i) => (
        <div key={i} className="bld-repeater__row">
          <input
            className="a-input"
            value={item}
            onChange={e => update(i, e.target.value)}
            placeholder={placeholder}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
          <button type="button" className="bld-repeater__remove" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
            <FiTrash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}>
        <FiPlus size={13} /> {addLabel}
      </button>
    </div>
  );
}

// ── Feature Repeater ────────────────────────────────────────────────────

function FeatureRepeater({ value, onChange }: { value: Feature[]; onChange: (v: Feature[]) => void }) {
  const update = (i: number, field: keyof Feature, v: string) => {
    const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a);
  };
  const add    = () => onChange([...value, { title: '', description: '', user_benefit: '', business_benefit: '' }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="bld-features">
      {value.map((f, i) => (
        <div key={i} className="bld-feature-card">
          <div className="bld-feature-card__head">
            <span className="bld-feature-card__label">Feature {i + 1}</span>
            <button type="button" className="bld-repeater__remove" onClick={() => remove(i)} aria-label="Remove feature">
              <FiTrash2 size={13} />
            </button>
          </div>
          <div className="a-field">
            <label className="a-field__label">Feature Name</label>
            <input className="a-input" value={f.title} onChange={e => update(i, 'title', e.target.value)} placeholder="e.g. User Authentication, Real-time Search" />
          </div>
          <div className="a-field">
            <label className="a-field__label">Description</label>
            <textarea className="a-textarea" rows={2} value={f.description} onChange={e => update(i, 'description', e.target.value)} placeholder="What does this feature do?" />
          </div>
          <div className="bld-feature-card__row">
            <div className="a-field">
              <label className="a-field__label">User Benefit</label>
              <textarea className="a-textarea" rows={2} value={f.user_benefit} onChange={e => update(i, 'user_benefit', e.target.value)} placeholder="How does this improve the user's experience?" />
            </div>
            <div className="a-field">
              <label className="a-field__label">Business Benefit</label>
              <textarea className="a-textarea" rows={2} value={f.business_benefit} onChange={e => update(i, 'business_benefit', e.target.value)} placeholder="How does this benefit the business?" />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}>
        <FiPlus size={13} /> Add Feature
      </button>
    </div>
  );
}

// ── Challenge Repeater ──────────────────────────────────────────────────

function ChallengeRepeater({ value, onChange }: { value: ChallengeEntry[]; onChange: (v: ChallengeEntry[]) => void }) {
  const update = (i: number, field: keyof ChallengeEntry, v: string) => {
    const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a);
  };
  const add    = () => onChange([...value, { challenge: '', solution: '', result: '' }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="bld-challenges">
      {value.map((c, i) => (
        <div key={i} className="bld-challenge-card">
          <div className="bld-challenge-card__head">
            <span className="bld-feature-card__label">Entry {i + 1}</span>
            <button type="button" className="bld-repeater__remove" onClick={() => remove(i)} aria-label="Remove">
              <FiTrash2 size={13} />
            </button>
          </div>
          <div className="a-field">
            <label className="a-field__label bld-challenge-card__badge bld-challenge-card__badge--challenge">Challenge</label>
            <textarea className="a-textarea" rows={2} value={c.challenge} onChange={e => update(i, 'challenge', e.target.value)} placeholder="What was the obstacle or technical difficulty?" />
          </div>
          <div className="a-field">
            <label className="a-field__label bld-challenge-card__badge bld-challenge-card__badge--solution">Solution</label>
            <textarea className="a-textarea" rows={2} value={c.solution} onChange={e => update(i, 'solution', e.target.value)} placeholder="How did you resolve it? What approach did you take?" />
          </div>
          <div className="a-field">
            <label className="a-field__label bld-challenge-card__badge bld-challenge-card__badge--result">Result</label>
            <textarea className="a-textarea" rows={2} value={c.result} onChange={e => update(i, 'result', e.target.value)} placeholder="What was the outcome or impact of the solution?" />
          </div>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}>
        <FiPlus size={13} /> Add Entry
      </button>
    </div>
  );
}

// ── Screenshot Card ──────────────────────────────────────────────────────

function ScreenshotCard({ item, index, onChange, onRemove }: {
  item: Screenshot; index: number;
  onChange: (s: Screenshot) => void;
  onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${api.getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json() as { url: string };
      onChange({ ...item, url });
    } finally {
      setUploading(false);
    }
  }, [item, onChange]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) doUpload(f);
    e.target.value = '';
  };
  const handleDragOver  = (e: DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop      = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) doUpload(f);
  };

  return (
    <div className="bld-screenshot-card">
      {item.url ? (
        <div className="bld-screenshot-card__preview-wrap">
          <img src={item.url} alt={item.caption || `Screenshot ${index + 1}`} className="bld-screenshot-card__preview" />
          <button
            type="button"
            className="bld-screenshot-card__clear"
            onClick={() => onChange({ ...item, url: '' })}
            aria-label="Remove image"
          >×</button>
        </div>
      ) : (
        <div
          className={`bld-upload-zone${dragOver ? ' bld-upload-zone--over' : ''}${uploading ? ' bld-upload-zone--uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        >
          <FiUploadCloud size={22} className="bld-upload-zone__icon" />
          {uploading
            ? <p className="bld-upload-zone__text">Uploading…</p>
            : <p className="bld-upload-zone__text"><strong>Click to upload</strong> or drag and drop</p>}
          <p className="bld-upload-zone__hint">JPG, PNG, WebP</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
      <div className="bld-screenshot-card__fields">
        <div className="bld-screenshot-card__row">
          <span className="bld-feature-card__label">Screenshot {index + 1}</span>
          <button type="button" className="bld-repeater__remove" onClick={onRemove} aria-label="Remove screenshot">
            <FiTrash2 size={13} />
          </button>
        </div>
        {!item.url && (
          <div className="a-field">
            <label className="a-field__label">Or paste image URL</label>
            <input className="a-input" type="url" value={item.url} onChange={e => onChange({ ...item, url: e.target.value })} placeholder="https://…" />
          </div>
        )}
        <div className="a-field">
          <label className="a-field__label">Caption</label>
          <input className="a-input" value={item.caption} onChange={e => onChange({ ...item, caption: e.target.value })} placeholder="Describe what's shown in this screenshot…" />
        </div>
        <div className="a-field">
          <label className="a-field__label">Category</label>
          <select className="a-input" value={item.category} onChange={e => onChange({ ...item, category: e.target.value as Screenshot['category'] })}>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="dashboard">Dashboard</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ScreenshotRepeater({ value, onChange }: { value: Screenshot[]; onChange: (v: Screenshot[]) => void }) {
  const update = (i: number, s: Screenshot) => { const a = [...value]; a[i] = s; onChange(a); };
  const add    = () => onChange([...value, { url: '', caption: '', category: 'desktop' }]);
  return (
    <div className="bld-screenshots">
      <div className="bld-screenshots__grid">
        {value.map((s, i) => (
          <ScreenshotCard
            key={i}
            item={s}
            index={i}
            onChange={s => update(i, s)}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          />
        ))}
      </div>
      <button type="button" className="bld-repeater__add" onClick={add}>
        <FiPlus size={13} /> Add Screenshot
      </button>
    </div>
  );
}

// ── Markdown Preview Modal ──────────────────────────────────────────────

function MarkdownModal({ content, onClose }: { content: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="a-modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="a-modal a-modal--lg">
        <div className="a-modal__header">
          <div>
            <h2 className="a-modal__title">Exported Markdown</h2>
            <p className="a-modal__sub">Copy and paste into any markdown editor or document</p>
          </div>
          <button className="a-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="a-modal__body">
          <textarea className="bld__md-preview" value={content} readOnly rows={22} aria-label="Generated markdown" />
        </div>
        <div className="a-modal__footer">
          <button type="button" className="a-btn a-btn--ghost" onClick={onClose}>Close</button>
          <button type="button" className="a-btn a-btn--primary" onClick={copy}>
            {copied ? <><FiCheck size={13} /> Copied!</> : <><FiCopy size={13} /> Copy to Clipboard</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

interface Props {
  value: string;
  onChange: (json: string) => void;
  projectMeta?: ProjectMeta;
}

export default function CaseStudyBuilder({ value, onChange, projectMeta = {} }: Props) {
  const [data, setData]   = useState<BuilderData>(() => parseBuilderData(value));
  const [showMd, setShowMd] = useState(false);
  const [mdText, setMdText] = useState('');

  const set = useCallback(<K extends keyof BuilderData>(key: K, val: BuilderData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: val };
      onChange(JSON.stringify(next));
      return next;
    });
  }, [onChange]);

  const complete = {
    1:  !!data.industry || !!data.overview,
    2:  !!data.about_client || !!data.existing_situation,
    3:  !!data.main_challenge || data.pain_points.some(p => p.trim()),
    4:  data.objectives.some(o => o.trim()),
    5:  !!data.discovery || !!data.strategy,
    6:  !!data.solution_summary || !!data.how_solved,
    7:  data.key_features.some(f => f.title),
    8:  data.frontend_tech.length > 0 || !!data.architecture,
    9:  data.challenges_solutions.some(c => c.challenge),
    10: !!data.project_outcomes || data.achievements.some(a => a.trim()),
    11: data.screenshots.some(s => s.url),
    12: !!data.lessons_learned || !!data.future_improvements,
  };
  const completedCount = Object.values(complete).filter(Boolean).length;

  function handleExport() {
    setMdText(generateMarkdown(data, projectMeta));
    setShowMd(true);
  }

  const ta = (id: string, field: keyof BuilderData, rows: number, placeholder: string, hint?: string) => (
    <div className="a-field">
      <label className="a-field__label" htmlFor={id}>{placeholder.split('\n')[0]}</label>
      <textarea
        id={id}
        className="a-textarea"
        rows={rows}
        value={data[field] as string}
        onChange={e => set(field, e.target.value as BuilderData[keyof BuilderData])}
        placeholder={placeholder}
      />
      {hint && <span className="a-field__hint">{hint}</span>}
    </div>
  );

  return (
    <div className="bld">

      {/* Progress */}
      <div className="bld__progress">
        <div className="bld__progress-bar">
          <div className="bld__progress-fill" style={{ width: `${(completedCount / 12) * 100}%` }} />
        </div>
        <span className="bld__progress-label">{completedCount} / 12 sections</span>
      </div>

      {/* Cards */}
      <div className="bld__cards">

        {/* 1 · Overview */}
        <BuilderCard number={1} title="Overview" description="A brief introduction to the project, its category, and what makes it unique." isComplete={complete[1]} defaultOpen>
          <div className="a-field">
            <label className="a-field__label" htmlFor="bld-industry">Industry</label>
            <input id="bld-industry" className="a-input" value={data.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Healthcare, Fintech, Real Estate, E-commerce" />
          </div>
          <div className="a-field">
            <label className="a-field__label" htmlFor="bld-overview">Short Project Summary</label>
            <textarea id="bld-overview" className="a-textarea" rows={4} value={data.overview} onChange={e => set('overview', e.target.value)} placeholder="2–3 sentences. What was built, who it's for, and what problem it solves." maxLength={500} />
            <span className="a-field__hint">{data.overview.length} / 500 characters</span>
          </div>
        </BuilderCard>

        {/* 2 · Background */}
        <BuilderCard number={2} title="Background" description="Introduce the client, their business, their audience, and the context before this project began." isComplete={complete[2]}>
          {ta('bld-about-client', 'about_client', 4, 'About the Client\nWho is the client? What does their business do? What market do they operate in?')}
          {ta('bld-target-audience', 'target_audience', 3, 'Target Audience\nWho are the end users or customers? Describe their demographics, goals, and pain points.')}
          {ta('bld-business-context', 'business_context', 3, 'Business Context\nWhat business pressures, goals, or strategic initiatives prompted this project?')}
          {ta('bld-existing-situation', 'existing_situation', 3, 'Existing Situation Before Development\nWhat did they have before? What was outdated, missing, or broken?')}
        </BuilderCard>

        {/* 3 · Challenge */}
        <BuilderCard number={3} title="Challenge" description="Describe the core problem that needed to be solved and the business impact of leaving it unsolved." isComplete={complete[3]}>
          {ta('bld-main-challenge', 'main_challenge', 4, 'Main Challenge\nSummarise the core problem. What was broken? What could users or the business not accomplish?')}
          <div className="a-field">
            <label className="a-field__label">Pain Points</label>
            <Repeater
              value={data.pain_points}
              onChange={v => set('pain_points', v)}
              placeholder="e.g. Outdated website, Poor mobile experience, Low conversion rates"
              addLabel="Add Pain Point"
            />
          </div>
          {ta('bld-business-impact', 'business_impact', 3, 'Business Impact\nHow was the business affected? Lost revenue, missed opportunities, high support costs?')}
          {ta('bld-why-new', 'why_new_solution', 3, 'Why a New Solution Was Needed\nWhy couldn\'t the old system be patched? What made a new build necessary?')}
        </BuilderCard>

        {/* 4 · Objectives */}
        <BuilderCard number={4} title="Objectives" description="List the measurable goals the project was designed to achieve." isComplete={complete[4]}>
          <p className="bld__field-hint">One objective per item. Press Enter to add the next one.</p>
          <Repeater
            value={data.objectives}
            onChange={v => set('objectives', v)}
            placeholder="e.g. Improve mobile UX, Increase lead conversions, Modernise visual design"
            addLabel="Add Objective"
          />
        </BuilderCard>

        {/* 5 · Approach */}
        <BuilderCard number={5} title="Approach" description="Explain the methodology, research, and planning that shaped how you tackled this project." isComplete={complete[5]}>
          {ta('bld-discovery', 'discovery', 3, 'Discovery Process\nHow did you kick off the project? Stakeholder interviews, audits, workshops?')}
          {ta('bld-research', 'research', 3, 'Research Conducted\nWhat research did you do? User research, analytics review, accessibility audit?')}
          {ta('bld-competitor', 'competitor_analysis', 3, 'Competitor Analysis\nWhat comparable products did you study? What patterns or gaps did you find?')}
          {ta('bld-planning', 'planning', 3, 'Planning Process\nHow did you plan the work? Wireframes, sprints, sitemap, content strategy?')}
          {ta('bld-strategy', 'strategy', 3, 'Strategy\nWhat was your overall strategy? How did your decisions align with business goals?')}
          {ta('bld-tech-considerations', 'technical_considerations', 3, 'Technical Considerations\nConstraints, legacy systems, performance targets, platform decisions?')}
        </BuilderCard>

        {/* 6 · Solution */}
        <BuilderCard number={6} title="Solution" description="Describe what was delivered — the UX, technical, and business dimensions of the final solution." isComplete={complete[6]}>
          {ta('bld-solution-summary', 'solution_summary', 4, 'Solution Summary\nHigh-level overview of what was built and delivered.')}
          {ta('bld-how-solved', 'how_solved', 3, 'How the Solution Solved the Problem\nConnect the dots — how did your solution directly address each challenge?')}
          {ta('bld-ux-improvements', 'ux_improvements', 3, 'UX Improvements\nBetter navigation, faster flows, clearer CTAs, improved accessibility?')}
          {ta('bld-tech-improvements', 'technical_improvements', 3, 'Technical Improvements\nPerformance gains, scalability improvements, better maintainability?')}
          {ta('bld-biz-improvements', 'business_improvements', 3, 'Business Improvements\nMore leads, faster ops, better retention, reduced costs?')}
        </BuilderCard>

        {/* 7 · Key Features */}
        <BuilderCard number={7} title="Key Features" description="Highlight the most impactful features. Explain what each one does and why it matters." isComplete={complete[7]}>
          <FeatureRepeater value={data.key_features} onChange={v => set('key_features', v)} />
        </BuilderCard>

        {/* 8 · Development Process */}
        <BuilderCard number={8} title="Development Process" description="Walk through how the project was built — stack choices, architecture, security, and deployment." isComplete={complete[8]}>
          <div className="a-field">
            <label className="a-field__label">Frontend Technologies</label>
            <TagInput id="bld-fe-tech" value={data.frontend_tech} onChange={v => set('frontend_tech', v)} placeholder="React, TypeScript, Bootstrap… press Enter to add" />
          </div>
          <div className="a-field">
            <label className="a-field__label">Backend Technologies</label>
            <TagInput id="bld-be-tech" value={data.backend_tech} onChange={v => set('backend_tech', v)} placeholder="Node.js, Express, Python… press Enter to add" />
          </div>
          <div className="a-field">
            <label className="a-field__label">Database</label>
            <TagInput id="bld-db-tech" value={data.database_tech} onChange={v => set('database_tech', v)} placeholder="PostgreSQL, MongoDB, D1… press Enter to add" />
          </div>
          {ta('bld-apis', 'apis_integrations', 3, 'APIs & Integrations\nThird-party services integrated: Stripe, Twilio, Google Maps, Cloudflare, etc.')}
          {ta('bld-architecture', 'architecture', 3, 'Architecture Decisions\nMonolith vs microservices, serverless, REST vs GraphQL, component design?')}
          {ta('bld-security', 'security', 3, 'Security Considerations\nAuth strategy, data encryption, input validation, OWASP compliance?')}
          {ta('bld-performance', 'performance', 3, 'Performance Optimizations\nCaching, lazy loading, code splitting, image optimization, CDN?')}
          {ta('bld-scalability', 'scalability', 3, 'Scalability Considerations\nHow was the system designed to handle growth?')}
          {ta('bld-deployment', 'deployment', 3, 'Deployment Process\nCI/CD pipeline, hosting platform, release strategy?')}
        </BuilderCard>

        {/* 9 · Challenges & Solutions */}
        <BuilderCard number={9} title="Challenges & Solutions" description="Demonstrate problem-solving ability with real obstacles and how you overcame them." isComplete={complete[9]}>
          <ChallengeRepeater value={data.challenges_solutions} onChange={v => set('challenges_solutions', v)} />
        </BuilderCard>

        {/* 10 · Results */}
        <BuilderCard number={10} title="Results" description="Show the measurable impact and business outcomes the project produced." isComplete={complete[10]}>
          {ta('bld-outcomes', 'project_outcomes', 4, 'Project Outcomes\nWhat was ultimately delivered? How did it perform once live?')}
          {ta('bld-perf-improvements', 'performance_improvements', 3, 'Performance Improvements\nFaster load times, better Core Web Vitals, lower bounce rate?')}
          {ta('bld-biz-benefits', 'business_benefits', 3, 'Business Benefits\nMore leads, increased revenue, reduced operating costs, better user retention?')}
          <div className="a-field">
            <label className="a-field__label">Key Achievements</label>
            <Repeater
              value={data.achievements}
              onChange={v => set('achievements', v)}
              placeholder="e.g. Page load improved by 2s, Mobile conversion rate increased"
              addLabel="Add Achievement"
            />
          </div>
          {ta('bld-client-feedback', 'client_feedback', 3, 'Client Feedback\nA quote or paraphrase of what the client said about the outcome.')}
        </BuilderCard>

        {/* 11 · Screenshots */}
        <BuilderCard number={11} title="Screenshots" description="Upload visual proof. Screenshots make case studies far more compelling to potential clients and recruiters." isComplete={complete[11]}>
          <ScreenshotRepeater value={data.screenshots} onChange={v => set('screenshots', v)} />
        </BuilderCard>

        {/* 12 · Takeaways */}
        <BuilderCard number={12} title="Key Takeaways" description="Reflect on what you learned — technically, from a UX perspective, and about the business domain." isComplete={complete[12]}>
          {ta('bld-lessons', 'lessons_learned', 4, 'Lessons Learned\nWhat would you do differently? What mistakes taught you something valuable?')}
          {ta('bld-tech-insights', 'technical_insights', 3, 'Technical Insights\nPatterns, libraries, or architectural approaches you validated or discovered?')}
          {ta('bld-ux-insights', 'ux_insights', 3, 'UX Insights\nWhat did user behaviour or feedback teach you about design decisions?')}
          {ta('bld-biz-insights', 'business_insights', 3, 'Business Insights\nWhat did you learn about the domain, client communication, or stakeholder management?')}
          {ta('bld-future', 'future_improvements', 3, 'Future Improvements\nWhat features or changes would you add with more time or budget?')}
        </BuilderCard>

      </div>

      {/* Footer actions */}
      <div className="bld__footer">
        <button type="button" className="a-btn a-btn--ghost" onClick={handleExport}>
          <FiDownload size={14} /> Export Markdown
        </button>
      </div>

      {showMd && <MarkdownModal content={mdText} onClose={() => setShowMd(false)} />}
    </div>
  );
}
