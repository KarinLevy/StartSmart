import React from 'react';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { calcFocusIntensity } from '../../utils/dateFormat';
import './StatisticsCards.css';

const FocusHourCard = () => {
  const { tasks } = useTasks();
  const { t, locale } = useLocale();

  const { bars, labels, trend } = calcFocusIntensity(tasks, locale);

  // Render the trend pill: null → new user; 0 → same; pos → up; neg → down
  const trendText =
    trend === null
      ? t('dashboard.focusTrendNew')
      : trend === 0
        ? t('dashboard.focusTrendSame')
        : trend > 0
          ? t('dashboard.focusTrendUp',   { n: Math.min(trend, 999) })
          : t('dashboard.focusTrendDown', { n: Math.min(Math.abs(trend), 999) });

  const trendPositive = trend !== null && trend > 0;
  const trendNegative = trend !== null && trend < 0;

  return (
    <div className="glass-card stats-card">
      <div className="focus-header">
        <h4 className="stats-card-title stats-card-title-left">{t('dashboard.focusIntensity')}</h4>
        <span
          className={`focus-trend${trendNegative ? ' focus-trend-down' : trendPositive ? '' : ' focus-trend-neutral'}`}
          aria-live="polite"
        >
          {trendText}
        </span>
      </div>

      <div className="focus-bars-container" role="img" aria-label={t('dashboard.focusIntensity')}>
        {bars.map(({ heightPct, hasData, minutes }, i) => (
          <div
            key={i}
            className={`focus-bar${hasData ? ' active' : ''}`}
            style={{ height: `${heightPct}%` }}
            title={minutes > 0 ? `${minutes} min` : undefined}
          />
        ))}
      </div>

      <div className="focus-labels">
        {bars.map(({ isToday }, i) => (
          <span key={i} className={isToday ? 'focus-label-today' : ''}>
            {isToday ? t('dashboard.focusToday') : labels[i]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default FocusHourCard;
