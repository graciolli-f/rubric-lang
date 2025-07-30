import React, { useState } from 'react';
import { useCollaborationStore } from '../stores/collaborationStore';
import { useAuthStore } from '../stores/authStore';
import { mockUsers } from '../stores/authStore';
import { 
  Users, 
  Plus, 
  Settings, 
  UserPlus, 
  Crown, 
  Eye,
  Calendar
} from 'lucide-react';

export default function Groups() {
  const { user } = useAuthStore();
  const { getUserGroups, getGroups, setCurrentGroup, currentGroup } = useCollaborationStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const userGroups = getUserGroups(user?.id || '');
  const allGroups = getGroups();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager':
        return <Settings className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getUserRole = (groupId: string) => {
    const group = userGroups.find(g => g.id === groupId);
    const member = group?.members.find(m => m.userId === user?.id);
    return member?.role || 'member';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
            <p className="text-gray-600 mt-1">
              Collaborate on expenses with your team
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </button>
        </div>
      </div>

      {/* Current Group Selection */}
      {currentGroup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Eye className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium">
              Currently viewing: {currentGroup.name}
            </span>
            <button
              onClick={() => setCurrentGroup(undefined)}
              className="ml-auto text-blue-600 hover:text-blue-800 text-sm"
            >
              View all groups
            </button>
          </div>
        </div>
      )}

      {/* Your Groups */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Groups</h2>
        </div>
        <div className="p-6">
          {userGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group) => {
                const userRole = getUserRole(group.id);
                const isActive = currentGroup?.id === group.id;
                
                return (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-indigo-300 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setCurrentGroup(group)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getRoleIcon(userRole)}
                      </div>
                    </div>
                    
                    {group.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {group.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 3).map((member) => {
                          const memberUser = mockUsers.find(u => u.id === member.userId);
                          return (
                            <div
                              key={member.userId}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                              title={memberUser?.name}
                            >
                              {memberUser?.name.charAt(0).toUpperCase()}
                            </div>
                          );
                        })}
                        {group.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                            +{group.members.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-500 capitalize flex items-center">
                        {getRoleIcon(userRole)}
                        <span className="ml-1">{userRole}</span>
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">No groups yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Create or join a group to start collaborating on expenses
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Available Groups to Join */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Groups</h2>
          <p className="text-sm text-gray-500 mt-1">
            Groups you can request to join
          </p>
        </div>
        <div className="p-6">
          {allGroups.filter(group => !userGroups.find(ug => ug.id === group.id)).length > 0 ? (
            <div className="space-y-4">
              {allGroups
                .filter(group => !userGroups.find(ug => ug.id === group.id))
                .map((group) => (
                  <div
                    key={group.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                      <button
                        className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={() => {
                          // In a real app, this would send a join request
                          alert('Join request functionality would be implemented here');
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Request to Join
                      </button>
                    </div>
                    
                    {group.description && (
                      <p className="mt-3 text-sm text-gray-600">
                        {group.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No available groups to join</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Group
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Group creation functionality would be implemented here with a form to enter group details, invite members, and set permissions.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 