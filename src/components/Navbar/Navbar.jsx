import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useNotifications } from '../../context/NotificationsContext';
import { useProfile } from '../../context/ProfileContext';
import { useLocale } from '../../i18n/LocaleContext';
import Avatar from '../Avatar/Avatar';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const { t } = useLocale();

  const NAV_LINKS = [
    { to: '/dashboard',    icon: 'dashboard',       label: t('nav.dashboard') },
    { to: '/create-task',  icon: 'add_task',         label: t('nav.createTask') },
    { to: '/focus-mode',   icon: 'timer',            label: t('nav.focusMode') },
    { to: '/schedule',     icon: 'calendar_today',   label: t('nav.schedule') },
    { to: '/task-history', icon: 'history',          label: t('nav.taskHistory') },
    { to: '/statistics',   icon: 'insights',         label: t('nav.statistics') },
    { to: '/profile',      icon: 'person',           label: t('nav.profile') },
    { to: '/settings',     icon: 'settings',         label: t('nav.settings') },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Logo to="/dashboard" />

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

        <div className="navbar-right">
          <LanguageSwitcher />
          <ThemeToggle />

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

          <div className="navbar-profile">
            <div className="navbar-profile-info">
              <span className="navbar-profile-name">{profile.firstName} {profile.lastName}</span>
            </div>
            <Avatar size="md" className="navbar-profile-avatar" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
