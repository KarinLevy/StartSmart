import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Auth/Auth.css';

/* Generate a consistent colour from a string */
const AVATAR_COLORS = [
  ['#1e3a8a', '#3b82f6'], ['#5426b6', '#a78bfa'], ['#065f46', '#34d399'],
  ['#92400e', '#fbbf24'], ['#9d174d', '#f472b6'], ['#0f4c75', '#38bdf8'],
];
function colorFromStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function getInitials(first, last) {
  return ((first[0] || '') + (last[0] || '')).toUpperCase() || '?';
}

const Register = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null); // data-URL or null
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | error

  /* Derived initials avatar */
  const initials = getInitials(firstName, lastName);
  const [bg, text] = colorFromStr(firstName + lastName || 'user');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type + size
    if (!file.type.startsWith('image/')) {
      setUploadState('error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadState('error');
      return;
    }

    setUploadState('uploading');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      setUploadState('idle');
    };
    reader.onerror = () => setUploadState('error');
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarSrc(null);
    setUploadState('idle');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="auth-brand" aria-label="StartSmart home">
          <div className="auth-brand-icon" aria-hidden="true">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="auth-brand-text">StartSmart</h1>
        </Link>

        <div className="auth-header">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Start building better time habits today.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          noValidate
        >
          {/* Name row */}
          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="first-name">
                First name <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <input
                className="auth-input"
                id="first-name"
                type="text"
                placeholder="Dana"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="last-name">
                Last name <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <input
                className="auth-input"
                id="last-name"
                type="text"
                placeholder="Friedman"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Username */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">
              Username <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <input className="auth-input" id="username" type="text" placeholder="dana_f" required autoComplete="username" />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input className="auth-input" id="reg-email" type="email" placeholder="dana@example.com" required autoComplete="email" />
            </div>
          </div>

          {/* Phone + Password */}
          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="phone">Phone</label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">call</span>
                <input className="auth-input" id="phone" type="tel" placeholder="050-000-0000" autoComplete="tel" />
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">
                Password <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
                <input
                  className="auth-input"
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={8}
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
          </div>

          {/* Avatar upload */}
          <div className="auth-field">
            <label className="auth-label" id="avatar-label">Profile picture (optional)</label>
            <div className="auth-avatar-row" aria-labelledby="avatar-label">
              {/* Preview — uploaded image or initials */}
              <div
                className="auth-avatar-preview"
                style={avatarSrc ? {} : { background: `linear-gradient(135deg, ${bg}, ${text})` }}
                aria-label={avatarSrc ? 'Uploaded avatar preview' : `Initials avatar: ${initials}`}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', userSelect: 'none' }}>{initials}</span>
                )}
              </div>

              <div className="auth-avatar-actions">
                {/* Hidden file input */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  id="avatar-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  aria-label="Upload profile picture"
                />
                <label htmlFor="avatar-upload" className="auth-avatar-btn" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
                  {uploadState === 'uploading' ? (
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>progress_activity</span> Uploading…</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span> Upload photo</>
                  )}
                </label>
                {avatarSrc && (
                  <button type="button" className="auth-avatar-remove" onClick={removeAvatar} aria-label="Remove uploaded photo">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    Remove
                  </button>
                )}
              </div>
            </div>
            {uploadState === 'error' && (
              <p className="auth-field-error" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                Please upload a valid image file under 5 MB.
              </p>
            )}
            {!avatarSrc && (firstName || lastName) && (
              <p className="auth-avatar-hint">
                No photo? We'll use your initials automatically.
              </p>
            )}
          </div>

          <button type="submit" className="auth-submit">
            Create account
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
