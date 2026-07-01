import React from 'react';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatDuration } from '../../utils/dateFormat';
import './StatisticsCards.css';

const DailyProgressCard = () => {
  const { tasks } = useTasks();
  const { t } = useLocale();

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => {
    if (!task.scheduledDate) return false;
    return task.scheduledDate.startsWith(todayKey);
  });

  // Fall back to all tasks if none are scheduled today
  const pool = todayTasks.length > 0 ? todayTasks : tasks;
  const total = pool.length;
  const done  = pool.filter((task) => task.status === 'done').length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const focusMin = pool.reduce((s, task) => s + (task.actualMinutes || 0), 0);
  const focusH   = formatDuration(focusMin, t);

  const gapTasks = pool.filter((task) => task.gap != null);
  const avgGap = gapTasks.length > 0
    ? Math.round(gapTasks.reduce((s, task) => s + task.gap, 0) / gapTasks.length)
    : null;

  const fmtGap = (gap) => {
    const abs = formatDuration(Math.abs(gap), t);
    return gap > 0 ? `+${abs}` : `-${abs}`;
  };

  // SVG circle math
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  const progressDesc = total === 0
    ? t('dashboard.progressNoTasks')
    : todayTasks.length > 0
      ? t('dashboard.progressToday', { done, total })
      : t('dashboard.progressAll', { done, total });

  return (
    <div className="glass-card stats-card">
      <h4 className="stats-card-title">{t('dashboard.dailyProgress')}</h4>

      <div className="progress-circle-container" role="img" aria-label={t('dashboard.progressAriaLabel', { pct })}>
        <svg className="progress-circle-svg" aria-hidden="true">
          <circle className="progress-circle-bg" cx="80" cy="80" r={r} fill="transparent" stroke="currentColor" strokeWidth="12" />
          <circle
            cx="80" cy="80" r={r}
            fill="transparent"
            stroke="url(#dpGrad)"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="12"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <defs>
            <linearGradient id="dpGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary-container)" />
              <stop offset="100%" stopColor="var(--color-secondary)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="progress-circle-inner">
          <span className="progress-percentage">{pct}%</span>
          <span className="progress-label">{t('dashboard.done')}</span>
        </div>
      </div>

      <p className="progress-desc">{progressDesc}</p>

      <div className="progress-stats-row">
        <div className="progress-stat-item">
          <span className="progress-stat-value">{focusH}</span>
          <span className="progress-stat-label">{t('dashboard.focusTime')}</span>
        </div>
        <div className="progress-stat-divider" />
        <div className="progress-stat-item">
          <span className="progress-stat-value" style={{ color: avgGap != null && avgGap > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {avgGap != null ? fmtGap(avgGap) : '—'}
          </span>
          <span className="progress-stat-label">{t('dashboard.avgGap')}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressCard;
