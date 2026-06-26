import React, { useState, useRef, useEffect, useCallback } from 'react';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import { useProfile } from '../../context/ProfileContext';
import Avatar from '../../components/Avatar/Avatar';
import './Profile.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const validatePhone = (ph) => {
  if (!ph) return null; // optional
  const digits = ph.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number (7–15 digits).';
  return null;
};

const STATS_CONFIG = [
  { icon: 'check_circle',    label: 'Tasks done',  key: 'done' },
  { icon: 'pending_actions', label: 'In progress', key: 'in_progress' },
  { icon: 'schedule',        label: 'Focus time',  key: 'focus' },
  { icon: 'query_stats',     label: 'Avg. gap',    key: 'gap' },
];

// ── Change Password Modal ─────────────────────────────────────────────────────

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: null, form: null }));
    setSuccess(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.current)          errs.current = 'Current password is required.';
    if (form.next.length < 8)   errs.next    = 'New password must be at least 8 characters.';
    if (form.next !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // Backend integration point: POST /api/auth/change-password { currentPassword, newPassword }
    // For now, simulate success
    setSuccess(true);
    setForm({ current: '', next: '', confirm: '' });
    setTimeout(onClose, 1500);
  };

  return (
    <div
      className="pr-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Change password"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="pr-modal-card">
        <button className="pr-modal-close" onClick={onClose} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="pr-modal-header">
          <div className="pr-modal-icon-wrap" aria-hidden="true">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <div>
            <h2 className="pr-modal-title">Change Password</h2>
            <p className="pr-modal-subtitle">Choose a new secure password for your account.</p>
          </div>
        </div>

        {success ? (
          <div className="pr-modal-success">
            <span className="material-symbols-outlined">check_circle</span>
            Password changed successfully!
          </div>
        ) : (
          <form className="pr-modal-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-current">Current Password</label>
              <input
                id="pw-current"
                type="password"
                className={`auth-input${errors.current ? ' input-error' : ''}`}
                value={form.current}
                onChange={set('current')}
                autoComplete="current-password"
                placeholder="Enter your current password"
              />
              {errors.current && <p className="pr-field-error">{errors.current}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-next">New Password</label>
              <input
                id="pw-next"
                type="password"
                className={`auth-input${errors.next ? ' input-error' : ''}`}
                value={form.next}
                onChange={set('next')}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
              {errors.next && <p className="pr-field-error">{errors.next}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-confirm">Confirm New Password</label>
              <input
                id="pw-confirm"
                type="password"
                className={`auth-input${errors.confirm ? ' input-error' : ''}`}
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
              {errors.confirm && <p className="pr-field-error">{errors.confirm}</p>}
            </div>

            <div className="pr-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Profile page ──────────────────────────────────────────────────────────────

const Profile = () => {
  const { tasks } = useTasks();
  const { profile, setProfile, avatarSrc, setAvatarSrc } = useProfile();

  // Local form mirrors context; edits don't propagate until Save
  const [form, setFormState]   = useState({ ...profile });
  const [phoneError, setPhoneError] = useState(null);
  const [saved, setSaved]           = useState(false);
  const [uploadState, setUpload]    = useState('idle'); // idle | uploading | error
  const [showPwModal, setShowPwModal] = useState(false);

  const fileRef = useRef(null);

  // Keep local form in sync if profile changes elsewhere
  useEffect(() => { setFormState({ ...profile }); }, [profile]);

  const setField = (k) => (e) => {
    setFormState((p) => ({ ...p, [k]: e.target.value }));
    setSaved(false);
    if (k === 'phone') setPhoneError(null);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUpload('error'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUpload('error'); return; }
    setUpload('uploading');
    const reader = new FileReader();
    reader.onload  = (ev) => { setAvatarSrc(ev.target.result); setUpload('idle'); };
    reader.onerror = () => setUpload('error');
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) { setPhoneError(phoneErr); return; }
    // Backend integration point: PATCH /api/profile { ...form }
    setProfile(form);
    setSaved(true);
  };

  const handleReset = () => {
    setFormState({ ...profile });
    setPhoneError(null);
    setSaved(false);
  };

  // Stats
  const done       = tasks.filter((t) => t.status === 'done');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const focusMin   = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap     = done.length > 0
    ? Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length)
    : null;

  const statValues = {
    done:        String(done.length),
    in_progress: String(inProgress.length),
    focus:       fmtMin(focusMin),
    gap:         avgGap !== null ? (avgGap > 0 ? `+${avgGap}m` : `${avgGap}m`) : '—',
  };

  const closePwModal = useCallback(() => setShowPwModal(false), []);

  return (
    <PageShell narrow title="Profile" subtitle="Manage your personal details and account info.">

      {/* ── Banner: avatar + stats ── */}
      <div className="pr-banner surface-card">
        <div className="pr-banner-left">
          <div className="pr-avatar-wrap">
            <Avatar size="xl" className="pr-banner-avatar" />
            <label
              htmlFor="pr-photo-input"
              className="pr-avatar-overlay"
              aria-label="Change profile photo"
            >
              <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>
              <span className="pr-overlay-text">Change</span>
            </label>
            <input
              id="pr-photo-input"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="pr-file-input"
              onChange={handleFile}
            />
          </div>
          <div className="pr-banner-info">
            <h2 className="pr-full-name">{profile.firstName} {profile.lastName}</h2>
            <span className="pr-username">@{profile.username}</span>
            {uploadState === 'uploading' && <span className="pr-upload-status">Uploading…</span>}
            {uploadState === 'error'     && <span className="pr-upload-status error">Invalid file — use an image under 5 MB.</span>}
          </div>
        </div>

        <div className="pr-stats-row">
          {STATS_CONFIG.map((s) => (
            <div key={s.key} className="pr-stat">
              <span className="material-symbols-outlined pr-stat-icon" aria-hidden="true">{s.icon}</span>
              <span className="pr-stat-val">{statValues[s.key]}</span>
              <span className="pr-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Personal Information ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
          Personal Information
        </h3>
        <form className="pr-form" onSubmit={handleSave} noValidate>
          <div className="pr-grid">
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-first">First name</label>
              <input
                className="auth-input"
                id="pr-first"
                value={form.firstName}
                onChange={setField('firstName')}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-last">Last name</label>
              <input
                className="auth-input"
                id="pr-last"
                value={form.lastName}
                onChange={setField('lastName')}
                required
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-username">Username</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">alternate_email</span>
              <input
                className="auth-input"
                id="pr-username"
                value={form.username}
                onChange={setField('username')}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-email">Email</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input
                className="auth-input"
                id="pr-email"
                type="email"
                value={form.email}
                onChange={setField('email')}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-phone">
              Phone number <span className="pr-optional">(optional)</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">phone</span>
              <input
                className={`auth-input${phoneError ? ' input-error' : ''}`}
                id="pr-phone"
                type="tel"
                value={form.phone}
                onChange={setField('phone')}
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            {phoneError && <p className="pr-field-error">{phoneError}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-bio">
              Bio <span className="pr-optional">(optional)</span>
            </label>
            <textarea
              className="auth-input pr-bio-input"
              id="pr-bio"
              rows={3}
              placeholder="A short bio about yourself…"
              value={form.bio}
              onChange={setField('bio')}
            />
          </div>

          <div className="pr-actions">
            {saved && (
              <span className="pr-saved-msg">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                Changes saved
              </span>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined" aria-hidden="true">check</span>
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* ── Security ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          Security
        </h3>
        <div className="pr-security-row">
          <div className="pr-security-info">
            <span className="pr-security-label">Password</span>
            <span className="pr-security-desc">
              Keep your account secure with a strong, unique password.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPwModal(true)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
            Change Password
          </button>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="surface-card pr-card pr-danger-card">
        <h3 className="pr-section-title danger">
          <span className="material-symbols-outlined" aria-hidden="true">warning</span>
          Danger zone
        </h3>
        <div className="pr-danger-row">
          <div>
            <span className="pr-danger-label">Delete account</span>
            <span className="pr-danger-desc">
              Permanently delete your account and all associated data. This cannot be undone.
            </span>
          </div>
          <button type="button" className="pr-danger-btn">Delete account</button>
        </div>
      </div>

      {/* Change Password modal */}
      {showPwModal && <ChangePasswordModal onClose={closePwModal} />}

    </PageShell>
  );
};

export default Profile;
