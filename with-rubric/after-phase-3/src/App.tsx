import React, { useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { Navigation } from './components/Navigation';
import { AnalyticsPage } from './components/AnalyticsPage';
import './index.css';

export function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState<"expenses" | "analytics">("expenses");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
            <p className="text-gray-600 mt-2">
              Track your daily expenses and stay within your budget
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeView={activeView} onViewChange={setActiveView} />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
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
