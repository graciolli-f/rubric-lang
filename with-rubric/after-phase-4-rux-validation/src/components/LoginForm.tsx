import React, { useState } from 'react';
import type { LoginCredentials } from '../types/user-types';
import { validateEmail, validatePassword } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: () => void;
  onSignupClick?: () => void;
}

export function LoginForm({ onSuccess, onSignupClick }: LoginFormProps): React.JSX.Element {
  const { handleLogin, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = new Map<string, string>();
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.set('email', emailError);
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.set('password', passwordError);
    
    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await handleLogin(formData);
      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors.has(field)) {
      const newErrors = new Map(errors);
      newErrors.delete(field);
      setErrors(newErrors);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sign In
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.has('email') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              disabled={isFormLoading}
              aria-invalid={errors.has('email')}
              aria-describedby={errors.has('email') ? 'email-error' : undefined}
            />
            {errors.has('email') && (
              <p id="email-error" className="text-red-500 text-xs italic mt-1">
                {errors.get('email')}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.has('password') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
              disabled={isFormLoading}
              aria-invalid={errors.has('password')}
              aria-describedby={errors.has('password') ? 'password-error' : undefined}
            />
            {errors.has('password') && (
              <p id="password-error" className="text-red-500 text-xs italic mt-1">
                {errors.get('password')}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isFormLoading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                isFormLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isFormLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSignupClick}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-gray-600">
          <p className="font-semibold">Demo Credentials:</p>
          <p>Admin: admin@company.com / password123</p>
          <p>Manager: manager@company.com / password123</p>
        </div>
      </div>
    </div>
  );
} 