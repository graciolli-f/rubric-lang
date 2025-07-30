import type { WebSocketMessage, WebSocketMessageType } from '../types/realtime-types';

class WebSocketService {
  private isConnectedState: boolean = false;
  private subscribers: Set<(message: WebSocketMessage) => void> = new Set();
  private userId: string | null = null;
  private simulationTimer: any = null;

  connect(userId: string): void {
    this.userId = userId;
    this.isConnectedState = true;
    
    // Simulate periodic presence updates
    this.simulationTimer = setInterval(() => {
      this.simulateRandomActivity();
    }, 5000);

    // Notify subscribers of connection
    this.broadcast({
      type: 'presence_update',
      payload: { userId, status: 'online' },
      timestamp: new Date().toISOString(),
      userId
    });
  }

  disconnect(): void {
    this.isConnectedState = false;
    this.userId = null;
    
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (!this.isConnectedState) return;
    
    // In a real implementation, this would send to the server
    // For demo, we'll echo it back with a slight delay
    setTimeout(() => {
      this.broadcast(message);
    }, 100);
  }

  subscribe(callback: (message: WebSocketMessage) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  isConnected(): boolean {
    return this.isConnectedState;
  }

  simulateMessage(message: WebSocketMessage): void {
    this.broadcast(message);
  }

  private broadcast(message: WebSocketMessage): void {
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        // Ignore callback errors
      }
    });
  }

  private simulateRandomActivity(): void {
    if (!this.isConnectedState || !this.userId) return;

    const activityTypes: WebSocketMessageType[] = [
      'expense_created',
      'expense_updated',
      'presence_update'
    ];

    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    this.broadcast({
      type: randomType,
      payload: {
        userId: this.userId,
        timestamp: new Date().toISOString(),
        data: { simulated: true }
      },
      timestamp: new Date().toISOString(),
      userId: this.userId
    });
  }
}

export const webSocketService = new WebSocketService(); 