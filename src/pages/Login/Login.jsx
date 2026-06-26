import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import { useLocale } from '../../i18n/LocaleContext';
import '../Auth/Auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { signIn } = useAuth();
  const { t }      = useLocale();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [status,   setStatus]   = useState('idle'); // idle | loading | error
  const [fieldErrors, setFieldErrors] = useState({});

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
