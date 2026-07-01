import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useTasks } from '../../context/TasksContext';
import { useAuth } from '../../context/AuthContext';
import { insertTimeLog, insertBreakLog } from '../../services/timeLogsService';
import Footer from '../../components/Footer/Footer';
import { useLocale } from '../../i18n/LocaleContext';
import { formatDuration } from '../../utils/dateFormat';
import './FocusMode.css';

const pad     = (n) => String(n).padStart(2, '0');
const fmtSecs = (s) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
const nowISO  = () => new Date().toISOString();

/*
 * TODO (Backend): On handleFinish, POST /api/sessions with sessionData ref contents:
 * {
 *   taskId, estimatedMinutes, actualMinutes, gap,
 *   startedAt, finishedAt,
 *   events: [{ type: 'start'|'pause'|'resume'|'finish', timestamp }]
 * }
 */

// ── Confirmation dialog ───────────────────────────────────────────────────────
function CancelDialog({ onConfirm, onKeepWorking, t }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onKeepWorking(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onKeepWorking]);

  return (
    <div className="fm-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="fm-dialog-title">
      <div className="fm-dialog-card">
        <div className="fm-dialog-icon" aria-hidden="true">
          <span className="material-symbols-outlined">timer_off</span>
        </div>
        <h2 id="fm-dialog-title" className="fm-dialog-title">{t('focus.cancelTitle')}</h2>
        <p className="fm-dialog-body">{t('focus.cancelBody')}</p>
        <div className="fm-dialog-actions">
          <button
            type="button"
            className="fm-btn fm-btn-discard"
            onClick={onConfirm}
            autoFocus
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
            {t('focus.cancelSession')}
          </button>
          <button
            type="button"
            className="fm-btn fm-btn-keep"
            onClick={onKeepWorking}
          >
            <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
            {t('focus.keepWorking')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FocusMode ─────────────────────────────────────────────────────────────────
const FocusMode = () => {
  const { id }                           = useParams();
  const { tasks, finishFocus, updateTask } = useTasks();
  const { t } = useLocale();
  const fmtMin = (m) => formatDuration(m, t);
  const { user }                         = useAuth();
  const navigate                         = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const prevStatusRef = useRef(task?.status ?? 'pending');

  // Timing refs for Supabase writes
  const startedAtRef  = useRef(null);   // ISO string set on first Start
  const pauseStartRef = useRef(null);   // ISO string set on Pause
  const breakEvents   = useRef([]);     // [{ stoppedAt, resumedAt }]

  const sessionData = useRef({
    taskId:            id,
    estimatedMinutes:  task?.estimatedMinutes ?? 0,
    startedAt:         null,
    finishedAt:        null,
    actualMinutes:     null,
    gap:               null,
    events:            [],
  });

  const [running,     setRunning]     = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [finished,    setFinished]    = useState(false);
  const [actualMin,   setActualMin]   = useState(0);
  const [showCancel,  setShowCancel]  = useState(false);
  const intervalRef = useRef(null);

  // Mark task in_progress on mount (if still pending)
  useEffect(() => {
    if (task && task.status === 'pending') {
      updateTask(id, { status: 'in_progress' });
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // Warn before leaving with an active session
  useEffect(() => {
    const handler = (e) => {
      if ((running || elapsed > 0) && !finished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [running, elapsed, finished]);

  // Space = start / pause
  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' && e.target === document.body && !showCancel) {
      e.preventDefault();
      if (!finished) toggleRunning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, showCancel, running]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const logEvent = (type) => {
    sessionData.current.events.push({ type, timestamp: nowISO() });
  };

  const toggleRunning = () => {
    if (finished || showCancel) return;
    if (!running) {
      if (elapsed === 0) {
        // First start
        const now = nowISO();
        startedAtRef.current          = now;
        sessionData.current.startedAt = now;
        logEvent('start');
        updateTask(id, { status: 'in_progress' });
      } else {
        // Resume from pause — record the break
        const resumedAt = nowISO();
        if (pauseStartRef.current) {
          const stoppedAt     = pauseStartRef.current;
          const breakDuration = Math.round(
            (new Date(resumedAt) - new Date(stoppedAt)) / 60000
          );
          breakEvents.current.push({ stoppedAt, resumedAt, breakDuration });
          pauseStartRef.current = null;
        }
        logEvent('resume');
      }
    } else {
      // Pausing — record when the pause started
      pauseStartRef.current = nowISO();
      logEvent('pause');
    }
    setRunning((r) => !r);
  };

  const handleFinish = async () => {
    clearInterval(intervalRef.current);
    setRunning(false);

    const endedAt  = nowISO();
    const mins     = Math.max(1, Math.round(elapsed / 60));
    const estMins  = task?.estimatedMinutes ?? 0;
    const gap      = mins - estMins;

    sessionData.current.finishedAt    = endedAt;
    sessionData.current.actualMinutes = mins;
    sessionData.current.gap           = gap;
    logEvent('finish');

    setActualMin(mins);
    // Optimistic local update + DB status → 'done'
    finishFocus(id, mins);
    setFinished(true);

    // Write time_log + break_logs to Supabase (best-effort; don't block UI)
    if (user && startedAtRef.current) {
      try {
        const timeLog = await insertTimeLog({
          taskId:            id,
          userId:            user.id,
          startedAt:         startedAtRef.current,
          endedAt,
          actualDuration:    mins,
          estimatedDuration: estMins,
          gap,
        });

        for (const brk of breakEvents.current) {
          await insertBreakLog({
            timeLogId:     timeLog.id,
            taskId:        id,
            userId:        user.id,
            stoppedAt:     brk.stoppedAt,
            resumedAt:     brk.resumedAt,
            breakDuration: brk.breakDuration,
          });
        }
      } catch (err) {
        console.error('[FocusMode] Failed to save time log:', err.message);
      }
    }
  };

  const handleCancelConfirm = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setShowCancel(false);
    // Restore previous status (session never happened)
    updateTask(id, { status: prevStatusRef.current });
    navigate('/focus-mode');
  };

  const handleBack = () => {
    if (elapsed === 0) {
      navigate('/focus-mode');
    } else {
      setRunning(false);
      setShowCancel(true);
    }
  };

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!task) {
    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main id="main-content" className="focus-mode-main fm-center">
          <div className="fm-error-card">
            <span className="material-symbols-outlined fm-error-icon" aria-hidden="true">search_off</span>
            <h2>{t('focus.notFoundTitle')}</h2>
            <p>{t('focus.notFoundMsg')}</p>
            <Link to="/dashboard" className="btn btn-primary">{t('taskDetails.notFound.btn')}</Link>
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
  const overSecs      = Math.max(elapsed - estimatedSecs, 0);
  const overMins      = Math.round(overSecs / 60);

  // SVG ring
  const R    = 90;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progress);

  // ── Summary ───────────────────────────────────────────────────────────────
  if (finished) {
    const gap = actualMin - task.estimatedMinutes;
    const insight =
      gap === 0 ? t('focus.perfectEst') :
      gap > 0   ? t('focus.wentOver').replace('{n}', gap) :
                  t('focus.finishedEarly').replace('{n}', Math.abs(gap));

    return (
      <div className="focus-mode-layout">
        <Navbar />
        <main id="main-content" className="focus-mode-main fm-center">
          <div className="fm-summary">
            <div className={`fm-summary-icon-wrap ${gap > 0 ? 'over' : 'done'}`} aria-hidden="true">
              <span className="material-symbols-outlined">{gap > 0 ? 'timer_off' : 'task_alt'}</span>
            </div>
            <h2 className="fm-summary-title">{t('focus.sessionComplete')}</h2>
            <p className="fm-summary-task">{task.title}</p>

            <div className="fm-summary-stats">
              <div className="fm-stat">
                <span className="fm-stat-val">{fmtMin(task.estimatedMinutes)}</span>
                <span className="fm-stat-key">{t('focus.planned')}</span>
              </div>
              <div className="fm-stat-divider" aria-hidden="true" />
              <div className="fm-stat">
                <span className="fm-stat-val">{fmtMin(actualMin)}</span>
                <span className="fm-stat-key">{t('stats.actual')}</span>
              </div>
              <div className="fm-stat-divider" aria-hidden="true" />
              <div className="fm-stat">
                <span className={`fm-stat-val ${gap > 0 ? 'over' : 'under'}`}>
                  {gap > 0 ? `+${fmtMin(gap)}` : gap < 0 ? `-${fmtMin(Math.abs(gap))}` : fmtMin(gap)}
                </span>
                <span className="fm-stat-key">{t('stats.gap')}</span>
              </div>
            </div>

            <p className="fm-summary-insight">{insight}</p>

            <div className="fm-summary-actions">
              <Link to="/dashboard" className="btn btn-secondary">
                <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
                {t('focus.dashboard')}
              </Link>
              <Link to="/insights" className="btn btn-primary">
                <span className="material-symbols-outlined" aria-hidden="true">insights</span>
                {t('focus.viewInsights')}
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Active session ─────────────────────────────────────────────────────────
  return (
    <div className="focus-mode-layout">
      <Navbar />
      <main id="main-content" className="focus-mode-main">

        {/* Back navigation */}
        <button
          type="button"
          className="fm-back-btn"
          onClick={handleBack}
          aria-label={t('focus.backToTasks')}
        >
          <span className="material-symbols-outlined flip-rtl" aria-hidden="true">arrow_back</span>
          {t('focus.backToTasks')}
        </button>

        {/* Task info banner */}
        <div className="focus-bento-card fm-task-banner">
          <div className="fm-task-banner-left">
            <span className="fm-now-label">{t('focus.nowFocusing')}</span>
            <h2 className="fm-task-title">{task.title}</h2>
            {task.description && <p className="fm-task-desc">{task.description}</p>}
          </div>
          <div className="fm-task-banner-right">
            {task.priorityHigh && (
              <span className="chip chip-priority">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">flag</span>
                {t('focus.highPriority')}
              </span>
            )}
            <div className="fm-est-badge">
              <span className="material-symbols-outlined" aria-hidden="true">hourglass_top</span>
              {fmtMin(task.estimatedMinutes)} {t('focus.goal')}
            </div>
          </div>
        </div>

        {/* Timer ring */}
        <div className="fm-timer-wrap">
          <svg
            className="fm-timer-svg"
            viewBox="0 0 200 200"
            aria-label={t('focus.ariaTimer').replace('{time}', fmtSecs(elapsed))}
            role="img"
          >
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-surface-container)" strokeWidth="10" />
            <circle
              cx="100" cy="100" r={R}
              fill="none"
              stroke={isOver ? 'var(--fm-over-color, #c2610c)' : 'url(#timerGrad)'}
              strokeWidth="10"
              strokeDasharray={circ}
              strokeDashoffset={isOver ? 0 : dashOffset}
              strokeLinecap="round"
              className={isOver ? 'fm-ring-over' : ''}
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
            <span className={`fm-elapsed${isOver ? ' over' : ''}`} aria-live="off" dir="ltr">
              {fmtSecs(elapsed)}
            </span>
            <span className="fm-timer-status">
              {running ? t('focus.statusFocusing') : elapsed === 0 ? t('focus.statusReady') : t('focus.statusPaused')}
            </span>
            <span className="fm-remaining" aria-live="off" dir="ltr">
              {isOver
                ? t('focus.elapsed').replace('{time}', fmtSecs(overSecs))
                : t('focus.left').replace('{time}', fmtSecs(remaining))}
            </span>
          </div>
        </div>

        {/* Over-estimate banner — shown only when over */}
        {isOver && (
          <div className="fm-over-banner" role="status" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">trending_up</span>
            <span>
              <strong dir="ltr">‎+{overMins > 0 ? fmtMin(overMins) : t('focus.lessThan1Min')}</strong> {t('focus.overBannerSuffix')}
            </span>
          </div>
        )}

        {/* Progress bar (shown once started) */}
        {elapsed > 0 && (
          <div className="fm-gap-bar-wrap">
            <span className="fm-gap-bar-label">
              {isOver ? t('focus.overEstimate') : t('focus.progressEst')}
            </span>
            <div
              className="fm-gap-bar-track"
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('focus.ariaProgress')}
            >
              <div
                className={`fm-gap-bar-fill${isOver ? ' over' : ''}`}
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <span className="fm-gap-bar-pct" aria-hidden="true">
              {Math.min(Math.round(progress * 100), 100)}%
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="fm-controls">
          <div className="fm-controls-primary">
            {!running ? (
              <button
                className="fm-btn fm-btn-start"
                onClick={toggleRunning}
                aria-label={elapsed === 0 ? t('focus.ariaStart') : t('focus.ariaResume')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
                {elapsed === 0 ? t('focus.start') : t('focus.resume')}
              </button>
            ) : (
              <button
                className="fm-btn fm-btn-pause"
                onClick={toggleRunning}
                aria-label={t('focus.ariaPause')}
              >
                <span className="material-symbols-outlined" aria-hidden="true">pause</span>
                {t('focus.pause')}
              </button>
            )}
            <button
              className="fm-btn fm-btn-finish"
              onClick={handleFinish}
              disabled={elapsed === 0}
              aria-label={t('focus.ariaFinish')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">check</span>
              {t('focus.finish')}
            </button>
          </div>

          {elapsed > 0 && (
            <button
              className="fm-btn-cancel-link"
              type="button"
              onClick={() => { setRunning(false); setShowCancel(true); }}
              aria-label={t('focus.ariaCancel')}
            >
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
              {t('focus.discardSession')}
            </button>
          )}
        </div>

        <p className="fm-kbd-hint" aria-hidden="true">
          <kbd>Space</kbd> {t('focus.kbdHint')}
        </p>

      </main>
      <Footer />

      {/* Cancel confirmation dialog */}
      {showCancel && (
        <CancelDialog
          onConfirm={handleCancelConfirm}
          onKeepWorking={() => setShowCancel(false)}
          t={t}
        />
      )}
    </div>
  );
};

export default FocusMode;
