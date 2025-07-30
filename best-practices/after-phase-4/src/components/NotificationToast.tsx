import React, { useState, useEffect } from 'react';
import { useCollaborationStore } from '../stores/collaborationStore';
import { mockUsers } from '../stores/authStore';
import { X, CheckCircle, AlertCircle, Info, DollarSign } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
}

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const update = event.detail;
      const userData = mockUsers.find(u => u.id === update.userId);
      
      if (!userData) return;

      let notification: Notification | null = null;

      switch (update.type) {
        case 'expense_created':
          notification = {
            id: Date.now().toString(),
            type: 'info',
            title: 'New Expense Added',
            message: `${userData.name} added a $${update.data.amount} expense`,
            duration: 5000,
          };
          break;
        
        case 'expense_updated':
          notification = {
            id: Date.now().toString(),
            type: 'info',
            title: 'Expense Updated',
            message: `${userData.name} updated an expense`,
            duration: 4000,
          };
          break;

        case 'approval_requested':
          notification = {
            id: Date.now().toString(),
            type: 'warning',
            title: 'Approval Required',
            message: `${userData.name} submitted an expense for approval`,
            duration: 6000,
          };
          break;

        case 'approval_completed':
          notification = {
            id: Date.now().toString(),
            type: update.data.status === 'approved' ? 'success' : 'error',
            title: `Expense ${update.data.status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `${userData.name} ${update.data.status} an expense`,
            duration: 5000,
          };
          break;

        case 'user_joined':
          notification = {
            id: Date.now().toString(),
            type: 'info',
            title: 'User Joined',
            message: `${userData.name} joined the group`,
            duration: 3000,
          };
          break;
      }

      if (notification) {
        setNotifications(prev => [...prev, notification!]);
      }
    };

    // Listen for real-time updates
    window.addEventListener('realtime-update', handleRealtimeUpdate as EventListener);

    return () => {
      window.removeEventListener('realtime-update', handleRealtimeUpdate as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full shadow-lg rounded-lg border ${getBackgroundColor(notification.type)} animate-fade-in`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => removeNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 