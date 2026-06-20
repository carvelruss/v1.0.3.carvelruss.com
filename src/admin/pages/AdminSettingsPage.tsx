import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { SiteSetting } from '../../types';

const SETTING_LABELS: Record<string, { label: string; hint?: string; type?: 'text' | 'url' | 'email' | 'textarea' }> = {
  site_name:      { label: 'Site Name',          hint: 'Your name or brand name' },
  site_tagline:   { label: 'Professional Title',  hint: 'e.g. UI/UX Developer' },
  contact_email:  { label: 'Contact Email',        type: 'email', hint: 'Displayed publicly on the contact page' },
  linkedin_url:   { label: 'LinkedIn URL',         type: 'url' },
  github_url:     { label: 'GitHub URL',           type: 'url' },
  twitter_url:    { label: 'Twitter / X URL',      type: 'url' },
  availability:   { label: 'Availability Status',  hint: 'e.g. Available for new projects' },
  hero_headline:  { label: 'Hero Headline',        type: 'textarea', hint: 'The main tagline shown in the hero section' },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    setLoading(true);
    api.getSettings()
      .then((rows: SiteSetting[]) => {
        const map: Record<string, string> = {};
        rows.forEach(r => { map[r.setting_key] = r.setting_value ?? ''; });
        setSettings(map);
      })
      .catch(() => setError('Failed to load settings. Make sure migration 003 has been applied.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSuccess('Settings saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout pageTitle="Settings">
      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      {loading ? (
        <p style={{ color: '#64748b', padding: '12px 0' }}>Loading settings…</p>
      ) : (
        <form onSubmit={handleSave}>
          {/* Identity */}
          <div className="a-card" style={{ marginBottom: 20 }}>
            <div className="a-section-head" style={{ marginBottom: 20 }}>
              <span className="a-section-head__title">Identity</span>
            </div>
            <div className="a-form">
              {['site_name', 'site_tagline', 'contact_email', 'hero_headline'].map(key => {
                const meta = SETTING_LABELS[key] ?? { label: key };
                return (
                  <div className="a-field" key={key}>
                    <label className="a-field__label" htmlFor={`setting-${key}`}>{meta.label}</label>
                    {meta.type === 'textarea' ? (
                      <textarea
                        id={`setting-${key}`}
                        className="a-textarea"
                        rows={3}
                        value={settings[key] ?? ''}
                        onChange={e => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`setting-${key}`}
                        type={meta.type ?? 'text'}
                        className="a-input"
                        value={settings[key] ?? ''}
                        onChange={e => handleChange(key, e.target.value)}
                      />
                    )}
                    {meta.hint && <span className="a-field__hint">{meta.hint}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Links */}
          <div className="a-card" style={{ marginBottom: 20 }}>
            <div className="a-section-head" style={{ marginBottom: 20 }}>
              <span className="a-section-head__title">Social Links</span>
            </div>
            <div className="a-form">
              {['linkedin_url', 'github_url', 'twitter_url'].map(key => {
                const meta = SETTING_LABELS[key] ?? { label: key };
                return (
                  <div className="a-field" key={key}>
                    <label className="a-field__label" htmlFor={`setting-${key}`}>{meta.label}</label>
                    <input
                      id={`setting-${key}`}
                      type="url"
                      className="a-input"
                      value={settings[key] ?? ''}
                      onChange={e => handleChange(key, e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="a-card" style={{ marginBottom: 24 }}>
            <div className="a-section-head" style={{ marginBottom: 20 }}>
              <span className="a-section-head__title">Availability</span>
            </div>
            <div className="a-form">
              <div className="a-field">
                <label className="a-field__label" htmlFor="setting-availability">
                  {SETTING_LABELS.availability.label}
                </label>
                <input
                  id="setting-availability"
                  type="text"
                  className="a-input"
                  value={settings.availability ?? ''}
                  onChange={e => handleChange('availability', e.target.value)}
                  placeholder="Available for new projects"
                />
                <span className="a-field__hint">{SETTING_LABELS.availability.hint}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="submit" className="a-btn a-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
