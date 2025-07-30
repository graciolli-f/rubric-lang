import React, { useState } from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import type { SignupData } from '../types/auth-types';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps): React.JSX.Element {
  const { handleSignup, isLoading, error, clearError } = useAuthForm();
  const [formData, setFormData] = useState<SignupData>({
    email: '', password: '', name: '', role: 'user'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;
    try {
      await handleSignup(formData);
      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook/store
    }
  };

  const handleInputChange = (field: keyof SignupData | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) clearError();
  };

  const inputClassName = (fieldName: string) => 
    `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      formErrors[fieldName] ? 'border-red-500' : 'border-gray-300'
    }`;

  const FormField = ({ label, id, type = 'text', value, placeholder, autoComplete }: {
    label: string; id: string; type?: string; value: string; placeholder: string; autoComplete?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => handleInputChange(id as keyof SignupData | 'confirmPassword', e.target.value)}
        className={inputClassName(id)}
        placeholder={placeholder}
        disabled={isLoading}
        autoComplete={autoComplete}
      />
      {formErrors[id] && <p className="mt-1 text-sm text-red-600">{formErrors[id]}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Full Name"
            id="name"
            value={formData.name}
            placeholder="Enter your full name"
            autoComplete="name"
          />
          <FormField
            label="Email Address"
            id="email"
            type="email"
            value={formData.email}
            placeholder="Enter your email"
            autoComplete="email"
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            value={formData.password}
            placeholder="Enter your password"
            autoComplete="new-password"
          />
          <FormField
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 