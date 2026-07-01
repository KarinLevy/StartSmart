import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../../components/PageShell/PageShell';
import { useTasks } from '../../context/TasksContext';
import { getTagDisplayColor } from '../../utils/tagUtils';
import { useLocale } from '../../i18n/LocaleContext';
import { useRegional } from '../../context/RegionalContext';
import { formatDate, formatDuration, formatGap } from '../../utils/dateFormat';
import LocaleDateInput from '../../components/shared/LocaleDateInput';
import './TaskHistory.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d, regionalSettings) => {
  if (!d) return '--';
  return formatDate(new Date(d), regionalSettings ?? {});
};

// ── Reflections stored in localStorage, separate from task data ───────────────
const REFLECTIONS_KEY = 'ss_th_reflections';

const loadReflections = () => {
  try { return JSON.parse(localStorage.getItem(REFLECTIONS_KEY) || '{}'); }
  catch { return {}; }
};

const saveReflection = (taskId, text) => {
  const all = loadReflections();
  all[taskId] = text;
  localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(all));
};

// ── HistoryModal ──────────────────────────────────────────────────────────────

const HistoryModal = ({ task, onClose, onDuplicate, regional }) => {
  const { t } = useLocale();
  const fmtDur = (m) => formatDuration(m, t);
  const fmtGap = (g) => formatGap(g, t);
  const [reflection, setReflection] = useState(() => loadReflections()[task.id] || '');

  const handleReflectionChange = useCallback((e) => {
    const val = e.target.value;
    setReflection(val);
    saveReflection(task.id, val);
  }, [task.id]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    const firstFocusable = document.querySelector('.th-modal-card button, .th-modal-card textarea');
    firstFocusable?.focus();
  }, []);

  const gap = task.gap;
  const gapCls = gap > 0 ? 'th-gap-over' : gap < 0 ? 'th-gap-under' : '';

  return (
    <div
      className="th-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${task.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="th-modal-card">

        {/* Close button */}
        <button className="th-modal-close" onClick={onClose} aria-label="Close">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="th-modal-header">
          <div className="th-modal-chips">
            <span className="chip chip-done">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
              {t('history.done')}
            </span>
            {task.priorityHigh && (
              <span className="chip th-chip-priority">
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>flag</span>
                {t('history.highPriority')}
              </span>
            )}
          </div>

          <h2 className="th-modal-title">{task.title}</h2>
          <p className="th-modal-date">
            <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
            {t('history.completed')} {fmtDate(task.scheduledDate, regional)}
          </p>

          {task.tags?.length > 0 && (
            <div className="th-modal-tags" aria-label="Tags">
              {task.tags.map((tag) => (
                <span
                  key={tag.name}
                  className="tag-chip"
                  style={(() => { const c = getTagDisplayColor(tag); return { background: c + '1e', color: c, borderColor: c + '40' }; })()}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time metrics */}
        <div className="th-modal-metrics" role="region" aria-label="Time metrics">
          <div className="th-modal-metric">
            <span className="th-modal-metric-label">{t('history.estimated')}</span>
            <span className="th-modal-metric-value">{fmtDur(task.estimatedMinutes)}</span>
          </div>
          <div className="th-modal-metric-divider" aria-hidden="true" />
          <div className="th-modal-metric">
            <span className="th-modal-metric-label">{t('history.actual')}</span>
            <span className="th-modal-metric-value">{fmtDur(task.actualMinutes)}</span>
          </div>
          <div className="th-modal-metric-divider" aria-hidden="true" />
          <div className="th-modal-metric">
            <span className="th-modal-metric-label">{t('history.gap')}</span>
            <span className={`th-modal-metric-value ${gapCls}`}>{fmtGap(gap)}</span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="th-modal-body">

          {/* Description */}
          {task.description && (
            <section className="th-modal-section" aria-label="Description">
              <h3 className="th-modal-section-title">{t('history.description')}</h3>
              <p className="th-modal-description">{task.description}</p>
            </section>
          )}

          {/* Reflection */}
          <section className="th-modal-section" aria-label="Personal reflection">
            <h3 className="th-modal-section-title">
              <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
              {t('history.reflection')}
            </h3>
            <p className="th-modal-section-hint">
              {t('history.reflectionHint')}
            </p>
            <textarea
              className="th-reflection-textarea"
              value={reflection}
              onChange={handleReflectionChange}
              placeholder={t('history.reflectionPh')}
              rows={4}
              aria-label="Personal reflection about this task"
            />
          </section>

          {/* AI Insights placeholder — shown when populated in the future */}
          {/* Uncomment and populate `task.insight` to activate:
          {task.insight && (
            <section className="th-modal-section th-insights-section" aria-label="AI insight">
              <h3 className="th-modal-section-title">
                <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                Insight
              </h3>
              <p className="th-insight-text">{task.insight}</p>
            </section>
          )} */}
        </div>

        {/* Footer */}
        <div className="th-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onDuplicate}
            aria-label={`Plan again based on ${task.title}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">content_copy</span>
            {t('history.planAgain')}
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── TaskHistoryCard ───────────────────────────────────────────────────────────

const TaskHistoryCard = ({ task, onView, regional }) => {
  const { t } = useLocale();
  const fmtDur = (m) => formatDuration(m, t);
  const gap = task.gap;
  const gapCls = gap > 0 ? 'th-gap-over' : gap < 0 ? 'th-gap-under' : '';
  const fmtGap = (g) => formatGap(g, t);

  return (
    <article className="th-card surface-card" aria-label={`Completed task: ${task.title}`}>
      <div className="th-card-body">
        <div className="th-card-top">
          <h3 className="th-card-title">{task.title}</h3>
          <button
            className="btn btn-secondary th-view-btn"
            onClick={() => onView(task)}
            aria-label={`View details for ${task.title}`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
            {t('history.viewDetails')}
          </button>
        </div>

        <div className="th-card-meta" aria-label="Task metadata">
          <span className="th-meta-item">
            <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
            {fmtDate(task.scheduledDate, regional)}
          </span>
          <span className="th-meta-sep" aria-hidden="true" />
          <span className="th-meta-item">
            <span className="th-meta-label">{t('history.est')}</span>
            <strong>{fmtDur(task.estimatedMinutes)}</strong>
          </span>
          <span className="th-meta-sep" aria-hidden="true" />
          <span className="th-meta-item">
            <span className="th-meta-label">{t('history.actual')}</span>
            <strong>{fmtDur(task.actualMinutes)}</strong>
          </span>
          <span className="th-meta-sep" aria-hidden="true" />
          <span className={`th-meta-item th-meta-gap ${gapCls}`}>
            <span className="th-meta-label">{t('history.gap')}</span>
            <strong>{fmtGap(gap)}</strong>
          </span>
        </div>

        <div className="th-card-bottom">
          {task.priorityHigh && (
            <span className="chip th-chip-priority th-chip-sm" aria-label="High priority">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>flag</span>
              {t('history.highPriority')}
            </span>
          )}
          {task.tags?.map((tag) => (
            <span
              key={tag.name}
              className="tag-chip"
              style={(() => { const c = getTagDisplayColor(tag); return { background: c + '1e', color: c, borderColor: c + '40' }; })()}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

// ── TaskHistory ───────────────────────────────────────────────────────────────

const TaskHistory = () => {
  const { tasks, loading, error } = useTasks();
  const navigate  = useNavigate();
  const { t, locale } = useLocale();
  const { regional } = useRegional();

  const done = useMemo(() => tasks.filter((task) => task.status === 'done'), [tasks]);

  const SORT_OPTIONS = useMemo(() => [
    { value: 'newest',      label: t('history.sortNewest') },
    { value: 'oldest',      label: t('history.sortOldest') },
    { value: 'az',          label: t('history.sortAZ') },
    { value: 'za',          label: t('history.sortZA') },
    { value: 'est_high',    label: t('history.sortEstHigh') },
    { value: 'est_low',     label: t('history.sortEstLow') },
    { value: 'actual_high', label: t('history.sortActHigh') },
    { value: 'actual_low',  label: t('history.sortActLow') },
    { value: 'gap_high',    label: t('history.sortGapHigh') },
    { value: 'gap_low',     label: t('history.sortGapLow') },
  ], [t]);

  const DATE_FILTERS = useMemo(() => [
    { value: 'all',    label: t('history.allTime') },
    { value: 'week',   label: t('history.thisWeek') },
    { value: 'last30', label: t('history.last30') },
    { value: 'custom', label: t('history.custom') },
  ], [t]);

  const fmtDur = useCallback((m) => formatDuration(m, t), [t]);
  const fmtGap = useCallback((g) => formatGap(g, t), [t]);

  const [search,       setSearch]       = useState('');
  const [filterDate,   setFilterDate]   = useState('all');
  const [customStart,  setCustomStart]  = useState('');
  const [customEnd,    setCustomEnd]    = useState('');
  const [filterPrio,   setFilterPrio]   = useState(false);
  const [filterTag,    setFilterTag]    = useState('');
  const [sortBy,       setSortBy]       = useState('newest');
  const [activeTask,   setActiveTask]   = useState(null);

  // All unique tags across done tasks
  const allTags = useMemo(() => {
    const set = new Set();
    done.forEach((t) => t.tags?.forEach((tag) => set.add(tag.name)));
    return [...set].sort();
  }, [done]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    const now = Date.now();
    const q   = search.toLowerCase().trim();

    const startOfWeek = () => {
      const d = new Date();
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    let list = done.filter((task) => {
      if (q) {
        const hit = task.title.toLowerCase().includes(q)
          || (task.description || '').toLowerCase().includes(q)
          || task.tags?.some((tag) => tag.name.toLowerCase().includes(q));
        if (!hit) return false;
      }
      if (filterDate !== 'all' && task.scheduledDate) {
        const ts = new Date(task.scheduledDate).getTime();
        if (filterDate === 'week'   && ts < startOfWeek())           return false;
        if (filterDate === 'last30' && ts < now - 30 * 86400000)     return false;
        if (filterDate === 'custom' && customStart && customEnd) {
          const start = new Date(customStart); start.setHours(0, 0, 0, 0);
          const end   = new Date(customEnd);   end.setHours(23, 59, 59, 999);
          if (ts < start.getTime() || ts > end.getTime()) return false;
        }
      }
      if (filterPrio && !task.priorityHigh) return false;
      if (filterTag && !task.tags?.some((tag) => tag.name === filterTag)) return false;
      return true;
    });

    list = [...list];
    switch (sortBy) {
      case 'newest':      list.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)); break;
      case 'oldest':      list.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)); break;
      case 'az':          list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za':          list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'est_high':    list.sort((a, b) => (b.estimatedMinutes || 0) - (a.estimatedMinutes || 0)); break;
      case 'est_low':     list.sort((a, b) => (a.estimatedMinutes || 0) - (b.estimatedMinutes || 0)); break;
      case 'actual_high': list.sort((a, b) => (b.actualMinutes || 0) - (a.actualMinutes || 0)); break;
      case 'actual_low':  list.sort((a, b) => (a.actualMinutes || 0) - (b.actualMinutes || 0)); break;
      case 'gap_high':    list.sort((a, b) => (b.gap || 0) - (a.gap || 0)); break;
      case 'gap_low':     list.sort((a, b) => (a.gap || 0) - (b.gap || 0)); break;
      default: break;
    }
    return list;
  }, [done, search, filterDate, customStart, customEnd, filterPrio, filterTag, sortBy]);

  // Summary stats across ALL done tasks (not filtered)
  const totalMin = done.reduce((s, task) => s + (task.actualMinutes || 0), 0);
  const avgGap   = done.length > 0
    ? done.reduce((s, task) => s + (task.gap || 0), 0) / done.length
    : 0;
  const avgGapRounded = Math.round(avgGap);

  const handleDateFilter = (val) => {
    setFilterDate(val);
    if (val !== 'custom') { setCustomStart(''); setCustomEnd(''); }
  };

  const clearFilters = useCallback(() => {
    setSearch(''); setFilterDate('all'); setCustomStart(''); setCustomEnd('');
    setFilterPrio(false); setFilterTag('');
  }, []);

  const hasFilters = search || filterDate !== 'all' || filterPrio || filterTag;

  // Plan Again — prefill Create Task form via sessionStorage and navigate
  const handleDuplicate = useCallback((task) => {
    sessionStorage.setItem('ss_create_prefill', JSON.stringify({
      title:            task.title,
      description:      task.description || '',
      estimatedMinutes: task.estimatedMinutes,
      priorityHigh:     task.priorityHigh,
      tags:             task.tags || [],
    }));
    setActiveTask(null);
    navigate('/create-task');
  }, [navigate]);

  if (loading) return (
    <PageShell title={t('history.title')} subtitle={t('history.subtitle')}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-outline)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </div>
    </PageShell>
  );

  if (error) return (
    <PageShell title={t('history.title')} subtitle={t('history.subtitle')}>
      <p style={{ color: 'var(--color-error)', padding: '2rem' }}>{error}</p>
    </PageShell>
  );

  return (
    <PageShell title={t('history.title')} subtitle={t('history.subtitle')}>

      {/* Summary strip */}
      <div className="th-summary" role="region" aria-label="Overall statistics">
        <div className="th-summary-card">
          <span className="th-summary-value">{done.length}</span>
          <span className="th-summary-label">{t('history.tasksCompleted')}</span>
        </div>
        <div className="th-summary-card">
          <span className="th-summary-value">{fmtDur(totalMin)}</span>
          <span className="th-summary-label">{t('history.totalTime')}</span>
        </div>
        <div className="th-summary-card">
          <span className={`th-summary-value ${avgGapRounded > 0 ? 'th-gap-over' : 'th-gap-under'}`}>
            {fmtGap(avgGapRounded)}
          </span>
          <span className="th-summary-label">{t('history.avgGap')}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="th-toolbar" role="search" aria-label="Search and filter task history">

        {/* Search */}
        <div className="th-search-wrap">
          <span className="material-symbols-outlined th-search-icon" aria-hidden="true">search</span>
          <input
            className="th-search"
            type="search"
            placeholder={t('history.searchPh')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search task history"
          />
        </div>

        {/* Filters row */}
        <div className="th-filters">
          <div className="th-filter-group" role="group" aria-label="Date range">
            {DATE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`th-filter-btn${filterDate === f.value ? ' active' : ''}`}
                onClick={() => handleDateFilter(f.value)}
                aria-pressed={filterDate === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filterDate === 'custom' && (
            <div className="th-custom-range" role="group" aria-label="Custom date range">
              <label className="th-date-label" htmlFor="th-start">{t('history.from')}</label>
              <LocaleDateInput
                id="th-start"
                className="th-date-input"
                value={customStart}
                max={customEnd || undefined}
                onChange={(e) => setCustomStart(e.target.value)}
                ariaLabel="Start date"
                regional={regional}
              />
              <span className="th-date-sep" aria-hidden="true">—</span>
              <label className="th-date-label" htmlFor="th-end">{t('history.to')}</label>
              <LocaleDateInput
                id="th-end"
                className="th-date-input"
                value={customEnd}
                min={customStart || undefined}
                onChange={(e) => setCustomEnd(e.target.value)}
                ariaLabel="End date"
                regional={regional}
              />
            </div>
          )}

          <span className="th-filter-sep" aria-hidden="true" />

          <button
            className={`th-filter-btn${filterPrio ? ' active' : ''}`}
            onClick={() => setFilterPrio((p) => !p)}
            aria-pressed={filterPrio}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 15 }}>flag</span>
            {t('history.priority')}
          </button>

          {allTags.length > 0 && (
            <select
              className="th-filter-select"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              aria-label="Filter by tag"
            >
              <option value="">{t('common.allTags')}</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          )}

          <select
            className="th-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort order"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button className="th-clear-btn" onClick={clearFilters} aria-label="Clear all filters">
              {t('history.clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      {done.length > 0 && (
        <p className="th-result-count" aria-live="polite">
          {filtered.length === done.length
            ? `${done.length} task${done.length !== 1 ? 's' : ''}`
            : `${filtered.length} of ${done.length} tasks`}
        </p>
      )}

      {/* List */}
      {done.length === 0 ? (
        <div className="surface-card th-empty">
          <span className="material-symbols-outlined">history</span>
          <p>{t('history.emptyTitle')}</p>
          <p className="th-empty-hint">{t('history.emptyHint')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card th-empty">
          <span className="material-symbols-outlined">search_off</span>
          <p>{t('history.emptyFilter')}</p>
          <button className="btn btn-secondary" onClick={clearFilters}>{t('history.clearFilters')}</button>
        </div>
      ) : (
        <div className="th-list" role="list" aria-label="Completed tasks">
          {filtered.map((task) => (
            <TaskHistoryCard key={task.id} task={task} onView={setActiveTask} regional={regional} />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {activeTask && (
        <HistoryModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onDuplicate={() => handleDuplicate(activeTask)}
          regional={regional}
        />
      )}
    </PageShell>
  );
};

export default TaskHistory;
