import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import TaskForm from '../../components/TaskForm/TaskForm';
import Footer from '../../components/Footer/Footer';
import { useLocale } from '../../i18n/LocaleContext';
import './CreateTask.css';

const CreateTask = () => {
  const { t } = useLocale();

  const TIPS = [
    { icon: 'tips_and_updates', text: t('createTask.tip1') },
    { icon: 'hourglass_top',    text: t('createTask.tip2') },
    { icon: 'calendar_month',   text: t('createTask.tip3') },
    { icon: 'flag',             text: t('createTask.tip4') },
  ];

  return (
    <div className="create-task-layout">
      <Navbar />
      <main id="main-content" className="create-task-main">
        <div className="create-task-inner">

          {/* Left: form */}
          <div className="create-task-form-col">
            <div className="create-task-header">
              <div className="create-task-badge">
                <span className="material-symbols-outlined" aria-hidden="true">add_task</span>
                {t('createTask.badge')}
              </div>
              <h1 className="create-task-title">{t('createTask.title')}</h1>
              <p className="create-task-subtitle">{t('createTask.subtitle')}</p>
            </div>
            <TaskForm />
          </div>

          {/* Right: tips sidebar */}
          <aside className="create-task-sidebar" aria-label={t('createTask.sidebarTitle')}>
            <div className="create-task-sidebar-inner">
              <h2 className="sidebar-title">
                <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                {t('createTask.sidebarTitle')}
              </h2>
              <ul className="sidebar-tips">
                {TIPS.map((tip) => (
                  <li key={tip.text} className="sidebar-tip">
                    <div className="sidebar-tip-icon" aria-hidden="true">
                      <span className="material-symbols-outlined">{tip.icon}</span>
                    </div>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>

              <div className="sidebar-gap-card">
                <div className="sidebar-gap-label">The Gap</div>
                <div className="sidebar-gap-row">
                  <div className="sidebar-gap-stat">
                    <span className="sidebar-gap-val">45m</span>
                    <span className="sidebar-gap-key">{t('stats.planned')}</span>
                  </div>
                  <span className="sidebar-gap-arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                  <div className="sidebar-gap-stat">
                    <span className="sidebar-gap-val">52m</span>
                    <span className="sidebar-gap-key">{t('stats.actual')}</span>
                  </div>
                  <div className="sidebar-gap-stat">
                    <span className="sidebar-gap-val over">+7m</span>
                    <span className="sidebar-gap-key">{t('stats.gap')}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTask;
