import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TasksContext';
import { useProfile } from '../../context/ProfileContext';
import { useLocale, LANGUAGES } from '../../i18n/LocaleContext';
import { saveSettings, exportUserData, triggerDownload, reportProblem } from '../../services/settingsService';
import './Settings.css';

// ── Persistence key ───────────────────────────────────────────────────────────
const SETTINGS_KEY = 'ss_settings_v1';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistSettings(s) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch {}
  // Backend integration point: PATCH /api/user/settings
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Toggle = ({ id, checked, onChange, label }) => (
  <button
    type="button"
    id={id}
    className={`set-toggle${checked ? ' on' : ''}`}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
  >
    <span className="set-toggle-knob" />
  </button>
);

const Section = ({ icon, title, children }) => (
  <div className="surface-card set-section">
    <h3 className="set-section-title">
      <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
      {title}
    </h3>
    <div className="set-rows">{children}</div>
  </div>
);

const Row = ({ label, desc, control, danger }) => (
  <div className={`set-row${danger ? ' danger' : ''}`}>
    <div className="set-row-text">
      <span className="set-row-label">{label}</span>
      {desc && <span className="set-row-desc">{desc}</span>}
    </div>
    <div className="set-row-control">{control}</div>
  </div>
);

const Spinner = () => <span className="set-spinner" aria-hidden="true" />;

// ── Settings page ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  notifs: {
    taskReminders: true,
    timeGapAlerts: true,
    weeklySummary: false,
    soundEffects: true,
    focusEndAlert: true,
  },
  focus: {
    autoStartBreak: false,
    showGapLive: true,
    confirmFinish: true,
  },
  privacy: {
    publicProfile: false,
    shareStats: false,
  },
  goal: '4',
  defaultEst: '30',
};

const Settings = () => {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const { tasks } = useTasks();
  const { profile } = useProfile();
  const { locale, setLocale, t, LANGUAGES } = useLocale();
  const navigate = useNavigate();

  // Load persisted settings or fall back to defaults
  const [settings, setSettings] = useState(() => {
    const saved = loadSettings();
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  });

  const { notifs, focus, privacy, goal, defaultEst } = settings;

  // Persist whenever settings change
  useEffect(() => { persistSettings(settings); }, [settings]);

  const patch = (key, val) => setSettings((p) => ({ ...p, [key]: val }));
  const toggleN = (k) => patch('notifs',  { ...notifs,  [k]: !notifs[k] });
  const toggleF = (k) => patch('focus',   { ...focus,   [k]: !focus[k] });
  const toggleP = (k) => patch('privacy', { ...privacy, [k]: !privacy[k] });

  // ── Language change ──────────────────────────────────────────────────────
  const handleLanguageChange = (e) => {
    setLocale(e.target.value);
    // Backend integration point: PATCH /api/user/settings { language: e.target.value }
  };

  // ── Export data ──────────────────────────────────────────────────────────
  const [exportState, setExportState] = useState('idle'); // idle | loading | success | error

  const handleExport = async () => {
    if (exportState === 'loading') return;
    setExportState('loading');

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        email: profile.email,
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      },
      tasks,
      settings,
      // Backend integration point: also include focus sessions from API
      focusSessions: [],
    };

    // Backend integration point: GET /api/user/export (replaces client-side generation)
    const { data: blob, error } = await exportUserData(exportPayload);

    if (error) { setExportState('error'); setTimeout(() => setExportState('idle'), 3000); return; }

    const filename = `startsmart-export-${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(blob, filename);
    setExportState('success');
    setTimeout(() => setExportState('idle'), 3000);
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout(); // clears ss_auth_token + ss_auth_user from localStorage
    navigate('/');
  };

  // ── Report a problem ─────────────────────────────────────────────────────
  const [reportState, setReportState] = useState('idle');

  const handleReport = async () => {
    if (reportState === 'loading') return;
    setReportState('loading');
    // Backend integration point: POST /api/support/report
    const { error } = await reportProblem({
      category: 'user_report',
      userAgent: navigator.userAgent,
      description: '',
    });
    setReportState(error ? 'error' : 'success');
    setTimeout(() => setReportState('idle'), 3000);
    if (!error) navigate('/contact');
  };

  const exportLabel = exportState === 'loading'
    ? t.settings.privacy.exporting
    : exportState === 'success'
    ? t.settings.privacy.exportSuccess
    : t.settings.privacy.exportData;

  return (
    <PageShell narrow title={t.settings.title} subtitle={t.settings.subtitle}>

      {/* ── Appearance ── */}
      <Section icon="palette" title={t.settings.appearance.title}>
        <Row
          label={t.settings.appearance.theme}
          desc={t.settings.appearance.themeDesc(theme)}
          control={<ThemeToggle />}
        />
        <Row
          label={t.settings.appearance.language}
          desc={t.settings.appearance.languageDesc}
          control={
            <div className="set-lang-wrap">
              <span className="set-lang-flag" aria-hidden="true">
                {LANGUAGES.find((l) => l.code === locale)?.flag ?? '🌐'}
              </span>
              <select
                className="set-select"
                value={locale}
                onChange={handleLanguageChange}
                aria-label={t.settings.appearance.language}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </Section>

      {/* ── Focus & Planning ── */}
      <Section icon="timer" title={t.settings.focus.title}>
        <Row
          label={t.settings.focus.dailyGoal}
          desc={t.settings.focus.dailyGoalDesc}
          control={
            <select className="set-select" value={goal} onChange={(e) => patch('goal', e.target.value)} aria-label={t.settings.focus.dailyGoal}>
              {Object.entries(t.settings.hours).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          }
        />
        <Row
          label={t.settings.focus.defaultEst}
          desc={t.settings.focus.defaultEstDesc}
          control={
            <select className="set-select" value={defaultEst} onChange={(e) => patch('defaultEst', e.target.value)} aria-label={t.settings.focus.defaultEst}>
              {Object.entries(t.settings.minutes).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          }
        />
        <Row label={t.settings.focus.showGapLive}   desc={t.settings.focus.showGapLiveDesc}   control={<Toggle id="showGapLive"   checked={focus.showGapLive}   onChange={() => toggleF('showGapLive')}   label={t.settings.focus.showGapLive} />} />
        <Row label={t.settings.focus.autoBreak}     desc={t.settings.focus.autoBreakDesc}     control={<Toggle id="autoStartBreak" checked={focus.autoStartBreak} onChange={() => toggleF('autoStartBreak')} label={t.settings.focus.autoBreak} />} />
        <Row label={t.settings.focus.confirmFinish} desc={t.settings.focus.confirmFinishDesc} control={<Toggle id="confirmFinish"  checked={focus.confirmFinish}  onChange={() => toggleF('confirmFinish')}  label={t.settings.focus.confirmFinish} />} />
      </Section>

      {/* ── Notifications ── */}
      <Section icon="notifications" title={t.settings.notifications.title}>
        <Row label={t.settings.notifications.taskReminders}  desc={t.settings.notifications.taskRemindersDesc}  control={<Toggle id="taskReminders" checked={notifs.taskReminders} onChange={() => toggleN('taskReminders')} label={t.settings.notifications.taskReminders} />} />
        <Row label={t.settings.notifications.timeGapAlerts}  desc={t.settings.notifications.timeGapAlertsDesc}  control={<Toggle id="timeGapAlerts" checked={notifs.timeGapAlerts} onChange={() => toggleN('timeGapAlerts')} label={t.settings.notifications.timeGapAlerts} />} />
        <Row label={t.settings.notifications.focusEndAlert}  desc={t.settings.notifications.focusEndAlertDesc}  control={<Toggle id="focusEndAlert"  checked={notifs.focusEndAlert}  onChange={() => toggleN('focusEndAlert')}  label={t.settings.notifications.focusEndAlert} />} />
        <Row label={t.settings.notifications.weeklySummary}  desc={t.settings.notifications.weeklySummaryDesc}  control={<Toggle id="weeklySummary"  checked={notifs.weeklySummary}  onChange={() => toggleN('weeklySummary')}  label={t.settings.notifications.weeklySummary} />} />
        <Row label={t.settings.notifications.focusSounds}    desc={t.settings.notifications.focusSoundsDesc}    control={<Toggle id="soundEffects"   checked={notifs.soundEffects}   onChange={() => toggleN('soundEffects')}   label={t.settings.notifications.focusSounds} />} />
      </Section>

      {/* ── Privacy ── */}
      <Section icon="lock" title={t.settings.privacy.title}>
        <Row label={t.settings.privacy.publicProfile} desc={t.settings.privacy.publicProfileDesc} control={<Toggle id="publicProfile" checked={privacy.publicProfile} onChange={() => toggleP('publicProfile')} label={t.settings.privacy.publicProfile} />} />
        <Row label={t.settings.privacy.shareStats}    desc={t.settings.privacy.shareStatsDesc}    control={<Toggle id="shareStats"    checked={privacy.shareStats}    onChange={() => toggleP('shareStats')}    label={t.settings.privacy.shareStats} />} />
        <Row
          label={t.settings.privacy.exportData}
          desc={t.settings.privacy.exportDataDesc}
          control={
            <button
              className={`set-action-btn${exportState === 'success' ? ' success' : exportState === 'error' ? ' error' : ''}`}
              onClick={handleExport}
              disabled={exportState === 'loading'}
              aria-live="polite"
            >
              {exportState === 'loading'
                ? <><Spinner />{t.settings.privacy.exporting}</>
                : exportState === 'success'
                ? <><span className="material-symbols-outlined" aria-hidden="true">check_circle</span>{t.settings.privacy.exportSuccess}</>
                : exportState === 'error'
                ? <><span className="material-symbols-outlined" aria-hidden="true">error</span>Error</>
                : <><span className="material-symbols-outlined" aria-hidden="true">download</span>Export</>
              }
            </button>
          }
        />
      </Section>

      {/* ── Account ── */}
      <Section icon="manage_accounts" title={t.settings.account.title}>
        <Row
          label={t.settings.account.profileSettings}
          desc={t.settings.account.profileSettingsDesc}
          control={
            <Link to="/profile" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              {t.common.open}
            </Link>
          }
        />
        <Row
          label={t.settings.account.signOut}
          desc={t.settings.account.signOutDesc}
          danger
          control={
            <button className="set-action-btn set-signout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              {t.common.signOut}
            </button>
          }
        />
      </Section>

      {/* ── Help & Support ── */}
      <Section icon="help" title={t.settings.help.title}>
        <Row
          label={t.settings.help.helpCenter}
          desc={t.settings.help.helpCenterDesc}
          control={
            /* Backend integration point: replace href with real help docs URL */
            <button className="set-action-btn" onClick={() => alert('Help Center coming soon — documentation is being prepared.')}>
              <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
              {t.common.open}
            </button>
          }
        />
        <Row
          label={t.settings.help.faq}
          desc={t.settings.help.faqDesc}
          control={
            <Link to="/faq" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              {t.common.open}
            </Link>
          }
        />
        <Row
          label={t.settings.help.contactSupport}
          desc={t.settings.help.contactSupportDesc}
          control={
            <Link to="/contact" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              {t.common.open}
            </Link>
          }
        />
        <Row
          label={t.settings.help.reportProblem}
          desc={t.settings.help.reportProblemDesc}
          control={
            <button
              className={`set-action-btn${reportState === 'success' ? ' success' : reportState === 'error' ? ' error' : ''}`}
              onClick={handleReport}
              disabled={reportState === 'loading'}
            >
              {reportState === 'loading'
                ? <Spinner />
                : <span className="material-symbols-outlined" aria-hidden="true">bug_report</span>}
              {reportState === 'loading' ? t.common.loading
                : reportState === 'success' ? 'Sent!'
                : reportState === 'error'   ? 'Error'
                : t.common.open}
            </button>
          }
        />
      </Section>

      {/* ── Upgrade banner ── */}
      <div className="set-upgrade">
        <div className="set-upgrade-text">
          <span className="chip set-upgrade-chip">Pro</span>
          <h3 className="set-upgrade-title">Unlock smart recommendations</h3>
          <p className="set-upgrade-desc">
            Upgrade to StartSmart Pro for AI-powered time insights, advanced analytics, and calendar sync.
          </p>
        </div>
        <Link to="/premium" className="btn set-upgrade-btn">
          <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
          {t.common.upgrade}
        </Link>
      </div>

    </PageShell>
  );
};

export default Settings;
