/**
 * Pure presentation component for main navigation
 * Props-only, delegates navigation actions to parent
 */

import React from 'react';
import { List, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import type { ViewMode } from '../types/expense.types';

interface NavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function Navigation({ currentView, onViewChange, className }: NavigationProps) {
  const navigationItems = [
    {
      id: 'expenses' as ViewMode,
      label: 'Expenses',
      icon: List,
      description: 'Manage your expenses'
    },
    {
      id: 'analytics' as ViewMode,
      label: 'Analytics',
      icon: BarChart3,
      description: 'View insights and reports'
    }
  ];

  return (
    <nav className={clsx("bg-white shadow-sm border-b", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Expense Tracker
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={clsx(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  aria-label={item.description}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}