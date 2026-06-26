import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext';
import './Statistics.css';

const InsightCard = ({ tasks = [] }) => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const done = tasks.filter((task) => task.status === 'done' && task.estimatedMinutes && task.actualMinutes);

  let efficiency = null;
  let avgGap = null;
  let recommendation = t('insightCard.noData');
  let effLabel = null;

  if (done.length > 0) {
    const totalEst = done.reduce((s, task) => s + task.estimatedMinutes, 0);
    const totalAct = done.reduce((s, task) => s + task.actualMinutes, 0);
    efficiency = Math.min(Math.round((totalEst / totalAct) * 100), 100);
    avgGap = Math.round(done.reduce((s, task) => s + (task.gap || 0), 0) / done.length);

    if (efficiency >= 90)       { effLabel = t('insightCard.excellent'); recommendation = t('insightCard.recExcellent'); }
    else if (efficiency >= 75)  { effLabel = t('insightCard.good');      recommendation = t('insightCard.recGood'); }
    else if (efficiency >= 60)  { effLabel = t('insightCard.fair');      recommendation = t('insightCard.recFair'); }
    else                        { effLabel = t('insightCard.needsWork'); recommendation = t('insightCard.recNeedsWork'); }
  }

  return (
    <div className="insight-card">
      <div className="insight-glow-1" aria-hidden="true" />
      <div className="insight-glow-2" aria-hidden="true" />

      <div className="insight-header">
        <span className="material-symbols-outlined text-white" aria-hidden="true">lightbulb</span>
        <h3 className="insight-title">{t('insightCard.title')}</h3>
      </div>

      <div className="insight-content">
        {efficiency !== null ? (
          <>
            <div className="insight-metric">
              <p className="insight-metric-label">{t('insightCard.estAccuracy')}</p>
              <div className="insight-metric-value-container">
                <span className="insight-metric-value">{efficiency}%</span>
                <span className="insight-metric-badge">{effLabel}</span>
              </div>
            </div>

            <div className="insight-metric">
              <p className="insight-metric-label">{t('insightCard.avgGap')}</p>
              <div className="insight-metric-value-container">
                <span className="insight-metric-value" style={{ fontSize: '1.5rem' }}>
                  {avgGap > 0 ? `+${avgGap}m` : `${avgGap}m`}
                </span>
                <span className="insight-metric-badge">
                  {avgGap > 0 ? t('insightCard.over') : avgGap < 0 ? t('insightCard.under') : t('insightCard.onTarget')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="insight-metric">
            <p className="insight-metric-label">{t('insightCard.estAccuracy')}</p>
            <div className="insight-metric-value-container">
              <span className="insight-metric-value">—</span>
            </div>
          </div>
        )}

        <div className="insight-recommendation">
          <p className="insight-rec-label">{t('insightCard.recommendation')}</p>
          <p className="insight-rec-text">{recommendation}</p>
        </div>
      </div>

      <button className="insight-btn" onClick={() => navigate('/insights')}>
        {t('insightCard.viewAll')}
      </button>
    </div>
  );
};

export default InsightCard;
