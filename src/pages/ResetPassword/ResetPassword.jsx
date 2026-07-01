import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { supabase } from '../../lib/supabaseClient';
import { useLocale } from '../../i18n/LocaleContext';
import '../Auth/Auth.css';

const ResetPassword = () => {
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [status,    setStatus]    = useState('idle'); // idle | loading | success | error
  const [errorMsg,  setErrorMsg]  = useState('');
  const [ready,      setReady]      = useState(false);  // true once Supabase sets the recovery session
  const [linkStatus, setLinkStatus] = useState('pending'); // pending | valid | expired
  const { t } = useLocale();
  const navigate = useNavigate();

  // Supabase sends a PASSWORD_RECOVERY event when the magic link is followed.
  // This sets a temporary session that allows updateUser() to work.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setLinkStatus('valid');
      }
    });

    // Check for an existing recovery session (e.g. page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
        setLinkStatus('valid');
      }
    });

    // If no PASSWORD_RECOVERY event fires within 8s, treat link as expired/invalid
    const timer = setTimeout(() => {
      setLinkStatus((prev) => (prev === 'pending' ? 'expired' : prev));
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg(t('resetPw.errMin'));
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setErrorMsg(t('resetPw.errNoMatch'));
      setStatus('error');
      return;
    }

    setStatus('loading');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message || t('resetPw.errGeneric'));
    } else {
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
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
          <h2 className="auth-title">{t('resetPw.title')}</h2>
          <p className="auth-subtitle">{t('resetPw.subtitle')}</p>
        </div>

        {status === 'success' ? (
          <>
            <div className="auth-note" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
              <span>{t('resetPw.success')}</span>
            </div>
            <p style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-label-sm)', marginTop: '0.5rem' }}>
              {t('resetPw.redirecting')}
            </p>
            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              {t('forgot.backToLogin')}
            </Link>
          </>
        ) : linkStatus === 'expired' ? (
          <>
            <div className="auth-note" role="alert" style={{ background: 'var(--color-error-container)', color: 'var(--color-error)' }}>
              <span className="material-symbols-outlined" aria-hidden="true">link_off</span>
              <span>{t('resetPw.errExpired')}</span>
            </div>
            <Link to="/forgot-password" className="auth-back-link" style={{ marginTop: 'var(--spacing-card-gap)', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
              {t('resetPw.requestNew')}
            </Link>
          </>
        ) : !ready ? (
          <div className="auth-note" role="status" style={{ flexDirection: 'column', gap: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
            <span>{t('resetPw.waiting')}</span>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="rp-password">
                  {t('resetPw.newPw')} <span className="auth-label-required" aria-hidden="true">*</span>
                </label>
                <div className="auth-input-icon-wrap">
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
                  <input
                    className="auth-input"
                    id="rp-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('resetPw.newPwPh')}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={status === 'loading'}
                  />
                  <button
                    type="button"
                    className="auth-toggle-visibility"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? t('resetPw.hidePw') : t('resetPw.showPw')}
                  >
                    <span className="material-symbols-outlined">{showPw ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p className="auth-field-hint">{t('resetPw.hint')}</p>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="rp-confirm">
                  {t('resetPw.confirm')} <span className="auth-label-required" aria-hidden="true">*</span>
                </label>
                <div className="auth-input-icon-wrap">
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
                  <input
                    className="auth-input"
                    id="rp-confirm"
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('resetPw.confirmPh')}
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
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
                    {t('resetPw.updating')}
                  </span>
                ) : t('resetPw.submit')}
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

export default ResetPassword;
