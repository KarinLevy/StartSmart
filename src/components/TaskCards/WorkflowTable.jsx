import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import './TaskCards.css';

const fmtMin = (m) => {
  if (m == null) return '--';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};
const fmtGap = (g) => (g == null ? '--' : g > 0 ? `+${g}m` : `${g}m`);

const DOT_CLS = { in_progress: 'secondary', pending: 'outline', done: 'green' };

const WorkflowTable = () => {
  const { tasks, loading, error } = useTasks();
  const navigate = useNavigate();
  const { t } = useLocale();
  const [filter, setFilter] = useState('all');

  const FILTERS = [
    { key: 'all',         label: t('workflow.filterAll') },
    { key: 'pending',     label: t('workflow.filterPending') },
    { key: 'in_progress', label: t('workflow.filterProgress') },
    { key: 'done',        label: t('workflow.filterDone') },
    { key: 'high',        label: t('workflow.filterHigh') },
  ];

  const STATUS_CFG = {
    in_progress: { label: t('workflow.statusProgress'), cls: 'in-progress' },
    pending:     { label: t('workflow.statusPending'),  cls: 'pending' },
    done:        { label: t('workflow.statusDone'),     cls: 'done' },
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'all')         return true;
    if (filter === 'high')        return t.priorityHigh;
    return t.status === filter;
  });

  const visible = filtered.slice(0, 6);

  if (error) {
    return (
      <div className="glass-card workflow-card" style={{ padding: '1.5rem', color: 'var(--color-error)' }}>
        <span className="material-symbols-outlined">error</span> {error}
      </div>
    );
  }

  return (
    <div className="glass-card workflow-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="workflow-header">
        <h4 className="workflow-title">{t('workflow.title')}</h4>
        <span style={{ fontSize: 'var(--font-size-label-sm)', color: 'var(--color-on-surface-variant)' }}>
          {filtered.length !== 1
            ? t('workflow.taskCountPlural').replace('{n}', filtered.length)
            : t('workflow.taskCount').replace('{n}', filtered.length)}
        </span>
      </div>

      {/* Filter bar */}
      <div className="wf-filter-bar" role="group" aria-label="Filter tasks">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`wf-filter-chip${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table or empty */}
      {visible.length === 0 ? (
        <div className="workflow-empty">
          <span className="material-symbols-outlined" aria-hidden="true">inbox</span>
          <p>
            {t('workflow.emptyNo')}{' '}
            {filter !== 'all' ? FILTERS.find(f => f.key === filter)?.label + ' ' : ''}
            {t('workflow.emptyTasks')}{' '}
            <Link to="/create-task">{t('workflow.createOne')} →</Link>
          </p>
        </div>
      ) : (
        <div className="workflow-table-wrapper">
          <table className="workflow-table" aria-label="Task workflow">
            <thead>
              <tr>
                <th>{t('common.task')}</th>
                <th className="center">{t('history.est')}</th>
                <th className="center">{t('history.actual')}</th>
                <th className="center">{t('stats.gap')}</th>
                <th>{t('common.status')}</th>
                <th className="right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((task) => {
                const { label, cls } = STATUS_CFG[task.status] || STATUS_CFG.pending;
                const dotCls = DOT_CLS[task.status] || 'outline';
                const gapCls = task.gap == null ? 'neutral' : task.gap > 0 ? 'error' : 'success';
                const isDone = task.status === 'done';

                return (
                  <tr
                    key={task.id}
                    className="workflow-row"
                    style={{ opacity: isDone ? 0.7 : 1 }}
                  >
                    <td>
                      <div className="task-name-cell">
                        <div className={`task-dot ${dotCls}`} aria-hidden="true" />
                        <span className="task-name">
                          {task.priorityHigh && (
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '14px', color: 'var(--color-error)', verticalAlign: 'middle', marginRight: '3px' }}
                              aria-label="High priority"
                            >flag</span>
                          )}
                          <button
                            className="task-name-link"
                            onClick={() => navigate(`/task-details/${task.id}`)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', padding: 0, textAlign: 'left' }}
                          >
                            {task.title}
                          </button>
                        </span>
                      </div>
                    </td>
                    <td className="center task-time">{fmtMin(task.estimatedMinutes)}</td>
                    <td className="center task-time">{fmtMin(task.actualMinutes)}</td>
                    <td className="center">
                      <span className={`task-gap ${gapCls}`} aria-label={`Gap: ${fmtGap(task.gap)}`}>
                        {fmtGap(task.gap)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${cls}`} role="status">{label}</span>
                    </td>
                    <td className="right">
                      {isDone ? (
                        <span className="material-symbols-outlined action-icon" aria-label="Completed">check_circle</span>
                      ) : task.status === 'in_progress' ? (
                        <button className="action-btn" aria-label={`${t('workflow.resume')} ${task.title}`} onClick={() => navigate(`/focus-mode/${task.id}`)}>{t('workflow.resume')}</button>
                      ) : (
                        <button className="action-btn" aria-label={`${t('workflow.start')} ${task.title}`} onClick={() => navigate(`/focus-mode/${task.id}`)}>{t('workflow.start')}</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="workflow-footer">
        <Link to="/task-history" className="workflow-footer-link">
          {t('workflow.viewAll')}
          <span className="material-symbols-outlined icon-sm flip-rtl" aria-hidden="true">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default WorkflowTable;
