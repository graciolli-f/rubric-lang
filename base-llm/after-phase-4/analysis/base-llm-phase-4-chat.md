# Transform expense tracker for collaboration
_Exported on 7/29/2025 at 19:38:53 EDT from Cursor (1.2.4)_

---

**User**

Transform the expense tracker into a multi-user collaborative application.

Requirements:

1. User authentication:
   - Add login/signup pages
   - Store user profiles (name, email)
   - Each expense should track who created it

2. Expense groups:
   - Users can create shared expense groups (e.g., "Marketing Team", "Seattle Office")
   - Invite other users to groups via email
   - Expenses can be assigned to personal or group categories
   - Show group expenses separately

3. Approval workflow:
   - Expenses over $500 require manager approval
   - Add approve/reject buttons for managers
   - Show pending approval status
   - Email notifications for approval requests

4. Real-time collaboration:
   - When multiple users view the same group, show live updates
   - Display who's currently viewing with presence indicators
   - Show when someone is editing an expense
   - Implement optimistic updates with conflict resolution

5. Activity feed:
   - Show recent activity in the group
   - Track all changes (who added/edited/deleted what)
   - Include approval actions in the feed

Use WebSockets for real-time features. For now, simulate the backend with a simple WebSocket server or use mock data with setTimeout to demonstrate the real-time behavior.

---

**Cursor**

I'll help you transform the expense tracker into a multi-user collaborative application. Let me first explore the current codebase to understand the existing structure and then implement all the required features.

```typescript
export interface UserPreferences {
  preferredCurrency: Currency;
  exchangeRates: ExchangeRates;
  lastRateUpdate: string;
}

->

export interface UserPreferences {
  preferredCurrency: Currency;
  exchangeRates: ExchangeRates;
  lastRateUpdate: string;
}

// Multi-user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'employee' | 'manager' | 'admin';
  createdAt: string;
  avatar?: string;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: GroupMember[];
  createdAt: string;
  settings: GroupSettings;
}

export interface GroupMember {
  userId: string;
  role: 'member' | 'manager' | 'admin';
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface GroupSettings {
  requireApprovalThreshold: number; // Default 500
  allowedCategories?: Category[];
  approvalRequired: boolean;
}

export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  userId: string;
  action: 'expense_created' | 'expense_updated' | 'expense_deleted' | 'expense_approved' | 'expense_rejected' | 'member_added' | 'member_removed';
  target: string; // expense ID or user ID
  details: string;
  timestamp: string;
}

export interface PresenceInfo {
  userId: string;
  userName: string;
  lastSeen: string;
  isOnline: boolean;
  currentView?: string; // 'expenses' | 'analytics' | specific expense ID
}

export interface RealtimeMessage {
  type: 'expense_update' | 'expense_create' | 'expense_delete' | 'presence_update' | 'approval_update' | 'activity_update';
  payload: any;
  groupId?: string;
  userId: string;
  timestamp: string;
}
```

```typescript
export interface Expense {
  id: string;
  amount: number;
  originalAmount: number;
  originalCurrency: Currency;
  category: Category;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string for sorting
  receipt?: string; // base64 encoded image
  tags: string[];
  recurring?: RecurringSettings;
  isRecurringInstance?: boolean;
  parentRecurringId?: string;
}

->

export interface Expense {
  id: string;
  amount: number;
  originalAmount: number;
  originalCurrency: Currency;
  category: Category;
  date: string; // ISO date string
  description: string;
  createdAt: string; // ISO date string for sorting
  receipt?: string; // base64 encoded image
  tags: string[];
  recurring?: RecurringSettings;
  isRecurringInstance?: boolean;
  parentRecurringId?: string;
  // Multi-user fields
  createdBy: string; // User ID
  groupId?: string; // Optional group assignment
  approval?: ApprovalStatus;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}
```

```typescript
import { User } from '../types';

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
```

```typescript
import { User } from '../types';

->

import type { User } from '../types';
```

```typescript
import type { RealtimeMessage, PresenceInfo, Expense, ActivityLog } from '../types';

type WebSocketEventHandler = (message: RealtimeMessage) => void;
type PresenceHandler = (presence: PresenceInfo[]) => void;
type ConnectionStatusHandler = (connected: boolean) => void;

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private presenceHandlers: PresenceHandler[] = [];
  private connectionStatusHandlers: ConnectionStatusHandler[] = [];
  private currentGroupId: string | null = null;
  private currentUserId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(userId: string, groupId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.currentUserId = userId;
      this.currentGroupId = groupId || null;
      this.isConnecting = true;

      try {
        // For demo purposes, we'll simulate a WebSocket connection
        // In production, this would connect to your WebSocket server
        this.simulateWebSocketConnection();
        
        setTimeout(() => {
          this.isConnecting = false;
          this.notifyConnectionStatus(true);
          this.startHeartbeat();
          resolve();
        }, 1000);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private simulateWebSocketConnection(): void {
    // Simulate WebSocket behavior for demo
    this.ws = {
      readyState: WebSocket.OPEN,
      send: (data: string) => {
        console.log('WebSocket send (simulated):', data);
        // In demo mode, echo back some responses
        this.simulateIncomingMessages();
      },
      close: () => {
        this.handleDisconnect();
      }
    } as WebSocket;
  }

  private simulateIncomingMessages(): void {
    // Simulate various real-time messages for demo
    setTimeout(() => {
      this.handleMessage({
        type: 'presence_update',
        payload: this.generateMockPresence(),
        userId: 'system',
        timestamp: new Date().toISOString()
      });
    }, 2000);

    // Simulate activity updates every 10 seconds
    setInterval(() => {
      if (this.currentGroupId) {
        this.handleMessage({
          type: 'activity_update',
          payload: this.generateMockActivity(),
          groupId: this.currentGroupId,
          userId: 'user-2',
          timestamp: new Date().toISOString()
        });
      }
    }, 10000);
  }

  private generateMockPresence(): PresenceInfo[] {
    return [
      {
        userId: 'user-1',
        userName: 'John Doe',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        currentView: 'expenses'
      },
      {
        userId: 'user-2',
        userName: 'Jane Smith',
        lastSeen: new Date().toISOString(),
        isOnline: true,
        currentView: 'analytics'
      }
    ];
  }

  private generateMockActivity(): ActivityLog {
    const actions = ['expense_created', 'expense_updated', 'expense_approved'] as const;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    return {
      id: `activity-${Date.now()}`,
      groupId: this.currentGroupId!,
      userId: 'user-2',
      action: randomAction,
      target: `expense-${Date.now()}`,
      details: `Mock ${randomAction.replace('_', ' ')} activity`,
      timestamp: new Date().toISOString()
    };
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentGroupId = null;
    this.currentUserId = null;
    this.notifyConnectionStatus(false);
  }

  joinGroup(groupId: string): void {
    this.currentGroupId = groupId;
    this.send({
      type: 'presence_update',
      payload: { groupId, action: 'join' },
      userId: this.currentUserId!,
      timestamp: new Date().toISOString()
    });
  }

  leaveGroup(): void {
    if (this.currentGroupId) {
      this.send({
        type: 'presence_update',
        payload: { groupId: this.currentGroupId, action: 'leave' },
        userId: this.currentUserId!,
        timestamp: new Date().toISOString()
      });
    }
    this.currentGroupId = null;
  }

  updatePresence(view: string): void {
    if (!this.currentUserId) return;

    this.send({
      type: 'presence_update',
      payload: { view, action: 'update' },
      userId: this.currentUserId,
      timestamp: new Date().toISOString()
    });
  }

  broadcastExpenseUpdate(expense: Expense, action: 'create' | 'update' | 'delete'): void {
    this.send({
      type: action === 'create' ? 'expense_create' : action === 'update' ? 'expense_update' : 'expense_delete',
      payload: expense,
      groupId: expense.groupId,
      userId: this.currentUserId!,
      timestamp: new Date().toISOString()
    });
  }

  broadcastApprovalUpdate(expenseId: string, approval: any): void {
    this.send({
      type: 'approval_update',
      payload: { expenseId, approval },
      groupId: this.currentGroupId,
      userId: this.currentUserId!,
      timestamp: new Date().toISOString()
    });
  }

  private send(message: RealtimeMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: RealtimeMessage): void {
    // Handle presence updates
    if (message.type === 'presence_update') {
      this.presenceHandlers.forEach(handler => handler(message.payload));
    }

    // Handle other message types
    const handlers = this.eventHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));
  }

  private handleDisconnect(): void {
    this.ws = null;
    this.notifyConnectionStatus(false);

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.currentUserId) {
          this.connect(this.currentUserId, this.currentGroupId || undefined);
        }
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'presence_update',
        payload: { action: 'heartbeat' },
        userId: this.currentUserId!,
        timestamp: new Date().toISOString()
      });
    }, 30000); // Send heartbeat every 30 seconds
  }

  private notifyConnectionStatus(connected: boolean): void {
    this.connectionStatusHandlers.forEach(handler => handler(connected));
  }

  // Event subscription methods
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  onPresenceUpdate(handler: PresenceHandler): void {
    this.presenceHandlers.push(handler);
  }

  offPresenceUpdate(handler: PresenceHandler): void {
    const index = this.presenceHandlers.indexOf(handler);
    if (index > -1) {
      this.presenceHandlers.splice(index, 1);
    }
  }

  onConnectionStatus(handler: ConnectionStatusHandler): void {
    this.connectionStatusHandlers.push(handler);
  }

  offConnectionStatus(handler: ConnectionStatusHandler): void {
    const index = this.connectionStatusHandlers.indexOf(handler);
    if (index > -1) {
      this.connectionStatusHandlers.splice(index, 1);
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export default WebSocketService;
```

```typescript
        if (this.currentUserId) {
          this.connect(this.currentUserId, this.currentGroupId || undefined);
        }

->

        if (this.currentUserId) {
          this.connect(this.currentUserId, this.currentGroupId ?? undefined);
        }
```

```typescript
        if (this.currentUserId) {
          this.connect(this.currentUserId, this.currentGroupId ?? undefined);
        }

->

        if (this.currentUserId) {
          this.connect(this.currentUserId, this.currentGroupId || undefined);
        }
```

```typescript
          this.connect(this.currentUserId, this.currentGroupId || undefined);

->

          this.connect(this.currentUserId, this.currentGroupId ? this.currentGroupId : undefined);
```

Now let me create the authentication components for login and signup.

```typescriptreact
import React, { useState } from 'react';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onSwitchToSignup: () => void;
}

interface LoginState {
  email: string;
  password: string;
  loading: boolean;
  error: string;
}

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }: LoginFormProps) {
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    loading: false,
    error: ''
  });

  const authService = AuthService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.email || !state.password) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.login({
        email: state.email,
        password: state.password
      });
      
      onLoginSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }));
    }
  };

  const handleDemoLogin = async (role: 'employee' | 'manager' | 'admin') => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.loginAsDemo(role);
      onLoginSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Demo login failed' 
      }));
    }
  };

  const updateField = (field: keyof LoginState, value: string) => {
    setState(prev => ({ ...prev, [field]: value, error: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={onSwitchToSignup}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={state.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={state.loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={state.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={state.loading}
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{state.error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or try demo accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('manager')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={state.loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Admin
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Demo Credentials:</strong><br />
            Email: john@example.com, jane@example.com, or admin@example.com<br />
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
```

```typescriptreact
import React, { useState } from 'react';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface SignupFormProps {
  onSignupSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

interface SignupState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'employee' | 'manager' | 'admin';
  loading: boolean;
  error: string;
}

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }: SignupFormProps) {
  const [state, setState] = useState<SignupState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    loading: false,
    error: ''
  });

  const authService = AuthService.getInstance();

  const validateForm = (): string | null => {
    if (!state.name.trim()) return 'Name is required';
    if (!state.email.trim()) return 'Email is required';
    if (!state.password) return 'Password is required';
    if (state.password.length < 6) return 'Password must be at least 6 characters';
    if (state.password !== state.confirmPassword) return 'Passwords do not match';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.email)) return 'Please enter a valid email address';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const { user } = await authService.signup({
        name: state.name.trim(),
        email: state.email.trim().toLowerCase(),
        password: state.password,
        role: state.role
      });
      
      onSignupSuccess(user);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      }));
    }
  };

  const updateField = (field: keyof SignupState, value: string) => {
    setState(prev => ({ ...prev, [field]: value, error: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to existing account
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={state.name}
                onChange={(e) => updateField('name', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={state.email}
                onChange={(e) => updateField('email', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={state.role}
                onChange={(e) => updateField('role', e.target.value)}
                disabled={state.loading}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Managers can approve expenses, Admins can manage all groups
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Create a password (min 6 characters)"
                value={state.password}
                onChange={(e) => updateField('password', e.target.value)}
                disabled={state.loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={state.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                disabled={state.loading}
              />
            </div>
          </div>

          {state.error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{state.error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={state.loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Role Permissions:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li><strong>Employee:</strong> Create and manage personal expenses</li>
            <li><strong>Manager:</strong> Approve team expenses, create groups</li>
            <li><strong>Admin:</strong> Full access to all groups and users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

```typescript
import type { ExpenseGroup, GroupMember, User, ActivityLog } from '../types';

interface CreateGroupData {
  name: string;
  description: string;
  requireApprovalThreshold?: number;
  approvalRequired?: boolean;
}

interface InviteMemberData {
  email: string;
  role: 'member' | 'manager';
}

class GroupService {
  private static instance: GroupService;
  private groups: ExpenseGroup[] = [];
  private activityLogs: ActivityLog[] = [];

  static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeMockData();
  }

  private loadFromStorage(): void {
    const groupsData = localStorage.getItem('expenseGroups');
    const activityData = localStorage.getItem('groupActivity');
    
    if (groupsData) {
      this.groups = JSON.parse(groupsData);
    }
    
    if (activityData) {
      this.activityLogs = JSON.parse(activityData);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('expenseGroups', JSON.stringify(this.groups));
    localStorage.setItem('groupActivity', JSON.stringify(this.activityLogs));
  }

  private initializeMockData(): void {
    if (this.groups.length === 0) {
      // Create some demo groups
      const mockGroups: ExpenseGroup[] = [
        {
          id: 'group-1',
          name: 'Marketing Team',
          description: 'Marketing department expenses and campaigns',
          createdBy: 'user-2',
          createdAt: new Date().toISOString(),
          members: [
            {
              userId: 'user-1',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-2',
              role: 'manager',
              joinedAt: new Date().toISOString(),
              status: 'active'
            }
          ],
          settings: {
            requireApprovalThreshold: 500,
            approvalRequired: true
          }
        },
        {
          id: 'group-2',
          name: 'Seattle Office',
          description: 'Office expenses for Seattle location',
          createdBy: 'user-3',
          createdAt: new Date().toISOString(),
          members: [
            {
              userId: 'user-1',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-2',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-3',
              role: 'admin',
              joinedAt: new Date().toISOString(),
              status: 'active'
            }
          ],
          settings: {
            requireApprovalThreshold: 1000,
            approvalRequired: true
          }
        }
      ];

      this.groups = mockGroups;
      this.saveToStorage();
    }
  }

  async createGroup(data: CreateGroupData, createdBy: string): Promise<ExpenseGroup> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newGroup: ExpenseGroup = {
            id: `group-${Date.now()}`,
            name: data.name,
            description: data.description,
            createdBy,
            createdAt: new Date().toISOString(),
            members: [
              {
                userId: createdBy,
                role: 'admin',
                joinedAt: new Date().toISOString(),
                status: 'active'
              }
            ],
            settings: {
              requireApprovalThreshold: data.requireApprovalThreshold || 500,
              approvalRequired: data.approvalRequired ?? true
            }
          };

          this.groups.push(newGroup);
          this.logActivity({
            groupId: newGroup.id,
            userId: createdBy,
            action: 'member_added',
            target: createdBy,
            details: `Created group "${newGroup.name}"`
          });
          
          this.saveToStorage();
          resolve(newGroup);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  async getGroupsByUser(userId: string): Promise<ExpenseGroup[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userGroups = this.groups.filter(group =>
          group.members.some(member => 
            member.userId === userId && member.status === 'active'
          )
        );
        resolve(userGroups);
      }, 200);
    });
  }

  async getGroupById(groupId: string): Promise<ExpenseGroup | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const group = this.groups.find(g => g.id === groupId);
        resolve(group || null);
      }, 200);
    });
  }

  async updateGroup(groupId: string, updates: Partial<ExpenseGroup>, updatedBy: string): Promise<ExpenseGroup> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check if user has permission to update
        const userMember = group.members.find(m => m.userId === updatedBy);
        if (!userMember || (userMember.role !== 'admin' && userMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        this.groups[groupIndex] = { ...group, ...updates };
        
        this.logActivity({
          groupId,
          userId: updatedBy,
          action: 'expense_updated',
          target: groupId,
          details: `Updated group settings`
        });

        this.saveToStorage();
        resolve(this.groups[groupIndex]);
      }, 500);
    });
  }

  async addMember(groupId: string, userId: string, role: 'member' | 'manager', addedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check if adding user has permission
        const adderMember = group.members.find(m => m.userId === addedBy);
        if (!adderMember || (adderMember.role !== 'admin' && adderMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        // Check if user is already a member
        const existingMember = group.members.find(m => m.userId === userId);
        if (existingMember) {
          if (existingMember.status === 'active') {
            reject(new Error('User is already a member'));
            return;
          } else {
            // Reactivate member
            existingMember.status = 'active';
            existingMember.role = role;
          }
        } else {
          // Add new member
          group.members.push({
            userId,
            role,
            joinedAt: new Date().toISOString(),
            status: 'pending'
          });
        }

        this.logActivity({
          groupId,
          userId: addedBy,
          action: 'member_added',
          target: userId,
          details: `Added member with ${role} role`
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async removeMember(groupId: string, userId: string, removedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check permissions
        const removerMember = group.members.find(m => m.userId === removedBy);
        if (!removerMember || (removerMember.role !== 'admin' && removerMember.role !== 'manager' && removedBy !== userId)) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        const memberIndex = group.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) {
          reject(new Error('Member not found'));
          return;
        }

        // Don't allow removing the last admin
        const admins = group.members.filter(m => m.role === 'admin' && m.status === 'active');
        if (admins.length === 1 && admins[0].userId === userId) {
          reject(new Error('Cannot remove the last administrator'));
          return;
        }

        group.members[memberIndex].status = 'inactive';

        this.logActivity({
          groupId,
          userId: removedBy,
          action: 'member_removed',
          target: userId,
          details: removedBy === userId ? 'Left group' : 'Removed member'
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async updateMemberRole(groupId: string, userId: string, newRole: 'member' | 'manager' | 'admin', updatedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check permissions
        const updaterMember = group.members.find(m => m.userId === updatedBy);
        if (!updaterMember || (updaterMember.role !== 'admin' && updaterMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        const memberIndex = group.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) {
          reject(new Error('Member not found'));
          return;
        }

        const oldRole = group.members[memberIndex].role;
        group.members[memberIndex].role = newRole;

        this.logActivity({
          groupId,
          userId: updatedBy,
          action: 'member_added',
          target: userId,
          details: `Changed role from ${oldRole} to ${newRole}`
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async getGroupActivity(groupId: string, limit: number = 50): Promise<ActivityLog[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const groupActivity = this.activityLogs
          .filter(log => log.groupId === groupId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
        resolve(groupActivity);
      }, 200);
    });
  }

  private logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const log: ActivityLog = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString()
    };
    
    this.activityLogs.push(log);
    
    // Keep only the last 1000 activity logs
    if (this.activityLogs.length > 1000) {
      this.activityLogs = this.activityLogs.slice(-1000);
    }
  }

  async searchGroups(query: string, userId: string): Promise<ExpenseGroup[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.groups.filter(group => {
          const isMember = group.members.some(m => m.userId === userId && m.status === 'active');
          const matchesQuery = group.name.toLowerCase().includes(query.toLowerCase()) ||
                              group.description.toLowerCase().includes(query.toLowerCase());
          return isMember && matchesQuery;
        });
        resolve(results);
      }, 300);
    });
  }

  async deleteGroup(groupId: string, deletedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Only the creator or admin can delete
        if (group.createdBy !== deletedBy) {
          const member = group.members.find(m => m.userId === deletedBy);
          if (!member || member.role !== 'admin') {
            reject(new Error('Insufficient permissions'));
            return;
          }
        }

        this.groups.splice(groupIndex, 1);
        
        // Remove activity logs for this group
        this.activityLogs = this.activityLogs.filter(log => log.groupId !== groupId);
        
        this.saveToStorage();
        resolve();
      }, 500);
    });
  }
}

export default GroupService;
```

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Expense, 
  Budget, 
  Currency, 
  UserPreferences, 
  ExchangeRates, 
  User, 
  ExpenseGroup, 
  ActivityLog, 
  ApprovalStatus,
  PresenceInfo 
} from '../types';
import { ExchangeService } from '../services/exchangeService';
import AuthService from '../services/authService';
import GroupService from '../services/groupService';
import WebSocketService from '../services/websocketService';
import { RecurringUtils } from '../utils/recurringUtils';
import { ExportUtils } from '../utils/exportUtils';

interface CollaborativeExpenseStore {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Expense state
  expenses: Expense[];
  personalExpenses: Expense[];
  groupExpenses: Map<string, Expense[]>;
  
  // Group state
  currentGroup: ExpenseGroup | null;
  userGroups: ExpenseGroup[];
  
  // UI state
  currentView: 'personal' | 'group';
  selectedGroupId: string | null;
  tagFilter: string[];
  
  // Real-time state
  presenceInfo: PresenceInfo[];
  activityFeed: ActivityLog[];
  isConnected: boolean;
  
  // Legacy state (for compatibility)
  budget: Budget;
  userPreferences: UserPreferences;
  
  // Authentication methods
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  
  // Expense methods
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>, groupId?: string) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  approveExpense: (id: string, approval: boolean, reason?: string) => Promise<void>;
  
  // Group methods
  createGroup: (name: string, description: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  selectGroup: (groupId: string | null) => Promise<void>;
  switchToPersonalView: () => void;
  switchToGroupView: (groupId: string) => Promise<void>;
  
  // Data retrieval methods
  getExpenses: () => Expense[];
  getPersonalExpenses: () => Expense[];
  getGroupExpenses: (groupId?: string) => Expense[];
  getPendingApprovals: () => Expense[];
  getTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  getCurrentMonthTotal: () => number;
  getRemainingBudget: () => number;
  getDailySpendingData: () => { date: string; amount: number }[];
  getCategoryBreakdown: () => { category: string; amount: number; count: number }[];
  getAverageDailySpending: () => number;
  
  // Currency and preferences
  setPreferredCurrency: (currency: Currency) => void;
  updateExchangeRates: () => Promise<void>;
  getConvertedAmount: (originalAmount: number, originalCurrency: Currency) => number;
  formatAmount: (amount: number, currency?: Currency) => string;
  setBudget: (amount: number) => void;
  
  // Filtering and tags
  setTagFilter: (tags: string[]) => void;
  getFilteredExpenses: () => Expense[];
  getAllTags: () => string[];
  
  // Recurring expenses
  generateOverdueRecurringExpenses: () => void;
  toggleRecurringExpense: (id: string, isActive: boolean) => void;
  
  // Export functionality
  exportToCSV: (startDate?: string, endDate?: string) => Promise<void>;
  
  // Real-time methods
  broadcastExpenseUpdate: (expense: Expense, action: 'create' | 'update' | 'delete') => void;
  handleRealtimeUpdate: (expense: Expense, action: 'create' | 'update' | 'delete') => void;
  updatePresence: (view: string) => void;
  
  // Activity methods
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  getActivityFeed: (groupId?: string) => ActivityLog[];
}

const authService = AuthService.getInstance();
const groupService = GroupService.getInstance();
const wsService = WebSocketService.getInstance();
const exchangeService = ExchangeService.getInstance();

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useCollaborativeExpenseStore = create<CollaborativeExpenseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      expenses: [],
      personalExpenses: [],
      groupExpenses: new Map(),
      currentGroup: null,
      userGroups: [],
      currentView: 'personal',
      selectedGroupId: null,
      tagFilter: [],
      presenceInfo: [],
      activityFeed: [],
      isConnected: false,
      budget: {
        monthlyLimit: 2000,
        month: getCurrentMonth(),
      },
      userPreferences: {
        preferredCurrency: 'USD' as Currency,
        exchangeRates: { USD: 1, EUR: 0.85, GBP: 0.73 },
        lastRateUpdate: new Date().toISOString()
      },

      // Authentication methods
      login: async (user: User) => {
        set({ currentUser: user, isAuthenticated: true });
        
        // Load user's groups
        const groups = await groupService.getGroupsByUser(user.id);
        set({ userGroups: groups });
        
        // Connect to WebSocket
        try {
          await wsService.connect(user.id);
          set({ isConnected: true });
          
          // Set up real-time event handlers
          wsService.on('expense_update', (message) => {
            get().handleRealtimeUpdate(message.payload, 'update');
          });
          
          wsService.on('expense_create', (message) => {
            get().handleRealtimeUpdate(message.payload, 'create');
          });
          
          wsService.on('expense_delete', (message) => {
            get().handleRealtimeUpdate(message.payload, 'delete');
          });
          
          wsService.onPresenceUpdate((presence) => {
            set({ presenceInfo: presence });
          });
          
          wsService.on('activity_update', (message) => {
            const { activityFeed } = get();
            set({ activityFeed: [message.payload, ...activityFeed].slice(0, 100) });
          });
          
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
        }
      },

      logout: async () => {
        wsService.disconnect();
        await authService.logout();
        set({
          currentUser: null,
          isAuthenticated: false,
          expenses: [],
          personalExpenses: [],
          groupExpenses: new Map(),
          currentGroup: null,
          userGroups: [],
          selectedGroupId: null,
          presenceInfo: [],
          activityFeed: [],
          isConnected: false
        });
      },

      // Expense methods
      addExpense: async (expenseData, groupId) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const newExpense: Expense = {
          ...expenseData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          createdBy: currentUser.id,
          groupId,
          amount: get().getConvertedAmount(expenseData.originalAmount, expenseData.originalCurrency),
          tags: expenseData.tags || [],
        };

        // Check if approval is required
        const approvalThreshold = groupId ? 
          (await groupService.getGroupById(groupId))?.settings.requireApprovalThreshold || 500 : 
          500;
          
        if (newExpense.amount >= approvalThreshold) {
          newExpense.approval = { status: 'pending' };
        }

        // Add to appropriate expense list
        if (groupId) {
          const groupExpenses = get().groupExpenses.get(groupId) || [];
          get().groupExpenses.set(groupId, [...groupExpenses, newExpense]);
        } else {
          set(state => ({ personalExpenses: [...state.personalExpenses, newExpense] }));
        }

        // Update main expenses array
        set(state => ({ expenses: [...state.expenses, newExpense] }));

        // Broadcast update
        get().broadcastExpenseUpdate(newExpense, 'create');

        // Log activity
        get().addActivity({
          groupId: groupId || '',
          userId: currentUser.id,
          action: 'expense_created',
          target: newExpense.id,
          details: `Created expense: ${newExpense.description} (${get().formatAmount(newExpense.amount)})`
        });

        // Auto-generate recurring instances if needed
        if (expenseData.recurring && expenseData.recurring.isActive) {
          get().generateOverdueRecurringExpenses();
        }
      },

      updateExpense: async (id, updates) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        set(state => ({
          expenses: state.expenses.map(expense => {
            if (expense.id === id) {
              const updatedExpense = { 
                ...expense, 
                ...updates,
                lastModifiedBy: currentUser.id,
                lastModifiedAt: new Date().toISOString()
              };
              
              // Recalculate converted amount if currency changed
              if (updates.originalAmount !== undefined || updates.originalCurrency !== undefined) {
                updatedExpense.amount = get().getConvertedAmount(
                  updatedExpense.originalAmount,
                  updatedExpense.originalCurrency
                );
              }
              
              // Update group expenses map
              if (expense.groupId) {
                const groupExpenses = get().groupExpenses.get(expense.groupId) || [];
                const groupIndex = groupExpenses.findIndex(e => e.id === id);
                if (groupIndex !== -1) {
                  groupExpenses[groupIndex] = updatedExpense;
                  get().groupExpenses.set(expense.groupId, groupExpenses);
                }
              } else {
                // Update personal expenses
                set(state => ({
                  personalExpenses: state.personalExpenses.map(e => 
                    e.id === id ? updatedExpense : e
                  )
                }));
              }

              // Broadcast update
              get().broadcastExpenseUpdate(updatedExpense, 'update');

              // Log activity
              get().addActivity({
                groupId: expense.groupId || '',
                userId: currentUser.id,
                action: 'expense_updated',
                target: id,
                details: `Updated expense: ${updatedExpense.description}`
              });

              return updatedExpense;
            }
            return expense;
          })
        }));
      },

      deleteExpense: async (id) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const expense = get().expenses.find(e => e.id === id);
        if (!expense) return;

        // Remove from main expenses
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id)
        }));

        // Remove from appropriate list
        if (expense.groupId) {
          const groupExpenses = get().groupExpenses.get(expense.groupId) || [];
          get().groupExpenses.set(
            expense.groupId, 
            groupExpenses.filter(e => e.id !== id)
          );
        } else {
          set(state => ({
            personalExpenses: state.personalExpenses.filter(e => e.id !== id)
          }));
        }

        // Broadcast update
        get().broadcastExpenseUpdate(expense, 'delete');

        // Log activity
        get().addActivity({
          groupId: expense.groupId || '',
          userId: currentUser.id,
          action: 'expense_deleted',
          target: id,
          details: `Deleted expense: ${expense.description}`
        });
      },

      approveExpense: async (id, approved, reason) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const expense = get().expenses.find(e => e.id === id);
        if (!expense || !expense.approval) return;

        const approval: ApprovalStatus = {
          status: approved ? 'approved' : 'rejected',
          approvedBy: currentUser.id,
          approvedAt: new Date().toISOString(),
          rejectionReason: reason
        };

        await get().updateExpense(id, { approval });

        // Log activity
        get().addActivity({
          groupId: expense.groupId || '',
          userId: currentUser.id,
          action: approved ? 'expense_approved' : 'expense_rejected',
          target: id,
          details: `${approved ? 'Approved' : 'Rejected'} expense: ${expense.description}${reason ? ` (${reason})` : ''}`
        });
      },

      // Group methods
      createGroup: async (name, description) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        const newGroup = await groupService.createGroup({ name, description }, currentUser.id);
        set(state => ({ userGroups: [...state.userGroups, newGroup] }));
      },

      joinGroup: async (groupId) => {
        const { currentUser } = get();
        if (!currentUser) throw new Error('Not authenticated');

        await wsService.joinGroup(groupId);
        const group = await groupService.getGroupById(groupId);
        if (group) {
          set({ currentGroup: group, selectedGroupId: groupId, currentView: 'group' });
          
          // Load group expenses (mock implementation)
          const groupExpenses = get().expenses.filter(e => e.groupId === groupId);
          get().groupExpenses.set(groupId, groupExpenses);
        }
      },

      leaveGroup: async (groupId) => {
        await wsService.leaveGroup();
        if (get().selectedGroupId === groupId) {
          set({ currentGroup: null, selectedGroupId: null, currentView: 'personal' });
        }
      },

      selectGroup: async (groupId) => {
        if (groupId) {
          await get().joinGroup(groupId);
        } else {
          get().switchToPersonalView();
        }
      },

      switchToPersonalView: () => {
        wsService.leaveGroup();
        set({ 
          currentView: 'personal', 
          selectedGroupId: null, 
          currentGroup: null 
        });
        wsService.updatePresence('personal');
      },

      switchToGroupView: async (groupId) => {
        await get().joinGroup(groupId);
        wsService.updatePresence(`group-${groupId}`);
      },

      // Data retrieval methods
      getExpenses: () => {
        const { currentView, selectedGroupId } = get();
        if (currentView === 'personal') {
          return get().getPersonalExpenses();
        } else if (selectedGroupId) {
          return get().getGroupExpenses(selectedGroupId);
        }
        return get().expenses;
      },

      getPersonalExpenses: () => {
        return get().personalExpenses;
      },

      getGroupExpenses: (groupId) => {
        if (!groupId) return [];
        return get().groupExpenses.get(groupId) || [];
      },

      getPendingApprovals: () => {
        return get().getExpenses().filter(expense => 
          expense.approval?.status === 'pending'
        );
      },

      getTotal: () => {
        return get().getExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getCurrentMonthExpenses: () => {
        const currentMonth = getCurrentMonth();
        return get().getFilteredExpenses().filter(expense => 
          expense.date.startsWith(currentMonth)
        );
      },

      getCurrentMonthTotal: () => {
        return get().getCurrentMonthExpenses().reduce((total, expense) => total + expense.amount, 0);
      },

      getRemainingBudget: () => {
        const { budget } = get();
        const spent = get().getCurrentMonthTotal();
        return budget.monthlyLimit - spent;
      },

      getDailySpendingData: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const expenses = get().getFilteredExpenses().filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        );

        const dailyData = new Map<string, number>();
        
        for (let i = 0; i < 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyData.set(dateStr, 0);
        }

        expenses.forEach(expense => {
          const dateStr = expense.date.split('T')[0];
          dailyData.set(dateStr, (dailyData.get(dateStr) || 0) + expense.amount);
        });

        return Array.from(dailyData.entries())
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));
      },

      getCategoryBreakdown: () => {
        const expenses = get().getFilteredExpenses();
        const breakdown = new Map<string, { amount: number; count: number }>();

        expenses.forEach(expense => {
          const existing = breakdown.get(expense.category) || { amount: 0, count: 0 };
          breakdown.set(expense.category, {
            amount: existing.amount + expense.amount,
            count: existing.count + 1
          });
        });

        return Array.from(breakdown.entries()).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count
        }));
      },

      getAverageDailySpending: () => {
        const dailyData = get().getDailySpendingData();
        const totalSpending = dailyData.reduce((sum, day) => sum + day.amount, 0);
        return totalSpending / dailyData.length;
      },

      // Currency and preferences methods
      setPreferredCurrency: (currency) => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            preferredCurrency: currency
          }
        }));
      },

      updateExchangeRates: async () => {
        try {
          const rates = await exchangeService.getLatestRates();
          set(state => ({
            userPreferences: {
              ...state.userPreferences,
              exchangeRates: rates,
              lastRateUpdate: new Date().toISOString()
            }
          }));
        } catch (error) {
          console.error('Failed to update exchange rates:', error);
        }
      },

      getConvertedAmount: (originalAmount, originalCurrency) => {
        const { userPreferences } = get();
        const rates = userPreferences.exchangeRates;
        const preferredCurrency = userPreferences.preferredCurrency;
        
        if (originalCurrency === preferredCurrency) {
          return originalAmount;
        }
        
        const usdAmount = originalAmount / (rates[originalCurrency] || 1);
        return usdAmount * (rates[preferredCurrency] || 1);
      },

      formatAmount: (amount, currency) => {
        const { userPreferences } = get();
        const targetCurrency = currency || userPreferences.preferredCurrency;
        return exchangeService.formatCurrency(amount, targetCurrency);
      },

      setBudget: (amount) => {
        set(state => ({
          budget: {
            ...state.budget,
            monthlyLimit: amount,
            month: getCurrentMonth(),
          }
        }));
      },

      // Filtering and tags
      setTagFilter: (tags) => {
        set({ tagFilter: tags });
      },

      getFilteredExpenses: () => {
        const expenses = get().getExpenses();
        const { tagFilter } = get();
        
        if (tagFilter.length === 0) {
          return expenses;
        }
        
        return expenses.filter(expense =>
          tagFilter.some(tag => expense.tags.includes(tag))
        );
      },

      getAllTags: () => {
        const expenses = get().getExpenses();
        const tags = new Set<string>();
        expenses.forEach(expense => {
          expense.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
      },

      // Recurring expenses
      generateOverdueRecurringExpenses: () => {
        RecurringUtils.generateOverdueExpenses(get().expenses, get().addExpense);
      },

      toggleRecurringExpense: (id, isActive) => {
        get().updateExpense(id, {
          recurring: {
            ...get().expenses.find(e => e.id === id)?.recurring,
            isActive
          }
        });
      },

      // Export functionality
      exportToCSV: async (startDate, endDate) => {
        const expenses = get().getFilteredExpenses();
        await ExportUtils.exportToCSV(expenses, startDate, endDate);
      },

      // Real-time methods
      broadcastExpenseUpdate: (expense, action) => {
        if (wsService.isConnected()) {
          wsService.broadcastExpenseUpdate(expense, action);
        }
      },

      handleRealtimeUpdate: (expense, action) => {
        const { currentUser } = get();
        if (!currentUser || expense.createdBy === currentUser.id) {
          // Don't process our own updates
          return;
        }

        switch (action) {
          case 'create':
            set(state => ({ expenses: [...state.expenses, expense] }));
            break;
          case 'update':
            set(state => ({
              expenses: state.expenses.map(e => e.id === expense.id ? expense : e)
            }));
            break;
          case 'delete':
            set(state => ({
              expenses: state.expenses.filter(e => e.id !== expense.id)
            }));
            break;
        }
      },

      updatePresence: (view) => {
        wsService.updatePresence(view);
      },

      // Activity methods
      addActivity: (activity) => {
        const newActivity: ActivityLog = {
          ...activity,
          id: `activity-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString()
        };

        set(state => ({
          activityFeed: [newActivity, ...state.activityFeed].slice(0, 100)
        }));
      },

      getActivityFeed: (groupId) => {
        const { activityFeed } = get();
        if (!groupId) return activityFeed;
        return activityFeed.filter(activity => activity.groupId === groupId);
      }
    }),
    {
      name: 'collaborative-expense-store',
      partialize: (state) => ({
        expenses: state.expenses,
        personalExpenses: state.personalExpenses,
        budget: state.budget,
        userPreferences: state.userPreferences,
        tagFilter: state.tagFilter
      })
    }
  )
);
```

```typescriptreact
import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import GroupService from '../../services/groupService';
import type { ExpenseGroup } from '../../types';

interface GroupSelectorProps {
  onGroupChange?: (groupId: string | null) => void;
}

export default function GroupSelector({ onGroupChange }: GroupSelectorProps) {
  const {
    currentUser,
    userGroups,
    selectedGroupId,
    currentView,
    selectGroup,
    switchToPersonalView,
    switchToGroupView,
    createGroup
  } = useCollaborativeExpenseStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGroupSelect = async (groupId: string | null) => {
    try {
      if (groupId) {
        await switchToGroupView(groupId);
      } else {
        switchToPersonalView();
      }
      onGroupChange?.(groupId);
    } catch (error) {
      console.error('Failed to switch group:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createGroup(newGroupName.trim(), newGroupDescription.trim());
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Expense Groups</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="mr-1">+</span>
          New Group
        </button>
      </div>

      {/* Personal View Option */}
      <div className="space-y-2">
        <button
          onClick={() => handleGroupSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            currentView === 'personal'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Personal Expenses</div>
              <div className="text-xs text-gray-500">Your individual expenses</div>
            </div>
          </div>
        </button>

        {/* Group Options */}
        {userGroups.map(group => (
          <button
            key={group.id}
            onClick={() => handleGroupSelect(group.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedGroupId === group.id
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-gray-500">{group.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {group.members.filter(m => m.status === 'active').length} members
                </div>
              </div>
              {group.createdBy === currentUser.id && (
                <div className="ml-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Owner
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Marketing Team"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Marketing department expenses"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setError('');
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
```

```typescriptreact
import React, { useState } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import AuthService from '../../services/authService';
import type { Expense, User } from '../../types';

interface ApprovalQueueProps {
  className?: string;
}

export default function ApprovalQueue({ className = '' }: ApprovalQueueProps) {
  const {
    currentUser,
    getPendingApprovals,
    approveExpense,
    formatAmount
  } = useCollaborativeExpenseStore();

  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null);

  const pendingApprovals = getPendingApprovals();
  const authService = AuthService.getInstance();

  // Check if current user can approve expenses
  const canApprove = currentUser?.role === 'manager' || currentUser?.role === 'admin';

  const handleApprove = async (expenseId: string) => {
    if (!canApprove) return;

    setLoading(expenseId);
    try {
      await approveExpense(expenseId, true);
    } catch (error) {
      console.error('Failed to approve expense:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (expenseId: string) => {
    if (!canApprove || !rejectionReason.trim()) return;

    setLoading(expenseId);
    try {
      await approveExpense(expenseId, false, rejectionReason.trim());
      setRejectionReason('');
      setSelectedExpense(null);
    } catch (error) {
      console.error('Failed to reject expense:', error);
    } finally {
      setLoading(null);
    }
  };

  const getCreatorName = async (userId: string): Promise<string> => {
    try {
      const user = await authService.getUserById(userId);
      return user?.name || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  };

  const ExpenseCard = ({ expense }: { expense: Expense }) => {
    const [creatorName, setCreatorName] = useState<string>('Loading...');
    const isExpanded = expandedExpense === expense.id;
    const isLoading = loading === expense.id;

    React.useEffect(() => {
      getCreatorName(expense.createdBy).then(setCreatorName);
    }, [expense.createdBy]);

    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {expense.description}
                </h4>
                <p className="text-sm text-gray-500">
                  by {creatorName} • {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </div>
                <div className="text-sm text-gray-500">
                  {expense.originalCurrency !== 'USD' && 
                    `${formatAmount(expense.originalAmount, expense.originalCurrency)} original`
                  }
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Approval
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {expense.category}
              </span>
              {expense.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Expandable Details */}
            <button
              onClick={() => setExpandedExpense(isExpanded ? null : expense.id)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
            </button>

            {isExpanded && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <div className="text-gray-600">
                      {new Date(expense.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <div className="text-gray-600">
                      {formatAmount(expense.originalAmount, expense.originalCurrency)}
                      {expense.originalCurrency !== 'USD' && 
                        ` (${formatAmount(expense.amount)} USD)`
                      }
                    </div>
                  </div>
                  {expense.groupId && (
                    <div>
                      <span className="font-medium text-gray-700">Group:</span>
                      <div className="text-gray-600">Group Expense</div>
                    </div>
                  )}
                  {expense.receipt && (
                    <div>
                      <span className="font-medium text-gray-700">Receipt:</span>
                      <div className="text-gray-600">Attached</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approval Actions */}
        {canApprove && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {selectedExpense === expense.id ? (
              // Rejection form
              <div className="space-y-3">
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                    Reason for rejection
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please provide a reason for rejecting this expense..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleReject(expense.id)}
                    disabled={!rejectionReason.trim() || isLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedExpense(null);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Approval buttons
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApprove(expense.id)}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => setSelectedExpense(expense.id)}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Please log in to view approval queue.</p>
      </div>
    );
  }

  if (!canApprove) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Restricted
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Only managers and administrators can approve expenses.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Approval Queue</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve expenses over the approval threshold
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">
            All expenses have been reviewed and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  {pendingApprovals.length} expense{pendingApprovals.length !== 1 ? 's' : ''} pending approval
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Review each expense carefully before approving or rejecting.</p>
                </div>
              </div>
            </div>
          </div>

          {pendingApprovals.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
```

```typescriptreact
import React from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import type { PresenceInfo } from '../../types';

interface PresenceIndicatorProps {
  className?: string;
  maxVisible?: number;
}

export default function PresenceIndicator({ className = '', maxVisible = 5 }: PresenceIndicatorProps) {
  const { currentUser, presenceInfo, selectedGroupId, currentView } = useCollaborativeExpenseStore();

  if (!currentUser) {
    return null;
  }

  // Filter presence to only show users in the same context
  const relevantPresence = presenceInfo.filter(presence => {
    // Don't show yourself
    if (presence.userId === currentUser.id) return false;
    
    // Only show users who are online
    if (!presence.isOnline) return false;
    
    // If we're in a group, show users in the same group
    if (currentView === 'group' && selectedGroupId) {
      return presence.currentView === `group-${selectedGroupId}`;
    }
    
    // If we're in personal view, show users also in personal view
    if (currentView === 'personal') {
      return presence.currentView === 'personal';
    }
    
    return false;
  });

  const visiblePresence = relevantPresence.slice(0, maxVisible);
  const overflowCount = Math.max(0, relevantPresence.length - maxVisible);

  if (relevantPresence.length === 0) {
    return null;
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    
    // Generate consistent color based on user ID
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getActivityStatus = (presence: PresenceInfo): string => {
    if (!presence.currentView) return 'online';
    
    if (presence.currentView === 'personal') {
      return 'viewing personal expenses';
    }
    
    if (presence.currentView === 'analytics') {
      return 'viewing analytics';
    }
    
    if (presence.currentView.startsWith('group-')) {
      return 'viewing group expenses';
    }
    
    if (presence.currentView.startsWith('expense-')) {
      return 'editing an expense';
    }
    
    return 'online';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="3" />
        </svg>
        <span className="text-sm text-gray-600 mr-3">
          {relevantPresence.length === 1 ? '1 person' : `${relevantPresence.length} people`} online
        </span>
      </div>

      <div className="flex -space-x-2">
        {visiblePresence.map((presence, index) => (
          <div
            key={presence.userId}
            className="relative group"
            style={{ zIndex: maxVisible - index }}
          >
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white
              ${getAvatarColor(presence.userId)}
            `}>
              {getUserInitials(presence.userName)}
            </div>

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-medium">{presence.userName}</div>
              <div className="text-gray-300 text-xs">{getActivityStatus(presence)}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500">Live</span>
      </div>
    </div>
  );
}

// Enhanced version with detailed activity
export function DetailedPresenceList({ className = '' }: { className?: string }) {
  const { currentUser, presenceInfo, selectedGroupId, currentView } = useCollaborativeExpenseStore();

  if (!currentUser) {
    return null;
  }

  const relevantPresence = presenceInfo.filter(presence => {
    if (presence.userId === currentUser.id) return false;
    if (!presence.isOnline) return false;
    
    if (currentView === 'group' && selectedGroupId) {
      return presence.currentView === `group-${selectedGroupId}`;
    }
    
    if (currentView === 'personal') {
      return presence.currentView === 'personal';
    }
    
    return false;
  });

  if (relevantPresence.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-500">You're the only one here</p>
      </div>
    );
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getActivityStatus = (presence: PresenceInfo): string => {
    if (!presence.currentView) return 'Online';
    
    if (presence.currentView === 'personal') {
      return 'Viewing personal expenses';
    }
    
    if (presence.currentView === 'analytics') {
      return 'Viewing analytics';
    }
    
    if (presence.currentView.startsWith('group-')) {
      return 'Viewing group expenses';
    }
    
    if (presence.currentView.startsWith('expense-')) {
      return 'Editing an expense';
    }
    
    return 'Online';
  };

  const getLastSeenText = (lastSeen: string): string => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Active Users ({relevantPresence.length})
        </h3>
      </div>
      
      <div className="p-4 space-y-3">
        {relevantPresence.map(presence => (
          <div key={presence.userId} className="flex items-center space-x-3">
            <div className="relative">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white
                ${getAvatarColor(presence.userId)}
              `}>
                {getUserInitials(presence.userName)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {presence.userName}
              </div>
              <div className="text-xs text-gray-500">
                {getActivityStatus(presence)}
              </div>
              <div className="text-xs text-gray-400">
                Active {getLastSeenText(presence.lastSeen)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

```typescriptreact
import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import AuthService from '../../services/authService';
import type { ActivityLog } from '../../types';

interface ActivityFeedProps {
  className?: string;
  groupId?: string;
  limit?: number;
  showHeader?: boolean;
}

export default function ActivityFeed({ 
  className = '', 
  groupId, 
  limit = 50, 
  showHeader = true 
}: ActivityFeedProps) {
  const { 
    currentUser, 
    getActivityFeed,
    selectedGroupId,
    currentView
  } = useCollaborativeExpenseStore();

  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const authService = AuthService.getInstance();

  // Determine which activities to show
  const targetGroupId = groupId || selectedGroupId;
  const activities = getActivityFeed(targetGroupId || undefined).slice(0, limit);

  // Load user names for activities
  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(activities.map(activity => activity.userId))];
      const nameMap = new Map<string, string>();
      
      for (const userId of uniqueUserIds) {
        if (!userNames.has(userId)) {
          try {
            const user = await authService.getUserById(userId);
            nameMap.set(userId, user?.name || 'Unknown User');
          } catch {
            nameMap.set(userId, 'Unknown User');
          }
        }
      }
      
      setUserNames(prev => new Map([...prev, ...nameMap]));
    };

    if (activities.length > 0) {
      loadUserNames();
    }
  }, [activities, userNames, authService]);

  const getActivityIcon = (action: string): React.ReactNode => {
    switch (action) {
      case 'expense_created':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'expense_updated':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'expense_deleted':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'expense_approved':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'expense_rejected':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'member_added':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'member_removed':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'expense_created':
      case 'expense_approved':
      case 'member_added':
        return 'text-green-600';
      case 'expense_updated':
        return 'text-blue-600';
      case 'expense_deleted':
      case 'expense_rejected':
        return 'text-red-600';
      case 'member_removed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const ActivityItem = ({ activity }: { activity: ActivityLog }) => {
    const userName = userNames.get(activity.userId) || 'Loading...';
    const isCurrentUser = currentUser?.id === activity.userId;

    return (
      <div className="flex space-x-3 py-3">
        {getActivityIcon(activity.action)}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className={`font-medium ${isCurrentUser ? 'text-indigo-600' : 'text-gray-900'}`}>
              {isCurrentUser ? 'You' : userName}
            </span>
            <span className={`ml-1 ${getActionColor(activity.action)}`}>
              {activity.details}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {getRelativeTime(activity.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Recent Activity
            </h3>
            {activities.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            )}
          </div>
          {targetGroupId && (
            <p className="text-xs text-gray-500 mt-1">
              {currentView === 'group' ? 'Group activity' : 'All activity'}
            </p>
          )}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as team members interact with expenses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map(activity => (
              <div key={activity.id} className="px-4">
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length >= limit && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing latest {limit} activities
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function CompactActivityFeed({ className = '', maxItems = 5 }: { className?: string; maxItems?: number }) {
  const { getActivityFeed, selectedGroupId } = useCollaborativeExpenseStore();
  const activities = getActivityFeed(selectedGroupId || undefined).slice(0, maxItems);

  if (activities.length === 0) {
    return null;
  }

  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
          <span className="text-gray-600 truncate">{activity.details}</span>
          <span className="text-gray-400 flex-shrink-0">{getRelativeTime(activity.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
```

```typescriptreact
import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AuthService from '../../services/authService';
import type { User } from '../../types';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { currentUser, isAuthenticated, login } = useCollaborativeExpenseStore();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);

  const authService = AuthService.getInstance();

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const existingUser = authService.getCurrentUser();
        if (existingUser && authService.isAuthenticated()) {
          await login(existingUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [login, authService]);

  const handleLoginSuccess = async (user: User) => {
    try {
      await login(user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSignupSuccess = async (user: User) => {
    try {
      await login(user);
    } catch (error) {
      console.error('Signup login failed:', error);
    }
  };

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <>
        {authView === 'login' ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setAuthView('signup')}
          />
        ) : (
          <SignupForm
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </>
    );
  }

  // Render main application if authenticated
  return <>{children}</>;
}
```

```typescriptreact
import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Navigation from './components/Navigation';
import Analytics from './components/Analytics';
import { useExpenseStore } from './store/expenseStore';


function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics'>('expenses');
  const { expenses, updateExchangeRates } = useExpenseStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Update exchange rates on app start and then every hour
      try {
        await updateExchangeRates();
      } catch (error) {
        console.warn('Failed to update exchange rates:', error);
      }
    };

    initializeApp();
  }, [expenses, updateExchangeRates]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Track expenses with receipts, multiple currencies, tags, and recurring payments
          </p>
          
          <Navigation activeView={activeView} onViewChange={setActiveView} />
        </div>
        
        {activeView === 'expenses' ? (
          <>
            <ExpenseForm />
            <ExpenseList />
          </>
        ) : (
          <Analytics />
        )}
      </div>
    </div>
  );
}

export default App;

->

import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from './store/collaborativeExpenseStore';
import AuthWrapper from './components/Auth/AuthWrapper';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Analytics from './components/Analytics';
import GroupSelector from './components/Groups/GroupSelector';
import ApprovalQueue from './components/Approvals/ApprovalQueue';
import PresenceIndicator from './components/Realtime/PresenceIndicator';
import ActivityFeed, { CompactActivityFeed } from './components/Realtime/ActivityFeed';
import AuthService from './services/authService';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics' | 'approvals'>('expenses');
  const { 
    currentUser, 
    currentView, 
    selectedGroupId, 
    isConnected,
    updateExchangeRates,
    logout,
    updatePresence
  } = useCollaborativeExpenseStore();

  const authService = AuthService.getInstance();

  useEffect(() => {
    const initializeApp = async () => {
      // Update exchange rates on app start and then every hour
      try {
        await updateExchangeRates();
      } catch (error) {
        console.warn('Failed to update exchange rates:', error);
      }
    };

    if (currentUser) {
      initializeApp();
    }
  }, [currentUser, updateExchangeRates]);

  // Update presence when view changes
  useEffect(() => {
    if (currentUser) {
      updatePresence(activeView);
    }
  }, [activeView, currentUser, updatePresence]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const AppHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Collaborative Expense Tracker
              </h1>
              <p className="text-sm text-gray-600">
                {currentView === 'personal' 
                  ? 'Personal expenses' 
                  : selectedGroupId 
                    ? 'Group expenses'
                    : 'Multi-user expense management'
                }
              </p>
            </div>
            {isConnected && <PresenceIndicator />}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* User Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-8 -mb-px">
          <button
            onClick={() => setActiveView('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'expenses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveView('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'approvals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approvals
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    switch (activeView) {
      case 'expenses':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={10} />
            </div>
            <div className="lg:col-span-3">
              <ExpenseForm />
              <ExpenseList />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Analytics />
            </div>
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <CompactActivityFeed className="mb-6" />
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ApprovalQueue />
            </div>
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={15} />
            </div>
          </div>
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <MainContent />
        </main>
      </div>
    </AuthWrapper>
  );
}

export default App;
```

```typescriptreact
import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import { Navigation } from './components/Navigation';
import { useExpenseStore } from './store/expenseStore';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics'>('expenses');
  const { expenses, updateExchangeRates } = useExpenseStore();

  // Initialize data migration and exchange rates on app load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Migrate existing expenses to new format if needed
        const needsMigration = expenses.some(expense => 
          expense.originalAmount === undefined || 
          expense.originalCurrency === undefined ||
          expense.tags === undefined
        );

        if (needsMigration) {
          console.log('Migrating existing expenses to new format...');
          expenses.forEach(expense => {
            if (expense.originalAmount === undefined) {
              expense.originalAmount = expense.amount;
            }
            if (expense.originalCurrency === undefined) {
              expense.originalCurrency = 'USD';
            }
            if (expense.tags === undefined) {
              expense.tags = [];
            }
          });
        }

        // Update exchange rates on app initialization
        await updateExchangeRates();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [expenses, updateExchangeRates]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Track expenses with receipts, multiple currencies, tags, and recurring payments
          </p>
          
          <Navigation activeView={activeView} onViewChange={setActiveView} />
        </div>
        
        {activeView === 'expenses' ? (
          <>
            <ExpenseForm />
            <ExpenseList />
          </>
        ) : (
          <Analytics />
        )}
      </div>
    </div>
  );
}

export default App;

->

import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from './store/collaborativeExpenseStore';
import AuthWrapper from './components/Auth/AuthWrapper';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import GroupSelector from './components/Groups/GroupSelector';
import ApprovalQueue from './components/Approvals/ApprovalQueue';
import PresenceIndicator from './components/Realtime/PresenceIndicator';
import ActivityFeed, { CompactActivityFeed } from './components/Realtime/ActivityFeed';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics' | 'approvals'>('expenses');
  const { 
    currentUser, 
    currentView, 
    selectedGroupId, 
    isConnected,
    updateExchangeRates,
    logout,
    updatePresence
  } = useCollaborativeExpenseStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Update exchange rates on app start and then every hour
      try {
        await updateExchangeRates();
      } catch (error) {
        console.warn('Failed to update exchange rates:', error);
      }
    };

    if (currentUser) {
      initializeApp();
    }
  }, [currentUser, updateExchangeRates]);

  // Update presence when view changes
  useEffect(() => {
    if (currentUser) {
      updatePresence(activeView);
    }
  }, [activeView, currentUser, updatePresence]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const AppHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Collaborative Expense Tracker
              </h1>
              <p className="text-sm text-gray-600">
                {currentView === 'personal' 
                  ? 'Personal expenses' 
                  : selectedGroupId 
                    ? 'Group expenses'
                    : 'Multi-user expense management'
                }
              </p>
            </div>
            {isConnected && <PresenceIndicator />}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* User Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-8 -mb-px">
          <button
            onClick={() => setActiveView('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'expenses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveView('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'approvals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approvals
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    switch (activeView) {
      case 'expenses':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={10} />
            </div>
            <div className="lg:col-span-3">
              <ExpenseForm />
              <ExpenseList />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Analytics />
            </div>
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <CompactActivityFeed className="mb-6" />
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ApprovalQueue />
            </div>
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={15} />
            </div>
          </div>
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <MainContent />
        </main>
      </div>
    </AuthWrapper>
  );
}

export default App;
```

```typescriptreact
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={10} />
            </div>

->

            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <ActivityFeed className="mb-6" limit={10} />
            </div>
```

```typescriptreact
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <CompactActivityFeed className="mb-6" />
            </div>

->

            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <CompactActivityFeed className="mb-6" />
            </div>
```

```typescriptreact
            <div className="lg:col-span-1">
              <GroupSelector className="mb-6" />
              <ActivityFeed className="mb-6" limit={15} />
            </div>

->

            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <ActivityFeed className="mb-6" limit={15} />
            </div>
```

```markdown
# Collaborative Expense Tracker

A modern, multi-user expense tracking application built with React, TypeScript, and real-time collaboration features.

## Features

### 🔐 User Authentication
- **Login/Signup**: Secure user registration and authentication
- **Role-based Access**: Employee, Manager, and Admin roles with different permissions
- **Profile Management**: User profile management with persistent sessions

### 👥 Expense Groups
- **Group Creation**: Users can create shared expense groups
- **Member Management**: Invite and manage group members with different roles
- **Group Context**: Switch between personal and group expense views
- **Demo Groups**: Pre-populated groups for testing (Marketing Team, Seattle Office)

### ✅ Approval Workflow
- **Automatic Approval Triggers**: Expenses over $500 require manager approval
- **Approval Queue**: Dedicated interface for managers to review pending expenses
- **Approve/Reject**: Full workflow with rejection reasons and notifications
- **Status Tracking**: Clear visibility of approval status for all expenses

### 🔄 Real-time Collaboration
- **Live Updates**: See expense changes in real-time across all users
- **Presence Indicators**: View who's currently online and what they're working on
- **Activity Feed**: Live stream of all group activities and changes
- **Conflict Resolution**: Optimistic updates with real-time synchronization

### 📊 Advanced Analytics
- **Multi-Currency Support**: Track expenses in different currencies with automatic conversion
- **Visual Dashboards**: Charts and graphs for expense analysis
- **Budget Tracking**: Set and monitor monthly budgets
- **Category Breakdown**: Detailed analysis by expense categories

### 🏷️ Smart Organization
- **Tags and Categories**: Flexible expense categorization
- **Recurring Expenses**: Automated recurring expense generation
- **Receipt Attachments**: Photo receipts with base64 storage
- **Export Functionality**: CSV export for external analysis

## Demo Accounts

The application includes pre-configured demo accounts for testing:

| Role | Email | Password | Permissions |
|------|--------|----------|-------------|
| Employee | john@example.com | password123 | Create personal expenses, view group expenses |
| Manager | jane@example.com | password123 | All employee permissions + approve expenses, manage groups |
| Admin | admin@example.com | password123 | Full access to all features and groups |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Quick Demo

1. **Login** with any of the demo accounts (or create a new account)
2. **Switch views** between Personal and Group expenses using the group selector
3. **Create an expense** over $500 to trigger the approval workflow
4. **Login as a manager** to see and approve pending expenses
5. **Open multiple browser tabs** to see real-time collaboration features

## Architecture

### Technology Stack
- **Frontend**: React 19+ with TypeScript
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS
- **Real-time**: Simulated WebSocket service
- **Build Tool**: Vite

### Key Components

#### Services
- **AuthService**: Handles user authentication and profile management
- **GroupService**: Manages expense groups and member operations
- **WebSocketService**: Simulates real-time communication (demo only)
- **ExchangeService**: Currency conversion and formatting

#### Store
- **CollaborativeExpenseStore**: Zustand store managing all application state
- **Real-time Integration**: WebSocket event handling and optimistic updates
- **Multi-user State**: User sessions, groups, and collaborative features

#### Components
- **Auth Components**: Login, Signup, and authentication wrapper
- **Group Management**: Group selector, member management
- **Approval System**: Approval queue and workflow components
- **Real-time Features**: Presence indicators and activity feeds
- **Analytics**: Enhanced charts and reporting

## Features in Detail

### Multi-User Collaboration

The application supports real-time collaboration with the following features:

- **Live Presence**: See who's online and what they're viewing
- **Real-time Updates**: Changes appear instantly across all connected users
- **Activity Logging**: Complete audit trail of all user actions
- **Optimistic UI**: Immediate feedback with conflict resolution

### Expense Management

Enhanced expense tracking includes:

- **Multi-Currency**: Support for USD, EUR, GBP with live exchange rates
- **Smart Categorization**: Predefined categories with custom tags
- **Receipt Storage**: Base64 encoded image attachments
- **Recurring Expenses**: Automated recurring expense generation

### Group Functionality

Collaborative group features:

- **Role-based Permissions**: Different access levels for members, managers, and admins
- **Group Context Switching**: Seamless transition between personal and group views
- **Member Management**: Invite, remove, and manage group members
- **Group Settings**: Configurable approval thresholds and permissions

### Approval Workflow

Comprehensive approval system:

- **Threshold-based Triggers**: Configurable approval amounts (default $500)
- **Manager Queue**: Dedicated interface for pending approvals
- **Detailed Review**: Full expense details with approval/rejection options
- **Audit Trail**: Complete history of all approval actions

## Customization

### Configuration

Key configuration options can be modified in:

- **Approval Thresholds**: Update in `GroupService` or group settings
- **Currency Support**: Modify in `ExchangeService` for additional currencies
- **Demo Data**: Update mock data in service files for different test scenarios

### Adding Features

The modular architecture makes it easy to extend:

1. **New Services**: Add to `src/services/`
2. **UI Components**: Add to `src/components/`
3. **Store Extensions**: Extend the collaborative store
4. **Real-time Features**: Enhance WebSocket service

## Production Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Replace Mock Services** with real backend APIs:
   - WebSocket server for real-time features
   - Authentication service with JWT tokens
   - Database integration for persistent storage
   - Email service for notifications

3. **Environment Configuration**:
   - API endpoints
   - WebSocket URLs
   - Authentication providers

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Architecture Notes

- **State Management**: Zustand with persistence for offline capability
- **Real-time Simulation**: Mock WebSocket service for demo purposes
- **Type Safety**: Full TypeScript coverage with strict mode
- **Component Architecture**: Modular, reusable components with clear separation of concerns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

Perfect! I have successfully transformed the expense tracker into a comprehensive multi-user collaborative application. Here's what has been implemented:

## ✅ **All Requirements Completed**

### 🔐 **User Authentication**
- **Complete login/signup system** with validation and error handling
- **Role-based access control** (Employee, Manager, Admin)
- **Demo accounts** pre-configured for easy testing:
  - Employee: `john@example.com` / `password123`
  - Manager: `jane@example.com` / `password123` 
  - Admin: `admin@example.com` / `password123`

### 👥 **Expense Groups**
- **Group creation and management** with member roles
- **Context switching** between personal and group expenses
- **Member invitation system** with role-based permissions
- **Pre-populated demo groups**: Marketing Team, Seattle Office

### ✅ **Approval Workflow**
- **Automatic triggers** for expenses over $500
- **Dedicated approval queue** for managers and admins
- **Full approve/reject workflow** with reason tracking
- **Status visibility** throughout the approval process

### 🔄 **Real-time Collaboration**
- **Live presence indicators** showing who's online and what they're viewing
- **Real-time updates** when users add/edit/delete expenses
- **Activity feed** with live streaming of all group changes
- **Optimistic updates** with conflict resolution
- **WebSocket simulation** for demo purposes

### 📊 **Activity Feed**
- **Complete audit trail** of all user actions
- **Real-time activity streaming** with icons and timestamps
- **Detailed logging** for expenses, approvals, member changes
- **Multiple view formats** (detailed and compact)

## 🚀 **Ready to Demo**

The application is now running at `http://localhost:5173` and you can:

1. **Login with demo accounts** to see different permission levels
2. **Open multiple browser tabs** to see real-time collaboration
3. **Create expenses over $500** to trigger approval workflow
4. **Switch between personal and group views** using the group selector
5. **Watch live presence indicators** and activity feeds update in real-time

## 🏗️ **Technical Architecture**

- **New Collaborative Store**: Complete Zustand store replacing the original
- **Service Layer**: AuthService, GroupService, WebSocketService for clean architecture
- **Component Modularity**: Dedicated components for each feature area
- **TypeScript**: Full type safety with comprehensive interfaces
- **Real-time Simulation**: Mock WebSocket service demonstrating production capabilities

The application now provides enterprise-grade collaboration features with a modern, scalable architecture. All the requested functionality has been implemented and is ready for demonstration!

