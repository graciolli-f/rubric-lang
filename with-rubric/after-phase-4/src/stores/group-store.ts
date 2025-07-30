import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { ExpenseGroup, GroupInvitation, GroupFormData, InviteFormData } from '../types/group-types';
import { generateId } from '../utils/formatters';
import { groupService } from '../services/group-service';

export interface GroupStoreState {
  groups: ExpenseGroup[];
  currentGroupId: string | null;
  invitations: GroupInvitation[];
  isLoading: boolean;
  error: string | null;
  createGroup: (data: GroupFormData) => Promise<void>;
  updateGroup: (id: string, data: Partial<ExpenseGroup>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  inviteMember: (groupId: string, data: InviteFormData) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
  setCurrentGroup: (groupId: string | null) => void;
  getUserGroups: (userId: string) => ExpenseGroup[];
  getGroupById: (id: string) => ExpenseGroup | undefined;
  clearError: () => void;
}

export const useGroupStore = create<GroupStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        groups: [],
        currentGroupId: null,
        invitations: [],
        isLoading: false,
        error: null,

        createGroup: async (data: GroupFormData) => {
          set({ isLoading: true, error: null });
          
          try {
            // For demo purposes, use a mock user ID
            const newGroup = await groupService.createGroup(data, 'demo-user');
            
            set(state => ({
              groups: [...state.groups, newGroup],
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create group',
              isLoading: false 
            });
            throw error;
          }
        },

        updateGroup: async (id: string, data: Partial<ExpenseGroup>) => {
          set({ isLoading: true, error: null });
          
          try {
            const updatedGroup = await groupService.updateGroup(id, data);
            
            set(state => ({
              groups: state.groups.map(g => g.id === id ? updatedGroup : g),
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update group',
              isLoading: false 
            });
            throw error;
          }
        },

        deleteGroup: async (id: string) => {
          set({ isLoading: true, error: null });
          
          try {
            await groupService.deleteGroup(id);
            
            set(state => ({
              groups: state.groups.filter(g => g.id !== id),
              currentGroupId: state.currentGroupId === id ? null : state.currentGroupId,
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete group',
              isLoading: false 
            });
            throw error;
          }
        },

        inviteMember: async (groupId: string, data: InviteFormData) => {
          set({ isLoading: true, error: null });
          
          try {
            const invitation = await groupService.inviteMember(groupId, data, 'demo-user');
            
            set(state => ({
              invitations: [...state.invitations, invitation],
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to invite member',
              isLoading: false 
            });
            throw error;
          }
        },

        removeMember: async (groupId: string, userId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            await groupService.removeMember(groupId, userId);
            
            set(state => ({
              groups: state.groups.map(group => 
                group.id === groupId 
                  ? { ...group, members: group.members.filter(m => m.userId !== userId) }
                  : group
              ),
              isLoading: false
            }));
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to remove member',
              isLoading: false 
            });
            throw error;
          }
        },

        setCurrentGroup: (groupId: string | null) => {
          set({ currentGroupId: groupId });
        },

        getUserGroups: (userId: string) => {
          const { groups } = get();
          return groups.filter(group => 
            group.members.some(member => member.userId === userId)
          );
        },

        getGroupById: (id: string) => {
          const { groups } = get();
          return groups.find(g => g.id === id);
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'group-data',
        partialize: (state) => ({ 
          groups: state.groups,
          currentGroupId: state.currentGroupId,
          invitations: state.invitations
        }),
      }
    ),
    {
      name: 'group-store',
    }
  )
); 