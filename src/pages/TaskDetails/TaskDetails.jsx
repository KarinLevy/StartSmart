import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './TaskDetails.css';

const fmtMin = (m) => {
  if (!m) return '--';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  return `${m}m`;
};

const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', done: 'Done' };
const STATUS_CHIPS = { pending: 'chip-pending', in_progress: 'chip-progress', done: 'chip-done' };
const STATUS_ICONS = { pending: 'schedule', in_progress: 'autorenew', done: 'check_circle' };

const TaskDetails = () => {
  const { id } = useParams();
  const { tasks, updateTask, deleteTask } = useTasks();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.id === id);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editEst, setEditEst] = useState('');

  if (!task) {
    return (
      <PageShell narrow title="Task not found">
        <p style={{ color: 'var(--color-on-surface-variant)' }}>This task does not exist.</p>
        <Link to="/dashboard" className="btn btn-secondary">Back to dashboard</Link>
      </PageShell>
    );
  }

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditEst(String(task.estimatedMinutes));
    setEditing(true);
  };

  const saveEdit = () => {
    updateTask(id, {
      title: editTitle.trim() || task.title,
      description: editDesc,
      estimatedMinutes: parseInt(editEst) || task.estimatedMinutes,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteTask(id);
    navigate('/dashboard');
  };

  const scheduledFormatted = task.scheduledDate
    ? new Date(task.scheduledDate).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <PageShell
      narrow
      title="Task Details"
      subtitle="Review everything about this task before you start."
      actions={
        <>
          {!editing ? (
            <button className="btn btn-secondary" onClick={startEdit}>
              <span className="material-symbols-outlined">edit</span>
              Edit
            </button>
          ) : (
            <button className="btn btn-primary" onClick={saveEdit}>
              <span className="material-symbols-outlined">save</span>
              Save
            </button>
          )}
          <button className="btn btn-danger" onClick={handleDelete}>
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
        </>
      }
    >
      <div className="surface-card td-card">
        <div className="td-top">
          <div className="td-status-row">
            <span className={`chip ${STATUS_CHIPS[task.status]}`}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{STATUS_ICONS[task.status]}</span>
              {STATUS_LABELS[task.status]}
            </span>
            {task.priorityHigh && (
              <span className="chip chip-priority">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>flag</span>
                High priority
              </span>
            )}
          </div>

          {editing ? (
            <input className="td-title-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
          ) : (
            <h3 className="td-title">{task.title}</h3>
          )}
        </div>

        <div className="td-field">
          <span className="td-field-label">Description</span>
          {editing ? (
            <textarea className="td-textarea" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows="4" />
          ) : (
            <p className="td-field-value">{task.description || <em style={{ color: 'var(--color-outline)' }}>No description</em>}</p>
          )}
        </div>

        <div className="td-meta-grid">
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon">calendar_month</span>
            <div>
              <span className="td-meta-label">Scheduled</span>
              <span className="td-meta-value">{scheduledFormatted}</span>
            </div>
          </div>
          <div className="td-meta">
            <span className="material-symbols-outlined td-meta-icon">hourglass_top</span>
            <div>
              <span className="td-meta-label">Estimated time</span>
              {editing ? (
                <input
                  className="td-title-input"
                  type="number"
                  min="1"
                  value={editEst}
                  onChange={(e) => setEditEst(e.target.value)}
                  style={{ width: '80px', fontSize: 'var(--font-size-body-md)' }}
                  aria-label="Estimated minutes"
                />
              ) : (
                <span className="td-meta-value">{fmtMin(task.estimatedMinutes)}</span>
              )}
            </div>
          </div>
          {task.actualMinutes != null && (
            <div className="td-meta">
              <span className="material-symbols-outlined td-meta-icon">timer</span>
              <div>
                <span className="td-meta-label">Actual time</span>
                <span className="td-meta-value">{fmtMin(task.actualMinutes)}</span>
              </div>
            </div>
          )}
          {task.gap != null && (
            <div className="td-meta">
              <span className="material-symbols-outlined td-meta-icon">query_stats</span>
              <div>
                <span className="td-meta-label">Gap</span>
                <span className={`td-meta-value ${task.gap > 0 ? 'gap-over' : 'gap-under'}`}>
                  {task.gap > 0 ? `+${task.gap}m` : `${task.gap}m`}
                </span>
              </div>
            </div>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="td-field">
            <span className="td-field-label">Tags</span>
            <div className="td-tags">
              {task.tags.map((tag) => (
                <span key={tag.name} className="td-tag" style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="td-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </Link>
          {task.status !== 'done' && (
            <Link to={`/focus-mode/${task.id}`} className="btn btn-primary">
              <span className="material-symbols-outlined">play_arrow</span>
              Start task
            </Link>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default TaskDetails;
