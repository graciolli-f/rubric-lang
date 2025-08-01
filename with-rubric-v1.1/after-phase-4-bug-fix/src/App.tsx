import React, { useEffect } from 'react';
import ExpenseTrackerContainer from './components/ExpenseTrackerContainer';
import LoginPage from './components/LoginPage';
import { useAuthStore } from './stores/auth-store';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {isAuthenticated ? <ExpenseTrackerContainer /> : <LoginPage />}
    </ErrorBoundary>
  );
}

export default App;
