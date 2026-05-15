import React from 'react';
import './FocusMode.css';

const EnvironmentCard = ({ icon, title, description, active }) => {
  return (
    <div className="focus-bento-card focus-env-card">
      <div className="focus-env-icon-wrapper">
        <span 
          className="material-symbols-outlined focus-env-icon"
          style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
        >
          {icon}
        </span>
      </div>
      <h3 className="focus-env-title">{title}</h3>
      <p className="focus-env-desc">{description}</p>
    </div>
  );
};

export default EnvironmentCard;
