import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { useNotifications } from '../../context/NotificationsContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/dashboard',    icon: 'dashboard',       label: 'Dashboard' },
  { to: '/create-task',  icon: 'add_task',         label: 'Create Task' },
  { to: '/focus-mode',   icon: 'timer',            label: 'Focus Mode',  noExact: true },
  { to: '/schedule',     icon: 'calendar_today',   label: 'Schedule' },
  { to: '/task-history', icon: 'history',          label: 'Task History' },
  { to: '/statistics',   icon: 'insights',         label: 'Statistics' },
  { to: '/profile',      icon: 'person',           label: 'Profile' },
  { to: '/settings',     icon: 'settings',         label: 'Settings' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <div className="navbar-logo-icon" aria-hidden="true">
            <span className="material-symbols-outlined">rocket_launch</span>
          </div>
          <h1 className="navbar-logo-text">StartSmart</h1>
        </div>

        {/* Hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Nav links */}
        <nav
          id="navbar-links"
          className={`navbar-links${menuOpen ? ' mobile-open' : ''}`}
          aria-label="App navigation"
        >
          {NAV_LINKS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
              to={to}
              onClick={closeMenu}
              end
            >
              <span className="material-symbols-outlined navbar-link-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right section */}
        <div className="navbar-right">
          <ThemeToggle />

          {/* Notifications bell */}
          <div className="notif-bell-wrap">
            <button
              className="navbar-notification"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-haspopup="dialog"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen((v) => !v)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
              {unreadCount > 0 && (
                <span className="navbar-notification-badge" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Profile */}
          <div className="navbar-profile">
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">Maya Cohen</span>
            </div>
            <div
              className="navbar-profile-avatar"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #6b38d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Maya Cohen's avatar"
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>MC</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
