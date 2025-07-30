import React, { useState } from 'react';
import { useCollaborationStore } from '../stores/collaborationStore';
import { useAuthStore } from '../stores/authStore';
import { mockUsers } from '../stores/authStore';
import { 
  Activity as ActivityIcon, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Users, 
  UserPlus,
  Filter,
  Clock
} from 'lucide-react';

export default function Activity() {
  const { user } = useAuthStore();
  const { activityFeed, getUserGroups, currentGroup } = useCollaborationStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const userGroups = getUserGroups(user?.id || '');

  // Filter activities based on selection
  const filteredActivities = activityFeed.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'my') return activity.userId === user?.id;
    if (selectedFilter === 'group') return activity.groupId === currentGroup?.id;
    return activity.type === selectedFilter;
  });

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'expense':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'approval':
        return action === 'approved' 
          ? <CheckCircle className="w-5 h-5 text-green-500" />
          : <XCircle className="w-5 h-5 text-red-500" />;
      case 'group':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'user':
        return <UserPlus className="w-5 h-5 text-indigo-500" />;
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: any) => {
    const actorUser = mockUsers.find(u => u.id === activity.userId);
    const actorName = actorUser?.name || 'Someone';

    switch (activity.type) {
      case 'expense':
        if (activity.action === 'created') {
          return `${actorName} added a new expense: $${activity.details.amount} for ${activity.details.description}`;
        }
        if (activity.action === 'updated') {
          return `${actorName} updated an expense`;
        }
        if (activity.action === 'deleted') {
          return `${actorName} deleted an expense`;
        }
        break;
      case 'approval':
        if (activity.action === 'approved') {
          return `${actorName} approved an expense${activity.details.comment ? ': ' + activity.details.comment : ''}`;
        }
        if (activity.action === 'rejected') {
          return `${actorName} rejected an expense${activity.details.comment ? ': ' + activity.details.comment : ''}`;
        }
        break;
      case 'group':
        if (activity.action === 'joined') {
          return `${actorName} joined the group`;
        }
        if (activity.action === 'left') {
          return `${actorName} left the group`;
        }
        break;
      case 'user':
        if (activity.action === 'invited') {
          return `${actorName} invited a new member`;
        }
        break;
    }
    return `${actorName} performed an action`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filters = [
    { key: 'all', label: 'All Activity', icon: ActivityIcon },
    { key: 'my', label: 'My Activity', icon: UserPlus },
    { key: 'expense', label: 'Expenses', icon: CreditCard },
    { key: 'approval', label: 'Approvals', icon: CheckCircle },
    { key: 'group', label: 'Groups', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-gray-600 mt-1">
              Stay updated with recent changes across your groups
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <ActivityIcon className="w-8 h-8 text-indigo-600" />
            {activityFeed.length > 0 && (
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
                {activityFeed.length} updates
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow">
        {filteredActivities.length > 0 ? (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {filteredActivities.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== filteredActivities.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 ring-8 ring-white">
                          {getActivityIcon(activity.type, activity.action)}
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">
                              {getActivityMessage(activity)}
                            </p>
                            {activity.groupId && (
                              <p className="mt-1 text-xs text-gray-500">
                                in {userGroups.find(g => g.id === activity.groupId)?.name || 'Unknown Group'}
                              </p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(activity.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-sm text-gray-500">
              {selectedFilter === 'all'
                ? 'Start collaborating with your team to see activity here'
                : `No ${selectedFilter} activity to show`}
            </p>
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Updates in real-time
        </p>
      </div>
    </div>
  );
} 