import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import './Insights.css';
import '../../components/Statistics/Statistics.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── Sub-components ────────────────────────────────────────────────────────────

const GapBar = ({ gap, max }) => {
  const pct = Math.min(Math.abs(gap) / Math.max(max, 1), 1) * 100;
  const over = gap > 0;
  return (
    <div className="gap-bar-track" aria-hidden="true">
      <div className={`gap-bar-fill${over ? ' over' : ' under'}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const ScoreMeter = ({ score }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 85 ? 'var(--color-success)' : score >= 65 ? 'var(--color-secondary)' : 'var(--color-error)';
  return (
    <svg width="130" height="130" aria-label={`Productivity score ${score}%`} role="img">
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

// Achievement card — ready for backend-driven unlock state
const AchievementCard = ({ icon, title, description, unlocked = false, value = null }) => (
  <div className={`ins-achievement-card${unlocked ? ' unlocked' : ''}`} aria-label={`Achievement: ${title}${unlocked ? '' : ' (locked)'}`}>
    <div className="ins-achievement-icon" aria-hidden="true">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="ins-achievement-body">
      <p className="ins-achievement-title">{title}</p>
      <p className="ins-achievement-desc">{description}</p>
      {unlocked && value && <p className="ins-achievement-value">{value}</p>}
    </div>
    {!unlocked && (
      <span className="ins-achievement-lock" aria-hidden="true">
        <span className="material-symbols-outlined">lock</span>
      </span>
    )}
  </div>
);

// Recommendation card — icon + title + explanation + optional action
const RecCard = ({ icon, title, explanation, action = null, onAction = null }) => (
  <div className="ins-rec-card">
    <div className="ins-rec-card-icon" aria-hidden="true">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="ins-rec-card-body">
      <p className="ins-rec-card-title">{title}</p>
      <p className="ins-rec-card-text">{explanation}</p>
      {action && onAction && (
        <button className="ins-rec-card-action" onClick={onAction}>{action}</button>
      )}
    </div>
  </div>
);

// Trend item — icon + text + optional badge
const TrendItem = ({ icon, text, badge = null, positive = null }) => (
  <div className="ins-trend-item">
    <div className={`ins-trend-icon${positive === true ? ' good' : positive === false ? ' bad' : ''}`} aria-hidden="true">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <p className="ins-trend-text">{text}</p>
    {badge && (
      <span className={`ins-trend-badge${positive === true ? ' good' : positive === false ? ' bad' : ''}`}>
        {badge}
      </span>
    )}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const Insights = () => {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.status === 'done' && t.estimatedMinutes && t.actualMinutes);

  // ── Derived metrics ──
  const totalEst  = done.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalAct  = done.reduce((s, t) => s + t.actualMinutes, 0);
  const accuracy  = done.length > 0 ? Math.min(Math.round((totalEst / totalAct) * 100), 100) : null;
  const avgGap    = done.length > 0 ? Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length) : null;

  const sorted    = [...done].sort((a, b) => (a.gap || 0) - (b.gap || 0));
  const bestTask  = sorted[0] || null;
  const worstTask = sorted[sorted.length - 1] || null;
  const maxAbsGap = done.length > 0 ? Math.max(...done.map((t) => Math.abs(t.gap || 0)), 1) : 1;

  const overCount  = done.filter((t) => (t.gap || 0) > 0).length;
  const underCount = done.filter((t) => (t.gap || 0) < 0).length;
  const onTarget   = done.length - overCount - underCount;

  const onTimeRatio = done.length > 0 ? (onTarget + underCount) / done.length : 0;
  const score = done.length > 0
    ? Math.min(Math.round((accuracy || 0) * 0.6 + onTimeRatio * 100 * 0.4), 100)
    : null;

  // ── Productivity trends ──
  const TRENDS = [];
  if (accuracy !== null) {
    if (accuracy >= 85) TRENDS.push({ icon: 'trending_up', text: `Your estimation accuracy is ${accuracy}% — excellent consistency.`, badge: `${accuracy}%`, positive: true });
    else if (accuracy >= 70) TRENDS.push({ icon: 'show_chart', text: `Estimation accuracy is ${accuracy}%. Close, but there's room to improve.`, badge: `${accuracy}%`, positive: null });
    else TRENDS.push({ icon: 'trending_down', text: `Estimation accuracy is ${accuracy}%. Tasks are consistently taking longer than planned.`, badge: `${accuracy}%`, positive: false });
  }
  if (done.length > 0) {
    const pctOverdue = Math.round((overCount / done.length) * 100);
    if (pctOverdue <= 20) TRENDS.push({ icon: 'task_alt', text: `${100 - pctOverdue}% of tasks were completed on time or early. Great pacing!`, badge: `${100 - pctOverdue}% on time`, positive: true });
    else TRENDS.push({ icon: 'warning', text: `${pctOverdue}% of tasks ran over estimate. Consider adding buffer time.`, badge: `${pctOverdue}% over`, positive: false });
  }
  if (avgGap !== null) {
    if (avgGap > 10)  TRENDS.push({ icon: 'more_time', text: `Average task overrun is +${avgGap} min. Adding a buffer could help.`, badge: `+${avgGap}m avg`, positive: false });
    if (avgGap < -10) TRENDS.push({ icon: 'fast_forward', text: `You finish ${Math.abs(avgGap)} min early on average — you may be over-estimating.`, badge: `${avgGap}m avg`, positive: null });
    if (Math.abs(avgGap) <= 10) TRENDS.push({ icon: 'adjust', text: `Average gap is just ${avgGap}m — your time estimates are very accurate.`, badge: `${avgGap}m avg`, positive: true });
  }
  if (done.length < 3) TRENDS.push({ icon: 'hourglass_empty', text: 'Complete more tasks with Focus Mode to unlock richer productivity trends.', badge: null, positive: null });

  // ── Recommendations ──
  const RECS = [];
  if (avgGap !== null && avgGap > 10)  RECS.push({ icon: 'add_circle', title: 'Add a buffer to your estimates', explanation: `Your tasks average +${avgGap} min over estimate. Add a 10–15 min buffer to complex tasks to reduce overruns.` });
  if (avgGap !== null && avgGap < -10) RECS.push({ icon: 'tune', title: 'Tighten your estimates', explanation: `You consistently finish ${Math.abs(avgGap)} min early. Try setting tighter estimates to better reflect your actual speed.` });
  if (overCount > underCount)          RECS.push({ icon: 'call_split', title: 'Break large tasks into smaller pieces', explanation: 'Most of your tasks run over estimate. Splitting complex tasks into sub-tasks improves both accuracy and focus.' });
  if (done.length >= 3 && accuracy !== null && accuracy < 70) RECS.push({ icon: 'history', title: 'Review your past gaps', explanation: 'Your estimation gap is consistently large. Review completed tasks to spot patterns and adjust your planning baseline.' });
  if (done.length < 3)                 RECS.push({ icon: 'timer', title: 'Complete more Focus Sessions', explanation: 'You need at least 3 completed tasks to get personalised recommendations. Start a Focus Session to track your time.' });
  if (RECS.length === 0)               RECS.push({ icon: 'star', title: 'Great work — keep it up!', explanation: 'Your estimations are accurate and consistent. Continue scheduling focused sessions to maintain this performance.' });

  // ── Achievements — backend-ready structure ──
  // In production: fetch from API and pass `unlocked: true` + `value` when earned
  const longestFocusTask = done.length > 0 ? done.reduce((a, b) => (a.actualMinutes || 0) > (b.actualMinutes || 0) ? a : b) : null;
  const bestAccTask = sorted[0] || null;

  const ACHIEVEMENTS = [
    {
      icon: 'emoji_events',
      title: 'Most Productive Week',
      description: 'Complete 5 tasks in a single week.',
      unlocked: false,
      value: null,
    },
    {
      icon: 'adjust',
      title: 'Best Estimation Accuracy',
      description: 'Achieve 90%+ estimation accuracy.',
      unlocked: accuracy !== null && accuracy >= 90,
      value: accuracy !== null ? `${accuracy}% accuracy` : null,
    },
    {
      icon: 'local_fire_department',
      title: 'Focus Champion',
      description: 'Complete your longest focus session.',
      unlocked: longestFocusTask !== null,
      value: longestFocusTask ? `${fmtMin(longestFocusTask.actualMinutes)} on "${longestFocusTask.title}"` : null,
    },
    {
      icon: 'rocket_launch',
      title: 'Perfect Estimate',
      description: 'Complete a task with 0-minute gap.',
      unlocked: done.some((t) => (t.gap || 0) === 0),
      value: done.find((t) => (t.gap || 0) === 0)?.title || null,
    },
    {
      icon: 'done_all',
      title: 'Task Historian',
      description: 'Complete your first 3 tasks.',
      unlocked: done.length >= 3,
      value: done.length >= 3 ? `${done.length} tasks completed` : null,
    },
    {
      icon: 'auto_awesome',
      title: 'AI Insights Ready',
      description: 'Complete 5 tasks to unlock AI-powered insights.',
      unlocked: false,
      value: null,
    },
  ];

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
            <Link to="/create-task" className="btn btn-primary">Create a Task</Link>
          </div>
        ) : (
          <div className="ins-grid">

            {/* ── Productivity Score ── */}
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
                    <span className="ins-score-key">On time or early</span>
                  </div>
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{done.length}</span>
                    <span className="ins-score-key">Tasks analysed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gap Distribution ── */}
            <div className="ins-card ins-card-dist">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">bar_chart</span>
                Gap Distribution
              </div>
              <div className="ins-dist-row" role="list" aria-label="Gap distribution">
                <div className="ins-dist-item over" role="listitem">
                  <span className="ins-dist-count">{overCount}</span>
                  <span className="ins-dist-label">Over</span>
                </div>
                <div className="ins-dist-item on" role="listitem">
                  <span className="ins-dist-count">{onTarget}</span>
                  <span className="ins-dist-label">On target</span>
                </div>
                <div className="ins-dist-item under" role="listitem">
                  <span className="ins-dist-count">{underCount}</span>
                  <span className="ins-dist-label">Under</span>
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
              <p className="ins-dist-note">
                {overCount > underCount
                  ? 'Most tasks ran over estimate. Consider adding buffer time.'
                  : underCount > overCount
                  ? 'You tend to over-estimate. Try tighter time allocations.'
                  : 'Great balance! Your estimates are right on target.'}
              </p>
            </div>

            {/* ── Productivity Trends ── */}
            <div className="ins-card ins-card-trends">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">trending_up</span>
                Productivity Trends
              </div>
              <div className="ins-trends-list">
                {TRENDS.map((t, i) => (
                  <TrendItem key={i} {...t} />
                ))}
              </div>
            </div>

            {/* ── Best / Worst task ── */}
            {bestTask && (
              <div className="ins-card ins-card-best">
                <div className="ins-card-label">
                  <span className="material-symbols-outlined" aria-hidden="true">thumb_up</span>
                  Best Estimation
                </div>
                <Link to={`/task-details/${bestTask.id}`} className="ins-task-link">
                  <span className="ins-task-title">{bestTask.title}</span>
                  <span className={`ins-task-gap ${(bestTask.gap || 0) <= 0 ? 'under' : 'over'}`}>
                    {(bestTask.gap || 0) <= 0 ? `${bestTask.gap}m` : `+${bestTask.gap}m`}
                  </span>
                </Link>
                <p className="ins-task-sub">
                  Est {fmtMin(bestTask.estimatedMinutes)} · Actual {fmtMin(bestTask.actualMinutes)}
                </p>
                <p className="ins-task-date">{fmtDate(bestTask.scheduledDate)}</p>
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
                  Est {fmtMin(worstTask.estimatedMinutes)} · Actual {fmtMin(worstTask.actualMinutes)}
                </p>
                <p className="ins-task-date">{fmtDate(worstTask.scheduledDate)}</p>
              </div>
            )}

            {/* ── Gap per Task ── */}
            <div className="ins-card ins-card-bars">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">align_horizontal_left</span>
                Gap per Task
              </div>
              <div className="ins-bar-list" role="list" aria-label="Gap per task">
                {done.map((t) => (
                  <div key={t.id} className="ins-bar-row" role="listitem">
                    <span
                      className="ins-bar-name"
                      title={t.title}
                    >
                      {t.title}
                    </span>
                    <GapBar gap={t.gap || 0} max={maxAbsGap} />
                    <span className={`ins-bar-val${(t.gap || 0) > 0 ? ' over' : ' under'}`}>
                      {(t.gap || 0) > 0 ? `+${t.gap}m` : `${t.gap}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Recommendations ── */}
            <div className="ins-card ins-card-recs">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">tips_and_updates</span>
                Recommendations
              </div>
              <div className="ins-rec-cards">
                {RECS.map((r, i) => <RecCard key={i} {...r} />)}
              </div>
            </div>

            {/* ── Achievements ── */}
            <div className="ins-card ins-card-achievements">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">military_tech</span>
                Achievements
              </div>
              <div className="ins-achievements-grid">
                {ACHIEVEMENTS.map((a, i) => <AchievementCard key={i} {...a} />)}
              </div>
            </div>

            {/* ── AI Insights Placeholder ── */}
            <div className="ins-card ins-card-ai">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                AI-Powered Insights
                <span className="ins-coming-soon-badge">Coming Soon</span>
              </div>
              <div className="ins-ai-placeholder">
                <div className="ins-ai-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="ins-ai-body">
                  <p className="ins-ai-title">Smarter insights are on the way</p>
                  <p className="ins-ai-desc">
                    Once connected, AI will analyse your task patterns, identify your most productive hours,
                    flag estimation blind spots, and generate personalised coaching recommendations.
                  </p>
                </div>
              </div>
              {/* Backend integration point: replace placeholder with AI-generated insight cards */}
              {/* {aiInsights.map((insight) => <InsightItem key={insight.id} {...insight} />)} */}
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
