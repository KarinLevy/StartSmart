import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatDuration } from '../../utils/dateFormat';
import { getTagDisplayColor, TAG_PRESETS } from '../../utils/tagUtils';
import GoogleCalendarCard from '../../components/Schedule/GoogleCalendarCard';
import './Schedule.css';

const DEFAULT_ACCENT = '#6b38d4'; // StartSmart purple

// Return the first tag's display color, or the default purple
const taskAccentColor = (task) => {
  const tags = task.tags || [];
  if (tags.length > 0) return getTagDisplayColor(tags[0]);
  return DEFAULT_ACCENT;
};

// 25 hour marks: 0–23 are full rows, 24 is the closing midnight line
const DAY_HOURS = Array.from({ length: 25 }, (_, i) => i);
// Pixel height of one hour on the timeline canvas
const HOUR_PX = 64;

// ── Utilities ──────────────────────────────────────────────────────────────────
// Use local date components (not UTC) so midnight = same calendar day in any timezone
const toKey = (d) => {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};
const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };

const getMondayOf = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
};

const getSundayOf = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // getDay() === 0 for Sunday
  d.setHours(0, 0, 0, 0);
  return d;
};


// 24-hour label: 0→"00:00", 13→"13:00", 24→"00:00" (closing midnight)
const fmtHour24 = (h) => `${String(h === 24 ? 0 : h).padStart(2, '0')}:00`;

// Returns total minutes from midnight for a timed task, or null if unscheduled
const getTaskMinutes = (task) => {
  if (!task.scheduledDate?.includes('T')) return null;
  const hh = parseInt(task.scheduledDate.slice(11, 13), 10);
  const mm = parseInt(task.scheduledDate.slice(14, 16), 10);
  return hh * 60 + mm;
};

const statusCls = (s) => s === 'done' ? 'sc-done' : s === 'in_progress' ? 'sc-progress' : 'sc-pending';

// ── Header label helper ────────────────────────────────────────────────────────
const getScheduleHeaderLabel = (period, { viewDate, monday, monthYear }, t, isRTL = false, locale = 'en') => {
  if (period === 'Daily') {
    const todayKey = toKey(new Date());
    const diff = Math.round(
      (new Date(toKey(viewDate)) - new Date(todayKey)) / 86400000
    );
    const smartTitle =
      diff === 0 ? t('schedule.today') :
      diff === -1 ? t('schedule.yesterday') :
      diff === 1 ? t('schedule.tomorrow') : null;

    if (smartTitle) {
      const subtitle = viewDate.toLocaleDateString(locale, {
        weekday: 'long', month: 'long', day: 'numeric',
      });
      return { title: smartTitle, subtitle };
    }
    return {
      title: viewDate.toLocaleDateString(locale, {
        weekday: 'short', month: 'short', day: 'numeric',
      }),
      subtitle: t('schedule.daily'),
    };
  }

  if (period === 'Weekly') {
    const thisWeekStart = isRTL ? getSundayOf(new Date()) : getMondayOf(new Date());
    const diff = Math.round((monday - thisWeekStart) / 86400000);
    const smartTitle =
      diff === 0 ? t('schedule.thisWeek') :
      diff === -7 ? t('schedule.lastWeek') :
      diff === 7 ? t('schedule.nextWeek') : null;

    const end = addDays(monday, 6);
    const weekRangeStr = `${monday.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`;
    if (smartTitle) {
      return { title: smartTitle, subtitle: weekRangeStr };
    }
    return { title: weekRangeStr, subtitle: t('schedule.weekly') };
  }

  // Monthly
  const { year, month } = monthYear;
  const n = new Date();
  const ny = n.getFullYear(), nm = n.getMonth();
  const fullMonthYear = `${t(`schedule.month${month}`)} ${year}`;
  const prev = new Date(ny, nm - 1, 1);
  const next = new Date(ny, nm + 1, 1);
  const smartTitle =
    (year === ny && month === nm) ? t('schedule.thisMonth') :
    (year === prev.getFullYear() && month === prev.getMonth()) ? t('schedule.lastMonth') :
    (year === next.getFullYear() && month === next.getMonth()) ? t('schedule.nextMonth') : null;

  if (smartTitle) {
    return { title: smartTitle, subtitle: fullMonthYear };
  }
  return { title: fullMonthYear, subtitle: t('schedule.monthly') };
};

// ── ScheduleTaskModal ──────────────────────────────────────────────────────────
const ScheduleTaskModal = ({ task, onClose, onSave }) => {
  const { t } = useLocale();
  const [date, setDate] = useState(task.scheduledDate?.slice(0, 10) || '');
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = async () => {
    if (!date || !time) return;
    setSaving(true);
    try {
      await onSave(task.id, `${date}T${time}`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="sc-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={t('schedule.scheduleTask')}
    >
      <div className="sc-modal">
        <div className="sc-modal-header">
          <h3 className="sc-modal-title">
            <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
            {t('schedule.scheduleTask')}
          </h3>
          <button className="sc-modal-close" onClick={onClose} aria-label={t('common.cancel')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="sc-modal-task-name">{task.title}</p>
        <div className="sc-modal-fields">
          <label className="sc-modal-field">
            <span className="sc-modal-field-label">{t('schedule.scheduleDate')}</span>
            <input
              type="date"
              className="sc-modal-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label className="sc-modal-field">
            <span className="sc-modal-field-label">{t('schedule.scheduleTime')}</span>
            <input
              type="time"
              className="sc-modal-input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              dir="ltr"
            />
          </label>
        </div>
        <div className="sc-modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!date || !time || saving}
          >
            {saving
              ? <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
              : <span className="material-symbols-outlined" aria-hidden="true">check</span>
            }
            {t('schedule.scheduleSave')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DailyView ──────────────────────────────────────────────────────────────────
const DailyView = ({ viewDate, tasks, onScheduleTask }) => {
  const { t } = useLocale();
  const fmtMin = (m) => m ? formatDuration(m, t) : '';
  const todayKey = toKey(new Date());
  const key      = toKey(viewDate);
  const isToday  = key === todayKey;
  const now      = new Date();

  const dayTasks  = tasks.filter((t) => t.scheduledDate?.slice(0, 10) === key);
  const timed     = dayTasks.filter((t) => getTaskMinutes(t) !== null);
  const unslotted = dayTasks.filter((t) => getTaskMinutes(t) === null);

  // Pixel position of the now-line (null when not viewing today)
  const nowLinePx = isToday
    ? ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX
    : null;

  // Canvas height covers hours 0–24 (24 full rows + closing line)
  const canvasHeight = 24 * HOUR_PX;

  return (
    <div className="sc-daily">
      {/* Current time ribbon pill */}
      {isToday && (
        <div className="sc-now-ribbon" role="status" aria-label="Current time">
          <span className="sc-now-dot" aria-hidden="true" />
          <span className="sc-now-time" dir="ltr">
            {`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`}
          </span>
          <span className="sc-now-label">now</span>
        </div>
      )}

      {/* Timeline canvas */}
      <div className="sc-timeline-canvas" style={{ height: `${canvasHeight}px` }}>

        {/* Hour grid rows */}
        {DAY_HOURS.map((h) => {
          const isNowHour = isToday && h === now.getHours();
          return (
            <div
              key={h}
              className={`sc-hour-row${isNowHour ? ' sc-hour-row-now' : ''}`}
              style={{ top: `${h * HOUR_PX}px` }}
            >
              <div className="sc-hour-label">
                <span dir="ltr">{fmtHour24(h)}</span>
                {isNowHour && <span className="sc-now-badge" aria-label="Current hour">{t('schedule.now')}</span>}
              </div>
              <div className="sc-hour-line" aria-hidden="true" />
            </div>
          );
        })}

        {/* Now line — exact pixel position */}
        {nowLinePx !== null && (
          <div
            className="sc-now-line"
            style={{ top: `${nowLinePx}px` }}
            aria-hidden="true"
          />
        )}

        {/* Task cards — absolutely positioned by start time and duration */}
        <div className="sc-tasks-layer" aria-label="Scheduled tasks">
          {timed.map((t) => {
            const startMin   = getTaskMinutes(t);
            const durationMin = t.estimatedMinutes || 30; // default 30 min when unset
            const topPx      = (startMin / 60) * HOUR_PX;
            // minHeight = duration bar height; card grows beyond this if content needs more space.
            // Never clip — the card is always tall enough to show time + title + est.
            const minHeightPx = Math.max((durationMin / 60) * HOUR_PX, 24);
            const timeStr    = t.scheduledDate.slice(11, 16);

            const accent = taskAccentColor(t);
            return (
              <Link
                key={t.id}
                to={`/task-details/${t.id}`}
                className={`sc-task sc-task-abs ${statusCls(t.status)}`}
                style={{
                  top: `${topPx}px`,
                  minHeight: `${minHeightPx}px`,
                  borderInlineStartColor: accent,
                  background: `${accent}12`,
                }}
              >
                <span className="sc-task-time" dir="ltr">{timeStr}</span>
                <span className="sc-task-title">{t.title}</span>
                {t.estimatedMinutes && <span className="sc-task-est">{fmtMin(t.estimatedMinutes)}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Unscheduled */}
      {unslotted.length > 0 && (
        <div className="sc-unslotted">
          <div className="sc-unslotted-label">
            <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
            {t('schedule.unscheduled')}
          </div>
          <div className="sc-unslotted-tasks">
            {unslotted.map((task) => {
              const accent = taskAccentColor(task);
              return (
                <div
                  key={task.id}
                  className={`sc-task sc-task-unslotted-row ${statusCls(task.status)}`}
                  style={{ borderInlineStartColor: accent, background: `${accent}12` }}
                >
                  <Link
                    to={`/task-details/${task.id}`}
                    className="sc-task-link-area"
                  >
                    <span className="sc-task-title">{task.title}</span>
                    {task.estimatedMinutes && <span className="sc-task-est">{fmtMin(task.estimatedMinutes)}</span>}
                  </Link>
                  <button
                    className="sc-schedule-btn"
                    onClick={() => onScheduleTask(task)}
                    aria-label={`${t('schedule.scheduleTask')}: ${task.title}`}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">more_time</span>
                    {t('schedule.scheduleTask')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {dayTasks.length === 0 && (
        <div className="sc-empty-state">
          <span className="material-symbols-outlined sc-empty-icon" aria-hidden="true">today</span>
          <p>{isToday ? t('schedule.emptyToday') : t('schedule.emptyDay')}</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {t('schedule.emptyBtn')}
          </Link>
        </div>
      )}
    </div>
  );
};

// ── WeeklyView ─────────────────────────────────────────────────────────────────
const WeeklyView = ({ monday, tasks, onDayClick, onScheduleTask }) => {
  const { t, isRTL, locale } = useLocale();
  const todayKey   = toKey(new Date());
  const days       = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const DAY_SHORT = [t('schedule.sun'), t('schedule.mon'), t('schedule.tue'), t('schedule.wed'), t('schedule.thu'), t('schedule.fri'), t('schedule.sat')];
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const k = t.scheduledDate.slice(0, 10);
    (tasksByDate[k] = tasksByDate[k] || []).push(t);
  });

  const weekTotal = days.reduce((sum, d) => sum + (tasksByDate[toKey(d)]?.length ?? 0), 0);

  return (
    <div className="sc-week-wrap">
      {weekTotal === 0 && (
        <div className="sc-empty-state sc-empty-inline">
          <span className="material-symbols-outlined sc-empty-icon" aria-hidden="true">calendar_view_week</span>
          <p>{t('schedule.emptyWeek')}</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {t('schedule.emptyBtn')}
          </Link>
        </div>
      )}
      <div className="sc-week">
        {days.map((d) => {
          const key      = toKey(d);
          const isToday  = key === todayKey;
          const dayTasks = tasksByDate[key] || [];
          return (
            <button
              key={key}
              type="button"
              className={`sc-day${isToday ? ' today' : ''}`}
              onClick={() => onDayClick(d)}
              aria-label={`${d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}, ${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''} — click to view`}
            >
              <div className="sc-day-head">
                <span className="sc-day-name">{DAY_SHORT[d.getDay()]}</span>
                <span className={`sc-day-date${isToday ? ' today-dot' : ''}`}>{d.getDate()}</span>
              </div>
              <div className="sc-day-body">
                {dayTasks.length === 0 ? (
                  <span className="sc-day-empty">{t('schedule.noTasks')}</span>
                ) : (
                  dayTasks.map((task) => {
                    const accent = taskAccentColor(task);
                    const hasTime = task.scheduledDate?.includes('T');
                    return (
                      <span
                        key={task.id}
                        className={`sc-week-task ${statusCls(task.status)}`}
                        style={{ borderInlineStartColor: accent, background: `${accent}12` }}
                      >
                        {hasTime ? (
                          <span className="sc-task-time" dir="ltr">{task.scheduledDate.slice(11, 16)}</span>
                        ) : (
                          <button
                            className="sc-week-schedule-btn"
                            onClick={(e) => { e.stopPropagation(); onScheduleTask(task); }}
                            aria-label={`${t('schedule.scheduleTask')}: ${task.title}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">more_time</span>
                          </button>
                        )}
                        <span className="sc-task-title">{task.title}</span>
                      </span>
                    );
                  })
                )}
              </div>
              {dayTasks.length > 0 && (
                <div className="sc-day-footer">
                  <span className="sc-day-count">{dayTasks.length} {dayTasks.length !== 1 ? t('schedule.tasks') : t('schedule.task')}</span>
                  <span className="material-symbols-outlined sc-day-arrow flip-rtl" aria-hidden="true">arrow_forward</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── MonthlyView ────────────────────────────────────────────────────────────────
const MonthlyView = ({ year, month, tasks, selectedKey, onDayClick, onScheduleTask }) => {
  const { t, locale, isRTL } = useLocale();
  const todayKey = toKey(new Date());
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // RTL (Hebrew/Arabic): week starts on Sunday (Sun=0 … Sat=6).
  // LTR: week starts on Monday (Mon=0 … Sun=6).
  const startOffset = isRTL
    ? firstDay.getDay()                 // Sun=0, Mon=1, …, Sat=6
    : (firstDay.getDay() + 6) % 7;     // Mon=0, …, Sun=6

  // DOM order of day-name headers.
  // In RTL the CSS grid reverses visual order, so DOM Sun→Sat renders as Sat←Sun visually.
  const dowOrder = isRTL
    ? ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const rows = Math.ceil((startOffset + lastDay.getDate()) / 7);

  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const k = t.scheduledDate.slice(0, 10);
    (tasksByDate[k] = tasksByDate[k] || []).push(t);
  });

  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    return new Date(year, month, dayNum);
  });

  const monthTotal = Object.values(tasksByDate).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="sc-month">
      {monthTotal === 0 && (
        <div className="sc-empty-state sc-empty-inline">
          <span className="material-symbols-outlined sc-empty-icon" aria-hidden="true">calendar_month</span>
          <p>{t('schedule.emptyMonth')}</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {t('schedule.emptyBtn')}
          </Link>
        </div>
      )}
      <div className="sc-month-grid">
        {/* Day-name headers live inside the same grid so columns always align */}
        {dowOrder.map((d) => (
          <div key={`dow-${d}`} className="sc-month-dow">{t(`schedule.${d}`)}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} className="sc-month-cell sc-month-blank" />;
          const key        = toKey(d);
          const isToday    = key === todayKey;
          const isSelected = key === selectedKey && !isToday;
          const dayTasks   = tasksByDate[key] || [];
          const MAX = 3;
          return (
            <button
              key={key}
              type="button"
              className={`sc-month-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => onDayClick(d)}
              aria-label={`${d.toLocaleDateString(locale, { month: 'long', day: 'numeric' })}, ${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`}
              aria-pressed={isSelected || isToday}
            >
              <div className={`sc-month-day-num${isToday ? ' today-dot' : ''}`}>{d.getDate()}</div>
              {dayTasks.slice(0, MAX).map((task) => {
                const accent = taskAccentColor(task);
                const hasTime = task.scheduledDate?.includes('T');
                return (
                  <span
                    key={task.id}
                    className={`sc-month-task ${statusCls(task.status)}`}
                    style={{ borderInlineStartColor: accent, background: `${accent}12` }}
                  >
                    {!hasTime && (
                      <button
                        className="sc-month-schedule-btn"
                        onClick={(e) => { e.stopPropagation(); onScheduleTask(task); }}
                        aria-label={`${t('schedule.scheduleTask')}: ${task.title}`}
                        title={t('schedule.scheduleTask')}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">more_time</span>
                      </button>
                    )}
                    {task.title}
                  </span>
                );
              })}
              {dayTasks.length > MAX && (
                <span className="sc-month-more">{t('schedule.moreItems').replace('{n}', dayTasks.length - MAX)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Schedule (main) ────────────────────────────────────────────────────────────
const Schedule = () => {
  const { tasks, loading, updateTask } = useTasks();
  const { t, isRTL, locale } = useLocale();

  const [schedulingTask, setSchedulingTask] = useState(null);

  const handleScheduleSave = async (taskId, iso) => {
    await updateTask(taskId, { scheduledDate: iso });
  };

  // Period & pivot state
  const [period, setPeriod] = useState('Weekly');

  const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const getWeekStart = (date) => isRTL ? getSundayOf(date) : getMondayOf(date);
  const [viewDate,  setViewDate]  = useState(new Date(todayMidnight));
  const [monday,    setMonday]    = useState(getWeekStart(todayMidnight));
  const [monthYear, setMonthYear] = useState({ year: todayMidnight.getFullYear(), month: todayMidnight.getMonth() });

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterPriority, setFilterPriority] = useState(false);
  const [filterTag,      setFilterTag]      = useState('');

  // Resolve a tag to a preset, falling back to purple (the default category)
  const tagToPresetId = (tag) => {
    const color = getTagDisplayColor(tag)?.trim().toLowerCase();
    const preset = TAG_PRESETS.find((p) => p.color.toLowerCase() === color);
    return preset ? preset.id : 'purple';
  };

  // All TAG_PRESETS — show the full list so every category (including General/purple) is always visible
  const activePresets = TAG_PRESETS;

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority && !task.priorityHigh) return false;
    if (filterTag && !(task.tags || []).some((tag) => tagToPresetId(tag) === filterTag)) return false;
    return true;
  }), [tasks, filterStatus, filterPriority, filterTag]);

  const activeFilterCount = (filterStatus !== 'all' ? 1 : 0) + (filterPriority ? 1 : 0) + (filterTag ? 1 : 0);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const nav = (delta) => {
    if (period === 'Daily') {
      setViewDate((d) => { const nd = addDays(d, delta); setMonday(getWeekStart(nd)); return nd; });
    } else if (period === 'Weekly') {
      setMonday((d) => addDays(d, delta * 7));
    } else {
      setMonthYear(({ year, month }) => {
        let m = month + delta, y = year;
        if (m > 11) { m = 0; y++; }
        if (m < 0)  { m = 11; y--; }
        return { year: y, month: m };
      });
    }
  };

  const goToday = () => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    setViewDate(new Date(t));
    setMonday(getWeekStart(t));
    setMonthYear({ year: t.getFullYear(), month: t.getMonth() });
    setPeriod('Daily');
  };

  // Clicking a day in Weekly or Monthly: switch to Daily view for that date
  const handleDayClick = (d) => {
    const nd = new Date(d); nd.setHours(0, 0, 0, 0);
    setViewDate(nd);
    setMonday(getWeekStart(nd));
    setPeriod('Daily');
  };

  // ── Smart labels ────────────────────────────────────────────────────────────
  const rangeLabel = useMemo(
    () => getScheduleHeaderLabel(period, { viewDate, monday, monthYear }, t, isRTL, locale),
    [period, viewDate, monday, monthYear, t, isRTL, locale]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageShell
      title={t('schedule.title')}
      subtitle={t('schedule.subtitle')}
      actions={
        <Link to="/create-task" className="btn btn-primary">
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          {t('schedule.newTask')}
        </Link>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-outline)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        </div>
      ) : <>
      {/* Toolbar */}
      <div className="sc-toolbar surface-card">
        <div className="sc-period-toggle" role="tablist" aria-label="View period">
          {[
            { key: 'Daily', label: t('schedule.daily') },
            { key: 'Weekly', label: t('schedule.weekly') },
            { key: 'Monthly', label: t('schedule.monthly') },
          ].map(({ key: p, label }) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              className={`sc-period-btn${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sc-nav-group">
          <button
            className="sc-nav-btn"
            onClick={() => nav(-1)}
            aria-label={`Previous ${period.toLowerCase()}`}
          >
            <span className="material-symbols-outlined">{isRTL ? 'chevron_right' : 'chevron_left'}</span>
          </button>

          <div className="sc-range" aria-live="polite">
            <span className="sc-range-primary">{rangeLabel.title}</span>
            {rangeLabel.subtitle && (
              <span className="sc-range-secondary">{rangeLabel.subtitle}</span>
            )}
          </div>

          <button
            className="sc-nav-btn"
            onClick={() => nav(1)}
            aria-label={`Next ${period.toLowerCase()}`}
          >
            <span className="material-symbols-outlined">{isRTL ? 'chevron_left' : 'chevron_right'}</span>
          </button>
        </div>

        <button className="sc-today-btn" onClick={goToday} aria-label="Jump to today">
          <span className="material-symbols-outlined" aria-hidden="true">today</span>
          {t('schedule.today')}
        </button>
      </div>

      {/* Google Calendar quick-access card */}
      <GoogleCalendarCard />

      {/* Filter bar */}
      <div className="sc-filter-bar surface-card">
        <div className="sc-filter-section">
          <span className="sc-filter-label" id="status-filter-label">{t('schedule.statusLabel')}</span>
          <div className="sc-filter-group" role="group" aria-labelledby="status-filter-label">
            {[
              { v: 'all', label: t('schedule.all') },
              { v: 'pending', label: t('schedule.pending') },
              { v: 'in_progress', label: t('schedule.inProgress') },
              { v: 'done', label: t('schedule.done') },
            ].map(({ v, label }) => (
              <button
                key={v}
                className={`sc-filter-btn${filterStatus === v ? ' active' : ''}`}
                onClick={() => setFilterStatus(v)}
                aria-pressed={filterStatus === v}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="sc-filter-sep" aria-hidden="true" />

        <div className="sc-filter-section">
          <button
            className={`sc-filter-btn sc-filter-priority-btn${filterPriority ? ' active' : ''}`}
            onClick={() => setFilterPriority((v) => !v)}
            aria-pressed={filterPriority}
          >
            <span className="material-symbols-outlined" aria-hidden="true">flag</span>
            {t('schedule.highPriority')}
          </button>
        </div>

        {activePresets.length > 0 && (
          <>
            <div className="sc-filter-sep" aria-hidden="true" />
            <div className="sc-filter-section">
              <span className="sc-filter-label" id="tag-filter-label">{t('schedule.tagsLabel')}</span>
              <div className="sc-filter-group" role="group" aria-labelledby="tag-filter-label">
                <button
                  className={`sc-filter-btn${!filterTag ? ' active' : ''}`}
                  onClick={() => setFilterTag('')}
                  aria-pressed={!filterTag}
                >
                  {t('schedule.all')}
                </button>
                {activePresets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`sc-filter-btn${filterTag === preset.id ? ' active' : ''}`}
                    onClick={() => setFilterTag((id) => (id === preset.id ? '' : preset.id))}
                    aria-pressed={filterTag === preset.id}
                  >
                    <span className="sc-tag-dot" style={{ background: preset.color }} aria-hidden="true" />
                    {t(`tag.color.${preset.id}.hint`)}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeFilterCount > 0 && (
          <button
            className="sc-filter-clear"
            onClick={() => { setFilterStatus('all'); setFilterPriority(false); setFilterTag(''); }}
            aria-label="Clear all filters"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
            {t('schedule.clear')}
          </button>
        )}
      </div>

      {/* Views */}
      {period === 'Daily' && (
        <DailyView viewDate={viewDate} tasks={filteredTasks} onScheduleTask={setSchedulingTask} />
      )}
      {period === 'Weekly' && (
        <WeeklyView monday={monday} tasks={filteredTasks} onDayClick={handleDayClick} onScheduleTask={setSchedulingTask} />
      )}
      {period === 'Monthly' && (
        <MonthlyView
          year={monthYear.year}
          month={monthYear.month}
          tasks={filteredTasks}
          selectedKey={toKey(viewDate)}
          onDayClick={handleDayClick}
          onScheduleTask={setSchedulingTask}
        />
      )}

      {/* Schedule task modal */}
      {schedulingTask && (
        <ScheduleTaskModal
          task={schedulingTask}
          onClose={() => setSchedulingTask(null)}
          onSave={handleScheduleSave}
        />
      )}
      </>}
    </PageShell>
  );
};

export default Schedule;
