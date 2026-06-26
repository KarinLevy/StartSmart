import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import '../Auth/Auth.css';

const ForgotPassword = () => {
  const [email,    setEmail]    = useState('');
  const [status,   setStatus]   = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword } = useAuth();
  const { t } = useLocale();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setErrorMsg(t('forgot.err.emailEmpty') || 'Please enter your email.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const { error } = await resetPassword(email.trim());
    if (error) {
      setStatus('error');
      setErrorMsg(error.message || t('forgot.err.generic'));
    } else {
      setStatus('success');
    }
  };

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-home" aria-label={t('auth.backHome')}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        {t('auth.backHome')}
      </Link>

      <div className="auth-card">
        <Logo to="/" size="lg" className="auth-logo-center" />

        <div className="auth-header">
          <h2 className="auth-title">{t('forgot.title')}</h2>
          <p className="auth-subtitle">{t('forgot.subtitle')}</p>
        </div>

        {status === 'success' ? (
          <>
            <div className="auth-note" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">mark_email_read</span>
              <span>{t('forgot.success')}</span>
            </div>
            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              {t('forgot.backToLogin')}
            </Link>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-email">
                  {t('forgot.email')} <span className="auth-label-required" aria-hidden="true">*</span>
                </label>
                <div className="auth-input-icon-wrap">
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
                  <input
                    className="auth-input"
                    id="reset-email"
                    type="email"
                    placeholder={t('forgot.emailPh')}
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                  />
                </div>
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
                    {t('forgot.sending')}
                  </span>
                ) : t('forgot.submit')}
              </button>
            </form>

            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              {t('forgot.backToLogin')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
