import React from 'react';
import './Statistics.css';

const TaskAnalyticsTable = () => {
  return (
    <div className="stat-bento-card analytics-table-card">
      <div className="analytics-table-header">
        <h3 className="analytics-table-title">Task Breakdown</h3>
        <span className="analytics-table-badge">3 Tasks Evaluated</span>
      </div>
      
      <div className="table-responsive-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Task Name</th>
              <th>Estimated</th>
              <th>Actual</th>
              <th>Gap</th>
              <th>Status</th>
              <th className="col-right">Action</th>
            </tr>
          </thead>
          <tbody>
            
            {/* Row 1 */}
            <tr>
              <td className="table-task-name">UI Implementation (Navbar)</td>
              <td className="table-time">45m</td>
              <td className="table-time">35m</td>
              <td className="table-gap-positive">-10m</td>
              <td>
                <span className="status-badge-completed">
                  <span className="status-dot"></span>
                  Completed
                </span>
              </td>
              <td className="col-right">
                <button className="table-action-btn">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </td>
            </tr>

            {/* Row 2 */}
            <tr>
              <td className="table-task-name">Bento Grid Layout Design</td>
              <td className="table-time">1h 15m</td>
              <td className="table-time">1h 30m</td>
              <td className="table-gap-negative">+15m</td>
              <td>
                <span className="status-badge-completed">
                  <span className="status-dot"></span>
                  Completed
                </span>
              </td>
              <td className="col-right">
                <button className="table-action-btn">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </td>
            </tr>

            {/* Row 3 */}
            <tr>
              <td className="table-task-name">Data Integration Sync</td>
              <td className="table-time">30m</td>
              <td className="table-time">5m</td>
              <td className="table-gap-positive">-25m</td>
              <td>
                <span className="status-badge-completed">
                  <span className="status-dot"></span>
                  Completed
                </span>
              </td>
              <td className="col-right">
                <button className="table-action-btn">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
      
      <div className="analytics-table-footer">
        <p>Average gap today: +2.5 min per task</p>
      </div>
    </div>
  );
};

export default TaskAnalyticsTable;
