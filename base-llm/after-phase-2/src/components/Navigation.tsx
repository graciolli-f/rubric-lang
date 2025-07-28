import React from 'react';

interface NavigationProps {
  activeView: 'expenses' | 'analytics';
  onViewChange: (view: 'expenses' | 'analytics') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onViewChange('expenses')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
          activeView === 'expenses'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Expenses
      </button>
      <button
        onClick={() => onViewChange('analytics')}
        className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
          activeView === 'analytics'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Analytics
      </button>
    </div>
  );
}; 