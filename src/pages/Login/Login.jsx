import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import { useLocale } from '../../i18n/LocaleContext';
import '../Auth/Auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 14.017 17.64 11.71 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const { t }      = useLocale();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status,   setStatus]   = useState('idle'); // idle | loading | googleLoading | error
  const [fieldErrors, setFieldErrors] = useState({});

  // Detect OAuth errors redirected back to the login page
  useEffect(() => {
    const hash   = window.location.hash;
    const search = window.location.search;
    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : search);
    const errCode = params.get('error') || params.get('error_code');
    const errDesc = params.get('error_description') || '';
    if (errCode) {
      let msg = t('auth.googleOAuthError');
      if (errCode === 'access_denied' || errDesc.toLowerCase().includes('cancel')) {
        msg = t('auth.googleCancelled');
      } else if (errDesc.toLowerCase().includes('email')) {
        msg = t('auth.googleEmailConflict');
      }
      setFieldErrors({ form: msg });
      setStatus('error');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const from = location.state?.from?.pathname ?? '/dashboard';

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
    if (passwordEmpty) errors.password = t('login.err.passwordEmpty');
    return Object.keys(errors).length ? errors : null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setFieldErrors({});

    const { error } = await signIn({ email: email.trim(), password });

    if (error) {
      const msg = error.message ?? '';
      let field = 'form';
      let text  = t('login.err.invalidCreds');
      if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
        field = 'form'; text = t('login.err.invalidCreds');
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        field = 'email'; text = t('login.err.emailNotConfirmed') || 'Please confirm your email before logging in.';
      } else if (msg.toLowerCase().includes('network')) {
        field = 'form'; text = t('login.err.network');
      }
      setFieldErrors({ [field]: text });
      setStatus('error');
    } else {
      navigate(from, { replace: true });
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

        {/* Google OAuth */}
        <button
          type="button"
          className="auth-google-btn"
          disabled={status === 'loading' || status === 'googleLoading'}
          aria-busy={status === 'googleLoading'}
          onClick={async () => {
            setStatus('googleLoading');
            setFieldErrors({});
            const { error } = await signInWithGoogle();
            if (error) {
              setFieldErrors({ form: t('auth.googleOAuthError') });
              setStatus('error');
            }
            // On success the page redirects; no need to reset status
          }}
        >
          {status === 'googleLoading' ? (
            <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }} aria-hidden="true">progress_activity</span>
          ) : (
            <GoogleIcon />
          )}
          {t('auth.continueWithGoogle')}
        </button>

        <div className="auth-divider" aria-hidden="true">{t('auth.orDivider')}</div>

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
            <span />
            <Link to="/forgot-password" className="auth-inline-link">{t('login.forgotPassword')}</Link>
          </div>

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
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }} aria-hidden="true">progress_activity</span>
                {t('login.submitting')}
              </span>
            ) : t('login.submit')}
          </button>
        </form>

        <p className="auth-foot">
          {t('login.noAccount')} <Link to="/register">{t('login.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
