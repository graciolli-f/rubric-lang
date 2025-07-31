import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthLayout(): React.JSX.Element {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [currentView, setCurrentView] = useState<"login" | "signup">("login");

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // If authenticated, this component should not be rendered
  // The parent component should handle redirects
  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLoginSuccess = () => {
    // Authentication successful - parent component will handle redirect
  };

  const handleSignupSuccess = () => {
    // Account created and authenticated - parent component will handle redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="max-w-md mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Collaborative expense management for teams
          </p>
        </div>
      </header>

      {/* Main Auth Content */}
      <main className="flex items-center justify-center px-4 pb-8">
        {currentView === "login" ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSignupClick={() => setCurrentView("signup")}
          />
        ) : (
          <SignupForm
            onSuccess={handleSignupSuccess}
            onLoginClick={() => setCurrentView("login")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4">
        <div className="text-center text-sm text-gray-500">
          <p>Secure collaborative expense tracking</p>
        </div>
      </footer>
    </div>
  );
} 