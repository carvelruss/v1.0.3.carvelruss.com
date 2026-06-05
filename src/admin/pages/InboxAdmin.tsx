import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry } from '../../types';

export default function InboxAdmin() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    api.getInquiries()
      .then(setInquiries)
      .catch(() => setError('Failed to load inquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExpand = async (inq: Inquiry) => {
    if (expanded === inq.id) {
      setExpanded(null);
      return;
    }
    setExpanded(inq.id);
    if (!inq.is_read) {
      try {
        await api.markRead(inq.id);
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, is_read: 1 } : i));
      } catch { /* ignore */ }
    }
  };

  const handleDelete = async (inq: Inquiry) => {
    if (!window.confirm(`Delete message from "${inq.name}"?`)) return;
    try {
      await api.deleteInquiry(inq.id);
      setSuccess('Message deleted.');
      setExpanded(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const unread = inquiries.filter(i => !i.is_read).length;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <AdminLayout pageTitle="Inbox" unreadInquiries={unread}>
      {error && <div className="a-alert a-alert--error" role="alert" style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-page-header" style={{ marginBottom: 12 }}>
        <div>
          <div className="a-page-header__title">Client Inquiries</div>
          <div className="a-page-header__sub">
            {unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All messages read'}
          </div>
        </div>
      </div>

      <div className="a-card">
        {loading ? (
          <p style={{ padding: 24, color: '#6c7a8d' }}>Loading…</p>
        ) : inquiries.length === 0 ? (
          <p style={{ padding: 40, textAlign: 'center', color: '#6c7a8d' }}>
            No inquiries yet. Messages submitted via your contact form will appear here.
          </p>
        ) : (
          <div>
            {inquiries.map((inq, idx) => (
              <div
                key={inq.id}
                style={{
                  borderBottom: idx < inquiries.length - 1 ? '1px solid #e1e7ef' : 'none',
                  padding: '14px 20px',
                }}
              >
                {/* ── Row header ── */}
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                  onClick={() => handleExpand(inq)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleExpand(inq)}
                  aria-expanded={expanded === inq.id}
                  aria-label={`Message from ${inq.name}`}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: inq.is_read ? '#f4f6fa' : '#e7f0fd',
                    color: inq.is_read ? '#6c7a8d' : '#1877f2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15,
                  }} aria-hidden="true">
                    {inq.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: inq.is_read ? 500 : 700, fontSize: 14, color: '#1c2537' }}>
                        {inq.name}
                        {!inq.is_read && (
                          <span className="a-badge a-badge--unread" style={{ marginLeft: 8 }}>New</span>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: '#6c7a8d', flexShrink: 0 }}>{formatDate(inq.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6c7a8d' }}>{inq.email}</div>
                    {expanded !== inq.id && (
                      <div style={{
                        fontSize: 13, color: '#6c7a8d', marginTop: 4,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {inq.message}
                      </div>
                    )}
                  </div>

                  <span style={{ color: '#6c7a8d', fontSize: 12, flexShrink: 0 }}>
                    {expanded === inq.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* ── Expanded message ── */}
                {expanded === inq.id && (
                  <div className="a-inquiry" style={{ marginLeft: 50 }}>
                    <div className="a-inquiry__message">{inq.message}</div>
                    <div className="a-inquiry__meta">
                      <span>From: <a href={`mailto:${inq.email}`} style={{ color: '#1877f2' }}>{inq.email}</a></span>
                      {inq.ip_address && <span>IP: {inq.ip_address}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <a href={`mailto:${inq.email}?subject=Re: Your message`} className="a-btn a-btn--primary a-btn--sm">
                        ↩ Reply via email
                      </a>
                      <button className="a-btn a-btn--danger a-btn--sm" onClick={() => handleDelete(inq)}>
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
