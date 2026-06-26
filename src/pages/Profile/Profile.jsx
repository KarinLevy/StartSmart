import React, { useState, useRef } from 'react';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './Profile.css';

const GRADIENT_PAIRS = [
  ['#1e3a8a', '#6b38d4'],
  ['#0f766e', '#0e7490'],
  ['#9d174d', '#be185d'],
  ['#92400e', '#b45309'],
  ['#1d4ed8', '#4338ca'],
  ['#065f46', '#047857'],
];

const colorFromStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return GRADIENT_PAIRS[h % GRADIENT_PAIRS.length];
};

const getInitials = (first, last) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

const INIT_USER = { firstName: 'Maya', lastName: 'Cohen', username: 'maya_c', email: 'maya@example.com', bio: '' };

const STATS_CONFIG = [
  { icon: 'check_circle',   label: 'Tasks done',   key: 'done' },
  { icon: 'pending_actions', label: 'In progress', key: 'in_progress' },
  { icon: 'schedule',       label: 'Focus time',   key: 'focus' },
  { icon: 'query_stats',    label: 'Avg. gap',     key: 'gap' },
];

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const Profile = () => {
  const { tasks } = useTasks();
  const [form, setForm]           = useState(INIT_USER);
  const [saved, setSaved]         = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [uploadState, setUpload]  = useState('idle'); // idle | uploading | error
  const fileRef = useRef(null);

  const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setSaved(false); };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUpload('error'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUpload('error'); return; }
    setUpload('uploading');
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatarSrc(ev.target.result); setUpload('idle'); };
    reader.onerror = () => setUpload('error');
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  // Stats from context
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

  const initials  = getInitials(form.firstName, form.lastName);
  const [c1, c2]  = colorFromStr(form.firstName + form.lastName);

  return (
    <PageShell narrow title="Profile" subtitle="Manage your personal details and account info.">

      {/* Avatar + stats banner */}
      <div className="pr-banner surface-card">
        <div className="pr-banner-left">
          <div className="pr-avatar-wrap">
            {avatarSrc ? (
              <img src={avatarSrc} alt={`${form.firstName}'s avatar`} className="pr-avatar-img" />
            ) : (
              <div
                className="pr-avatar-initials"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                aria-label={`${initials} avatar`}
              >
                {initials}
              </div>
            )}
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
            <h2 className="pr-full-name">{form.firstName} {form.lastName}</h2>
            <span className="pr-username">@{form.username}</span>
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

      {/* Form */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
          Personal information
        </h3>
        <form className="pr-form" onSubmit={handleSave}>
          <div className="pr-grid">
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-first">First name</label>
              <input className="auth-input" id="pr-first" value={form.firstName} onChange={set('firstName')} required autoComplete="given-name" />
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-last">Last name</label>
              <input className="auth-input" id="pr-last" value={form.lastName} onChange={set('lastName')} required autoComplete="family-name" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-username">Username</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">alternate_email</span>
              <input className="auth-input" id="pr-username" value={form.username} onChange={set('username')} autoComplete="username" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-email">Email</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input className="auth-input" id="pr-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-bio">Bio <span className="pr-optional">(optional)</span></label>
            <textarea
              className="auth-input pr-bio-input"
              id="pr-bio"
              rows={3}
              placeholder="A short bio about yourself…"
              value={form.bio}
              onChange={set('bio')}
            />
          </div>

          <div className="pr-actions">
            {saved && (
              <span className="pr-saved-msg">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                Saved
              </span>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => { setForm(INIT_USER); setSaved(false); }}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary">
              <span className="material-symbols-outlined" aria-hidden="true">check</span>
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
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

    </PageShell>
  );
};

export default Profile;
