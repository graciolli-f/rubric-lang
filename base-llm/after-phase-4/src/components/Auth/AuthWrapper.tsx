import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { currentUser, isAuthenticated, login } = useCollaborativeExpenseStore();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  const authService = AuthService.getInstance();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const existingUser = authService.getCurrentUser();
        if (existingUser && authService.isAuthenticated()) {
          await login(existingUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [login, authService]);

  const handleLoginSuccess = async (user: User) => {
    try {
      await login(user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignupSuccess = async (user: User) => {
    try {
      await login(user);
    } catch (error) {
      console.error('Signup login failed:', error);
    }
  };

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        {authView === 'login' ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setAuthView('signup')}
          />
        ) : (
          <SignupForm
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </>
    );
  }

  // Render main application if authenticated
  return <>{children}</>;
} 