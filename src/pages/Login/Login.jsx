import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Auth/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
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
            <label className="auth-label" htmlFor="login-username">
              Username or email <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">person</span>
              <input
                className="auth-input"
                id="login-username"
                type="text"
                placeholder="dana_f"
                required
                autoComplete="username"
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
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle-visibility"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="auth-row-between">
            <label className="auth-checkbox-label">
              <input type="checkbox" aria-label="Remember me" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-inline-link">Forgot password?</Link>
          </div>

          <button type="submit" className="auth-submit">
            Log in
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
