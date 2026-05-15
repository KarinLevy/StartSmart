import React from 'react';
import './Sidebar.css';
import DailyProgressCard from '../StatisticsCards/DailyProgressCard';
import FocusHourCard from '../StatisticsCards/FocusHourCard';
import SmartTipCard from '../SmartTipCard/SmartTipCard';

const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <DailyProgressCard />
      <FocusHourCard />
      <SmartTipCard />
    </aside>
  );
};

export default Sidebar;
