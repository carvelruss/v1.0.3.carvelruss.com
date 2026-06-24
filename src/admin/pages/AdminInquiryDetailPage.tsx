import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useConfirm } from '../components/ConfirmModal';
import { api } from '../../lib/api';
import type { Inquiry } from '../../types';

type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

function formatDate(d: string) {
  // D1/SQLite stores datetimes without a timezone marker (e.g. "2026-06-24 06:40:00").
  // JS treats that as local time, not UTC — so we normalise to ISO+Z before parsing.
  const iso = d.endsWith('Z') || d.includes('+') ? d : d.replace(' ', 'T') + 'Z';
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="adm-inq-detail-row">
      <span className="adm-inq-detail-label">{label}</span>
      <span className="adm-inq-detail-value">{children}</span>
    </div>
  );
}

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = api.getToken();
    fetch(`/api/inquiries/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => {
        if (r.status === 401) {
          api.clearToken();
          window.location.href = '/admin/login';
          throw new Error('Session expired');
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ inquiry?: Inquiry } | Inquiry>;
      })
      .then((data) => {
        setInquiry(('inquiry' in data && data.inquiry) ? data.inquiry : (data as Inquiry));
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load inquiry.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: InquiryStatus) => {
    if (!inquiry || updating) return;
    setUpdating(true);
    setError('');
    try {
      await api.updateInquiryStatus(inquiry.id, status);
      setInquiry(prev => prev ? { ...prev, status, is_read: status !== 'unread' ? 1 : 0 } : prev);
      setSuccess(`Marked as ${status}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const deleteInquiry = async () => {
    if (!inquiry) return;
    if (!await confirm({ title: 'Delete message?', message: `Delete message from "${inquiry.name}"? This cannot be undone.` })) return;
    setUpdating(true);
    setError('');
    try {
      await api.deleteInquiry(inquiry.id);
      navigate('/admin/inbox', { replace: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
      setUpdating(false);
    }
  };

  const status = inquiry?.status as InquiryStatus | undefined;

  return (
    <AdminLayout pageTitle="Inquiry Detail">
      {modal}
      {/* Alerts */}
      {error   && (
        <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 16 }} onClick={() => setError('')}>
          {error}
        </div>
      )}
      {success && (
        <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>
          {success}
        </div>
      )}

      {/* Back + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '.75rem' }}>
        <button
          className="a-btn a-btn--ghost a-btn--sm"
          onClick={() => navigate(-1)}
          aria-label="Back to Inquiries"
        >
          &larr; Back to Inquiries
        </button>

        {inquiry && (
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            <button
              className="a-btn a-btn--success a-btn--sm"
              onClick={() => updateStatus('replied')}
              disabled={updating || status === 'replied'}
              aria-label="Mark as Replied"
            >
              Mark as Replied
            </button>
            <button
              className="a-btn a-btn--ghost a-btn--sm"
              onClick={() => updateStatus('archived')}
              disabled={updating || status === 'archived'}
              aria-label="Archive"
            >
              Archive
            </button>
            <button
              className="a-btn a-btn--danger a-btn--sm"
              onClick={deleteInquiry}
              disabled={updating}
              aria-label="Delete inquiry"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="a-empty">
          <div className="a-loading" aria-label="Loading inquiry">Loading&hellip;</div>
        </div>
      )}

      {/* Error (no inquiry loaded) */}
      {!loading && !inquiry && !error && (
        <div className="a-empty">
          <div className="a-empty__icon" aria-hidden="true">&#128233;</div>
          <p>Inquiry not found.</p>
        </div>
      )}

      {/* Main layout */}
      {!loading && inquiry && (
        <div className="adm-inquiry-layout">

          {/* Left: message card */}
          <div className="a-card">
            {/* Sender */}
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--adm-border)' }}>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--adm-text)', marginBottom: '.25rem' }}>
                {inquiry.name}
              </div>
              <div style={{ fontSize: '.875rem', color: 'var(--adm-muted)' }}>
                <a href={`mailto:${inquiry.email}`} style={{ color: 'var(--adm-muted)', textDecoration: 'none' }}>
                  {inquiry.email}
                </a>
              </div>
            </div>

            {/* Subject */}
            {inquiry.subject && (
              <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--adm-text-2)', marginBottom: '1rem' }}>
                Subject: {inquiry.subject}
              </div>
            )}

            {/* Message body */}
            <p className="adm-inquiry-msg">{inquiry.message}</p>

            {/* Reply link */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)' }}>
              <a
                href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject ?? 'Your inquiry'}`}
                className="a-btn a-btn--primary a-btn--sm"
              >
                &#8617; Reply via email
              </a>
            </div>
          </div>

          {/* Right: info sidebar */}
          <div className="a-card">
            <div className="a-section-head" style={{ marginBottom: '1rem' }}>
              <span className="a-section-head__title">Inquiry Information</span>
            </div>

            {/* Status */}
            <DetailRow label="Status">
              <span className={`a-badge a-badge--${inquiry.status}`}>
                {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
              </span>
            </DetailRow>

            {/* Date */}
            <DetailRow label="Received">
              {formatDate(inquiry.created_at)}
            </DetailRow>

            {/* Email */}
            <DetailRow label="Email">
              <a href={`mailto:${inquiry.email}`} style={{ color: 'var(--adm-accent, #6366f1)', wordBreak: 'break-all' }}>
                {inquiry.email}
              </a>
            </DetailRow>

            {/* IP address */}
            {inquiry.ip_address && (
              <DetailRow label="IP Address">
                <span style={{ fontFamily: 'monospace', fontSize: '.8125rem' }}>{inquiry.ip_address}</span>
              </DetailRow>
            )}

            {/* Project type */}
            {inquiry.project_type && (
              <DetailRow label="Project Type">
                {inquiry.project_type}
              </DetailRow>
            )}

            {/* Budget range */}
            {inquiry.budget_range && (
              <DetailRow label="Budget Range">
                {inquiry.budget_range}
              </DetailRow>
            )}

            {/* Timeline */}
            {inquiry.timeline && (
              <DetailRow label="Timeline">
                {inquiry.timeline}
              </DetailRow>
            )}

            {/* Quick status actions */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--adm-border)', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {status !== 'replied' && (
                <button
                  className="a-btn a-btn--success a-btn--sm"
                  style={{ width: '100%' }}
                  onClick={() => updateStatus('replied')}
                  disabled={updating}
                >
                  Mark as Replied
                </button>
              )}
              {status !== 'archived' && (
                <button
                  className="a-btn a-btn--ghost a-btn--sm"
                  style={{ width: '100%' }}
                  onClick={() => updateStatus('archived')}
                  disabled={updating}
                >
                  Archive
                </button>
              )}
              {status === 'archived' && (
                <button
                  className="a-btn a-btn--ghost a-btn--sm"
                  style={{ width: '100%' }}
                  onClick={() => updateStatus('read')}
                  disabled={updating}
                >
                  Unarchive
                </button>
              )}
              {status !== 'unread' && (
                <button
                  className="a-btn a-btn--ghost a-btn--sm"
                  style={{ width: '100%' }}
                  onClick={() => updateStatus('unread')}
                  disabled={updating}
                >
                  Mark as Unread
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
