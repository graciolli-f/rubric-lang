import React, { useState } from 'react';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
}

interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string;
}

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }: LoginFormProps) {
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    loading: false,
    error: ''
  });

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.email || !state.password) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.login({
        email: state.email,
        password: state.password
      });
      
      onLoginSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
    }
  };

  const handleDemoLogin = async (role: 'employee' | 'manager' | 'admin') => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.loginAsDemo(role);
      onLoginSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Demo login failed' 
      }));
    }
  };

  const updateField = (field: keyof LoginState, value: string) => {
    setState(prev => ({ ...prev, [field]: value, error: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={state.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={state.loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={state.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={state.loading}
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{state.error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or try demo accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Admin
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Demo Credentials:</strong><br />
            Email: john@example.com, jane@example.com, or admin@example.com<br />
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
} 