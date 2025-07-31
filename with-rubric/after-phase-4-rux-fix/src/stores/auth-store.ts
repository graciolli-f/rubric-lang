import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, SignupData, UserProfile, AuthState } from '../types/user-types';
import { authService } from '../services/auth-service';

interface AuthStoreState extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });
          
          try {
            const user = await authService.login(credentials);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: message 
            });
            throw error;
          }
        },

        signup: async (data: SignupData) => {
          set({ isLoading: true, error: null });
          
          try {
            const user = await authService.signup(data);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Signup failed';
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false, 
              error: message 
            });
            throw error;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          
          try {
            await authService.logout();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Logout failed';
            set({ isLoading: false, error: message });
          }
        },

        updateProfile: async (data: Partial<UserProfile>) => {
          const { user } = get();
          if (!user) {
            throw new Error('No authenticated user');
          }

          set({ isLoading: true, error: null });
          
          try {
            const updatedUser = await authService.updateProfile(data);
            set({ 
              user: updatedUser, 
              isLoading: false,
              error: null 
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Profile update failed';
            set({ isLoading: false, error: message });
            throw error;
          }
        },

        clearError: () => {
          set({ error: null });
        },

        checkAuthStatus: async () => {
          const currentUser = authService.getCurrentUser();
          const isAuth = authService.isAuthenticated();
          
          set({ 
            user: currentUser, 
            isAuthenticated: isAuth,
            isLoading: false 
          });
        }
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        })
      }
    ),
    { name: 'auth-store' }
  )
); 