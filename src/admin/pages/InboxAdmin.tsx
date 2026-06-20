import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import AdminLayout from '../components/AdminLayout';
import type { Inquiry } from '../../types';

type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5"
      style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const STATUS_CONFIG: Record<InquiryStatus, { label: string; bg: string; color: string }> = {
  unread:   { label: 'New',      bg: '#eff6ff', color: '#2563eb' },
  read:     { label: 'Read',     bg: '#f3f4f6', color: '#6b7280' },
  replied:  { label: 'Replied',  bg: '#dcfce7', color: '#16a34a' },
  archived: { label: 'Archived', bg: '#fef3c7', color: '#d97706' },
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.read;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      {status === 'unread' && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} aria-hidden="true" />
      )}
      {cfg.label}
    </span>
  );
}

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all',      label: 'All'      },
  { value: 'unread',   label: 'Unread'   },
  { value: 'replied',  label: 'Replied'  },
  { value: 'archived', label: 'Archived' },
];

export default function InboxAdmin() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');

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
    if (inq.status === 'unread') {
      try {
        await api.updateInquiryStatus(inq.id, 'read');
        setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'read', is_read: 1 } : i));
      } catch { /* ignore */ }
    }
  };

  const handleStatusChange = async (inq: Inquiry, newStatus: InquiryStatus) => {
    try {
      await api.updateInquiryStatus(inq.id, newStatus);
      setInquiries(prev => prev.map(i =>
        i.id === inq.id
          ? { ...i, status: newStatus, is_read: newStatus !== 'unread' ? 1 : 0 }
          : i,
      ));
      setSuccess(`Marked as ${newStatus}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const handleDelete = async (inq: Inquiry) => {
    if (!window.confirm(`Delete message from "${inq.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteInquiry(inq.id);
      setSuccess('Message deleted.');
      setExpanded(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const effectiveStatus = (inq: Inquiry): InquiryStatus =>
    (inq.status as InquiryStatus) ?? (inq.is_read ? 'read' : 'unread');

  const unread = inquiries.filter(i => effectiveStatus(i) === 'unread').length;

  const filtered = inquiries.filter(inq => {
    const status = effectiveStatus(inq);
    if (filter !== 'all' && status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inq.name.toLowerCase().includes(q) ||
        inq.email.toLowerCase().includes(q) ||
        (inq.subject ?? '').toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

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

      {/* Header + Search */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            type="search"
            placeholder="Search inquiries…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="a-input"
            aria-label="Search inquiries"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.value}
              className={`a-btn a-btn--sm ${filter === tab.value ? 'a-btn--primary' : 'a-btn--ghost'}`}
              onClick={() => setFilter(tab.value)}
              aria-pressed={filter === tab.value}
            >
              {tab.label}
              {tab.value === 'unread' && unread > 0 && (
                <span style={{ marginLeft: 4, background: '#2563eb', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="a-card">
        {loading ? (
          <p style={{ padding: 32, color: '#64748b', textAlign: 'center' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {search || filter !== 'all'
                ? 'No inquiries match your search or filter.'
                : 'No inquiries yet. Messages from your contact form will appear here.'}
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((inq, idx) => {
              const av     = avatarColor(inq.name);
              const isOpen = expanded === inq.id;
              const status = effectiveStatus(inq);
              return (
                <div key={inq.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  {/* Row header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: 13, padding: '14px 20px', cursor: 'pointer',
                      background: isOpen ? '#fafbfd' : (status === 'unread' ? '#f8faff' : undefined),
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
                      width: 38, height: 38, borderRadius: '50%',
                      background: av.bg, color: av.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }} aria-hidden="true">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: status === 'unread' ? 700 : 500, fontSize: 14, color: '#0f172a' }}>
                            {inq.name}
                          </span>
                          <StatusBadge status={status} />
                          {inq.project_type && (
                            <span style={{ fontSize: 11, background: '#ede9fe', color: '#7c3aed', borderRadius: 10, padding: '2px 8px', fontWeight: 500 }}>
                              {inq.project_type}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11.5, color: '#64748b', flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {formatDate(inq.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>
                        {inq.email}
                        {inq.subject && <span style={{ marginLeft: 8, color: '#374151' }}>· {inq.subject}</span>}
                      </div>
                      {!isOpen && (
                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inq.message}
                        </div>
                      )}
                    </div>

                    <span style={{ color: '#64748b', flexShrink: 0 }}>
                      <ChevronIcon open={isOpen} />
                    </span>
                  </div>

                  {/* Expanded body */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px 71px' }}>
                      {/* Meta row */}
                      {(inq.project_type || inq.budget_range || inq.timeline) && (
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                          {inq.project_type  && <div style={{ fontSize: 12, color: '#64748b' }}><strong>Project:</strong> {inq.project_type}</div>}
                          {inq.budget_range  && <div style={{ fontSize: 12, color: '#64748b' }}><strong>Budget:</strong>  {inq.budget_range}</div>}
                          {inq.timeline      && <div style={{ fontSize: 12, color: '#64748b' }}><strong>Timeline:</strong> {inq.timeline}</div>}
                        </div>
                      )}

                      {/* Message */}
                      <div style={{
                        background: '#f6f8fb', border: '1px solid #e5e7eb',
                        borderRadius: 10, padding: '13px 16px',
                        fontSize: 13.5, color: '#0f172a', lineHeight: 1.65,
                        whiteSpace: 'pre-wrap', marginBottom: 14,
                      }}>
                        {inq.message}
                      </div>

                      {/* From row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 14, flexWrap: 'wrap' }}>
                        <span>From: <a href={`mailto:${inq.email}`} style={{ color: '#6366f1', fontWeight: 500 }}>{inq.email}</a></span>
                        {inq.ip_address && <span>IP: {inq.ip_address}</span>}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <a href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Your message'}`}
                          className="a-btn a-btn--primary a-btn--sm">
                          ↩ Reply via email
                        </a>
                        {status !== 'replied' && (
                          <button className="a-btn a-btn--ghost a-btn--sm"
                            onClick={() => handleStatusChange(inq, 'replied')}>
                            ✓ Mark as Replied
                          </button>
                        )}
                        {status !== 'archived' && (
                          <button className="a-btn a-btn--ghost a-btn--sm"
                            onClick={() => handleStatusChange(inq, 'archived')}>
                            Archive
                          </button>
                        )}
                        {status === 'archived' && (
                          <button className="a-btn a-btn--ghost a-btn--sm"
                            onClick={() => handleStatusChange(inq, 'read')}>
                            Unarchive
                          </button>
                        )}
                        {status !== 'unread' && (
                          <button className="a-btn a-btn--ghost a-btn--sm"
                            onClick={() => handleStatusChange(inq, 'unread')}>
                            Mark Unread
                          </button>
                        )}
                        <button className="a-btn a-btn--danger a-btn--sm"
                          onClick={() => handleDelete(inq)}>
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
