import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className={`material-symbols-outlined theme-toggle-icon ${isDark ? 'theme-icon-sun' : 'theme-icon-moon'}`}>
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
