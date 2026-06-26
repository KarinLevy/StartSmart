import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import EnvironmentCard from '../../components/FocusMode/EnvironmentCard';
import { useTasks } from '../../context/TasksContext';
import '../../components/FocusMode/FocusMode.css';
import Footer from '../../components/Footer/Footer';
import './FocusModeOverride.css';

const pad = (n) => String(n).padStart(2, '0');
const fmtSecs = (s) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

const FocusMode = () => {
  const { id } = useParams();
  const { tasks, finishFocus, updateTask } = useTasks();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [actualMin, setActualMin] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (task && task.status === 'pending') {
      updateTask(id, { status: 'in_progress' });
    }
  }, [id]);

  if (!task) {
    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main className="focus-mode-main">
          <p style={{ color: 'var(--color-on-surface-variant)' }}>Task not found.</p>
          <Link to="/dashboard" className="btn btn-secondary">&#8592; Dashboard</Link>
        </main>
      </div>
    );
  }

  const estimatedSecs = task.estimatedMinutes * 60;
  const progress = Math.min(elapsed / estimatedSecs, 1);
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - progress);

  const handleFinish = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const mins = Math.max(1, Math.round(elapsed / 60));
    setActualMin(mins);
    finishFocus(id, mins);
    setFinished(true);
  };

  if (finished) {
    const gap = actualMin - task.estimatedMinutes;
    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main className="focus-mode-main">
          <div className="focus-bento-card focus-summary-card">
            <span className="material-symbols-outlined focus-summary-icon">task_alt</span>
            <h2 className="focus-summary-title">Session Complete!</h2>
            <p className="focus-summary-task">{task.title}</p>
            <div className="focus-summary-stats">
              <div className="focus-stat">
                <span className="focus-stat-label">Estimated</span>
                <span className="focus-stat-value">{task.estimatedMinutes}m</span>
              </div>
              <div className="focus-stat">
                <span className="focus-stat-label">Actual</span>
                <span className="focus-stat-value">{actualMin}m</span>
              </div>
              <div className="focus-stat">
                <span className="focus-stat-label">Gap</span>
                <span className={`focus-stat-value ${gap > 0 ? 'gap-over' : 'gap-under'}`}>
                  {gap > 0 ? `+${gap}m` : `${gap}m`}
                </span>
              </div>
            </div>
            <p className="focus-summary-insight">
              {gap === 0
                ? 'Perfect estimate — you nailed it!'
                : gap > 0
                ? `You went over by ${gap} minute${gap !== 1 ? 's' : ''}. Try adding a buffer next time.`
                : `You finished ${Math.abs(gap)} minute${Math.abs(gap) !== 1 ? 's' : ''} early — great pacing!`}
            </p>
            <Link to="/dashboard" className="btn btn-primary focus-summary-btn">
              <span className="material-symbols-outlined">dashboard</span>
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="focus-mode-layout">
      <Navbar />
      <main className="focus-mode-main">

        <div className="focus-bento-card focus-task-card">
          <div className="focus-task-header">
            <div>
              <span className="focus-task-subtitle">Now Focusing</span>
              <h2 className="focus-task-title">{task.title}</h2>
            </div>
            {task.priorityHigh && (
              <span className="chip chip-priority" style={{ alignSelf: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>flag</span>
                High Priority
              </span>
            )}
          </div>
          {task.description && <p className="focus-task-desc">{task.description}</p>}
          <div className="focus-task-meta">
            <span className="focus-task-meta-item">
              <span className="material-symbols-outlined">hourglass_top</span>
              Estimated: {task.estimatedMinutes}m
            </span>
          </div>
        </div>

        <div className="focus-timer-container">
          <div className="focus-timer-wrapper">
            <svg className="focus-timer-svg" viewBox="0 0 100 100">
              <circle className="timer-track" cx="50" cy="50" r="42" fill="transparent" strokeWidth="6" />
              <circle
                className="timer-progress"
                cx="50" cy="50" r="42"
                fill="transparent"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>
            <div className="focus-timer-inner">
              <span className="focus-timer-time">{fmtSecs(elapsed)}</span>
              <p className="focus-timer-status">{running ? 'Focusing…' : elapsed === 0 ? 'Ready' : 'Paused'}</p>
              <div className="focus-timer-pomodoro">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
                <span className="focus-timer-pomodoro-text">{task.estimatedMinutes}m goal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="focus-controls-container">
          {!running ? (
            <button className="primary-gradient motivational-glow focus-ctrl-btn" onClick={() => setRunning(true)}>
              <span className="material-symbols-outlined">play_arrow</span>
              {elapsed === 0 ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button className="focus-ctrl-btn focus-ctrl-stop" onClick={() => setRunning(false)}>
              <span className="material-symbols-outlined">pause</span>
              Pause
            </button>
          )}
          <button className="focus-ctrl-btn focus-ctrl-finish" onClick={handleFinish} disabled={elapsed === 0}>
            <span className="material-symbols-outlined">check</span>
            Finish
          </button>
        </div>

        <div className="focus-env-grid">
          <EnvironmentCard icon="music_note" title="Lo-fi Chill" description="Ambient workspace audio is currently active." />
          <EnvironmentCard icon="notifications_off" title="DND Active" description="All notifications silenced for this session." active={true} />
          <EnvironmentCard icon="analytics" title="Efficiency" description="You are on track with your daily focus goal." />
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default FocusMode;
