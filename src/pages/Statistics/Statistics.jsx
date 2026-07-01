import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import StatisticsCard from '../../components/Statistics/StatisticsCard';
import ProductivityChart from '../../components/Statistics/ProductivityChart';
import InsightCard from '../../components/Statistics/InsightCard';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import { useRegional } from '../../context/RegionalContext';
import { formatDate, formatDuration, formatGap } from '../../utils/dateFormat';
import LocaleDateInput from '../../components/shared/LocaleDateInput';
import '../../components/Statistics/Statistics.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const PERIOD_KEYS = {
  'All Time':     'stats.allTime',
  'This Week':    'stats.thisWeek',
  'Last 30 Days': 'stats.last30',
  'Custom Range': 'stats.custom',
};

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

const getRangeLabel = (period, customStart, customEnd, regional = {}, t) => {
  if (period === 'This Week') {
    const mon = startOfWeek();
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return `${t('stats.thisWeek')} (${formatDate(mon, regional)} – ${formatDate(sun, regional)})`;
  }
  if (period === 'Last 30 Days') {
    const cutoff = new Date(Date.now() - 30 * 86400000);
    return `${t('stats.last30')} (${formatDate(cutoff, regional)} – ${t('common.today')})`;
  }
  if (period === 'Custom Range') {
    if (customStart && customEnd) {
      return `${formatDate(new Date(customStart), regional)} – ${formatDate(new Date(customEnd), regional)}`;
    }
    if (customStart) return t('stats.fromDate', { date: formatDate(new Date(customStart), regional) });
    return t('stats.selectStart');
  }
  return t('stats.allTime');
};

// ── Component ─────────────────────────────────────────────────────────────────

const Statistics = () => {
  const { tasks, loading, error } = useTasks();
  const { t } = useLocale();
  const { regional } = useRegional();

  const [period,      setPeriod]      = useState('All Time');
  const [prevPeriod,  setPrevPeriod]  = useState('All Time');
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

  const SORT_OPTIONS = [
    { value: 'newest',      label: t('stats.sortNewest') },
    { value: 'oldest',      label: t('stats.sortOldest') },
    { value: 'az',          label: t('stats.sortAZ') },
    { value: 'za',          label: t('stats.sortZA') },
    { value: 'est_high',    label: t('stats.sortEstHigh') },
    { value: 'est_low',     label: t('stats.sortEstLow') },
    { value: 'actual_high', label: t('stats.sortActHigh') },
    { value: 'actual_low',  label: t('stats.sortActLow') },
    { value: 'gap_high',    label: t('stats.sortGapHigh') },
    { value: 'gap_low',     label: t('stats.sortGapLow') },
  ];

  const rangeLabel = getRangeLabel(period, customStart, customEnd, regional, t);
  const fmtDur = (m) => formatDuration(m || 0, t);
  const fmtGap = (g) => formatGap(g, t);

  const handlePeriodChange = (p) => {
    if (p !== 'Custom Range') setPrevPeriod(p);
    setPeriod(p);
    if (p !== 'Custom Range') { setCustomStart(''); setCustomEnd(''); }
  };

  const handleClearCustomRange = () => {
    setCustomStart('');
    setCustomEnd('');
    setPeriod(prevPeriod);
  };

  if (loading) return (
    <div className="statistics-layout">
      <Navbar />
      <main id="main-content" className="statistics-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-outline)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </main>
    </div>
  );

  if (error) return (
    <div className="statistics-layout">
      <Navbar />
      <main id="main-content" className="statistics-main">
        <p style={{ color: 'var(--color-error)', padding: '2rem' }}>{error}</p>
      </main>
    </div>
  );

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
                  {t(PERIOD_KEYS[p])}
                </button>
              ))}
            </div>

            {/* Custom Range date picker — shown only when Custom Range is active */}
            {period === 'Custom Range' && (
              <div className="stat-custom-range" role="group" aria-label="Custom date range">
                <label className="stat-date-label" htmlFor="stat-start">{t('stats.from')}</label>
                <LocaleDateInput
                  id="stat-start"
                  className="stat-date-input"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  ariaLabel="Start date"
                  regional={regional}
                />
                <span className="stat-date-sep" aria-hidden="true">—</span>
                <label className="stat-date-label" htmlFor="stat-end">{t('stats.to')}</label>
                <LocaleDateInput
                  id="stat-end"
                  className="stat-date-input"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  ariaLabel="End date"
                  regional={regional}
                />
                <button
                  className="stat-custom-clear"
                  onClick={handleClearCustomRange}
                  aria-label="Clear custom date range"
                >
                  {t('stats.clearRange')}
                </button>
              </div>
            )}
          </div>

          <Link to="/insights" className="btn btn-secondary stat-insights-link">
            <span className="material-symbols-outlined" aria-hidden="true">insights</span>
            {t('stats.viewInsights')}
          </Link>
        </section>

        {/* Range summary banner */}
        <div className="stat-range-summary" aria-live="polite">
          <span className="material-symbols-outlined stat-range-icon" aria-hidden="true">calendar_today</span>
          <span>{t('stats.showing')} <strong>{rangeLabel}</strong></span>
        </div>

        {/* Summary cards */}
        <section className="summary-cards-grid" aria-label="Summary metrics">
          <StatisticsCard title={t('stats.totalTasks')}  value={String(done.length)}    icon="check_circle"    colorClass="summary-completed" />
          <StatisticsCard title={t('stats.productivity')} value={String(pending.length)} icon="pending_actions" colorClass="summary-pending" />
          <StatisticsCard title={t('stats.totalFocus')}   value={fmtDur(totalWorked)}    icon="schedule"        colorClass="summary-time" />
          <StatisticsCard
            title={t('stats.avgGap')}
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
                  <h3 className="analytics-table-title">{t('stats.breakdown')}</h3>
                  <span className="analytics-table-badge">{sortedDone.length} {t('common.done')}</span>
                </div>
                <div className="analytics-table-header-right">
                  <label htmlFor="stat-sort" className="stat-sort-label">{t('stats.sortBy')}</label>
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
                      <th>{t('common.task')}</th>
                      <th>{t('history.estimated')}</th>
                      <th>{t('history.actual')}</th>
                      <th>{t('stats.gap')}</th>
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
                        <td className="table-time">{fmtDur(task.estimatedMinutes)}</td>
                        <td className="table-time">{fmtDur(task.actualMinutes)}</td>
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
            <p>{period !== 'All Time' ? t('stats.noData') : t('stats.noTasksYet')}</p>
            {period !== 'All Time' && (
              <button className="btn btn-secondary" onClick={() => handlePeriodChange('All Time')}>{t('stats.showAllTime')}</button>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
