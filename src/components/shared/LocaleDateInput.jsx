import React, { useRef } from 'react';
import { formatDate } from '../../utils/dateFormat';

/**
 * Date input that always shows the date in the regional format (e.g. DD/MM/YYYY
 * for Hebrew/Israeli) regardless of the browser's own locale setting.
 *
 * Props:
 *   id, value (YYYY-MM-DD), onChange, min, max, className, ariaLabel — same as <input type="date">
 *   regional — the regional settings object from useRegional()
 *
 * When regional.dateFormat is DD/MM/YYYY (or any non-native format) it shows a
 * styled text input with the correctly formatted date and overlays a transparent
 * native date picker on top so the browser's calendar still handles interaction.
 * When regional.dateFormat is the native YYYY-MM-DD it falls back to a plain
 * date input.
 */
const LocaleDateInput = ({ id, value, onChange, min, max, className, ariaLabel, regional = {} }) => {
  const pickerRef = useRef(null);

  const fmt = regional?.dateFormat ?? 'DD/MM/YYYY';
  // Native date inputs already show YYYY-MM-DD correctly; only override others.
  const needsOverride = fmt !== 'YYYY-MM-DD';

  if (!needsOverride) {
    return (
      <input id={id} type="date" className={className}
        value={value || ''} min={min} max={max} onChange={onChange} aria-label={ariaLabel} />
    );
  }

  const display = value ? formatDate(new Date(value + 'T00:00'), regional) : '';
  const placeholder = fmt; // e.g. "DD/MM/YYYY"

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <input
        id={id}
        type="text"
        className={className}
        value={display}
        readOnly
        placeholder={placeholder}
        style={{ cursor: 'pointer' }}
        onClick={() => pickerRef.current?.showPicker?.()}
        aria-label={ariaLabel}
      />
      <input
        ref={pickerRef}
        type="date"
        value={value || ''}
        min={min}
        max={max}
        onChange={onChange}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', padding: 0 }}
        tabIndex={-1}
        aria-hidden="true"
      />
    </span>
  );
};

export default LocaleDateInput;
