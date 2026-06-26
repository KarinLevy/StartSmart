import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { computeAchievements } from '../../utils/achievementUtils';
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
  const { tasks, loading, error } = useTasks();
  const { t } = useLocale();
  const done = tasks.filter((tk) => tk.status === 'done' && tk.estimatedMinutes && tk.actualMinutes);

  // ── Derived metrics ──
  const totalEst  = done.reduce((s, tk) => s + tk.estimatedMinutes, 0);
  const totalAct  = done.reduce((s, tk) => s + tk.actualMinutes, 0);
  const accuracy  = done.length > 0 ? Math.min(Math.round((totalEst / totalAct) * 100), 100) : null;
  const avgGap    = done.length > 0 ? Math.round(done.reduce((s, tk) => s + (tk.gap || 0), 0) / done.length) : null;

  const sorted    = [...done].sort((a, b) => (a.gap || 0) - (b.gap || 0));
  const bestTask  = sorted[0] || null;
  const worstTask = sorted[sorted.length - 1] || null;
  const maxAbsGap = done.length > 0 ? Math.max(...done.map((tk) => Math.abs(tk.gap || 0)), 1) : 1;

  const overCount  = done.filter((tk) => (tk.gap || 0) > 0).length;
  const underCount = done.filter((tk) => (tk.gap || 0) < 0).length;
  const onTarget   = done.length - overCount - underCount;

  const onTimeRatio = done.length > 0 ? (onTarget + underCount) / done.length : 0;
  const score = done.length > 0
    ? Math.min(Math.round((accuracy || 0) * 0.6 + onTimeRatio * 100 * 0.4), 100)
    : null;

  // ── Productivity trends ──
  const TRENDS = [];
  if (accuracy !== null) {
    if (accuracy >= 85) TRENDS.push({ icon: 'trending_up', text: t('insights.trendAccHigh', { pct: accuracy }), badge: `${accuracy}%`, positive: true });
    else if (accuracy >= 70) TRENDS.push({ icon: 'show_chart', text: t('insights.trendAccMid', { pct: accuracy }), badge: `${accuracy}%`, positive: null });
    else TRENDS.push({ icon: 'trending_down', text: t('insights.trendAccLow', { pct: accuracy }), badge: `${accuracy}%`, positive: false });
  }
  if (done.length > 0) {
    const pctOverdue = Math.round((overCount / done.length) * 100);
    if (pctOverdue <= 20) TRENDS.push({ icon: 'task_alt', text: t('insights.trendOnTime', { pct: 100 - pctOverdue }), badge: `${100 - pctOverdue}% on time`, positive: true });
    else TRENDS.push({ icon: 'warning', text: t('insights.trendOver', { pct: pctOverdue }), badge: `${pctOverdue}% over`, positive: false });
  }
  if (avgGap !== null) {
    if (avgGap > 10)  TRENDS.push({ icon: 'more_time', text: t('insights.trendAvgOver', { avg: avgGap }), badge: `+${avgGap}m avg`, positive: false });
    if (avgGap < -10) TRENDS.push({ icon: 'fast_forward', text: t('insights.trendAvgFast', { avg: Math.abs(avgGap) }), badge: `${avgGap}m avg`, positive: null });
    if (Math.abs(avgGap) <= 10) TRENDS.push({ icon: 'adjust', text: t('insights.trendAvgAccurate', { avg: avgGap }), badge: `${avgGap}m avg`, positive: true });
  }
  if (done.length < 3) TRENDS.push({ icon: 'hourglass_empty', text: t('insights.trendMoreData'), badge: null, positive: null });

  // ── Recommendations ──
  const RECS = [];
  if (avgGap !== null && avgGap > 10)  RECS.push({ icon: 'add_circle', title: t('insights.recBufferTitle'), explanation: t('insights.recBufferDesc', { avg: avgGap }) });
  if (avgGap !== null && avgGap < -10) RECS.push({ icon: 'tune', title: t('insights.recTightenTitle'), explanation: t('insights.recTightenDesc', { avg: Math.abs(avgGap) }) });
  if (overCount > underCount)          RECS.push({ icon: 'call_split', title: t('insights.recSplitTitle'), explanation: t('insights.recSplitDesc') });
  if (done.length >= 3 && accuracy !== null && accuracy < 70) RECS.push({ icon: 'history', title: t('insights.recReviewTitle'), explanation: t('insights.recReviewDesc') });
  if (done.length < 3)                 RECS.push({ icon: 'timer', title: t('insights.recMoreTitle'), explanation: t('insights.recMoreDesc') });
  if (RECS.length === 0)               RECS.push({ icon: 'star', title: t('insights.recGreatTitle'), explanation: t('insights.recGreatDesc') });

  // ── Achievements — computed from real task data ──
  const { achievements: ACHIEVEMENTS } = computeAchievements(tasks, t);

  if (loading) return (
    <div className="insights-layout">
      <Navbar />
      <main id="main-content" className="insights-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-outline)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </main>
    </div>
  );

  if (error) return (
    <div className="insights-layout">
      <Navbar />
      <main id="main-content" className="insights-main">
        <p style={{ color: 'var(--color-error)', padding: '2rem' }}>{error}</p>
      </main>
    </div>
  );

  return (
    <div className="insights-layout">
      <Navbar />
      <main id="main-content" className="insights-main">

        {/* Header */}
        <div className="ins-header">
          <div>
            <Link to="/statistics" className="ins-back">
              <span className="material-symbols-outlined">arrow_back</span>
              {t('insights.backToStats')}
            </Link>
            <h1 className="ins-title">{t('insights.title')}</h1>
            <p className="ins-subtitle">{t('insights.subtitle')}</p>
          </div>
        </div>

        {done.length === 0 ? (
          <div className="ins-empty">
            <span className="material-symbols-outlined ins-empty-icon" aria-hidden="true">insights</span>
            <h3>{t('insights.emptyTitle')}</h3>
            <p>{t('insights.emptyMsg')}</p>
            <Link to="/create-task" className="btn btn-primary">{t('insights.emptyBtn')}</Link>
          </div>
        ) : (
          <div className="ins-grid">

            {/* ── Productivity Score ── */}
            <div className="ins-card ins-card-score">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>
                {t('insights.scoreLabel')}
              </div>
              <div className="ins-score-row">
                <ScoreMeter score={score} />
                <div className="ins-score-breakdown">
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{accuracy}%</span>
                    <span className="ins-score-key">{t('insights.accuracyLabel')}</span>
                  </div>
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{Math.round(onTimeRatio * 100)}%</span>
                    <span className="ins-score-key">{t('insights.onTimeLabel')}</span>
                  </div>
                  <div className="ins-score-stat">
                    <span className="ins-score-val">{done.length}</span>
                    <span className="ins-score-key">{t('insights.analysedLabel')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Gap Distribution ── */}
            <div className="ins-card ins-card-dist">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">bar_chart</span>
                {t('insights.distLabel')}
              </div>
              <div className="ins-dist-row" role="list" aria-label="Gap distribution">
                <div className="ins-dist-item over" role="listitem">
                  <span className="ins-dist-count">{overCount}</span>
                  <span className="ins-dist-label">{t('insights.overLabel')}</span>
                </div>
                <div className="ins-dist-item on" role="listitem">
                  <span className="ins-dist-count">{onTarget}</span>
                  <span className="ins-dist-label">{t('insights.onTargetLabel')}</span>
                </div>
                <div className="ins-dist-item under" role="listitem">
                  <span className="ins-dist-count">{underCount}</span>
                  <span className="ins-dist-label">{t('insights.underLabel')}</span>
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
                  ? t('insights.distNoteOver')
                  : underCount > overCount
                  ? t('insights.distNoteUnder')
                  : t('insights.distNoteBalance')}
              </p>
            </div>

            {/* ── Productivity Trends ── */}
            <div className="ins-card ins-card-trends">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">trending_up</span>
                {t('insights.trendsLabel')}
              </div>
              <div className="ins-trends-list">
                {TRENDS.map((trend, i) => (
                  <TrendItem key={i} {...trend} />
                ))}
              </div>
            </div>

            {/* ── Best / Worst task ── */}
            {bestTask && (
              <div className="ins-card ins-card-best">
                <div className="ins-card-label">
                  <span className="material-symbols-outlined" aria-hidden="true">thumb_up</span>
                  {t('insights.bestLabel')}
                </div>
                <Link to={`/task-details/${bestTask.id}`} className="ins-task-link">
                  <span className="ins-task-title">{bestTask.title}</span>
                  <span className={`ins-task-gap ${(bestTask.gap || 0) <= 0 ? 'under' : 'over'}`}>
                    {(bestTask.gap || 0) <= 0 ? `${bestTask.gap}m` : `+${bestTask.gap}m`}
                  </span>
                </Link>
                <p className="ins-task-sub">
                  {t('insights.taskEst', { est: fmtMin(bestTask.estimatedMinutes), act: fmtMin(bestTask.actualMinutes) })}
                </p>
                <p className="ins-task-date">{fmtDate(bestTask.scheduledDate)}</p>
              </div>
            )}
            {worstTask && worstTask.id !== bestTask?.id && (
              <div className="ins-card ins-card-worst">
                <div className="ins-card-label">
                  <span className="material-symbols-outlined" aria-hidden="true">thumb_down</span>
                  {t('insights.worstLabel')}
                </div>
                <Link to={`/task-details/${worstTask.id}`} className="ins-task-link">
                  <span className="ins-task-title">{worstTask.title}</span>
                  <span className="ins-task-gap over">+{worstTask.gap}m</span>
                </Link>
                <p className="ins-task-sub">
                  {t('insights.taskEst', { est: fmtMin(worstTask.estimatedMinutes), act: fmtMin(worstTask.actualMinutes) })}
                </p>
                <p className="ins-task-date">{fmtDate(worstTask.scheduledDate)}</p>
              </div>
            )}

            {/* ── Gap per Task ── */}
            <div className="ins-card ins-card-bars">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">align_horizontal_left</span>
                {t('insights.gapLabel')}
              </div>
              <div className="ins-bar-list" role="list" aria-label="Gap per task">
                {done.map((tk) => (
                  <div key={tk.id} className="ins-bar-row" role="listitem">
                    <span className="ins-bar-name" title={tk.title}>{tk.title}</span>
                    <GapBar gap={tk.gap || 0} max={maxAbsGap} />
                    <span className={`ins-bar-val${(tk.gap || 0) > 0 ? ' over' : ' under'}`}>
                      {(tk.gap || 0) > 0 ? `+${tk.gap}m` : `${tk.gap}m`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Recommendations ── */}
            <div className="ins-card ins-card-recs">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">tips_and_updates</span>
                {t('insights.recsLabel')}
              </div>
              <div className="ins-rec-cards">
                {RECS.map((r, i) => <RecCard key={i} {...r} />)}
              </div>
            </div>

            {/* ── Achievements ── */}
            <div className="ins-card ins-card-achievements">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">military_tech</span>
                {t('insights.achievementsLabel')}
              </div>
              <div className="ins-achievements-grid">
                {ACHIEVEMENTS.map((a) => <AchievementCard key={a.key} icon={a.iconMat} title={a.title} description={a.description} unlocked={a.unlocked} value={a.value} />)}
              </div>
            </div>

            {/* ── AI Insights Placeholder ── */}
            <div className="ins-card ins-card-ai">
              <div className="ins-card-label">
                <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                {t('insights.aiLabel')}
                <span className="ins-coming-soon-badge">{t('insights.comingSoonBadge')}</span>
              </div>
              <div className="ins-ai-placeholder">
                <div className="ins-ai-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div className="ins-ai-body">
                  <p className="ins-ai-title">{t('insights.aiTitleText')}</p>
                  <p className="ins-ai-desc">{t('insights.aiDescText')}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Insights;
