import { io, Socket } from 'socket.io-client';
import type { RealtimeUpdate, UserPresence, RealtimeUpdateType } from '../types';

export class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentUserId: string | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Mock mode for development
  private mockMode = true;
  private mockConnections: Set<string> = new Set();
  private mockPresence: Map<string, UserPresence> = new Map();

  constructor() {
    // Initialize mock mode since we don't have a real WebSocket server
    this.initializeMockMode();
  }

  // Initialize mock WebSocket behavior for development
  private initializeMockMode() {
    if (!this.mockMode) return;

    // Simulate connection events
    setTimeout(() => {
      this.isConnected = true;
      this.emit('connected');
    }, 1000);

    // Simulate random presence updates
    setInterval(() => {
      this.simulatePresenceUpdates();
    }, 10000);

    // Simulate random real-time updates
    setInterval(() => {
      this.simulateRandomUpdates();
    }, 15000);
  }

  connect(userId: string): Promise<void> {
    this.currentUserId = userId;

    if (this.mockMode) {
      return this.mockConnect(userId);
    }

    return new Promise((resolve, reject) => {
      try {
        // In a real implementation, this would connect to your WebSocket server
        this.socket = io(process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
          query: { userId },
          transports: ['websocket'],
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          this.emit('disconnected');
        });

        this.socket.on('reconnect_attempt', () => {
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.socket?.disconnect();
            reject(new Error('Max reconnection attempts reached'));
          }
        });

        // Listen for real-time updates
        this.socket.on('realtime_update', (update: RealtimeUpdate) => {
          this.emit('realtime_update', update);
        });

        // Listen for presence updates
        this.socket.on('presence_update', (presence: UserPresence[]) => {
          this.emit('presence_update', presence);
        });

        // Listen for editing events
        this.socket.on('editing_started', (data: any) => {
          this.emit('editing_started', data);
        });

        this.socket.on('editing_stopped', (data: any) => {
          this.emit('editing_stopped', data);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private async mockConnect(userId: string): Promise<void> {
    this.mockConnections.add(userId);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.isConnected = true;
    this.emit('connected');
    
    // Add mock presence
    this.mockPresence.set(userId, {
      userId,
      isOnline: true,
      currentPage: 'expenses',
      lastSeen: new Date().toISOString(),
    });
    
    this.emit('presence_update', Array.from(this.mockPresence.values()));
  }

  disconnect(): void {
    if (this.mockMode) {
      this.mockDisconnect();
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentUserId = null;
  }

  private mockDisconnect(): void {
    if (this.currentUserId) {
      this.mockConnections.delete(this.currentUserId);
      this.mockPresence.delete(this.currentUserId);
    }
    this.isConnected = false;
    this.emit('disconnected');
  }

  // Send a real-time update
  sendUpdate(type: RealtimeUpdateType, data: any, groupId?: string): void {
    if (!this.isConnected || !this.currentUserId) return;

    const update: RealtimeUpdate = {
      type,
      data,
      userId: this.currentUserId,
      timestamp: new Date().toISOString(),
    };

    if (this.mockMode) {
      // In mock mode, broadcast to other mock connections
      setTimeout(() => {
        this.emit('realtime_update', update);
      }, 100);
      return;
    }

    if (this.socket) {
      this.socket.emit('send_update', { update, groupId });
    }
  }

  // Update user presence
  updatePresence(presence: Partial<UserPresence>): void {
    if (!this.isConnected || !this.currentUserId) return;

    if (this.mockMode) {
      const currentPresence = this.mockPresence.get(this.currentUserId);
      if (currentPresence) {
        const updatedPresence = { ...currentPresence, ...presence };
        this.mockPresence.set(this.currentUserId, updatedPresence);
        this.emit('presence_update', Array.from(this.mockPresence.values()));
      }
      return;
    }

    if (this.socket) {
      this.socket.emit('update_presence', presence);
    }
  }

  // Start editing an entity
  startEditing(entityType: string, entityId: string, groupId?: string): void {
    if (!this.isConnected || !this.currentUserId) return;

    const editingData = {
      userId: this.currentUserId,
      entityType,
      entityId,
      groupId,
      timestamp: new Date().toISOString(),
    };

    if (this.mockMode) {
      setTimeout(() => {
        this.emit('editing_started', editingData);
      }, 50);
      return;
    }

    if (this.socket) {
      this.socket.emit('start_editing', editingData);
    }
  }

  // Stop editing an entity
  stopEditing(entityType: string, entityId: string, groupId?: string): void {
    if (!this.isConnected || !this.currentUserId) return;

    const editingData = {
      userId: this.currentUserId,
      entityType,
      entityId,
      groupId,
      timestamp: new Date().toISOString(),
    };

    if (this.mockMode) {
      setTimeout(() => {
        this.emit('editing_stopped', editingData);
      }, 50);
      return;
    }

    if (this.socket) {
      this.socket.emit('stop_editing', editingData);
    }
  }

  // Join a group room
  joinGroup(groupId: string): void {
    if (!this.isConnected) return;

    if (this.mockMode) {
      // Mock joining group
      return;
    }

    if (this.socket) {
      this.socket.emit('join_group', groupId);
    }
  }

  // Leave a group room
  leaveGroup(groupId: string): void {
    if (!this.isConnected) return;

    if (this.mockMode) {
      // Mock leaving group
      return;
    }

    if (this.socket) {
      this.socket.emit('leave_group', groupId);
    }
  }

  // Event listener management
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Mock simulation methods
  private simulatePresenceUpdates(): void {
    if (!this.mockMode) return;

    // Simulate random users coming online/offline
    const mockUserIds = ['1', '2', '3'];
    const randomUserId = mockUserIds[Math.floor(Math.random() * mockUserIds.length)];
    
    if (randomUserId !== this.currentUserId) {
      const isOnline = Math.random() > 0.3;
      
      if (isOnline) {
        this.mockPresence.set(randomUserId, {
          userId: randomUserId,
          isOnline: true,
          currentPage: Math.random() > 0.5 ? 'expenses' : 'groups',
          lastSeen: new Date().toISOString(),
        });
      } else {
        this.mockPresence.delete(randomUserId);
      }
      
      this.emit('presence_update', Array.from(this.mockPresence.values()));
    }
  }

  private simulateRandomUpdates(): void {
    if (!this.mockMode || !this.currentUserId) return;

    // Simulate random expense updates from other users
    const updateTypes: RealtimeUpdateType[] = ['expense_created', 'expense_updated', 'approval_requested'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    const mockUpdate: RealtimeUpdate = {
      type: randomType,
      data: {
        id: Date.now().toString(),
        amount: Math.floor(Math.random() * 1000) + 50,
        description: 'Mock expense update',
      },
      userId: '2', // Simulate update from another user
      timestamp: new Date().toISOString(),
    };

    this.emit('realtime_update', mockUpdate);
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get userId(): string | null {
    return this.currentUserId;
  }
}

// Singleton instance
export const websocketService = new WebSocketService(); 