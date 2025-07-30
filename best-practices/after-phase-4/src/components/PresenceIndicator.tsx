import React from 'react';
import { useCollaborationStore } from '../stores/collaborationStore';
import { useAuthStore } from '../stores/authStore';
import { mockUsers } from '../stores/authStore';
import { Circle, Edit3 } from 'lucide-react';

export default function PresenceIndicator() {
  const { userPresence, getOnlineUsers, currentGroup } = useCollaborationStore();
  const { user } = useAuthStore();

  const onlineUsers = getOnlineUsers(currentGroup?.id);

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Online:</span>
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((presence) => {
          const userData = mockUsers.find(u => u.id === presence.userId);
          if (!userData || presence.userId === user?.id) return null;

          return (
            <div
              key={presence.userId}
              className="relative group"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
                {userData.name.charAt(0).toUpperCase()}
              </div>

              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>

              {/* Editing indicator */}
              {presence.isEditing && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <Edit3 className="w-2 h-2 text-white" />
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div>{userData.name}</div>
                <div className="text-gray-300">{userData.role}</div>
                {presence.isEditing && (
                  <div className="text-yellow-300 flex items-center">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Editing {presence.isEditing.entityType}
                  </div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          );
        })}
      </div>

      {onlineUsers.length > 5 && (
        <div className="text-sm text-gray-500">
          +{onlineUsers.length - 5} more
        </div>
      )}
    </div>
  );
} 