import React from 'react';
import './Statistics.css';

const StatisticsCard = ({ title, value, icon, colorClass }) => {
  return (
    <div className={`stat-bento-card summary-card ${colorClass}`}>
      <div>
        <p className="summary-card-title">{title}</p>
        <h3 className="summary-card-value">{value}</h3>
      </div>
      <div className="summary-card-icon-wrapper">
        <span className="material-symbols-outlined summary-card-icon">{icon}</span>
      </div>
    </div>
  );
};

export default StatisticsCard;
