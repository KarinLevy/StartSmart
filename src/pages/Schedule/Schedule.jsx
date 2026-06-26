import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import './Schedule.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const periods = ['Daily', 'Weekly', 'Monthly'];

const fmtMin = (m) => {
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  return `${m}m`;
};

const Schedule = () => {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState('Weekly');

  const today = new Date();
  const todayDay = today.getDay();

  // Build a 7-day window starting from Monday of this week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((todayDay + 6) % 7));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  // Group tasks by date string
  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.scheduledDate) return;
    const key = t.scheduledDate.slice(0, 10);
    if (!tasksByDate[key]) tasksByDate[key] = [];
    tasksByDate[key].push(t);
  });

  const rangeLabel = `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <PageShell
      title="Schedule"
      subtitle="See your tasks laid out across time, so the day feels realistic."
      actions={
        <Link to="/create-task" className="btn btn-primary">
          <span className="material-symbols-outlined">add</span>
          New task
        </Link>
      }
    >
      <div className="sc-toolbar surface-card">
        <div className="sc-period-toggle">
          {periods.map((p) => (
            <button key={p} className={`sc-period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
        <span className="sc-range">{rangeLabel}</span>
      </div>

      <div className="sc-week">
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const isToday = key === today.toISOString().slice(0, 10);
          const dayTasks = tasksByDate[key] || [];
          return (
            <div key={key} className={`sc-day ${isToday ? 'today' : ''}`}>
              <div className="sc-day-head">
                <span className="sc-day-name">{DAY_NAMES[d.getDay()]}</span>
                <span className="sc-day-date">{d.getDate()}</span>
              </div>
              <div className="sc-day-body">
                {dayTasks.length === 0 ? (
                  <span className="sc-day-empty">No tasks</span>
                ) : (
                  dayTasks.map((task) => {
                    const timeStr = task.scheduledDate.includes('T')
                      ? task.scheduledDate.slice(11, 16)
                      : '';
                    const statusCls = task.status === 'done' ? 'done' : task.status === 'in_progress' ? 'progress' : 'pending';
                    return (
                      <Link to={`/task-details/${task.id}`} key={task.id} className={`sc-task sc-${statusCls}`}>
                        {timeStr && <span className="sc-task-time">{timeStr}</span>}
                        <span className="sc-task-title">{task.title}</span>
                        <span className="sc-task-est">{fmtMin(task.estimatedMinutes)}</span>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
};

export default Schedule;
