import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import StatisticsCard from '../../components/Statistics/StatisticsCard';
import ProductivityChart from '../../components/Statistics/ProductivityChart';
import InsightCard from '../../components/Statistics/InsightCard';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import '../../components/Statistics/Statistics.css';

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};
const fmtGap = (g) => (g > 0 ? `+${g.toFixed(1)}m` : `${g.toFixed(1)}m`);

const getMondayOf = (d) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x;
};

const filterByPeriod = (tasks, period) => {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  if (period === 'Daily') {
    return tasks.filter((t) => t.scheduledDate?.slice(0, 10) === todayKey);
  }
  if (period === 'Weekly') {
    const mon = getMondayOf(now);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (!t.scheduledDate) return false;
      const d = new Date(t.scheduledDate);
      return d >= mon && d <= sun;
    });
  }
  if (period === 'Monthly') {
    const y = now.getFullYear();
    const m = now.getMonth();
    return tasks.filter((t) => {
      if (!t.scheduledDate) return false;
      const d = new Date(t.scheduledDate);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }
  return tasks; // 'All'
};

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'All'];

const Statistics = () => {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState('All');

  const filtered = filterByPeriod(tasks, period);
  const done    = filtered.filter((t) => t.status === 'done');
  const pending = filtered.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const totalWorked = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap = done.length > 0
    ? done.reduce((s, t) => s + (t.gap || 0), 0) / done.length
    : null;

  const rangeLabel = {
    Daily:   new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    Weekly:  (() => {
      const mon = getMondayOf(new Date());
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    })(),
    Monthly: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    All:     'All time',
  }[period];

  return (
    <div className="statistics-layout">
      <Navbar />
      <main id="main-content" className="statistics-main">

        {/* Header */}
        <section className="statistics-header">
          <div className="statistics-header-left">
            <div className="statistics-time-toggle">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  className={`time-toggle-btn${period === p ? ' active' : ''}`}
                  onClick={() => setPeriod(p)}
                  aria-pressed={period === p}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="statistics-date">
              <span className="material-symbols-outlined statistics-date-icon" aria-hidden="true">calendar_today</span>
              <h2>{rangeLabel}</h2>
            </div>
          </div>
          <Link to="/insights" className="btn-secondary stat-insights-link">
            <span className="material-symbols-outlined" aria-hidden="true">insights</span>
            View All Insights
          </Link>
        </section>

        {/* Summary cards */}
        <section className="summary-cards-grid" aria-label="Summary metrics">
          <StatisticsCard title="Tasks Completed"  value={String(done.length)}     icon="check_circle"    colorClass="summary-completed" />
          <StatisticsCard title="Tasks Pending"    value={String(pending.length)}  icon="pending_actions" colorClass="summary-pending" />
          <StatisticsCard title="Total Focus Time" value={fmtMin(totalWorked)}     icon="schedule"        colorClass="summary-time" />
          <StatisticsCard
            title="Avg. Gap"
            value={avgGap !== null ? fmtGap(avgGap) : '—'}
            icon="query_stats"
            colorClass={avgGap !== null && avgGap > 0 ? 'summary-pending' : 'summary-completed'}
          />
        </section>

        {/* Chart + insight */}
        <section className="main-bento-grid">
          <ProductivityChart tasks={filtered} />
          <InsightCard tasks={filtered} />
        </section>

        {/* Task breakdown */}
        {done.length > 0 ? (
          <section>
            <div className="stat-bento-card analytics-table-card">
              <div className="analytics-table-header">
                <h3 className="analytics-table-title">Task Breakdown</h3>
                <span className="analytics-table-badge">{done.length} completed</span>
              </div>
              <div className="table-responsive-wrapper">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Estimated</th>
                      <th>Actual</th>
                      <th>Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {done.map((task) => (
                      <tr key={task.id}>
                        <td className="table-task-name">
                          <Link to={`/task-details/${task.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {task.title}
                          </Link>
                        </td>
                        <td className="table-time">{fmtMin(task.estimatedMinutes)}</td>
                        <td className="table-time">{fmtMin(task.actualMinutes)}</td>
                        <td className={task.gap > 0 ? 'table-gap-negative' : 'table-gap-positive'}>
                          {task.gap != null ? fmtGap(task.gap) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : (
          <div className="stat-empty-state">
            <span className="material-symbols-outlined stat-empty-icon" aria-hidden="true">insert_chart</span>
            <p>No completed tasks {period !== 'All' ? `this ${period.toLowerCase()}` : 'yet'}.</p>
            {period !== 'All' && (
              <button className="btn-secondary" onClick={() => setPeriod('All')}>Show all time</button>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
