import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Statistics.css';

const InsightCard = ({ tasks = [] }) => {
  const navigate = useNavigate();
  const done = tasks.filter((t) => t.status === 'done' && t.estimatedMinutes && t.actualMinutes);

  let efficiency = null;
  let avgGap = null;
  let recommendation = 'Complete a few tasks to unlock personalised insights.';
  let effLabel = null;

  if (done.length > 0) {
    const totalEst = done.reduce((s, t) => s + t.estimatedMinutes, 0);
    const totalAct = done.reduce((s, t) => s + t.actualMinutes, 0);
    efficiency = Math.min(Math.round((totalEst / totalAct) * 100), 100);
    avgGap = Math.round(done.reduce((s, t) => s + (t.gap || 0), 0) / done.length);

    if (efficiency >= 90)       { effLabel = 'Excellent'; recommendation = 'You estimate time very accurately. Keep scheduling ambitious focus sessions.'; }
    else if (efficiency >= 75)  { effLabel = 'Good';      recommendation = 'Your estimates are close. Try adding a 10–15 min buffer to complex tasks.'; }
    else if (efficiency >= 60)  { effLabel = 'Fair';      recommendation = 'Tasks are running over consistently. Break large tasks into sub-tasks.'; }
    else                        { effLabel = 'Needs work'; recommendation = 'Your estimates are significantly under. Review past gaps and adjust baselines.'; }
  }

  return (
    <div className="insight-card">
      <div className="insight-glow-1" aria-hidden="true" />
      <div className="insight-glow-2" aria-hidden="true" />

      <div className="insight-header">
        <span className="material-symbols-outlined text-white" aria-hidden="true">lightbulb</span>
        <h3 className="insight-title">Insights</h3>
      </div>

      <div className="insight-content">
        {efficiency !== null ? (
          <>
            <div className="insight-metric">
              <p className="insight-metric-label">Estimation Accuracy</p>
              <div className="insight-metric-value-container">
                <span className="insight-metric-value">{efficiency}%</span>
                <span className="insight-metric-badge">{effLabel}</span>
              </div>
            </div>

            <div className="insight-metric">
              <p className="insight-metric-label">Average Gap</p>
              <div className="insight-metric-value-container">
                <span className="insight-metric-value" style={{ fontSize: '1.5rem' }}>
                  {avgGap > 0 ? `+${avgGap}m` : `${avgGap}m`}
                </span>
                <span className="insight-metric-badge">
                  {avgGap > 0 ? 'over' : avgGap < 0 ? 'under' : 'on target'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="insight-metric">
            <p className="insight-metric-label">Estimation Accuracy</p>
            <div className="insight-metric-value-container">
              <span className="insight-metric-value">—</span>
            </div>
          </div>
        )}

        <div className="insight-recommendation">
          <p className="insight-rec-label">Recommendation</p>
          <p className="insight-rec-text">{recommendation}</p>
        </div>
      </div>

      <button className="insight-btn" onClick={() => navigate('/insights')}>
        View All Insights
      </button>
    </div>
  );
};

export default InsightCard;
