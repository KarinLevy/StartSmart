import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Auth/Auth.css';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="auth-brand-text">StartSmart</h1>
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Reset your password</h2>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to set a new password.
          </p>
        </div>

        {sent ? (
          <>
            <div className="auth-note">
              <span className="material-symbols-outlined">mark_email_read</span>
              <span>
                If an account exists for that email, a reset link is on its way.
                Check your inbox and spam folder.
              </span>
            </div>
            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to log in
            </Link>
          </>
        ) : (
          <>
            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="auth-field">
                <label className="auth-label" htmlFor="reset-email">
                  Email <span className="auth-label-required">*</span>
                </label>
                <div className="auth-input-icon-wrap">
                  <span className="material-symbols-outlined auth-input-icon">mail</span>
                  <input className="auth-input" id="reset-email" type="email" placeholder="dana@example.com" required />
                </div>
              </div>

              <button type="submit" className="auth-submit">Send reset link</button>
            </form>

            <Link to="/login" className="auth-back-link">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
