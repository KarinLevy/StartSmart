import React from 'react';
import './FocusMode.css';

const CircularTimer = () => {
  return (
    <div className="focus-timer-container">
      <div className="focus-timer-wrapper">
        
        {/* Circular Progress SVG */}
        <svg className="focus-timer-svg">
          <circle 
            className="timer-track" 
            cx="50%" cy="50%" r="42%" 
            fill="transparent" 
            stroke="currentColor" 
            strokeWidth="8"
          ></circle>
          <circle 
            className="timer-progress" 
            cx="50%" cy="50%" r="42%" 
            fill="transparent" 
            stroke="currentColor" 
            strokeDasharray="1319.5" 
            strokeDashoffset="330" 
            strokeLinecap="round" 
            strokeWidth="12"
          ></circle>
        </svg>

        {/* Inner Timer Card */}
        <div className="focus-timer-inner">
          <span className="focus-timer-time">00:23:14</span>
          <p className="focus-timer-status">Focusing...</p>
          <div className="focus-timer-pomodoro">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>timer</span>
            <span className="focus-timer-pomodoro-text">Pomodoro 1/4</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CircularTimer;
