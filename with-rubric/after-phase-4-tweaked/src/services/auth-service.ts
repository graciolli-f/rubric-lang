import type { User, LoginCredentials, SignupData } from '../types/auth-types';

class AuthService {
  private _currentUser: User | null = null;
  private _authToken: string | null = null;

  constructor() {
    this.loadFromStorage();
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    console.log('Attempting login for:', credentials.email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user database
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@company.com',
        name: 'Admin User',
        role: 'admin',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        email: 'manager@company.com',
        name: 'Manager User',
        role: 'manager',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=manager`,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'user@company.com',
        name: 'Regular User',
        role: 'user',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user`,
        createdAt: new Date().toISOString()
      }
    ];

    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }

    const token = this.generateMockToken(user);
    
    this._currentUser = user;
    this._authToken = token;
    this.saveToStorage();
    
    console.log('Login successful for:', user.name);
    return { user, token };
  }

  async signup(data: SignupData): Promise<{ user: User; token: string }> {
    console.log('Attempting signup for:', data.email);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if email already exists (mock check)
    if (data.email.includes('admin') || data.email.includes('manager')) {
      throw new Error('User with this email already exists');
    }

    const user: User = {
      id: crypto.randomUUID(),
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      createdAt: new Date().toISOString()
    };

    const token = this.generateMockToken(user);
    
    this._currentUser = user;
    this._authToken = token;
    this.saveToStorage();
    
    console.log('Signup successful for:', user.name);
    return { user, token };
  }

  async logout(): Promise<void> {
    console.log('Logging out user:', this._currentUser?.name);
    
    this._currentUser = null;
    this._authToken = null;
    this.clearStorage();
  }

  getCurrentUser(): User | null {
    return this._currentUser;
  }

  isAuthenticated(): boolean {
    return this._currentUser !== null && this._authToken !== null;
  }

  async validateToken(token: string): Promise<User | null> {
    // In a real app, this would validate with the server
    if (!token || !token.startsWith('mock_token_')) {
      return null;
    }

    return this._currentUser;
  }

  private generateMockToken(user: User): string {
    return `mock_token_${user.id}_${Date.now()}`;
  }

  private loadFromStorage(): void {
    try {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('current-user');
      
      if (token && userData) {
        this._authToken = token;
        this._currentUser = JSON.parse(userData);
        console.log('Loaded user from storage:', this._currentUser?.name);
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(): void {
    try {
      if (this._authToken && this._currentUser) {
        localStorage.setItem('auth-token', this._authToken);
        localStorage.setItem('current-user', JSON.stringify(this._currentUser));
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  private clearStorage(): void {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('current-user');
  }
}

export const authService = new AuthService(); 