import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Auth/Auth.css';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

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
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start building better time habits today.</p>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="first-name">
                First name <span className="auth-label-required">*</span>
              </label>
              <input className="auth-input" id="first-name" type="text" placeholder="Dana" required />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="last-name">
                Last name <span className="auth-label-required">*</span>
              </label>
              <input className="auth-input" id="last-name" type="text" placeholder="Friedman" required />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="username">
              Username <span className="auth-label-required">*</span>
            </label>
            <input className="auth-input" id="username" type="text" placeholder="dana_f" required />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email <span className="auth-label-required">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon">mail</span>
              <input className="auth-input" id="email" type="email" placeholder="dana@example.com" required />
            </div>
          </div>

          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="phone">Phone</label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon">call</span>
                <input className="auth-input" id="phone" type="tel" placeholder="050-000-0000" />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Password <span className="auth-label-required">*</span>
              </label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon">lock</span>
                <input
                  className="auth-input"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label">Profile picture (optional)</label>
            <div className="auth-avatar-row">
              <div className="auth-avatar-preview">
                <span className="material-symbols-outlined">person</span>
              </div>
              <button type="button" className="auth-avatar-btn">Upload avatar</button>
            </div>
          </div>

          <button type="submit" className="auth-submit">Create account</button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
