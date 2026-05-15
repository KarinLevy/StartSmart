import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <div>
            <h1 className="navbar-logo-text">StartSmart</h1>
          </div>
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button className="navbar-hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="material-symbols-outlined">
            {isMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Navigation Links */}
        <nav className={`navbar-links ${isMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} to="/dashboard" end onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">dashboard</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} to="/create-task" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">add_task</span>
            <span>Create Task</span>
          </NavLink>
          <a className="navbar-link" href="#" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">assignment</span>
            <span>Task Details</span>
          </a>
          <NavLink className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} to="/focus-mode" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">timer</span>
            <span>Focus Mode</span>
          </NavLink>
          <a className="navbar-link" href="#" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">calendar_today</span>
            <span>Schedule</span>
          </a>
          <a className="navbar-link" href="#" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">history</span>
            <span>Task History</span>
          </a>
          <NavLink className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} to="/statistics" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">insights</span>
            <span>Statistics</span>
          </NavLink>
          <a className="navbar-link" href="#" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">person</span>
            <span>Profile</span>
          </a>
          <a className="navbar-link" href="#" onClick={closeMenu}>
            <span className="material-symbols-outlined navbar-link-icon">settings</span>
            <span>Settings/Upgrade</span>
          </a>
        </nav>

        {/* Right: Notifications & Profile */}
        <div className="navbar-right">
          <button className="navbar-notification">
            <span className="material-symbols-outlined">notifications</span>
            <span className="navbar-notification-dot"></span>
          </button>

          <div className="navbar-profile">
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">Maya Cohen</span>
            </div>
            <div className="navbar-profile-avatar">
              <img
                alt="Maya's avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8GuD2wPPDTlH7P0VxUJXoUCMroXZ0feEIyxxQbesa8F9FVMkARnJqI_E48IKMpYPnVJz47Yvo8Wrt2-drYftGKXDi6FZge3Of65zB3ugt1dX-yyKN28MjiGPKVSw72dPbI2LNkaMpoqAFscvc-4CLyoLPo0luZbYAbfqDjhtTXNAgAFtGq7XZuX6PrMmS31sX21Pk1P4tayMZG0cJKAB3zszct7hr5UpOFaFsJLju2OuLgllb60g0iyl-1bgGCK8luQZURHSbdf4"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
