import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid, FiLayers, FiEdit2, FiMail, FiImage, FiSettings,
  FiExternalLink, FiLogOut, FiBarChart2, FiZap,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

type IconComponent = React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

interface NavItem {
  icon: IconComponent;
  label: string;
  path: string;
  badgeCount?: number;
}

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
  pageSubtitle?: string;
  headerAction?: ReactNode;
  backTo?: string;
  hideViewSite?: boolean;
  unreadInquiries?: number;
}

export default function AdminLayout({
  children,
  pageTitle,
  pageSubtitle,
  headerAction,
  backTo,
  hideViewSite = false,
  unreadInquiries = 0,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { icon: FiGrid,     label: 'Dashboard',    path: '/admin/dashboard' },
    { icon: FiLayers,   label: 'Case Studies', path: '/admin/projects'  },
    { icon: FiZap,      label: 'Services',     path: '/admin/services'  },
    { icon: FiEdit2,    label: 'Blogs',        path: '/admin/posts'     },
    { icon: FiMail,      label: 'Inquiries',  path: '/admin/inbox',     badgeCount: unreadInquiries },
    { icon: FiBarChart2, label: 'Analytics',  path: '/admin/analytics'  },
    { icon: FiImage,     label: 'Media',      path: '/admin/media'      },
    { icon: FiSettings,  label: 'Settings',   path: '/admin/settings'   },
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

          {/* Brand / logo */}
          <button
            className="admin-sidebar__brand"
            onClick={() => handleNav('/admin/dashboard')}
            aria-label="Go to admin dashboard"
          >
            <img
              src="/logos/carvelruss-logo.png"
              alt="Carvel Russ"
              className="admin-sidebar__brand-logo"
            />
            <span className="admin-sidebar__brand-admin">Admin</span>
          </button>

          {/* Nav */}
          <nav className="admin-sidebar__nav" aria-label="Admin navigation">
            <div className="admin-sidebar__section-label">Menu</div>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  className={`admin-sidebar__nav-item${location.pathname.startsWith(item.path) ? ' active' : ''}`}
                  onClick={() => handleNav(item.path)}
                  aria-current={location.pathname.startsWith(item.path) ? 'page' : undefined}
                >
                  <span className="admin-sidebar__nav-item__icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  {item.label}
                  {!!item.badgeCount && (
                    <span className="admin-sidebar__nav-item__badge" aria-label={`${item.badgeCount} unread`}>
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="admin-sidebar__footer">
            <button
              className="admin-sidebar__nav-item"
              onClick={() => window.open('/', '_blank')}
              aria-label="View site in new tab"
            >
              <span className="admin-sidebar__nav-item__icon" aria-hidden="true">
                <FiExternalLink size={15} />
              </span>
              View Site
            </button>

            <div className="admin-sidebar__user">
              <div className="admin-sidebar__user-avatar" aria-hidden="true">CR</div>
              <span className="admin-sidebar__user-name">Carvel Russ</span>
            </div>

            <button
              className="admin-sidebar__nav-item admin-sidebar__nav-item--logout"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <span className="admin-sidebar__nav-item__icon" aria-hidden="true">
                <FiLogOut size={15} />
              </span>
              Sign out
            </button>
          </div>

        </aside>

        {/* ── Mobile overlay ── */}
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
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              {backTo && (
                <a href={backTo} className="admin-topbar__back" aria-label="Go back">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </a>
              )}
              <div className="admin-topbar__title-wrap">
                <h1 className="admin-topbar__title">{pageTitle}</h1>
                {pageSubtitle && <p className="admin-topbar__subtitle">{pageSubtitle}</p>}
              </div>
            </div>
            <div className="admin-topbar__actions">
              {headerAction}
              {!hideViewSite && (
                <a
                  href="/"
                  className="admin-topbar__portal-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink size={13} aria-hidden /> View site
                </a>
              )}
            </div>
          </div>

          <div className="admin-content">{children}</div>
        </main>

      </div>
    </div>
  );
}
