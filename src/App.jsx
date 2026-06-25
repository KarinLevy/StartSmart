import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/landing';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateTask from './pages/CreateTask/CreateTask';
import TaskDetails from './pages/TaskDetails/TaskDetails';
import FocusMode from './pages/FocusMode/FocusMode';
import Schedule from './pages/Schedule/Schedule';
import TaskHistory from './pages/TaskHistory/TaskHistory';
import Statistics from './pages/Statistics/Statistics';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* App */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/task-details" element={<TaskDetails />} />
        <Route path="/focus-mode" element={<FocusMode />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/task-history" element={<TaskHistory />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
