import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import './TaskCards.css';

const HeroTaskCard = () => {
  const { tasks, loading } = useTasks();
  const navigate = useNavigate();

  const task = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'pending');

  if (loading) {
    return (
      <div className="glass-card hero-card hero-card-empty">
        <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--color-outline)', animation: 'spin 1s linear infinite' }}>progress_activity</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="glass-card hero-card hero-card-empty">
        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--color-outline)' }}>task_alt</span>
        <p style={{ color: 'var(--color-on-surface-variant)', margin: '0.5rem 0 0' }}>No active tasks — create one to get started!</p>
      </div>
    );
  }

  const fmtEst = task.estimatedMinutes >= 60
    ? `${Math.floor(task.estimatedMinutes / 60)}h ${task.estimatedMinutes % 60 > 0 ? task.estimatedMinutes % 60 + 'm' : ''} session`
    : `${task.estimatedMinutes}m session`;

  return (
    <div className="glass-card hero-card group">
      <div className="hero-card-blur"></div>
      <div className="hero-card-content">
        <div className="hero-card-text">
          <div className="hero-card-tags">
            {task.priorityHigh && <span className="hero-tag-priority">High Priority</span>}
            <span className="hero-tag-time">
              <span className="material-symbols-outlined icon-sm">schedule</span>
              {fmtEst}
            </span>
          </div>
          <h3 className="hero-card-title">{task.title}</h3>
          {task.description && <p className="hero-card-desc">{task.description}</p>}
        </div>
        <button
          className="primary-gradient motivational-glow hero-button"
          onClick={() => navigate(`/focus-mode/${task.id}`)}
        >
          <span className="material-symbols-outlined">play_circle</span>
          Start Now
        </button>
      </div>
    </div>
  );
};

export default HeroTaskCard;
