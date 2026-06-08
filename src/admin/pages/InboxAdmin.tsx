import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry } from '../../types';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function InboxAdmin() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const load = () => {
    setLoading(true);
    api.getInquiries()
      .then(setInquiries)
      .catch(() => setError('Failed to load inquiries'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleExpand = async (inq: Inquiry) => {
    if (expanded === inq.id) { setExpanded(null); return; }
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

  /* Consistent avatar color per initial letter */
  const avatarColor = (name: string) => {
    const colors = [
      { bg: '#eef2ff', text: '#6366f1' },
      { bg: '#dcfce7', text: '#16a34a' },
      { bg: '#fef3c7', text: '#d97706' },
      { bg: '#fee2e2', text: '#ef4444' },
      { bg: '#f0f9ff', text: '#0284c7' },
      { bg: '#fdf4ff', text: '#a855f7' },
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <AdminLayout pageTitle="Inbox" unreadInquiries={unread}>
      {error   && <div className="a-alert a-alert--error"   role="alert"  style={{ marginBottom: 16 }} onClick={() => setError('')}>{error}</div>}
      {success && <div className="a-alert a-alert--success" role="status" style={{ marginBottom: 16 }} onClick={() => setSuccess('')}>{success}</div>}

      <div className="a-page-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="a-page-header__title">Client Inquiries</div>
          <div className="a-page-header__sub">
            {unread > 0
              ? `${unread} unread message${unread > 1 ? 's' : ''}`
              : 'All caught up — no unread messages'
            }
          </div>
        </div>
        {unread > 0 && (
          <span className="a-badge a-badge--unread">
            <span className="a-badge__dot" />
            {unread} unread
          </span>
        )}
      </div>

      <div className="a-card">
        {loading ? (
          <p style={{ padding: 32, color: '#64748b', textAlign: 'center' }}>Loading…</p>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              No inquiries yet. Messages submitted via your contact form will appear here.
            </p>
          </div>
        ) : (
          <div>
            {inquiries.map((inq, idx) => {
              const av = avatarColor(inq.name);
              const isOpen = expanded === inq.id;
              return (
                <div
                  key={inq.id}
                  style={{ borderBottom: idx < inquiries.length - 1 ? '1px solid #e5e7eb' : 'none' }}
                >
                  {/* ── Row header ── */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: 13, padding: '15px 20px', cursor: 'pointer',
                      background: isOpen ? '#fafbfd' : undefined,
                      transition: 'background .12s',
                    }}
                    onClick={() => handleExpand(inq)}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && handleExpand(inq)}
                    aria-expanded={isOpen}
                    aria-label={`Message from ${inq.name}`}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: av.bg, color: av.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 15, flexShrink: 0, border: `1.5px solid ${av.bg}`,
                    }} aria-hidden="true">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: inq.is_read ? 500 : 700, fontSize: 14, color: '#0f172a' }}>
                            {inq.name}
                          </span>
                          {!inq.is_read && (
                            <span className="a-badge a-badge--unread" style={{ fontSize: 10.5, padding: '2px 7px' }}>
                              New
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11.5, color: '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {formatDate(inq.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{inq.email}</div>
                      {!isOpen && (
                        <div style={{
                          fontSize: 13, color: '#64748b', marginTop: 4,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {inq.message}
                        </div>
                      )}
                    </div>

                    <span style={{ color: '#64748b', flexShrink: 0 }}>
                      <ChevronIcon open={isOpen} />
                    </span>
                  </div>

                  {/* ── Expanded body ── */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 18px 73px' }}>
                      <div style={{
                        background: '#f6f8fb', border: '1px solid #e5e7eb',
                        borderRadius: 10, padding: '13px 16px',
                        fontSize: 13.5, color: '#0f172a', lineHeight: 1.65,
                        whiteSpace: 'pre-wrap', marginBottom: 12,
                      }}>
                        {inq.message}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                        <span>From: <a href={`mailto:${inq.email}`} style={{ color: '#6366f1', fontWeight: 500 }}>{inq.email}</a></span>
                        {inq.ip_address && <span>IP: {inq.ip_address}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`mailto:${inq.email}?subject=Re: Your message`}
                          className="a-btn a-btn--primary a-btn--sm"
                        >
                          ↩ Reply via email
                        </a>
                        <button
                          className="a-btn a-btn--danger a-btn--sm"
                          onClick={() => handleDelete(inq)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
