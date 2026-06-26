import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import './TaskForm.css';

const TaskForm = () => {
  const { addTask } = useTasks();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estHours, setEstHours] = useState('');
  const [estMins, setEstMins] = useState('');
  const [priorityHigh, setPriorityHigh] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const estimatedMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0);
    if (!title.trim() || estimatedMinutes <= 0) return;
    addTask({ title: title.trim(), description, scheduledDate, estimatedMinutes, priorityHigh, tags });
    navigate('/dashboard');
  };

  const addTag = () => {
    const name = tagInput.trim();
    if (!name || tags.find((t) => t.name === name)) return;
    setTags((prev) => [...prev, { name, color: '#6b38d4' }]);
    setTagInput('');
  };

  return (
    <div className="task-form-card">
      <form className="task-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label className="form-label" htmlFor="task-name">
            Task Name <span className="form-label-required">*</span>
          </label>
          <input
            className="form-input"
            id="task-name"
            placeholder="e.g., Prepare Quarterly Presentation"
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">Description (Optional)</label>
          <textarea
            className="form-input form-textarea"
            id="task-desc"
            placeholder="Detail the task and any required tools..."
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="task-datetime">Execution Date &amp; Time</label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-left">calendar_month</span>
              <input
                className="form-input form-input-with-icon-left"
                id="task-datetime"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Estimated Duration <span className="form-label-required">*</span>
            </label>
            <div className="duration-inputs">
              <div className="duration-input-wrapper">
                <input
                  className="form-input duration-input"
                  min="0"
                  placeholder="Hours"
                  type="number"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                />
                <span className="duration-unit">h</span>
              </div>
              <div className="duration-input-wrapper">
                <input
                  className="form-input duration-input"
                  max="59"
                  min="0"
                  placeholder="Min"
                  type="number"
                  value={estMins}
                  onChange={(e) => setEstMins(e.target.value)}
                />
                <span className="duration-unit">m</span>
              </div>
            </div>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="form-tags-preview">
            {tags.map((t) => (
              <span key={t.name} className="form-tag-chip" style={{ background: t.color + '20', color: t.color }}>
                {t.name}
                <button type="button" aria-label={`Remove ${t.name}`} onClick={() => setTags((p) => p.filter((x) => x.name !== t.name))}>×</button>
              </span>
            ))}
          </div>
        )}

        <div className="form-options">
          <div className="form-tag-input-row">
            <input
              className="form-input form-tag-input"
              placeholder="Tag name…"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            />
            <button className="option-btn option-btn-primary" type="button" onClick={addTag}>
              <span className="material-symbols-outlined option-icon">label</span>
              Add Tag
            </button>
          </div>
          <button
            className={`option-btn ${priorityHigh ? 'option-btn-active' : 'option-btn-secondary'}`}
            type="button"
            aria-pressed={priorityHigh}
            onClick={() => setPriorityHigh((v) => !v)}
          >
            <span className="material-symbols-outlined option-icon">flag</span>
            {priorityHigh ? 'High Priority ✓' : 'High Priority'}
          </button>
        </div>

        <div className="form-actions">
          <button className="action-btn-cancel" type="button" onClick={() => navigate(-1)}>Cancel</button>
          <button className="action-btn-save" type="submit">Save Task</button>
        </div>

      </form>
    </div>
  );
};

export default TaskForm;
