import { useAuthStore } from '../stores/auth-store';
import type { LoginCredentials, SignupData } from '../types/user-types';

export function useAuth() {
  const { login, signup, logout, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    clearError();
    await login(credentials);
  };

  const handleSignup = async (data: SignupData): Promise<void> => {
    clearError();
    await signup(data);
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return {
    handleLogin,
    handleSignup,
    handleLogout,
    isLoading,
    error,
    clearError
  };
} 