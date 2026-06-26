import React from 'react';
import './Statistics.css';

const MAX_BAR_HEIGHT = 160; // px

const ProductivityChart = ({ tasks = [] }) => {
  const done = tasks.filter((t) => t.status === 'done' && t.estimatedMinutes && t.actualMinutes);

  if (done.length === 0) {
    return (
      <div className="stat-bento-card productivity-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Planned vs Actual</h3>
        </div>
        <div className="chart-empty">
          <span className="material-symbols-outlined chart-empty-icon" aria-hidden="true">bar_chart</span>
          <p>Complete tasks to see your Planned vs Actual chart.</p>
        </div>
      </div>
    );
  }

  const maxMin = Math.max(...done.flatMap((t) => [t.estimatedMinutes, t.actualMinutes]));

  const abbr = (title) => title.length > 10 ? title.slice(0, 9) + '…' : title;

  return (
    <div className="stat-bento-card productivity-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Planned vs Actual</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot planned" />
            <span className="legend-text">Planned</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual" />
            <span className="legend-text">Actual</span>
          </div>
        </div>
      </div>

      <div className="chart-bars-container" role="img" aria-label="Planned vs Actual time chart">
        {done.map((t) => {
          const plannedH = (t.estimatedMinutes / maxMin) * MAX_BAR_HEIGHT;
          const actualH  = (t.actualMinutes  / maxMin) * MAX_BAR_HEIGHT;
          const over = t.actualMinutes > t.estimatedMinutes;
          return (
            <div key={t.id} className="chart-column" title={`${t.title}: planned ${t.estimatedMinutes}m, actual ${t.actualMinutes}m`}>
              <div className="chart-bars">
                <div className="chart-bar-planned" style={{ height: `${plannedH}px` }} />
                <div
                  className="chart-bar-actual"
                  style={{ height: `${actualH}px`, background: over ? 'var(--color-error)' : 'var(--color-secondary)' }}
                />
              </div>
              <span className="chart-label">{abbr(t.title)}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-y-note">Minutes shown proportionally. Red bars = over estimate.</div>
    </div>
  );
};

export default ProductivityChart;
