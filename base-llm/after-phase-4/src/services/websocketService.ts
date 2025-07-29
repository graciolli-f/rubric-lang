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
          this.connect(this.currentUserId, this.currentGroupId ? this.currentGroupId : undefined);
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