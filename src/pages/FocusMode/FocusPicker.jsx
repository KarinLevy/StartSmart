import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useTasks } from '../../context/TasksContext';
import './FocusMode.css';

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ''}` : `${m}m`);

const FocusPicker = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();

  const available = tasks.filter((t) => t.status !== 'done');

  return (
    <div className="focus-mode-layout">
      <Navbar />
      <main id="main-content" className="focus-mode-main">
        <div className="fp-picker-inner">

          <div className="fp-picker-header">
            <div className="fp-picker-badge">
              <span className="material-symbols-outlined" aria-hidden="true">timer</span>
              Focus Mode
            </div>
            <h1 className="fp-picker-title">Choose a task to focus on</h1>
            <p className="fp-picker-subtitle">
              Select any pending or in-progress task below to start a timed focus session.
            </p>
          </div>

          {available.length === 0 ? (
            <div className="fm-error-card">
              <span className="material-symbols-outlined fm-error-icon" aria-hidden="true">task_alt</span>
              <h2>All tasks are complete!</h2>
              <p>Create a new task to start a focus session.</p>
              <Link to="/create-task" className="btn btn-primary">Create a task</Link>
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
