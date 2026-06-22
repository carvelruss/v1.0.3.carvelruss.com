import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError('');
    setLoading(true);
    try {
      await login(password);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setError('Invalid password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-root">

      {/* ── Left: branding panel ── */}
      <div className="al-photo" aria-hidden="true">
        <div className="al-photo__overlay" />
        <div className="al-photo__brand">
          <img
            src="/logos/white-logo.png"
            alt="Carvel Russ"
            className="al-photo__brand-logo"
          />
          <p className="al-photo__brand-tagline">Portfolio Admin Panel</p>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="al-panel">
        <div className="al-panel__inner">

          <h1 className="al-panel__title">Welcome back</h1>
          <p className="al-panel__sub">Sign in to your admin dashboard</p>

          {error && (
            <div className="al-error" role="alert">{error}</div>
          )}

          <form className="al-form" onSubmit={handleSubmit}>
            <div className="al-field">
              <label className="al-field__label" htmlFor="admin-password">Password</label>
              <div className="al-field__input-wrap">
                <input
                  id="admin-password"
                  className="al-field__input al-field__input--padded"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="al-field__toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="al-submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="al-footer-links">
            <span>Secured with JWT</span>
            <span aria-hidden="true">·</span>
            <span>24-hour session</span>
          </div>

        </div>
      </div>

    </div>
  );
}
