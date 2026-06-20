import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { MediaAsset } from '../../types';

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + 'KB';
  return (bytes / 1048576).toFixed(1) + 'MB';
}

export default function AdminMediaPage() {
  const [assets, setAssets]       = useState<MediaAsset[]>([]);
  const [filtered, setFiltered]   = useState<MediaAsset[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [search, setSearch]       = useState('');
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.getMedia()
      .then(data => {
        setAssets(data);
        setFiltered(data);
      })
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

  const handleDelete = async (id: number) => {
    const asset = assets.find(a => a.id === id);
    if (!asset) return;
    if (!window.confirm(`Delete "${asset.file_name}"? This will remove it from storage.`)) return;
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
        <button
          className="a-btn a-btn--primary"
          onClick={triggerUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '+ Upload Media'}
        </button>
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-toolbar" style={{ marginBottom: 20 }}>
        <div className="a-search-wrap">
          <span className="a-search-icon">🔍</span>
          <input
            className="a-search"
            type="search"
            placeholder="Search files…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="a-loading">Loading media…</div>
      ) : filtered.length === 0 ? (
        <div className="a-empty">
          <div className="a-empty__icon">🖼</div>
          <p>{search ? 'No files match your search.' : 'No media uploaded yet. Click Upload Media to get started.'}</p>
        </div>
      ) : (
        <div className="a-media-grid">
          {filtered.map(asset => (
            <div key={asset.id} className="a-media-card">
              {asset.file_type?.startsWith('image/') ? (
                <img
                  className="a-media-card__thumb"
                  src={asset.file_url}
                  alt={asset.file_name}
                  loading="lazy"
                />
              ) : (
                <div className="a-media-card__thumb-fallback">🖼</div>
              )}
              <div className="a-media-card__body">
                <div className="a-media-card__name" title={asset.file_name}>
                  {asset.file_name}
                </div>
                <div className="a-media-card__meta">{formatBytes(asset.file_size)}</div>
                <div className="a-media-card__actions">
                  <button
                    className="a-action-btn"
                    title="Copy URL"
                    onClick={() => navigator.clipboard.writeText(asset.file_url)}
                    aria-label={`Copy URL for ${asset.file_name}`}
                  >
                    📋
                  </button>
                  <button
                    className="a-action-btn a-action-btn--delete"
                    title="Delete"
                    onClick={() => handleDelete(asset.id)}
                    aria-label={`Delete ${asset.file_name}`}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
