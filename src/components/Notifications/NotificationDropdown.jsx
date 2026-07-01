import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import { useLocale } from '../../i18n/LocaleContext';
import { formatRelativeTime } from '../../utils/dateFormat';
import './NotificationDropdown.css';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markRead, markAllRead } = useNotifications();
  const { t } = useLocale();
  const hasUnread = notifications.some((n) => !n.read);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.closest('.notif-bell-wrap')?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="notif-dropdown" ref={ref} role="dialog" aria-label={t('notif.title')} aria-modal="true">
      <div className="notif-dropdown-head">
        <h3 className="notif-dropdown-title">{t('notif.title')}</h3>
        {hasUnread && (
          <button className="notif-mark-all" onClick={markAllRead} aria-label={t('notif.markAllRead')}>
            {t('notif.markAllRead')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notif-dropdown-empty">
          <span className="material-symbols-outlined" aria-hidden="true">notifications_none</span>
          <p>{t('notif.empty')}</p>
        </div>
      ) : (
      <ul className="notif-list" role="list">
        {notifications.map((n) => (
          <li key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
            <button
              className="notif-item-btn"
              onClick={() => markRead(n.id)}
              aria-label={`${n.read ? '' : `${t('notif.unreadDot')}: `}${n.titleKey ? t(n.titleKey) : n.title}`}
            >
              <div className={`notif-icon-wrap notif-icon-${n.icon.split('_')[0]}`} aria-hidden="true">
                <span className="material-symbols-outlined">{n.icon}</span>
              </div>
              <div className="notif-body">
                <span className="notif-title">{n.titleKey ? t(n.titleKey) : n.title}</span>
                <span className="notif-text">{n.bodyKey ? t(n.bodyKey, { taskTitle: n.taskTitle ?? '' }) : n.body}</span>
                <span className="notif-time">{formatRelativeTime(n.createdAt, t)}</span>
              </div>
              {!n.read && <span className="notif-unread-dot" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>
      )}

      <div className="notif-dropdown-footer">
        <Link to="/notifications" className="notif-view-all" onClick={onClose}>
          {t('notif.viewAll')}
          <span className="material-symbols-outlined flip-rtl" style={{ fontSize: '16px' }} aria-hidden="true">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
