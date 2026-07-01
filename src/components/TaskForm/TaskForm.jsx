import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  getTagDisplayColor,
} from '../../utils/tagUtils';
import { useLocale } from '../../i18n/LocaleContext';
import { useRegional } from '../../context/RegionalContext';
import { formatDate } from '../../utils/dateFormat';
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
  const { t } = useLocale();
  const color = getTagDisplayColor(tag);
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
          aria-label={t('form.tagRemove', { name: tag.name })}
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
  const { t } = useLocale();

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
      aria-label={t('form.colorPickerAriaLabel')}
      aria-modal="false"
    >
      <div className="tcp-header">
        <span className="tcp-title">{t('form.colorPickerTitle')}</span>
        <button type="button" className="tcp-close" onClick={onClose} aria-label={t('form.colorPickerClose')}>
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="tcp-swatches" role="radiogroup" aria-label={t('form.colorPickerAriaLabel')}>
        {TAG_PRESETS.map((p) => (
          <button
            key={p.color}
            type="button"
            className={`tcp-swatch${selectedColor === p.color ? ' tcp-swatch--selected' : ''}`}
            style={{ background: p.color }}
            aria-label={`${t(`tag.color.${p.id}.label`)} — ${t(`tag.color.${p.id}.hint`)}`}
            aria-pressed={selectedColor === p.color}
            title={`${t(`tag.color.${p.id}.label`)}: ${t(`tag.color.${p.id}.hint`)}`}
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
              <span className="tcp-legend-hint">{t(`tag.color.${p.id}.hint`)}</span>
              <span className="tcp-legend-examples">{t(`tag.color.${p.id}.examples`)}</span>
            </span>
          </li>
        ))}
      </ul>

      {selectedColor !== DEFAULT_COLOR && (
        <button type="button" className="tcp-reset" onClick={() => { onReset(); onClose(); }}>
          <span className="material-symbols-outlined" aria-hidden="true">restart_alt</span>
          {t('form.colorReset')}
        </button>
      )}
    </div>
  );
}

// ── TaskForm ──────────────────────────────────────────────────────────────────

const TaskForm = () => {
  const { addTask, tasks } = useTasks();
  const navigate           = useNavigate();
  const { t } = useLocale();
  const { regional } = useRegional();
  const tagInputRef        = useRef(null);
  const paletteRef         = useRef(null);

  const [title,         setTitle]        = useState('');
  const [description,   setDescription]  = useState('');
  const [dateOnly,      setDateOnly]     = useState(''); // YYYY-MM-DD
  const [timeOnly,      setTimeOnly]     = useState(''); // HH:MM
  const [estHours,      setEstHours]     = useState('');
  const [estMins,       setEstMins]      = useState('');
  const [priorityHigh,  setPriorityHigh] = useState(false);

  // Combine date + time into the ISO string used for submission
  const scheduledDate = dateOnly
    ? (timeOnly ? `${dateOnly}T${timeOnly}` : dateOnly)
    : '';

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

  // Read "Plan Again" prefill from sessionStorage (written by TaskHistory on duplicate)
  useEffect(() => {
    const raw = sessionStorage.getItem('ss_create_prefill');
    if (!raw) return;
    sessionStorage.removeItem('ss_create_prefill');
    try {
      const p = JSON.parse(raw);
      if (p.title)            setTitle(p.title);
      if (p.description)      setDescription(p.description);
      if (p.priorityHigh)     setPriorityHigh(p.priorityHigh);
      if (p.tags?.length)     setTags(p.tags);
      if (p.estimatedMinutes) {
        setEstHours(String(Math.floor(p.estimatedMinutes / 60) || ''));
        setEstMins(String(p.estimatedMinutes % 60 || ''));
      }
      if (p.scheduledDate) {
        const [d, t2] = p.scheduledDate.split('T');
        if (d) setDateOnly(d);
        if (t2) setTimeOnly(t2.slice(0, 5));
      }
    } catch { /* ignore malformed prefill */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute auto-color whenever the input changes, but only if the user
  // hasn't manually picked a color for this typing session.
  useEffect(() => {
    if (colorSource === 'user') return; // user override — don't touch
    const { color, source } = resolveColor(tagInput);
    setTagColor(color);
    setColorSource(source);
  }, [tagInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const estimatedMinutes = (parseInt(estHours || 0) * 60) + parseInt(estMins || 0);
    if (!title.trim() || estimatedMinutes <= 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await addTask({ title: title.trim(), description, scheduledDate, estimatedMinutes, priorityHigh, tags });
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(err.message ?? t('common.error'));
      setSubmitting(false);
    }
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

  const removeTag = (name) => setTags((prev) => prev.filter((tag) => tag.name !== name));

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

  const formattedDate = dateOnly
    ? formatDate(new Date(dateOnly + 'T00:00'), regional)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="task-form-card">
      <form className="task-form" onSubmit={handleSubmit}>

        <div className="form-group">
          <label className="form-label" htmlFor="task-name">
            {t('form.titleLabel')} <span className="form-label-required">*</span>
          </label>
          <input
            className="form-input"
            id="task-name"
            placeholder={t('form.titlePh')}
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-desc">{t('form.descLabel')}</label>
          <textarea
            className="form-input form-textarea"
            id="task-desc"
            placeholder={t('form.descPh')}
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="task-date">{t('form.dateLabel')}</label>
            <div className="date-time-row">
              <div className="date-facade-wrap">
                {/*
                  Visual layer: pointer-events none so all clicks fall
                  through to the native input sitting behind it.
                */}
                <div
                  className={`form-input date-facade${dateOnly ? '' : ' date-facade--empty'}`}
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined date-facade-icon" aria-hidden="true">calendar_month</span>
                  <span className="date-facade-text">
                    {formattedDate ?? t('form.datePlaceholder')}
                  </span>
                </div>

                {/*
                  Native date input: transparent, covers the full facade area,
                  fully interactive — the browser owns open/close natively.
                */}
                <input
                  id="task-date"
                  type="date"
                  value={dateOnly}
                  onChange={(e) => setDateOnly(e.target.value)}
                  className="date-hidden-input"
                  aria-label={t('form.dateLabel')}
                />

                {/* Clear button sits above the hidden input (z-index: 2) */}
                {dateOnly && (
                  <button
                    type="button"
                    className="date-facade-clear"
                    aria-label={t('form.dateClear')}
                    onClick={() => { setDateOnly(''); setTimeOnly(''); }}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">close</span>
                  </button>
                )}
              </div>

              {/* Time input — dir="ltr" keeps HH:MM order in RTL pages */}
              <input
                id="task-time"
                type="time"
                dir="ltr"
                className="form-input date-time-input"
                value={timeOnly}
                onChange={(e) => setTimeOnly(e.target.value)}
                aria-label={t('form.timeLabel')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {t('form.estimateLabel')} <span className="form-label-required">*</span>
            </label>
            <div className="duration-inputs">
              <div className="duration-input-wrapper" dir="ltr">
                <input
                  dir="ltr"
                  className="form-input duration-input"
                  min="0"
                  placeholder={t('form.hoursPlaceholder')}
                  type="number"
                  value={estHours}
                  onChange={(e) => setEstHours(e.target.value)}
                />
                <span className="duration-unit">h</span>
              </div>
              <div className="duration-input-wrapper" dir="ltr">
                <input
                  dir="ltr"
                  className="form-input duration-input"
                  max="59"
                  min="0"
                  placeholder={t('common.minutes')}
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
            <label className="form-label" htmlFor="tag-input">{t('form.tagsLabel')}</label>
            <span className="tag-count-badge" aria-live="polite">
              {tags.length}/{MAX_TAGS}
            </span>
          </div>
          <p className="form-field-hint">{t('form.tagHint')}</p>

          {/* Chip box + inline input */}
          <div
            className={`tag-field-box${tagError ? ' tag-field-box--error' : ''}`}
            onClick={() => !atLimit && tagInputRef.current?.focus()}
            role="group"
            aria-label={t('form.tagsLabel')}
          >
            {tags.map((tag) => (
              <TagChip key={tag.name} tag={tag} onRemove={removeTag} />
            ))}
            {!atLimit && (
              <input
                ref={tagInputRef}
                id="tag-input"
                className="tag-inline-input"
                type="text"
                placeholder={tags.length === 0 ? t('form.tagPlaceholder') : t('form.tagAddAnother')}
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
              aria-label={t('form.tagsLabel')}
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
                {t('form.tagLimit', { max: MAX_TAGS })}
              </p>
            ) : (
              <span className="tag-footer-left" aria-live="polite">
                {colorSource === 'suggested' && (
                  <span className="tag-suggested-badge">
                    {t('form.tagSuggested')}
                  </span>
                )}
                {colorSource === 'preference' && (
                  <span className="tag-pref-badge">
                    <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
                    {t('form.tagRemembered')}
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
                    aria-label={t('form.colorPickerAriaLabel')}
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
                  {t('form.tagAdd')}
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
            {t('form.priorityLabel')}{priorityHigh ? ' ✓' : ''}
          </button>
        </div>

        {submitError && (
          <p className="auth-field-error" role="alert" style={{ marginBottom: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>error</span>
            {submitError}
          </p>
        )}

        <div className="form-actions">
          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)} disabled={submitting}>{t('common.cancel')}</button>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? t('form.creating') : t('form.saveTask')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TaskForm;
