import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Auth/Auth.css';

const Login = () => {
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
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Log in to pick up where you left off.</p>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-username">
              Username or email <span className="auth-label-required">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon">person</span>
              <input className="auth-input" id="login-username" type="text" placeholder="dana_f" required />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Password <span className="auth-label-required">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon">lock</span>
              <input
                className="auth-input"
                id="login-password"
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

          <div className="auth-row-between">
            <label className="auth-checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="auth-inline-link">Forgot password?</Link>
          </div>

          {/* Dummy navigation: in this Frontend stage the button links to the Dashboard */}
          <Link to="/dashboard" className="auth-submit" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
            Log in
          </Link>
        </form>

        <p className="auth-foot">
          New to StartSmart? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
