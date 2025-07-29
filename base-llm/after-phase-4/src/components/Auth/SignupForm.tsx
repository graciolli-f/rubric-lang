import React, { useState } from 'react';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface SignupFormProps {
  onSignupSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

interface SignupState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'employee' | 'manager' | 'admin';
  loading: boolean;
  error: string;
}

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }: SignupFormProps) {
  const [state, setState] = useState<SignupState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    loading: false,
    error: ''
  });

  const authService = AuthService.getInstance();

  const validateForm = (): string | null => {
    if (!state.name.trim()) return 'Name is required';
    if (!state.email.trim()) return 'Email is required';
    if (!state.password) return 'Password is required';
    if (state.password.length < 6) return 'Password must be at least 6 characters';
    if (state.password !== state.confirmPassword) return 'Passwords do not match';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.signup({
        name: state.name.trim(),
        email: state.email.trim().toLowerCase(),
        password: state.password,
        role: state.role
      });
      
      onSignupSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      }));
    }
  };

  const updateField = (field: keyof SignupState, value: string) => {
    setState(prev => ({ ...prev, [field]: value, error: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={state.name}
                onChange={(e) => updateField('name', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={state.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={state.role}
                onChange={(e) => updateField('role', e.target.value)}
                disabled={state.loading}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Managers can approve expenses, Admins can manage all groups
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Create a password (min 6 characters)"
                value={state.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={state.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Role Permissions:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li><strong>Employee:</strong> Create and manage personal expenses</li>
            <li><strong>Manager:</strong> Approve team expenses, create groups</li>
            <li><strong>Admin:</strong> Full access to all groups and users</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 