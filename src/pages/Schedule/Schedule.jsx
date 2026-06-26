import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './Schedule.css';

// ── Constants ──────────────────────────────────────────────────────────────────
const DAY_NAMES_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

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

const fmtMin = (m) => {
  if (!m) return '';
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m}m`;
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

// ── Smart labels ───────────────────────────────────────────────────────────────
// ── Centralised header label helper ──────────────────────────────────────────
// Returns { title, subtitle } — title and subtitle are NEVER the same string.
//
// Daily:
//   smart day  → { title: 'Today',     subtitle: 'Friday, June 26' }
//   other day  → { title: 'Mon, Jun 30', subtitle: 'Daily view' }
//
// Weekly:
//   smart week → { title: 'This Week', subtitle: 'Jun 22 – Jun 28' }
//   other week → { title: 'Jun 22 – Jun 28', subtitle: 'Weekly view' }
//
// Monthly:
//   smart month → { title: 'This Month', subtitle: 'June 2026' }
//   other month → { title: 'June 2026',  subtitle: 'Monthly view' }

const weekRange = (monday) => {
  const end = addDays(monday, 6);
  return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const getScheduleHeaderLabel = (period, { viewDate, monday, monthYear }) => {
  if (period === 'Daily') {
    const todayKey = toKey(new Date());
    const diff = Math.round(
      (new Date(toKey(viewDate)) - new Date(todayKey)) / 86400000
    );
    const smartTitle =
      diff === 0 ? 'Today' :
      diff === -1 ? 'Yesterday' :
      diff === 1 ? 'Tomorrow' : null;

    if (smartTitle) {
      const subtitle = viewDate.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      });
      return { title: smartTitle, subtitle };
    }
    // Non-smart day: title = the date, subtitle = view name
    return {
      title: viewDate.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      }),
      subtitle: 'Daily view',
    };
  }

  if (period === 'Weekly') {
    const thisMon = getMondayOf(new Date());
    const diff = Math.round((monday - thisMon) / 86400000);
    const smartTitle =
      diff === 0 ? 'This Week' :
      diff === -7 ? 'Last Week' :
      diff === 7 ? 'Next Week' : null;

    if (smartTitle) {
      return { title: smartTitle, subtitle: weekRange(monday) };
    }
    // Non-smart week: title = range, subtitle = view name
    return { title: weekRange(monday), subtitle: 'Weekly view' };
  }

  // Monthly
  const { year, month } = monthYear;
  const n = new Date();
  const ny = n.getFullYear(), nm = n.getMonth();
  const fullMonthYear = `${MONTHS[month]} ${year}`;
  const prev = new Date(ny, nm - 1, 1);
  const next = new Date(ny, nm + 1, 1);
  const smartTitle =
    (year === ny && month === nm) ? 'This Month' :
    (year === prev.getFullYear() && month === prev.getMonth()) ? 'Last Month' :
    (year === next.getFullYear() && month === next.getMonth()) ? 'Next Month' : null;

  if (smartTitle) {
    return { title: smartTitle, subtitle: fullMonthYear };
  }
  return { title: fullMonthYear, subtitle: 'Monthly view' };
};

// ── DailyView ──────────────────────────────────────────────────────────────────
// Continuous absolute-positioned canvas: each hour = HOUR_PX pixels.
// Tasks are positioned at (startMinutes / 60) * HOUR_PX from the top
// and sized by (durationMinutes / 60) * HOUR_PX.
const DailyView = ({ viewDate, tasks }) => {
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
          <span className="sc-now-time">
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
                <span>{fmtHour24(h)}</span>
                {isNowHour && <span className="sc-now-badge" aria-label="Current hour">Now</span>}
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

            return (
              <Link
                key={t.id}
                to={`/task-details/${t.id}`}
                className={`sc-task sc-task-abs ${statusCls(t.status)}`}
                style={{ top: `${topPx}px`, minHeight: `${minHeightPx}px` }}
              >
                <span className="sc-task-time">{timeStr}</span>
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
            Unscheduled
          </div>
          <div className="sc-unslotted-tasks">
            {unslotted.map((t) => (
              <Link key={t.id} to={`/task-details/${t.id}`} className={`sc-task ${statusCls(t.status)}`}>
                <span className="sc-task-title">{t.title}</span>
                {t.estimatedMinutes && <span className="sc-task-est">{fmtMin(t.estimatedMinutes)}</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {dayTasks.length === 0 && (
        <div className="sc-empty-state">
          <span className="material-symbols-outlined sc-empty-icon" aria-hidden="true">today</span>
          <p>No tasks scheduled{isToday ? ' for today' : ' for this day'}.</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Create Task
          </Link>
        </div>
      )}
    </div>
  );
};

// ── WeeklyView ─────────────────────────────────────────────────────────────────
const WeeklyView = ({ monday, tasks, onDayClick }) => {
  const todayKey   = toKey(new Date());
  const days       = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
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
          <p>No tasks scheduled this week.</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Create Task
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
              aria-label={`${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}, ${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''} — click to view`}
            >
              <div className="sc-day-head">
                <span className="sc-day-name">{DAY_NAMES_SHORT[d.getDay()]}</span>
                <span className={`sc-day-date${isToday ? ' today-dot' : ''}`}>{d.getDate()}</span>
              </div>
              <div className="sc-day-body">
                {dayTasks.length === 0 ? (
                  <span className="sc-day-empty">No tasks</span>
                ) : (
                  dayTasks.map((t) => (
                    <span key={t.id} className={`sc-week-task ${statusCls(t.status)}`}>
                      {t.scheduledDate?.includes('T') && (
                        <span className="sc-task-time">{t.scheduledDate.slice(11, 16)}</span>
                      )}
                      <span className="sc-task-title">{t.title}</span>
                    </span>
                  ))
                )}
              </div>
              {dayTasks.length > 0 && (
                <div className="sc-day-footer">
                  <span className="sc-day-count">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                  <span className="material-symbols-outlined sc-day-arrow" aria-hidden="true">arrow_forward</span>
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
const MonthlyView = ({ year, month, tasks, selectedKey, onDayClick }) => {
  const todayKey = toKey(new Date());
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon-based
  const rows    = Math.ceil((startOffset + lastDay.getDate()) / 7);

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
          <p>No tasks scheduled this month.</p>
          <Link to="/create-task" className="btn btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Create Task
          </Link>
        </div>
      )}
      <div className="sc-month-dow-row">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((n) => (
          <div key={n} className="sc-month-dow">{n}</div>
        ))}
      </div>
      <div className="sc-month-grid">
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
              aria-label={`${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`}
              aria-pressed={isSelected || isToday}
            >
              <div className={`sc-month-day-num${isToday ? ' today-dot' : ''}`}>{d.getDate()}</div>
              {dayTasks.slice(0, MAX).map((t) => (
                <span key={t.id} className={`sc-month-task ${statusCls(t.status)}`}>
                  {t.title}
                </span>
              ))}
              {dayTasks.length > MAX && (
                <span className="sc-month-more">+{dayTasks.length - MAX} more</span>
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
  const { tasks } = useTasks();

  // Period & pivot state
  const [period, setPeriod] = useState('Weekly');

  const todayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const [viewDate,  setViewDate]  = useState(new Date(todayMidnight));
  const [monday,    setMonday]    = useState(getMondayOf(todayMidnight));
  const [monthYear, setMonthYear] = useState({ year: todayMidnight.getFullYear(), month: todayMidnight.getMonth() });

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterPriority, setFilterPriority] = useState(false);
  const [filterTag,      setFilterTag]      = useState('');

  // Unique tag names from all tasks
  const allTagNames = useMemo(() => {
    const names = new Set();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => names.add(tag.name)));
    return [...names].sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority && !t.priorityHigh) return false;
    if (filterTag && !(t.tags || []).some((tag) => tag.name === filterTag)) return false;
    return true;
  }), [tasks, filterStatus, filterPriority, filterTag]);

  const activeFilterCount = (filterStatus !== 'all' ? 1 : 0) + (filterPriority ? 1 : 0) + (filterTag ? 1 : 0);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const nav = (delta) => {
    if (period === 'Daily') {
      setViewDate((d) => { const nd = addDays(d, delta); setMonday(getMondayOf(nd)); return nd; });
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
    setMonday(getMondayOf(t));
    setMonthYear({ year: t.getFullYear(), month: t.getMonth() });
    setPeriod('Daily');
  };

  // Clicking a day in Weekly or Monthly: switch to Daily view for that date
  const handleDayClick = (d) => {
    const nd = new Date(d); nd.setHours(0, 0, 0, 0);
    setViewDate(nd);
    setMonday(getMondayOf(nd));
    setPeriod('Daily');
  };

  // ── Smart labels ────────────────────────────────────────────────────────────
  const rangeLabel = useMemo(
    () => getScheduleHeaderLabel(period, { viewDate, monday, monthYear }),
    [period, viewDate, monday, monthYear]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Schedule"
      subtitle="Your tasks laid out across time."
      actions={
        <Link to="/create-task" className="btn btn-primary">
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          New task
        </Link>
      }
    >
      {/* Toolbar */}
      <div className="sc-toolbar surface-card">
        <div className="sc-period-toggle" role="tablist" aria-label="View period">
          {['Daily', 'Weekly', 'Monthly'].map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              className={`sc-period-btn${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="sc-nav-group">
          <button
            className="sc-nav-btn"
            onClick={() => nav(-1)}
            aria-label={`Previous ${period.toLowerCase()}`}
          >
            <span className="material-symbols-outlined">chevron_left</span>
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
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <button className="sc-today-btn" onClick={goToday} aria-label="Jump to today">
          <span className="material-symbols-outlined" aria-hidden="true">today</span>
          Today
        </button>
      </div>

      {/* Filter bar */}
      <div className="sc-filter-bar surface-card">
        <div className="sc-filter-section">
          <span className="sc-filter-label" id="status-filter-label">Status</span>
          <div className="sc-filter-group" role="group" aria-labelledby="status-filter-label">
            {[
              { v: 'all', label: 'All' },
              { v: 'pending', label: 'Pending' },
              { v: 'in_progress', label: 'In Progress' },
              { v: 'done', label: 'Done' },
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
            High Priority
          </button>
        </div>

        {allTagNames.length > 0 && (
          <>
            <div className="sc-filter-sep" aria-hidden="true" />
            <div className="sc-filter-section">
              <span className="sc-filter-label" id="tag-filter-label">Tags</span>
              <div className="sc-filter-group" role="group" aria-labelledby="tag-filter-label">
                <button
                  className={`sc-filter-btn${!filterTag ? ' active' : ''}`}
                  onClick={() => setFilterTag('')}
                  aria-pressed={!filterTag}
                >
                  All
                </button>
                {allTagNames.map((name) => (
                  <button
                    key={name}
                    className={`sc-filter-btn${filterTag === name ? ' active' : ''}`}
                    onClick={() => setFilterTag((n) => (n === name ? '' : name))}
                    aria-pressed={filterTag === name}
                  >
                    {name}
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
            Clear
          </button>
        )}
      </div>

      {/* Views */}
      {period === 'Daily' && (
        <DailyView viewDate={viewDate} tasks={filteredTasks} />
      )}
      {period === 'Weekly' && (
        <WeeklyView monday={monday} tasks={filteredTasks} onDayClick={handleDayClick} />
      )}
      {period === 'Monthly' && (
        <MonthlyView
          year={monthYear.year}
          month={monthYear.month}
          tasks={filteredTasks}
          selectedKey={toKey(viewDate)}
          onDayClick={handleDayClick}
        />
      )}
    </PageShell>
  );
};

export default Schedule;
