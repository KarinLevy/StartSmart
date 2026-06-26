import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import TaskForm from '../../components/TaskForm/TaskForm';
import Footer from '../../components/Footer/Footer';
import './CreateTask.css';

const TIPS = [
  { icon: 'tips_and_updates', text: 'Be specific with your title — clear tasks are easier to estimate accurately.' },
  { icon: 'hourglass_top',    text: 'Add a buffer: most tasks take 20–30% longer than expected.' },
  { icon: 'calendar_month',   text: 'Scheduling a task makes it show up in your Schedule view.' },
  { icon: 'flag',             text: 'Mark a task high-priority if it must be done today.' },
];

const CreateTask = () => (
  <div className="create-task-layout">
    <Navbar />
    <main id="main-content" className="create-task-main">
      <div className="create-task-inner">

        {/* Left: form */}
        <div className="create-task-form-col">
          <div className="create-task-header">
            <div className="create-task-badge">
              <span className="material-symbols-outlined" aria-hidden="true">add_task</span>
              New task
            </div>
            <h1 className="create-task-title">Plan your next focus session</h1>
            <p className="create-task-subtitle">
              Fill in the details below. The more accurate your estimate, the better your Gap data will be.
            </p>
          </div>
          <TaskForm />
        </div>

        {/* Right: tips sidebar */}
        <aside className="create-task-sidebar" aria-label="Planning tips">
          <div className="create-task-sidebar-inner">
            <h2 className="sidebar-title">
              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
              Planning tips
            </h2>
            <ul className="sidebar-tips">
              {TIPS.map((t) => (
                <li key={t.text} className="sidebar-tip">
                  <div className="sidebar-tip-icon" aria-hidden="true">
                    <span className="material-symbols-outlined">{t.icon}</span>
                  </div>
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>

            <div className="sidebar-gap-card">
              <div className="sidebar-gap-label">The Gap</div>
              <div className="sidebar-gap-row">
                <div className="sidebar-gap-stat">
                  <span className="sidebar-gap-val">45m</span>
                  <span className="sidebar-gap-key">Planned</span>
                </div>
                <span className="sidebar-gap-arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                <div className="sidebar-gap-stat">
                  <span className="sidebar-gap-val">52m</span>
                  <span className="sidebar-gap-key">Actual</span>
                </div>
                <div className="sidebar-gap-stat">
                  <span className="sidebar-gap-val over">+7m</span>
                  <span className="sidebar-gap-key">Gap</span>
                </div>
              </div>
              <p className="sidebar-gap-note">StartSmart tracks this for every task you complete.</p>
            </div>
          </div>
        </aside>

      </div>
    </main>
    <Footer />
  </div>
);

export default CreateTask;
