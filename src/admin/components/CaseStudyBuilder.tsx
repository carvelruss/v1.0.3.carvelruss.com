import { useState, useRef, useCallback, type ChangeEvent } from 'react';
import { FiPlus, FiTrash2, FiUploadCloud, FiDownload, FiCheck, FiCopy } from 'react-icons/fi';
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
  industry: string;
  overview: string;
  about_client: string;
  target_audience: string;
  business_context: string;
  existing_situation: string;
  main_challenge: string;
  pain_points: string[];
  business_impact: string;
  why_new_solution: string;
  objectives: string[];
  discovery: string;
  research: string;
  competitor_analysis: string;
  planning: string;
  strategy: string;
  technical_considerations: string;
  solution_summary: string;
  how_solved: string;
  ux_improvements: string;
  technical_improvements: string;
  business_improvements: string;
  key_features: Feature[];
  frontend_tech: string[];
  backend_tech: string[];
  database_tech: string[];
  apis_integrations: string;
  architecture: string;
  security: string;
  performance: string;
  scalability: string;
  deployment: string;
  challenges_solutions: ChallengeEntry[];
  project_outcomes: string;
  performance_improvements: string;
  business_benefits: string;
  client_feedback: string;
  achievements: string[];
  screenshots: Screenshot[];
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
  const list  = (items: string[]) => { const f = items.filter(i => i.trim()); if (f.length) { f.forEach(i => push(`- ${i}`)); blank(); } };

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
    if (d.how_solved)             { h3('How We Solved It');       body(d.how_solved); }
    if (d.ux_improvements)        { h3('UX Improvements');        body(d.ux_improvements); }
    if (d.technical_improvements) { h3('Technical Improvements'); body(d.technical_improvements); }
    if (d.business_improvements)  { h3('Business Improvements');  body(d.business_improvements); }
  }
  if (d.key_features.length) {
    h2('Key Features');
    d.key_features.filter(f => f.title).forEach(f => {
      h3(f.title); body(f.description);
      if (f.user_benefit)     { push(`**User Benefit:** ${f.user_benefit}`);     blank(); }
      if (f.business_benefit) { push(`**Business Benefit:** ${f.business_benefit}`); blank(); }
    });
  }
  const hasDev = d.frontend_tech.length || d.backend_tech.length || d.database_tech.length ||
    d.apis_integrations || d.architecture || d.security || d.performance || d.scalability || d.deployment;
  if (hasDev) {
    h2('Development Process');
    if (d.frontend_tech.length) { push(`**Frontend:** ${d.frontend_tech.join(', ')}`); blank(); }
    if (d.backend_tech.length)  { push(`**Backend:** ${d.backend_tech.join(', ')}`);   blank(); }
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

// ── Section Card ───────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bld-scard">
      <h3 className="bld-scard__title">{title}</h3>
      <div className="bld-scard__body">{children}</div>
    </div>
  );
}

// ── Field ──────────────────────────────────────────────────────────────

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="bld-field">
      <label className="bld-field__label">{label}</label>
      {children}
      {hint && <span className="bld-field__hint">{hint}</span>}
    </div>
  );
}

// ── Tag Input ──────────────────────────────────────────────────────────

function TagInput({ id, value, onChange, placeholder = 'Type and press Enter to add' }: {
  id?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => { const v = input.trim(); if (v && !value.includes(v)) onChange([...value, v]); setInput(''); };
  return (
    <div className="bld-tags" onClick={() => document.getElementById(id || '')?.focus()}>
      {value.map((tag, i) => (
        <span key={i} className="bld-tag">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${tag}`}>×</button>
        </span>
      ))}
      <input id={id} className="bld-tags__input" value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
          if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add} placeholder={value.length === 0 ? placeholder : ''} />
    </div>
  );
}

// ── Repeater ───────────────────────────────────────────────────────────

function Repeater({ value, onChange, placeholder = 'Add item', addLabel = '+ Add Item' }: {
  value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel?: string;
}) {
  const update = (i: number, v: string) => { const a = [...value]; a[i] = v; onChange(a); };
  const add    = () => onChange([...value, '']);
  return (
    <div className="bld-repeater">
      {value.map((item, i) => (
        <div key={i} className="bld-repeater__row">
          <input className="a-input" value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <button type="button" className="bld-repeater__remove" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove">
            <FiTrash2 size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}><FiPlus size={13} /> {addLabel}</button>
    </div>
  );
}

// ── Feature Repeater ───────────────────────────────────────────────────

function FeatureRepeater({ value, onChange }: { value: Feature[]; onChange: (v: Feature[]) => void }) {
  const update = (i: number, field: keyof Feature, v: string) => { const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a); };
  const add    = () => onChange([...value, { title: '', description: '', user_benefit: '', business_benefit: '' }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="bld-features">
      {value.map((f, i) => (
        <div key={i} className="bld-feature-card">
          <div className="bld-feature-card__head">
            <span className="bld-feature-card__label">Feature {i + 1}</span>
            <button type="button" className="bld-repeater__remove" onClick={() => remove(i)} aria-label="Remove"><FiTrash2 size={13} /></button>
          </div>
          <Field label="Feature Name">
            <input className="a-input" value={f.title} onChange={e => update(i, 'title', e.target.value)} placeholder="e.g. Real-time Search, User Authentication" />
          </Field>
          <Field label="Description">
            <textarea className="a-textarea" rows={2} value={f.description} onChange={e => update(i, 'description', e.target.value)} placeholder="What does this feature do?" />
          </Field>
          <div className="bld-feature-card__row">
            <Field label="User Benefit">
              <textarea className="a-textarea" rows={2} value={f.user_benefit} onChange={e => update(i, 'user_benefit', e.target.value)} placeholder="How does this improve the user experience?" />
            </Field>
            <Field label="Business Benefit">
              <textarea className="a-textarea" rows={2} value={f.business_benefit} onChange={e => update(i, 'business_benefit', e.target.value)} placeholder="How does this benefit the business?" />
            </Field>
          </div>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}><FiPlus size={13} /> Add Feature</button>
    </div>
  );
}

// ── Challenge Repeater ─────────────────────────────────────────────────

function ChallengeRepeater({ value, onChange }: { value: ChallengeEntry[]; onChange: (v: ChallengeEntry[]) => void }) {
  const update = (i: number, field: keyof ChallengeEntry, v: string) => { const a = [...value]; a[i] = { ...a[i], [field]: v }; onChange(a); };
  const add    = () => onChange([...value, { challenge: '', solution: '', result: '' }]);
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="bld-challenges">
      {value.map((c, i) => (
        <div key={i} className="bld-challenge-card">
          <div className="bld-challenge-card__head">
            <span className="bld-feature-card__label">Entry {i + 1}</span>
            <button type="button" className="bld-repeater__remove" onClick={() => remove(i)} aria-label="Remove"><FiTrash2 size={13} /></button>
          </div>
          <Field label="Challenge">
            <textarea className="a-textarea" rows={2} value={c.challenge} onChange={e => update(i, 'challenge', e.target.value)} placeholder="What was the obstacle or technical difficulty?" />
          </Field>
          <Field label="Solution">
            <textarea className="a-textarea" rows={2} value={c.solution} onChange={e => update(i, 'solution', e.target.value)} placeholder="How did you resolve it?" />
          </Field>
          <Field label="Result">
            <textarea className="a-textarea" rows={2} value={c.result} onChange={e => update(i, 'result', e.target.value)} placeholder="What was the outcome or impact?" />
          </Field>
        </div>
      ))}
      <button type="button" className="bld-repeater__add" onClick={add}><FiPlus size={13} /> Add Entry</button>
    </div>
  );
}

// ── Screenshot Card ────────────────────────────────────────────────────

function ScreenshotCard({ item, index, onChange, onRemove }: {
  item: Screenshot; index: number; onChange: (s: Screenshot) => void; onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${api.getToken()}` }, body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json() as { url: string };
      onChange({ ...item, url });
    } finally { setUploading(false); }
  }, [item, onChange]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) doUpload(f); e.target.value = ''; };

  return (
    <div className="bld-screenshot-card">
      {item.url ? (
        <div className="bld-screenshot-card__preview-wrap">
          <img src={item.url} alt={item.caption || `Screenshot ${index + 1}`} className="bld-screenshot-card__preview" />
          <button type="button" className="bld-screenshot-card__clear" onClick={() => onChange({ ...item, url: '' })} aria-label="Remove">×</button>
        </div>
      ) : (
        <div
          className={`bld-upload-zone${dragOver ? ' bld-upload-zone--over' : ''}${uploading ? ' bld-upload-zone--uploading' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) doUpload(f); }}
          onClick={() => !uploading && fileRef.current?.click()}
          role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
        >
          <FiUploadCloud size={22} className="bld-upload-zone__icon" />
          {uploading ? <p className="bld-upload-zone__text">Uploading…</p> : <p className="bld-upload-zone__text"><strong>Click to upload</strong> or drag and drop</p>}
          <p className="bld-upload-zone__hint">JPG, PNG, WebP</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
      <div className="bld-screenshot-card__fields">
        <div className="bld-screenshot-card__row">
          <span className="bld-feature-card__label">Screenshot {index + 1}</span>
          <button type="button" className="bld-repeater__remove" onClick={onRemove} aria-label="Remove screenshot"><FiTrash2 size={13} /></button>
        </div>
        {!item.url && (
          <Field label="Or paste image URL">
            <input className="a-input" type="url" value={item.url} onChange={e => onChange({ ...item, url: e.target.value })} placeholder="https://…" />
          </Field>
        )}
        <Field label="Caption">
          <input className="a-input" value={item.caption} onChange={e => onChange({ ...item, caption: e.target.value })} placeholder="Describe what's shown in this screenshot…" />
        </Field>
        <Field label="Category">
          <select className="a-input" value={item.category} onChange={e => onChange({ ...item, category: e.target.value as Screenshot['category'] })}>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="dashboard">Dashboard</option>
            <option value="other">Other</option>
          </select>
        </Field>
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
          <ScreenshotCard key={i} item={s} index={i} onChange={s => update(i, s)} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
        ))}
      </div>
      <button type="button" className="bld-repeater__add" onClick={add}><FiPlus size={13} /> Add Screenshot</button>
    </div>
  );
}

// ── Markdown Modal ─────────────────────────────────────────────────────

function MarkdownModal({ content, onClose }: { content: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
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
          <textarea className="bld__md-preview" value={content} readOnly rows={22} />
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
  const [data, setData]     = useState<BuilderData>(() => parseBuilderData(value));
  const [showMd, setShowMd] = useState(false);
  const [mdText, setMdText] = useState('');

  const set = useCallback(<K extends keyof BuilderData>(key: K, val: BuilderData[K]) => {
    setData(prev => {
      const next = { ...prev, [key]: val };
      onChange(JSON.stringify(next));
      return next;
    });
  }, [onChange]);

  const ta = (id: string, field: keyof BuilderData, placeholder: string, rows = 4) => (
    <textarea
      id={id}
      className="a-textarea"
      rows={rows}
      value={data[field] as string}
      onChange={e => set(field, e.target.value as BuilderData[typeof field])}
      placeholder={placeholder}
    />
  );

  function handleExport() {
    setMdText(generateMarkdown(data, projectMeta));
    setShowMd(true);
  }

  return (
    <div className="bld">

      {/* ── 1. Overview ── */}
      <SectionCard title="Overview">
        <Field label="Industry">
          <input className="a-input" value={data.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Healthcare, Fintech, Real Estate, E-commerce" />
        </Field>
        <Field label="Short Project Summary" hint={`${data.overview.length} / 500 characters`}>
          <textarea id="bld-overview" className="a-textarea" rows={4} value={data.overview} onChange={e => set('overview', e.target.value)} placeholder="2–3 sentences. What was built, who it's for, and what problem it solves." maxLength={500} />
        </Field>
      </SectionCard>

      {/* ── 2. Background ── */}
      <SectionCard title="Background">
        <Field label="About the Client">
          {ta('bld-about-client', 'about_client', 'Who is the client? What does their business do? What market do they operate in?')}
        </Field>
        <Field label="Target Audience">
          {ta('bld-target-audience', 'target_audience', 'Who are the end users or customers? Describe their demographics, goals, and needs.', 3)}
        </Field>
        <Field label="Business Context">
          {ta('bld-business-context', 'business_context', 'What business pressures, goals, or strategic initiatives prompted this project?', 3)}
        </Field>
        <Field label="Existing Situation Before Development">
          {ta('bld-existing-situation', 'existing_situation', 'What did they have before? What was outdated, missing, or broken?', 3)}
        </Field>
      </SectionCard>

      {/* ── 3. Challenge ── */}
      <SectionCard title="Challenge">
        <Field label="Main Challenge">
          {ta('bld-main-challenge', 'main_challenge', "Summarise the core problem. What was broken? What couldn't users or the business accomplish?")}
        </Field>
        <Field label="Pain Points">
          <Repeater value={data.pain_points} onChange={v => set('pain_points', v)} placeholder="e.g. Outdated website, Poor mobile experience, Low conversion rates" addLabel="Add Pain Point" />
        </Field>
        <Field label="Business Impact">
          {ta('bld-business-impact', 'business_impact', 'How was the business affected? Lost revenue, missed opportunities, high support costs?', 3)}
        </Field>
        <Field label="Why a New Solution Was Needed">
          {ta('bld-why-new', 'why_new_solution', "Why couldn't the old system be patched? What made a rebuild necessary?", 3)}
        </Field>
      </SectionCard>

      {/* ── 4. Objectives ── */}
      <SectionCard title="Objectives">
        <Field label="Project Objectives">
          <Repeater value={data.objectives} onChange={v => set('objectives', v)} placeholder="e.g. Improve mobile UX, Increase lead conversions, Modernise visual design" addLabel="Add Objective" />
        </Field>
      </SectionCard>

      {/* ── 5. Approach ── */}
      <SectionCard title="Approach">
        <Field label="Discovery Process">
          {ta('bld-discovery', 'discovery', 'How did you kick off the project? Stakeholder interviews, audits, workshops?', 3)}
        </Field>
        <Field label="Research Conducted">
          {ta('bld-research', 'research', 'What research did you do? User research, analytics review, accessibility audit?', 3)}
        </Field>
        <Field label="Competitor Analysis">
          {ta('bld-competitor', 'competitor_analysis', 'What comparable products did you study? What patterns or gaps did you find?', 3)}
        </Field>
        <Field label="Planning Process">
          {ta('bld-planning', 'planning', 'How did you plan the work? Wireframes, sprints, sitemap, content strategy?', 3)}
        </Field>
        <Field label="Strategy">
          {ta('bld-strategy', 'strategy', 'What was your overall strategy? How did decisions align with business goals?', 3)}
        </Field>
        <Field label="Technical Considerations">
          {ta('bld-tech-considerations', 'technical_considerations', 'Constraints, legacy systems, performance targets, platform decisions?', 3)}
        </Field>
      </SectionCard>

      {/* ── 6. Solution ── */}
      <SectionCard title="Solution">
        <Field label="Solution Summary">
          {ta('bld-solution-summary', 'solution_summary', 'High-level overview of what was built and delivered.')}
        </Field>
        <Field label="How the Solution Solved the Problem">
          {ta('bld-how-solved', 'how_solved', 'Connect the dots — how did your solution directly address each challenge?', 3)}
        </Field>
        <Field label="UX Improvements">
          {ta('bld-ux-improvements', 'ux_improvements', 'Better navigation, faster flows, clearer CTAs, improved accessibility?', 3)}
        </Field>
        <Field label="Technical Improvements">
          {ta('bld-tech-improvements', 'technical_improvements', 'Performance gains, scalability improvements, better maintainability?', 3)}
        </Field>
        <Field label="Business Improvements">
          {ta('bld-biz-improvements', 'business_improvements', 'More leads, faster ops, better retention, reduced costs?', 3)}
        </Field>
      </SectionCard>

      {/* ── 7. Key Features ── */}
      <SectionCard title="Key Features">
        <FeatureRepeater value={data.key_features} onChange={v => set('key_features', v)} />
      </SectionCard>

      {/* ── 8. Development Process ── */}
      <SectionCard title="Development Process">
        <Field label="Frontend Technologies">
          <TagInput id="bld-fe-tech" value={data.frontend_tech} onChange={v => set('frontend_tech', v)} placeholder="React, TypeScript, Bootstrap… press Enter" />
        </Field>
        <Field label="Backend Technologies">
          <TagInput id="bld-be-tech" value={data.backend_tech} onChange={v => set('backend_tech', v)} placeholder="Node.js, Express, Python… press Enter" />
        </Field>
        <Field label="Database">
          <TagInput id="bld-db-tech" value={data.database_tech} onChange={v => set('database_tech', v)} placeholder="PostgreSQL, MongoDB, D1… press Enter" />
        </Field>
        <Field label="APIs & Integrations">
          {ta('bld-apis', 'apis_integrations', 'Third-party services: Stripe, Twilio, Google Maps, Cloudflare Workers, etc.', 3)}
        </Field>
        <Field label="Architecture Decisions">
          {ta('bld-architecture', 'architecture', 'Monolith vs microservices, serverless, REST vs GraphQL, component design?', 3)}
        </Field>
        <Field label="Security Considerations">
          {ta('bld-security', 'security', 'Auth strategy, data encryption, input validation, OWASP compliance?', 3)}
        </Field>
        <Field label="Performance Optimizations">
          {ta('bld-performance', 'performance', 'Caching, lazy loading, code splitting, image optimization, CDN?', 3)}
        </Field>
        <Field label="Scalability Considerations">
          {ta('bld-scalability', 'scalability', 'How was the system designed to handle growth?', 3)}
        </Field>
        <Field label="Deployment Process">
          {ta('bld-deployment', 'deployment', 'CI/CD pipeline, hosting platform, release strategy?', 3)}
        </Field>
      </SectionCard>

      {/* ── 9. Challenges & Solutions ── */}
      <SectionCard title="Challenges & Solutions">
        <ChallengeRepeater value={data.challenges_solutions} onChange={v => set('challenges_solutions', v)} />
      </SectionCard>

      {/* ── 10. Results ── */}
      <SectionCard title="Results">
        <Field label="Project Outcomes">
          {ta('bld-outcomes', 'project_outcomes', 'What was ultimately delivered? How did it perform once live?')}
        </Field>
        <Field label="Performance Improvements">
          {ta('bld-perf-improvements', 'performance_improvements', 'Faster load times, better Core Web Vitals, lower bounce rate?', 3)}
        </Field>
        <Field label="Business Benefits">
          {ta('bld-biz-benefits', 'business_benefits', 'More leads, increased revenue, reduced operating costs, better retention?', 3)}
        </Field>
        <Field label="Key Achievements">
          <Repeater value={data.achievements} onChange={v => set('achievements', v)} placeholder="e.g. Page load improved by 2s, Mobile conversion rate increased" addLabel="Add Achievement" />
        </Field>
        <Field label="Client Feedback">
          {ta('bld-client-feedback', 'client_feedback', 'A quote or paraphrase of what the client said about the outcome.', 3)}
        </Field>
      </SectionCard>

      {/* ── 11. Screenshots ── */}
      <SectionCard title="Screenshots">
        <ScreenshotRepeater value={data.screenshots} onChange={v => set('screenshots', v)} />
      </SectionCard>

      {/* ── 12. Key Takeaways ── */}
      <SectionCard title="Key Takeaways">
        <Field label="Lessons Learned">
          {ta('bld-lessons', 'lessons_learned', 'What would you do differently? What mistakes taught you something valuable?')}
        </Field>
        <Field label="Technical Insights">
          {ta('bld-tech-insights', 'technical_insights', 'Patterns, libraries, or architectural approaches you validated or discovered?', 3)}
        </Field>
        <Field label="UX Insights">
          {ta('bld-ux-insights', 'ux_insights', 'What did user behaviour or feedback teach you about design decisions?', 3)}
        </Field>
        <Field label="Business Insights">
          {ta('bld-biz-insights', 'business_insights', 'What did you learn about the domain, client communication, or stakeholder management?', 3)}
        </Field>
        <Field label="Future Improvements">
          {ta('bld-future', 'future_improvements', 'What features or changes would you add with more time or budget?', 3)}
        </Field>
      </SectionCard>

      {/* Footer */}
      <div className="bld__footer">
        <button type="button" className="a-btn a-btn--ghost" onClick={handleExport}>
          <FiDownload size={14} /> Export Markdown
        </button>
      </div>

      {showMd && <MarkdownModal content={mdText} onClose={() => setShowMd(false)} />}
    </div>
  );
}
