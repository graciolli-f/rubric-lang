import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../stores/auth-store';

export function AuthPage(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const { clearError } = useAuthStore();

  const handleViewChange = (view: 'login' | 'signup') => {
    clearError();
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="mt-2 text-gray-600">Multi-user collaborative expense management</p>
        </div>

        {currentView === 'login' ? (
          <LoginForm
            onSwitchToSignup={() => handleViewChange('signup')}
          />
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Sign Up</h2>
            <p className="text-center text-gray-600 mb-4">
              Signup functionality would be implemented here
            </p>
            <button
              onClick={() => handleViewChange('login')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Back to Sign In
            </button>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Demo application - use any of the provided test accounts
          </p>
        </div>
      </div>
    </div>
  );
} 