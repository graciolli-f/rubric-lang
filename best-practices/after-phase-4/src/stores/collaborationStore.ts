import { create } from 'zustand';
import type { 
  CollaborationState, 
  UserPresence, 
  ActivityItem, 
  ApprovalRequest, 
  Group,
  RealtimeUpdate,
  User 
} from '../types';
import { websocketService } from '../services/websocketService';
import { mockUsers } from './authStore';

// Mock groups for development
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Marketing Team',
    description: 'Marketing department expenses',
    createdBy: '1',
    members: [
      { userId: '1', role: 'manager', joinedAt: new Date().toISOString(), invitedBy: '1' },
      { userId: '2', role: 'member', joinedAt: new Date().toISOString(), invitedBy: '1' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Engineering Team',
    description: 'Development team expenses',
    createdBy: '3',
    members: [
      { userId: '3', role: 'admin', joinedAt: new Date().toISOString(), invitedBy: '3' },
      { userId: '2', role: 'member', joinedAt: new Date().toISOString(), invitedBy: '3' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock pending approvals
const mockApprovals: ApprovalRequest[] = [
  {
    id: '1',
    expenseId: 'expense-1',
    requestedBy: '2',
    assignedTo: '1',
    reason: 'Expense over $500 threshold',
    createdAt: new Date().toISOString(),
    status: 'pending',
  },
];

// Mock activity feed
const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'expense',
    userId: '2',
    groupId: '1',
    entityId: 'expense-1',
    entityType: 'expense',
    action: 'created',
    details: { amount: 750, description: 'Team lunch' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'approval',
    userId: '1',
    groupId: '1',
    entityId: 'expense-2',
    entityType: 'expense',
    action: 'approved',
    details: { amount: 250, description: 'Office supplies' },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

interface CollaborationStore extends CollaborationState {
  // Actions
  connect: (userId: string) => Promise<void>;
  disconnect: () => void;
  setCurrentGroup: (group: Group | undefined) => void;
  updatePresence: (presence: Partial<UserPresence>) => void;
  addActivityItem: (item: ActivityItem) => void;
  handleRealtimeUpdate: (update: RealtimeUpdate) => void;
  startEditing: (entityType: string, entityId: string) => void;
  stopEditing: (entityType: string, entityId: string) => void;
  
  // Group management
  getGroups: () => Group[];
  getUserGroups: (userId: string) => Group[];
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  
  // Approval management
  getPendingApprovals: (userId: string) => ApprovalRequest[];
  approveExpense: (approvalId: string, comment?: string) => Promise<void>;
  rejectExpense: (approvalId: string, comment: string) => Promise<void>;
  
  // Activity feed
  getGroupActivity: (groupId: string) => ActivityItem[];
  getUserActivity: (userId: string) => ActivityItem[];
  
  // Presence management
  getOnlineUsers: (groupId?: string) => UserPresence[];
  getUsersEditingEntity: (entityType: string, entityId: string) => UserPresence[];
}

export const useCollaborationStore = create<CollaborationStore>((set, get) => ({
  // Initial state
  currentGroup: undefined,
  userPresence: [],
  pendingApprovals: mockApprovals,
  activityFeed: mockActivity,
  isConnected: false,

  // Connection management
  connect: async (userId: string) => {
    try {
      await websocketService.connect(userId);
      
      // Set up event listeners
      websocketService.on('connected', () => {
        set({ isConnected: true });
      });

      websocketService.on('disconnected', () => {
        set({ isConnected: false });
      });

      websocketService.on('presence_update', (presence: UserPresence[]) => {
        set({ userPresence: presence });
      });

      websocketService.on('realtime_update', (update: RealtimeUpdate) => {
        get().handleRealtimeUpdate(update);
      });

      websocketService.on('editing_started', (data: any) => {
        // Update presence to show editing status
        const currentPresence = get().userPresence;
        const updatedPresence = currentPresence.map(p => 
          p.userId === data.userId 
            ? { ...p, isEditing: { entityType: data.entityType, entityId: data.entityId } }
            : p
        );
        set({ userPresence: updatedPresence });
      });

      websocketService.on('editing_stopped', (data: any) => {
        // Remove editing status
        const currentPresence = get().userPresence;
        const updatedPresence = currentPresence.map(p => 
          p.userId === data.userId 
            ? { ...p, isEditing: undefined }
            : p
        );
        set({ userPresence: updatedPresence });
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  },

  disconnect: () => {
    websocketService.disconnect();
    set({ isConnected: false, userPresence: [] });
  },

  setCurrentGroup: (group) => {
    const { currentGroup } = get();
    
    // Leave previous group
    if (currentGroup) {
      websocketService.leaveGroup(currentGroup.id);
    }
    
    // Join new group
    if (group) {
      websocketService.joinGroup(group.id);
      websocketService.updatePresence({ groupId: group.id });
    }
    
    set({ currentGroup: group });
  },

  updatePresence: (presence) => {
    websocketService.updatePresence(presence);
  },

  addActivityItem: (item) => {
    set(state => ({
      activityFeed: [item, ...state.activityFeed].slice(0, 100) // Keep last 100 items
    }));
  },

  handleRealtimeUpdate: (update) => {
    // Add to activity feed
    const activityItem: ActivityItem = {
      id: Date.now().toString(),
      type: update.type.includes('expense') ? 'expense' : 'approval',
      userId: update.userId,
      entityId: update.data.id || 'unknown',
      entityType: 'expense',
      action: update.type.replace('expense_', '').replace('approval_', ''),
      details: update.data,
      createdAt: update.timestamp,
    };
    
    get().addActivityItem(activityItem);
    
    // Emit custom event for other components to handle
    window.dispatchEvent(new CustomEvent('realtime-update', { detail: update }));
  },

  startEditing: (entityType, entityId) => {
    const { currentGroup } = get();
    websocketService.startEditing(entityType, entityId, currentGroup?.id);
  },

  stopEditing: (entityType, entityId) => {
    const { currentGroup } = get();
    websocketService.stopEditing(entityType, entityId, currentGroup?.id);
  },

  // Group management
  getGroups: () => mockGroups,

  getUserGroups: (userId) => {
    return mockGroups.filter(group => 
      group.members.some(member => member.userId === userId)
    );
  },

  joinGroup: (groupId) => {
    websocketService.joinGroup(groupId);
  },

  leaveGroup: (groupId) => {
    websocketService.leaveGroup(groupId);
  },

  // Approval management
  getPendingApprovals: (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user || user.role === 'user') {
      // Users see their own pending submissions
      return get().pendingApprovals.filter(approval => approval.requestedBy === userId);
    }
    
    // Managers and admins see all pending approvals assigned to them
    return get().pendingApprovals.filter(approval => 
      approval.assignedTo === userId || approval.status === 'pending'
    );
  },

  approveExpense: async (approvalId, comment) => {
    const approvals = get().pendingApprovals;
    const approval = approvals.find(a => a.id === approvalId);
    
    if (!approval) return;

    // Update approval status
    const updatedApprovals = approvals.map(a => 
      a.id === approvalId 
        ? { 
            ...a, 
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewComment: comment 
          }
        : a
    );

    set({ pendingApprovals: updatedApprovals });

    // Send real-time update
    websocketService.sendUpdate('approval_completed', {
      approvalId,
      expenseId: approval.expenseId,
      status: 'approved',
      comment,
    });

    // Add activity item
    get().addActivityItem({
      id: Date.now().toString(),
      type: 'approval',
      userId: websocketService.userId || 'unknown',
      entityId: approval.expenseId,
      entityType: 'expense',
      action: 'approved',
      details: { comment },
      createdAt: new Date().toISOString(),
    });
  },

  rejectExpense: async (approvalId, comment) => {
    const approvals = get().pendingApprovals;
    const approval = approvals.find(a => a.id === approvalId);
    
    if (!approval) return;

    // Update approval status
    const updatedApprovals = approvals.map(a => 
      a.id === approvalId 
        ? { 
            ...a, 
            status: 'rejected' as const,
            reviewedAt: new Date().toISOString(),
            reviewComment: comment 
          }
        : a
    );

    set({ pendingApprovals: updatedApprovals });

    // Send real-time update
    websocketService.sendUpdate('approval_completed', {
      approvalId,
      expenseId: approval.expenseId,
      status: 'rejected',
      comment,
    });

    // Add activity item
    get().addActivityItem({
      id: Date.now().toString(),
      type: 'approval',
      userId: websocketService.userId || 'unknown',
      entityId: approval.expenseId,
      entityType: 'expense',
      action: 'rejected',
      details: { comment },
      createdAt: new Date().toISOString(),
    });
  },

  // Activity feed
  getGroupActivity: (groupId) => {
    return get().activityFeed.filter(item => item.groupId === groupId);
  },

  getUserActivity: (userId) => {
    return get().activityFeed.filter(item => item.userId === userId);
  },

  // Presence management
  getOnlineUsers: (groupId) => {
    const presence = get().userPresence;
    return groupId 
      ? presence.filter(p => p.isOnline && p.groupId === groupId)
      : presence.filter(p => p.isOnline);
  },

  getUsersEditingEntity: (entityType, entityId) => {
    return get().userPresence.filter(p => 
      p.isEditing?.entityType === entityType && 
      p.isEditing?.entityId === entityId
    );
  },
}));

// Export mock data for development
export { mockGroups, mockApprovals, mockActivity }; 