import React from 'react';
import { useGroupStore } from '../stores/group-store';
import type { PresenceInfo } from '../types/group-types';

export function PresenceIndicators(): React.JSX.Element {
  const { presenceInfo, activeGroup } = useGroupStore();

  if (!activeGroup || presenceInfo.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No one else is currently viewing this group
      </div>
    );
  }

  const getStatusIcon = (status: PresenceInfo['status']) => {
    switch (status) {
      case 'viewing':
        return '👀';
      case 'editing':
        return '✏️';
      case 'away':
        return '💤';
      default:
        return '👤';
    }
  };

  const getStatusColor = (status: PresenceInfo['status']) => {
    switch (status) {
      case 'viewing':
        return 'bg-green-100 text-green-800';
      case 'editing':
        return 'bg-blue-100 text-blue-800';
      case 'away':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: PresenceInfo['status']) => {
    switch (status) {
      case 'viewing':
        return 'Viewing';
      case 'editing':
        return 'Editing';
      case 'away':
        return 'Away';
      default:
        return 'Online';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Who's here ({presenceInfo.length})
      </h4>
      
      <div className="space-y-2">
        {presenceInfo.map((person) => (
          <div 
            key={person.userId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              {person.avatar ? (
                <img
                  src={person.avatar}
                  alt={person.userName}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs text-gray-600">
                    {person.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {person.userName}
                </div>
                {person.editingExpenseId && (
                  <div className="text-xs text-gray-500">
                    Editing expense
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="mr-1">{getStatusIcon(person.status)}</span>
              <span 
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(person.status)}`}
              >
                {getStatusText(person.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Live collaboration active
        </div>
      </div>
    </div>
  );
} 