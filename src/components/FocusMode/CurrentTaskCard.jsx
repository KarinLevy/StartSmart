import React from 'react';
import './FocusMode.css';

const CurrentTaskCard = () => {
  return (
    <div className="focus-bento-card focus-task-card">
      <div className="focus-task-header">
        <div>
          <span className="focus-task-subtitle">Current Task</span>
          <h2 className="focus-task-title">Refactor UI Component Architecture</h2>
        </div>
        <div className="focus-task-badge">
          RUNNING
        </div>
      </div>
      
      <div className="focus-task-progress-section">
        <div className="focus-task-progress-labels">
          <span>Progress vs Estimated</span>
          <span>75%</span>
        </div>
        <div className="focus-task-progress-bar-bg">
          <div className="focus-task-progress-bar-fill" style={{ width: '75%' }}></div>
        </div>
        <div className="focus-task-time-labels">
          <span>Started at 09:00 AM</span>
          <span>Est. 45 mins</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentTaskCard;
