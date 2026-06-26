import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { MediaAsset } from '../../types';

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [filtered, setFiltered] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getMedia()
      .then(data => {
        const images = data.filter(a => !a.file_type || a.file_type.startsWith('image/'));
        setAssets(images);
        setFiltered(images);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? assets.filter(a => a.file_name.toLowerCase().includes(q)) : assets);
  }, [search, assets]);

  return (
    <div
      className="a-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="a-modal" style={{ maxWidth: 720, width: '100%' }}>
        <div className="a-modal__header">
          <span className="a-modal__title">Media Library</span>
          <button type="button" className="a-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div style={{ padding: '12px 20px 8px' }}>
          <input
            className="a-input"
            type="search"
            placeholder="Search images…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ padding: '8px 20px 20px', maxHeight: 420, overflowY: 'auto' }}>
          {loading ? (
            <div className="a-loading" style={{ margin: '40px auto' }} />
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--a-muted, #6b7280)', padding: '40px 0' }}>
              {search ? 'No images match your search.' : 'No images in the media library yet.'}
            </p>
          ) : (
            <div className="a-media-grid">
              {filtered.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  className="a-media-card a-media-card--selectable"
                  onClick={() => { onSelect(asset.file_url); onClose(); }}
                  title={asset.file_name}
                >
                  <img
                    className="a-media-card__thumb"
                    src={asset.file_url}
                    alt={asset.file_name}
                    loading="lazy"
                  />
                  <div className="a-media-card__name">{asset.file_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
