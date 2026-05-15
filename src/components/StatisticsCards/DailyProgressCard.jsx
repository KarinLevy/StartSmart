import React from 'react';
import './StatisticsCards.css';

const DailyProgressCard = () => {
  return (
    <div className="glass-card stats-card">
      <h4 className="stats-card-title">Daily Progress</h4>
      <div className="progress-circle-container">
        <svg className="progress-circle-svg">
          <circle 
            className="progress-circle-bg" 
            cx="80" cy="80" r="70" 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="12"
          ></circle>
          <circle 
            cx="80" cy="80" r="70" 
            fill="transparent" 
            stroke="url(#gradient)" 
            strokeDasharray="440" 
            strokeDashoffset="132" 
            strokeLinecap="round" 
            strokeWidth="12"
          ></circle>
          <defs>
            <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary-container)"></stop>
              <stop offset="100%" stopColor="var(--color-secondary)"></stop>
            </linearGradient>
          </defs>
        </svg>
        <div className="progress-circle-inner">
          <span className="progress-percentage">70%</span>
          <span className="progress-label">COMPLETED</span>
        </div>
      </div>
      
      <p className="progress-desc">5 of 7 tasks finished today.</p>
      
      <div className="progress-stats-row">
        <div className="progress-stat-item">
          <span className="progress-stat-value">4.2h</span>
          <span className="progress-stat-label">FOCUS TIME</span>
        </div>
        <div className="progress-stat-divider"></div>
        <div className="progress-stat-item">
          <span className="progress-stat-value">92</span>
          <span className="progress-stat-label">PROD. SCORE</span>
        </div>
      </div>
    </div>
  );
};

export default DailyProgressCard;
