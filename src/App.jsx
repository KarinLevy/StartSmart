import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import FocusPicker from './pages/FocusMode/FocusPicker';
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

/* Redirects unauthenticated users to /login */
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <NotificationsProvider>
    <TasksProvider>
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Footer pages (public) */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/premium" element={<Premium />} />

        {/* Protected app routes */}
        <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-task"        element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/task-details/:id"   element={<ProtectedRoute><TaskDetails /></ProtectedRoute>} />
        <Route path="/focus-mode"          element={<ProtectedRoute><FocusPicker /></ProtectedRoute>} />
        <Route path="/focus-mode/:id"     element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
        <Route path="/schedule"           element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/task-history"       element={<ProtectedRoute><TaskHistory /></ProtectedRoute>} />
        <Route path="/statistics"         element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
        <Route path="/profile"            element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings"           element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications"      element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/insights"           element={<ProtectedRoute><Insights /></ProtectedRoute>} />
      </Routes>
    </Router>
    </TasksProvider>
    </NotificationsProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
