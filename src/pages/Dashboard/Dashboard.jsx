import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import HeroTaskCard from '../../components/TaskCards/HeroTaskCard';
import WorkflowTable from '../../components/TaskCards/WorkflowTable';
import './Dashboard.css';
import Footer from '../../components/Footer/Footer';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-content">

          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-greeting">{greet()}, Maya 👋</h2>
              <div className="dashboard-date">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
                <span>{today}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-left-col">
              <HeroTaskCard />
              <WorkflowTable />
            </div>
            <div className="dashboard-right-col">
              <Sidebar />
            </div>
          </div>

        </div>
      </main>

      <button
        className="fab-button primary-gradient motivational-glow"
        aria-label="Create new task"
        onClick={() => navigate('/create-task')}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add</span>
      </button>
      <Footer />
    </div>
  );
};

export default Dashboard;
