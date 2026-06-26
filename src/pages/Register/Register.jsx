import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import { useLocale } from '../../i18n/LocaleContext';
import '../Auth/Auth.css';

/*
 * TODO (Backend): Implement POST /api/auth/register
 *
 * Request body:
 *   { "firstName", "lastName", "username", "email", "password", "phone" (optional) }
 *
 * Success response (201):
 *   {
 *     "token": "<jwt_or_session_token>",
 *     "user": { "id": "...", "name": "...", "email": "..." }
 *   }
 *
 * Error responses:
 *   409: { "message": "An account with this email already exists." }
 *   409: { "message": "This username is already taken." }
 *   422: { "message": "Validation error description" }
 *
 * Set VITE_API_BASE_URL in .env to point to the backend.
 * Until this endpoint exists every registration attempt will fail with a network error.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

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
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const PHONE_RE = /^[\d\s\-+().]{7,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const fileRef   = useRef(null);
  const { t } = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [password,  setPassword]  = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [uploadState, setUploadState] = useState('idle');

  const [errors,   setErrors]   = useState({});
  const [touched,  setTouched]  = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  /* Derived initials / avatar */
  const initials = getInitials(firstName, lastName);
  const [bg, text] = colorFromStr(firstName + lastName || 'user');
  const hasName = firstName.trim() || lastName.trim();

  /* ── Validation ── */
  function validate(fields = {}) {
    const f = {
      firstName, lastName, username, email, phone, password,
      ...fields,
    };
    const e = {};
    if (!f.firstName.trim())  e.firstName = t('register.err.firstNameReq');
    if (!f.lastName.trim())   e.lastName  = t('register.err.lastNameReq');
    if (!f.username.trim())   e.username  = t('register.err.usernameReq');
    if (!f.email.trim())      e.email     = t('register.err.emailReq');
    else if (!EMAIL_RE.test(f.email)) e.email = t('register.err.invalidEmail');
    if (!f.password)          e.password  = t('register.err.passwordReq');
    else if (f.password.length < 8) e.password = t('register.err.passwordMin');
    if (f.phone && !PHONE_RE.test(f.phone)) e.phone = t('register.err.invalidPhone');
    return e;
  }

  function handleBlur(field, value) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((prev) => ({ ...prev, ...validate({ [field]: value }) }));
    if (!validate({ [field]: value })[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadState('error'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUploadState('error'); return; }
    setUploadState('uploading');
    const reader = new FileReader();
    reader.onload  = (ev) => { setAvatarSrc(ev.target.result); setUploadState('idle'); };
    reader.onerror = ()  => setUploadState('error');
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatarSrc(null);
    setUploadState('idle');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { firstName: true, lastName: true, username: true, email: true, phone: true, password: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError('');

    try {
      const res  = await fetch(`${API_BASE}/api/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName, lastName, username, email, password, phone }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(
          data.message ||
          (res.status === 409 ? t('register.err.emailExists') : t('common.error'))
        );
        setSubmitting(false);
      }
    } catch {
      setServerError(t('register.err.network'));
      setSubmitting(false);
    }
  };

  const FieldError = ({ field }) =>
    touched[field] && errors[field]
      ? <p className="auth-field-error" role="alert"><span className="material-symbols-outlined" style={{ fontSize: '15px' }}>error</span>{errors[field]}</p>
      : null;

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-back-home" aria-label={t('auth.backHome')}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        {t('auth.backHome')}
      </Link>
      <div className="auth-card">
        <Logo to="/" size="lg" className="auth-logo-center" />

        <div className="auth-header">
          <h2 className="auth-title">{t('register.title')}</h2>
          <p className="auth-subtitle">{t('register.subtitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Name row */}
          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="first-name">
                {t('register.firstName')} <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <input
                className={`auth-input${touched.firstName && errors.firstName ? ' input-error' : ''}`}
                id="first-name"
                type="text"
                placeholder="Dana"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={(e) => handleBlur('firstName', e.target.value)}
                aria-describedby={errors.firstName ? 'err-firstName' : undefined}
                aria-invalid={!!(touched.firstName && errors.firstName)}
              />
              <FieldError field="firstName" />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="last-name">
                {t('register.lastName')} <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <input
                className={`auth-input${touched.lastName && errors.lastName ? ' input-error' : ''}`}
                id="last-name"
                type="text"
                placeholder="Friedman"
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={(e) => handleBlur('lastName', e.target.value)}
                aria-invalid={!!(touched.lastName && errors.lastName)}
              />
              <FieldError field="lastName" />
            </div>
          </div>

          {/* Username */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="username">
              {t('register.username')} <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <input
              className={`auth-input${touched.username && errors.username ? ' input-error' : ''}`}
              id="username"
              type="text"
              placeholder="dana_f"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => handleBlur('username', e.target.value)}
              aria-invalid={!!(touched.username && errors.username)}
            />
            <FieldError field="username" />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              {t('register.email')} <span className="auth-label-required" aria-hidden="true">*</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input
                className={`auth-input${touched.email && errors.email ? ' input-error' : ''}`}
                id="reg-email"
                type="email"
                placeholder="dana@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                aria-invalid={!!(touched.email && errors.email)}
              />
            </div>
            <FieldError field="email" />
          </div>

          {/* Phone + Password */}
          <div className="auth-grid-2">
            <div className="auth-field">
              <label className="auth-label" htmlFor="phone">{t('register.phone')}</label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">call</span>
                <input
                  className={`auth-input${touched.phone && errors.phone ? ' input-error' : ''}`}
                  id="phone"
                  type="tel"
                  placeholder={t('register.phonePh')}
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  aria-invalid={!!(touched.phone && errors.phone)}
                />
              </div>
              <FieldError field="phone" />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="reg-password">
                {t('register.password')} <span className="auth-label-required" aria-hidden="true">*</span>
              </label>
              <div className="auth-input-icon-wrap">
                <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">lock</span>
                <input
                  className={`auth-input${touched.password && errors.password ? ' input-error' : ''}`}
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  aria-invalid={!!(touched.password && errors.password)}
                  aria-describedby="password-hint"
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
              {!errors.password && <p id="password-hint" className="auth-avatar-hint">{t('register.passwordHint')}</p>}
              <FieldError field="password" />
            </div>
          </div>

          {/* Avatar upload */}
          <div className="auth-field">
            <label className="auth-label" id="avatar-label">{t('register.avatarLabel')}</label>
            <div className="auth-avatar-row" aria-labelledby="avatar-label">
              {/* Preview */}
              <div
                className="auth-avatar-preview"
                style={avatarSrc ? {} : hasName ? { background: `linear-gradient(135deg, ${bg}, ${text})` } : {}}
                aria-label={avatarSrc ? 'Uploaded avatar preview' : hasName ? `Initials avatar: ${initials}` : 'No avatar selected'}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : hasName ? (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', userSelect: 'none' }}>{initials}</span>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: 'var(--color-outline)' }} aria-hidden="true">person</span>
                )}
              </div>

              <div className="auth-avatar-actions">
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
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px', animation: 'spin 1s linear infinite' }}>progress_activity</span> {t('register.uploading')}</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span> {t('register.uploadPhoto')}</>
                  )}
                </label>
                {avatarSrc && (
                  <button type="button" className="auth-avatar-remove" onClick={removeAvatar} aria-label={t('register.removePhoto')}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    {t('common.clear')}
                  </button>
                )}
              </div>
            </div>
            {uploadState === 'error' && (
              <p className="auth-field-error" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                {t('register.imageError')}
              </p>
            )}
            {!avatarSrc && hasName && (
              <p className="auth-avatar-hint">{t('register.noPhotoHint')}</p>
            )}
          </div>

          {serverError && (
            <p className="auth-field-error" role="alert">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">error</span>
              {serverError}
            </p>
          )}

          <button type="submit" className="auth-submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }} aria-hidden="true">progress_activity</span>
                {t('register.submitting')}
              </span>
            ) : t('register.submit')}
          </button>
        </form>

        <p className="auth-foot">
          {t('register.haveAccount')} <Link to="/login">{t('register.logIn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
