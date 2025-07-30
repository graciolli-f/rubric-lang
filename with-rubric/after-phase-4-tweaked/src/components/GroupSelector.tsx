import React from 'react';
import { useGroupStore } from '../stores/group-store';
import { useAuthStore } from '../stores/auth-store';
import { useGroupOperations } from '../hooks/useGroupOperations';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import type { ExpenseGroup } from '../types/group-types';

export function GroupSelector(): React.JSX.Element {
  const { user } = useAuthStore();
  const { groups, activeGroup, setActiveGroup, error } = useGroupStore();
  const {
    showCreateModal,
    setShowCreateModal,
    showJoinModal,
    setShowJoinModal,
    newGroupName,
    setNewGroupName,
    newGroupDescription,
    setNewGroupDescription,
    joinGroupId,
    setJoinGroupId,
    handleCreateGroup,
    handleJoinGroup,
    isLoading
  } = useGroupOperations();

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expense Groups</h2>
        <p className="text-gray-500">Please log in to access groups.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Expense Groups</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              disabled={isLoading}
            >
              Create Group
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              Join Group
            </button>
          </div>
        </div>

        {/* Personal Expenses Option */}
        <div className="mb-4">
          <button
            onClick={() => setActiveGroup(null)}
            className={`w-full text-left p-3 rounded-md border transition-colors ${
              !activeGroup
                ? 'border-blue-200 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-semibold">P</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Personal Expenses</div>
                <div className="text-sm text-gray-500">Your individual expenses</div>
              </div>
            </div>
          </button>
        </div>

        {/* Group List */}
        {groups.map((group: ExpenseGroup) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`w-full text-left p-3 rounded-md border transition-colors mb-2 ${
              activeGroup?.id === group.id
                ? 'border-green-200 bg-green-50 text-green-900'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm font-semibold">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{group.name}</div>
                <div className="text-sm text-gray-500">{group.description}</div>
              </div>
            </div>
          </button>
        ))}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupDescription={newGroupDescription}
        setNewGroupDescription={setNewGroupDescription}
        isLoading={isLoading}
      />

      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinGroup}
        joinGroupId={joinGroupId}
        setJoinGroupId={setJoinGroupId}
        isLoading={isLoading}
      />
    </div>
  );
} 