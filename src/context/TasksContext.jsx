import React, { createContext, useContext, useState } from 'react';

const TasksContext = createContext(null);

const SEED_TASKS = [
  {
    id: '1',
    title: 'Refine Product Architecture',
    description: 'Finalize the technical documentation for the SmartScale module before the stakeholder sync.',
    estimatedMinutes: 45,
    scheduledDate: new Date().toISOString().slice(0, 10) + 'T09:00',
    status: 'in_progress',
    priorityHigh: true,
    tags: [{ name: 'Work', color: '#2563eb' }, { name: 'Urgent', color: '#b91c1c' }],
    actualMinutes: null,
    gap: null,
  },
  {
    id: '2',
    title: 'Client Feedback Loop',
    description: 'Review client notes and prepare action items for the product team.',
    estimatedMinutes: 45,
    scheduledDate: new Date().toISOString().slice(0, 10) + 'T10:30',
    status: 'pending',
    priorityHigh: false,
    tags: [{ name: 'Work', color: '#2563eb' }],
    actualMinutes: null,
    gap: null,
  },
  {
    id: '3',
    title: 'Database Migration Check',
    description: 'Verify that the latest migration ran cleanly across all environments.',
    estimatedMinutes: 30,
    scheduledDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + 'T11:00',
    status: 'done',
    priorityHigh: false,
    tags: [{ name: 'Dev', color: '#0e7490' }],
    actualMinutes: 28,
    gap: -2,
  },
  {
    id: '4',
    title: 'Write Sprint Summary',
    description: 'Summarize completed tickets, blockers, and velocity for the sprint retro.',
    estimatedMinutes: 60,
    scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10) + 'T14:00',
    status: 'done',
    priorityHigh: false,
    tags: [{ name: 'Work', color: '#2563eb' }],
    actualMinutes: 78,
    gap: 18,
  },
];

let nextId = 5;

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(SEED_TASKS);

  function addTask(taskData) {
    const task = {
      id: String(nextId++),
      status: 'pending',
      actualMinutes: null,
      gap: null,
      ...taskData,
    };
    setTasks((prev) => [task, ...prev]);
    return task.id;
  }

  function updateTask(id, updates) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function finishFocus(id, actualMinutes) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const gap = actualMinutes - t.estimatedMinutes;
        return { ...t, status: 'done', actualMinutes, gap };
      })
    );
  }

  return (
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask, finishFocus }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside TasksProvider');
  return ctx;
}
