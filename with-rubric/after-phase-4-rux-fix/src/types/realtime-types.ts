export interface PresenceUser {
  userId: string;
  name: string;
  lastSeen: string;
  isActive: boolean;
  currentView: string;
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  userId: string;
  userName: string;
  timestamp: string;
  data: any;
  groupId?: string;
}

export type ActivityEventType = 
  | "expense_created" 
  | "expense_updated" 
  | "expense_deleted" 
  | "approval_requested" 
  | "approval_granted" 
  | "approval_rejected"
  | "group_created" 
  | "member_added" 
  | "member_removed";

export interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: string;
  userId?: string;
}

export type MessageType = 
  | "presence_update" 
  | "activity_event" 
  | "expense_update" 
  | "approval_update" 
  | "group_update" 
  | "user_typing" 
  | "ping" 
  | "pong";

export interface OptimisticUpdate {
  id: string;
  type: "expense" | "approval" | "group";
  operation: "create" | "update" | "delete";
  data: any;
  timestamp: string;
  status: "pending" | "confirmed" | "failed";
}

export interface ConflictResolution {
  localVersion: any;
  serverVersion: any;
  resolvedVersion: any;
  strategy: "server_wins" | "client_wins" | "merge" | "manual";
} 