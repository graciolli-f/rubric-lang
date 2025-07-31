import React, { useState } from 'react';
import type { SignupData } from '../types/user-types';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { useAuth } from '../hooks/useAuth';

interface SignupFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function SignupForm({ onSuccess, onLoginClick }: SignupFormProps): React.JSX.Element {
  const { handleSignup, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = new Map<string, string>();
    
    const nameError = validateName(formData.name);
    if (nameError) newErrors.set('name', nameError);
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.set('email', emailError);
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.set('password', passwordError);
    
    if (!formData.confirmPassword) {
      newErrors.set('confirmPassword', 'Please confirm your password');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.set('confirmPassword', 'Passwords do not match');
    }
    
    setErrors(newErrors);
    return newErrors.size === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await handleSignup(formData);
      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors.has(field)) {
      const newErrors = new Map(errors);
      newErrors.delete(field);
      setErrors(newErrors);
    }
    // Also clear confirm password error if password changes
    if (field === 'password' && errors.has('confirmPassword')) {
      const newErrors = new Map(errors);
      newErrors.delete('confirmPassword');
      setErrors(newErrors);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sign Up
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Create your account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label 
              htmlFor="name" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.has('name') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
              disabled={isFormLoading}
              aria-invalid={errors.has('name')}
              aria-describedby={errors.has('name') ? 'name-error' : undefined}
            />
            {errors.has('name') && (
              <p id="name-error" className="text-red-500 text-xs italic mt-1">
                {errors.get('name')}
              </p>
            )}
          </div>

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

          <div className="mb-4">
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
              placeholder="Create a password"
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

          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.has('confirmPassword') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              disabled={isFormLoading}
              aria-invalid={errors.has('confirmPassword')}
              aria-describedby={errors.has('confirmPassword') ? 'confirm-password-error' : undefined}
            />
            {errors.has('confirmPassword') && (
              <p id="confirm-password-error" className="text-red-500 text-xs italic mt-1">
                {errors.get('confirmPassword')}
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
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                isFormLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isFormLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 