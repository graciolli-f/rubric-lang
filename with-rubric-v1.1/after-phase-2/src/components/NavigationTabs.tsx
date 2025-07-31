/**
 * Pure presentation component for navigation between expense list and analytics
 * Props-only, no stores or external state
 */

import React, { memo } from 'react';
import { List, BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import type { ViewMode } from '../types/expense.types';

interface NavigationTabsProps {
  activeTab: ViewMode;
  onTabChange: (tab: ViewMode) => void;
  className?: string;
}

const NavigationTabs = memo<NavigationTabsProps>(({ 
  activeTab, 
  onTabChange, 
  className 
}) => {
  const tabs = [
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
      description: 'View spending insights'
    }
  ];

  return (
    <div className={clsx("bg-white border-b border-gray-200", className)}>
      <nav className="flex space-x-8 px-6" aria-label="Navigation tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={tab.description}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
});

NavigationTabs.displayName = 'NavigationTabs';

export default NavigationTabs;