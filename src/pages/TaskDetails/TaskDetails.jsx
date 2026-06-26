import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './TaskDetails.css';

const fmtMin = (m) => {
  if (!m) return '--';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const STATUS_META = {
  pending:     { label: 'Pending',     cls: 'chip-pending',  icon: 'schedule' },
  in_progress: { label: 'In Progress', cls: 'chip-progress', icon: 'autorenew' },
  done:        { label: 'Done',        cls: 'chip-done',     icon: 'check_circle' },
};

const STATUSES = ['pending', 'in_progress', 'done'];

const TaskDetails = () => {
  const { id } = useParams();
  const { tasks, updateTask, deleteTask } = useTasks();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [editing, setEditing]       = useState(false);
  const [editTitle, setEditTitle]   = useState('');
  const [editDesc, setEditDesc]     = useState('');
  const [editEst, setEditEst]       = useState('');
  const [editDate, setEditDate]     = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPrio, setEditPrio]     = useState(false);
  const [showDel, setShowDel]       = useState(false);

  if (!task) {
    return (
      <PageShell narrow title="Task not found">
        <div className="td-not-found">
          <span className="material-symbols-outlined td-not-found-icon" aria-hidden="true">search_off</span>
          <h3>This task doesn&apos;t exist.</h3>
          <p>It may have been deleted, or the link might be wrong.</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </PageShell>
    );
  }

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditEst(String(task.estimatedMinutes));
    setEditDate(task.scheduledDate || '');
    setEditStatus(task.status);
    setEditPrio(task.priorityHigh);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    updateTask(id, {
      title:            editTitle.trim() || task.title,
      description:      editDesc,
      estimatedMinutes: parseInt(editEst) || task.estimatedMinutes,
      scheduledDate:    editDate,
      status:           editStatus,
      priorityHigh:     editPrio,
    });
    setEditing(false);
  };

  const confirmDelete = () => {
    deleteTask(id);
    navigate('/dashboard');
  };

  const scheduledFormatted = task.scheduledDate
    ? new Date(task.scheduledDate).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

  const sm = STATUS_META[task.status] || STATUS_META.pending;
  const gap = task.gap;

  return (
    <PageShell
      narrow
      title="Task Details"
      subtitle="Review, edit, or start a focus session on this task."
      actions={
        <div className="td-header-actions">
          {!editing ? (
            <>
              <button className="btn btn-secondary" onClick={startEdit}>
                <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => setShowDel(true)}>
                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>
                <span className="material-symbols-outlined" aria-hidden="true">save</span>
                Save
              </button>
            </>
          )}
        </div>
      }
    >

      {/* Delete confirmation */}
      {showDel && (
        <div className="td-confirm-overlay" role="dialog" aria-modal="true" aria-label="Delete task confirmation">
          <div className="td-confirm-box">
            <span className="material-symbols-outlined td-confirm-icon" aria-hidden="true">warning</span>
            <h3 className="td-confirm-title">Delete this task?</h3>
            <p className="td-confirm-text">This action cannot be undone.</p>
            <div className="td-confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowDel(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="surface-card td-card">

        {/* Top: status + title */}
        <div className="td-top">
          <div className="td-status-row">
            {editing ? (
              <div className="td-status-select-group">
                {STATUSES.map((s) => {
                  const m = STATUS_META[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`td-status-opt ${s === editStatus ? 'active' : ''}`}
                      onClick={() => setEditStatus(s)}
                      aria-pressed={s === editStatus}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">{m.icon}</span>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <span className={`chip ${sm.cls}`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">{sm.icon}</span>
                  {sm.label}
                </span>
                {task.priorityHigh && (
                  <span className="chip chip-priority">
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">flag</span>
                    High priority
                  </span>
                )}
              </>
            )}
          </div>

          {editing ? (
            <input
              className="td-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              aria-label="Task title"
            />
          ) : (
            <h2 className="td-title">{task.title}</h2>
          )}
        </div>

        {/* Description */}
        <div className="td-field">
          <span className="td-field-label">Description</span>
          {editing ? (
            <textarea
              className="td-textarea"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={4}
              aria-label="Task description"
            />
          ) : (
            <p className="td-field-value">
              {task.description || <em style={{ color: 'var(--color-outline)' }}>No description</em>}
            </p>
          )}
        </div>

        {/* Meta grid */}
        <div className="td-meta-grid">
          {/* Scheduled */}
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon" aria-hidden="true">calendar_month</span>
            <div>
              <span className="td-meta-label">Scheduled</span>
              {editing ? (
                <input
                  type="datetime-local"
                  className="td-inline-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  aria-label="Scheduled date and time"
                />
              ) : (
                <span className="td-meta-value">{scheduledFormatted}</span>
              )}
            </div>
          </div>

          {/* Estimated */}
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon" aria-hidden="true">hourglass_top</span>
            <div>
              <span className="td-meta-label">Estimated</span>
              {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    className="td-inline-input"
                    type="number"
                    min="1"
                    value={editEst}
                    onChange={(e) => setEditEst(e.target.value)}
                    style={{ width: '72px' }}
                    aria-label="Estimated minutes"
                  />
                  <span style={{ fontSize: 'var(--font-size-label-sm)', color: 'var(--color-outline)' }}>min</span>
                </div>
              ) : (
                <span className="td-meta-value">{fmtMin(task.estimatedMinutes)}</span>
              )}
            </div>
          </div>

          {/* Actual (read-only) */}
          {task.actualMinutes != null && (
            <div className="td-meta">
              <span className="material-symbols-outlined td-meta-icon" aria-hidden="true">timer</span>
              <div>
                <span className="td-meta-label">Actual time</span>
                <span className="td-meta-value">{fmtMin(task.actualMinutes)}</span>
              </div>
            </div>
          )}

          {/* Gap */}
          {gap != null && (
            <div className="td-meta">
              <span className="material-symbols-outlined td-meta-icon" aria-hidden="true">query_stats</span>
              <div>
                <span className="td-meta-label">Gap</span>
                <span className={`td-meta-value ${gap > 0 ? 'gap-over' : 'gap-under'}`}>
                  {gap > 0 ? `+${gap}m` : `${gap}m`}
                  <span className="td-gap-badge">
                    {gap === 0 ? 'On target' : gap > 0 ? 'Over' : 'Early'}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Priority toggle in edit mode */}
        {editing && (
          <div className="td-field">
            <button
              type="button"
              className={`td-prio-toggle${editPrio ? ' active' : ''}`}
              onClick={() => setEditPrio((v) => !v)}
              aria-pressed={editPrio}
            >
              <span className="material-symbols-outlined" aria-hidden="true">flag</span>
              {editPrio ? 'High priority — click to remove' : 'Mark as high priority'}
            </button>
          </div>
        )}

        {/* Tags */}
        {!editing && task.tags?.length > 0 && (
          <div className="td-field">
            <span className="td-field-label">Tags</span>
            <div className="td-tags">
              {task.tags.map((tag) => {
                const c = tag.color || '#6b38d4';
                return (
                  <span
                    key={tag.name}
                    className="td-tag"
                    style={{ background: c + '1e', color: c, borderColor: c + '40' }}
                  >
                    {tag.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom actions */}
        <div className="td-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            Dashboard
          </Link>
          {task.status !== 'done' && (
            <Link to={`/focus-mode/${task.id}`} className="btn btn-primary">
              <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
              Start focus
            </Link>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default TaskDetails;
