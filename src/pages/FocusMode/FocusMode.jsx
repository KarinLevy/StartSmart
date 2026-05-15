import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import CurrentTaskCard from '../../components/FocusMode/CurrentTaskCard';
import CircularTimer from '../../components/FocusMode/CircularTimer';
import GradientButton from '../../components/FocusMode/GradientButton';
import EnvironmentCard from '../../components/FocusMode/EnvironmentCard';
import '../../components/FocusMode/FocusMode.css';
import Footer from '../../components/Footer/Footer';

const FocusMode = () => {
  return (
    <div className="focus-mode-layout">
      <Navbar />

      <main className="focus-mode-main">

        {/* Current Task Card */}
        <CurrentTaskCard />

        {/* Timer Section */}
        <CircularTimer />

        {/* Controls */}
        <div className="focus-controls-container">
          <GradientButton icon="pause" text="Stop" />
          <GradientButton icon="check" text="Finish" />
        </div>

        {/* Ambient Info Bento Grid */}
        <div className="focus-env-grid">
          <EnvironmentCard
            icon="music_note"
            title="Lo-fi Chill"
            description="Ambient workspace audio is currently active."
          />
          <EnvironmentCard
            icon="notifications_off"
            title="DND Active"
            description="All notifications silenced for this session."
            active={true}
          />
          <EnvironmentCard
            icon="analytics"
            title="Efficiency"
            description="You are +12% more focused than yesterday."
          />
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default FocusMode;
