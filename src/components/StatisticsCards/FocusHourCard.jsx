import React from 'react';
import './StatisticsCards.css';

const FocusHourCard = () => {
  return (
    <div className="glass-card stats-card">
      <div className="focus-header">
        <h4 className="stats-card-title stats-card-title-left">Focus Intensity</h4>
        <span className="focus-trend">+12% vs yest.</span>
      </div>
      
      <div className="focus-bars-container">
        <div className="focus-bar" style={{ height: '40%' }}></div>
        <div className="focus-bar" style={{ height: '60%' }}></div>
        <div className="focus-bar" style={{ height: '30%' }}></div>
        <div className="focus-bar" style={{ height: '80%' }}></div>
        <div className="focus-bar active" style={{ height: '100%' }}></div>
        <div className="focus-bar" style={{ height: '50%' }}></div>
        <div className="focus-bar" style={{ height: '70%' }}></div>
      </div>
      
      <div className="focus-labels">
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
      </div>
    </div>
  );
};

export default FocusHourCard;
