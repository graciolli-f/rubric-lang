/**
 * State management for user authentication
 * Coordinates between UI and authentication services
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  User, 
  AuthState, 
  LoginData, 
  SignupData, 
  PasswordResetData, 
  ValidationResult 
} from '../types/auth.types';

interface AuthStore extends AuthState {
  // Authentication actions
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Password reset actions
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  
  // User management actions
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Session management
  checkAuthStatus: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  
  // UI state actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Authentication actions
      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // const response = await authService.login(data);
          // Mock implementation for now
          const mockUser: User = {
            id: '1',
            email: data.email,
            name: data.email.split('@')[0],
            role: 'user' as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set({ 
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // const response = await authService.signup(data);
          // Mock implementation for now
          const mockUser: User = {
            id: '1',
            email: data.email,
            name: data.name,
            role: 'user' as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set({ 
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Signup failed'
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          // TODO: Import and use authService
          // await authService.logout();
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Logout failed'
          });
        }
      },

      refreshToken: async () => {
        set({ isLoading: true });
        try {
          // TODO: Import and use authService
          // const response = await authService.refreshToken();
          set({ isLoading: false });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Token refresh failed'
          });
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // await authService.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password reset request failed'
          });
          throw error;
        }
      },

      resetPassword: async (data: PasswordResetData) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // await authService.resetPassword(data);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password reset failed'
          });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) throw new Error('No authenticated user');
        
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // const updatedUser = await authService.updateProfile(user.id, data);
          const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
          
          set({ 
            user: updatedUser,
            isLoading: false
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed'
          });
          throw error;
        }
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user) throw new Error('No authenticated user');
        
        set({ isLoading: true, error: null });
        try {
          // TODO: Import and use authService
          // await authService.deleteAccount(user.id);
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Account deletion failed'
          });
          throw error;
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          // TODO: Import and use authService
          // const user = await authService.validateSession();
          // For now, check if we have user in storage
          const { user } = get();
          
          set({
            isAuthenticated: !!user,
            isLoading: false
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null // Don't show error for failed auth check
          });
        }
      },

      initializeAuth: async () => {
        await get().checkAuthStatus();
      },

      // UI state actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export { useAuthStore };