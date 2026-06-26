import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useTasks } from '../../context/TasksContext';
import '../../components/FocusMode/FocusMode.css';
import Footer from '../../components/Footer/Footer';
import './FocusMode.css';

const pad = (n) => String(n).padStart(2, '0');
const fmtSecs = (s) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
const fmtMin  = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m}m`);

const FocusMode = () => {
  const { id }       = useParams();
  const { tasks, finishFocus, updateTask } = useTasks();
  const navigate     = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [running,  setRunning]  = useState(false);
  const [elapsed,  setElapsed]  = useState(0);
  const [finished, setFinished] = useState(false);
  const [actualMin, setActualMin] = useState(0);
  const intervalRef = useRef(null);

  // Start task in_progress on mount
  useEffect(() => {
    if (task && task.status === 'pending') {
      updateTask(id, { status: 'in_progress' });
    }
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Spacebar shortcut to start/pause
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault();
      if (!finished) setRunning((r) => !r);
    }
  }, [finished]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Not found
  if (!task) {
    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main className="focus-mode-main fm-center">
          <div className="fm-error-card">
            <span className="material-symbols-outlined fm-error-icon" aria-hidden="true">search_off</span>
            <h2>Task not found</h2>
            <p>This task may have been deleted.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estimatedSecs = (task.estimatedMinutes || 1) * 60;
  const progress      = Math.min(elapsed / estimatedSecs, 1);
  const remaining     = Math.max(estimatedSecs - elapsed, 0);
  const isOver        = elapsed > estimatedSecs;
  const overSecs      = elapsed - estimatedSecs;

  // SVG circle
  const R    = 90;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progress);

  const handleFinish = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const mins = Math.max(1, Math.round(elapsed / 60));
    setActualMin(mins);
    finishFocus(id, mins);
    setFinished(true);
  };

  // ── Summary screen ─────────────────────────────────────────────────────────
  if (finished) {
    const gap = actualMin - task.estimatedMinutes;
    const insight =
      gap === 0 ? 'Perfect estimate — you nailed it!' :
      gap > 0   ? `You went over by ${gap} minute${gap !== 1 ? 's' : ''}. Consider adding a buffer next time.` :
                  `You finished ${Math.abs(gap)} minute${Math.abs(gap) !== 1 ? 's' : ''} early — great pacing!`;

    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main className="focus-mode-main fm-center">
          <div className="fm-summary">
            <div className={`fm-summary-icon-wrap ${gap > 0 ? 'over' : 'done'}`} aria-hidden="true">
              <span className="material-symbols-outlined">{gap > 0 ? 'timer_off' : 'task_alt'}</span>
            </div>
            <h2 className="fm-summary-title">Session complete!</h2>
            <p className="fm-summary-task">{task.title}</p>

            <div className="fm-summary-stats">
              <div className="fm-stat">
                <span className="fm-stat-val">{fmtMin(task.estimatedMinutes)}</span>
                <span className="fm-stat-key">Planned</span>
              </div>
              <div className="fm-stat-divider" aria-hidden="true" />
              <div className="fm-stat">
                <span className="fm-stat-val">{fmtMin(actualMin)}</span>
                <span className="fm-stat-key">Actual</span>
              </div>
              <div className="fm-stat-divider" aria-hidden="true" />
              <div className="fm-stat">
                <span className={`fm-stat-val ${gap > 0 ? 'over' : 'under'}`}>
                  {gap > 0 ? `+${gap}m` : `${gap}m`}
                </span>
                <span className="fm-stat-key">Gap</span>
              </div>
            </div>

            <p className="fm-summary-insight">{insight}</p>

            <div className="fm-summary-actions">
              <Link to="/dashboard" className="btn btn-secondary">
                <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
                Dashboard
              </Link>
              <Link to="/insights" className="btn btn-primary">
                <span className="material-symbols-outlined" aria-hidden="true">insights</span>
                View insights
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Active session ──────────────────────────────────────────────────────────
  return (
    <div className="focus-mode-layout">
      <Navbar />
      <main className="focus-mode-main">

        {/* Task info banner */}
        <div className="focus-bento-card fm-task-banner">
          <div className="fm-task-banner-left">
            <span className="fm-now-label">Now focusing</span>
            <h2 className="fm-task-title">{task.title}</h2>
            {task.description && <p className="fm-task-desc">{task.description}</p>}
          </div>
          <div className="fm-task-banner-right">
            {task.priorityHigh && (
              <span className="chip chip-priority">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">flag</span>
                High priority
              </span>
            )}
            <div className="fm-est-badge">
              <span className="material-symbols-outlined" aria-hidden="true">hourglass_top</span>
              {fmtMin(task.estimatedMinutes)} goal
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="fm-timer-wrap">
          <svg
            className="fm-timer-svg"
            viewBox="0 0 200 200"
            aria-label={`Focus timer: ${fmtSecs(elapsed)} elapsed`}
            role="img"
          >
            {/* Track */}
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-surface-container)" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              stroke={isOver ? 'var(--color-error)' : 'url(#timerGrad)'}
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 0.5s linear' }}
            />
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="fm-timer-inner">
            <span className={`fm-elapsed${isOver ? ' over' : ''}`}>{fmtSecs(elapsed)}</span>
            <span className="fm-timer-status">
              {running ? 'Focusing…' : elapsed === 0 ? 'Ready' : 'Paused'}
            </span>
            <span className="fm-remaining">
              {isOver
                ? `+${fmtSecs(overSecs)} over`
                : `${fmtSecs(remaining)} left`}
            </span>
          </div>
        </div>

        {/* Live gap bar (visible once running) */}
        {elapsed > 0 && (
          <div className="fm-gap-bar-wrap">
            <span className="fm-gap-bar-label">Progress toward estimate</span>
            <div className="fm-gap-bar-track" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`fm-gap-bar-fill${isOver ? ' over' : ''}`}
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <span className="fm-gap-bar-pct">{Math.min(Math.round(progress * 100), 100)}%</span>
          </div>
        )}

        {/* Controls */}
        <div className="fm-controls">
          {!running ? (
            <button
              className="fm-btn fm-btn-start"
              onClick={() => setRunning(true)}
              aria-label={elapsed === 0 ? 'Start timer' : 'Resume timer'}
            >
              <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
              {elapsed === 0 ? 'Start' : 'Resume'}
            </button>
          ) : (
            <button
              className="fm-btn fm-btn-pause"
              onClick={() => setRunning(false)}
              aria-label="Pause timer"
            >
              <span className="material-symbols-outlined" aria-hidden="true">pause</span>
              Pause
            </button>
          )}
          <button
            className="fm-btn fm-btn-finish"
            onClick={handleFinish}
            disabled={elapsed === 0}
            aria-label="Finish session"
          >
            <span className="material-symbols-outlined" aria-hidden="true">check</span>
            Finish
          </button>
        </div>

        <p className="fm-kbd-hint" aria-hidden="true">
          <kbd>Space</kbd> to start / pause
        </p>

      </main>
      <Footer />
    </div>
  );
};

export default FocusMode;
