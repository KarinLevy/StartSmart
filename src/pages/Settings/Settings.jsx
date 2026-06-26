import React, { useState } from 'react';
import PageShell from '../../components/PageShell/PageShell';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import './Settings.css';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    className={`set-toggle ${checked ? 'on' : ''}`}
    role="switch"
    aria-checked={checked}
    onClick={onChange}
  >
    <span className="set-toggle-knob" />
  </button>
);

const Settings = () => {
  const { theme } = useTheme();
  const [prefs, setPrefs] = useState({
    taskReminders: true,
    timeGapAlerts: true,
    weeklySummary: false,
    soundEffects: true,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const rows = [
    { key: 'taskReminders', label: 'Task reminders', desc: 'Get a nudge before a scheduled task begins.' },
    { key: 'timeGapAlerts', label: 'Time-gap alerts', desc: 'Be notified when you run over an estimate.' },
    { key: 'weeklySummary', label: 'Weekly summary email', desc: 'A recap of your productivity every Sunday.' },
    { key: 'soundEffects', label: 'Focus sounds', desc: 'Play ambient audio during Focus Mode.' },
  ];

  return (
    <PageShell narrow title="Settings" subtitle="Tune StartSmart to fit how you work.">

      {/* Appearance */}
      <div className="surface-card set-section">
        <h3 className="set-section-title">
          <span className="material-symbols-outlined">palette</span>
          Appearance
        </h3>
        <div className="set-row">
          <div className="set-row-text">
            <span className="set-row-label">Theme</span>
            <span className="set-row-desc">
              Currently using <strong>{theme === 'dark' ? 'dark' : 'light'}</strong> mode.
              Your preference is saved automatically.
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Notifications & preferences */}
      <div className="surface-card set-section">
        <h3 className="set-section-title">
          <span className="material-symbols-outlined">notifications</span>
          Notifications &amp; preferences
        </h3>
        <div className="set-rows">
          {rows.map((row) => (
            <div className="set-row" key={row.key}>
              <div className="set-row-text">
                <span className="set-row-label">{row.label}</span>
                <span className="set-row-desc">{row.desc}</span>
              </div>
              <Toggle checked={prefs[row.key]} onChange={() => toggle(row.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Daily goal */}
      <div className="surface-card set-section">
        <h3 className="set-section-title">
          <span className="material-symbols-outlined">target</span>
          Daily focus goal
        </h3>
        <div className="set-row">
          <div className="set-row-text">
            <span className="set-row-label">Target focus time per day</span>
            <span className="set-row-desc">Used to measure your daily progress ring.</span>
          </div>
          <select className="set-select" defaultValue="4">
            <option value="2">2 hours</option>
            <option value="4">4 hours</option>
            <option value="6">6 hours</option>
            <option value="8">8 hours</option>
          </select>
        </div>
      </div>

      {/* Upgrade */}
      <div className="set-upgrade">
        <div className="set-upgrade-text">
          <span className="chip set-upgrade-chip">Pro</span>
          <h3 className="set-upgrade-title">Unlock smart recommendations</h3>
          <p className="set-upgrade-desc">
            Upgrade to StartSmart Pro for AI-powered time insights, advanced analytics,
            and personalized planning suggestions.
          </p>
        </div>
        <button className="btn set-upgrade-btn">
          <span className="material-symbols-outlined">bolt</span>
          Upgrade to Pro
        </button>
      </div>
    </PageShell>
  );
};

export default Settings;
