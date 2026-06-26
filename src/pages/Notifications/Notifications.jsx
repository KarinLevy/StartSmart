import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useNotifications } from '../../context/NotificationsContext';
import './Notifications.css';

const Notifications = () => {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <div className="app-layout">
      <Navbar />
      <main id="main-content" className="page-content notif-page">
        <div className="notif-page-header">
          <div>
            <h1 className="notif-page-title">Notifications</h1>
            <p className="notif-page-sub">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn-secondary" onClick={markAllRead}>
              <span className="material-symbols-outlined" aria-hidden="true">done_all</span>
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notif-empty">
            <span className="material-symbols-outlined notif-empty-icon" aria-hidden="true">notifications_none</span>
            <p>No notifications yet.</p>
          </div>
        ) : (
          <ul className="notif-full-list" role="list">
            {notifications.map((n) => (
              <li key={n.id} className={`notif-full-item${n.read ? '' : ' unread'}`}>
                <button
                  className="notif-full-btn"
                  onClick={() => markRead(n.id)}
                  aria-label={`${n.read ? '' : 'Unread: '}${n.title}`}
                >
                  <div className={`notif-icon-wrap notif-icon-${n.icon.split('_')[0]}`} aria-hidden="true">
                    <span className="material-symbols-outlined">{n.icon}</span>
                  </div>
                  <div className="notif-full-body">
                    <div className="notif-full-row">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <span className="notif-text">{n.body}</span>
                  </div>
                  {!n.read && <span className="notif-unread-dot" aria-label="Unread" />}
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
