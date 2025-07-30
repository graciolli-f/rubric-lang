import React, { useState, useEffect } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Navigation } from './components/Navigation';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AuthPage } from './components/AuthPage';
import { useAuthStore } from './stores/auth-store';
import './index.css';

export function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<"expenses" | "analytics" | "groups">("expenses");
  const { currentUser, isAuthenticated, logout } = useAuthStore();

  // Show authentication page if not logged in
  if (!isAuthenticated || !currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
              <p className="text-gray-600 mt-2">
                Multi-user collaborative expense management
              </p>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
              </div>
              {currentUser.avatar && (
                <span className="text-2xl">{currentUser.avatar}</span>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1 rounded"
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeView === "expenses" ? (
          <div className="space-y-8">
            {/* Multi-user features indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Welcome to Multi-User Expense Tracker!</h2>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Your Role:</strong> {currentUser.role} - {currentUser.role === 'manager' ? 'Can approve expenses over $500' : 'Can create and manage expenses'}</p>
                <p><strong>New Features:</strong> Group expenses, approval workflow, real-time collaboration</p>
                <p><strong>Demo:</strong> Login as different users to see role-based features</p>
              </div>
            </div>

            {/* Add expense form */}
            <ExpenseForm />
            
            {/* Expenses list */}
            <ExpenseList />
          </div>
        ) : activeView === "groups" ? (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Expense Groups</h2>
              <p className="text-gray-600 mb-4">Manage shared expense groups and collaborate with team members.</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">Marketing Team</h3>
                  <p className="text-sm text-gray-600 mt-1">Marketing department expenses</p>
                  <div className="mt-2 text-xs text-gray-500">2 members</div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">Seattle Office</h3>
                  <p className="text-sm text-gray-600 mt-1">Seattle office shared expenses</p>
                  <div className="mt-2 text-xs text-gray-500">2 members</div>
                </div>
              </div>
              
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create New Group
              </button>
            </div>
          </div>
        ) : (
          /* Analytics view */
          <AnalyticsPage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Multi-user Expense Tracker - Built with React, TypeScript, Tailwind CSS, Zustand</p>
            <p className="mt-1">Features: Authentication, Groups, Approval Workflow, Real-time Collaboration</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
