import React from 'react';
import './FocusMode.css';

const GradientButton = ({ icon, text, onClick }) => {
  return (
    <button className="focus-gradient-btn" onClick={onClick}>
      <div className="focus-gradient-btn-icon-wrapper">
        <span className="material-symbols-outlined focus-gradient-btn-icon">{icon}</span>
      </div>
      <span>{text}</span>
    </button>
  );
};

export default GradientButton;
