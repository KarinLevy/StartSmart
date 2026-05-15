import React from 'react';
import './MotivationalTip.css';

const MotivationalTip = () => {
  return (
    <div className="motivational-tip-container">
      <div className="motivational-tip-content">
        <div className="motivational-tip-text">
          <h4 className="motivational-tip-title">Quick Productivity Tip</h4>
          <p className="motivational-tip-desc">
            Setting small, clear tasks helps maintain momentum throughout the day. This task is your first step toward success today!
          </p>
        </div>
        <div className="motivational-tip-icon-wrapper">
          <span className="material-symbols-outlined motivational-tip-icon">auto_awesome</span>
        </div>
      </div>
      
      {/* Decorative background shapes */}
      <div className="motivational-glow-1"></div>
      <div className="motivational-glow-2"></div>
    </div>
  );
};

export default MotivationalTip;
