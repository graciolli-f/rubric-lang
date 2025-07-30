import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { websocketService } from '../services/websocket-service';
import type { ExpenseGroup, PresenceInfo, ActivityEntry } from '../types/group-types';
import type { User } from '../types/auth-types';

interface GroupState {
  groups: ExpenseGroup[];
  activeGroup: ExpenseGroup | null;
  presenceInfo: PresenceInfo[];
  activityFeed: ActivityEntry[];
  isLoading: boolean;
  error: string | null;
}

interface GroupActions {
  createGroup: (name: string, description: string) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  setActiveGroup: (groupId: string | null) => void;
  inviteUser: (groupId: string, email: string) => Promise<void>;
  addActivity: (entry: ActivityEntry) => void;
  updatePresence: (presence: PresenceInfo[]) => void;
  clearError: () => void;
  initialize: (currentUser: User | null) => void;
}

type GroupStore = GroupState & GroupActions;

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      // State
      groups: [],
      activeGroup: null,
      presenceInfo: [],
      activityFeed: [],
      isLoading: false,
      error: null,

      // Actions
      createGroup: async (name: string, description: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newGroup: ExpenseGroup = {
            id: crypto.randomUUID(),
            name,
            description,
            members: [], // Will be populated with current user
            createdBy: 'current-user-id', // Should come from auth store
            createdAt: new Date().toISOString(),
            settings: {
              requireApprovalOver: 500, // Default $500 approval threshold
              allowInvites: true,
              isPrivate: false
            }
          };
          
          const state = get();
          const updatedGroups = [...state.groups, newGroup];
          
          set({ 
            groups: updatedGroups,
            activeGroup: newGroup,
            isLoading: false 
          });
          
          // Connect to group's WebSocket room
          await websocketService.connect(newGroup.id);
          
          // Add activity entry
          const activity: ActivityEntry = {
            id: crypto.randomUUID(),
            type: 'group_created',
            userId: 'current-user-id',
            userName: 'Current User',
            groupId: newGroup.id,
            details: {},
            timestamp: new Date().toISOString()
          };
          
          get().addActivity(activity);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      joinGroup: async (groupId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // In a real app, this would make an API call to join the group
          // For now, simulate finding and joining a mock group
          const mockGroup: ExpenseGroup = {
            id: groupId,
            name: 'Marketing Team',
            description: 'Shared expenses for the marketing department',
            members: [],
            createdBy: 'other-user-id',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            settings: {
              requireApprovalOver: 500,
              allowInvites: true,
              isPrivate: false
            }
          };
          
          const state = get();
          const updatedGroups = [...state.groups, mockGroup];
          
          set({ 
            groups: updatedGroups,
            activeGroup: mockGroup,
            isLoading: false 
          });
          
          // Connect to group's WebSocket room
          await websocketService.connect(groupId);
          
          // Add activity entry
          const activity: ActivityEntry = {
            id: crypto.randomUUID(),
            type: 'member_joined',
            userId: 'current-user-id',
            userName: 'Current User',
            groupId,
            details: {},
            timestamp: new Date().toISOString()
          };
          
          get().addActivity(activity);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to join group';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      leaveGroup: async (groupId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const state = get();
          const updatedGroups = state.groups.filter(g => g.id !== groupId);
          const newActiveGroup = state.activeGroup?.id === groupId ? null : state.activeGroup;
          
          set({ 
            groups: updatedGroups,
            activeGroup: newActiveGroup,
            isLoading: false 
          });
          
          // Add activity entry before leaving
          const activity: ActivityEntry = {
            id: crypto.randomUUID(),
            type: 'member_left',
            userId: 'current-user-id',
            userName: 'Current User',
            groupId,
            details: {},
            timestamp: new Date().toISOString()
          };
          
          get().addActivity(activity);
          
          // Disconnect from group WebSocket if it was active
          if (newActiveGroup === null) {
            websocketService.disconnect();
          } else if (newActiveGroup) {
            await websocketService.connect(newActiveGroup.id);
          }
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to leave group';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      setActiveGroup: (groupId: string | null) => {
        const state = get();
        const group = groupId ? state.groups.find(g => g.id === groupId) || null : null;
        
        set({ activeGroup: group });
        
        // Connect to the new group's WebSocket room
        if (group) {
          websocketService.connect(group.id);
        } else {
          websocketService.connect(); // Connect globally
        }
      },

      inviteUser: async (groupId: string, email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // In a real app, this would send an email invitation
          console.log(`Inviting ${email} to group ${groupId}`);
          
          set({ isLoading: false });
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      addActivity: (entry: ActivityEntry) => {
        const state = get();
        const updatedFeed = [entry, ...state.activityFeed].slice(0, 100); // Keep last 100 entries
        set({ activityFeed: updatedFeed });
      },

      updatePresence: (presence: PresenceInfo[]) => {
        set({ presenceInfo: presence });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: (currentUser: User | null) => {
        if (currentUser) {
          // Set up WebSocket presence updates
          websocketService.onPresenceUpdate((presence) => {
            get().updatePresence(presence);
          });
          
          // Set up WebSocket message handling for activity updates
          websocketService.onMessage((message) => {
            if (message.type === 'activity_update') {
              get().addActivity(message.data);
            }
          });
        }
      }
    }),
    {
      name: 'group-store',
      partialize: (state) => ({
        groups: state.groups,
        activeGroup: state.activeGroup,
        activityFeed: state.activityFeed
      }),
    }
  )
); 