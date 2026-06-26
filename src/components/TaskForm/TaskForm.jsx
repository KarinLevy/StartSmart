import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TasksContext';
import {
  TAG_PRESETS,
  DEFAULT_COLOR,
  MAX_TAGS,
  TAG_MAX_LEN,
  resolveColor,
  saveTagPreference,
  validateTag,
  collectExistingTags,
  filterSuggestions,
} from '../../utils/tagUtils';
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
 * See src/utils/tagUtils.js for the tag schema and smart-color logic.
 */

// ── TagChip ───────────────────────────────────────────────────────────────────

export function TagChip({ tag, onRemove }) {
  const color = tag.color || DEFAULT_COLOR;
  return (
    <span
      className="tag-chip"
      style={{ background: color + '1e', color, borderColor: color + '40' }}
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

// ── ColorPopover ──────────────────────────────────────────────────────────────

function ColorPopover({ selectedColor, colorSource, onSelect, onReset, onClose, anchorRef }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const onKey   = (e) => { if (e.key === 'Escape') onClose(); };
    const onClick  = (e) => {
      if (!popoverRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
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
            <span className="tcp-legend-text">
              <span className="tcp-legend-hint">{p.hint}</span>
              <span className="tcp-legend-examples">{p.examples}</span>
            </span>
          </li>
        ))}
      </ul>

      {selectedColor !== DEFAULT_COLOR && (
        <button type="button" className="tcp-reset" onClick={() => { onReset(); onClose(); }}>
          <span className="material-symbols-outlined" aria-hidden="true">restart_alt</span>
          Reset to default
        </button>
      )}
    </div>
  );
}

// ── TaskForm ──────────────────────────────────────────────────────────────────

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

  // Tag state
  const [tags,         setTags]        = useState([]);
  const [tagInput,     setTagInput]    = useState('');
  const [tagError,     setTagError]    = useState('');
  const [tagColor,     setTagColor]    = useState(DEFAULT_COLOR);
  // colorSource: 'default' | 'suggested' | 'preference' | 'user'
  const [colorSource,  setColorSource] = useState('default');
  const [colorOpen,    setColorOpen]   = useState(false);
  const [showSuggest,  setShowSuggest] = useState(false);

  // Build the pool of existing unique tags (for suggestions) once per task list change
  const existingTags = useMemo(() => collectExistingTags(tasks), [tasks]);

  // Suggestions filtered to the current input
  const suggestions = useMemo(
    () => filterSuggestions(tagInput, existingTags, tags),
    [tagInput, existingTags, tags]
  );

  // Recompute auto-color whenever the input changes, but only if the user
  // hasn't manually picked a color for this typing session.
  useEffect(() => {
    if (colorSource === 'user') return; // user override — don't touch
    const { color, source } = resolveColor(tagInput);
    setTagColor(color);
    setColorSource(source);
  }, [tagInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    const estimatedMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0);
    if (!title.trim() || estimatedMinutes <= 0) return;
    addTask({ title: title.trim(), description, scheduledDate, estimatedMinutes, priorityHigh, tags });
    navigate('/dashboard');
  };

  const addTag = (nameOverride, colorOverride, skipPref = false) => {
    const name  = (nameOverride ?? tagInput).trim();
    const color = colorOverride ?? tagColor;

    const error = validateTag(name, tags);
    setTagError(error ?? '');
    setShowSuggest(false);
    if (error) { tagInputRef.current?.focus(); return; }

    // Save user's explicit color choice as a preference
    if (!skipPref && colorSource === 'user') {
      saveTagPreference(name, color);
    }

    setTags((prev) => [...prev, { name, color }]);
    setTagInput('');
    setColorSource('default');
    setTagColor(DEFAULT_COLOR);
    tagInputRef.current?.focus();
  };

  const removeTag = (name) => setTags((prev) => prev.filter((t) => t.name !== name));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); addTag(); }
    if (e.key === 'Escape') { setShowSuggest(false); setColorOpen(false); }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1].name);
    }
  };

  const handleColorSelect = (color) => {
    setTagColor(color);
    setColorSource('user');
  };

  const handleColorReset = () => {
    setTagColor(DEFAULT_COLOR);
    setColorSource('default');
  };

  const atLimit = tags.length >= MAX_TAGS;

  // ── Render ─────────────────────────────────────────────────────────────────

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
            <span className="tag-count-badge" aria-live="polite">
              {tags.length}/{MAX_TAGS}
            </span>
          </div>
          <p className="form-field-hint">
            Press <kbd className="kbd">Enter</kbd> or <strong>Add</strong> to create a tag.
            <kbd className="kbd">Backspace</kbd> on an empty input removes the last tag.
          </p>

          {/* Chip box + inline input */}
          <div
            className={`tag-field-box${tagError ? ' tag-field-box--error' : ''}`}
            onClick={() => !atLimit && tagInputRef.current?.focus()}
            role="group"
            aria-label="Tag chips"
          >
            {tags.map((t) => (
              <TagChip key={t.name} tag={t} onRemove={removeTag} />
            ))}
            {!atLimit && (
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
            )}
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
                    addTag(s.name, s.color, true /* skipPref */);
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

          {/* Footer row */}
          <div className="tag-field-footer">
            {tagError ? (
              <p id="tag-error" className="tag-error" role="alert">
                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                {tagError}
              </p>
            ) : atLimit ? (
              <p className="tag-limit-msg" role="status">
                <span className="material-symbols-outlined" aria-hidden="true">info</span>
                You can add up to {MAX_TAGS} tags per task.
              </p>
            ) : (
              <span className="tag-footer-left" aria-live="polite">
                {colorSource === 'suggested' && (
                  <span className="tag-suggested-badge">
                    ✨ Suggested
                  </span>
                )}
                {colorSource === 'preference' && (
                  <span className="tag-pref-badge">
                    <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
                    Remembered
                  </span>
                )}
              </span>
            )}

            {!atLimit && (
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
                      colorSource={colorSource}
                      onSelect={handleColorSelect}
                      onReset={handleColorReset}
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
            )}
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
