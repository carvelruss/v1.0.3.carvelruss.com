import { Component, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsAdmin from './pages/ProjectsAdmin';
import PostsAdmin from './pages/PostsAdmin';
import InboxAdmin from './pages/InboxAdmin';
import PostForm from './components/PostForm';
import './styles/admin.scss';

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', color: '#c00', background: '#fff1f0', minHeight: '100vh' }}>
          <strong>Admin render error:</strong>
          <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
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

export default function AdminApp() {
  return (
    <AdminErrorBoundary>
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />

        <Route element={<AdminGuard><Dashboard /></AdminGuard>} path="dashboard" />
        <Route element={<AdminGuard><ProjectsAdmin /></AdminGuard>} path="projects" />
        <Route element={<AdminGuard><PostsAdmin /></AdminGuard>} path="posts" />
        <Route element={<AdminGuard><PostForm /></AdminGuard>} path="posts/new" />
        <Route element={<AdminGuard><PostForm /></AdminGuard>} path="posts/:slug/edit" />
        <Route element={<AdminGuard><InboxAdmin /></AdminGuard>} path="inbox" />
      </Routes>
    </AuthProvider>
    </AdminErrorBoundary>
  );
}
