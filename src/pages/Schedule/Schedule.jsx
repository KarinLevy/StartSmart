import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './Schedule.css';

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am – 10pm

const toKey = (d) => d.toISOString().slice(0, 10);

const fmtMin = (m) => {
  if (!m) return '';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const fmtHour = (h) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
};

const getTaskHour = (task) => {
  if (task.scheduledDate && task.scheduledDate.includes('T')) {
    return parseInt(task.scheduledDate.slice(11, 13), 10);
  }
  return null;
};

const statusCls = (s) => (s === 'done' ? 'sc-done' : s === 'in_progress' ? 'sc-progress' : 'sc-pending');

// ── helpers ────────────────────────────────────────────────────────────────
const getMondayOf = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

// ── Daily View ─────────────────────────────────────────────────────────────
const DailyView = ({ viewDate, tasks }) => {
  const key = toKey(viewDate);
  const dayTasks = tasks.filter((t) => t.scheduledDate?.slice(0, 10) === key);
  const unslotted = dayTasks.filter((t) => !t.scheduledDate?.includes('T'));

  return (
    <div className="sc-daily">
      <div className="sc-daily-header">
        <span className="sc-daily-weekday">{DAY_NAMES_FULL[viewDate.getDay()]}</span>
        <span className="sc-daily-full-date">
          {viewDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        {dayTasks.length > 0 && (
          <span className="sc-daily-count">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="sc-timeline">
        {HOURS.map((h) => {
          const slotTasks = dayTasks.filter((t) => getTaskHour(t) === h);
          return (
            <div key={h} className="sc-slot">
              <div className="sc-slot-label">{fmtHour(h)}</div>
              <div className="sc-slot-line" aria-hidden="true" />
              <div className="sc-slot-tasks">
                {slotTasks.map((t) => (
                  <Link key={t.id} to={`/task-details/${t.id}`} className={`sc-task ${statusCls(t.status)}`}>
                    <span className="sc-task-time">{t.scheduledDate.slice(11, 16)}</span>
                    <span className="sc-task-title">{t.title}</span>
                    {t.estimatedMinutes && <span className="sc-task-est">{fmtMin(t.estimatedMinutes)}</span>}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {unslotted.length > 0 && (
        <div className="sc-unslotted">
          <div className="sc-unslotted-label">
            <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
            No specific time
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

      {dayTasks.length === 0 && (
        <div className="sc-empty-state">
          <span className="material-symbols-outlined sc-empty-icon" aria-hidden="true">today</span>
          <p>No tasks scheduled for this day.</p>
          <Link to="/create-task" className="btn-primary">
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            Add a task
          </Link>
        </div>
      )}
    </div>
  );
};

// ── Weekly View ────────────────────────────────────────────────────────────
const WeeklyView = ({ monday, tasks }) => {
  const today = toKey(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const k = t.scheduledDate.slice(0, 10);
    (tasksByDate[k] = tasksByDate[k] || []).push(t);
  });

  return (
    <div className="sc-week">
      {days.map((d) => {
        const key = toKey(d);
        const isToday = key === today;
        const dayTasks = tasksByDate[key] || [];
        return (
          <div key={key} className={`sc-day${isToday ? ' today' : ''}`}>
            <div className="sc-day-head">
              <span className="sc-day-name">{DAY_NAMES_SHORT[d.getDay()]}</span>
              <span className={`sc-day-date${isToday ? ' today-dot' : ''}`}>{d.getDate()}</span>
            </div>
            <div className="sc-day-body">
              {dayTasks.length === 0 ? (
                <span className="sc-day-empty">–</span>
              ) : (
                dayTasks.map((t) => (
                  <Link key={t.id} to={`/task-details/${t.id}`} className={`sc-task ${statusCls(t.status)}`}>
                    {t.scheduledDate?.includes('T') && (
                      <span className="sc-task-time">{t.scheduledDate.slice(11, 16)}</span>
                    )}
                    <span className="sc-task-title">{t.title}</span>
                    {t.estimatedMinutes && <span className="sc-task-est">{fmtMin(t.estimatedMinutes)}</span>}
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Monthly View ───────────────────────────────────────────────────────────
const MonthlyView = ({ year, month, tasks }) => {
  const today = toKey(new Date());
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // leading blanks (Mon-based)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = startOffset + lastDay.getDate();
  const rows = Math.ceil(totalCells / 7);

  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const k = t.scheduledDate.slice(0, 10);
    (tasksByDate[k] = tasksByDate[k] || []).push(t);
  });

  const cells = Array.from({ length: rows * 7 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null;
    const d = new Date(year, month, dayNum);
    return d;
  });

  return (
    <div className="sc-month">
      <div className="sc-month-dow-row">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((n) => (
          <div key={n} className="sc-month-dow">{n}</div>
        ))}
      </div>
      <div className="sc-month-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} className="sc-month-cell sc-month-blank" />;
          const key = toKey(d);
          const isToday = key === today;
          const dayTasks = tasksByDate[key] || [];
          const MAX = 3;
          return (
            <div key={key} className={`sc-month-cell${isToday ? ' today' : ''}`}>
              <div className={`sc-month-day-num${isToday ? ' today-dot' : ''}`}>{d.getDate()}</div>
              {dayTasks.slice(0, MAX).map((t) => (
                <Link key={t.id} to={`/task-details/${t.id}`} className={`sc-month-task ${statusCls(t.status)}`}>
                  {t.title}
                </Link>
              ))}
              {dayTasks.length > MAX && (
                <span className="sc-month-more">+{dayTasks.length - MAX} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────
const Schedule = () => {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState('Weekly');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate,  setViewDate]  = useState(new Date(today));               // daily pivot
  const [monday,    setMonday]    = useState(getMondayOf(today));             // weekly pivot
  const [monthYear, setMonthYear] = useState({ year: today.getFullYear(), month: today.getMonth() }); // monthly pivot

  // navigation
  const nav = (delta) => {
    if (period === 'Daily') {
      setViewDate((d) => addDays(d, delta));
    } else if (period === 'Weekly') {
      setMonday((d) => addDays(d, delta * 7));
    } else {
      setMonthYear(({ year, month }) => {
        let m = month + delta;
        let y = year;
        if (m > 11) { m = 0; y++; }
        if (m < 0)  { m = 11; y--; }
        return { year: y, month: m };
      });
    }
  };

  const goToday = () => {
    const t = new Date(); t.setHours(0,0,0,0);
    setViewDate(new Date(t));
    setMonday(getMondayOf(t));
    setMonthYear({ year: t.getFullYear(), month: t.getMonth() });
  };

  // range label
  let rangeLabel = '';
  if (period === 'Daily') {
    rangeLabel = viewDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  } else if (period === 'Weekly') {
    const end = addDays(monday, 6);
    rangeLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else {
    rangeLabel = `${MONTHS[monthYear.month]} ${monthYear.year}`;
  }

  return (
    <PageShell
      title="Schedule"
      subtitle="See your tasks laid out across time."
      actions={
        <Link to="/create-task" className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          New task
        </Link>
      }
    >
      {/* toolbar */}
      <div className="sc-toolbar surface-card">
        <div className="sc-period-toggle">
          {['Daily', 'Weekly', 'Monthly'].map((p) => (
            <button
              key={p}
              className={`sc-period-btn${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="sc-nav-group">
          <button className="sc-nav-btn" onClick={() => nav(-1)} aria-label="Previous">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className="sc-range">{rangeLabel}</span>
          <button className="sc-nav-btn" onClick={() => nav(1)} aria-label="Next">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        <button className="sc-today-btn" onClick={goToday}>Today</button>
      </div>

      {period === 'Daily'   && <DailyView   viewDate={viewDate}           tasks={tasks} />}
      {period === 'Weekly'  && <WeeklyView  monday={monday}               tasks={tasks} />}
      {period === 'Monthly' && <MonthlyView year={monthYear.year} month={monthYear.month} tasks={tasks} />}
    </PageShell>
  );
};

export default Schedule;
