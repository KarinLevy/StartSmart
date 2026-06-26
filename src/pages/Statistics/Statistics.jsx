import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import StatisticsCard from '../../components/Statistics/StatisticsCard';
import ProductivityChart from '../../components/Statistics/ProductivityChart';
import InsightCard from '../../components/Statistics/InsightCard';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import '../../components/Statistics/Statistics.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}`;
  return `${m}m`;
};

const fmtGap = (g) => (g > 0 ? `+${g.toFixed(1)}m` : `${g.toFixed(1)}m`);

// ── Period filter ─────────────────────────────────────────────────────────────

const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  d.setHours(0, 0, 0, 0);
  return d;
};

const filterByPeriod = (tasks, period, customStart, customEnd) => {
  const now = Date.now();

  if (period === 'This Week') {
    const mon = startOfWeek();
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (!t.scheduledDate) return false;
      const d = new Date(t.scheduledDate);
      return d >= mon && d <= sun;
    });
  }

  if (period === 'Last 30 Days') {
    const cutoff = now - 30 * 86400000;
    return tasks.filter((t) => t.scheduledDate && new Date(t.scheduledDate).getTime() >= cutoff);
  }

  if (period === 'Custom Range' && customStart && customEnd) {
    const start = new Date(customStart);      start.setHours(0, 0, 0, 0);
    const end   = new Date(customEnd);        end.setHours(23, 59, 59, 999);
    return tasks.filter((t) => {
      if (!t.scheduledDate) return false;
      const d = new Date(t.scheduledDate);
      return d >= start && d <= end;
    });
  }

  return tasks; // 'All Time' or custom with missing dates
};

const PERIODS = ['All Time', 'This Week', 'Last 30 Days', 'Custom Range'];

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'az',          label: 'A → Z' },
  { value: 'za',          label: 'Z → A' },
  { value: 'est_high',    label: 'Highest Estimated' },
  { value: 'est_low',     label: 'Lowest Estimated' },
  { value: 'actual_high', label: 'Highest Actual' },
  { value: 'actual_low',  label: 'Lowest Actual' },
  { value: 'gap_high',    label: 'Largest Gap' },
  { value: 'gap_low',     label: 'Smallest Gap' },
];

const sortTasks = (tasks, sortBy) => {
  const list = [...tasks];
  switch (sortBy) {
    case 'newest':      return list.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
    case 'oldest':      return list.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    case 'az':          return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'za':          return list.sort((a, b) => b.title.localeCompare(a.title));
    case 'est_high':    return list.sort((a, b) => (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0));
    case 'est_low':     return list.sort((a, b) => (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0));
    case 'actual_high': return list.sort((a, b) => (b.actualMinutes || 0) - (a.actualMinutes || 0));
    case 'actual_low':  return list.sort((a, b) => (a.actualMinutes || 0) - (b.actualMinutes || 0));
    case 'gap_high':    return list.sort((a, b) => (b.gap || 0) - (a.gap || 0));
    case 'gap_low':     return list.sort((a, b) => (a.gap || 0) - (b.gap || 0));
    default:            return list;
  }
};

// ── Range label ───────────────────────────────────────────────────────────────

const getRangeLabel = (period, customStart, customEnd) => {
  if (period === 'This Week') {
    const mon = startOfWeek();
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (period === 'Last 30 Days') {
    const cutoff = new Date(Date.now() - 30 * 86400000);
    return `${cutoff.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – Today`;
  }
  if (period === 'Custom Range' && customStart && customEnd) {
    return `${new Date(customStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${new Date(customEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  return 'All time';
};

// ── Component ─────────────────────────────────────────────────────────────────

const Statistics = () => {
  const { tasks } = useTasks();

  const [period,      setPeriod]      = useState('All Time');
  const [customStart, setCustomStart] = useState('');
  const [customEnd,   setCustomEnd]   = useState('');
  const [sortBy,      setSortBy]      = useState('newest');

  const filtered = useMemo(
    () => filterByPeriod(tasks, period, customStart, customEnd),
    [tasks, period, customStart, customEnd]
  );

  const done    = useMemo(() => filtered.filter((t) => t.status === 'done'), [filtered]);
  const pending = useMemo(() => filtered.filter((t) => t.status === 'pending' || t.status === 'in_progress'), [filtered]);

  const totalWorked = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap = done.length > 0
    ? done.reduce((s, t) => s + (t.gap || 0), 0) / done.length
    : null;

  const sortedDone = useMemo(() => sortTasks(done, sortBy), [done, sortBy]);

  const rangeLabel = getRangeLabel(period, customStart, customEnd);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    // Reset custom range when switching away
    if (p !== 'Custom Range') { setCustomStart(''); setCustomEnd(''); }
  };

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
                  onClick={() => handlePeriodChange(p)}
                  aria-pressed={period === p}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Custom Range date picker — shown only when Custom Range is active */}
            {period === 'Custom Range' && (
              <div className="stat-custom-range" role="group" aria-label="Custom date range">
                <label className="stat-date-label" htmlFor="stat-start">From</label>
                <input
                  id="stat-start"
                  type="date"
                  className="stat-date-input"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  aria-label="Start date"
                />
                <span className="stat-date-sep" aria-hidden="true">—</span>
                <label className="stat-date-label" htmlFor="stat-end">To</label>
                <input
                  id="stat-end"
                  type="date"
                  className="stat-date-input"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  aria-label="End date"
                />
              </div>
            )}

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
          <StatisticsCard title="Tasks Completed"  value={String(done.length)}    icon="check_circle"    colorClass="summary-completed" />
          <StatisticsCard title="Tasks Pending"    value={String(pending.length)} icon="pending_actions" colorClass="summary-pending" />
          <StatisticsCard title="Total Focus Time" value={fmtMin(totalWorked)}    icon="schedule"        colorClass="summary-time" />
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
        {sortedDone.length > 0 ? (
          <section>
            <div className="stat-bento-card analytics-table-card">
              <div className="analytics-table-header">
                <div className="analytics-table-header-left">
                  <h3 className="analytics-table-title">Task Breakdown</h3>
                  <span className="analytics-table-badge">{sortedDone.length} completed</span>
                </div>
                <div className="analytics-table-header-right">
                  <label htmlFor="stat-sort" className="stat-sort-label">Sort</label>
                  <select
                    id="stat-sort"
                    className="stat-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort completed tasks"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
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
                    {sortedDone.map((task) => (
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
            <p>No completed tasks {period !== 'All Time' ? 'in this period' : 'yet'}.</p>
            {period !== 'All Time' && (
              <button className="btn-secondary" onClick={() => handlePeriodChange('All Time')}>Show all time</button>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
