import React, { useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import { useRegional } from '../../context/RegionalContext';
import { formatDuration, formatDate } from '../../utils/dateFormat';
import './Statistics.css';

const CHART_H = 160; // px — bar area height (10rem)

const Y_STEPS = 4;

const ProductivityChart = ({ tasks = [] }) => {
  const [hovered, setHovered] = useState(null);
  const { t } = useLocale();
  const { regional } = useRegional();

  const fmtDur  = (m) => formatDuration(m, t);
  const fmtDate = (d) => d ? formatDate(new Date(d), regional) : '—';

  const done = tasks.filter((task) => task.status === 'done' && task.estimatedMinutes && task.actualMinutes);

  if (done.length === 0) {
    return (
      <div className="stat-bento-card productivity-chart-card">
        <div className="chart-header">
          <h3 className="chart-title">{t('chart.title')}</h3>
        </div>
        <div className="chart-empty">
          <span className="material-symbols-outlined chart-empty-icon" aria-hidden="true">bar_chart</span>
          <p>{t('chart.empty')}</p>
        </div>
      </div>
    );
  }

  const maxMin = Math.max(...done.flatMap((task) => [task.estimatedMinutes, task.actualMinutes]));

  const yTicks = Array.from({ length: Y_STEPS + 1 }, (_, i) =>
    Math.round((maxMin / Y_STEPS) * (Y_STEPS - i))
  );

  return (
    <div className="stat-bento-card productivity-chart-card">
      <div className="chart-header">
        <h3 className="chart-title">{t('chart.title')}</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot planned" aria-hidden="true" />
            <span className="legend-text">{t('stats.planned')}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual" aria-hidden="true" />
            <span className="legend-text">{t('chart.actualOnTime')}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot actual-over" aria-hidden="true" />
            <span className="legend-text">{t('chart.actualOver')}</span>
          </div>
        </div>
      </div>

      <div className="chart-area" role="img" aria-label={t('chart.ariaLabel')}>
        <div className="chart-y-axis" aria-hidden="true">
          {yTicks.map((v) => (
            <span key={v} className="chart-y-tick">{fmtDur(v)}</span>
          ))}
        </div>

        <div className="chart-scroll-area">
          <div className="chart-bars-container">
            {done.map((task) => {
              const plannedH = (task.estimatedMinutes / maxMin) * CHART_H;
              const actualH  = (task.actualMinutes  / maxMin) * CHART_H;
              const over     = task.actualMinutes > task.estimatedMinutes;

              return (
                <div
                  key={task.id}
                  className={`chart-column${hovered?.id === task.id ? ' hovered' : ''}`}
                  onMouseEnter={() => setHovered(task)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(task)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="group"
                  aria-label={`${task.title}: ${t('stats.planned')} ${fmtDur(task.estimatedMinutes)}, ${t('stats.actual')} ${fmtDur(task.actualMinutes)}`}
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
                  <span className="chart-label" title={task.title}>{task.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`chart-tooltip-panel${hovered ? ' visible' : ''}`} aria-live="polite">
        {hovered ? (
          <>
            <p className="chart-tt-title">{hovered.title}</p>
            <div className="chart-tt-grid">
              <span className="chart-tt-label">{t('stats.planned')}</span>
              <span className="chart-tt-val">{fmtDur(hovered.estimatedMinutes)}</span>
              <span className="chart-tt-label">{t('stats.actual')}</span>
              <span className="chart-tt-val">{fmtDur(hovered.actualMinutes)}</span>
              <span className="chart-tt-label">{t('stats.gap')}</span>
              <span className={`chart-tt-val ${hovered.actualMinutes > hovered.estimatedMinutes ? 'chart-tt-over' : 'chart-tt-under'}`}>
                {(() => {
                  const g = hovered.gap ?? (hovered.actualMinutes - hovered.estimatedMinutes);
                  return g > 0 ? `+${fmtDur(g)}` : fmtDur(Math.abs(g));
                })()}
              </span>
              {hovered.scheduledDate && (
                <>
                  <span className="chart-tt-label">{t('chart.date')}</span>
                  <span className="chart-tt-val">{fmtDate(hovered.scheduledDate)}</span>
                </>
              )}
            </div>
          </>
        ) : (
          <span className="chart-tt-hint">{t('chart.hoverHint')}</span>
        )}
      </div>
    </div>
  );
};

export default ProductivityChart;
