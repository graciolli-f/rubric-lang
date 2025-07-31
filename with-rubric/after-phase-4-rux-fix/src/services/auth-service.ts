import type { User, LoginCredentials, SignupData, UserProfile } from '../types/user-types';
import { hashPassword, validatePassword, generateToken, generateId } from '../utils/encryption';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';

// Mock user database - in real app, this would be handled by backend
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  },
  {
    id: '2', 
    email: 'manager@company.com',
    name: 'Manager User',
    role: 'manager',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  }
];

// Mock password storage - in real app, passwords would be hashed on server
const mockPasswords: Record<string, string> = {};

export class AuthService {
  private static instance: AuthService;
  private _currentUser: User | null = null;
  private _token: string | null = null;
  private _refreshTimer: NodeJS.Timeout | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeFromStorage();
  }

  private async initializeFromStorage(): Promise<void> {
    const token = getStorageItem('auth_token');
    const userData = getStorageItem('user_data');
    
    if (token && userData) {
      try {
        this._token = token;
        this._currentUser = JSON.parse(userData);
        // In real app, validate token with server
      } catch {
        this.logout();
      }
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // For demo purposes, allow 'password123' for all users
    if (credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }

    const token = generateToken();
    
    user.lastActive = new Date().toISOString();
    this._currentUser = user;
    this._token = token;

    setStorageItem('auth_token', token);
    setStorageItem('user_data', JSON.stringify(user));

    return user;
  }

  async signup(data: SignupData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const hashedPassword = await hashPassword(data.password);
    const user: User = {
      id: generateId(),
      email: data.email,
      name: data.name,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    mockUsers.push(user);
    mockPasswords[user.email] = hashedPassword;

    const token = generateToken();
    this._currentUser = user;
    this._token = token;

    setStorageItem('auth_token', token);
    setStorageItem('user_data', JSON.stringify(user));

    return user;
  }

  async logout(): Promise<void> {
    this._currentUser = null;
    this._token = null;
    
    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }

    removeStorageItem('auth_token');
    removeStorageItem('user_data');
  }

  async validateToken(token: string): Promise<User> {
    // Simulate token validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const userData = getStorageItem('user_data');
    if (!userData) {
      throw new Error('Invalid token');
    }

    return JSON.parse(userData);
  }

  async refreshToken(): Promise<string> {
    if (!this._currentUser) {
      throw new Error('No authenticated user');
    }

    const newToken = generateToken();
    this._token = newToken;
    setStorageItem('auth_token', newToken);
    
    return newToken;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    if (!this._currentUser) {
      throw new Error('No authenticated user');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Only allow updating name and email, not role (role should be managed by admin)
    const updatedUser: User = {
      ...this._currentUser,
      name: data.name || this._currentUser.name,
      email: data.email || this._currentUser.email,
      lastActive: new Date().toISOString()
    };

    this._currentUser = updatedUser;
    setStorageItem('user_data', JSON.stringify(updatedUser));

    // Update in mock database
    const userIndex = mockUsers.findIndex(u => u.id === updatedUser.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = updatedUser;
    }

    return updatedUser;
  }

  async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // In real app, would send reset email
    // Password reset email would be sent to ${email}
  }

  getCurrentUser(): User | null {
    return this._currentUser;
  }

  isAuthenticated(): boolean {
    return !!this._currentUser && !!this._token;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance(); 