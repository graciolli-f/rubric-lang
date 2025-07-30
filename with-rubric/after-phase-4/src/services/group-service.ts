import type { ExpenseGroup, GroupInvitation, GroupFormData, InviteFormData } from '../types/group-types';
import { generateId } from '../utils/formatters';

class GroupService {
  private mockGroups: ExpenseGroup[] = [];
  private mockInvitations: GroupInvitation[] = [];

  constructor() {
    this.loadMockData();
    this.initializeDefaultGroups();
  }

  private loadMockData(): void {
    try {
      const storedGroups = localStorage.getItem('mock-groups');
      if (storedGroups) {
        this.mockGroups = JSON.parse(storedGroups);
      }

      const storedInvitations = localStorage.getItem('mock-invitations');
      if (storedInvitations) {
        this.mockInvitations = JSON.parse(storedInvitations);
      }
    } catch (error) {
      // Ignore errors and use empty state
    }
  }

  private saveMockData(): void {
    try {
      localStorage.setItem('mock-groups', JSON.stringify(this.mockGroups));
      localStorage.setItem('mock-invitations', JSON.stringify(this.mockInvitations));
    } catch (error) {
      // Ignore storage errors
    }
  }

  private initializeDefaultGroups(): void {
    if (this.mockGroups.length === 0) {
      const now = new Date().toISOString();
      
      this.mockGroups = [
        {
          id: 'group-1',
          name: 'Marketing Team',
          description: 'Marketing department expenses',
          createdBy: 'user-1',
          createdAt: now,
          members: [
            { userId: 'user-1', role: 'admin', joinedAt: now, invitedBy: 'user-1' },
            { userId: 'user-2', role: 'member', joinedAt: now, invitedBy: 'user-1' }
          ]
        },
        {
          id: 'group-2',
          name: 'Seattle Office',
          description: 'Seattle office shared expenses',
          createdBy: 'user-3',
          createdAt: now,
          members: [
            { userId: 'user-3', role: 'admin', joinedAt: now, invitedBy: 'user-3' },
            { userId: 'user-2', role: 'member', joinedAt: now, invitedBy: 'user-3' }
          ]
        }
      ];
      
      this.saveMockData();
    }
  }

  async createGroup(data: GroupFormData, createdBy: string): Promise<ExpenseGroup> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date().toISOString();
    const newGroup: ExpenseGroup = {
      id: generateId(),
      name: data.name,
      description: data.description,
      createdBy,
      createdAt: now,
      members: [
        { userId: createdBy, role: 'admin', joinedAt: now, invitedBy: createdBy }
      ]
    };

    this.mockGroups.push(newGroup);
    this.saveMockData();

    return newGroup;
  }

  async updateGroup(id: string, data: Partial<ExpenseGroup>): Promise<ExpenseGroup> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const groupIndex = this.mockGroups.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      throw new Error('Group not found');
    }

    const updatedGroup = {
      ...this.mockGroups[groupIndex],
      ...data,
      id, // Ensure ID cannot be changed
      updatedAt: new Date().toISOString()
    };

    this.mockGroups[groupIndex] = updatedGroup;
    this.saveMockData();

    return updatedGroup;
  }

  async deleteGroup(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    this.mockGroups = this.mockGroups.filter(g => g.id !== id);
    this.saveMockData();
  }

  async getUserGroups(userId: string): Promise<ExpenseGroup[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.mockGroups.filter(group => 
      group.members.some(member => member.userId === userId)
    );
  }

  async getGroupById(id: string): Promise<ExpenseGroup | null> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return this.mockGroups.find(g => g.id === id) || null;
  }

  async inviteMember(groupId: string, data: InviteFormData, invitedBy: string): Promise<GroupInvitation> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const invitation: GroupInvitation = {
      id: generateId(),
      groupId,
      email: data.email,
      role: data.role,
      invitedBy,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'pending'
    };

    this.mockInvitations.push(invitation);
    this.saveMockData();

    return invitation;
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const group = this.mockGroups.find(g => g.id === groupId);
    if (group) {
      group.members = group.members.filter(member => member.userId !== userId);
      this.saveMockData();
    }
  }

  async getInvitations(userId: string): Promise<GroupInvitation[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    // In a real app, we'd look up invitations by email associated with user
    return this.mockInvitations.filter(inv => inv.status === 'pending');
  }
}

export const groupService = new GroupService(); 