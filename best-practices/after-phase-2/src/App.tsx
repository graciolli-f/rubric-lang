import React, { useState } from 'react';
import type { ViewMode } from './types';
import Navigation from './components/Navigation';
import ExpenseTracker from './pages/ExpenseTracker';
import Analytics from './pages/Analytics';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('expenses');

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* App Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Keep track of your daily expenses and stay within your budget
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center">
            <Navigation 
              currentView={currentView} 
              onViewChange={handleViewChange} 
            />
          </div>
        </div>

        {/* View Content */}
        {currentView === 'expenses' ? <ExpenseTracker /> : <Analytics />}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm pt-8">
          <p>Data is stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}

export default App;
