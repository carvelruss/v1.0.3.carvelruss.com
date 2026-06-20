import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsAdmin from './pages/ProjectsAdmin';
import PostsAdmin from './pages/PostsAdmin';
import InboxAdmin from './pages/InboxAdmin';
import PostForm from './components/PostForm';
import './styles/admin.css';

const AdminMediaPage           = lazy(() => import('./pages/AdminMediaPage'));
const AdminSettingsPage        = lazy(() => import('./pages/AdminSettingsPage'));
const AdminCaseStudyFormPage   = lazy(() => import('./pages/AdminCaseStudyFormPage'));
const AdminInquiryDetailPage   = lazy(() => import('./pages/AdminInquiryDetailPage'));

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div className="admin-root" style={{ padding: 32, fontFamily: 'monospace', color: '#fca5a5', minHeight: '100vh' }}>
          <strong>Admin render error:</strong>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: '#ef4444' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AdminSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="admin-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="a-loading">Loading…</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

function G({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

function GS({ children }: { children: ReactNode }) {
  return <AdminGuard><AdminSuspense>{children}</AdminSuspense></AdminGuard>;
}

export default function AdminApp() {
  return (
    <AdminErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="login"               element={<Login />} />
          <Route path=""                    element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard"           element={<G><Dashboard /></G>} />

          {/* Case Studies */}
          <Route path="projects"            element={<G><ProjectsAdmin /></G>} />
          <Route path="projects/new"        element={<GS><AdminCaseStudyFormPage /></GS>} />
          <Route path="projects/:id/edit"   element={<GS><AdminCaseStudyFormPage /></GS>} />

          {/* Blog Posts */}
          <Route path="posts"               element={<G><PostsAdmin /></G>} />
          <Route path="posts/new"           element={<G><PostForm /></G>} />
          <Route path="posts/:slug/edit"    element={<G><PostForm /></G>} />

          {/* Inquiries */}
          <Route path="inbox"               element={<G><InboxAdmin /></G>} />
          <Route path="inbox/:id"           element={<GS><AdminInquiryDetailPage /></GS>} />

          {/* Media */}
          <Route path="media"               element={<GS><AdminMediaPage /></GS>} />

          {/* Settings */}
          <Route path="settings"            element={<GS><AdminSettingsPage /></GS>} />
        </Routes>
      </AuthProvider>
    </AdminErrorBoundary>
  );
}
