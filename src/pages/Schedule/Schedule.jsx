import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import './Schedule.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [20, 21, 22, 23, 24, 25, 26];

// Placeholder/dummy scheduled tasks per weekday — replaced by real data later.
const scheduled = {
  Mon: [{ time: '09:00', title: 'Refine Product Architecture', status: 'progress', est: '45m' }],
  Tue: [
    { time: '10:30', title: 'Client Feedback Loop', status: 'pending', est: '45m' },
    { time: '14:00', title: 'Write Sprint Summary', status: 'pending', est: '1h' },
  ],
  Wed: [{ time: '11:00', title: 'Database Migration Check', status: 'done', est: '30m' }],
  Thu: [{ time: '09:30', title: 'Design Review', status: 'pending', est: '1h 15m' }],
  Fri: [{ time: '16:00', title: 'Weekly Planning', status: 'pending', est: '30m' }],
  Sat: [],
  Sun: [],
};

const periods = ['Daily', 'Weekly', 'Monthly'];

const Schedule = () => {
  const [period, setPeriod] = useState('Weekly');

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
            <button
              key={p}
              className={`sc-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="sc-range">October 20 – 26, 2023</span>
      </div>

      <div className="sc-week">
        {days.map((day, i) => (
          <div key={day} className={`sc-day ${day === 'Mon' ? 'today' : ''}`}>
            <div className="sc-day-head">
              <span className="sc-day-name">{day}</span>
              <span className="sc-day-date">{dates[i]}</span>
            </div>
            <div className="sc-day-body">
              {scheduled[day].length === 0 ? (
                <span className="sc-day-empty">No tasks</span>
              ) : (
                scheduled[day].map((task, idx) => (
                  <Link to="/task-details" key={idx} className={`sc-task sc-${task.status}`}>
                    <span className="sc-task-time">{task.time}</span>
                    <span className="sc-task-title">{task.title}</span>
                    <span className="sc-task-est">{task.est}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default Schedule;
