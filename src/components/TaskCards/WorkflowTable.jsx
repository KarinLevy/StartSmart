import React from 'react';
import './TaskCards.css';

const WorkflowTable = () => {
  return (
    <div className="glass-card workflow-card">
      <div className="workflow-header">
        <h4 className="workflow-title">Priority Workflow</h4>
        <div className="workflow-actions">
          <button className="workflow-action-btn">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="workflow-action-btn">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
      
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
            <tr className="workflow-row">
              <td>
                <div className="task-name-cell">
                  <div className="task-dot secondary"></div>
                  <span className="task-name">UI Audit: Dashboard Shell</span>
                </div>
              </td>
              <td className="center task-time">1h 20m</td>
              <td className="center task-time">1h 25m</td>
              <td className="center">
                <span className="task-gap error">+5m</span>
              </td>
              <td>
                <span className="status-badge in-progress">In Progress</span>
              </td>
              <td className="right">
                <button className="action-btn">Edit</button>
              </td>
            </tr>
            
            <tr className="workflow-row">
              <td>
                <div className="task-name-cell">
                  <div className="task-dot outline"></div>
                  <span className="task-name">Client Feedback Loop</span>
                </div>
              </td>
              <td className="center task-time">45m</td>
              <td className="center task-time">--</td>
              <td className="center task-gap neutral">--</td>
              <td>
                <span className="status-badge pending">Pending</span>
              </td>
              <td className="right">
                <button className="action-btn">Start</button>
              </td>
            </tr>
            
            <tr className="workflow-row">
              <td>
                <div className="task-name-cell opacity-60">
                  <div className="task-dot green"></div>
                  <span className="task-name">Database Migration Check</span>
                </div>
              </td>
              <td className="center task-time opacity-60">30m</td>
              <td className="center task-time opacity-60">28m</td>
              <td className="center">
                <span className="task-gap success opacity-60">-2m</span>
              </td>
              <td>
                <span className="status-badge done">Done</span>
              </td>
              <td className="right">
                <span className="material-symbols-outlined action-icon">check_circle</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="workflow-footer">
        <a href="#" className="workflow-footer-link">
          View All Task History
          <span className="material-symbols-outlined icon-sm">arrow_forward</span>
        </a>
      </div>
    </div>
  );
};

export default WorkflowTable;
