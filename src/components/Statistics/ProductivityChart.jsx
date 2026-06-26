import React, { useState } from 'react';
import './Statistics.css';

const CHART_H = 160; // px — bar area height (10rem)

const fmtMin = (m) => {
  if (!m && m !== 0) return '—';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const Y_STEPS = 4;

const ProductivityChart = ({ tasks = [] }) => {
  const [hovered, setHovered] = useState(null);

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

  // Y-axis ticks: max → 0 (top to bottom)
  const yTicks = Array.from({ length: Y_STEPS + 1 }, (_, i) =>
    Math.round((maxMin / Y_STEPS) * (Y_STEPS - i))
  );

  return (
    <div className="stat-bento-card productivity-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">Planned vs Actual</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot planned" aria-hidden="true" />
            <span className="legend-text">Planned</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual" aria-hidden="true" />
            <span className="legend-text">Actual (on time)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual-over" aria-hidden="true" />
            <span className="legend-text">Actual (over)</span>
          </div>
        </div>
      </div>

      {/* Chart area: y-axis + scrollable bars */}
      <div className="chart-area" role="img" aria-label="Planned vs Actual time chart">
        {/* Y-axis */}
        <div className="chart-y-axis" aria-hidden="true">
          {yTicks.map((v) => (
            <span key={v} className="chart-y-tick">{fmtMin(v)}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="chart-scroll-area">
          <div className="chart-bars-container">
            {done.map((t) => {
              const plannedH = (t.estimatedMinutes / maxMin) * CHART_H;
              const actualH  = (t.actualMinutes  / maxMin) * CHART_H;
              const over     = t.actualMinutes > t.estimatedMinutes;
              const gap      = t.gap ?? (t.actualMinutes - t.estimatedMinutes);

              return (
                <div
                  key={t.id}
                  className={`chart-column${hovered?.id === t.id ? ' hovered' : ''}`}
                  onMouseEnter={() => setHovered(t)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(t)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="group"
                  aria-label={`${t.title}: planned ${fmtMin(t.estimatedMinutes)}, actual ${fmtMin(t.actualMinutes)}`}
                >
                  <div className="chart-bars">
                    <div
                      className="chart-bar-planned"
                      style={{ height: `${plannedH}px` }}
                    />
                    <div
                      className={`chart-bar-actual${over ? ' over' : ''}`}
                      style={{ height: `${actualH}px` }}
                    />
                  </div>
                  <span className="chart-label" title={t.title}>{t.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip panel — appears below chart on hover */}
      <div className={`chart-tooltip-panel${hovered ? ' visible' : ''}`} aria-live="polite">
        {hovered ? (
          <>
            <p className="chart-tt-title">{hovered.title}</p>
            <div className="chart-tt-grid">
              <span className="chart-tt-label">Planned</span>
              <span className="chart-tt-val">{fmtMin(hovered.estimatedMinutes)}</span>
              <span className="chart-tt-label">Actual</span>
              <span className="chart-tt-val">{fmtMin(hovered.actualMinutes)}</span>
              <span className="chart-tt-label">Gap</span>
              <span className={`chart-tt-val ${hovered.actualMinutes > hovered.estimatedMinutes ? 'chart-tt-over' : 'chart-tt-under'}`}>
                {(() => {
                  const g = hovered.gap ?? (hovered.actualMinutes - hovered.estimatedMinutes);
                  return g > 0 ? `+${g}m` : `${g}m`;
                })()}
              </span>
              {hovered.scheduledDate && (
                <>
                  <span className="chart-tt-label">Date</span>
                  <span className="chart-tt-val">{fmtDate(hovered.scheduledDate)}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <span className="chart-tt-hint">Hover a bar to see details</span>
        )}
      </div>
    </div>
  );
};

export default ProductivityChart;
