import React, { useState, useEffect } from 'react';
import { useCollaborativeExpenseStore } from './store/collaborativeExpenseStore';
import AuthWrapper from './components/Auth/AuthWrapper';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Analytics } from './components/Analytics';
import GroupSelector from './components/Groups/GroupSelector';
import ApprovalQueue from './components/Approvals/ApprovalQueue';
import PresenceIndicator from './components/Realtime/PresenceIndicator';
import ActivityFeed, { CompactActivityFeed } from './components/Realtime/ActivityFeed';

function App() {
  const [activeView, setActiveView] = useState<'expenses' | 'analytics' | 'approvals'>('expenses');
  const { 
    currentUser, 
    currentView, 
    selectedGroupId, 
    isConnected,
    updateExchangeRates,
    logout,
    updatePresence
  } = useCollaborativeExpenseStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Update exchange rates on app start and then every hour
      try {
        await updateExchangeRates();
      } catch (error) {
        console.warn('Failed to update exchange rates:', error);
      }
    };

    if (currentUser) {
      initializeApp();
    }
  }, [currentUser, updateExchangeRates]);

  // Update presence when view changes
  useEffect(() => {
    if (currentUser) {
      updatePresence(activeView);
    }
  }, [activeView, currentUser, updatePresence]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const AppHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Collaborative Expense Tracker
              </h1>
              <p className="text-sm text-gray-600">
                {currentView === 'personal' 
                  ? 'Personal expenses' 
                  : selectedGroupId 
                    ? 'Group expenses'
                    : 'Multi-user expense management'
                }
              </p>
            </div>
            {isConnected && <PresenceIndicator />}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* User Menu */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex space-x-8 -mb-px">
          <button
            onClick={() => setActiveView('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'expenses'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'analytics'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setActiveView('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === 'approvals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approvals
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const MainContent = () => {
    switch (activeView) {
      case 'expenses':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <ActivityFeed className="mb-6" limit={10} />
            </div>
            <div className="lg:col-span-3">
              <ExpenseForm />
              <ExpenseList />
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Analytics />
            </div>
            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <CompactActivityFeed className="mb-6" />
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ApprovalQueue />
            </div>
            <div className="lg:col-span-1">
              <div className="mb-6">
                <GroupSelector />
              </div>
              <ActivityFeed className="mb-6" limit={15} />
            </div>
          </div>
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <MainContent />
        </main>
      </div>
    </AuthWrapper>
  );
}

export default App;
