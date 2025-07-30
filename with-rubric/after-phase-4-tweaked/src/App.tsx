import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Navigation } from './components/Navigation';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AuthPage } from './components/AuthPage';
import { GroupSelector } from './components/GroupSelector';
import { useAuthStore } from './stores/auth-store';
import { useGroupStore } from './stores/group-store';
import './index.css';

export function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<"expenses" | "analytics">("expenses");
  const { user, isAuthenticated, initialize: initializeAuth } = useAuthStore();
  const { initialize: initializeGroups } = useGroupStore();

  useEffect(() => {
    // Initialize authentication on app start
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Initialize groups when user is authenticated
    if (user) {
      initializeGroups(user);
    }
  }, [user, initializeGroups]);

  // Show authentication page if user is not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Signed in as</div>
                <div className="font-medium text-gray-900">{user?.email}</div>
              </div>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <GroupSelector />
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            {activeView === "expenses" ? (
              <div className="space-y-8">
                {/* Add expense form */}
                <ExpenseForm />
                
                {/* Expenses list */}
                <ExpenseList />
              </div>
            ) : (
              /* Analytics view */
              <AnalyticsPage />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, Tailwind CSS, Zustand, and Recharts</p>
            <p className="mt-1">Following Rubric architectural standards</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
