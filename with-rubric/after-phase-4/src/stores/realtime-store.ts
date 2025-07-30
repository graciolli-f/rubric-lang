import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PresenceUser, EditingState, ActivityEvent, OptimisticUpdate } from '../types/realtime-types';
import { webSocketService } from '../services/websocket-service';

export interface RealtimeStoreState {
  isConnected: boolean;
  presenceUsers: PresenceUser[];
  editingStates: EditingState[];
  activities: ActivityEvent[];
  optimisticUpdates: OptimisticUpdate[];
  connect: (userId: string) => void;
  disconnect: () => void;
  updatePresence: (data: Partial<PresenceUser>) => void;
  startEditing: (expenseId: string) => void;
  stopEditing: (expenseId: string) => void;
  addActivity: (activity: ActivityEvent) => void;
  addOptimisticUpdate: (update: OptimisticUpdate) => void;
  removeOptimisticUpdate: (id: string) => void;
  clearActivities: () => void;
}

export const useRealtimeStore = create<RealtimeStoreState>()(
  devtools(
    (set, get) => ({
      isConnected: false,
      presenceUsers: [],
      editingStates: [],
      activities: [],
      optimisticUpdates: [],

      connect: (userId: string) => {
        webSocketService.connect(userId);
        set({ isConnected: true });
      },

      disconnect: () => {
        webSocketService.disconnect();
        set({ 
          isConnected: false,
          presenceUsers: [],
          editingStates: []
        });
      },

      updatePresence: (data: Partial<PresenceUser>) => {
        set(state => ({
          presenceUsers: state.presenceUsers.map(user => 
            user.userId === data.userId ? { ...user, ...data } : user
          )
        }));
      },

      startEditing: (expenseId: string) => {
        const { isConnected } = get();
        if (!isConnected) return;

        const editingState: EditingState = {
          expenseId,
          userId: 'current-user',
          userName: 'Current User',
          startedAt: new Date().toISOString()
        };

        set(state => ({
          editingStates: [...state.editingStates, editingState]
        }));
      },

      stopEditing: (expenseId: string) => {
        set(state => ({
          editingStates: state.editingStates.filter(state => state.expenseId !== expenseId)
        }));
      },

      addActivity: (activity: ActivityEvent) => {
        set(state => ({
          activities: [activity, ...state.activities].slice(0, 50) // Keep only latest 50
        }));
      },

      addOptimisticUpdate: (update: OptimisticUpdate) => {
        set(state => ({
          optimisticUpdates: [...state.optimisticUpdates, update]
        }));
      },

      removeOptimisticUpdate: (id: string) => {
        set(state => ({
          optimisticUpdates: state.optimisticUpdates.filter(update => update.id !== id)
        }));
      },

      clearActivities: () => {
        set({ activities: [] });
      },
    }),
    {
      name: 'realtime-store',
    }
  )
); 