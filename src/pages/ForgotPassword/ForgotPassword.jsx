import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import '../Auth/Auth.css';

/*
 * TODO (Backend): Implement POST /api/auth/forgot-password
 *
 * Request body:  { "email": "user@example.com" }
 * Success (200): { "message": "Password reset email sent" }
 * Error   (404): { "message": "No account found with this email" }
 * Error   (5xx): generic — show fallback error message
 *
 * The endpoint should:
 *   1. Look up the user by email
 *   2. Generate a signed, time-limited reset token
 *   3. Store the token hash against the user record
 *   4. Send a reset email containing a link like:
 *      https://app.startsmart.io/reset-password?token=<token>
 *   5. Return 200 only after the email has been dispatched
 *   6. Return 404 (or 200 to prevent email enumeration) when email not found
 *
 * Set VITE_API_BASE_URL in .env to point to the backend.
 * Until this endpoint exists the button will always show a connection error.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const ForgotPassword = () => {
  const [email,    setEmail]    = useState('');
  const [status,   setStatus]   = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res  = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(
          data.message ||
          (res.status === 404
            ? 'No account found with this email address.'
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
        <Logo to="/" size="lg" className="auth-logo-center" />

        <div className="auth-header">
          <h2 className="auth-title">Reset your password</h2>
          <p className="auth-subtitle">
            Enter the email linked to your account and we'll send you a reset link.
          </p>
        </div>

        {status === 'success' ? (
          <>
            <div className="auth-note" role="status">
              <span className="material-symbols-outlined" aria-hidden="true">mark_email_read</span>
              <span>
                Reset link sent! Check your inbox (and spam folder) for an email from StartSmart.
                The link expires in 30 minutes.
              </span>
            </div>
            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-email">
                  Email <span className="auth-label-required" aria-hidden="true">*</span>
                </label>
                <div className="auth-input-icon-wrap">
                  <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
                  <input
                    className="auth-input"
                    id="reset-email"
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
                    Sending…
                  </span>
                ) : 'Send reset link'}
              </button>
            </form>

            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Back to log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
