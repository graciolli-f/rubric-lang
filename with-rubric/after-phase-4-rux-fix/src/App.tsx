import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Navigation } from './components/Navigation';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AuthLayout } from './components/AuthLayout';
import { useAuthStore } from './stores/auth-store';
import './index.css';

export function App(): React.JSX.Element {
  const { isAuthenticated, isLoading, user, checkAuthStatus } = useAuthStore();
  const [activeView, setActiveView] = useState<"expenses" | "analytics" | "groups">("expenses");

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication layout if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthLayout />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
              <p className="text-gray-600 mt-1">
                Collaborative expense management for teams
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeView === "expenses" ? (
          <div className="space-y-8">
            {/* Add expense form */}
            <ExpenseForm />
            
            {/* Expenses list */}
            <ExpenseList />
          </div>
        ) : activeView === "analytics" ? (
          /* Analytics view */
          <AnalyticsPage />
        ) : (
          /* Groups view - placeholder for now */
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Groups</h2>
            <p className="text-gray-600">Group management coming soon...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built with React, TypeScript, Tailwind CSS, Zustand, and WebSockets</p>
            <p className="mt-1">Multi-user collaborative expense tracking</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
