import React from 'react';
import './SmartTipCard.css';

const SmartTipCard = () => {
  return (
    <div className="smart-tip-card primary-gradient group">
      <div className="smart-tip-content">
        <div className="smart-tip-header">
          <span className="material-symbols-outlined smart-tip-icon">tips_and_updates</span>
          <span className="smart-tip-title">Smart Tip</span>
        </div>
        <p className="smart-tip-text">
          "Your concentration peaks around 10 AM. Use this for your 'High Priority' architecture tasks."
        </p>
      </div>
      <div className="smart-tip-glow"></div>
    </div>
  );
};

export default SmartTipCard;
