import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  if (!ph) return null;
  const digits = ph.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return 'Enter a valid phone number (7–15 digits).';
  return null;
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, sublabel, onClick, colorClass = '' }) => (
  <button
    type="button"
    className={`pr-stat-card ${colorClass}`}
    onClick={onClick}
    aria-label={`${label}: ${value}. Click to view details.`}
  >
    <span className={`material-symbols-outlined pr-stat-card-icon ${colorClass}`} aria-hidden="true">{icon}</span>
    <span className="pr-stat-card-value">{value}</span>
    <span className="pr-stat-card-label">{label}</span>
    {sublabel && <span className="pr-stat-card-sublabel">{sublabel}</span>}
    <span className="material-symbols-outlined pr-stat-card-arrow" aria-hidden="true">arrow_forward</span>
  </button>
);

// ── Achievement Card ──────────────────────────────────────────────────────────

const AchievementCard = ({ icon, title, description, unlocked = false, value = null }) => (
  <div className={`pr-achievement-card${unlocked ? ' unlocked' : ''}`} aria-label={`${title}${unlocked ? ', unlocked' : ', locked'}`}>
    <div className="pr-achievement-icon" aria-hidden="true">{icon}</div>
    {value !== null && <div className="pr-achievement-value">{value}</div>}
    <div className="pr-achievement-title">{title}</div>
    <div className="pr-achievement-desc">{description}</div>
    {!unlocked && <span className="pr-achievement-lock material-symbols-outlined" aria-hidden="true">lock</span>}
  </div>
);

// ── Change Password Modal ─────────────────────────────────────────────────────

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm]       = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: null }));
    setSuccess(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.current)               errs.current = 'Current password is required.';
    if (form.next.length < 8)        errs.next    = 'New password must be at least 8 characters.';
    if (form.next !== form.confirm)  errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // Backend integration point: POST /api/auth/change-password { currentPassword, newPassword }
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

// Backend integration point: replace with real achievements from GET /api/profile/achievements
const ACHIEVEMENTS_CONFIG = [
  { icon: '🏆', title: 'First Task',         description: 'Completed your first task',        key: 'first_task' },
  { icon: '🔥', title: '7-Day Streak',        description: '7 consecutive productive days',    key: 'streak_7' },
  { icon: '🎯', title: '90% Accuracy',        description: 'Estimation accuracy above 90%',   key: 'accuracy_90' },
  { icon: '⭐', title: '100 Tasks',           description: 'Completed 100 tasks total',        key: 'tasks_100' },
  { icon: '📚', title: 'Study Master',        description: 'Logged 10h of study focus time',  key: 'study_master' },
  { icon: '💼', title: 'Work Champion',       description: 'Logged 10h of work focus time',   key: 'work_champion' },
];

const Profile = () => {
  const navigate  = useNavigate();
  const { tasks } = useTasks();
  const { profile, setProfile, avatarSrc, setAvatarSrc } = useProfile();

  const [form, setFormState]      = useState({ ...profile });
  const [phoneError, setPhoneError] = useState(null);
  const [saved, setSaved]           = useState(false);
  const [uploadState, setUpload]    = useState('idle');
  const [showPwModal, setShowPwModal] = useState(false);

  const fileRef = useRef(null);

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

  // ── Derived stats ──────────────────────────────────────────────────────────
  const done       = tasks.filter((t) => t.status === 'done');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const focusMin   = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap     = done.length > 0
    ? Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length)
    : null;
  const avgGapLabel = avgGap !== null ? (avgGap > 0 ? `+${avgGap}m` : `${avgGap}m`) : '—';

  // Backend integration point: GET /api/profile/streak
  const streakDays = 0; // replace with real data

  // Backend integration point: GET /api/profile/achievements
  const unlockedKeys = new Set(
    done.length >= 1  ? ['first_task']  : [],
  );
  if (done.length >= 100) unlockedKeys.add('tasks_100');

  const closePwModal = useCallback(() => setShowPwModal(false), []);

  return (
    <PageShell narrow title="Profile" subtitle="Manage your personal details and account info.">

      {/* ── Banner ── */}
      <div className="pr-banner surface-card">
        <div className="pr-banner-left">
          <div className="pr-avatar-wrap">
            <Avatar size="xl" className="pr-banner-avatar" />
            <label htmlFor="pr-photo-input" className="pr-avatar-overlay" aria-label="Change profile photo">
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
      </div>

      {/* ── Stat Cards ── */}
      <div className="pr-stat-cards" role="list" aria-label="Activity summary">
        <StatCard
          icon="check_circle"
          value={done.length}
          label="Tasks Completed"
          sublabel="View in Task History"
          colorClass="color-success"
          onClick={() => navigate('/task-history')}
        />
        <StatCard
          icon="pending_actions"
          value={inProgress.length}
          label="In Progress"
          sublabel="View on Dashboard"
          colorClass="color-warning"
          onClick={() => navigate('/dashboard')}
        />
        <StatCard
          icon="schedule"
          value={fmtMin(focusMin)}
          label="Focus Time"
          sublabel="View Statistics"
          colorClass="color-secondary"
          onClick={() => navigate('/statistics')}
        />
        <StatCard
          icon="query_stats"
          value={avgGapLabel}
          label="Avg. Gap"
          sublabel="View Statistics"
          colorClass={avgGap !== null && avgGap > 0 ? 'color-error' : 'color-success'}
          onClick={() => navigate('/statistics')}
        />
      </div>

      {/* ── Productivity Streak ── */}
      <div className="surface-card pr-card pr-streak-card">
        <div className="pr-streak-left">
          <span className="pr-streak-flame" aria-hidden="true">🔥</span>
          <div>
            <div className="pr-streak-title">Current Streak</div>
            {/* Backend integration point: replace streakDays with API data */}
            {streakDays > 0
              ? <div className="pr-streak-value">{streakDays} productive {streakDays === 1 ? 'day' : 'days'} in a row</div>
              : <div className="pr-streak-value pr-streak-empty">No active streak yet — complete a task today to start one!</div>
            }
          </div>
        </div>
        <div className="pr-streak-badge" aria-label={`${streakDays} day streak`}>
          <span className="pr-streak-badge-num">{streakDays}</span>
          <span className="pr-streak-badge-label">days</span>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
          Achievements
        </h3>
        {/* Backend integration point: fetch achievements from GET /api/profile/achievements */}
        <div className="pr-achievements-grid" role="list" aria-label="Achievements">
          {ACHIEVEMENTS_CONFIG.map((a) => (
            <AchievementCard
              key={a.key}
              icon={a.icon}
              title={a.title}
              description={a.description}
              unlocked={unlockedKeys.has(a.key)}
            />
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
              <input className="auth-input" id="pr-first" value={form.firstName} onChange={setField('firstName')} required autoComplete="given-name" />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-last">Last name</label>
              <input className="auth-input" id="pr-last" value={form.lastName} onChange={setField('lastName')} required autoComplete="family-name" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-username">Username</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">alternate_email</span>
              <input className="auth-input" id="pr-username" value={form.username} onChange={setField('username')} autoComplete="username" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-email">Email</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input className="auth-input" id="pr-email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" />
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
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
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
            <span className="pr-security-desc">Keep your account secure with a strong, unique password.</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPwModal(true)}>
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
            <span className="pr-danger-desc">Permanently delete your account and all associated data. This cannot be undone.</span>
          </div>
          <button type="button" className="pr-danger-btn">Delete account</button>
        </div>
      </div>

      {showPwModal && <ChangePasswordModal onClose={closePwModal} />}
    </PageShell>
  );
};

export default Profile;
