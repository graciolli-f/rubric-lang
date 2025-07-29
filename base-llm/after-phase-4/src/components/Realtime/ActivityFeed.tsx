import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import AuthService from '../../services/authService';
import type { ActivityLog } from '../../types';

interface ActivityFeedProps {
  className?: string;
  groupId?: string;
  limit?: number;
  showHeader?: boolean;
}

export default function ActivityFeed({ 
  className = '', 
  groupId, 
  limit = 50, 
  showHeader = true 
}: ActivityFeedProps) {
  const { 
    currentUser, 
    getActivityFeed,
    selectedGroupId,
    currentView
  } = useCollaborativeExpenseStore();

  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
  const authService = AuthService.getInstance();

  // Determine which activities to show
  const targetGroupId = groupId || selectedGroupId;
  const activities = getActivityFeed(targetGroupId || undefined).slice(0, limit);

  // Load user names for activities
  useEffect(() => {
    const loadUserNames = async () => {
      const uniqueUserIds = [...new Set(activities.map(activity => activity.userId))];
      const nameMap = new Map<string, string>();
      
      for (const userId of uniqueUserIds) {
        if (!userNames.has(userId)) {
          try {
            const user = await authService.getUserById(userId);
            nameMap.set(userId, user?.name || 'Unknown User');
          } catch {
            nameMap.set(userId, 'Unknown User');
          }
        }
      }
      
      setUserNames(prev => new Map([...prev, ...nameMap]));
    };

    if (activities.length > 0) {
      loadUserNames();
    }
  }, [activities, userNames, authService]);

  const getActivityIcon = (action: string): React.ReactNode => {
    switch (action) {
      case 'expense_created':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'expense_updated':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'expense_deleted':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'expense_approved':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'expense_rejected':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'member_added':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case 'member_removed':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'expense_created':
      case 'expense_approved':
      case 'member_added':
        return 'text-green-600';
      case 'expense_updated':
        return 'text-blue-600';
      case 'expense_deleted':
      case 'expense_rejected':
        return 'text-red-600';
      case 'member_removed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const ActivityItem = ({ activity }: { activity: ActivityLog }) => {
    const userName = userNames.get(activity.userId) || 'Loading...';
    const isCurrentUser = currentUser?.id === activity.userId;

    return (
      <div className="flex space-x-3 py-3">
        {getActivityIcon(activity.action)}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className={`font-medium ${isCurrentUser ? 'text-indigo-600' : 'text-gray-900'}`}>
              {isCurrentUser ? 'You' : userName}
            </span>
            <span className={`ml-1 ${getActionColor(activity.action)}`}>
              {activity.details}
            </span>
          </p>
          <p className="text-xs text-gray-500">
            {getRelativeTime(activity.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Recent Activity
            </h3>
            {activities.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>
            )}
          </div>
          {targetGroupId && (
            <p className="text-xs text-gray-500 mt-1">
              {currentView === 'group' ? 'Group activity' : 'All activity'}
            </p>
          )}
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Activity will appear here as team members interact with expenses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map(activity => (
              <div key={activity.id} className="px-4">
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length >= limit && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing latest {limit} activities
          </p>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function CompactActivityFeed({ className = '', maxItems = 5 }: { className?: string; maxItems?: number }) {
  const { getActivityFeed, selectedGroupId } = useCollaborativeExpenseStore();
  const activities = getActivityFeed(selectedGroupId || undefined).slice(0, maxItems);

  if (activities.length === 0) {
    return null;
  }

  const getRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
          <span className="text-gray-600 truncate">{activity.details}</span>
          <span className="text-gray-400 flex-shrink-0">{getRelativeTime(activity.timestamp)}</span>
        </div>
      ))}
    </div>
  );
} 