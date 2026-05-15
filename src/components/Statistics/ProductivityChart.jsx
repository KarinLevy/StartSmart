import React from 'react';
import './Statistics.css';

const ProductivityChart = () => {
  return (
    <div className="stat-bento-card productivity-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Planned vs Actual (Hours)</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot planned"></span>
            <span className="legend-text">Planned</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual"></span>
            <span className="legend-text">Actual</span>
          </div>
        </div>
      </div>

      <div className="chart-bars-container">
        
        {/* 9 AM */}
        <div className="chart-column">
          <div className="chart-bars">
            <div className="chart-bar-planned" style={{ height: '60%' }}></div>
            <div className="chart-bar-actual" style={{ height: '45%' }}></div>
          </div>
          <span className="chart-label">9 AM</span>
        </div>

        {/* 11 AM */}
        <div className="chart-column">
          <div className="chart-bars">
            <div className="chart-bar-planned" style={{ height: '80%' }}></div>
            <div className="chart-bar-actual" style={{ height: '90%' }}></div>
          </div>
          <span className="chart-label">11 AM</span>
        </div>

        {/* 1 PM */}
        <div className="chart-column">
          <div className="chart-bars">
            <div className="chart-bar-planned" style={{ height: '40%' }}></div>
            <div className="chart-bar-actual" style={{ height: '30%' }}></div>
          </div>
          <span className="chart-label">1 PM</span>
        </div>

        {/* 3 PM */}
        <div className="chart-column">
          <div className="chart-bars">
            <div className="chart-bar-planned" style={{ height: '75%' }}></div>
            <div className="chart-bar-actual" style={{ height: '85%' }}></div>
          </div>
          <span className="chart-label">3 PM</span>
        </div>

        {/* 5 PM */}
        <div className="chart-column">
          <div className="chart-bars">
            <div className="chart-bar-planned" style={{ height: '50%' }}></div>
            <div className="chart-bar-actual" style={{ height: '40%' }}></div>
          </div>
          <span className="chart-label">5 PM</span>
        </div>

      </div>
    </div>
  );
};

export default ProductivityChart;
