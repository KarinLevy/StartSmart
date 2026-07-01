import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useNotifications } from '../../context/NotificationsContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatRelativeTime } from '../../utils/dateFormat';
import './Notifications.css';

const Notifications = () => {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();
  const { t } = useLocale();

  const unreadLabel = unreadCount === 1
    ? t('notif.unread').replace('{n}', unreadCount)
    : t('notif.unreadPlural').replace('{n}', unreadCount);

  return (
    <div className="app-layout">
      <Navbar />
      <main id="main-content" className="page-content notif-page">
        <div className="notif-page-header">
          <div>
            <Link to="/dashboard" className="notif-back-link">
              <span className="material-symbols-outlined flip-rtl" aria-hidden="true">arrow_back</span>
              {t('notif.backToDash')}
            </Link>
            <h1 className="notif-page-title">{t('notif.title')}</h1>
            <p className="notif-page-sub">
              {unreadCount > 0 ? unreadLabel : t('notif.allCaughtUp')}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              <span className="material-symbols-outlined" aria-hidden="true">done_all</span>
              {t('notif.markAllRead')}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="material-symbols-outlined notif-empty-icon" aria-hidden="true">notifications_none</span>
            <p>{t('notif.empty')}</p>
          </div>
        ) : (
          <ul className="notif-full-list" role="list">
            {notifications.map((n) => (
              <li key={n.id} className={`notif-full-item${n.read ? '' : ' unread'}`}>
                <button
                  className="notif-full-btn"
                  onClick={() => markRead(n.id)}
                  aria-label={`${n.read ? '' : `${t('notif.unreadDot')}: `}${n.titleKey ? t(n.titleKey) : n.title}`}
                >
                  <div className={`notif-icon-wrap notif-icon-${n.icon.split('_')[0]}`} aria-hidden="true">
                    <span className="material-symbols-outlined">{n.icon}</span>
                  </div>
                  <div className="notif-full-body">
                    <div className="notif-full-row">
                      <span className="notif-title">{n.titleKey ? t(n.titleKey) : n.title}</span>
                      <span className="notif-time">{formatRelativeTime(n.createdAt, t)}</span>
                    </div>
                    <span className="notif-text">{n.bodyKey ? t(n.bodyKey, { taskTitle: n.taskTitle ?? '' }) : n.body}</span>
                  </div>
                  {!n.read && <span className="notif-unread-dot" aria-label={t('notif.unreadDot')} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Notifications;
