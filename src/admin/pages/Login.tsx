import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
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
      {/* Left: photo panel */}
      <div className="al-photo" aria-hidden="true">
        {/* Replace with your own image: add /admin-bg.jpg to public/ and uncomment below */}
        {/* <img src="/admin-bg.jpg" alt="" className="al-photo__img" /> */}
        <div className="al-photo__overlay" />
        <div className="al-photo__brand">
          <span className="al-photo__brand-name">devfolio</span>
          <span className="al-photo__brand-dot">.</span>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="al-panel">
        <div className="al-panel__inner">
          <div className="al-panel__logo">
            dev<span>folio</span><span className="al-panel__logo-dot">.</span>
          </div>

          <h1 className="al-panel__title">Welcome back</h1>
          <p className="al-panel__sub">Sign in to your admin dashboard</p>

          {error && (
            <div className="al-error" role="alert">{error}</div>
          )}

          <form className="al-form" onSubmit={handleSubmit}>
            <div className="al-field">
              <label className="al-field__label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="al-field__input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
                required
              />
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
            <span>·</span>
            <span>24-hour session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
