import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  icon: string;
  label: string;
  path: string;
  badgeCount?: number;
}

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
  headerAction?: ReactNode;
  unreadInquiries?: number;
}

export default function AdminLayout({
  children,
  pageTitle,
  headerAction,
  unreadInquiries = 0,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { icon: '📊', label: 'Dashboard',   path: '/admin/dashboard' },
    { icon: '🗂',  label: 'Case Studies', path: '/admin/projects' },
    { icon: '✏️', label: 'Blog Posts',  path: '/admin/posts' },
    { icon: '📩', label: 'Inbox',       path: '/admin/inbox', badgeCount: unreadInquiries },
    { icon: '🖼',  label: 'Media',       path: '/admin/media' },
    { icon: '⚙️', label: 'Settings',    path: '/admin/settings' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-root">
      <div className="admin-shell">
        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar${sidebarOpen ? ' is-open' : ''}`}>
          <button
            className="admin-sidebar__brand"
            onClick={() => handleNav('/admin/dashboard')}
            style={{ cursor: 'pointer', background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
            aria-label="Go to admin dashboard"
          >
            <div className="admin-sidebar__brand-icon" aria-hidden="true">P</div>
            <div className="admin-sidebar__brand-name">
              devfolio
              <span>Admin Panel</span>
            </div>
          </button>

          <nav className="admin-sidebar__nav" aria-label="Admin navigation">
            <div className="admin-sidebar__section-label">Menu</div>
            {navItems.map(item => (
              <button
                key={item.path}
                className={`admin-sidebar__nav-item${location.pathname.startsWith(item.path) ? ' active' : ''}`}
                onClick={() => handleNav(item.path)}
                aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
              >
                <span className="admin-sidebar__nav-item__icon" aria-hidden="true">{item.icon}</span>
                {item.label}
                {!!item.badgeCount && (
                  <span className="admin-sidebar__nav-item__badge" aria-label={`${item.badgeCount} unread`}>
                    {item.badgeCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__user-avatar" aria-hidden="true">A</div>
              <span className="admin-sidebar__user-name">Admin</span>
            </div>
            <button
              className="admin-sidebar__nav-item"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <span className="admin-sidebar__nav-item__icon" aria-hidden="true">🚪</span>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Overlay (mobile) ── */}
        <div
          className={`admin-overlay${sidebarOpen ? ' is-open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* ── Main ── */}
        <main className="admin-main">
          <div className="admin-topbar">
            <div className="admin-topbar__left">
              <button
                className="admin-topbar__mobile-btn"
                onClick={() => setSidebarOpen(v => !v)}
                aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                aria-expanded={sidebarOpen}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="admin-topbar__title">{pageTitle}</h1>
            </div>
            <div className="admin-topbar__actions">
              {headerAction}
              <a href="/" className="admin-topbar__portal-link" target="_blank" rel="noopener noreferrer">
                ↗ View site
              </a>
            </div>
          </div>

          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
