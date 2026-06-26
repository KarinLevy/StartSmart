import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import './Insights.css';
import '../../components/Statistics/Statistics.css';

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const GapBar = ({ gap, max }) => {
  const pct = Math.min(Math.abs(gap) / max, 1) * 100;
  const over = gap > 0;
  return (
    <div className="gap-bar-track" aria-hidden="true">
      <div
        className={`gap-bar-fill${over ? ' over' : ' under'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const ScoreMeter = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 85 ? 'var(--color-success)' : score >= 65 ? 'var(--color-secondary)' : 'var(--color-error)';
  return (
    <svg width="130" height="130" aria-label={`Productivity score ${score}%`}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="var(--color-surface-container)" strokeWidth="10" />
      <circle
        cx="65" cy="65" r={r}
        fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '65px 65px', transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="65" y="60" textAnchor="middle" fill="var(--color-on-surface)" fontSize="22" fontWeight="800">{score}%</text>
      <text x="65" y="78" textAnchor="middle" fill="var(--color-on-surface-variant)" fontSize="11" fontWeight="600">SCORE</text>
    </svg>
  );
};

const Insights = () => {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.status === 'done' && t.estimatedMinutes && t.actualMinutes);

  // ── derived metrics ──
  const totalEst = done.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalAct = done.reduce((s, t) => s + t.actualMinutes, 0);
  const accuracy = done.length > 0 ? Math.min(Math.round((totalEst / totalAct) * 100), 100) : null;
  const avgGap   = done.length > 0 ? Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length) : null;

  const sorted = [...done].sort((a, b) => (a.gap || 0) - (b.gap || 0));
  const bestTask  = sorted[0]  || null;
  const worstTask = sorted[sorted.length - 1] || null;

  const maxAbsGap = done.length > 0 ? Math.max(...done.map((t) => Math.abs(t.gap || 0)), 1) : 1;

  const overCount  = done.filter((t) => (t.gap || 0) > 0).length;
  const underCount = done.filter((t) => (t.gap || 0) < 0).length;
  const onTarget   = done.length - overCount - underCount;

  // productivity score = weighted combination of accuracy + on-time ratio
  const onTimeRatio = done.length > 0 ? (onTarget + underCount) / done.length : 0;
  const score = done.length > 0
    ? Math.round(((accuracy || 0) * 0.6 + onTimeRatio * 100 * 0.4))
    : null;

  const RECS = [];
  if (avgGap !== null && avgGap > 10)  RECS.push({ icon: 'add_circle', text: 'Add a 10–15 min buffer when estimating complex tasks.' });
  if (avgGap !== null && avgGap < -10) RECS.push({ icon: 'remove_circle', text: 'You finish early consistently — try assigning tighter estimates.' });
  if (overCount > underCount)          RECS.push({ icon: 'schedule', text: 'Most tasks run over. Break large tasks into sub-tasks.' });
  if (done.length < 3)                 RECS.push({ icon: 'timer', text: 'Complete more tasks with Focus Mode to get richer insights.' });
  if (RECS.length === 0)               RECS.push({ icon: 'star', text: 'Great work! Your estimations are accurate and consistent.' });

  return (
    <div className="insights-layout">
      <Navbar />
      <main id="main-content" className="insights-main">
        {/* Header */}
        <div className="ins-header">
          <div>
            <Link to="/statistics" className="ins-back">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Statistics
            </Link>
            <h1 className="ins-title">All Insights</h1>
            <p className="ins-subtitle">Deep-dive into your productivity patterns and estimation accuracy.</p>
          </div>
        </div>

        {done.length === 0 ? (
          <div className="ins-empty">
            <span className="material-symbols-outlined ins-empty-icon" aria-hidden="true">insights</span>
            <h3>No data yet</h3>
            <p>Complete tasks using Focus Mode to unlock personalised insights.</p>
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
          </div>
        ) : (
          <div className="ins-grid">
            {/* Score card */}
            <div className="ins-card ins-card-score">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
                Productivity Score
              </div>
              <div className="ins-score-row">
                <ScoreMeter score={score} />
                <div className="ins-score-breakdown">
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{accuracy}%</span>
                    <span className="ins-score-key">Estimation accuracy</span>
                  </div>
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{Math.round(onTimeRatio * 100)}%</span>
                    <span className="ins-score-key">On-time or early</span>
                  </div>
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{done.length}</span>
                    <span className="ins-score-key">Tasks analysed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gap distribution */}
            <div className="ins-card ins-card-dist">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">bar_chart</span>
                Gap Distribution
              </div>
              <div className="ins-dist-row">
                <div className="ins-dist-item over">
                  <span className="ins-dist-count">{overCount}</span>
                  <span className="ins-dist-label">Over estimate</span>
                </div>
                <div className="ins-dist-item on">
                  <span className="ins-dist-count">{onTarget}</span>
                  <span className="ins-dist-label">On target</span>
                </div>
                <div className="ins-dist-item under">
                  <span className="ins-dist-count">{underCount}</span>
                  <span className="ins-dist-label">Under estimate</span>
                </div>
              </div>
              <div className="ins-dist-bar-track" role="img" aria-label={`${overCount} over, ${onTarget} on target, ${underCount} under`}>
                {done.length > 0 && (
                  <>
                    <div className="ins-dist-seg over"  style={{ width: `${(overCount  / done.length) * 100}%` }} />
                    <div className="ins-dist-seg on"    style={{ width: `${(onTarget   / done.length) * 100}%` }} />
                    <div className="ins-dist-seg under" style={{ width: `${(underCount / done.length) * 100}%` }} />
                  </>
                )}
              </div>
            </div>

            {/* Best / worst task */}
            {bestTask && (
              <div className="ins-card ins-card-best">
                <div className="ins-card-label">
                  <span className="material-symbols-outlined" aria-hidden="true">thumb_up</span>
                  Best Estimation
                </div>
                <Link to={`/task-details/${bestTask.id}`} className="ins-task-link">
                  <span className="ins-task-title">{bestTask.title}</span>
                  <span className="ins-task-gap under">{bestTask.gap <= 0 ? `${bestTask.gap}m` : `+${bestTask.gap}m`}</span>
                </Link>
                <p className="ins-task-sub">
                  Estimated {fmtMin(bestTask.estimatedMinutes)}, actual {fmtMin(bestTask.actualMinutes)}
                </p>
              </div>
            )}
            {worstTask && worstTask.id !== bestTask?.id && (
              <div className="ins-card ins-card-worst">
                <div className="ins-card-label">
                  <span className="material-symbols-outlined" aria-hidden="true">thumb_down</span>
                  Biggest Overrun
                </div>
                <Link to={`/task-details/${worstTask.id}`} className="ins-task-link">
                  <span className="ins-task-title">{worstTask.title}</span>
                  <span className="ins-task-gap over">+{worstTask.gap}m</span>
                </Link>
                <p className="ins-task-sub">
                  Estimated {fmtMin(worstTask.estimatedMinutes)}, actual {fmtMin(worstTask.actualMinutes)}
                </p>
              </div>
            )}

            {/* Per-task gap bars */}
            <div className="ins-card ins-card-bars">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">align_horizontal_left</span>
                Gap per Task
              </div>
              <div className="ins-bar-list">
                {done.map((t) => (
                  <div key={t.id} className="ins-bar-row">
                    <span className="ins-bar-name">{t.title.length > 22 ? t.title.slice(0, 21) + '…' : t.title}</span>
                    <GapBar gap={t.gap || 0} max={maxAbsGap} />
                    <span className={`ins-bar-val${(t.gap || 0) > 0 ? ' over' : ' under'}`}>
                      {(t.gap || 0) > 0 ? `+${t.gap}m` : `${t.gap}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="ins-card ins-card-recs">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">tips_and_updates</span>
                Recommendations
              </div>
              <ul className="ins-rec-list">
                {RECS.map((r, i) => (
                  <li key={i} className="ins-rec-item">
                    <div className="ins-rec-icon">
                      <span className="material-symbols-outlined" aria-hidden="true">{r.icon}</span>
                    </div>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
