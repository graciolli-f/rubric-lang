export type WebSocketMessageType = 
  | "presence_update" 
  | "expense_created" 
  | "expense_updated" 
  | "expense_deleted" 
  | "editing_started" 
  | "editing_stopped"
  | "approval_request" 
  | "approval_decision" 
  | "activity_created";

export type ActivityType = 
  | "expense_created" 
  | "expense_updated" 
  | "expense_deleted"
  | "expense_approved" 
  | "expense_rejected" 
  | "group_created"
  | "member_added" 
  | "member_removed";

export type PresenceUser = {
  userId: string;
  name: string;
  avatar?: string;
  lastSeen: string;
  currentView?: string;
};

export type EditingState = {
  expenseId: string;
  userId: string;
  userName: string;
  startedAt: string;
};

export type WebSocketMessage = {
  type: WebSocketMessageType;
  payload: any;
  timestamp: string;
  userId?: string;
};

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  timestamp: string;
  groupId?: string;
  data: any;
};

export type OptimisticUpdate = {
  id: string;
  type: "create" | "update" | "delete";
  entityType: "expense" | "group" | "approval";
  timestamp: string;
  data: any;
};

export const WEBSOCKET_MESSAGE_TYPES: readonly WebSocketMessageType[] = [
  "presence_update",
  "expense_created",
  "expense_updated", 
  "expense_deleted",
  "editing_started",
  "editing_stopped",
  "approval_request",
  "approval_decision",
  "activity_created"
] as const;

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "expense_created",
  "expense_updated",
  "expense_deleted",
  "expense_approved",
  "expense_rejected",
  "group_created",
  "member_added",
  "member_removed"
] as const;

export function isValidWebSocketMessage(value: unknown): value is WebSocketMessage {
  if (!value || typeof value !== "object") return false;
  
  const message = value as Record<string, unknown>;
  
  return (
    typeof message.type === "string" &&
    WEBSOCKET_MESSAGE_TYPES.includes(message.type as WebSocketMessageType) &&
    typeof message.timestamp === "string" &&
    (message.userId === undefined || typeof message.userId === "string")
  );
}

export function isValidActivityEvent(value: unknown): value is ActivityEvent {
  if (!value || typeof value !== "object") return false;
  
  const event = value as Record<string, unknown>;
  
  return (
    typeof event.id === "string" &&
    typeof event.type === "string" &&
    ACTIVITY_TYPES.includes(event.type as ActivityType) &&
    typeof event.userId === "string" &&
    typeof event.userName === "string" &&
    typeof event.timestamp === "string" &&
    (event.groupId === undefined || typeof event.groupId === "string")
  );
} 