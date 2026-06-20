import { useState, useEffect, useRef, useCallback } from 'react';
import { FiUploadCloud, FiCopy, FiTrash2, FiImage } from 'react-icons/fi';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { MediaAsset } from '../../types';

function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminMediaPage() {
  const [assets, setAssets]       = useState<MediaAsset[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [copied, setCopied]       = useState<number | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    api.getMedia()
      .then(setAssets)
      .catch(() => setError('Failed to load media. Make sure the media_assets table exists (run migration 003).'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      setSuccess(`"${file.name}" uploaded successfully.`);
      setTimeout(() => setSuccess(''), 4000);
      load();
      // Return the URL for potential use
      return url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed. Check R2 binding.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const copyUrl = async (asset: MediaAsset) => {
    try {
      await navigator.clipboard.writeText(asset.file_url);
      setCopied(asset.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Could not copy URL.');
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!window.confirm(`Delete "${asset.file_name}"? This will remove it from storage.`)) return;
    try {
      await api.deleteMedia(asset.id);
      setSuccess(`"${asset.file_name}" deleted.`);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <AdminLayout
      pageTitle="Media"
      headerAction={
        <button
          className="a-btn a-btn--primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : '+ Upload Image'}
        </button>
      }
    >
      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      {/* Upload zone */}
      <div
        className={`a-dropzone ${dragOver ? 'a-dropzone--over' : ''} ${uploading ? 'a-dropzone--uploading' : ''}`}
        style={{ marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Click or drag to upload image"
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <div className="a-dropzone__prompt">
          <FiUploadCloud size={28} className="a-dropzone__icon" />
          {uploading ? (
            <span className="a-dropzone__label">Uploading…</span>
          ) : (
            <>
              <span className="a-dropzone__label"><strong>Click to upload</strong> or drag &amp; drop</span>
              <span className="a-dropzone__hint">PNG, JPG, WebP, SVG — max 5 MB</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {/* Media grid */}
      <div className="a-card">
        {loading ? (
          <p style={{ padding: 32, color: '#64748b', textAlign: 'center' }}>Loading media…</p>
        ) : assets.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FiImage size={40} style={{ color: '#d1d5db', marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: 14 }}>
              No media uploaded yet. Click <strong>Upload Image</strong> or drag an image here.
            </p>
          </div>
        ) : (
          <div className="a-table-wrap">
            <table className="a-table" aria-label="Media assets">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td style={{ width: 72 }}>
                      <div style={{ width: 56, height: 40, borderRadius: 6, overflow: 'hidden', background: '#f3f4f6', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                        {asset.file_type?.startsWith('image/') !== false ? (
                          <img
                            src={asset.file_url}
                            alt={asset.file_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiImage size={18} style={{ color: '#9ca3af' }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="a-table__title" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {asset.file_name}
                      </div>
                      <div className="a-table__sub" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>
                        {asset.file_url}
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{asset.file_type ?? '—'}</td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{formatBytes(asset.file_size)}</td>
                    <td style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(asset.created_at)}</td>
                    <td>
                      <div className="a-table__actions">
                        <button
                          className="a-btn a-btn--ghost a-btn--sm"
                          onClick={() => copyUrl(asset)}
                          aria-label={`Copy URL for ${asset.file_name}`}
                          title="Copy URL"
                        >
                          {copied === asset.id ? '✓ Copied' : <><FiCopy size={12} style={{ marginRight: 4 }} />Copy URL</>}
                        </button>
                        <button
                          className="a-btn a-btn--danger a-btn--sm"
                          onClick={() => handleDelete(asset)}
                          aria-label={`Delete ${asset.file_name}`}
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
