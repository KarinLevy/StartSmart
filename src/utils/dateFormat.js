/**
 * Centralized date/time formatting utilities.
 * All functions respect the user's regional settings:
 *   - timezone   : IANA timezone string (e.g. 'Asia/Jerusalem')
 *   - dateFormat : 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
 *   - timeFormat : '24h' | '12h'
 */

/**
 * Format a date value according to the user's dateFormat and timezone.
 * @param {Date|string|number} date
 * @param {{ dateFormat?: string, timezone?: string }} settings
 * @returns {string}
 */
export function formatDate(date, { dateFormat = 'DD/MM/YYYY', timezone } = {}) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return '';
    const opts = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (timezone) opts.timeZone = timezone;
    // en-CA produces YYYY-MM-DD which is easy to extract parts from
    const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(d);
    const y  = parts.find(p => p.type === 'year')?.value  ?? '';
    const mo = parts.find(p => p.type === 'month')?.value ?? '';
    const dy = parts.find(p => p.type === 'day')?.value   ?? '';
    switch (dateFormat) {
      case 'MM/DD/YYYY': return `${mo}/${dy}/${y}`;
      case 'YYYY-MM-DD': return `${y}-${mo}-${dy}`;
      case 'DD.MM.YYYY': return `${dy}.${mo}.${y}`;
      default:           return `${dy}/${mo}/${y}`; // DD/MM/YYYY
    }
  } catch { return ''; }
}

/**
 * Format a time value according to the user's timeFormat and timezone.
 * @param {Date|string|number} date
 * @param {{ timeFormat?: string, timezone?: string }} settings
 * @returns {string}
 */
export function formatTime(date, { timeFormat = '24h', timezone } = {}) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return '';
    const opts = { hour: '2-digit', minute: '2-digit', hour12: timeFormat === '12h' };
    if (timezone) opts.timeZone = timezone;
    return new Intl.DateTimeFormat('en', opts).format(d);
  } catch { return ''; }
}

/**
 * Format a date+time value using both formatDate and formatTime.
 * @param {Date|string|number} date
 * @param {{ dateFormat?: string, timeFormat?: string, timezone?: string }} settings
 * @returns {string}
 */
export function formatDateTime(date, settings = {}) {
  if (!date) return '';
  return `${formatDate(date, settings)} ${formatTime(date, settings)}`;
}

/**
 * Format a duration in minutes using localized i18n keys.
 * @param {number|null} totalMinutes
 * @param {function} t  - the t() translation function from useLocale()
 * @returns {string}
 */
/**
 * Format a gap value (actual − estimated minutes) with a +/− sign.
 * Rounds to the nearest minute. Returns '--' for null/undefined.
 * @param {number|null} gap
 * @param {function} t  - the t() translation function from useLocale()
 * @returns {string}
 */
export function formatGap(gap, t) {
  if (gap == null) return '--';
  const rounded = Math.round(gap);
  const abs = formatDuration(Math.abs(rounded), t);
  return rounded > 0 ? `+${abs}` : rounded < 0 ? `-${abs}` : abs;
}

export function formatDuration(totalMinutes, t) {
  if (totalMinutes == null) return '--';
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  const hStr = h === 0 ? null
    : h === 1 ? t('duration.h1')
    : h === 2 ? t('duration.h2')
    : t('duration.hN', { n: h });
  const mStr = m === 0 ? null
    : m === 1 ? t('duration.m1')
    : t('duration.mN', { n: m });
  if (hStr && mStr) return t('duration.hm', { h: hStr, m: mStr });
  return hStr ?? mStr ?? t('duration.mN', { n: 0 });
}


export function formatRelativeTime(iso, t) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  if (min < 1)   return t('notif.time.justNow');
  if (min < 60)  return t('notif.time.minAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24)   return t('notif.time.hrAgo', { n: hr });
  const days = Math.floor(hr / 24);
  if (days === 1) return t('notif.time.yesterday');
  return t('notif.time.daysAgo', { n: days });
}

/**
 * Calculate Focus Intensity data for the last 7 days.
 *
 * Formula (per day):
 *   rawScore = Σ actualMinutes of tasks where:
 *     - completedAt falls on that calendar day  (when focus actually happened)
 *     - task.status === 'done'  (only finished work counts)
 *   Falls back to scheduledDate if completedAt is missing.
 *
 * Bar heights are normalized relative to the busiest day in the window
 * (max day = 100%). Days with zero minutes show as 0 — no artificial minimum.
 * Non-zero days get a minimum visual height of 6% so short bars are readable.
 *
 * Trend (today vs yesterday):
 *   trendPct = round((today - yesterday) / max(yesterday, 1) * 100)
 *
 * @param {Array}  tasks   - task objects from TasksContext
 * @param {string} locale  - BCP-47 locale string for day abbreviations
 * @returns {{ bars: Array<{heightPct,isToday,minutes}>, labels: string[], trend: number|null }}
 */
export function calcFocusIntensity(tasks, locale = 'en') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build the 7-day window: index 0 = 6 days ago, index 6 = today
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  });

  // Bucket actual focus minutes by the day the task was COMPLETED.
  // Only completedAt counts — scheduled tasks with no completion date are not focus activity.
  const minutesByDay = Object.fromEntries(days.map((d) => [d, 0]));
  for (const task of tasks) {
    if (task.status !== 'done' || !task.completedAt || !task.actualMinutes) continue;
    const dateKey = task.completedAt.slice(0, 10);
    if (dateKey in minutesByDay) {
      minutesByDay[dateKey] += task.actualMinutes;
    }
  }

  const values = days.map((d) => minutesByDay[d]);
  const maxVal = Math.max(...values, 1);

  const bars = values.map((v, i) => ({
    heightPct: v === 0 ? 0 : Math.max(Math.round((v / maxVal) * 100), 6),
    hasData:   v > 0,   // true → primary accent; false → subtle background
    isToday:   i === 6,
    minutes:   v,
  }));

  // Trend: % change from yesterday to today
  const todayMin     = values[6];
  const yesterdayMin = values[5];
  const trend =
    todayMin === 0 && yesterdayMin === 0
      ? null
      : Math.round(((todayMin - yesterdayMin) / Math.max(yesterdayMin, 1)) * 100);

  // One narrow label per bar (single letter in both EN and HE via Intl)
  const labels = days.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString(locale, { weekday: 'narrow' });
  });

  return { bars, labels, trend };
}
