import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { User, UserSession, LoginFormData, SignupFormData } from '../types/user-types';
import { authService } from '../services/auth-service';

export interface AuthStoreState {
  currentUser: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        currentUser: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        login: async (data: LoginFormData) => {
          set({ isLoading: true, error: null });
          
          try {
            const session = await authService.login(data);
            
            set({
              currentUser: session.user,
              session,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false 
            });
            throw error;
          }
        },

        signup: async (data: SignupFormData) => {
          set({ isLoading: true, error: null });
          
          try {
            const session = await authService.signup(data);
            
            set({
              currentUser: session.user,
              session,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Signup failed',
              isLoading: false 
            });
            throw error;
          }
        },

        logout: () => {
          authService.logout();
          set({
            currentUser: null,
            session: null,
            isAuthenticated: false,
            error: null
          });
        },

        updateProfile: async (data: Partial<User>) => {
          const { currentUser } = get();
          if (!currentUser) {
            throw new Error('No user logged in');
          }

          set({ isLoading: true, error: null });
          
          try {
            const updatedUser = await authService.updateProfile(currentUser.id, data);
            
            set(state => ({
              currentUser: updatedUser,
              session: state.session ? { ...state.session, user: updatedUser } : null,
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Profile update failed',
              isLoading: false 
            });
            throw error;
          }
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-data',
        partialize: (state) => ({ 
          currentUser: state.currentUser, 
          session: state.session,
          isAuthenticated: state.isAuthenticated
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
); 