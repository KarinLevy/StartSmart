import React from 'react';
import './TaskCards.css';

const HeroTaskCard = () => {
  return (
    <div className="glass-card hero-card group">
      <div className="hero-card-blur"></div>
      <div className="hero-card-content">
        <div className="hero-card-text">
          <div className="hero-card-tags">
            <span className="hero-tag-priority">High Priority</span>
            <span className="hero-tag-time">
              <span className="material-symbols-outlined icon-sm">schedule</span>
              45 min session
            </span>
          </div>
          <h3 className="hero-card-title">Refine Product Architecture</h3>
          <p className="hero-card-desc">
            Finalize the technical documentation for the SmartScale module before the stakeholder sync.
          </p>
        </div>
        <button className="primary-gradient motivational-glow hero-button">
          <span className="material-symbols-outlined">play_circle</span>
          Start Now
        </button>
      </div>
    </div>
  );
};

export default HeroTaskCard;
