import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/Avatar/Avatar';
import { useLocale } from '../../i18n/LocaleContext';
import { formatDuration, formatGap } from '../../utils/dateFormat';
import {
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
} from '../../services/userService';
import { computeAchievements } from '../../utils/achievementUtils';
import './Profile.css';

// ── Helpers ───────────────────────────────────────────────────────────────────


const validateProfile = ({ firstName, lastName, email, phone }, t) => {
  const errs = {};
  if (!firstName.trim()) errs.firstName = t('register.err.firstNameReq');
  if (!lastName.trim())  errs.lastName  = t('register.err.lastNameReq');
  if (!email.trim())     errs.email     = t('register.err.emailReq');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('register.err.invalidEmail');
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) errs.phone = t('register.err.invalidPhone');
  }
  return errs;
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
    <span className="material-symbols-outlined pr-stat-card-arrow flip-rtl" aria-hidden="true">arrow_forward</span>
  </button>
);

// ── Achievement Card ──────────────────────────────────────────────────────────

const AchievementCard = ({ icon, title, description, unlocked = false }) => (
  <div className={`pr-achievement-card${unlocked ? ' unlocked' : ''}`} aria-label={`${title}${unlocked ? ', unlocked' : ', locked'}`}>
    <div className="pr-achievement-icon" aria-hidden="true">{icon}</div>
    <div className="pr-achievement-title">{title}</div>
    <div className="pr-achievement-desc">{description}</div>
    {!unlocked && <span className="pr-achievement-lock material-symbols-outlined" aria-hidden="true">lock</span>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <span className="pr-spinner" aria-hidden="true" />
);

// ── Change Password Modal ─────────────────────────────────────────────────────

const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm]       = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: null }));
    setApiError(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.current)               errs.current = t('pwModal.err.currentReq');
    if (form.next.length < 8)        errs.next    = t('pwModal.err.newMin');
    if (form.next !== form.confirm)  errs.confirm = t('pwModal.err.noMatch');
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError(null);
    const { error } = await changePassword({ currentPassword: form.current, newPassword: form.next });
    setLoading(false);

    if (error) {
      // error is an i18n key for known cases, raw message otherwise
      const msg = error.startsWith('pwModal.') ? t(error) : t('pwModal.err.generic');
      setApiError(msg);
      return;
    }
    setSuccess(true);
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
        <button className="pr-modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="pr-modal-header">
          <div className="pr-modal-icon-wrap" aria-hidden="true">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <div>
            <h2 className="pr-modal-title">{t('pwModal.title')}</h2>
            <p className="pr-modal-subtitle">{t('pwModal.subtitle')}</p>
          </div>
        </div>

        {success ? (
          <div className="pr-modal-success">
            <span className="material-symbols-outlined">check_circle</span>
            {t('pwModal.success')}
          </div>
        ) : (
          <form className="pr-modal-form" onSubmit={handleSubmit} noValidate>
            {apiError && (
              <div className="pr-api-error" role="alert">
                <span className="material-symbols-outlined">error</span>
                {apiError}
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-current">{t('pwModal.current')}</label>
              <input
                id="pw-current"
                type="password"
                className={`auth-input${errors.current ? ' input-error' : ''}`}
                value={form.current}
                onChange={set('current')}
                autoComplete="current-password"
                placeholder={t('pwModal.currentPh')}
                disabled={loading}
              />
              {errors.current && <p className="pr-field-error">{errors.current}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-next">{t('pwModal.new')}</label>
              <input
                id="pw-next"
                type="password"
                className={`auth-input${errors.next ? ' input-error' : ''}`}
                value={form.next}
                onChange={set('next')}
                autoComplete="new-password"
                placeholder={t('pwModal.newPh')}
                disabled={loading}
              />
              {errors.next && <p className="pr-field-error">{errors.next}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="pw-confirm">{t('pwModal.confirm')}</label>
              <input
                id="pw-confirm"
                type="password"
                className={`auth-input${errors.confirm ? ' input-error' : ''}`}
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
                placeholder={t('pwModal.confirmPh')}
                disabled={loading}
              />
              {errors.confirm && <p className="pr-field-error">{errors.confirm}</p>}
            </div>

            <div className="pr-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>{t('common.cancel')}</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Spinner /> : <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>}
                {loading ? t('pwModal.updating') : t('pwModal.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Delete Account Modal ──────────────────────────────────────────────────────

const DeleteAccountModal = ({ userEmail, onClose, onConfirmed }) => {
  const [typed, setTyped]     = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const inputRef = useRef(null);
  const { t } = useLocale();

  const DELETE_CONFIRMATION = t('delModal.confirmWord');

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, loading]);

  const confirmed = typed === DELETE_CONFIRMATION;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    setApiError(null);
    // Backend integration point: DELETE /api/user/account
    const { error } = await deleteAccount({ confirmationText: typed });
    if (error) {
      setLoading(false);
      setApiError(error);
      return;
    }
    // Backend integration point: clear auth token from AuthContext + localStorage
    onConfirmed();
  };

  return (
    <div
      className="pr-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Delete account"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="pr-modal-card pr-delete-modal-card">
        <button className="pr-modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="pr-modal-header">
          <div className="pr-modal-icon-wrap danger" aria-hidden="true">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <h2 className="pr-modal-title">{t('delModal.title')}</h2>
            <p className="pr-modal-subtitle">{t('delModal.subtitle')}</p>
          </div>
        </div>

        <div className="pr-delete-warning">
          <p>{t('delModal.warning')}</p>
          <ul>
            <li>{t('delModal.item1')}</li>
            <li>{t('delModal.item2')}</li>
            <li>{t('delModal.item3')}</li>
            <li>{t('delModal.item4')}</li>
          </ul>
        </div>

        <form onSubmit={handleDelete} noValidate>
          {apiError && (
            <div className="pr-api-error" role="alert">
              <span className="material-symbols-outlined">error</span>
              {apiError}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="del-confirm">
              {t('delModal.typeHint', { word: DELETE_CONFIRMATION })}
            </label>
            <input
              id="del-confirm"
              ref={inputRef}
              type="text"
              className={`auth-input${typed && !confirmed ? ' input-error' : ''}`}
              value={typed}
              onChange={(e) => { setTyped(e.target.value); setApiError(null); }}
              placeholder={DELETE_CONFIRMATION}
              autoComplete="off"
              disabled={loading}
              aria-describedby="del-confirm-hint"
            />
            <p id="del-confirm-hint" className="pr-field-hint">
              {t('delModal.caseSensitive')}
            </p>
          </div>

          <div className="pr-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn pr-delete-confirm-btn"
              disabled={!confirmed || loading}
              aria-disabled={!confirmed || loading}
            >
              {loading ? <Spinner /> : <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>}
              {loading ? t('delModal.deleting') : t('delModal.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Achievements config is now derived dynamically in the component via computeAchievements()

// ── Profile page ──────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate  = useNavigate();
  const { signOut } = useAuth();
  const { tasks } = useTasks();
  const { profile, setProfile, avatarSrc, setAvatarSrc } = useProfile();
  const { t } = useLocale();

  const [form, setFormState]      = useState({ ...profile });
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving]       = useState(false);
  const [saveResult, setSaveResult] = useState(null); // 'success' | string (error)
  const [uploadState, setUpload]  = useState('idle'); // idle | uploading | error
  const [showPwModal, setShowPwModal]   = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => { setFormState({ ...profile }); }, [profile]);

  const setField = (k) => (e) => {
    setFormState((p) => ({ ...p, [k]: e.target.value }));
    setSaveResult(null);
    setFieldErrors((p) => ({ ...p, [k]: null }));
  };

  // ── Avatar upload ────────────────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUpload('error'); return; }
    if (file.size > 5 * 1024 * 1024)    { setUpload('error'); return; }

    setUpload('uploading');
    const { data, error } = await uploadAvatar(file);
    if (error) { setUpload('error'); return; }

    if (data?.avatarUrl) {
      setAvatarSrc(data.avatarUrl);
      setUpload('idle');
    } else {
      setUpload('error');
    }
  };

  // ── Save profile ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateProfile(form, t);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setSaving(true);
    setSaveResult(null);
    // Backend integration point: PATCH /api/user/profile
    const { error } = await updateProfile(form);
    setSaving(false);

    if (error) { setSaveResult(error); return; }
    setProfile(form);
    setSaveResult('success');
  };

  const handleReset = () => {
    setFormState({ ...profile });
    setFieldErrors({});
    setSaveResult(null);
  };

  // ── Delete account ────────────────────────────────────────────────────────
  const handleAccountDeleted = async () => {
    await signOut();
    navigate('/');
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const done       = tasks.filter((t) => t.status === 'done');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const focusMin   = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap     = done.length > 0
    ? Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length)
    : null;
  const fmtMin = (m) => formatDuration(m, t);
  const avgGapLabel = avgGap !== null ? formatGap(avgGap, t) : '—';

  const { achievements, streakDays } = computeAchievements(tasks, t);

  const closePwModal  = useCallback(() => setShowPwModal(false), []);
  const closeDelModal = useCallback(() => setShowDelModal(false), []);

  return (
    <PageShell narrow title={t('profile.title')} subtitle={t('profile.subtitle')}>

      {/* ── Banner ── */}
      <div className="pr-banner surface-card">
        <div className="pr-banner-left">
          <div className="pr-avatar-wrap">
            <Avatar size="xl" className="pr-banner-avatar" />
            <label htmlFor="pr-photo-input" className="pr-avatar-overlay" aria-label="Change profile photo">
              {uploadState === 'uploading'
                ? <Spinner />
                : <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>}
              <span className="pr-overlay-text">{uploadState === 'uploading' ? t('profile.uploading') : t('profile.changePhoto')}</span>
            </label>
            <input
              id="pr-photo-input"
              ref={fileRef}
              type="file"
              accept="image/*"
              className="pr-file-input"
              onChange={handleFile}
              disabled={uploadState === 'uploading'}
            />
          </div>
          <div className="pr-banner-info">
            <h2 className="pr-full-name">{profile.firstName} {profile.lastName}</h2>
            <span className="pr-username">@{profile.username}</span>
            {uploadState === 'error' && (
              <span className="pr-upload-status error">{t('profile.uploadError')}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="pr-stat-cards" role="list" aria-label="Activity summary">
        <StatCard
          icon="check_circle"
          value={done.length}
          label={t('profile.tasksCompleted')}
          sublabel={t('profile.viewHistory')}
          colorClass="color-success"
          onClick={() => navigate('/task-history')}
        />
        <StatCard
          icon="pending_actions"
          value={inProgress.length}
          label={t('profile.inProgress')}
          sublabel={t('profile.viewDashboard')}
          colorClass="color-warning"
          onClick={() => navigate('/dashboard')}
        />
        <StatCard
          icon="schedule"
          value={fmtMin(focusMin)}
          label={t('profile.focusTime')}
          sublabel={t('profile.viewStats')}
          colorClass="color-secondary"
          onClick={() => navigate('/statistics')}
        />
        <StatCard
          icon="query_stats"
          value={<span dir="ltr">{avgGapLabel}</span>}
          label={t('profile.avgGap')}
          sublabel={t('profile.viewStats')}
          colorClass={avgGap !== null && avgGap > 0 ? 'color-error' : 'color-success'}
          onClick={() => navigate('/statistics')}
        />
      </div>

      {/* ── Productivity Streak ── */}
      <div className="surface-card pr-card pr-streak-card">
        <div className="pr-streak-left">
          <span className="pr-streak-flame" aria-hidden="true">🔥</span>
          <div>
            <div className="pr-streak-title">{t('profile.streak')}</div>
            {streakDays > 0
              ? <div className="pr-streak-value">{t('profile.streakValue', { n: streakDays, unit: streakDays === 1 ? t('profile.streakUnit1') : t('profile.streakUnitN') })}</div>
              : <div className="pr-streak-value pr-streak-empty">{t('profile.noStreak')}</div>
            }
          </div>
        </div>
        <div className="pr-streak-badge" aria-label={t('profile.streakValue', { n: streakDays, unit: streakDays === 1 ? t('profile.streakUnit1') : t('profile.streakUnitN') })}>
          <span className="pr-streak-badge-num">{streakDays}</span>
          <span className="pr-streak-badge-label">{t('profile.streakBadgeDays')}</span>
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
          {t('profile.achievements')}
        </h3>
        <div className="pr-achievements-grid" role="list" aria-label="Achievements">
          {achievements.map((a) => (
            <AchievementCard
              key={a.key}
              icon={a.icon}
              title={a.title}
              description={a.description}
              unlocked={a.unlocked}
            />
          ))}
        </div>
      </div>

      {/* ── Personal Information ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
          {t('profile.personalInfo')}
        </h3>
        <form className="pr-form" onSubmit={handleSave} noValidate>
          <div className="pr-grid">
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-first">{t('profile.firstName')}</label>
              <input
                className={`auth-input${fieldErrors.firstName ? ' input-error' : ''}`}
                id="pr-first"
                value={form.firstName}
                onChange={setField('firstName')}
                autoComplete="given-name"
                disabled={saving}
              />
              {fieldErrors.firstName && <p className="pr-field-error">{fieldErrors.firstName}</p>}
            </div>
            <div className="auth-field">
              <label className="auth-label" htmlFor="pr-last">{t('profile.lastName')}</label>
              <input
                className={`auth-input${fieldErrors.lastName ? ' input-error' : ''}`}
                id="pr-last"
                value={form.lastName}
                onChange={setField('lastName')}
                autoComplete="family-name"
                disabled={saving}
              />
              {fieldErrors.lastName && <p className="pr-field-error">{fieldErrors.lastName}</p>}
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-username">{t('profile.username')}</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">alternate_email</span>
              <input className="auth-input" id="pr-username" value={form.username} onChange={setField('username')} autoComplete="username" disabled={saving} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-email">{t('profile.email')}</label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">mail</span>
              <input
                className={`auth-input${fieldErrors.email ? ' input-error' : ''}`}
                id="pr-email"
                type="email"
                value={form.email}
                onChange={setField('email')}
                autoComplete="email"
                disabled={saving}
              />
            </div>
            {fieldErrors.email && <p className="pr-field-error">{fieldErrors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-phone">
              {t('profile.phone')} <span className="pr-optional">({t('common.optional')})</span>
            </label>
            <div className="auth-input-icon-wrap">
              <span className="material-symbols-outlined auth-input-icon" aria-hidden="true">phone</span>
              <input
                className={`auth-input${fieldErrors.phone ? ' input-error' : ''}`}
                id="pr-phone"
                type="tel"
                value={form.phone}
                onChange={setField('phone')}
                autoComplete="tel"
                placeholder={t('profile.phonePh')}
                disabled={saving}
              />
            </div>
            {fieldErrors.phone && <p className="pr-field-error">{fieldErrors.phone}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="pr-bio">
              {t('profile.bio')} <span className="pr-optional">({t('common.optional')})</span>
            </label>
            <textarea
              className="auth-input pr-bio-input"
              id="pr-bio"
              rows={3}
              placeholder={t('profile.bioPh')}
              value={form.bio}
              onChange={setField('bio')}
              disabled={saving}
            />
          </div>

          <div className="pr-actions">
            {saveResult === 'success' && (
              <span className="pr-saved-msg" role="status">
                <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                {t('profile.savedMsg')}
              </span>
            )}
            {saveResult && saveResult !== 'success' && (
              <span className="pr-save-error" role="alert">
                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                {saveResult}
              </span>
            )}
            <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={saving}>
              {t('common.reset')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Spinner /> : <span className="material-symbols-outlined" aria-hidden="true">check</span>}
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>

      {/* ── Security ── */}
      <div className="surface-card pr-card">
        <h3 className="pr-section-title">
          <span className="material-symbols-outlined" aria-hidden="true">shield</span>
          {t('profile.security')}
        </h3>
        <div className="pr-security-row">
          <div className="pr-security-info">
            <span className="pr-security-label">{t('profile.password')}</span>
            <span className="pr-security-desc">{t('profile.passwordDesc')}</span>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPwModal(true)}>
            <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
            {t('profile.changePassword')}
          </button>
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="surface-card pr-card pr-danger-card">
        <h3 className="pr-section-title danger">
          <span className="material-symbols-outlined" aria-hidden="true">warning</span>
          {t('profile.dangerZone')}
        </h3>
        <div className="pr-danger-row">
          <div>
            <span className="pr-danger-label">{t('profile.deleteAccount')}</span>
            <span className="pr-danger-desc">{t('profile.deleteDesc')}</span>
          </div>
          <button type="button" className="pr-danger-btn" onClick={() => setShowDelModal(true)}>
            <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>
            {t('profile.deleteAccount')}
          </button>
        </div>
      </div>

      {showPwModal  && <ChangePasswordModal onClose={closePwModal} />}
      {showDelModal && (
        <DeleteAccountModal
          userEmail={profile.email}
          onClose={closeDelModal}
          onConfirmed={handleAccountDeleted}
        />
      )}
    </PageShell>
  );
};

export default Profile;
