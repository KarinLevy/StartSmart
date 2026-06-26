import React, { useState, useRef, useEffect, useCallback } from 'react';
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

const TAG_MAX_LEN = 24;

export const TAG_PRESETS = [
  { color: '#6b38d4', label: 'Purple', hint: 'Study / University' },
  { color: '#2563eb', label: 'Blue',   hint: 'Work'              },
  { color: '#16a34a', label: 'Green',  hint: 'Personal'          },
  { color: '#c2610c', label: 'Orange', hint: 'Planning'          },
  { color: '#b91c1c', label: 'Red',    hint: 'Urgent'            },
  { color: '#a16207', label: 'Yellow', hint: 'Reminder'          },
  { color: '#be185d', label: 'Pink',   hint: 'Creative'          },
  { color: '#0e7490', label: 'Cyan',   hint: 'Technical'         },
  { color: '#525f6b', label: 'Gray',   hint: 'General'           },
];

const DEFAULT_COLOR = TAG_PRESETS[0].color;

/* Render a tag chip with its saved color */
export function TagChip({ tag, onRemove }) {
  const color = tag.color || DEFAULT_COLOR;
  return (
    <span
      className="tag-chip"
      style={{
        background: color + '1e',
        color,
        borderColor: color + '40',
      }}
    >
      <span className="material-symbols-outlined tag-chip-icon" aria-hidden="true">label</span>
      <span className="tag-chip-name">{tag.name}</span>
      {onRemove && (
        <button
          type="button"
          className="tag-chip-remove"
          aria-label={`Remove tag ${tag.name}`}
          style={{ color }}
          onClick={(e) => { e.stopPropagation(); onRemove(tag.name); }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      )}
    </span>
  );
}

/* Small color swatch popover */
function ColorPopover({ selectedColor, onSelect, onClose, anchorRef }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    const handleClick = (e) => {
      if (!popoverRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose, anchorRef]);

  return (
    <div
      ref={popoverRef}
      className="tag-color-popover"
      role="dialog"
      aria-label="Choose tag color"
      aria-modal="false"
    >
      <div className="tcp-header">
        <span className="tcp-title">Tag color</span>
        <button type="button" className="tcp-close" onClick={onClose} aria-label="Close color picker">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="tcp-swatches" role="radiogroup" aria-label="Color options">
        {TAG_PRESETS.map((p) => (
          <button
            key={p.color}
            type="button"
            className={`tcp-swatch${selectedColor === p.color ? ' tcp-swatch--selected' : ''}`}
            style={{ background: p.color }}
            aria-label={`${p.label} — ${p.hint}`}
            aria-pressed={selectedColor === p.color}
            title={`${p.label}: ${p.hint}`}
            onClick={() => { onSelect(p.color); onClose(); }}
          >
            {selectedColor === p.color && (
              <span className="material-symbols-outlined tcp-check" aria-hidden="true">check</span>
            )}
          </button>
        ))}
      </div>

      <ul className="tcp-legend">
        {TAG_PRESETS.map((p) => (
          <li key={p.color} className="tcp-legend-item">
            <span className="tcp-legend-dot" style={{ background: p.color }} aria-hidden="true" />
            <span className="tcp-legend-label">{p.label}</span>
            <span className="tcp-legend-hint">{p.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TaskForm = () => {
  const { addTask, tasks } = useTasks();
  const navigate           = useNavigate();
  const tagInputRef        = useRef(null);
  const paletteRef         = useRef(null);

  const [title,         setTitle]        = useState('');
  const [description,   setDescription]  = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [estHours,      setEstHours]     = useState('');
  const [estMins,       setEstMins]      = useState('');
  const [priorityHigh,  setPriorityHigh] = useState(false);

  const [tags,          setTags]         = useState([]);
  const [tagInput,      setTagInput]     = useState('');
  const [tagError,      setTagError]     = useState('');
  const [tagColor,      setTagColor]     = useState(DEFAULT_COLOR);
  const [colorOpen,     setColorOpen]    = useState(false);
  const [showSuggest,   setShowSuggest]  = useState(false);

  /* Collect unique tags from existing tasks for suggestions */
  const existingTags = useCallback(() => {
    const seen = new Map();
    tasks.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        if (!seen.has(tag.name.toLowerCase())) {
          seen.set(tag.name.toLowerCase(), tag);
        }
      });
    });
    return Array.from(seen.values());
  }, [tasks]);

  /* Filter suggestions: match input, not already added */
  const suggestions = tagInput.trim()
    ? existingTags().filter((et) => {
        const q = tagInput.trim().toLowerCase();
        return (
          et.name.toLowerCase().includes(q) &&
          !tags.some((t) => t.name.toLowerCase() === et.name.toLowerCase())
        );
      }).slice(0, 5)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const estimatedMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0);
    if (!title.trim() || estimatedMinutes <= 0) return;
    addTask({ title: title.trim(), description, scheduledDate, estimatedMinutes, priorityHigh, tags });
    navigate('/dashboard');
  };

  const addTag = (nameOverride, colorOverride) => {
    const name  = (nameOverride ?? tagInput).trim();
    const color = colorOverride ?? tagColor;
    setTagError('');
    setShowSuggest(false);

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

    setTags((prev) => [...prev, { name, color }]);
    setTagInput('');
    tagInputRef.current?.focus();
  };

  const removeTag  = (name) => setTags((prev) => prev.filter((t) => t.name !== name));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter')     { e.preventDefault(); addTag(); }
    if (e.key === 'Escape')    { setShowSuggest(false); setColorOpen(false); }
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
          <div className="tag-label-row">
            <label className="form-label" htmlFor="tag-input">Tags</label>
            {/* Color indicator shows the active color without requiring popover */}
            <span
              className="tag-color-preview"
              style={{ background: tagColor }}
              aria-label={`Current tag color: ${TAG_PRESETS.find(p => p.color === tagColor)?.label ?? tagColor}`}
            />
          </div>
          <p className="form-field-hint">
            Press <kbd className="kbd">Enter</kbd> or <strong>Add</strong> to create a tag.
            Optionally pick a color first with the palette button.
          </p>

          {/* Chip box + inline input */}
          <div
            className={`tag-field-box${tagError ? ' tag-field-box--error' : ''}`}
            onClick={() => tagInputRef.current?.focus()}
            role="group"
            aria-label="Tag chips"
          >
            {tags.map((t) => (
              <TagChip key={t.name} tag={t} onRemove={removeTag} />
            ))}
            <input
              ref={tagInputRef}
              id="tag-input"
              className="tag-inline-input"
              type="text"
              placeholder={tags.length === 0 ? 'e.g., work, study, urgent…' : 'Add another…'}
              value={tagInput}
              maxLength={TAG_MAX_LEN + 1}
              autoComplete="off"
              onChange={(e) => {
                setTagInput(e.target.value);
                setTagError('');
                setShowSuggest(true);
              }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              onKeyDown={handleTagKeyDown}
              aria-describedby={tagError ? 'tag-error' : undefined}
              aria-invalid={!!tagError}
              aria-autocomplete="list"
              aria-controls={showSuggest && suggestions.length > 0 ? 'tag-suggestions' : undefined}
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggest && suggestions.length > 0 && (
            <ul
              id="tag-suggestions"
              className="tag-suggestions"
              role="listbox"
              aria-label="Tag suggestions"
            >
              {suggestions.map((s) => (
                <li
                  key={s.name}
                  className="tag-suggestion-item"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(s.name, s.color);
                  }}
                >
                  <span
                    className="tag-suggestion-dot"
                    style={{ background: s.color || DEFAULT_COLOR }}
                    aria-hidden="true"
                  />
                  {s.name}
                </li>
              ))}
            </ul>
          )}

          {/* Footer row: error/count | palette | add */}
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

            <div className="tag-footer-actions">
              {/* Palette button */}
              <div className="tag-palette-wrap">
                <button
                  ref={paletteRef}
                  type="button"
                  className={`tag-palette-btn${colorOpen ? ' tag-palette-btn--open' : ''}`}
                  aria-label="Choose tag color"
                  aria-expanded={colorOpen}
                  aria-haspopup="dialog"
                  onClick={() => setColorOpen((v) => !v)}
                >
                  <span
                    className="tag-palette-dot"
                    style={{ background: tagColor }}
                    aria-hidden="true"
                  />
                  <span className="material-symbols-outlined" aria-hidden="true">palette</span>
                </button>

                {colorOpen && (
                  <ColorPopover
                    selectedColor={tagColor}
                    onSelect={setTagColor}
                    onClose={() => setColorOpen(false)}
                    anchorRef={paletteRef}
                  />
                )}
              </div>

              <button
                type="button"
                className="tag-add-btn"
                onClick={() => addTag()}
              >
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Add
              </button>
            </div>
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
