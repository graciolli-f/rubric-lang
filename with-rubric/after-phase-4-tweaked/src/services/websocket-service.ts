import type { PresenceInfo } from '../types/group-types';
import type { User } from '../types/auth-types';

type MessageHandler = (message: any) => void;
type PresenceHandler = (presence: PresenceInfo[]) => void;

class WebSocketService {
  private _socket: WebSocket | null = null;
  private _isConnected: boolean = false;
  private _messageHandlers: Set<MessageHandler> = new Set();
  private _presenceHandlers: Set<PresenceHandler> = new Set();
  private _reconnectAttempts: number = 0;
  private _maxReconnectAttempts: number = 5;
  private _reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private _currentGroupId: string | null = null;
  private _currentUser: User | null = null;

  async connect(groupId?: string): Promise<void> {
    if (this._isConnected && this._socket) {
      console.log('WebSocket already connected');
      return;
    }

    this._currentGroupId = groupId || null;
    
    console.log('Connecting WebSocket...', groupId ? `for group: ${groupId}` : 'globally');

    try {
      // In a real app, this would connect to your WebSocket server
      // For now, we'll simulate a WebSocket connection
      this._socket = this.createMockWebSocket();
      
      this._socket.onopen = () => {
        console.log('WebSocket connected');
        this._isConnected = true;
        this._reconnectAttempts = 0;
        
        // Send initial presence update
        this.sendMessage('presence_update', {
          status: 'viewing',
          groupId: this._currentGroupId,
          timestamp: new Date().toISOString()
        });

        // Simulate receiving presence updates
        this.simulatePresenceUpdates();
      };

      this._socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          if (message.type === 'presence_update') {
            this._presenceHandlers.forEach(handler => {
              handler(message.data);
            });
          } else {
            this._messageHandlers.forEach(handler => {
              handler(message);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this._socket.onclose = () => {
        console.log('WebSocket disconnected');
        this._isConnected = false;
        this._socket = null;
        this.handleReconnect();
      };

      this._socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      throw error;
    }
  }

  disconnect(): void {
    console.log('Disconnecting WebSocket');
    
    if (this._reconnectTimeout) {
      clearTimeout(this._reconnectTimeout);
      this._reconnectTimeout = null;
    }

    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
    
    this._isConnected = false;
    this._messageHandlers.clear();
    this._presenceHandlers.clear();
  }

  sendMessage(type: string, data: any): void {
    if (!this._isConnected || !this._socket) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    const message = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    try {
      this._socket.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  onMessage(callback: MessageHandler): () => void {
    this._messageHandlers.add(callback);
    return () => {
      this._messageHandlers.delete(callback);
    };
  }

  onPresenceUpdate(callback: PresenceHandler): () => void {
    this._presenceHandlers.add(callback);
    return () => {
      this._presenceHandlers.delete(callback);
    };
  }

  updatePresence(status: string): void {
    this.sendMessage('presence_update', {
      status,
      groupId: this._currentGroupId,
      timestamp: new Date().toISOString()
    });
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  setCurrentUser(user: User | null): void {
    this._currentUser = user;
  }

  private createMockWebSocket(): WebSocket {
    // Create a mock WebSocket for development using a more compatible approach
    const mockWs = {
      onopen: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
      send: (data: string) => {
        console.log('Mock WebSocket send:', data);
      },
      close: () => {
        setTimeout(() => {
          if (mockWs.onclose) {
            mockWs.onclose({} as CloseEvent);
          }
        }, 100);
      }
    } as unknown as WebSocket;

    // Simulate connection opening
    setTimeout(() => {
      if (mockWs.onopen) {
        mockWs.onopen({} as Event);
      }
    }, 500);

    return mockWs;
  }

  private simulatePresenceUpdates(): void {
    // Simulate other users being online
    const mockPresence: PresenceInfo[] = [
      {
        userId: 'mock-user-1',
        userName: 'Alice Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'viewing',
        lastSeen: new Date().toISOString(),
        currentPage: 'expenses'
      },
      {
        userId: 'mock-user-2',
        userName: 'Bob Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'editing',
        lastSeen: new Date().toISOString(),
        currentPage: 'expenses',
        editingExpenseId: 'expense-123'
      }
    ];

    // Randomly update presence every 10-30 seconds
    const updatePresence = () => {
      if (!this._isConnected) return;
      
      const randomPresence = mockPresence.map(p => ({
        ...p,
        status: Math.random() > 0.7 ? 'away' : (Math.random() > 0.5 ? 'viewing' : 'editing'),
        lastSeen: new Date().toISOString()
      })) as PresenceInfo[];

      this._presenceHandlers.forEach(handler => {
        handler(randomPresence);
      });

      setTimeout(updatePresence, 10000 + Math.random() * 20000);
    };

    setTimeout(updatePresence, 2000);
  }

  private handleReconnect(): void {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this._reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this._reconnectAttempts), 30000);
    
    console.log(`WebSocket reconnecting in ${delay}ms (attempt ${this._reconnectAttempts})`);
    
    this._reconnectTimeout = setTimeout(() => {
      this.connect(this._currentGroupId || undefined);
    }, delay);
  }
}

export const websocketService = new WebSocketService(); 