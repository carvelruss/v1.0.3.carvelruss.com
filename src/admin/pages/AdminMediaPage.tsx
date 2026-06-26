import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import type { MediaAsset } from '../../types';

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + 'KB';
  return (bytes / 1048576).toFixed(1) + 'MB';
}

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconImage = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);

export default function AdminMediaPage() {
  const { confirm, modal } = useConfirm();
  const [assets, setAssets]       = useState<MediaAsset[]>([]);
  const [filtered, setFiltered]   = useState<MediaAsset[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [search, setSearch]       = useState('');
  const [copied, setCopied]       = useState<number | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.getMedia()
      .then(data => { setAssets(data); setFiltered(data); })
      .catch(() => setError('Failed to load media. Make sure the media_assets table exists.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? assets.filter(a => a.file_name.toLowerCase().includes(q)) : assets);
  }, [search, assets]);

  const triggerUpload = () => fileInputRef.current?.click();

  const uploadFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      await api.uploadImage(file);
      setSuccess(`"${file.name}" uploaded successfully.`);
      setTimeout(() => setSuccess(''), 4000);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleCopy = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.file_url);
    setCopied(asset.id);
    setTimeout(() => setCopied(null), 1800);
  };

  const handleDelete = async (id: number) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    if (!await confirm({ title: 'Delete file?', message: `Delete "${asset.file_name}"? This will remove it from storage.` })) return;
    try {
      await api.deleteMedia(id);
      setSuccess(`"${asset.file_name}" deleted.`);
      setTimeout(() => setSuccess(''), 4000);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  return (
    <AdminLayout
      pageTitle="Media Library"
      headerAction={
        <button className="a-btn a-btn--primary" onClick={triggerUpload} disabled={uploading}>
          {uploading ? 'Uploading…' : '+ Upload Media'}
        </button>
      }
    >
      {modal}
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-toolbar" style={{ marginBottom: 20 }}>
        <div className="a-search-wrap">
          <span className="a-search-icon"><IconSearch /></span>
          <input
            className="a-search"
            type="search"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {!loading && (
          <span className="a-media-count">
            {filtered.length} {filtered.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="a-loading" style={{ margin: '60px auto' }} />
      ) : filtered.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty__icon" style={{ opacity: 0.35 }}><IconImage /></div>
          <p>{search ? 'No files match your search.' : 'No media uploaded yet.'}</p>
          {!search && (
            <button className="a-btn a-btn--secondary a-btn--sm" onClick={triggerUpload}>
              Upload your first file
            </button>
          )}
        </div>
      ) : (
        <div className="a-media-grid">
          {filtered.map(asset => (
            <div key={asset.id} className="a-media-card">
              <div className="a-media-card__thumb-wrap">
                {asset.file_type?.startsWith('image/') ? (
                  <img className="a-media-card__thumb" src={asset.file_url} alt={asset.file_name} loading="lazy" />
                ) : (
                  <div className="a-media-card__thumb-fallback"><IconImage /></div>
                )}
                <div className="a-media-card__overlay">
                  <div className="a-media-card__overlay-actions">
                    <button
                      className={`a-media-card__action${copied === asset.id ? ' is-copied' : ''}`}
                      title={copied === asset.id ? 'Copied!' : 'Copy URL'}
                      onClick={() => handleCopy(asset)}
                    >
                      {copied === asset.id ? <IconCheck /> : <IconCopy />}
                    </button>
                    <button
                      className="a-media-card__action a-media-card__action--delete"
                      title="Delete"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>
              <div className="a-media-card__info">
                <span className="a-media-card__name" title={asset.file_name}>{asset.file_name}</span>
                <span className="a-media-card__size">{formatBytes(asset.file_size)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
