import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateTask from './pages/CreateTask/CreateTask';
import FocusMode from './pages/FocusMode/FocusMode';
import Statistics from './pages/Statistics/Statistics';
import LandingPage from './pages/LandingPage/landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/focus-mode" element={<FocusMode />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;
