import { create } from 'zustand';
import type { User, AuthState, LoginCredentials, SignupData } from '../types';

// Mock users for development
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'manager',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  },
];

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Mock actions for development
  setMockUser: (userId: string) => void;
}

const AUTH_STORAGE_KEY = 'expense-tracker-auth';

// Storage helpers
function loadAuthFromStorage(): { user: User | null } {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return { user: null };
    
    const parsed = JSON.parse(stored);
    return { user: parsed.user || null };
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
    return { user: null };
  }
}

function saveAuthToStorage(user: User | null) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
}

// Mock authentication functions
async function mockLogin(credentials: LoginCredentials): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(u => u.email === credentials.email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Update last active
  user.lastActive = new Date().toISOString();
  return user;
}

async function mockSignup(data: SignupData): Promise<User> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    email: data.email,
    name: data.name,
    role: 'user',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  return newUser;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // Load initial state from storage
  const { user } = loadAuthFromStorage();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    error: null,

    login: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const user = await mockLogin(credentials);
        saveAuthToStorage(user);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Login failed',
          isLoading: false 
        });
        throw error;
      }
    },

    signup: async (data) => {
      set({ isLoading: true, error: null });
      
      try {
        const user = await mockSignup(data);
        saveAuthToStorage(user);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Signup failed',
          isLoading: false 
        });
        throw error;
      }
    },

    logout: () => {
      saveAuthToStorage(null);
      set({ user: null, isAuthenticated: false, error: null });
    },

    clearError: () => {
      set({ error: null });
    },

    updateProfile: async (updates) => {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const updatedUser = { ...user, ...updates };
        
        // Update in mock users array
        const userIndex = mockUsers.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          mockUsers[userIndex] = updatedUser;
        }
        
        saveAuthToStorage(updatedUser);
        set({ user: updatedUser, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Profile update failed',
          isLoading: false 
        });
        throw error;
      }
    },

    // Development helper
    setMockUser: (userId) => {
      const user = mockUsers.find(u => u.id === userId);
      if (user) {
        saveAuthToStorage(user);
        set({ user, isAuthenticated: true, error: null });
      }
    },
  };
});

// Export mock users for development
export { mockUsers }; 