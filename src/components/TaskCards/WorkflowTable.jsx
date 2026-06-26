import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import './TaskCards.css';

const fmtMin = (m) => {
  if (m == null) return '--';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  return `${m}m`;
};
const fmtGap = (g) => (g == null ? '--' : g > 0 ? `+${g}m` : `${g}m`);

const StatusBadge = ({ status }) => {
  const map = { in_progress: ['In Progress', 'in-progress'], pending: ['Pending', 'pending'], done: ['Done', 'done'] };
  const [label, cls] = map[status] || ['Unknown', 'pending'];
  return <span className={`status-badge ${cls}`}>{label}</span>;
};

const WorkflowTable = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const visible = tasks.slice(0, 5);

  return (
    <div className="glass-card workflow-card">
      <div className="workflow-header">
        <h4 className="workflow-title">Priority Workflow</h4>
        <div className="workflow-actions">
          <button className="workflow-action-btn" aria-label="Filter">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="workflow-empty">
          <span className="material-symbols-outlined">inbox</span>
          <p>No tasks yet. <Link to="/create-task">Create one →</Link></p>
        </div>
      ) : (
        <div className="workflow-table-wrapper">
          <table className="workflow-table">
            <thead>
              <tr>
                <th>Task Name</th>
                <th className="center">Est. Time</th>
                <th className="center">Actual</th>
                <th className="center">Gap</th>
                <th>Status</th>
                <th className="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((task) => {
                const isDone = task.status === 'done';
                const gapVal = task.gap;
                const gapCls = gapVal == null ? 'neutral' : gapVal > 0 ? 'error' : 'success';
                return (
                  <tr key={task.id} className={`workflow-row${isDone ? ' opacity-60' : ''}`}>
                    <td>
                      <div className="task-name-cell" style={{ opacity: isDone ? 0.6 : 1 }}>
                        <div className={`task-dot ${isDone ? 'green' : task.status === 'in_progress' ? 'secondary' : 'outline'}`} />
                        <span className="task-name">{task.title}</span>
                      </div>
                    </td>
                    <td className="center task-time">{fmtMin(task.estimatedMinutes)}</td>
                    <td className="center task-time">{fmtMin(task.actualMinutes)}</td>
                    <td className="center">
                      <span className={`task-gap ${gapCls}`}>{fmtGap(gapVal)}</span>
                    </td>
                    <td><StatusBadge status={task.status} /></td>
                    <td className="right">
                      {isDone ? (
                        <span className="material-symbols-outlined action-icon">check_circle</span>
                      ) : task.status === 'in_progress' ? (
                        <button className="action-btn" onClick={() => navigate(`/focus-mode/${task.id}`)}>Resume</button>
                      ) : (
                        <button className="action-btn" onClick={() => navigate(`/focus-mode/${task.id}`)}>Start</button>
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
          View All Task History
          <span className="material-symbols-outlined icon-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default WorkflowTable;
