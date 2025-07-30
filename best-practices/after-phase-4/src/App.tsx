import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useCollaborationStore } from './stores/collaborationStore';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Main app pages
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import Analytics from './pages/Analytics';
import Groups from './pages/Groups';
import Activity from './pages/Activity';
import Profile from './pages/Profile';

// Components
import Navigation from './components/Navigation';
import PresenceIndicator from './components/PresenceIndicator';
import NotificationToast from './components/NotificationToast';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { connect, disconnect, isConnected } = useCollaborationStore();

  // Connect to WebSocket when user authenticates
  useEffect(() => {
    if (isAuthenticated && user && !isConnected) {
      connect(user.id);
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, user, isConnected, connect, disconnect]);

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // Authenticated app
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* App Title */}
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Expense Tracker
                </h1>
                {user && (
                  <span className="ml-3 text-sm text-gray-500">
                    Welcome, {user.name}
                  </span>
                )}
              </div>
              
              {/* Real-time indicators */}
              <div className="flex items-center space-x-4">
                <PresenceIndicator />
                {isConnected && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Connected
                  </div>
                )}
              </div>
            </div>
            
            {/* Navigation */}
            <Navigation />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Real-time notifications */}
        <NotificationToast />
      </div>
    </Router>
  );
}

export default App;
