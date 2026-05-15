import React from 'react';
import './Statistics.css';

const InsightCard = () => {
  return (
    <div className="insight-card">
      <div className="insight-glow-1"></div>
      <div className="insight-glow-2"></div>
      
      <div className="insight-header">
        <span className="material-symbols-outlined text-white">lightbulb</span>
        <h3 className="insight-title">Daily Insights</h3>
      </div>
      
      <div className="insight-content">
        <div className="insight-metric">
          <p className="insight-metric-label">Efficiency Rating</p>
          <div className="insight-metric-value-container">
            <span className="insight-metric-value">92%</span>
            <span className="insight-metric-badge">Excellent</span>
          </div>
        </div>
        
        <p className="insight-text">
          "Your peak focus window was between 10:00 AM and 11:30 AM. You completed complex coding tasks 15% faster than estimated."
        </p>
        
        <div className="insight-recommendation">
          <p className="insight-rec-label">Recommendation</p>
          <p className="insight-rec-text">
            Try scheduling your high-effort tasks earlier tomorrow to maximize flow.
          </p>
        </div>
      </div>
      
      <button className="insight-btn">
        View All Insights
      </button>
    </div>
  );
};

export default InsightCard;
