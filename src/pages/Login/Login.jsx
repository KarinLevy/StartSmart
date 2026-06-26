import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import { useLocale } from '../../i18n/LocaleContext';
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
 * Error responses — include a stable `code` field so the frontend can map
 * errors without parsing human-readable message strings:
 *
 *   404: { "code": "EMAIL_NOT_FOUND",     "message": "No account found with this email." }
 *   401: { "code": "INVALID_PASSWORD",    "message": "Incorrect password." }
 *   401: { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." }
 *
 * The token is stored in localStorage under key "ss_auth_token".
 * The user object is stored under key "ss_auth_user".
 * Both are read on app init (see AuthContext) to restore the session after refresh.
 *
 * Set VITE_API_BASE_URL in .env to point to the backend.
 * Until this endpoint exists every login attempt will fail with a network error.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * Map a backend error response to { field, text }.
 * Priority: stable `code` field → HTTP status → message text (last resort).
 */
function mapBackendError(status, code = '', message = '') {
  // 1. Stable machine-readable code (preferred)
  if (code === 'EMAIL_NOT_FOUND')
    return { field: 'email',    text: 'No account was found with this email.' };
  if (code === 'INVALID_PASSWORD')
    return { field: 'password', text: 'Incorrect password. Please try again.' };
  if (code === 'INVALID_CREDENTIALS')
    return { field: 'form',     text: 'Invalid email or password.' };

  // 2. HTTP status fallback (when backend sends no code)
  if (status === 404)
    return { field: 'email',    text: 'No account was found with this email.' };

  // 3. Message text — last resort, tolerant substring check
  const m = message.toLowerCase();
  if (m.includes('not found') || m.includes('no account'))
    return { field: 'email',    text: 'No account was found with this email.' };
  if (m.includes('incorrect password') || m.includes('wrong password'))
    return { field: 'password', text: 'Incorrect password. Please try again.' };

  return { field: 'form', text: 'Invalid email or password.' };
}

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const { t } = useLocale();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status,   setStatus]   = useState('idle'); // idle | loading | error

  /* Per-field errors: { email?: string, password?: string, form?: string } */
  const [fieldErrors, setFieldErrors] = useState({});

  const from = location.state?.from?.pathname ?? '/dashboard';

  /* Clear a specific field error as the user edits it */
  const clearError = (field) => {
    if (fieldErrors[field] || fieldErrors.form) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.form;
        return next;
      });
    }
    if (status === 'error') setStatus('idle');
  };

  /* Frontend validation — returns an error object or null */
  function validate() {
    const emailEmpty    = !email.trim();
    const passwordEmpty = !password;
    const errors        = {};

    if (emailEmpty && passwordEmpty) {
      errors.form = t('login.err.bothEmpty');
      return errors;
    }
    if (emailEmpty) {
      errors.email = t('login.err.emailEmpty');
    } else if (!EMAIL_RE.test(email.trim())) {
      errors.email = t('login.err.invalidEmail');
    }
    if (passwordEmpty) {
      errors.password = t('login.err.passwordEmpty');
    }
    return Object.keys(errors).length ? errors : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Run frontend validation first — never touch the backend if it fails */
    const validationErrors = validate();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setFieldErrors({});

    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        navigate(from, { replace: true });
      } else {
        const { field, text } = mapBackendError(res.status, data.code, data.message);
        setFieldErrors({ [field]: text });
        setStatus('error');
      }
    } catch {
      setFieldErrors({ form: t('login.err.network') });
      setStatus('error');
    }
  };

  const emailHasError    = !!(fieldErrors.email);
  const passwordHasError = !!(fieldErrors.password);

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-home" aria-label={t('auth.backHome')}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        {t('auth.backHome')}
      </Link>

      <div className="auth-card">
        <Logo to="/" size="lg" className="auth-logo-center" />

        <div className="auth-header">
          <h2 className="auth-title">{t('login.title')}</h2>
          <p className="auth-subtitle">{t('login.subtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              {t('login.email')} <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input
                className={`auth-input${emailHasError ? ' input-error' : ''}`}
                id="login-email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                disabled={status === 'loading'}
                aria-invalid={emailHasError}
                aria-describedby={emailHasError ? 'err-email' : undefined}
              />
            </div>
            {emailHasError && (
              <p id="err-email" className="auth-field-error" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">error</span>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              {t('login.password')} <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
              <input
                className={`auth-input${passwordHasError ? ' input-error' : ''}`}
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                disabled={status === 'loading'}
                aria-invalid={passwordHasError}
                aria-describedby={passwordHasError ? 'err-password' : undefined}
              />
              <button
                type="button"
                className="auth-toggle-visibility"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordHasError && (
              <p id="err-password" className="auth-field-error" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">error</span>
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div className="auth-row-between">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>{t('login.rememberMe')}</span>
            </label>
            <Link to="/forgot-password" className="auth-inline-link">{t('login.forgotPassword')}</Link>
          </div>

          {/* Form-level error (both-empty, backend generic, network) */}
          {fieldErrors.form && (
            <p className="auth-field-error" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">error</span>
              {fieldErrors.form}
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
                {t('login.submitting')}
              </span>
            ) : t('login.submit')}
          </button>

          {/* ── DEV BYPASS ─────────────────────────────────────────────────────
               Visible ONLY in Vite development mode (import.meta.env.DEV).
               Dead-code eliminated by the bundler in production builds.
               TO REMOVE: delete this entire block when the backend is ready.
          ──────────────────────────────────────────────────────────────────── */}
          {import.meta.env.DEV && (
            <>
              <div className="auth-divider" aria-hidden="true">dev only</div>
              <button
                type="button"
                className="auth-dev-bypass"
                onClick={() => {
                  login('dev-token', {
                    id:    'dev-user',
                    name:  'Dev User',
                    email: 'dev@localhost',
                  });
                  navigate(from, { replace: true });
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                  code
                </span>
                {t('login.devMode')}
              </button>
            </>
          )}
          {/* ── END DEV BYPASS ─────────────────────────────────────────────── */}
        </form>

        <p className="auth-foot">
          {t('login.noAccount')} <Link to="/register">{t('login.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
