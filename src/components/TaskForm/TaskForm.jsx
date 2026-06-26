import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import './TaskForm.css';

/*
 * TODO (Backend): When persisting tasks, POST /api/tasks with body:
 * {
 *   title:            string,
 *   description:      string,
 *   scheduledDate:    string (ISO 8601),
 *   estimatedMinutes: number,
 *   priorityHigh:     boolean,
 *   tags:             Array<{ name: string, color: string }>
 * }
 *
 * Tag storage options (choose before backend implementation):
 *   Option A — inline on task:  tags: string[]  (simplest, no join table)
 *   Option B — normalized:      Tag { id, user_id, name, color, created_at }
 *                               TaskTag { task_id, tag_id }
 *
 * Current frontend shape uses { name, color } objects.
 * Upgrading to Option B only requires a data-layer change, not UI changes.
 */

const TAG_COLOR   = '#6b38d4';
const TAG_MAX_LEN = 24;

const TaskForm = () => {
  const { addTask } = useTasks();
  const navigate    = useNavigate();
  const tagInputRef = useRef(null);

  const [title,         setTitle]        = useState('');
  const [description,   setDescription]  = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estHours,      setEstHours]     = useState('');
  const [estMins,       setEstMins]      = useState('');
  const [priorityHigh,  setPriorityHigh] = useState(false);
  const [tags,          setTags]         = useState([]);
  const [tagInput,      setTagInput]     = useState('');
  const [tagError,      setTagError]     = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const estimatedMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0);
    if (!title.trim() || estimatedMinutes <= 0) return;
    addTask({ title: title.trim(), description, scheduledDate, estimatedMinutes, priorityHigh, tags });
    navigate('/dashboard');
  };

  const addTag = () => {
    const name = tagInput.trim();
    setTagError('');

    if (!name) {
      setTagError('Please enter a tag name.');
      tagInputRef.current?.focus();
      return;
    }
    if (name.length > TAG_MAX_LEN) {
      setTagError(`Tags can be at most ${TAG_MAX_LEN} characters.`);
      return;
    }
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setTagError(`"${name}" is already added.`);
      return;
    }

    setTags((prev) => [...prev, { name, color: TAG_COLOR }]);
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const removeTag = (name) => {
    setTags((prev) => prev.filter((t) => t.name !== name));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1].name);
    }
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

        {/* ── Tags ── */}
        <div className="form-group">
          <label className="form-label" htmlFor="tag-input">Tags</label>
          <p className="form-field-hint">
            Press <kbd className="kbd">Enter</kbd> or click <strong>Add</strong> to create a tag.
            <kbd className="kbd">Backspace</kbd> on empty input removes the last tag.
          </p>

          <div
            className={`tag-field-box${tagError ? ' tag-field-box--error' : ''}`}
            onClick={() => tagInputRef.current?.focus()}
            role="group"
            aria-label="Tag chips"
          >
            {tags.map((t) => (
              <span key={t.name} className="tag-chip">
                <span className="material-symbols-outlined tag-chip-icon" aria-hidden="true">label</span>
                <span className="tag-chip-name">{t.name}</span>
                <button
                  type="button"
                  className="tag-chip-remove"
                  aria-label={`Remove tag ${t.name}`}
                  onClick={(e) => { e.stopPropagation(); removeTag(t.name); }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              id="tag-input"
              className="tag-inline-input"
              type="text"
              placeholder={tags.length === 0 ? 'e.g., work, study, urgent…' : 'Add another…'}
              value={tagInput}
              maxLength={TAG_MAX_LEN + 1}
              onChange={(e) => { setTagInput(e.target.value); setTagError(''); }}
              onKeyDown={handleTagKeyDown}
              aria-describedby={tagError ? 'tag-error' : undefined}
              aria-invalid={!!tagError}
            />
          </div>

          <div className="tag-field-footer">
            {tagError ? (
              <p id="tag-error" className="tag-error" role="alert">
                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                {tagError}
              </p>
            ) : (
              <span className="tag-count" aria-live="polite">
                {tags.length > 0 ? `${tags.length} tag${tags.length !== 1 ? 's' : ''} added` : ''}
              </span>
            )}
            <button
              type="button"
              className="tag-add-btn"
              onClick={addTag}
            >
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              Add
            </button>
          </div>
        </div>

        <div className="form-options">
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
