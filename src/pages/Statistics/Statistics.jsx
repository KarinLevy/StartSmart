import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import StatisticsCard from '../../components/Statistics/StatisticsCard';
import ProductivityChart from '../../components/Statistics/ProductivityChart';
import InsightCard from '../../components/Statistics/InsightCard';
import '../../components/Statistics/Statistics.css';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';

const fmtMin = (m) => {
  if (!m) return '0m';
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`.trim();
  return `${m}m`;
};
const fmtGap = (g) => (g > 0 ? `+${g.toFixed(1)}m` : `${g.toFixed(1)}m`);

const Statistics = () => {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState('Daily');

  const done = tasks.filter((t) => t.status === 'done');
  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const totalWorked = done.reduce((s, t) => s + (t.actualMinutes || 0), 0);
  const avgGap = done.length > 0
    ? done.reduce((s, t) => s + (t.gap || 0), 0) / done.length
    : 0;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="statistics-layout">
      <Navbar />
      <main className="statistics-main">

        <section className="statistics-header">
          <div className="statistics-header-left">
            <div className="statistics-time-toggle">
              {['Daily', 'Weekly', 'Monthly'].map((p) => (
                <button
                  key={p}
                  className={`time-toggle-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="statistics-date">
              <span className="material-symbols-outlined statistics-date-icon">calendar_today</span>
              <h2>{today}</h2>
            </div>
          </div>
        </section>

        <section className="summary-cards-grid">
          <StatisticsCard title="Tasks Completed" value={String(done.length)} icon="check_circle" colorClass="summary-completed" />
          <StatisticsCard title="Tasks Pending" value={String(pending.length)} icon="pending_actions" colorClass="summary-pending" />
          <StatisticsCard title="Total Time Worked" value={fmtMin(totalWorked)} icon="schedule" colorClass="summary-time" />
          {done.length > 0 && (
            <StatisticsCard
              title="Avg. Gap"
              value={fmtGap(avgGap)}
              icon="query_stats"
              colorClass={avgGap > 0 ? 'summary-pending' : 'summary-completed'}
            />
          )}
        </section>

        <section className="main-bento-grid">
          <ProductivityChart tasks={tasks} />
          <InsightCard tasks={tasks} />
        </section>

        {/* Task breakdown */}
        {done.length > 0 && (
          <section>
            <div className="stat-bento-card analytics-table-card">
              <div className="analytics-table-header">
                <h3 className="analytics-table-title">Task Breakdown</h3>
                <span className="analytics-table-badge">{done.length} Tasks Evaluated</span>
              </div>
              <div className="table-responsive-wrapper">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Task Name</th>
                      <th>Estimated</th>
                      <th>Actual</th>
                      <th>Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {done.map((task) => (
                      <tr key={task.id}>
                        <td className="table-task-name">{task.title}</td>
                        <td className="table-time">{fmtMin(task.estimatedMinutes)}</td>
                        <td className="table-time">{fmtMin(task.actualMinutes)}</td>
                        <td className={task.gap > 0 ? 'table-gap-negative' : 'table-gap-positive'}>
                          {task.gap != null ? fmtGap(task.gap) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
