import type { ExpenseGroup, GroupMember, User, ActivityLog } from '../types';

interface CreateGroupData {
  name: string;
  description: string;
  requireApprovalThreshold?: number;
  approvalRequired?: boolean;
}

interface InviteMemberData {
  email: string;
  role: 'member' | 'manager';
}

class GroupService {
  private static instance: GroupService;
  private groups: ExpenseGroup[] = [];
  private activityLogs: ActivityLog[] = [];

  static getInstance(): GroupService {
    if (!GroupService.instance) {
      GroupService.instance = new GroupService();
    }
    return GroupService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeMockData();
  }

  private loadFromStorage(): void {
    const groupsData = localStorage.getItem('expenseGroups');
    const activityData = localStorage.getItem('groupActivity');
    
    if (groupsData) {
      this.groups = JSON.parse(groupsData);
    }
    
    if (activityData) {
      this.activityLogs = JSON.parse(activityData);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('expenseGroups', JSON.stringify(this.groups));
    localStorage.setItem('groupActivity', JSON.stringify(this.activityLogs));
  }

  private initializeMockData(): void {
    if (this.groups.length === 0) {
      // Create some demo groups
      const mockGroups: ExpenseGroup[] = [
        {
          id: 'group-1',
          name: 'Marketing Team',
          description: 'Marketing department expenses and campaigns',
          createdBy: 'user-2',
          createdAt: new Date().toISOString(),
          members: [
            {
              userId: 'user-1',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-2',
              role: 'manager',
              joinedAt: new Date().toISOString(),
              status: 'active'
            }
          ],
          settings: {
            requireApprovalThreshold: 500,
            approvalRequired: true
          }
        },
        {
          id: 'group-2',
          name: 'Seattle Office',
          description: 'Office expenses for Seattle location',
          createdBy: 'user-3',
          createdAt: new Date().toISOString(),
          members: [
            {
              userId: 'user-1',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-2',
              role: 'member',
              joinedAt: new Date().toISOString(),
              status: 'active'
            },
            {
              userId: 'user-3',
              role: 'admin',
              joinedAt: new Date().toISOString(),
              status: 'active'
            }
          ],
          settings: {
            requireApprovalThreshold: 1000,
            approvalRequired: true
          }
        }
      ];

      this.groups = mockGroups;
      this.saveToStorage();
    }
  }

  async createGroup(data: CreateGroupData, createdBy: string): Promise<ExpenseGroup> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newGroup: ExpenseGroup = {
            id: `group-${Date.now()}`,
            name: data.name,
            description: data.description,
            createdBy,
            createdAt: new Date().toISOString(),
            members: [
              {
                userId: createdBy,
                role: 'admin',
                joinedAt: new Date().toISOString(),
                status: 'active'
              }
            ],
            settings: {
              requireApprovalThreshold: data.requireApprovalThreshold || 500,
              approvalRequired: data.approvalRequired ?? true
            }
          };

          this.groups.push(newGroup);
          this.logActivity({
            groupId: newGroup.id,
            userId: createdBy,
            action: 'member_added',
            target: createdBy,
            details: `Created group "${newGroup.name}"`
          });
          
          this.saveToStorage();
          resolve(newGroup);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  }

  async getGroupsByUser(userId: string): Promise<ExpenseGroup[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userGroups = this.groups.filter(group =>
          group.members.some(member => 
            member.userId === userId && member.status === 'active'
          )
        );
        resolve(userGroups);
      }, 200);
    });
  }

  async getGroupById(groupId: string): Promise<ExpenseGroup | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const group = this.groups.find(g => g.id === groupId);
        resolve(group || null);
      }, 200);
    });
  }

  async updateGroup(groupId: string, updates: Partial<ExpenseGroup>, updatedBy: string): Promise<ExpenseGroup> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check if user has permission to update
        const userMember = group.members.find(m => m.userId === updatedBy);
        if (!userMember || (userMember.role !== 'admin' && userMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        this.groups[groupIndex] = { ...group, ...updates };
        
        this.logActivity({
          groupId,
          userId: updatedBy,
          action: 'expense_updated',
          target: groupId,
          details: `Updated group settings`
        });

        this.saveToStorage();
        resolve(this.groups[groupIndex]);
      }, 500);
    });
  }

  async addMember(groupId: string, userId: string, role: 'member' | 'manager', addedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check if adding user has permission
        const adderMember = group.members.find(m => m.userId === addedBy);
        if (!adderMember || (adderMember.role !== 'admin' && adderMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        // Check if user is already a member
        const existingMember = group.members.find(m => m.userId === userId);
        if (existingMember) {
          if (existingMember.status === 'active') {
            reject(new Error('User is already a member'));
            return;
          } else {
            // Reactivate member
            existingMember.status = 'active';
            existingMember.role = role;
          }
        } else {
          // Add new member
          group.members.push({
            userId,
            role,
            joinedAt: new Date().toISOString(),
            status: 'pending'
          });
        }

        this.logActivity({
          groupId,
          userId: addedBy,
          action: 'member_added',
          target: userId,
          details: `Added member with ${role} role`
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async removeMember(groupId: string, userId: string, removedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check permissions
        const removerMember = group.members.find(m => m.userId === removedBy);
        if (!removerMember || (removerMember.role !== 'admin' && removerMember.role !== 'manager' && removedBy !== userId)) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        const memberIndex = group.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) {
          reject(new Error('Member not found'));
          return;
        }

        // Don't allow removing the last admin
        const admins = group.members.filter(m => m.role === 'admin' && m.status === 'active');
        if (admins.length === 1 && admins[0].userId === userId) {
          reject(new Error('Cannot remove the last administrator'));
          return;
        }

        group.members[memberIndex].status = 'inactive';

        this.logActivity({
          groupId,
          userId: removedBy,
          action: 'member_removed',
          target: userId,
          details: removedBy === userId ? 'Left group' : 'Removed member'
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async updateMemberRole(groupId: string, userId: string, newRole: 'member' | 'manager' | 'admin', updatedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Check permissions
        const updaterMember = group.members.find(m => m.userId === updatedBy);
        if (!updaterMember || (updaterMember.role !== 'admin' && updaterMember.role !== 'manager')) {
          reject(new Error('Insufficient permissions'));
          return;
        }

        const memberIndex = group.members.findIndex(m => m.userId === userId);
        if (memberIndex === -1) {
          reject(new Error('Member not found'));
          return;
        }

        const oldRole = group.members[memberIndex].role;
        group.members[memberIndex].role = newRole;

        this.logActivity({
          groupId,
          userId: updatedBy,
          action: 'member_added',
          target: userId,
          details: `Changed role from ${oldRole} to ${newRole}`
        });

        this.saveToStorage();
        resolve();
      }, 500);
    });
  }

  async getGroupActivity(groupId: string, limit: number = 50): Promise<ActivityLog[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const groupActivity = this.activityLogs
          .filter(log => log.groupId === groupId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
        resolve(groupActivity);
      }, 200);
    });
  }

  private logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const log: ActivityLog = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString()
    };
    
    this.activityLogs.push(log);
    
    // Keep only the last 1000 activity logs
    if (this.activityLogs.length > 1000) {
      this.activityLogs = this.activityLogs.slice(-1000);
    }
  }

  async searchGroups(query: string, userId: string): Promise<ExpenseGroup[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.groups.filter(group => {
          const isMember = group.members.some(m => m.userId === userId && m.status === 'active');
          const matchesQuery = group.name.toLowerCase().includes(query.toLowerCase()) ||
                              group.description.toLowerCase().includes(query.toLowerCase());
          return isMember && matchesQuery;
        });
        resolve(results);
      }, 300);
    });
  }

  async deleteGroup(groupId: string, deletedBy: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const groupIndex = this.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) {
          reject(new Error('Group not found'));
          return;
        }

        const group = this.groups[groupIndex];
        
        // Only the creator or admin can delete
        if (group.createdBy !== deletedBy) {
          const member = group.members.find(m => m.userId === deletedBy);
          if (!member || member.role !== 'admin') {
            reject(new Error('Insufficient permissions'));
            return;
          }
        }

        this.groups.splice(groupIndex, 1);
        
        // Remove activity logs for this group
        this.activityLogs = this.activityLogs.filter(log => log.groupId !== groupId);
        
        this.saveToStorage();
        resolve();
      }, 500);
    });
  }
}

export default GroupService; 