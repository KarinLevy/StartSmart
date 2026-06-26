import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TasksProvider } from './context/TasksContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
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
import Notifications from './pages/Notifications/Notifications';
import PrivacyPolicy from './pages/FooterPages/PrivacyPolicy';
import Terms from './pages/FooterPages/Terms';
import About from './pages/FooterPages/About';
import FAQ from './pages/FooterPages/FAQ';
import Contact from './pages/FooterPages/Contact';
import Insights from './pages/Insights/Insights';
import Premium from './pages/Premium/Premium';

function App() {
  return (
    <ThemeProvider>
    <NotificationsProvider>
    <TasksProvider>
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
        <Route path="/task-details/:id" element={<TaskDetails />} />
        <Route path="/focus-mode/:id" element={<FocusMode />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/task-history" element={<TaskHistory />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Footer pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/premium" element={<Premium />} />
      </Routes>
    </Router>
    </TasksProvider>
    </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
