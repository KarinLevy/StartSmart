import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../Logo/Logo';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useNotifications } from '../../context/NotificationsContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../i18n/LocaleContext';
import Avatar from '../Avatar/Avatar';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { profile } = useProfile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLocale();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  // Derive display name: prefer profile data, fall back to user metadata or email
  const firstName = profile?.firstName || user?.user_metadata?.first_name || '';
  const lastName  = profile?.lastName  || user?.user_metadata?.last_name  || '';
  const displayName = (firstName || lastName)
    ? `${firstName} ${lastName}`.trim()
    : (user?.email ?? '');

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
              aria-label={unreadCount > 0 ? (unreadCount === 1 ? t('notif.unread').replace('{n}', unreadCount) : t('notif.unreadPlural').replace('{n}', unreadCount)) : t('notif.title')}
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
              <span className="navbar-profile-name">{displayName}</span>
            </div>
            <Avatar size="md" className="navbar-profile-avatar" />
            <button
              className="navbar-logout-btn"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
            >
              <span className="material-symbols-outlined" aria-hidden="true">logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
