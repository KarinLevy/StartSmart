import React from 'react';
import { useTasks } from '../../context/TasksContext';
import './StatisticsCards.css';

const DailyProgressCard = () => {
  const { tasks } = useTasks();

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => {
    if (!t.scheduledDate) return false;
    return t.scheduledDate.startsWith(todayKey);
  });

  // Fall back to all tasks if none are scheduled today
  const pool = todayTasks.length > 0 ? todayTasks : tasks;
  const total = pool.length;
  const done  = pool.filter((t) => t.status === 'done').length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const focusMin = pool.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const focusH   = focusMin >= 60 ? `${(focusMin / 60).toFixed(1)}h` : `${focusMin}m`;

  const avgGap = pool.filter((t) => t.gap != null).length > 0
    ? Math.round(pool.filter((t) => t.gap != null).reduce((s, t) => s + t.gap, 0) / pool.filter((t) => t.gap != null).length)
    : null;

  // SVG circle math
  const r = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="glass-card stats-card">
      <h4 className="stats-card-title">Daily Progress</h4>

      <div className="progress-circle-container" role="img" aria-label={`${pct}% of tasks completed today`}>
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
          <span className="progress-label">DONE</span>
        </div>
      </div>

      <p className="progress-desc">
        {total === 0 ? 'No tasks scheduled today.' : `${done} of ${total} task${total !== 1 ? 's' : ''} finished${todayTasks.length > 0 ? ' today' : ''}.`}
      </p>

      <div className="progress-stats-row">
        <div className="progress-stat-item">
          <span className="progress-stat-value">{focusH}</span>
          <span className="progress-stat-label">FOCUS TIME</span>
        </div>
        <div className="progress-stat-divider" />
        <div className="progress-stat-item">
          <span className="progress-stat-value" style={{ color: avgGap != null && avgGap > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {avgGap != null ? (avgGap > 0 ? `+${avgGap}m` : `${avgGap}m`) : '—'}
          </span>
          <span className="progress-stat-label">AVG GAP</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressCard;
