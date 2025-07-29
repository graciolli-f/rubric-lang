import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import GroupService from '../../services/groupService';
import type { ExpenseGroup } from '../../types';

interface GroupSelectorProps {
  onGroupChange?: (groupId: string | null) => void;
}

export default function GroupSelector({ onGroupChange }: GroupSelectorProps) {
  const {
    currentUser,
    userGroups,
    selectedGroupId,
    currentView,
    selectGroup,
    switchToPersonalView,
    switchToGroupView,
    createGroup
  } = useCollaborativeExpenseStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGroupSelect = async (groupId: string | null) => {
    try {
      if (groupId) {
        await switchToGroupView(groupId);
      } else {
        switchToPersonalView();
      }
      onGroupChange?.(groupId);
    } catch (error) {
      console.error('Failed to switch group:', error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setError('Group name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createGroup(newGroupName.trim(), newGroupDescription.trim());
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Expense Groups</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="mr-1">+</span>
          New Group
        </button>
      </div>

      {/* Personal View Option */}
      <div className="space-y-2">
        <button
          onClick={() => handleGroupSelect(null)}
          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
            currentView === 'personal'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'hover:bg-gray-50 text-gray-700'
          }`}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="font-medium">Personal Expenses</div>
              <div className="text-xs text-gray-500">Your individual expenses</div>
            </div>
          </div>
        </button>

        {/* Group Options */}
        {userGroups.map(group => (
          <button
            key={group.id}
            onClick={() => handleGroupSelect(group.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedGroupId === group.id
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium">{group.name}</div>
                <div className="text-xs text-gray-500">{group.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {group.members.filter(m => m.status === 'active').length} members
                </div>
              </div>
              {group.createdBy === currentUser.id && (
                <div className="ml-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Owner
                  </span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Marketing Team"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Marketing department expenses"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setError('');
                }}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 