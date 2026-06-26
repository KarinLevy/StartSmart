import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import { useLocale } from '../../i18n/LocaleContext';
import './FocusMode.css';

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m}m`);

const FocusPicker = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { t } = useLocale();

  const available = tasks.filter((tk) => tk.status !== 'done');

  return (
    <div className="focus-mode-layout">
      <Navbar />
      <main id="main-content" className="focus-mode-main">
        <div className="fp-picker-inner">

          <div className="fp-picker-header">
            <div className="fp-picker-badge">
              <span className="material-symbols-outlined" aria-hidden="true">timer</span>
              {t('focusMode.badge')}
            </div>
            <h1 className="fp-picker-title">{t('focusMode.title')}</h1>
            <p className="fp-picker-subtitle">{t('focusMode.subtitle')}</p>
          </div>

          {available.length === 0 ? (
            <div className="fm-error-card">
              <span className="material-symbols-outlined fm-error-icon" aria-hidden="true">task_alt</span>
              <h2>{t('focusMode.emptyAll')}</h2>
              <p>{t('focusMode.emptyMsg')}</p>
              <Link to="/create-task" className="btn btn-primary">{t('focusMode.emptyBtn')}</Link>
            </div>
          ) : (
            <ul className="fp-task-list" role="list">
              {available.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="fp-task-row"
                    onClick={() => navigate(`/focus-mode/${task.id}`)}
                    aria-label={`Start focus session for ${task.title}`}
                  >
                    <div className="fp-task-info">
                      <div className="fp-task-name">{task.title}</div>
                      {task.description && (
                        <div className="fp-task-desc">{task.description}</div>
                      )}
                    </div>
                    <div className="fp-task-meta">
                      {task.priorityHigh && (
                        <span className="fp-task-priority" aria-label="High priority">
                          <span className="material-symbols-outlined" aria-hidden="true">flag</span>
                        </span>
                      )}
                      <span className="fp-task-duration">
                        {fmtMin(task.estimatedMinutes)}
                      </span>
                      <span className="fp-task-status fp-task-status--${task.status}">
                        {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                      <span className="material-symbols-outlined fp-task-arrow" aria-hidden="true">arrow_forward</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FocusPicker;
