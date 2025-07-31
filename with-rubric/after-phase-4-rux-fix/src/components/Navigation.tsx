import React from 'react';
import { useAuthStore } from '../stores/auth-store';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  activeView: "expenses" | "analytics" | "groups";
  onViewChange: (view: "expenses" | "analytics" | "groups") => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps): React.JSX.Element {
  const { user } = useAuthStore();
  const { handleLogout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            <button
              onClick={() => onViewChange("expenses")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === "expenses"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => onViewChange("groups")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === "groups"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === "analytics"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analytics
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.role === 'manager' || user?.role === 'admin' ? (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Can Approve Expenses
              </span>
            ) : null}
                         <button
               onClick={() => handleLogout().catch(() => {})}
               className="text-gray-500 hover:text-gray-700 text-sm font-medium py-2 px-3 rounded border border-gray-300 hover:border-gray-400 transition-colors"
             >
               Sign Out
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 