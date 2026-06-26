import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as tasksService from '../services/tasksService';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { user } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Load tasks whenever the logged-in user changes
  const refresh = useCallback(async () => {
    if (!user) { setTasks([]); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.listTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addTask = useCallback(async (taskData) => {
    if (!user) throw new Error('Not authenticated');
    const task = await tasksService.createTask(user.id, taskData);
    setTasks((prev) => [task, ...prev]);
    return task.id;
  }, [user]);

  const updateTask = useCallback(async (id, updates) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await tasksService.updateTask(id, user.id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, [user]);

  const deleteTask = useCallback(async (id) => {
    if (!user) throw new Error('Not authenticated');
    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await tasksService.deleteTask(id);
  }, [user]);

  /** Called by FocusMode when a session finishes — B3 will also write time_logs */
  const finishFocus = useCallback(async (id, actualMinutes) => {
    if (!user) throw new Error('Not authenticated');
    const estimatedMinutes = tasks.find((t) => t.id === id)?.estimatedMinutes ?? 0;
    const gap = actualMinutes - estimatedMinutes;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: 'done', actualMinutes, gap } : t)
    );
    await tasksService.updateTask(id, user.id, { status: 'done' });
  }, [user, tasks]);

  return (
    <TasksContext.Provider value={{ tasks, loading, error, addTask, updateTask, deleteTask, finishFocus, refresh }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider');
  return ctx;
}
