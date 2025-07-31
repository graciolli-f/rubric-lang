/**
 * Container component that orchestrates login interface
 * Manages authentication state and coordinates login flow
 */

import React, { useState, useCallback } from 'react';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../stores/auth-store';
import type { LoginData, SignupData } from '../types/auth.types';

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);
  
  const { 
    login, 
    signup, 
    isLoading, 
    error, 
    clearError 
  } = useAuthStore();

  const handleLogin = useCallback(async (data: LoginData) => {
    try {
      clearError();
      await login(data);
    } catch (error) {
      // Error is handled by the store
      console.error('Login failed:', error);
    }
  }, [login, clearError]);

  const handleSignup = useCallback(async (data: SignupData) => {
    try {
      clearError();
      await signup(data);
    } catch (error) {
      // Error is handled by the store
      console.error('Signup failed:', error);
    }
  }, [signup, clearError]);

  const toggleAuthMode = useCallback(() => {
    setShowSignup(prev => !prev);
    clearError();
  }, [clearError]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600">
            Collaborative expense management for teams
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {showSignup ? (
            <div>
              {/* TODO: Create SignupForm component */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
                <p className="text-gray-600 mt-2">Create your account</p>
                <p className="text-sm text-gray-500 mt-4">
                  Signup form coming soon...
                </p>
              </div>
            </div>
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              isLoading={isLoading}
              error={error || undefined}
            />
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {showSignup ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label={showSignup ? 'Switch to login' : 'Switch to signup'}
              >
                {showSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}