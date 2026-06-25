import React from 'react';
import PageShell from '../../components/PageShell/PageShell';
import './TaskHistory.css';

// Placeholder/dummy history rows — replaced by real data once the backend is connected.
const history = [
  { id: 1, name: 'UI Audit: Dashboard Shell', date: 'Oct 23', estimated: '1h 20m', actual: '1h 25m', gap: 5, status: 'Done' },
  { id: 2, name: 'Client Feedback Loop', date: 'Oct 22', estimated: '45m', actual: '38m', gap: -7, status: 'Done' },
  { id: 3, name: 'Database Migration Check', date: 'Oct 22', estimated: '30m', actual: '28m', gap: -2, status: 'Done' },
  { id: 4, name: 'Write Sprint Summary', date: 'Oct 21', estimated: '1h', actual: '1h 18m', gap: 18, status: 'Done' },
  { id: 5, name: 'Refactor Timer Component', date: 'Oct 20', estimated: '2h', actual: '1h 40m', gap: -20, status: 'Done' },
];

const fmtGap = (g) => (g > 0 ? `+${g}m` : `${g}m`);

const TaskHistory = () => {
  return (
    <PageShell
      title="Task History"
      subtitle="Every completed task, with how your estimate compared to reality."
    >
      <div className="th-summary">
        <div className="th-summary-card">
          <span className="th-summary-value">{history.length}</span>
          <span className="th-summary-label">Tasks completed</span>
        </div>
        <div className="th-summary-card">
          <span className="th-summary-value">5h 29m</span>
          <span className="th-summary-label">Total time worked</span>
        </div>
        <div className="th-summary-card">
          <span className="th-summary-value gap-over">+0.8m</span>
          <span className="th-summary-label">Avg gap per task</span>
        </div>
      </div>

      <div className="surface-card th-table-card">
        <div className="th-table-scroll">
          <table className="th-table">
            <thead>
              <tr>
                <th>Task name</th>
                <th>Date</th>
                <th>Estimated</th>
                <th>Actual</th>
                <th>Gap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td data-label="Task name" className="th-name">{row.name}</td>
                  <td data-label="Date">{row.date}</td>
                  <td data-label="Estimated">{row.estimated}</td>
                  <td data-label="Actual">{row.actual}</td>
                  <td data-label="Gap" className={row.gap > 0 ? 'gap-over' : 'gap-under'}>
                    {fmtGap(row.gap)}
                  </td>
                  <td data-label="Status">
                    <span className="chip chip-done">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};

export default TaskHistory;
