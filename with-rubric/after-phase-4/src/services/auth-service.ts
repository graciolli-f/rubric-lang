import type { User, UserSession, LoginFormData, SignupFormData } from '../types/user-types';
import { generateId } from '../utils/formatters';

class AuthService {
  private mockUsers: User[] = [];
  private sessions: Map<string, UserSession> = new Map();

  constructor() {
    this.loadMockData();
    this.initializeDefaultUsers();
  }

  private loadMockData(): void {
    try {
      const storedUsers = localStorage.getItem('mock-users');
      if (storedUsers) {
        this.mockUsers = JSON.parse(storedUsers);
      }

      const storedSessions = localStorage.getItem('mock-sessions');
      if (storedSessions) {
        const sessionData = JSON.parse(storedSessions);
        this.sessions = new Map(sessionData);
      }
    } catch (error) {
      // Ignore errors and use empty state
    }
  }

  private saveMockData(): void {
    try {
      localStorage.setItem('mock-users', JSON.stringify(this.mockUsers));
      localStorage.setItem('mock-sessions', JSON.stringify(Array.from(this.sessions.entries())));
    } catch (error) {
      // Ignore storage errors
    }
  }

  private initializeDefaultUsers(): void {
    if (this.mockUsers.length === 0) {
      const now = new Date().toISOString();
      
      this.mockUsers = [
        {
          id: 'user-1',
          name: 'John Manager',
          email: 'manager@example.com',
          role: 'manager',
          createdAt: now,
          avatar: '👨‍💼'
        },
        {
          id: 'user-2', 
          name: 'Alice User',
          email: 'alice@example.com',
          role: 'user',
          createdAt: now,
          avatar: '👩‍💻'
        },
        {
          id: 'user-3',
          name: 'Bob Admin',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: now,
          avatar: '👨‍🔧'
        }
      ];
      
      this.saveMockData();
    }
  }

  async login(data: LoginFormData): Promise<UserSession> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = this.mockUsers.find(u => u.email === data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // For demo purposes, accept any password for existing users
    const token = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const session: UserSession = {
      user: { ...user, lastLoginAt: new Date().toISOString() },
      token,
      expiresAt
    };

    this.sessions.set(token, session);
    this.saveMockData();

    return session;
  }

  async signup(data: SignupFormData): Promise<UserSession> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const existingUser = this.mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: generateId(),
      name: data.name,
      email: data.email,
      role: 'user',
      createdAt: now,
      lastLoginAt: now
    };

    this.mockUsers.push(newUser);

    const token = generateId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const session: UserSession = {
      user: newUser,
      token,
      expiresAt
    };

    this.sessions.set(token, session);
    this.saveMockData();

    return session;
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, we'd invalidate the session on the server
  }

  async getCurrentUser(): Promise<User | null> {
    // This would normally validate the current session
    return null;
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = this.mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.mockUsers[userIndex],
      ...data,
      id: userId, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };

    this.mockUsers[userIndex] = updatedUser;
    this.saveMockData();

    return updatedUser;
  }

  async validateSession(token: string): Promise<boolean> {
    const session = this.sessions.get(token);
    if (!session) return false;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return expiresAt > now;
  }
}

export const authService = new AuthService(); 