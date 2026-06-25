import {
  useState, useEffect, useRef, useCallback,
  type FormEvent, type KeyboardEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import {
  FiBold, FiItalic, FiCode, FiList, FiLink2, FiImage,
  FiMinus, FiRotateCcw, FiRotateCw, FiX, FiCheck,
  FiChevronDown, FiAlertCircle, FiEye,
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '../../lib/api';
import { renderMarkdown, slugify } from '../../lib/markdown';
import type { Post } from '../../types';
import AdminLayout from './AdminLayout';
import BlogHero from '../../components/blog/BlogHero';
import BlogContent from '../../components/blog/BlogContent';
import '../styles/blog-editor.css';

/* ── Types ─────────────────────────────────────────────────────────────────── */
type ToastKind = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: number; msg: string; kind: ToastKind; }
type PanelTab = 'post' | 'seo';

const TOAST_ICONS: Record<ToastKind, string> = {
  success: '✓', error: '✕', warning: '⚠', info: 'ℹ',
};

const CATEGORIES = [
  'Design', 'Development', 'UI/UX', 'Case Study', 'Career',
  'Tech Tips', 'Productivity', 'Tutorial',
];

const EMPTY: Omit<Post, 'id'> = {
  title: '', slug: '', content: '', excerpt: '',
  meta_description: '', og_image: '', keywords: '',
  author: 'Carvel Russ', status: 'draft', published_at: null,
  category: '', author_avatar: '', author_bio: '',
  featured_image_caption: '', reading_time: '', views_count: null,
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function wordCount(html: string) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

function statusLabel(s: string) {
  if (s === 'published') return 'Published';
  if (s === 'scheduled') return 'Scheduled';
  return 'Draft';
}

/* ── CollapsibleSection ─────────────────────────────────────────────────────── */
function CollapsibleSection({
  title, sub, children, defaultOpen = false,
}: { title: string; sub: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="ep-collapse">
      <button type="button" className="ep-collapse__trigger" onClick={() => setOpen(v => !v)}>
        <div className="ep-collapse__info">
          <span className="ep-collapse__title">{title}</span>
          <span className="ep-collapse__sub">{sub}</span>
        </div>
        <FiChevronDown className={`ep-collapse__chevron${open ? ' ep-collapse__chevron--open' : ''}`} />
      </button>
      {open && <div className="ep-collapse__body">{children}</div>}
    </div>
  );
}

/* ── TagInput ───────────────────────────────────────────────────────────────── */
function TagInput({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState('');
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const add = () => {
    const t = input.trim();
    if (!t || tags.includes(t)) { setInput(''); return; }
    onChange([...tags, t].join(', '));
    setInput('');
  };

  const remove = (t: string) => onChange(tags.filter(x => x !== t).join(', '));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1]);
  };

  return (
    <div className="ep-tag-input-wrap" onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {tags.map(t => (
        <span key={t} className="ep-pill">
          {t}
          <button type="button" className="ep-pill__remove" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
            <FiX size={11} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        placeholder={tags.length === 0 ? 'Add tags… (Enter to add)' : ''}
        aria-label="Add tag"
      />
    </div>
  );
}

/* ── SEO Preview ────────────────────────────────────────────────────────────── */
function SeoPreview({ title, slug, desc }: { title: string; slug: string; desc: string }) {
  const displayUrl = `carvelruss.com/blog/${slug || 'your-post-slug'}`;
  const displayTitle = title || 'Your post title';
  const displayDesc = desc || 'Your meta description will appear here…';

  const titleLen = title.length;
  const descLen  = desc.length;

  return (
    <>
      <div className="ep-seo-preview">
        <div className="ep-seo-preview__url">{displayUrl}</div>
        <div className="ep-seo-preview__title">{displayTitle.slice(0, 70)}</div>
        <div className="ep-seo-preview__desc">{displayDesc.slice(0, 160)}</div>
      </div>
      <div className="ep-seo-validation">
        <span className={`ep-seo-hint${titleLen === 0 ? ' ep-seo-hint--err' : titleLen <= 70 ? ' ep-seo-hint--ok' : ' ep-seo-hint--warn'}`}>
          {titleLen === 0 ? '✕' : titleLen <= 70 ? '✓' : '⚠'} Title: {titleLen}/70 chars
        </span>
        <span className={`ep-seo-hint${descLen === 0 ? ' ep-seo-hint--err' : descLen <= 160 ? ' ep-seo-hint--ok' : ' ep-seo-hint--warn'}`}>
          {descLen === 0 ? '✕' : descLen <= 160 ? '✓' : '⚠'} Description: {descLen}/160 chars
        </span>
        {!slug && <span className="ep-seo-hint ep-seo-hint--err">✕ Slug required</span>}
      </div>
    </>
  );
}

/* ── Calendar time input ────────────────────────────────────────────────────── */
function CalendarTimeInput({ value = '12:00', onChange }: { value?: string; onChange?: (v: string) => void }) {
  const [hStr, mStr] = value.split(':');
  const hour24 = parseInt(hStr ?? '12', 10);
  const minute  = parseInt(mStr  ?? '0',  10);
  const period  = hour24 >= 12 ? 'PM' : 'AM';
  const hour12  = hour24 % 12 || 12;

  const emit = (h12: number, min: number, p: string) => {
    let h24 = h12 % 12;
    if (p === 'PM') h24 += 12;
    onChange?.(`${String(h24).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  };

  return (
    <div className="a-cal-time">
      <span className="a-cal-time__label">TIME</span>
      <select className="a-cal-time__sel" value={hour12}
        onChange={e => emit(Number(e.target.value), minute, period)}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="a-cal-time__colon">:</span>
      <select className="a-cal-time__sel" value={minute}
        onChange={e => emit(hour12, Number(e.target.value), period)}>
        {[0, 15, 30, 45].map(m => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
      <div className="a-cal-time__ampm">
        <button type="button" className={`a-cal-ampm-btn${period === 'AM' ? ' active' : ''}`}
          onClick={() => emit(hour12, minute, 'AM')}>AM</button>
        <button type="button" className={`a-cal-ampm-btn${period === 'PM' ? ' active' : ''}`}
          onClick={() => emit(hour12, minute, 'PM')}>PM</button>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function PostForm() {
  const navigate  = useNavigate();
  const { slug: editSlug } = useParams<{ slug?: string }>();
  const isEdit = !!editSlug;

  /* form state */
  const [form, setForm] = useState<Omit<Post, 'id'>>(EMPTY);
  const [slugManual, setSlugManual] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [panelTab, setPanelTab] = useState<PanelTab>('post');
  const [preview, setPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [featuredUploading, setFeaturedUploading] = useState(false);
  const [featuredUploadErr, setFeaturedUploadErr] = useState('');
  const [featuredDragOver, setFeaturedDragOver] = useState(false);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadErr, setAvatarUploadErr] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const dpRef = useRef<DatePicker>(null);
  const toastRef = useRef(0);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* editor */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your post content here…' }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Underline,
    ],
    content: form.content ?? '',
    onUpdate: ({ editor: ed }) => {
      set('content', ed.getHTML());
    },
  });

  /* load existing post */
  useEffect(() => {
    if (!isEdit || !editSlug) return;
    api.getPostBySlug(editSlug)
      .then(post => {
        const content = (() => {
          const c = post.content ?? '';
          return c.trim().startsWith('<') ? c : renderMarkdown(c);
        })();
        setForm({
          title: post.title, slug: post.slug, content,
          excerpt: post.excerpt ?? '',
          meta_description: post.meta_description ?? '',
          og_image: post.og_image ?? '',
          keywords: post.keywords ?? '',
          author: post.author, status: post.status,
          published_at: post.published_at ?? null,
          category: post.category ?? '',
          author_avatar: post.author_avatar ?? '',
          author_bio: post.author_bio ?? '',
          featured_image_caption: post.featured_image_caption ?? '',
          reading_time: post.reading_time ?? '',
          views_count: post.views_count ?? null,
        });
        // Sync editor content
        if (editor && content) {
          editor.commands.setContent(content);
        }
        setSlugManual(true);
        setDirty(false);
      })
      .catch(() => toast('Failed to load post', 'error'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editSlug]);

  /* sync editor content when it mounts after load */
  useEffect(() => {
    if (editor && form.content && editor.isEmpty) {
      editor.commands.setContent(form.content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  /* mark dirty when form changes */
  useEffect(() => {
    if (!loading) setDirty(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  /* autosave: 4 s after last change */
  useEffect(() => {
    if (!dirty || !isEdit) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { save(undefined, true); }, 4000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, dirty]);

  /* Ctrl/Cmd+S → save draft */
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        save('draft');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  /* beforeunload */
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) { e.preventDefault(); }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  /* ── helpers ── */
  const toast = useCallback((msg: string, kind: ToastKind = 'success') => {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, msg, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const set = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleTitleChange = (value: string) => {
    set('title', value);
    if (!slugManual) set('slug', slugify(value));
  };

  /* ── validation ── */
  const validate = (forPublish: boolean): string[] => {
    const errs: string[] = [];
    if (!form.title.trim())   errs.push('Title is required');
    if (!form.slug.trim())    errs.push('URL slug is required');
    if (forPublish) {
      if (!form.excerpt?.trim())   errs.push('Excerpt is required');
      if (!form.category?.trim())  errs.push('Category is required');
      if (!form.og_image?.trim())  errs.push('Featured image is required');
      if (!form.author?.trim())    errs.push('Author name is required');
      const text = (editor?.getText() ?? '').trim();
      if (!text) errs.push('Post content is required');
    }
    return errs;
  };

  /* ── featured image upload ── */
  const uploadFeaturedImage = async (file: File) => {
    setFeaturedUploadErr('');
    setFeaturedUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      set('og_image', url);
    } catch (e: unknown) {
      setFeaturedUploadErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setFeaturedUploading(false);
    }
  };

  /* ── avatar upload ── */
  const uploadAvatar = async (file: File) => {
    setAvatarUploadErr('');
    setAvatarUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      set('author_avatar', url);
    } catch (e: unknown) {
      setAvatarUploadErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ── save ── */
  const save = async (overrideStatus?: Post['status'], silent = false) => {
    const errs = validate(overrideStatus === 'published');
    if (errs.length) {
      setValidationErrors(errs);
      if (!silent) toast(errs[0], 'error');
      return;
    }
    setValidationErrors([]);
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
        setForm(prev => ({ ...prev, status }));
        setDirty(false);
        setLastSaved(new Date());
        if (!silent) toast(status === 'published' ? 'Post published!' : 'Draft saved', 'success');
        if (!silent && status === 'published') {
          navigate('/admin/posts');
        } else if (newSlug !== editSlug) {
          navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
        }
      } else {
        const { slug: newSlug } = await api.createPost(payload);
        setDirty(false);
        setLastSaved(new Date());
        if (status === 'published') {
          toast('Post published!', 'success');
          navigate('/admin/posts');
        } else {
          toast('Post created!', 'success');
          navigate(`/admin/posts/${newSlug}/edit`, { replace: true });
        }
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); save('published'); };

  /* ── toolbar helpers ── */
  const addLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Link URL:', prev);
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  };

  const addImage = () => {
    if (!editor) return;
    const url = window.prompt('Image URL:');
    if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const headingLevel = !editor ? '0'
    : editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3'
    : '0';

  /* ── save indicator label ── */
  const saveIndicator = dirty
    ? <span className="ep-save-indicator ep-save-indicator--unsaved">
        <FiAlertCircle size={13} /> Unsaved changes
      </span>
    : lastSaved
    ? <span className="ep-save-indicator ep-save-indicator--saved">
        <FiCheck size={13} />
        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    : <span className="ep-save-indicator" />;

  const isPublished = form.status === 'published';
  const pageTitle   = form.title.trim() || (isEdit ? 'Edit Post' : 'New Post');

  const headerAction = (
    <div className="ep-topbar-actions">
      {saveIndicator}
      <span className={`ep-status-chip ep-status-chip--${form.status}`}>
        <span className="ep-status-chip__dot" />
        {statusLabel(form.status)}
      </span>
      <button
        type="button" className="ep-btn ep-btn--ghost ep-btn--sm"
        onClick={() => setPreview(true)}
        title="Preview post"
      >
        <FiEye size={14} /> Preview
      </button>
      <button
        type="button" className="ep-btn ep-btn--ghost ep-btn--sm"
        onClick={() => save('draft')} disabled={saving}
      >
        {saving ? '…' : 'Save Draft'}
      </button>
      <button
        type="button" className="ep-btn ep-btn--primary ep-btn--sm"
        onClick={() => save('published')} disabled={saving}
      >
        {saving ? '…' : isPublished ? 'Update' : 'Publish →'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout pageTitle="Edit Post" backTo="/admin/posts" hideViewSite>
        <p style={{ color: '#64748b' }}>Loading post…</p>
      </AdminLayout>
    );
  }

  /* ── settings panel: Post Settings tab ── */
  const PostSettingsTab = (
    <>
      {/* Status & Visibility */}
      <div className="ep-panel__section">
        <span className="ep-panel__section-title">Status &amp; Visibility</span>
        <div className="ep-gap">
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-status">Status</label>
            <select
              id="ps-status" className="ep-select"
              value={form.status}
              onChange={e => set('status', e.target.value as Post['status'])}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-pub-date">Publish date</label>
            <DatePicker
              ref={dpRef}
              id="ps-pub-date"
              selected={form.published_at ? new Date(form.published_at) : null}
              onChange={(date: Date | null) =>
                set('published_at', date ? date.toISOString() : null)
              }
              showTimeInput
              customTimeInput={<CalendarTimeInput />}
              timeInputLabel=""
              dateFormat="MMM d, yyyy · h:mm aa"
              placeholderText="Set date & time…"
              shouldCloseOnSelect={false}
              wrapperClassName="ep-datepicker-wrap a-datepicker-wrap"
              popperClassName="a-datepicker-popper"
            >
              <div className="a-cal-footer">
                <div className="a-cal-footer__actions">
                  <button type="button" className="a-cal-footer__link"
                    onClick={() => { set('published_at', new Date().toISOString()); (dpRef.current as any)?.setOpen(false); }}>
                    Today
                  </button>
                  <button type="button" className="a-cal-footer__link"
                    onClick={() => { set('published_at', null); (dpRef.current as any)?.setOpen(false); }}>
                    Clear
                  </button>
                </div>
                <button type="button" className="a-cal-footer__set"
                  onClick={() => (dpRef.current as any)?.setOpen(false)}>
                  Set date &amp; time
                </button>
              </div>
            </DatePicker>
          </div>
          <div className="ep-row-2">
            <div className="ep-field">
              <label className="ep-label" htmlFor="ps-reading-time">Read time</label>
              <input id="ps-reading-time" className="ep-input ep-input--sm"
                value={form.reading_time ?? ''} onChange={e => set('reading_time', e.target.value)}
                placeholder="5 min" />
            </div>
            <div className="ep-field">
              <label className="ep-label" htmlFor="ps-views">Views</label>
              <input id="ps-views" className="ep-input ep-input--sm"
                type="number" min="0"
                value={form.views_count ?? ''}
                onChange={e => set('views_count', e.target.value ? Number(e.target.value) : null)}
                placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="ep-panel__section">
        <span className="ep-panel__section-title">Featured Image</span>

        {/* hidden file input */}
        <input
          ref={featuredInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadFeaturedImage(file);
            e.target.value = '';
          }}
        />

        {form.og_image ? (
          <div className="ep-img-preview-wrap">
            <img
              src={form.og_image}
              alt="Featured preview"
              className="ep-img-preview"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <button
              type="button"
              className="ep-img-preview-remove"
              onClick={() => set('og_image', '')}
              title="Remove image"
            >
              <FiX size={13} />
            </button>
          </div>
        ) : (
          <div
            className={`ep-img-dropzone${featuredDragOver ? ' ep-img-dropzone--drag' : ''}${featuredUploading ? ' ep-img-dropzone--loading' : ''}`}
            onClick={() => featuredInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setFeaturedDragOver(true); }}
            onDragLeave={() => setFeaturedDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setFeaturedDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) uploadFeaturedImage(file);
            }}
          >
            {featuredUploading ? (
              <>
                <div className="ep-img-dropzone__icon">⏳</div>
                <span className="ep-img-dropzone__label">Uploading…</span>
              </>
            ) : (
              <>
                <div className="ep-img-dropzone__icon">
                  <FiImage size={26} />
                </div>
                <span className="ep-img-dropzone__label">Click to upload</span>
                <span className="ep-img-dropzone__hint">or drag &amp; drop · 1200×630px</span>
              </>
            )}
          </div>
        )}

        {featuredUploadErr && (
          <p className="ep-hint" style={{ color: 'var(--ep-danger)', marginTop: 6 }}>
            {featuredUploadErr}
          </p>
        )}

        <div className="ep-field" style={{ marginTop: 10 }}>
          <label className="ep-label" htmlFor="ps-caption">Caption</label>
          <input id="ps-caption" className="ep-input ep-input--sm"
            value={form.featured_image_caption ?? ''}
            onChange={e => set('featured_image_caption', e.target.value)}
            placeholder="Optional caption…" />
        </div>
      </div>

      {/* Author */}
      <div className="ep-panel__section">
        <span className="ep-panel__section-title">Author</span>

        {/* hidden avatar file input */}
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) uploadAvatar(file);
            e.target.value = '';
          }}
        />

        <div className="ep-author-row">
          <button
            type="button"
            className="ep-avatar ep-avatar--upload"
            onClick={() => avatarInputRef.current?.click()}
            title="Click to upload avatar"
            disabled={avatarUploading}
          >
            {avatarUploading ? (
              <span style={{ fontSize: 11, color: 'var(--ep-muted)' }}>…</span>
            ) : form.author_avatar ? (
              <img src={form.author_avatar} alt="avatar"
                onError={e => (e.currentTarget.style.display = 'none')} />
            ) : (
              (form.author || 'A').slice(0, 2).toUpperCase()
            )}
          </button>
          <div style={{ flex: 1 }}>
            {form.author_avatar ? (
              <button
                type="button"
                className="ep-avatar-btn"
                style={{ display: 'block', marginBottom: 4 }}
                onClick={() => avatarInputRef.current?.click()}
              >
                Change Avatar
              </button>
            ) : (
              <button
                type="button"
                className="ep-avatar-btn"
                style={{ display: 'block', marginBottom: 4 }}
                onClick={() => avatarInputRef.current?.click()}
              >
                Upload Avatar
              </button>
            )}
            {form.author_avatar && (
              <button
                type="button"
                className="ep-avatar-btn ep-avatar-btn--remove"
                onClick={() => set('author_avatar', '')}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {avatarUploadErr && (
          <p className="ep-hint" style={{ color: 'var(--ep-danger)', marginBottom: 8 }}>
            {avatarUploadErr}
          </p>
        )}

        <div className="ep-gap">
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-author">Name</label>
            <input id="ps-author" className="ep-input ep-input--sm"
              value={form.author} onChange={e => set('author', e.target.value)}
              placeholder="Carvel Russ" />
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-bio">
              Bio
              <span className="ep-label__hint">{(form.author_bio ?? '').length}/150</span>
            </label>
            <textarea id="ps-bio" className="ep-textarea"
              style={{ minHeight: 72 }}
              maxLength={150}
              value={form.author_bio ?? ''}
              onChange={e => set('author_bio', e.target.value)}
              placeholder="Short bio shown below the post…" />
          </div>
        </div>
      </div>

      {/* Category & Tags */}
      <div className="ep-panel__section">
        <span className="ep-panel__section-title">Category &amp; Tags</span>
        <div className="ep-gap">
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-category">Category</label>
            <input
              id="ps-category" className="ep-input"
              list="ps-category-list"
              value={form.category ?? ''}
              onChange={e => set('category', e.target.value)}
              placeholder="Select or type a category…"
              autoComplete="off"
            />
            <datalist id="ps-category-list">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="ps-tags">Tags</label>
            <TagInput value={form.keywords ?? ''} onChange={v => set('keywords', v)} />
            <p className="ep-hint">Press Enter to add</p>
          </div>
        </div>
      </div>
    </>
  );

  /* ── settings panel: SEO tab ── */
  const SeoSettingsTab = (
    <>
      <div className="ep-panel__section">
        <span className="ep-panel__section-title">Search Engine Optimisation</span>
        <div className="ep-gap">
          <div className="ep-field">
            <label className="ep-label" htmlFor="seo-title">
              SEO Title
              <span className="ep-label__hint">{form.title.length}/70</span>
            </label>
            <input id="seo-title" className="ep-input ep-input--sm"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Post title for search engines"
              maxLength={100} />
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="seo-slug">URL Slug</label>
            <input id="seo-slug" className="ep-input ep-input--sm"
              value={form.slug}
              onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
              placeholder="my-post-slug" />
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="seo-meta-desc">
              Meta Description
              <span className="ep-label__hint">{(form.meta_description ?? '').length}/160</span>
            </label>
            <textarea id="seo-meta-desc" className="ep-textarea"
              style={{ minHeight: 80 }}
              maxLength={200}
              value={form.meta_description ?? ''}
              onChange={e => set('meta_description', e.target.value)}
              placeholder="150–160 chars shown in search results…" />
          </div>
          <div className="ep-field">
            <label className="ep-label" htmlFor="seo-og-img">Open Graph Image</label>
            <input id="seo-og-img" className="ep-input ep-input--sm"
              type="url" value={form.og_image ?? ''}
              onChange={e => set('og_image', e.target.value)}
              placeholder="https://… (1200×630px recommended)" />
            {!form.og_image && (
              <p className="ep-hint" style={{ color: 'var(--ep-warning)' }}>
                ⚠ Missing OG image — social previews will use a placeholder
              </p>
            )}
          </div>
        </div>
        <SeoPreview
          title={form.title}
          slug={form.slug}
          desc={form.meta_description ?? ''}
        />
      </div>
    </>
  );

  return (
    <AdminLayout
      pageTitle={pageTitle}
      headerAction={headerAction}
      backTo="/admin/posts"
      hideViewSite
    >
      <form className="ep-page" onSubmit={handleSubmit}>

        {/* validation banner */}
        {validationErrors.length > 0 && (
          <div className="ep-validation-list">
            <div className="ep-validation-list__title">
              <FiAlertCircle size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
              Please fix the following before publishing:
            </div>
            <ul>{validationErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <div className="ep-layout">

          {/* ── Main editor column ── */}
          <div className="ep-main">

            {/* Title card */}
            <div className="ep-card">
              <div className="ep-card__body">
                <div className="ep-card__label">Post Title</div>
                <div className="ep-title-wrap">
                  <input
                    className="ep-title-input"
                    value={form.title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Enter an engaging title for your post…"
                    required
                    aria-label="Post title"
                    maxLength={120}
                  />
                  <span className={`ep-char-counter${form.title.length > 80 ? ' ep-char-counter--warn' : ''}${form.title.length > 100 ? ' ep-char-counter--over' : ''}`}>
                    {form.title.length}/100
                  </span>
                </div>

                {/* Permalink */}
                <div className="ep-permalink">
                  <span className="ep-permalink__label">Permalink:</span>
                  <span className="ep-permalink__base">carvelruss.com/blog/</span>
                  {editingSlug ? (
                    <div className="ep-slug-edit">
                      <input
                        autoFocus
                        value={form.slug}
                        onChange={e => { setSlugManual(true); set('slug', e.target.value); }}
                        onBlur={() => setEditingSlug(false)}
                        onKeyDown={e => e.key === 'Enter' && setEditingSlug(false)}
                        placeholder="my-post-slug"
                        aria-label="Edit URL slug"
                      />
                      <span className="ep-slug-edit__sep">·</span>
                      <input
                        className="ep-slug-edit__cat"
                        value={form.category ?? ''}
                        onChange={e => set('category', e.target.value)}
                        placeholder="Category"
                        aria-label="Category"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="ep-permalink__slug">{form.slug || 'your-post-slug'}</span>
                      <button
                        type="button"
                        className="ep-permalink__edit-btn"
                        onClick={() => setEditingSlug(true)}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Excerpt card */}
            <div className="ep-card">
              <div className="ep-card__body">
                <div className="ep-card__label">Excerpt</div>
                <div className="ep-excerpt-area">
                  <textarea
                    rows={3}
                    value={form.excerpt ?? ''}
                    onChange={e => set('excerpt', e.target.value)}
                    placeholder="Write a short summary of your post. This will be shown in blog lists and previews."
                    maxLength={200}
                    aria-label="Post excerpt"
                  />
                  <span className={`ep-char-counter${(form.excerpt?.length ?? 0) > 140 ? ' ep-char-counter--warn' : ''}`}>
                    {form.excerpt?.length ?? 0}/160
                  </span>
                </div>
              </div>
            </div>

            {/* Rich editor card */}
            <div className="ep-card">
              {/* Toolbar */}
              {editor && (
                <div className="ep-editor-toolbar">
                  <select
                    className="ep-tool-select"
                    value={headingLevel}
                    onChange={e => {
                      const l = Number(e.target.value);
                      if (l === 0) editor.chain().focus().setParagraph().run();
                      else editor.chain().focus().setHeading({ level: l as 1 | 2 | 3 }).run();
                    }}
                    aria-label="Text format"
                  >
                    <option value="0">Paragraph</option>
                    <option value="1">Heading 1</option>
                    <option value="2">Heading 2</option>
                    <option value="3">Heading 3</option>
                  </select>

                  <div className="ep-tool-sep" />

                  <button type="button" className={`ep-tool-btn${editor.isActive('bold') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)" aria-label="Bold">
                    <FiBold size={14} />
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('italic') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" aria-label="Italic">
                    <FiItalic size={14} />
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('underline') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" aria-label="Underline">
                    <span style={{ fontWeight: 800, textDecoration: 'underline', fontSize: 13 }}>U</span>
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('strike') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" aria-label="Strikethrough">
                    <span style={{ textDecoration: 'line-through', fontSize: 13, fontWeight: 600 }}>S</span>
                  </button>

                  <div className="ep-tool-sep" />

                  <button type="button" className={`ep-tool-btn${editor.isActive('bulletList') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list" aria-label="Bullet list">
                    <FiList size={14} />
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('orderedList') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list" aria-label="Numbered list">
                    <span style={{ fontSize: 11, fontWeight: 700 }}>1.</span>
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('blockquote') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" aria-label="Blockquote">
                    <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1 }}>"</span>
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('code') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code" aria-label="Inline code">
                    <FiCode size={14} />
                  </button>
                  <button type="button" className={`ep-tool-btn${editor.isActive('codeBlock') ? ' is-active' : ''}`}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block" aria-label="Code block">
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{`</>`}</span>
                  </button>

                  <div className="ep-tool-sep" />

                  <button type="button" className={`ep-tool-btn${editor.isActive('link') ? ' is-active' : ''}`}
                    onClick={addLink} title="Link" aria-label="Insert link">
                    <FiLink2 size={14} />
                  </button>
                  <button type="button" className="ep-tool-btn"
                    onClick={addImage} title="Insert image" aria-label="Insert image">
                    <FiImage size={14} />
                  </button>
                  <button type="button" className="ep-tool-btn"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule" aria-label="Horizontal rule">
                    <FiMinus size={14} />
                  </button>

                  <div className="ep-tool-sep" />

                  <button type="button" className="ep-tool-btn"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()} title="Undo (Ctrl+Z)" aria-label="Undo">
                    <FiRotateCcw size={13} />
                  </button>
                  <button type="button" className="ep-tool-btn"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()} title="Redo (Ctrl+Y)" aria-label="Redo">
                    <FiRotateCw size={13} />
                  </button>
                </div>
              )}

              {/* Editor body */}
              <div className="ep-editor-body">
                <EditorContent editor={editor} />
              </div>

              {/* Editor footer */}
              <div className="ep-editor-footer">
                <span className="ep-editor-footer__word-count">
                  {wordCount(form.content ?? '')} words
                </span>
                <span className="ep-editor-footer__save">
                  {dirty
                    ? <><FiAlertCircle size={12} /> Unsaved changes</>
                    : lastSaved
                    ? <><FiCheck size={12} style={{ color: '#16a34a' }} /> Draft autosaved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                    : null
                  }
                </span>
              </div>
            </div>

            {/* Collapsible: Tags (quick access) */}
            <CollapsibleSection
              title="Tags"
              sub="Add tags to help readers find your post."
            >
              <div style={{ paddingTop: 14 }}>
                <TagInput value={form.keywords ?? ''} onChange={v => set('keywords', v)} />
                <p className="ep-hint">Press Enter to add · tags appear as pills on the post</p>
              </div>
            </CollapsibleSection>

            {/* Collapsible: Author */}
            <CollapsibleSection
              title="Author Information"
              sub="Information about the post author."
            >
              <div style={{ paddingTop: 14 }} className="ep-gap">
                <div className="ep-field">
                  <label className="ep-label" htmlFor="col-author">Name</label>
                  <input id="col-author" className="ep-input ep-input--sm"
                    value={form.author} onChange={e => set('author', e.target.value)}
                    placeholder="Carvel Russ" />
                </div>
                <div className="ep-field">
                  <label className="ep-label" htmlFor="col-bio">Bio</label>
                  <textarea id="col-bio" className="ep-textarea"
                    style={{ minHeight: 68 }}
                    value={form.author_bio ?? ''}
                    onChange={e => set('author_bio', e.target.value)}
                    placeholder="Short bio shown below the post…" />
                </div>
              </div>
            </CollapsibleSection>

            {/* Collapsible: Related Posts placeholder */}
            <CollapsibleSection
              title="Related Posts"
              sub="Select related posts to recommend to readers."
            >
              <p style={{ paddingTop: 14, fontSize: 13, color: 'var(--ep-muted)' }}>
                Related posts are automatically selected from the same category.
              </p>
            </CollapsibleSection>

          </div>

          {/* ── Right settings panel ── */}
          <div className="ep-panel">
            <div className="ep-panel__tabs">
              <button
                type="button"
                className={`ep-panel__tab${panelTab === 'post' ? ' is-active' : ''}`}
                onClick={() => setPanelTab('post')}
              >
                Post Settings
              </button>
              <button
                type="button"
                className={`ep-panel__tab${panelTab === 'seo' ? ' is-active' : ''}`}
                onClick={() => setPanelTab('seo')}
              >
                SEO Settings
              </button>
            </div>

            {panelTab === 'post' ? PostSettingsTab : SeoSettingsTab}
          </div>

        </div>
      </form>

      {/* ── Preview modal ── */}
      {preview && (
        <div className="ep-preview-overlay" role="dialog" aria-modal="true" aria-label="Post preview">
          <div className="ep-preview-bar">
            <span className="ep-preview-bar__title">Preview — {form.title || 'Untitled'}</span>
            <button type="button" className="ep-preview-bar__close" onClick={() => setPreview(false)}>
              ✕ Close Preview
            </button>
          </div>
          <div className="ep-preview-frame">
            <article>
              <BlogHero post={{ ...form, id: 0 } as Post} />
              <BlogContent
                html={form.content?.trim().startsWith('<') ? (form.content ?? '') : renderMarkdown(form.content ?? '')}
                post={{ ...form, id: 0 } as Post}
              />
            </article>
          </div>
        </div>
      )}

      {/* ── Toast notifications ── */}
      <div className="ep-toasts" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`ep-toast ep-toast--${t.kind}`}>
            <span className="ep-toast__icon">{TOAST_ICONS[t.kind]}</span>
            <span className="ep-toast__msg">{t.msg}</span>
          </div>
        ))}
      </div>

    </AdminLayout>
  );
}
