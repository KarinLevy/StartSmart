import React, { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext(null);

const SEED = [
  { id: '1', icon: 'task_alt',     title: 'Task completed',           body: '"Database Migration Check" finished 2 min early. Nice pacing!',  time: '2m ago',    read: false },
  { id: '2', icon: 'query_stats',  title: 'Gap insight',              body: 'Your last 3 reports averaged +8 min over estimate. Consider adding a buffer.',  time: '1h ago',    read: false },
  { id: '3', icon: 'timer',        title: 'Focus session started',    body: '"Refine Product Architecture" timer is running.',                time: '2h ago',    read: true  },
  { id: '4', icon: 'event',        title: 'Upcoming task',            body: '"Client Feedback Loop" is scheduled in 30 minutes.',            time: '4h ago',    read: true  },
  { id: '5', icon: 'emoji_events', title: 'Weekly streak',            body: "You've focused for 5 consecutive days. Keep it up!",            time: 'Yesterday', read: true  },
];

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(SEED);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
