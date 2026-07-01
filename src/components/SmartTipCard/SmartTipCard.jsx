import React from 'react';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { calcStreak } from '../../utils/achievementUtils';
import './SmartTipCard.css';

/**
 * Pick the most relevant tip for the current user based on their real task data.
 * Priority order: no data → long streak → buffer time → unstarted tasks →
 *   no focus today → excellent accuracy → short streak → under-estimation → default.
 */
function pickSmartTip(tasks) {
  if (!tasks || tasks.length === 0) {
    return { key: 'dashboard.tip.noData', params: {} };
  }

  const done = tasks.filter((t) => t.status === 'done' && t.actualMinutes != null && t.actualMinutes > 0);
  const streak = calcStreak(tasks);

  // Today's focus minutes (tasks completed today)
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayFocus = done
    .filter((t) => (t.completedAt ?? t.scheduledDate)?.slice(0, 10) === todayKey)
    .reduce((sum, t) => sum + t.actualMinutes, 0);

  const pending = tasks.filter((t) => t.status !== 'done');

  const avgGap =
    done.length > 0
      ? done.reduce((sum, t) => sum + (t.gap ?? 0), 0) / done.length
      : 0;

  const accuracy =
    done.length > 0
      ? Math.round(
          (done.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0) /
            Math.max(done.reduce((sum, t) => sum + t.actualMinutes, 0), 1)) *
            100,
        )
      : 0;

  if (streak >= 7) return { key: 'dashboard.tip.streak7', params: { n: streak } };
  if (done.length >= 3 && avgGap > 20) return { key: 'dashboard.tip.addBuffer', params: {} };
  if (pending.length >= 3) return { key: 'dashboard.tip.unstarted', params: { n: pending.length } };
  if (done.length > 0 && todayFocus === 0) return { key: 'dashboard.tip.noFocusToday', params: {} };
  if (done.length >= 5 && accuracy >= 85) return { key: 'dashboard.tip.accurate', params: { n: accuracy } };
  if (streak >= 2) return { key: 'dashboard.tip.streakShort', params: { n: streak } };
  if (done.length >= 3 && avgGap < -20) return { key: 'dashboard.tip.underEst', params: {} };
  return { key: 'dashboard.tip.default', params: {} };
}

const SmartTipCard = () => {
  const { tasks } = useTasks();
  const { t } = useLocale();

  const tip = pickSmartTip(tasks);

  return (
    <div className="smart-tip-card primary-gradient group">
      <div className="smart-tip-content">
        <div className="smart-tip-header">
          <span className="material-symbols-outlined smart-tip-icon">tips_and_updates</span>
          <span className="smart-tip-title">{t('dashboard.smartTip')}</span>
        </div>
        <p className="smart-tip-text">{t(tip.key, tip.params)}</p>
      </div>
      <div className="smart-tip-glow"></div>
    </div>
  );
};

export default SmartTipCard;
