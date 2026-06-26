import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Auth/Auth.css';

/*
 * TODO (Backend): Implement POST /api/auth/login
 *
 * Request body:
 *   { "email": "user@example.com", "password": "userPassword" }
 *
 * Success response (200):
 *   {
 *     "token": "<jwt_or_session_token>",
 *     "user": { "id": "...", "name": "...", "email": "user@example.com" }
 *   }
 *
 * Error response (401 / 422):
 *   { "message": "Invalid email or password" }
 *
 * The token is stored in localStorage under key "ss_auth_token".
 * The user object is stored under key "ss_auth_user".
 * Both are read on app init (see AuthContext) to restore the session after refresh.
 *
 * Set VITE_API_BASE_URL in .env to point to the backend.
 * Until this endpoint exists every login attempt will fail with a network error.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [remember,    setRemember]    = useState(false);
  const [status,      setStatus]      = useState('idle'); // idle | loading | error
  const [errorMsg,    setErrorMsg]    = useState('');

  /* Redirect to the page the user originally tried to visit, or /dashboard */
  const from = location.state?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        navigate(from, { replace: true });
      } else {
        setStatus('error');
        setErrorMsg(
          data.message ||
          (res.status === 401 || res.status === 422
            ? 'Incorrect email or password.'
            : 'Something went wrong. Please try again.')
        );
      }
    } catch {
      setStatus('error');
      setErrorMsg('Unable to reach the server. Check your connection and try again.');
    }
  };

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-home" aria-label="Back to StartSmart">
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        Back to StartSmart
      </Link>

      <div className="auth-card">
        <Link to="/" className="auth-brand" aria-label="StartSmart home">
          <div className="auth-brand-icon" aria-hidden="true">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="auth-brand-text">StartSmart</h1>
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Log in to pick up where you left off.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input
                className="auth-input"
                id="login-email"
                type="email"
                placeholder="dana@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Password <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
              <input
                className="auth-input"
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'loading'}
              />
              <button
                type="button"
                className="auth-toggle-visibility"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="auth-row-between">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-inline-link">Forgot password?</Link>
          </div>

          {status === 'error' && (
            <p className="auth-field-error" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">error</span>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={status === 'loading'}
            aria-busy={status === 'loading'}
          >
            {status === 'loading' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}
                  aria-hidden="true"
                >progress_activity</span>
                Logging in…
              </span>
            ) : 'Log in'}
          </button>
        </form>

        <p className="auth-foot">
          New to StartSmart? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
