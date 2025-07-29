import type { User } from '../types';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: 'employee' | 'manager' | 'admin';
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;
  private mockUsers: User[] = [
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'employee',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      role: 'manager',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-3',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
  ];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const userData = localStorage.getItem('currentUser');
    const tokensData = localStorage.getItem('authTokens');
    
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    
    if (tokensData) {
      this.tokens = JSON.parse(tokensData);
    }
  }

  private saveToStorage(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    
    if (this.tokens) {
      localStorage.setItem('authTokens', JSON.stringify(this.tokens));
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTokens');
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock authentication
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          reject(new Error('User not found'));
          return;
        }

        // In a real app, verify password hash
        if (credentials.password !== 'password123') {
          reject(new Error('Invalid password'));
          return;
        }

        const tokens: AuthTokens = {
          accessToken: `mock-access-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
        };

        this.currentUser = user;
        this.tokens = tokens;
        this.saveToStorage();

        resolve({ user, tokens });
      }, 1000); // Simulate API delay
    });
  }

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === data.email);
        if (existingUser) {
          reject(new Error('User already exists'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          role: data.role || 'employee',
          createdAt: new Date().toISOString(),
        };

        this.mockUsers.push(newUser);

        const tokens: AuthTokens = {
          accessToken: `mock-access-token-${newUser.id}`,
          refreshToken: `mock-refresh-token-${newUser.id}`,
        };

        this.currentUser = newUser;
        this.tokens = tokens;
        this.saveToStorage();

        resolve({ user: newUser, tokens });
      }, 1000);
    });
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null;
        this.tokens = null;
        this.clearStorage();
        resolve();
      }, 500);
    });
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.tokens);
  }

  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!this.currentUser) {
          reject(new Error('Not authenticated'));
          return;
        }

        this.currentUser = { ...this.currentUser, ...updates };
        this.saveToStorage();
        
        // Update in mock users array
        const index = this.mockUsers.findIndex(u => u.id === this.currentUser!.id);
        if (index !== -1) {
          this.mockUsers[index] = this.currentUser;
        }

        resolve(this.currentUser);
      }, 500);
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.mockUsers.find(u => u.id === userId);
        resolve(user || null);
      }, 200);
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.mockUsers.filter(user => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }

  // For testing purposes - pre-populate with demo data
  async loginAsDemo(role: 'employee' | 'manager' | 'admin' = 'employee'): Promise<{ user: User; tokens: AuthTokens }> {
    const demoUser = this.mockUsers.find(u => u.role === role) || this.mockUsers[0];
    return this.login({ email: demoUser.email, password: 'password123' });
  }
}

export default AuthService; 