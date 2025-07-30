/**
 * Root application component with navigation orchestration
 * Special privileges as root component
 */

import React, { useState } from 'react';
import type { ViewMode } from './types/expense.types';
import { Navigation } from './components/Navigation';
import ExpenseTrackerContainer from './components/ExpenseTrackerContainer';
import AnalyticsContainer from './components/AnalyticsContainer';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('expenses');

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'expenses':
        return <ExpenseTrackerContainer />;
      case 'analytics':
        return <AnalyticsContainer />;
      default:
        return <ExpenseTrackerContainer />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;
