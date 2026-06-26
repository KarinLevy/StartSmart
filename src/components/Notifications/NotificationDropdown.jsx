import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationsContext';
import './NotificationDropdown.css';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markRead, markAllRead } = useNotifications();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.closest('.notif-bell-wrap')?.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="notif-dropdown" ref={ref} role="dialog" aria-label="Notifications" aria-modal="true">
      <div className="notif-dropdown-head">
        <h3 className="notif-dropdown-title">Notifications</h3>
        <button className="notif-mark-all" onClick={markAllRead} aria-label="Mark all as read">
          Mark all read
        </button>
      </div>

      <ul className="notif-list" role="list">
        {notifications.map((n) => (
          <li key={n.id} className={`notif-item${n.read ? '' : ' unread'}`}>
            <button
              className="notif-item-btn"
              onClick={() => markRead(n.id)}
              aria-label={`${n.read ? '' : 'Unread: '}${n.title}`}
            >
              <div className={`notif-icon-wrap notif-icon-${n.icon.split('_')[0]}`} aria-hidden="true">
                <span className="material-symbols-outlined">{n.icon}</span>
              </div>
              <div className="notif-body">
                <span className="notif-title">{n.title}</span>
                <span className="notif-text">{n.body}</span>
                <span className="notif-time">{n.time}</span>
              </div>
              {!n.read && <span className="notif-unread-dot" aria-hidden="true" />}
            </button>
          </li>
        ))}
      </ul>

      <div className="notif-dropdown-footer">
        <Link to="/notifications" className="notif-view-all" onClick={onClose}>
          View all notifications
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
