import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import StatisticsCard from '../../components/Statistics/StatisticsCard';
import ProductivityChart from '../../components/Statistics/ProductivityChart';
import InsightCard from '../../components/Statistics/InsightCard';
import TaskAnalyticsTable from '../../components/Statistics/TaskAnalyticsTable';
import '../../components/Statistics/Statistics.css';
import Footer from '../../components/Footer/Footer';
const Statistics = () => {
  return (
    <div className="statistics-layout">
      <Navbar />

      <main className="statistics-main">

        {/* Header Controls Row */}
        <section className="statistics-header">
          <div className="statistics-header-left">
            <div className="statistics-time-toggle">
              <button className="time-toggle-btn active">Daily</button>
              <button className="time-toggle-btn">Weekly</button>
              <button className="time-toggle-btn">Monthly</button>
            </div>
            <div className="statistics-date">
              <span className="material-symbols-outlined statistics-date-icon">calendar_today</span>
              <h2>Tuesday, April 29</h2>
            </div>
          </div>

          <div className="statistics-header-right">
            <button className="action-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
              Filter
            </button>
            <button className="action-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>sort</span>
              Sort
            </button>
          </div>
        </section>

        {/* Summary Cards Grid */}
        <section className="summary-cards-grid">
          <StatisticsCard
            title="Tasks Completed"
            value="3"
            icon="check_circle"
            colorClass="summary-completed"
          />
          <StatisticsCard
            title="Tasks Pending"
            value="2"
            icon="pending_actions"
            colorClass="summary-pending"
          />
          <StatisticsCard
            title="Total Time Worked"
            value="2h 10m"
            icon="schedule"
            colorClass="summary-time"
          />
        </section>

        {/* Main Body: Bento Grid Layout */}
        <section className="main-bento-grid">
          <ProductivityChart />
          <InsightCard />
        </section>

        {/* Task Breakdown Table */}
        <section>
          <TaskAnalyticsTable />
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Statistics;
