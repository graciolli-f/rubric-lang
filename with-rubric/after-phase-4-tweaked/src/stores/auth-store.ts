import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth-service';
import { websocketService } from '../services/websocket-service';
import type { User, LoginCredentials, SignupData } from '../types/auth-types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = await authService.login(credentials);
          
          // Set current user in WebSocket service
          websocketService.setCurrentUser(user);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          // Connect to WebSocket for real-time features
          await websocketService.connect();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = await authService.signup(data);
          
          // Set current user in WebSocket service
          websocketService.setCurrentUser(user);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          // Connect to WebSocket for real-time features
          await websocketService.connect();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({ 
            isLoading: false, 
            error: errorMessage,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          
          // Disconnect WebSocket
          websocketService.disconnect();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Logout failed';
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const currentUser = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        
        if (currentUser && isAuthenticated) {
          websocketService.setCurrentUser(currentUser);
          websocketService.connect();
          
          set({ 
            user: currentUser, 
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } else {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 