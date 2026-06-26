import React from 'react';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './TaskHistory.css';

const fmtMin = (m) => {
  if (m == null) return '--';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  return `${m}m`;
};
const fmtGap = (g) => (g > 0 ? `+${g}m` : `${g}m`);

const TaskHistory = () => {
  const { tasks } = useTasks();
  const done = tasks.filter((t) => t.status === 'done');

  const totalMin = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const totalFmt = fmtMin(totalMin);

  const avgGap = done.length > 0
    ? (done.reduce((s, t) => s + (t.gap || 0), 0) / done.length).toFixed(1)
    : 0;

  return (
    <PageShell title="Task History" subtitle="Every completed task, with how your estimate compared to reality.">
      <div className="th-summary">
        <div className="th-summary-card">
          <span className="th-summary-value">{done.length}</span>
          <span className="th-summary-label">Tasks completed</span>
        </div>
        <div className="th-summary-card">
          <span className="th-summary-value">{totalFmt}</span>
          <span className="th-summary-label">Total time worked</span>
        </div>
        <div className="th-summary-card">
          <span className={`th-summary-value ${Number(avgGap) > 0 ? 'gap-over' : 'gap-under'}`}>
            {Number(avgGap) > 0 ? `+${avgGap}m` : `${avgGap}m`}
          </span>
          <span className="th-summary-label">Avg gap per task</span>
        </div>
      </div>

      {done.length === 0 ? (
        <div className="surface-card th-empty">
          <span className="material-symbols-outlined">history</span>
          <p>No completed tasks yet. Finish a focus session and it will appear here.</p>
        </div>
      ) : (
        <div className="surface-card th-table-card">
          <div className="th-table-scroll">
            <table className="th-table">
              <thead>
                <tr>
                  <th>Task name</th>
                  <th>Scheduled</th>
                  <th>Estimated</th>
                  <th>Actual</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {done.map((task) => {
                  const dateStr = task.scheduledDate
                    ? new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—';
                  return (
                    <tr key={task.id}>
                      <td data-label="Task name" className="th-name">{task.title}</td>
                      <td data-label="Date">{dateStr}</td>
                      <td data-label="Estimated">{fmtMin(task.estimatedMinutes)}</td>
                      <td data-label="Actual">{fmtMin(task.actualMinutes)}</td>
                      <td data-label="Gap" className={task.gap > 0 ? 'gap-over' : 'gap-under'}>
                        {task.gap != null ? fmtGap(task.gap) : '--'}
                      </td>
                      <td data-label="Status">
                        <span className="chip chip-done">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                          Done
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default TaskHistory;
