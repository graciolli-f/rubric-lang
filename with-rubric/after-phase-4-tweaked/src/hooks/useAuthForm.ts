import { useAuthStore } from '../stores/auth-store';
import type { LoginCredentials, SignupData } from '../types/auth-types';

export function useAuthForm() {
  const { login, signup, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by the store
      throw err;
    }
  };

  const handleSignup = async (userData: SignupData): Promise<void> => {
    try {
      await signup(userData);
    } catch (err) {
      // Error is handled by the store  
      throw err;
    }
  };

  return {
    handleLogin,
    handleSignup,
    isLoading,
    error,
    clearError
  };
} 