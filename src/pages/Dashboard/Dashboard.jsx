import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import HeroTaskCard from '../../components/TaskCards/HeroTaskCard';
import WorkflowTable from '../../components/TaskCards/WorkflowTable';
import './Dashboard.css';
import Footer from '../../components/Footer/Footer';

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-content">

          {/* Welcome Header */}
          <div className="dashboard-header">
            <h2 className="dashboard-greeting">Good morning, Maya 👋</h2>
            <div className="dashboard-date">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
              <span>Sunday, May 10th, 2026</span>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="dashboard-grid">

            {/* Main Content (Left) */}
            <div className="dashboard-left-col">
              <HeroTaskCard />
              <WorkflowTable />
            </div>

            {/* Stats Sidebar (Right) */}
            <div className="dashboard-right-col">
              <Sidebar />
            </div>

          </div>

        </div>
      </main>

      {/* Contextual FAB */}
      <button className="fab-button primary-gradient motivational-glow">
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add</span>
      </button>
      <Footer />

    </div>
  );
};

export default Dashboard;
