import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TasksContext';
import { useProfile } from '../../context/ProfileContext';
import { useLocale, LANGUAGES } from '../../i18n/LocaleContext';
import { exportUserData, triggerDownload, reportProblem } from '../../services/settingsService';
import { updateNotificationsEnabled } from '../../services/userService';
import { loadUserSettings, saveUserSettings } from '../../services/userSettingsService';
import './Settings.css';

// localStorage key kept only as instant-read cache (primary source is now Supabase)
const SETTINGS_LS_KEY = 'ss_settings_v1';

function loadCached() {
  try {
    const raw = localStorage.getItem(SETTINGS_LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
  const { signOut } = useAuth();
  const { tasks } = useTasks();
  const { profile } = useProfile();
  const { locale, setLocale, t, LANGUAGES } = useLocale();
  const navigate = useNavigate();

  // Initialise from cache immediately; hydrate from Supabase in background
  const [settings, setSettings] = useState(() => {
    const cached = loadCached();
    return cached ? { ...DEFAULT_SETTINGS, ...cached } : DEFAULT_SETTINGS;
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const { notifs, focus, privacy, goal, defaultEst } = settings;

  // Hydrate from Supabase on mount (overwrites cache if DB has newer values)
  useEffect(() => {
    loadUserSettings().then((s) => {
      setSettings((prev) => ({ ...prev, ...s }));
      setSettingsLoaded(true);
    });
  }, []);

  // If the profile says notifications are globally disabled, reflect that
  useEffect(() => {
    if (profile.notificationsEnabled === false) {
      setSettings((p) => ({
        ...p,
        notifs: Object.fromEntries(Object.keys(p.notifs).map((k) => [k, false])),
      }));
    }
  }, [profile.notificationsEnabled]);

  // Persist to Supabase + localStorage whenever settings change (after initial load)
  useEffect(() => {
    if (settingsLoaded) saveUserSettings(settings);
  }, [settings, settingsLoaded]);

  const patch = (key, val) => setSettings((p) => ({ ...p, [key]: val }));

  const toggleN = (k) => {
    const newNotifs = { ...notifs, [k]: !notifs[k] };
    patch('notifs', newNotifs);
    // Sync master notifications_enabled flag to Supabase profile
    const anyOn = Object.values(newNotifs).some(Boolean);
    updateNotificationsEnabled(anyOn);
  };
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
  const handleLogout = async () => {
    await signOut();
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

  const HOUR_OPTIONS = [
    ['1', t('settings.h1')], ['2', t('settings.h2')], ['3', t('settings.h3')],
    ['4', t('settings.h4')], ['6', t('settings.h6')], ['8', t('settings.h8')],
  ];
  const MIN_OPTIONS = [
    ['15', t('settings.m15')], ['30', t('settings.m30')], ['45', t('settings.m45')],
    ['60', t('settings.m60')], ['90', t('settings.m90')],
  ];

  return (
    <PageShell narrow title={t('settings.title')} subtitle={t('settings.subtitle')}>

      {/* ── Appearance ── */}
      <Section icon="palette" title={t('settings.appearance')}>
        <Row
          label={t('settings.theme')}
          desc={theme === 'dark' ? t('settings.themeDescDark') : t('settings.themeDescLight')}
          control={<ThemeToggle />}
        />
        <Row
          label={t('settings.language')}
          desc={t('settings.languageDesc')}
          control={
            <div className="set-lang-wrap">
              <span className="set-lang-flag" aria-hidden="true">
                {LANGUAGES.find((l) => l.code === locale)?.flag ?? '🌐'}
              </span>
              <select
                className="set-select"
                value={locale}
                onChange={handleLanguageChange}
                aria-label={t('settings.language')}
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
      <Section icon="timer" title={t('settings.focusPlanning')}>
        <Row
          label={t('settings.dailyGoal')}
          desc={t('settings.dailyGoalDesc')}
          control={
            <select className="set-select" value={goal} onChange={(e) => patch('goal', e.target.value)} aria-label={t('settings.dailyGoal')}>
              {HOUR_OPTIONS.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          }
        />
        <Row
          label={t('settings.defaultEst')}
          desc={t('settings.defaultEstDesc')}
          control={
            <select className="set-select" value={defaultEst} onChange={(e) => patch('defaultEst', e.target.value)} aria-label={t('settings.defaultEst')}>
              {MIN_OPTIONS.map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          }
        />
        <Row label={t('settings.showGapLive')}   desc={t('settings.showGapLiveDesc')}   control={<Toggle id="showGapLive"    checked={focus.showGapLive}    onChange={() => toggleF('showGapLive')}    label={t('settings.showGapLive')} />} />
        <Row label={t('settings.autoBreak')}      desc={t('settings.autoBreakDesc')}     control={<Toggle id="autoStartBreak" checked={focus.autoStartBreak}  onChange={() => toggleF('autoStartBreak')} label={t('settings.autoBreak')} />} />
        <Row label={t('settings.confirmFinish')}  desc={t('settings.confirmFinishDesc')} control={<Toggle id="confirmFinish"  checked={focus.confirmFinish}   onChange={() => toggleF('confirmFinish')}  label={t('settings.confirmFinish')} />} />
      </Section>

      {/* ── Notifications ── */}
      <Section icon="notifications" title={t('settings.notifications')}>
        <Row label={t('settings.taskReminders')}  desc={t('settings.taskRemindersDesc')}  control={<Toggle id="taskReminders" checked={notifs.taskReminders} onChange={() => toggleN('taskReminders')} label={t('settings.taskReminders')} />} />
        <Row label={t('settings.timeGapAlerts')}  desc={t('settings.timeGapAlertsDesc')}  control={<Toggle id="timeGapAlerts" checked={notifs.timeGapAlerts} onChange={() => toggleN('timeGapAlerts')} label={t('settings.timeGapAlerts')} />} />
        <Row label={t('settings.focusEndAlert')}  desc={t('settings.focusEndAlertDesc')}  control={<Toggle id="focusEndAlert"  checked={notifs.focusEndAlert}  onChange={() => toggleN('focusEndAlert')}  label={t('settings.focusEndAlert')} />} />
        <Row label={t('settings.weeklySummary')}  desc={t('settings.weeklySummaryDesc')}  control={<Toggle id="weeklySummary"  checked={notifs.weeklySummary}  onChange={() => toggleN('weeklySummary')}  label={t('settings.weeklySummary')} />} />
        <Row label={t('settings.focusSounds')}    desc={t('settings.focusSoundsDesc')}    control={<Toggle id="soundEffects"   checked={notifs.soundEffects}   onChange={() => toggleN('soundEffects')}   label={t('settings.focusSounds')} />} />
      </Section>

      {/* ── Privacy ── */}
      <Section icon="lock" title={t('settings.privacy')}>
        <Row label={t('settings.publicProfile')} desc={t('settings.publicProfileDesc')} control={<Toggle id="publicProfile" checked={privacy.publicProfile} onChange={() => toggleP('publicProfile')} label={t('settings.publicProfile')} />} />
        <Row label={t('settings.shareStats')}    desc={t('settings.shareStatsDesc')}    control={<Toggle id="shareStats"    checked={privacy.shareStats}    onChange={() => toggleP('shareStats')}    label={t('settings.shareStats')} />} />
        <Row
          label={t('settings.exportData')}
          desc={t('settings.exportDataDesc')}
          control={
            <button
              className={`set-action-btn${exportState === 'success' ? ' success' : exportState === 'error' ? ' error' : ''}`}
              onClick={handleExport}
              disabled={exportState === 'loading'}
              aria-live="polite"
            >
              {exportState === 'loading'
                ? <><Spinner />{t('settings.exporting')}</>
                : exportState === 'success'
                ? <><span className="material-symbols-outlined" aria-hidden="true">check_circle</span>{t('settings.exportSuccess')}</>
                : exportState === 'error'
                ? <><span className="material-symbols-outlined" aria-hidden="true">error</span>Error</>
                : <><span className="material-symbols-outlined" aria-hidden="true">download</span>{t('settings.exportData')}</>
              }
            </button>
          }
        />
      </Section>

      {/* ── Account ── */}
      <Section icon="manage_accounts" title={t('settings.account')}>
        <Row
          label={t('settings.profileSettings')}
          desc={t('settings.profileSettingsDesc')}
          control={
            <Link to="/profile" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              {t('common.open')}
            </Link>
          }
        />
        <Row
          label={t('common.signOut')}
          desc={t('settings.signOutDesc')}
          danger
          control={
            <button className="set-action-btn set-signout-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              {t('common.signOut')}
            </button>
          }
        />
      </Section>

      {/* ── Help & Support ── */}
      <Section icon="help" title={t('settings.help')}>
        <Row
          label={t('settings.helpCenter')}
          desc={t('settings.helpCenterDesc')}
          control={
            <button className="set-action-btn" onClick={() => alert('Help Center coming soon — documentation is being prepared.')}>
              <span className="material-symbols-outlined" aria-hidden="true">menu_book</span>
              {t('common.open')}
            </button>
          }
        />
        <Row
          label={t('settings.faq')}
          desc={t('settings.faqDesc')}
          control={
            <Link to="/faq" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">quiz</span>
              {t('common.open')}
            </Link>
          }
        />
        <Row
          label={t('settings.contactSupport')}
          desc={t('settings.contactSupportDesc')}
          control={
            <Link to="/contact" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              {t('common.open')}
            </Link>
          }
        />
        <Row
          label={t('settings.reportProblem')}
          desc={t('settings.reportProblemDesc')}
          control={
            <button
              className={`set-action-btn${reportState === 'success' ? ' success' : reportState === 'error' ? ' error' : ''}`}
              onClick={handleReport}
              disabled={reportState === 'loading'}
            >
              {reportState === 'loading'
                ? <Spinner />
                : <span className="material-symbols-outlined" aria-hidden="true">bug_report</span>}
              {reportState === 'loading' ? t('common.loading')
                : reportState === 'success' ? 'Sent!'
                : reportState === 'error'   ? 'Error'
                : t('common.open')}
            </button>
          }
        />
      </Section>

      {/* ── Upgrade banner ── */}
      <div className="set-upgrade">
        <div className="set-upgrade-text">
          <span className="chip set-upgrade-chip">Pro</span>
          <h3 className="set-upgrade-title">{t('settings.upgradeTitle')}</h3>
          <p className="set-upgrade-desc">{t('settings.upgradeDesc')}</p>
        </div>
        <Link to="/premium" className="btn set-upgrade-btn">
          <span className="material-symbols-outlined" aria-hidden="true">bolt</span>
          {t('common.upgrade')}
        </Link>
      </div>

    </PageShell>
  );
};

export default Settings;
