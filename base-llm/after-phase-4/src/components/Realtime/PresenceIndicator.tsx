import React from 'react';
import { useCollaborativeExpenseStore } from '../../store/collaborativeExpenseStore';
import type { PresenceInfo } from '../../types';

interface PresenceIndicatorProps {
  className?: string;
  maxVisible?: number;
}

export default function PresenceIndicator({ className = '', maxVisible = 5 }: PresenceIndicatorProps) {
  const { currentUser, presenceInfo, selectedGroupId, currentView } = useCollaborativeExpenseStore();

  if (!currentUser) {
    return null;
  }

  // Filter presence to only show users in the same context
  const relevantPresence = presenceInfo.filter(presence => {
    // Don't show yourself
    if (presence.userId === currentUser.id) return false;
    
    // Only show users who are online
    if (!presence.isOnline) return false;
    
    // If we're in a group, show users in the same group
    if (currentView === 'group' && selectedGroupId) {
      return presence.currentView === `group-${selectedGroupId}`;
    }
    
    // If we're in personal view, show users also in personal view
    if (currentView === 'personal') {
      return presence.currentView === 'personal';
    }
    
    return false;
  });

  const visiblePresence = relevantPresence.slice(0, maxVisible);
  const overflowCount = Math.max(0, relevantPresence.length - maxVisible);

  if (relevantPresence.length === 0) {
    return null;
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    
    // Generate consistent color based on user ID
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getActivityStatus = (presence: PresenceInfo): string => {
    if (!presence.currentView) return 'online';
    
    if (presence.currentView === 'personal') {
      return 'viewing personal expenses';
    }
    
    if (presence.currentView === 'analytics') {
      return 'viewing analytics';
    }
    
    if (presence.currentView.startsWith('group-')) {
      return 'viewing group expenses';
    }
    
    if (presence.currentView.startsWith('expense-')) {
      return 'editing an expense';
    }
    
    return 'online';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="3" />
        </svg>
        <span className="text-sm text-gray-600 mr-3">
          {relevantPresence.length === 1 ? '1 person' : `${relevantPresence.length} people`} online
        </span>
      </div>

      <div className="flex -space-x-2">
        {visiblePresence.map((presence, index) => (
          <div
            key={presence.userId}
            className="relative group"
            style={{ zIndex: maxVisible - index }}
          >
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white
              ${getAvatarColor(presence.userId)}
            `}>
              {getUserInitials(presence.userName)}
            </div>

            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="font-medium">{presence.userName}</div>
              <div className="text-gray-300 text-xs">{getActivityStatus(presence)}</div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-500">Live</span>
      </div>
    </div>
  );
}

// Enhanced version with detailed activity
export function DetailedPresenceList({ className = '' }: { className?: string }) {
  const { currentUser, presenceInfo, selectedGroupId, currentView } = useCollaborativeExpenseStore();

  if (!currentUser) {
    return null;
  }

  const relevantPresence = presenceInfo.filter(presence => {
    if (presence.userId === currentUser.id) return false;
    if (!presence.isOnline) return false;
    
    if (currentView === 'group' && selectedGroupId) {
      return presence.currentView === `group-${selectedGroupId}`;
    }
    
    if (currentView === 'personal') {
      return presence.currentView === 'personal';
    }
    
    return false;
  });

  if (relevantPresence.length === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-500">You're the only one here</p>
      </div>
    );
  }

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const getActivityStatus = (presence: PresenceInfo): string => {
    if (!presence.currentView) return 'Online';
    
    if (presence.currentView === 'personal') {
      return 'Viewing personal expenses';
    }
    
    if (presence.currentView === 'analytics') {
      return 'Viewing analytics';
    }
    
    if (presence.currentView.startsWith('group-')) {
      return 'Viewing group expenses';
    }
    
    if (presence.currentView.startsWith('expense-')) {
      return 'Editing an expense';
    }
    
    return 'Online';
  };

  const getLastSeenText = (lastSeen: string): string => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Active Users ({relevantPresence.length})
        </h3>
      </div>
      
      <div className="p-4 space-y-3">
        {relevantPresence.map(presence => (
          <div key={presence.userId} className="flex items-center space-x-3">
            <div className="relative">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white
                ${getAvatarColor(presence.userId)}
              `}>
                {getUserInitials(presence.userName)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {presence.userName}
              </div>
              <div className="text-xs text-gray-500">
                {getActivityStatus(presence)}
              </div>
              <div className="text-xs text-gray-400">
                Active {getLastSeenText(presence.lastSeen)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 