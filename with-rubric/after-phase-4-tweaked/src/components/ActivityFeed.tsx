import React from 'react';
import { useGroupStore } from '../stores/group-store';
import type { ActivityEntry } from '../types/group-types';

export function ActivityFeed(): React.JSX.Element {
  const { activityFeed, activeGroup } = useGroupStore();

  const getActivityIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'expense_created':
        return '➕';
      case 'expense_updated':
        return '✏️';
      case 'expense_deleted':
        return '🗑️';
      case 'expense_approved':
        return '✅';
      case 'expense_rejected':
        return '❌';
      case 'member_joined':
        return '👋';
      case 'member_left':
        return '👋';
      case 'group_created':
        return '🏗️';
      case 'group_updated':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getActivityText = (activity: ActivityEntry) => {
    const { type, userName, details } = activity;
    
    switch (type) {
      case 'expense_created':
        return `${userName} added a new expense`;
      case 'expense_updated':
        return `${userName} updated an expense`;
      case 'expense_deleted':
        return `${userName} deleted an expense`;
      case 'expense_approved':
        return `${userName} approved an expense`;
      case 'expense_rejected':
        return `${userName} rejected an expense`;
      case 'member_joined':
        return `${userName} joined the group`;
      case 'member_left':
        return `${userName} left the group`;
      case 'group_created':
        return `${userName} created the group`;
      case 'group_updated':
        return `${userName} updated group settings`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getActivityDetails = (activity: ActivityEntry) => {
    const { type, details } = activity;
    
    if (type.startsWith('expense_') && details.expenseAmount && details.expenseDescription) {
      return `$${details.expenseAmount.toFixed(2)} - ${details.expenseDescription}`;
    }
    
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredActivity = activeGroup 
    ? activityFeed.filter(activity => activity.groupId === activeGroup.id)
    : activityFeed.filter(activity => !activity.groupId);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h4>
      
      {filteredActivity.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📝</div>
          <p className="text-gray-500">No activity yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {activeGroup ? 'Group activity will appear here' : 'Your activity will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivity.slice(0, 10).map((activity) => (
            <div 
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {getActivityText(activity)}
                </div>
                
                {getActivityDetails(activity) && (
                  <div className="text-sm text-gray-500 mt-1">
                    {getActivityDetails(activity)}
                  </div>
                )}
                
                <div className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {filteredActivity.length > 10 && (
            <div className="text-center pt-3 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-500">
                View all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 