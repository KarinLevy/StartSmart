import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import './Settings.css';

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

const Settings = () => {
  const { theme } = useTheme();

  const [notifs, setNotifs] = useState({
    taskReminders: true,
    timeGapAlerts: true,
    weeklySummary: false,
    soundEffects: true,
    focusEndAlert: true,
  });
  const [focus, setFocus] = useState({
    autoStartBreak: false,
    showGapLive: true,
    confirmFinish: true,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareStats: false,
  });
  const [goal, setGoal] = useState('4');
  const [defaultEst, setDefaultEst] = useState('30');
  const [language, setLanguage] = useState('en');

  const toggleN = (k) => setNotifs((p) => ({ ...p, [k]: !p[k] }));
  const toggleF = (k) => setFocus((p) => ({ ...p, [k]: !p[k] }));
  const toggleP = (k) => setPrivacy((p) => ({ ...p, [k]: !p[k] }));

  return (
    <PageShell narrow title="Settings" subtitle="Tune StartSmart to fit how you work.">

      {/* Appearance */}
      <Section icon="palette" title="Appearance">
        <Row
          label="Theme"
          desc={`Currently using ${theme === 'dark' ? 'dark' : 'light'} mode. Your preference is saved automatically.`}
          control={<ThemeToggle />}
        />
        <Row
          label="Language"
          desc="Interface language for labels and messages."
          control={
            <select className="set-select" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language">
              <option value="en">English</option>
              <option value="he">Hebrew</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          }
        />
      </Section>

      {/* Focus & planning */}
      <Section icon="timer" title="Focus & planning">
        <Row
          label="Daily focus goal"
          desc="Target focus time used for the daily progress ring."
          control={
            <select className="set-select" value={goal} onChange={(e) => setGoal(e.target.value)} aria-label="Daily focus goal">
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours</option>
            </select>
          }
        />
        <Row
          label="Default task estimate"
          desc="Pre-filled estimate when creating a new task."
          control={
            <select className="set-select" value={defaultEst} onChange={(e) => setDefaultEst(e.target.value)} aria-label="Default estimate">
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          }
        />
        <Row label="Show live gap during focus" desc="Display the running gap counter while the timer is active." control={<Toggle id="showGapLive" checked={focus.showGapLive} onChange={() => toggleF('showGapLive')} label="Show live gap during focus" />} />
        <Row label="Auto-start break timer" desc="Automatically begin a 5-min break when a focus session ends." control={<Toggle id="autoStartBreak" checked={focus.autoStartBreak} onChange={() => toggleF('autoStartBreak')} label="Auto-start break timer" />} />
        <Row label="Confirm before finishing" desc="Show a confirmation dialog before logging actual time." control={<Toggle id="confirmFinish" checked={focus.confirmFinish} onChange={() => toggleF('confirmFinish')} label="Confirm before finishing" />} />
      </Section>

      {/* Notifications */}
      <Section icon="notifications" title="Notifications">
        <Row label="Task reminders"    desc="Get a nudge before a scheduled task begins."            control={<Toggle id="taskReminders" checked={notifs.taskReminders} onChange={() => toggleN('taskReminders')} label="Task reminders" />} />
        <Row label="Time-gap alerts"   desc="Be notified when you run over an estimate."             control={<Toggle id="timeGapAlerts" checked={notifs.timeGapAlerts} onChange={() => toggleN('timeGapAlerts')} label="Time-gap alerts" />} />
        <Row label="Focus end alert"   desc="Play a sound or notification when the timer finishes."  control={<Toggle id="focusEndAlert"  checked={notifs.focusEndAlert}  onChange={() => toggleN('focusEndAlert')}  label="Focus end alert" />} />
        <Row label="Weekly summary"    desc="A recap of your productivity every Sunday."             control={<Toggle id="weeklySummary"  checked={notifs.weeklySummary}  onChange={() => toggleN('weeklySummary')}  label="Weekly summary" />} />
        <Row label="Focus sounds"      desc="Play ambient audio during Focus Mode."                  control={<Toggle id="soundEffects"   checked={notifs.soundEffects}   onChange={() => toggleN('soundEffects')}   label="Focus sounds" />} />
      </Section>

      {/* Privacy */}
      <Section icon="lock" title="Privacy">
        <Row label="Public profile"  desc="Let other StartSmart users view your profile."            control={<Toggle id="publicProfile" checked={privacy.publicProfile} onChange={() => toggleP('publicProfile')} label="Public profile" />} />
        <Row label="Share statistics" desc="Contribute anonymised usage data to improve StartSmart." control={<Toggle id="shareStats"    checked={privacy.shareStats}    onChange={() => toggleP('shareStats')}    label="Share statistics" />} />
        <Row
          label="Export my data"
          desc="Download all your tasks and focus session history as JSON."
          control={
            <button className="set-action-btn" onClick={() => alert('Export coming soon!')}>
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
              Export
            </button>
          }
        />
      </Section>

      {/* Account */}
      <Section icon="manage_accounts" title="Account">
        <Row
          label="Profile settings"
          desc="Update your name, avatar, email, and bio."
          control={
            <Link to="/profile" className="set-action-btn">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              Open
            </Link>
          }
        />
        <Row
          label="Sign out"
          desc="Sign out of your account on this device."
          control={
            <button className="set-action-btn" onClick={() => alert('Sign out coming soon!')}>
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
              Sign out
            </button>
          }
        />
      </Section>

      {/* Upgrade banner */}
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
          Upgrade to Pro
        </Link>
      </div>

    </PageShell>
  );
};

export default Settings;
